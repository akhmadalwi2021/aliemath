import React, { useState } from 'react';
import {
  Shield,
  GraduationCap,
  LogIn,
  Key,
  User as UserIcon,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { User, UserRole } from '../types';

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
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const target = users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password.trim()
    );

    if (!target) {
      setErrorMessage('Username atau password tidak sesuai. Silakan periksa kembali!');
      return;
    }

    if (target.status === 'inactive') {
      setErrorMessage('Akun ini sedang dinonaktifkan oleh Administrator.');
      return;
    }

    onLoginSuccess(target);
    onClose();
  };

  const handleQuickLogin = (userObj: User) => {
    onLoginSuccess(userObj);
    onClose();
  };

  const adminUsers = users.filter((u) => u.role === 'admin');
  const studentUsers = users.filter((u) => u.role === 'student');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold font-mono">
              ∑
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Masuk Akun Aliemath</h3>
              <p className="text-[11px] text-slate-500">Pilih peran atau masukkan akun terdaftar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Picker Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('student');
              setUsername('ahmad.fauzi');
              setPassword('123');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Akun Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('admin');
              setUsername('admin');
              setPassword('admin');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'admin'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin / Guru</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Username / NISN</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Masukkan username akun..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors mt-2"
          >
            Masuk ke Aliemath.my.id
          </button>
        </form>

        {/* Quick Demo Login shortcuts */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Masuk Cepat untuk Demonstrasi:
          </div>

          <div className="space-y-1.5">
            {adminUsers.map((adm) => (
              <button
                key={adm.id}
                onClick={() => handleQuickLogin(adm)}
                className="w-full text-left p-2 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-purple-700" />
                  <span className="font-bold text-purple-900">{adm.fullName}</span>
                </div>
                <span className="text-[10px] text-purple-700 font-mono">admin / admin</span>
              </button>
            ))}

            {studentUsers.slice(0, 2).map((std) => (
              <button
                key={std.id}
                onClick={() => handleQuickLogin(std)}
                className="w-full text-left p-2 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                  <span className="font-bold text-blue-900">{std.fullName} ({std.classGroup})</span>
                </div>
                <span className="text-[10px] text-blue-700 font-mono">{std.username} / 123</span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 text-center pt-1">
            *Catatan: Pendaftaran akun siswa baru hanya dapat dilakukan melalui menu <strong>Manajemen Siswa</strong> oleh Guru/Admin.
          </p>
        </div>
      </div>
    </div>
  );
};
