import React, { useState } from 'react';
import {
  GraduationCap,
  Key,
  User as UserIcon,
  X,
  AlertCircle,
  Play,
  Clock,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { User, CBTExam } from '../types';

interface CBTStudentLoginModalProps {
  isOpen: boolean;
  exam: CBTExam | null;
  users: User[];
  onClose: () => void;
  onLoginSuccess: (student: User, exam: CBTExam) => void;
}

export const CBTStudentLoginModal: React.FC<CBTStudentLoginModalProps> = ({
  isOpen,
  exam,
  users,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !exam) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedInput = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedInput || !trimmedPass) {
      setErrorMessage('Harap isi Username dan Password akun CBT siswa Anda.');
      return;
    }

    const studentUsers = users.filter((u) => u.role === 'student');
    const matchedStudent = studentUsers.find((s) => {
      const matchUser = s.username.toLowerCase() === trimmedInput;
      return matchUser && s.password === trimmedPass;
    });

    if (!matchedStudent) {
      setErrorMessage(
        'Akun siswa tidak ditemukan atau password salah. Pastikan menggunakan Username & Password yang dibuatkan oleh Guru.'
      );
      return;
    }

    if (matchedStudent.status === 'inactive') {
      setErrorMessage('Akun siswa ini sedang dinonaktifkan oleh Guru. Silakan hubungi Guru Pengawas.');
      return;
    }

    onLoginSuccess(matchedStudent, exam);
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Masuk Ujian CBT</h3>
              <p className="text-[11px] text-slate-500">Verifikasi akun siswa untuk memulai ulangan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Exam Information */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {exam.gradeLevel} • {exam.subject}
            </span>
            <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {exam.durationMinutes} Menit
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-blue-950 line-clamp-1">{exam.title}</h4>
          <p className="text-[11px] text-blue-800/80 line-clamp-2">{exam.description}</p>
        </div>

        {/* Notice Info */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            Akun siswa dibuatkan secara resmi oleh <strong>Guru Pengampu</strong>. Masukkan Username dan Password akun CBT Anda.
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Username Login Siswa
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoFocus
                placeholder="Contoh: ahmad.fauzi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password Akun Siswa
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Masukkan password dari Guru..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer pt-2.5 pb-2.5 mt-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Verifikasi & Mulai Ujian</span>
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center">
          *Hubungi Guru Pengawas jika Anda lupa password atau akun belum didaftarkan.
        </p>
      </div>
    </div>
  );
};
