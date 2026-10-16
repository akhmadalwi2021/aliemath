import React, { useState } from 'react';
import {
  Shield,
  Key,
  User as UserIcon,
  X,
  AlertCircle,
  LogIn,
  GraduationCap,
  Sparkles,
  Flame,
  CheckCircle2,
  Info
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
  const [activeTab, setActiveTab] = useState<'superadmin' | 'teacher'>('superadmin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleTabChange = (tab: 'superadmin' | 'teacher') => {
    setActiveTab(tab);
    setErrorMessage('');
    setUsername('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    const inputId = username.trim();
    const inputPass = password;

    if (!inputId || !inputPass) {
      setErrorMessage('Silakan masukkan username/email dan password.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'superadmin') {
        // --- 1. Login Super Admin (Guru Utama) ---
        // First try Firebase Auth if user provided email or standard login
        let firebaseUser = null;
        if (inputId.includes('@')) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, inputId, inputPass);
            firebaseUser = userCredential.user;
          } catch (fbErr: any) {
            console.warn('[Firebase Auth Super Admin error]', fbErr?.code, fbErr?.message);
          }
        }

        // If Firebase Auth succeeded
        if (firebaseUser) {
          const matchedByUidOrEmail = users.find(
            (u) =>
              u.role === 'admin' &&
              (u.firebaseUid === firebaseUser.uid ||
                u.email?.toLowerCase() === firebaseUser.email?.toLowerCase() ||
                u.isSuperAdmin === true)
          );

          if (matchedByUidOrEmail) {
            onLoginSuccess(matchedByUidOrEmail);
            onClose();
            return;
          }

          // If UID matches user's provided UID QIdqovxl9pR55TeaIJj6eNe45gF2
          if (firebaseUser.uid === 'QIdqovxl9pR55TeaIJj6eNe45gF2') {
            const superAdmin = users.find((u) => u.isSuperAdmin) || {
              id: 'usr_admin',
              username: 'admin',
              fullName: 'Bpk. Akhmad Alwi, S.Pd (Guru Utama & Super Admin)',
              role: 'admin' as const,
              isSuperAdmin: true,
              status: 'active' as const,
              createdAt: '2026-01-01',
              firebaseUid: 'QIdqovxl9pR55TeaIJj6eNe45gF2',
            };
            onLoginSuccess(superAdmin);
            onClose();
            return;
          }
        }

        // Fallback or Direct username/password check for Super Admin
        const localSuperAdmin = users.find(
          (u) =>
            u.role === 'admin' &&
            u.isSuperAdmin === true &&
            u.status === 'active' &&
            (u.username.toLowerCase() === inputId.toLowerCase() ||
              u.email?.toLowerCase() === inputId.toLowerCase()) &&
            u.password === inputPass
        );

        if (localSuperAdmin) {
          onLoginSuccess(localSuperAdmin);
          onClose();
          return;
        }

        // Default root admin credentials check (admin / admin)
        if (inputId.toLowerCase() === 'admin' && inputPass === 'admin') {
          const rootAdmin = users.find((u) => u.id === 'usr_admin' || u.isSuperAdmin) || {
            id: 'usr_admin',
            username: 'admin',
            fullName: 'Bpk. Akhmad Alwi, S.Pd (Guru Utama & Super Admin)',
            role: 'admin' as const,
            isSuperAdmin: true,
            status: 'active' as const,
            createdAt: '2026-01-01',
            firebaseUid: 'QIdqovxl9pR55TeaIJj6eNe45gF2',
          };
          onLoginSuccess(rootAdmin);
          onClose();
          return;
        }

        setErrorMessage(
          'Login Super Admin gagal. Periksa email Firebase / username admin dan password Anda.'
        );
      } else {
        // --- 2. Login Guru sebagai Admin (Guru Pengampu) ---
        // Teachers can log in with username or email registered by Super Admin
        const teacherUser = users.find(
          (u) =>
            u.role === 'admin' &&
            !u.isSuperAdmin &&
            u.status === 'active' &&
            (u.username.toLowerCase() === inputId.toLowerCase() ||
              u.email?.toLowerCase() === inputId.toLowerCase()) &&
            (u.password === inputPass || !u.password)
        );

        if (teacherUser) {
          onLoginSuccess(teacherUser);
          onClose();
          return;
        }

        // Also check if any admin matches
        const anyAdminMatch = users.find(
          (u) =>
            u.role === 'admin' &&
            u.status === 'active' &&
            (u.username.toLowerCase() === inputId.toLowerCase() ||
              u.email?.toLowerCase() === inputId.toLowerCase()) &&
            u.password === inputPass
        );

        if (anyAdminMatch) {
          onLoginSuccess(anyAdminMatch);
          onClose();
          return;
        }

        // Try Firebase Auth for teacher if email is provided
        if (inputId.includes('@')) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, inputId, inputPass);
            const foundTeacher = users.find(
              (u) =>
                u.role === 'admin' &&
                (u.email?.toLowerCase() === userCredential.user.email?.toLowerCase() ||
                  u.firebaseUid === userCredential.user.uid)
            );
            if (foundTeacher) {
              onLoginSuccess(foundTeacher);
              onClose();
              return;
            }
          } catch (fbErr) {
            // Handled below
          }
        }

        setErrorMessage(
          'Akun Guru tidak ditemukan atau password salah. Pastikan akun Guru Anda sudah dibuatkan oleh Guru Utama (Super Admin).'
        );
      }
    } catch (error: any) {
      console.error('Admin sign-in failed:', error);
      setErrorMessage(
        error?.message || 'Login gagal. Periksa username/email dan password Anda.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Portal Masuk Tenaga Pendidik
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilih peran: Super Admin atau Guru Pengampu
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

        {/* Tab Role Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTabChange('superadmin')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'superadmin'
                ? 'bg-white text-purple-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Super Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('teacher')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'teacher'
                ? 'bg-white text-blue-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Guru (Admin)</span>
          </button>
        </div>

        {/* Role Privileges Banner */}
        {activeTab === 'superadmin' ? (
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Flame className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Guru Utama &amp; Super Admin</span>
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              Otoritas penuh: Menambahkan akun Guru sebagai admin, akun siswa, materi pelajaran, soal CBT, dan konfigurasi Firebase (UID: QIdqovxl9pR55TeaIJj6eNe45gF2).
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Guru Pengampu (Admin)</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Dapat menambahkan &amp; membuat akun siswa, mengunggah materi pelajaran, serta mengelola bank soal &amp; nilai ujian CBT.
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label
              htmlFor="admin-input-user"
              className="block font-semibold text-slate-700 mb-1"
            >
              {activeTab === 'superadmin'
                ? 'Email Firebase / Username Super Admin'
                : 'Username / Email Guru'}
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="admin-input-user"
                type="text"
                required
                autoFocus
                autoComplete="username"
                placeholder={
                  activeTab === 'superadmin'
                    ? 'akhmadalwi2021@gmail.com atau admin'
                    : 'guru.matematika atau email guru...'
                }
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
                placeholder="Masukkan password akun..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2 disabled:opacity-60 ${
              activeTab === 'superadmin'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>
              {isLoading
                ? 'Memeriksa kredensial...'
                : activeTab === 'superadmin'
                ? 'Masuk sebagai Super Admin'
                : 'Masuk sebagai Guru (Admin)'}
            </span>
          </button>
        </form>

        {/* Quick Demo Shortcuts */}
        <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Bantuan Masuk Cepat:</span>
            {activeTab === 'superadmin' ? (
              <button
                type="button"
                onClick={() => handleFillDemo('admin', 'admin')}
                className="text-purple-600 hover:text-purple-800 font-semibold underline cursor-pointer"
              >
                Gunakan demo: admin / admin
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleFillDemo('guru.matematika', '123')}
                className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
              >
                Gunakan demo: guru.matematika / 123
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Data login dan perubahan data tersimpan langsung di Firebase &amp; perangkat.
          </p>
        </div>

      </div>
    </div>
  );
};