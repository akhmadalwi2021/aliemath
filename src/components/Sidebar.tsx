import React from 'react';
import {
  Newspaper,
  BookOpen,
  FileCheck2,
  Users,
  Database,
  Shield,
  GraduationCap,
  Sparkles,
  Info,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'news' | 'materials' | 'cbt' | 'students' | 'admins' | 'github_db';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole: UserRole;
  isSuperAdmin?: boolean;
  pendingTasksCount?: number;
  totalMaterialsCount?: number;
  totalStudentsCount?: number;
  totalAdminsCount?: number;
  lockedSessionsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  isSuperAdmin,
  pendingTasksCount = 0,
  totalMaterialsCount = 0,
  totalStudentsCount = 0,
  totalAdminsCount = 1,
  lockedSessionsCount = 0,
}) => {
  return (
    <aside className="w-full md:w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Role status banner */}
        <div
          className={`p-3 rounded-xl border text-xs ${
            userRole === 'admin'
              ? 'bg-purple-50 border-purple-200 text-purple-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            {userRole === 'admin' ? (
              <>
                <Shield className="w-4 h-4 text-purple-700" />
                <span>Panel Guru (Admin)</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>Portal Aliemath</span>
              </>
            )}
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            {userRole === 'admin'
              ? 'Akses penuh: Tambah materi, kelola bank soal CBT, dan registrasi siswa.'
              : 'Baca materi, pantau berita, dan ikuti ujian CBT dengan akun dari Guru.'}
          </p>
        </div>

        {/* Navigation Menu */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Menu Utama
          </div>
          <nav className="space-y-1">
            {/* 1. Berita Terkini */}
            <button
              id="sidebar-tab-news"
              onClick={() => onSelectTab('news')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'news'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4" />
                <span>Berita & Info Terkini</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeTab === 'news' ? 'rotate-90' : ''}`} />
            </button>

            {/* 2. Materi Pembelajaran */}
            <button
              id="sidebar-tab-materials"
              onClick={() => onSelectTab('materials')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'materials'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Materi Pembelajaran</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === 'materials' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {totalMaterialsCount}
              </span>
            </button>

            {/* 3. Soal Latihan (CBT) */}
            <button
              id="sidebar-tab-cbt"
              onClick={() => onSelectTab('cbt')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'cbt'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4" />
                <span>Soal Latihan (CBT)</span>
              </div>
              {pendingTasksCount > 0 && userRole === 'student' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
              {lockedSessionsCount > 0 && userRole === 'admin' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-rose-500 text-white animate-pulse">
                  {lockedSessionsCount} Kunci
                </span>
              )}
            </button>

            {/* 4. Manajemen Siswa (Admin Only) */}
            {userRole === 'admin' && (
              <button
                id="sidebar-tab-students"
                onClick={() => onSelectTab('students')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'students'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Manajemen Siswa</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {totalStudentsCount}
                </span>
              </button>
            )}

            {/* 5. Kelola Akun Guru & Admin (Admin Only) */}
            {userRole === 'admin' && (
              <button
                id="sidebar-tab-admins"
                onClick={() => onSelectTab('admins')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'admins'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4" />
                  <span>Kelola Akun Guru</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'admins'
                      ? 'bg-white/20 text-white'
                      : isSuperAdmin
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isSuperAdmin ? 'Super' : `${totalAdminsCount} Guru`}
                </span>
              </button>
            )}

            {/* 6. Database & GitHub Sync */}
            <button
              id="sidebar-tab-github"
              onClick={() => onSelectTab('github_db')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'github_db'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4" />
                <span>Database & GitHub</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                JSON DB
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer Info in Sidebar */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span>DOMAIN</span>
          <span className="text-slate-600 font-bold">Aliemath.my.id</span>
        </div>
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span>DEPLOY</span>
          <span className="text-emerald-600 font-bold">Vercel Ready</span>
        </div>
        <p className="text-[10px] text-slate-400 text-center pt-2">
          © 2026 Aliemath • Pendidikan Berkualitas
        </p>
      </div>
    </aside>
  );
};
