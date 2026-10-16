import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Key,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  UserCheck,
  Info,
  BookOpen,
  FileCheck2,
  Users,
  Flame,
  Mail,
  GraduationCap
} from 'lucide-react';
import { User } from '../types';

interface AdminManagementProps {
  currentUser: User;
  users: User[];
  onAddAdmin: (newAdmin: {
    fullName: string;
    username: string;
    password?: string;
    email?: string;
    subjectAssigned?: string;
  }) => void;
  onUpdateAdminPassword: (adminId: string, newPassword: string) => void;
  onDeleteAdmin: (adminId: string) => void;
  onSwitchAdminUser: (admin: User) => void;
  onNavigateTab?: (tab: 'students' | 'materials' | 'cbt') => void;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({
  currentUser,
  users,
  onAddAdmin,
  onUpdateAdminPassword,
  onDeleteAdmin,
  onSwitchAdminUser,
  onNavigateTab,
}) => {
  const isSuperAdmin = Boolean(currentUser.isSuperAdmin);
  const adminUsers = users.filter((u) => u.role === 'admin');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newSubject, setNewSubject] = useState('Matematika Kelas 7, 8, 9');

  // Password change modal state
  const [passwordChangeTarget, setPasswordChangeTarget] = useState<User | null>(null);
  const [updatedPasswordValue, setUpdatedPasswordValue] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Confirmation modal state (avoiding window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const toggleShowPassword = (userId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleOpenAddModal = () => {
    if (!isSuperAdmin) {
      setActionAlert('Akses Ditolak: Hanya Guru Utama (Super Admin) yang berwenang menambahkan akun guru baru.');
      return;
    }
    setNewFullName('');
    setNewUsername('');
    setNewEmail('');
    setNewPassword('123456');
    setNewSubject('Matematika');
    setIsAddModalOpen(true);
  };

  const handleSubmitAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    if (!newFullName.trim() || !newUsername.trim()) return;

    onAddAdmin({
      fullName: newFullName.trim(),
      username: newUsername.trim().toLowerCase().replace(/\s+/g, '.'),
      email: newEmail.trim() || `${newUsername.trim().toLowerCase().replace(/\s+/g, '.')}@aliemath.my.id`,
      password: newPassword.trim() || '123456',
      subjectAssigned: newSubject.trim() || 'Guru Pengampu Matematika',
    });

    setIsAddModalOpen(false);
    setActionAlert(`Sukses: Akun Guru "${newFullName.trim()}" berhasil dibuat sebagai Admin Pengampu.`);
  };

  const handleOpenPasswordModal = (targetAdmin: User) => {
    if (!isSuperAdmin) {
      setActionAlert('Akses Ditolak: Hanya Guru Utama (Super Admin) yang berwenang mengatur password admin lain.');
      return;
    }
    setPasswordChangeTarget(targetAdmin);
    setUpdatedPasswordValue('');
  };

  const handleSubmitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin || !passwordChangeTarget) return;
    if (!updatedPasswordValue.trim()) return;

    onUpdateAdminPassword(passwordChangeTarget.id, updatedPasswordValue.trim());
    setActionAlert(`Password akun "${passwordChangeTarget.fullName}" berhasil diperbarui.`);
    setPasswordChangeTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!isSuperAdmin || !deleteTarget) return;
    if (deleteTarget.isSuperAdmin) {
      setActionAlert('Peringatan: Akun Guru Utama (Super Admin) tidak dapat dihapus.');
      setDeleteTarget(null);
      return;
    }
    onDeleteAdmin(deleteTarget.id);
    setActionAlert(`Akun guru "${deleteTarget.fullName}" telah berhasil dihapus.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Alert notice if any */}
      {actionAlert && (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-semibold">{actionAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionAlert(null)}
            className="text-purple-400 hover:text-purple-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Otoritas &amp; Pengelolaan Tenaga Pendidik</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Manajemen Akun Guru &amp; Administrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Super Admin dapat menambahkan akun guru sebagai admin dan akun siswa. Guru sebagai admin dapat menambahkan akun siswa, materi, dan soal CBT.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Guru Baru</span>
          </button>
        )}
      </div>

      {/* Role Privilege Status Box */}
      {isSuperAdmin ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex items-start gap-3 text-purple-950">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-purple-900 text-sm">
                Status Anda: Guru Utama &amp; Super Admin
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold text-[10px]">
                UID: QIdqovxl9pR55TeaIJj6eNe45gF2
              </span>
            </div>
            <p className="text-purple-800 leading-relaxed">
              Anda memiliki wewenang penuh untuk <strong>membuatkan akun Guru sebagai admin</strong>, <strong>membuat akun siswa</strong>, serta mengelola materi dan soal CBT.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-blue-50/90 border border-blue-200 space-y-3 text-blue-950">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-blue-950 text-sm">
                  Status Anda: Guru Pengampu (Admin)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 font-bold text-[10px]">
                  Akses Pengajar Aktif
                </span>
              </div>
              <p className="text-blue-900/90 leading-relaxed">
                Sebagai Guru (Admin), Anda memiliki wewenang setara Super Admin dalam <strong>menambahkan &amp; membuat akun siswa</strong>, <strong>mengunggah materi pembelajaran</strong>, dan <strong>menyusun serta memeriksa soal CBT</strong>. Penambahan akun sesama guru dikelola oleh Guru Utama (Super Admin).
              </p>
            </div>
          </div>

          {/* Quick Shortcuts for Teacher tasks */}
          {onNavigateTab && (
            <div className="pt-2 border-t border-blue-200/60 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-bold text-blue-800">Aksi Cepat Guru:</span>
              <button
                type="button"
                onClick={() => onNavigateTab('students')}
                className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 hover:bg-blue-100/70 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Buat / Kelola Akun Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('cbt')}
                className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 hover:bg-blue-100/70 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Buat &amp; Kelola Soal CBT</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('materials')}
                className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 hover:bg-blue-100/70 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Materi Pelajaran</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Admin List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Daftar Akun Guru &amp; Administrator</h2>
            <p className="text-xs text-slate-400">Total {adminUsers.length} tenaga pendidik terdaftar</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama Lengkap &amp; Peran</th>
                <th className="py-3 px-3">Tingkat Hak Akses</th>
                <th className="py-3 px-3">Tugas / Pengampu</th>
                <th className="py-3 px-3">Username Login</th>
                <th className="py-3 px-3">Password Akun</th>
                <th className="py-3 px-3 text-right">Otoritas Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.map((admin) => {
                const isThisSuperAdmin = Boolean(admin.isSuperAdmin);
                const isCurrent = admin.id === currentUser.id;
                const isPasswordShown = Boolean(showPasswordMap[admin.id]);

                return (
                  <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isThisSuperAdmin
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isThisSuperAdmin ? '★' : <GraduationCap className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{admin.fullName}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-semibold">
                                Akun Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {admin.email || `@${admin.username}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {isThisSuperAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          <ShieldCheck className="w-3 h-3 text-purple-600" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          <GraduationCap className="w-3 h-3 text-blue-600" />
                          Guru (Admin)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {admin.subjectAssigned || (isThisSuperAdmin ? 'Semua Mata Pelajaran' : 'Guru Pengampu')}
                    </td>

                    <td className="py-3 px-3 font-mono font-medium text-purple-700">
                      {admin.username}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {isSuperAdmin ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 w-fit">
                          <span className="text-slate-800 font-bold">
                            {isPasswordShown ? admin.password || '-' : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(admin.id)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                            title={isPasswordShown ? 'Sembunyikan' : 'Lihat password'}
                          >
                            {isPasswordShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Terkunci</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isSuperAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordModal(admin)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold flex items-center gap-1 transition-colors border border-indigo-200 cursor-pointer"
                            title="Ganti Password Akun Ini"
                          >
                            <Key className="w-3 h-3" />
                            <span>Password</span>
                          </button>

                          {isThisSuperAdmin ? (
                            <span
                              className="px-2 py-1 text-[10px] text-slate-400 font-medium"
                              title="Akun Guru Utama dilindungi"
                            >
                              Dilindungi
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(admin)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Akun Guru Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end text-slate-400 gap-1 text-[11px]">
                          <Lock className="w-3 h-3" />
                          <span>Dikelola Super Admin</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Switch Admin for Testing Security */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Info className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            Simulasi berganti peran: Masuk sebagai Super Admin atau akun Guru Pengampu:
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {adminUsers.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onSwitchAdminUser(a)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                a.id === currentUser.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {a.isSuperAdmin ? '★ Super Admin: ' : 'Guru: '}{a.fullName.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Modal: Tambah Admin Guru Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Buat Akun Guru (Admin Baru)</h3>
                  <p className="text-[11px] text-slate-500">Didaftarkan oleh Super Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddAdmin} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Guru Beserta Gelar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Hendra Wijaya, S.Pd"
                  value={newFullName}
                  onChange={(e) => {
                    setNewFullName(e.target.value);
                    if (!newUsername) {
                      const clean = e.target.value
                        .toLowerCase()
                        .replace(/(bpk|ibu|s\.pd|m\.pd|dr|drs|\.)/g, '')
                        .trim()
                        .replace(/\s+/g, '.');
                      setNewUsername(clean);
                      setNewEmail(`${clean}@aliemath.my.id`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Username Login
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="hendra.wijaya"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password Awal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Guru (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="guru@aliemath.my.id"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mata Pelajaran / Tugas Pengampu
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Matematika Kelas 7 & 8"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1 text-blue-950">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Hak Akses Guru Pengampu Baru:</span>
                </div>
                <p>
                  Guru baru dapat langsung masuk menggunakan tab <strong>Guru (Admin)</strong>, serta memiliki hak penuh membuat akun siswa, menambah materi pelajaran, dan menyusun ujian CBT.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-xs cursor-pointer"
                >
                  Simpan Akun Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ganti Password Admin */}
      {passwordChangeTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Ganti Password Guru</h3>
              </div>
              <button
                type="button"
                onClick={() => setPasswordChangeTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPasswordChange} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">{passwordChangeTarget.fullName}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Username: @{passwordChangeTarget.username}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Masukkan Password Baru
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik password baru..."
                  value={updatedPasswordValue}
                  onChange={(e) => setUpdatedPasswordValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordChangeTarget(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Perbarui Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Akun Guru */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Akun Guru</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun guru <strong>{deleteTarget.fullName}</strong> (@{deleteTarget.username})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
