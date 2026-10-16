import React, { useState } from 'react';
import {
  Shield,
  Key,
  User as UserIcon,
  X,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    const email = username.trim();
    const trimmedPass = password;

    if (!email || !trimmedPass) {
      setErrorMessage('Silakan masukkan email dan password Firebase.');
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, trimmedPass);

      const target = users.find(
        (u) =>
          u.id === 'usr_admin' &&
          u.role === 'admin' &&
          u.isSuperAdmin === true &&
          u.status === 'active'
      );

      if (!target) {
        setErrorMessage(
          'Data Super Admin tidak ditemukan atau tidak aktif.'
        );
        return;
      }

      onLoginSuccess(target);
      setUsername('');
      setPassword('');
      onClose();
    } catch (error) {
      console.error('Firebase admin sign-in failed:', error);
      setErrorMessage(
        'Login Firebase gagal. Periksa email, password, dan status akun.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Login Super Admin
              </h3>
              <p className="text-[11px] text-slate-500">
                Panel Pengelolaan Materi &amp; CBT Aliemath
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-xs flex items-start gap-2">
          <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            Masuk menggunakan akun Super Admin yang sudah terdaftar di
            Firebase Authentication.
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              {errorMessage}
            </span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label
              htmlFor="admin-email"
              className="block font-semibold text-slate-700 mb-1"
            >
              Email Super Admin
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="admin-email"
                type="email"
                required
                autoFocus
                autoComplete="username"
                placeholder="Masukkan email Firebase..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block font-semibold text-slate-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Masukkan password Firebase..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Memeriksa akun...' : 'Masuk sebagai Super Admin'}</span>
          </button>
        </form>

        <div className="pt-2 text-[11px] text-slate-400 text-center border-t border-slate-100">
          Akun siswa tidak digunakan untuk masuk melalui halaman ini.
        </div>
      </div>
    </div>
  );
};