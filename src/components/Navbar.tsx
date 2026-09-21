import React from 'react';
import { Shield, GitBranch, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  adminUser: User | null;
  onOpenAdminLogin: () => void;
  onLogout: () => void;
  onOpenGitHubSync: () => void;
  isGitHubConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  adminUser,
  onOpenAdminLogin,
  onLogout,
  onOpenGitHubSync,
  isGitHubConnected,
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
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  Aliemath<span className="text-blue-600 font-black">.my.id</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  CBT & EduPortal
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Platform Pembelajaran Matematika & CBT Terintegrasi
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* GitHub Database Sync Button */}
            <button
              id="btn-github-sync"
              onClick={onOpenGitHubSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
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

            {/* Admin Login / Admin Profile in Top Right Corner */}
            {adminUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-purple-950 line-clamp-1 max-w-[140px]">
                      {adminUser.fullName}
                    </div>
                    <div className="text-[10px] text-purple-700 font-medium">
                      {adminUser.isSuperAdmin ? 'Guru Utama (Super Admin)' : 'Guru Pengampu'}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  id="btn-admin-logout"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  title="Keluar dari Akun Guru"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-admin-login"
                onClick={onOpenAdminLogin}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
                title="Login Khusus Guru / Administrator"
              >
                <Shield className="w-4 h-4" />
                <span>Login Admin (Guru)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
