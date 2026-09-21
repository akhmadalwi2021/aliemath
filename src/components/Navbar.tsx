import React from 'react';
import { BookOpen, User as UserIcon, Shield, GraduationCap, GitBranch, LogIn, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenGitHubSync: () => void;
  isGitHubConnected: boolean;
  onSwitchQuickRole: (role: 'admin' | 'student') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenGitHubSync,
  isGitHubConnected,
  onSwitchQuickRole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
              <span className="font-mono text-xl">∑</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Aliemath<span className="text-blue-600 font-black">.my.id</span></span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  CBT & EduPortal
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Platform Pembelajaran Matematika & CBT Terintegrasi</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* GitHub Database Sync Button */}
            <button
              id="btn-github-sync"
              onClick={onOpenGitHubSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isGitHubConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Kelola Database GitHub & Ekspor Vercel"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span className="hidden md:inline">GitHub DB</span>
              {isGitHubConnected && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            </button>

            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => onSwitchQuickRole('admin')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentUser.role === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mode Guru (Admin)
              </button>
              <button
                onClick={() => onSwitchQuickRole('student')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentUser.role === 'student'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mode Siswa
              </button>
            </div>

            {/* Current User Badge & Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    currentUser.role === 'admin'
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-700'
                      : 'bg-gradient-to-tr from-blue-600 to-cyan-600'
                  }`}
                >
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[140px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {currentUser.role === 'admin'
                      ? currentUser.isSuperAdmin
                        ? 'Guru Utama (Super Admin)'
                        : 'Guru Pengampu (Admin)'
                      : `Siswa (${currentUser.classGroup || 'Aktif'})`}
                  </div>
                </div>
              </div>

              {/* Login / Switch Account Button */}
              <button
                id="btn-user-auth"
                onClick={onOpenAuth}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Ganti Akun / Login"
              >
                <LogIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
