/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { NewsSection } from './components/NewsSection';
import { LearningMaterials } from './components/LearningMaterials';
import { CBTSection } from './components/CBTSection';
import { CBTExamModal } from './components/CBTExamModal';
import { StudentManagement } from './components/StudentManagement';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { AuthModal } from './components/AuthModal';
import {
  AppDatabase,
  User,
  NewsItem,
  LearningMaterial,
  CBTExam,
  CBTAttempt,
  CBTQuestion,
  GitHubSyncConfig
} from './types';
import { loadDatabase, saveDatabase } from './services/storageService';
import { Database, GitBranch, Shield, GraduationCap, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [database, setDatabase] = useState<AppDatabase>(() => loadDatabase());
  const [currentUser, setCurrentUser] = useState<User>(() => {
    // Default to admin so user immediately sees all administrative tools
    return database.users.find((u) => u.role === 'admin') || database.users[0];
  });

  const [activeTab, setActiveTab] = useState<TabType>('news');
  const [activeCBTExam, setActiveCBTExam] = useState<CBTExam | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    saveDatabase(database);
  }, [database]);

  // Quick Role Switcher
  const handleSwitchQuickRole = (targetRole: 'admin' | 'student') => {
    const user = database.users.find((u) => u.role === targetRole);
    if (user) {
      setCurrentUser(user);
    }
  };

  // Switch to specific student
  const handleSwitchToStudent = (student: User) => {
    setCurrentUser(student);
    setActiveTab('cbt');
  };

  // ---------------- News Actions ----------------
  const handleAddNews = (newItem: Omit<NewsItem, 'id'>) => {
    const item: NewsItem = {
      ...newItem,
      id: `news_${Date.now()}`,
    };
    setDatabase((prev) => ({
      ...prev,
      news: [item, ...prev.news],
    }));
  };

  const handleEditNews = (updatedItem: NewsItem) => {
    setDatabase((prev) => ({
      ...prev,
      news: prev.news.map((n) => (n.id === updatedItem.id ? updatedItem : n)),
    }));
  };

  const handleDeleteNews = (id: string) => {
    setDatabase((prev) => ({
      ...prev,
      news: prev.news.filter((n) => n.id !== id),
    }));
  };

  // ---------------- Materials Actions ----------------
  const handleAddMaterial = (newMat: Omit<LearningMaterial, 'id'>) => {
    const material: LearningMaterial = {
      ...newMat,
      id: `mat_${Date.now()}`,
    };
    setDatabase((prev) => ({
      ...prev,
      materials: [material, ...prev.materials],
    }));
  };

  const handleEditMaterial = (updatedMat: LearningMaterial) => {
    setDatabase((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => (m.id === updatedMat.id ? updatedMat : m)),
    }));
  };

  const handleDeleteMaterial = (id: string) => {
    setDatabase((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  };

  // ---------------- CBT Exam Actions ----------------
  const handleAddExam = (newExam: Omit<CBTExam, 'id'>) => {
    const exam: CBTExam = {
      ...newExam,
      id: `exam_${Date.now()}`,
    };
    setDatabase((prev) => ({
      ...prev,
      exams: [exam, ...prev.exams],
    }));
  };

  const handleEditExam = (updatedExam: CBTExam) => {
    setDatabase((prev) => ({
      ...prev,
      exams: prev.exams.map((e) => (e.id === updatedExam.id ? updatedExam : e)),
    }));
  };

  const handleDeleteExam = (id: string) => {
    setDatabase((prev) => ({
      ...prev,
      exams: prev.exams.filter((e) => e.id !== id),
    }));
  };

  const handleUpdateQuestions = (examId: string, questions: CBTQuestion[]) => {
    setDatabase((prev) => ({
      ...prev,
      exams: prev.exams.map((e) =>
        e.id === examId
          ? {
              ...e,
              questions,
              totalQuestions: questions.length,
            }
          : e
      ),
    }));
  };

  const handleCompleteExamAttempt = (attempt: CBTAttempt) => {
    setDatabase((prev) => ({
      ...prev,
      attempts: [attempt, ...prev.attempts],
    }));
  };

  // ---------------- Student Actions ----------------
  const handleAddStudent = (newStudent: Omit<User, 'id' | 'role' | 'createdAt'>) => {
    const studentUser: User = {
      ...newStudent,
      id: `usr_${Date.now()}`,
      role: 'student',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDatabase((prev) => ({
      ...prev,
      users: [...prev.users, studentUser],
    }));
  };

  const handleEditStudent = (updatedStudent: User) => {
    setDatabase((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === updatedStudent.id ? updatedStudent : u)),
    }));
  };

  const handleDeleteStudent = (id: string) => {
    setDatabase((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));
  };

  const handleUpdateGitHubConfig = (config: GitHubSyncConfig) => {
    setDatabase((prev) => ({
      ...prev,
      gitHubConfig: config,
    }));
  };

  const pendingTasksCount = database.exams.filter(
    (e) => e.isActive && !database.attempts.some((a) => a.examId === e.id && a.studentId === currentUser.id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          handleSwitchQuickRole(currentUser.role === 'admin' ? 'student' : 'admin');
        }}
        onOpenGitHubSync={() => setIsGitHubModalOpen(true)}
        isGitHubConnected={Boolean(database.gitHubConfig?.token && database.gitHubConfig?.owner)}
        onSwitchQuickRole={handleSwitchQuickRole}
      />

      {/* Main Layout: Sidebar on Left + Dynamic Content on Center */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={currentUser.role}
          pendingTasksCount={pendingTasksCount}
          totalMaterialsCount={database.materials.length}
          totalStudentsCount={database.users.filter((u) => u.role === 'student').length}
        />

        {/* Center / Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'news' && (
            <NewsSection
              news={database.news}
              userRole={currentUser.role}
              onAddNews={handleAddNews}
              onEditNews={handleEditNews}
              onDeleteNews={handleDeleteNews}
            />
          )}

          {activeTab === 'materials' && (
            <LearningMaterials
              materials={database.materials}
              userRole={currentUser.role}
              onAddMaterial={handleAddMaterial}
              onEditMaterial={handleEditMaterial}
              onDeleteMaterial={handleDeleteMaterial}
            />
          )}

          {activeTab === 'cbt' && (
            <CBTSection
              exams={database.exams}
              attempts={database.attempts}
              currentUser={currentUser}
              onStartExam={(exam) => setActiveCBTExam(exam)}
              onAddExam={handleAddExam}
              onEditExam={handleEditExam}
              onDeleteExam={handleDeleteExam}
              onUpdateQuestions={handleUpdateQuestions}
            />
          )}

          {activeTab === 'students' && currentUser.role === 'admin' && (
            <StudentManagement
              users={database.users}
              attempts={database.attempts}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onSwitchToStudent={handleSwitchToStudent}
            />
          )}

          {activeTab === 'github_db' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    Database & GitHub Sync Aliemath
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Platform ini dirancang 100% kompatibel dengan Vercel SPA dan GitHub sebagai tempat penyimpanan data (Database JSON).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-blue-600" />
                    Status Penyimpanan Saat Ini
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Semua penambahan materi, bank soal CBT, akun siswa, dan berita tersimpan secara persisten di peramban Anda (LocalStorage) serta siap diekspor ke file JSON repositori GitHub.
                  </p>
                  <div className="text-xs font-mono bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                    <div>• Total Materi: <strong>{database.materials.length} Bab</strong></div>
                    <div>• Total Paket CBT: <strong>{database.exams.length} Paket</strong></div>
                    <div>• Total Akun Siswa: <strong>{database.users.filter((u) => u.role === 'student').length} Siswa</strong></div>
                    <div>• Total Rekap Nilai: <strong>{database.attempts.length} Percobaan</strong></div>
                  </div>
                  <button
                    onClick={() => setIsGitHubModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    Buka Pengaturan Sinkronisasi GitHub & Backup
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Kompatibilitas Vercel (Aliemath.my.id)
                  </h3>
                  <p className="text-xs text-emerald-950/80 leading-relaxed">
                    Aplikasi ini telah menyertakan berkas <code>vercel.json</code> untuk penanganan Single Page Application (SPA), sehingga saat Anda menghubungkan domain <strong>Aliemath.my.id</strong> di Vercel, semua rute dan modul akan berjalan cepat tanpa memerlukan server backend tambahan.
                  </p>
                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-mono">
                    Output: dist/ • SPA Rewrite: true • Zero-Config
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CBT Fullscreen Exam Runner Modal */}
      {activeCBTExam && (
        <CBTExamModal
          exam={activeCBTExam}
          student={currentUser}
          onCompleteExam={handleCompleteExamAttempt}
          onClose={() => setActiveCBTExam(null)}
        />
      )}

      {/* GitHub & Vercel Database Modal */}
      <GitHubSyncModal
        database={database}
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onUpdateDatabase={(newDb) => setDatabase(newDb)}
        onUpdateConfig={handleUpdateGitHubConfig}
      />

      {/* Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={database.users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
}
