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
import { AdminManagement } from './components/AdminManagement';
import { AuthModal } from './components/AuthModal';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import {
  AppDatabase,
  User,
  NewsItem,
  LearningMaterial,
  CBTExam,
  CBTAttempt,
  CBTQuestion,
  CBTSessionLock
} from './types';
import { loadDatabase, saveDatabase, syncDatabaseToServer, fetchServerDatabase } from './services/storageService';
import { Shield, GraduationCap, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [database, setDatabase] = useState<AppDatabase>(() => loadDatabase());

  const [adminUser, setAdminUser] = useState<User | null>(() => {
    try {
      const savedId = localStorage.getItem('aliemath_admin_id');
      if (savedId) {
        const found = database.users.find(
          (u) => u.id === savedId && u.role === 'admin' && u.status === 'active'
        );
        if (found) return found;
      }
    } catch {
      // Ignored
    }
    return null;
  });

  const [cbtStudent, setCbtStudent] = useState<User | null>(() => {
    try {
      const savedStudentId = sessionStorage.getItem('aliemath_cbt_student_id');
      if (savedStudentId) {
        const found = database.users.find(
          (u) => u.id === savedStudentId && u.role === 'student' && u.status === 'active'
        );
        if (found) return found;
      }
    } catch {
      // Ignored
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<TabType>('news');
  const [activeCBTExam, setActiveCBTExam] = useState<CBTExam | null>(null);
  const [activeCBTStudent, setActiveCBTStudent] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Pull the central database from server on initial load, tab visibility change, and periodic 10s intervals
  useEffect(() => {
    let isMounted = true;

    const pullFromServer = async () => {
      try {
        const res = await fetchServerDatabase();
        if (res.success && res.data && isMounted) {
          setDatabase(res.data);
          if (res.updatedAt) {
            setLastSyncTime(new Date(res.updatedAt).toLocaleTimeString('id-ID'));
          }
        }
      } catch (err) {
        console.warn('[Sync] Background sync fetch error:', err);
      }
    };

    pullFromServer();

    const onFocus = () => pullFromServer();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') pullFromServer();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const intervalId = setInterval(pullFromServer, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  // 2. Persist state changes to local storage AND upload to the central server so mobile devices update immediately
  useEffect(() => {
    saveDatabase(database);
    setIsSyncing(true);
    syncDatabaseToServer(database)
      .then((res) => {
        if (res.success && res.updatedAt) {
          setLastSyncTime(new Date(res.updatedAt).toLocaleTimeString('id-ID'));
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsSyncing(false);
      });
  }, [database]);

  // Derived current active user
  const currentUser: User = adminUser || cbtStudent || {
    id: 'guest',
    username: 'tamu',
    fullName: 'Pengunjung',
    role: 'student',
    status: 'active',
    createdAt: '2026-01-01',
  };

  const handleAdminLogin = (user: User) => {
    setAdminUser(user);
    try {
      localStorage.setItem('aliemath_admin_id', user.id);
    } catch {
      // Ignored
    }
  };

  
const handleAdminLogout = () => {
  signOut(auth).catch((error) => {
    console.error('Gagal keluar dari Firebase:', error);
  });

  setAdminUser(null);

  try {
    localStorage.removeItem('aliemath_admin_id');
  } catch {}

  if (activeTab === 'students' || activeTab === 'admins') {
    setActiveTab('news');
  }
};

  const handleCbtStudentLogin = (student: User) => {
    setCbtStudent(student);
    try {
      sessionStorage.setItem('aliemath_cbt_student_id', student.id);
    } catch {
      // Ignored
    }
  };

  const handleCbtStudentLogout = () => {
    setCbtStudent(null);
    try {
      sessionStorage.removeItem('aliemath_cbt_student_id');
    } catch {
      // Ignored
    }
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
    setDatabase((prev) => {
      const targetSessionId = `lock_${attempt.studentId}_${attempt.examId}`;
      const updatedLocks = (prev.cbtSessionLocks || []).map((l) =>
        l.id === targetSessionId
          ? {
              ...l,
              isLocked: false,
              isCompleted: true,
              savedAnswers: attempt.answers || l.savedAnswers,
              updatedAt: new Date().toISOString(),
            }
          : l
      );

      return {
        ...prev,
        attempts: [attempt, ...prev.attempts],
        cbtSessionLocks: updatedLocks,
      };
    });
  };

  const handleLockExamSession = (lockInfo: {
    examId: string;
    examTitle: string;
    student: User;
    reason: string;
    answers: Record<string, any>;
    flagged: string[];
    secondsRemaining: number;
  }) => {
    setDatabase((prev) => {
      const existingLocks = prev.cbtSessionLocks || [];
      const targetSessionId = `lock_${lockInfo.student.id}_${lockInfo.examId}`;
      const existing = existingLocks.find((l) => l.id === targetSessionId);

      const updatedLock: CBTSessionLock = {
        id: targetSessionId,
        studentId: lockInfo.student.id,
        studentName: lockInfo.student.fullName,
        studentClass: lockInfo.student.classGroup || 'Umum',
        studentNisn: lockInfo.student.nisn,
        studentSession: lockInfo.student.examSession || lockInfo.student.session,
        studentExamTime: lockInfo.student.examTime,
        examId: lockInfo.examId,
        examTitle: lockInfo.examTitle,
        isLocked: true,
        lockReason: lockInfo.reason,
        lockedAt: new Date().toISOString(),
        violationCount: (existing?.violationCount || 0) + 1,
        savedAnswers: lockInfo.answers,
        savedFlagged: lockInfo.flagged,
        savedSecondsRemaining: lockInfo.secondsRemaining,
        isCompleted: false,
        updatedAt: new Date().toISOString(),
      };

      const newLocks = existing
        ? existingLocks.map((l) => (l.id === targetSessionId ? updatedLock : l))
        : [updatedLock, ...existingLocks];

      return {
        ...prev,
        cbtSessionLocks: newLocks,
      };
    });
  };

  const handleUnlockExamSession = (sessionId: string, adminName?: string) => {
    setDatabase((prev) => {
      const existingLocks = prev.cbtSessionLocks || [];
      const newLocks = existingLocks.map((l) =>
        l.id === sessionId
          ? {
              ...l,
              isLocked: false,
              unlockedBy: adminName || currentUser.fullName,
              unlockedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : l
      );
      return {
        ...prev,
        cbtSessionLocks: newLocks,
      };
    });
  };

  const handleResetExamSession = (sessionId: string) => {
    setDatabase((prev) => {
      const targetLock = (prev.cbtSessionLocks || []).find((l) => l.id === sessionId);
      const studentId = targetLock?.studentId;
      const examId = targetLock?.examId;

      return {
        ...prev,
        cbtSessionLocks: (prev.cbtSessionLocks || []).filter((l) => l.id !== sessionId),
        attempts: targetLock
          ? (prev.attempts || []).filter(
              (a) => !(a.studentId === studentId && a.examId === examId)
            )
          : prev.attempts,
      };
    });
  };

  const handleUpdateSessionProgress = (
    examId: string,
    studentId: string,
    progress: { answers: Record<string, any>; flagged: string[]; secondsRemaining: number }
  ) => {
    setDatabase((prev) => {
      const existingLocks = prev.cbtSessionLocks || [];
      const targetSessionId = `lock_${studentId}_${examId}`;
      const existing = existingLocks.find((l) => l.id === targetSessionId);

      if (existing) {
        const newLocks = existingLocks.map((l) =>
          l.id === targetSessionId
            ? {
                ...l,
                savedAnswers: progress.answers,
                savedFlagged: progress.flagged,
                savedSecondsRemaining: progress.secondsRemaining,
                updatedAt: new Date().toISOString(),
              }
            : l
        );
        return { ...prev, cbtSessionLocks: newLocks };
      }

      const examObj = prev.exams.find((e) => e.id === examId);
      const userObj = prev.users.find((u) => u.id === studentId) || currentUser;
      const newLockRecord: CBTSessionLock = {
        id: targetSessionId,
        studentId: userObj.id,
        studentName: userObj.fullName,
        studentClass: userObj.classGroup || 'Umum',
        studentNisn: userObj.nisn,
        studentSession: userObj.examSession || userObj.session,
        studentExamTime: userObj.examTime,
        examId,
        examTitle: examObj?.title || 'Ujian CBT',
        isLocked: false,
        violationCount: 0,
        savedAnswers: progress.answers,
        savedFlagged: progress.flagged,
        savedSecondsRemaining: progress.secondsRemaining,
        isCompleted: false,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        cbtSessionLocks: [newLockRecord, ...existingLocks],
      };
    });
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

  const handleBatchImportStudents = (
    newStudents: Omit<User, 'id' | 'role' | 'createdAt'>[],
    mode: 'merge' | 'replace' = 'merge'
  ) => {
    setDatabase((prev) => {
      const nonStudentUsers = prev.users.filter((u) => u.role !== 'student');
      const existingStudents = prev.users.filter((u) => u.role === 'student');

      const importedList: User[] = newStudents.map((std, idx) => ({
        id: `usr_std_${Date.now()}_${idx}`,
        fullName: std.fullName.trim(),
        username: std.username.trim().toLowerCase().replace(/\s+/g, '.'),
        password: std.password || '123456',
        classGroup: std.classGroup || '7A',
        session: std.session || std.examSession || 'Sesi 1',
        examSession: std.session || std.examSession || 'Sesi 1',
        examTime: std.examTime || '07:30 - 09:30 WIB',
        role: 'student',
        status: std.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
      }));

      let finalStudents: User[];
      if (mode === 'replace') {
        finalStudents = importedList;
      } else {
        const updatedList = [...existingStudents];
        for (const imported of importedList) {
          const existingIdx = updatedList.findIndex(
            (s) => s.username.toLowerCase() === imported.username.toLowerCase()
          );
          if (existingIdx >= 0) {
            updatedList[existingIdx] = {
              ...updatedList[existingIdx],
              fullName: imported.fullName,
              password: imported.password,
              classGroup: imported.classGroup,
              session: imported.session,
              examSession: imported.examSession,
              examTime: imported.examTime,
              status: imported.status,
            };
          } else {
            updatedList.push(imported);
          }
        }
        finalStudents = updatedList;
      }

      return {
        ...prev,
        users: [...nonStudentUsers, ...finalStudents],
      };
    });
  };

  // ---------------- Admin Actions (Super Admin Exclusive - Req 5) ----------------
  const handleAddAdmin = (newAdmin: { fullName: string; username: string; password?: string }) => {
    if (!currentUser.isSuperAdmin) {
      alert('Akses Ditolak: Hanya Guru Utama (Super Admin) yang berwenang menambahkan admin baru.');
      return;
    }
    const adminUser: User = {
      id: `usr_adm_${Date.now()}`,
      fullName: newAdmin.fullName,
      username: newAdmin.username,
      password: newAdmin.password || '123456',
      role: 'admin',
      isSuperAdmin: false,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDatabase((prev) => ({
      ...prev,
      users: [...prev.users, adminUser],
    }));
  };

  const handleUpdateAdminPassword = (adminId: string, newPassword: string) => {
    if (!currentUser.isSuperAdmin) {
      alert('Akses Ditolak: Hanya Guru Utama (Super Admin) yang berwenang mengatur dan mengganti password akun admin.');
      return;
    }
    setDatabase((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === adminId ? { ...u, password: newPassword } : u)),
    }));
    if (adminUser?.id === adminId) {
      setAdminUser((prev) => (prev ? { ...prev, password: newPassword } : null));
    }
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (!currentUser.isSuperAdmin) {
      alert('Akses Ditolak: Hanya Guru Utama (Super Admin) yang berwenang menghapus admin.');
      return;
    }
    const target = database.users.find((u) => u.id === adminId);
    if (target?.isSuperAdmin) {
      alert('Peringatan: Akun Guru Utama / Super Admin dilindungi dan tidak dapat dihapus.');
      return;
    }
    setDatabase((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== adminId),
    }));
    if (adminUser?.id === adminId) {
      handleAdminLogout();
    }
  };

  const handleSwitchAdminUser = (admin: User) => {
    handleAdminLogin(admin);
  };

  const pendingTasksCount = database.exams.filter(
    (e) => e.isActive && !database.attempts.some((a) => a.examId === e.id && a.studentId === currentUser.id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        adminUser={adminUser}
        onOpenAdminLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleAdminLogout}
      />

      {/* Main Layout: Sidebar on Left + Dynamic Content on Center */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={currentUser.role}
          isSuperAdmin={currentUser.isSuperAdmin}
          pendingTasksCount={pendingTasksCount}
          totalMaterialsCount={database.materials.length}
          totalStudentsCount={database.users.filter((u) => u.role === 'student').length}
          totalAdminsCount={database.users.filter((u) => u.role === 'admin').length}
          lockedSessionsCount={(database.cbtSessionLocks || []).filter((l) => l.isLocked).length}
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
              cbtSessionLocks={database.cbtSessionLocks || []}
              currentUser={currentUser}
              allUsers={database.users}
              cbtStudent={cbtStudent}
              onCbtStudentLogin={handleCbtStudentLogin}
              onCbtStudentLogout={handleCbtStudentLogout}
              onStartExam={(exam, student) => {
                const examStudent =
                  student ||
                  cbtStudent ||
                  (currentUser.role === 'student' && currentUser.id !== 'guest' ? currentUser : null);
                if (examStudent) {
                  setActiveCBTStudent(examStudent);
                  setActiveCBTExam(exam);
                } else if (currentUser.role === 'admin') {
                  setActiveCBTStudent(currentUser);
                  setActiveCBTExam(exam);
                }
              }}
              onAddExam={handleAddExam}
              onEditExam={handleEditExam}
              onDeleteExam={handleDeleteExam}
              onUpdateQuestions={handleUpdateQuestions}
              onUnlockExamSession={handleUnlockExamSession}
              onResetExamSession={handleResetExamSession}
            />
          )}

          {activeTab === 'students' && currentUser.role === 'admin' && (
            <StudentManagement
              users={database.users}
              attempts={database.attempts}
              cbtSessionLocks={database.cbtSessionLocks || []}
              onUnlockExamSession={handleUnlockExamSession}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onBatchImportStudents={handleBatchImportStudents}
            />
          )}

          {activeTab === 'admins' && currentUser.role === 'admin' && (
            <AdminManagement
              currentUser={currentUser}
              users={database.users}
              onAddAdmin={handleAddAdmin}
              onUpdateAdminPassword={handleUpdateAdminPassword}
              onDeleteAdmin={handleDeleteAdmin}
              onSwitchAdminUser={handleSwitchAdminUser}
            />
          )}
        </main>
      </div>

      {/* CBT Fullscreen Exam Runner Modal */}
      {activeCBTExam && (
        <CBTExamModal
          exam={activeCBTExam}
          student={activeCBTStudent || cbtStudent || currentUser}
          initialSessionLock={(database.cbtSessionLocks || []).find(
            (l) =>
              l.studentId === (activeCBTStudent || cbtStudent || currentUser).id &&
              l.examId === activeCBTExam.id
          )}
          onUpdateSessionProgress={(progress) =>
            handleUpdateSessionProgress(
              activeCBTExam.id,
              (activeCBTStudent || cbtStudent || currentUser).id,
              progress
            )
          }
          onLockExamSession={handleLockExamSession}
          onUnlockExamSession={(sessionId) =>
            handleUnlockExamSession(
              sessionId,
              (activeCBTStudent || cbtStudent || currentUser).fullName
            )
          }
          onCompleteExam={handleCompleteExamAttempt}
          onClose={() => {
            setActiveCBTExam(null);
            setActiveCBTStudent(null);
          }}
        />
      )}

      {/* Authentication Modal - Khusus Guru / Admin */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={database.users}
        onLoginSuccess={(user) => {
          handleAdminLogin(user);
        }}
      />
    </div>
  );
}
