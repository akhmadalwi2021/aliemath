import React, { useState } from 'react';
import {
  Shield,
  Key,
  User as UserIcon,
  X,
  AlertCircle,
  LogIn,
  HelpCircle
} from 'lucide-react';
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

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMessage('Silakan masukkan username dan password Guru.');
      return;
    }

    const target = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUser &&
        u.password === trimmedPass
    );

    if (!target) {
      setErrorMessage('Username atau password Guru tidak sesuai. Silakan periksa kembali!');
      return;
    }

    if (target.role !== 'admin') {
      setErrorMessage(
        'Akses ditolak: Akun ini adalah akun Siswa. Siswa tidak login di sini, silakan gunakan akun Anda saat mengerjakan soal di menu CBT.'
      );
      return;
    }

    if (target.status === 'inactive') {
      setErrorMessage('Akun Guru ini sedang dinonaktifkan.');
      return;
    }

    onLoginSuccess(target);
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Login Admin (Guru)</h3>
              <p className="text-[11px] text-slate-500">Panel Pengelolaan Materi & CBT Aliemath</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational callout */}
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-xs flex items-start gap-2">
          <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            Halaman masuk ini dikhususkan bagi <strong>Guru dan Administrator</strong> untuk mengelola modul pembelajaran, bank soal, dan data siswa.
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Username Guru / Admin
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoFocus
                placeholder="Masukkan username guru..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Sebagai Guru</span>
          </button>
        </form>

        <div className="pt-2 text-[11px] text-slate-400 text-center border-t border-slate-100">
          *Catatan: Siswa tidak login di sini. Akun siswa hanya digunakan untuk masuk saat ujian CBT.
        </div>
      </div>
    </div>
  );
};
