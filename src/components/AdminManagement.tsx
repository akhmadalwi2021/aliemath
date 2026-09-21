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
  Info
} from 'lucide-react';
import { User } from '../types';

interface AdminManagementProps {
  currentUser: User;
  users: User[];
  onAddAdmin: (newAdmin: { fullName: string; username: string; password?: string }) => void;
  onUpdateAdminPassword: (adminId: string, newPassword: string) => void;
  onDeleteAdmin: (adminId: string) => void;
  onSwitchAdminUser: (admin: User) => void;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({
  currentUser,
  users,
  onAddAdmin,
  onUpdateAdminPassword,
  onDeleteAdmin,
  onSwitchAdminUser,
}) => {
  const isSuperAdmin = Boolean(currentUser.isSuperAdmin);
  const adminUsers = users.filter((u) => u.role === 'admin');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Password change modal state
  const [passwordChangeTarget, setPasswordChangeTarget] = useState<User | null>(null);
  const [updatedPasswordValue, setUpdatedPasswordValue] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const toggleShowPassword = (userId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleOpenAddModal = () => {
    if (!isSuperAdmin) {
      alert('Akses Ditolak: Hanya Guru Utama (Super Admin) yang berwenang menambahkan admin baru.');
      return;
    }
    setNewFullName('');
    setNewUsername('');
    setNewPassword('123456');
    setIsAddModalOpen(true);
  };

  const handleSubmitAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    if (!newFullName.trim() || !newUsername.trim()) return;

    onAddAdmin({
      fullName: newFullName.trim(),
      username: newUsername.trim().toLowerCase().replace(/\s+/g, '.'),
      password: newPassword.trim() || '123456',
    });

    setIsAddModalOpen(false);
  };

  const handleOpenPasswordModal = (targetAdmin: User) => {
    if (!isSuperAdmin) {
      alert('Akses Ditolak: Hanya Guru Utama (Super Admin) yang berwenang mengatur dan mengganti password akun admin.');
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
    setPasswordChangeTarget(null);
  };

  const handleDelete = (targetAdmin: User) => {
    if (!isSuperAdmin) {
      alert('Akses Ditolak: Hanya Guru Utama (Super Admin) yang berwenang menghapus admin.');
      return;
    }
    if (targetAdmin.isSuperAdmin) {
      alert('Peringatan Keamanan: Akun Guru Utama / Super Admin tidak dapat dihapus.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akun admin "${targetAdmin.fullName}"?`)) {
      onDeleteAdmin(targetAdmin.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Otoritas & Keamanan Pengguna Guru</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Manajemen Akun Guru & Administrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hak istimewa penambahan admin, penghapusan admin, dan penggantian password hanya dimiliki secara eksklusif oleh Guru Utama (Super Admin).
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Admin Baru
          </button>
        )}
      </div>

      {/* Security Status Box */}
      {isSuperAdmin ? (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3 text-emerald-950">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-emerald-900 text-sm">
                Status Anda: Super Admin (Guru Utama)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                Akses Penuh Aktif
              </span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Anda memiliki wewenang eksklusif untuk <strong>menambahkan admin baru</strong>, <strong>mengganti password admin</strong>, dan <strong>menghapus akun admin lain</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3 text-amber-950">
          <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-amber-900 text-sm">
                Akses Dibatasi: Mode Admin Pengampu
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                Read-Only
              </span>
            </div>
            <p className="text-amber-900/90 leading-relaxed">
              Hanya <strong>Guru Utama (Super Admin)</strong> yang berhak menambahkan admin baru, menghapus akun admin, atau mengatur ulang kata sandi admin. Fitur administrasi akun dikunci untuk peran ini.
            </p>
          </div>
        </div>
      )}

      {/* Admin List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Daftar Akun Administrator Terdaftar</h2>
            <p className="text-xs text-slate-400">Total {adminUsers.length} pengguna dengan hak akses guru</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama Guru / Administrator</th>
                <th className="py-3 px-3">Tingkat Hak Akses</th>
                <th className="py-3 px-3">Username Login</th>
                <th className="py-3 px-3">Password Akun</th>
                <th className="py-3 px-3">Terdaftar Sejak</th>
                <th className="py-3 px-3 text-right">Otoritas & Tindakan</th>
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
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isThisSuperAdmin
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isThisSuperAdmin ? '★' : 'ADM'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{admin.fullName}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold">
                                Akun Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {admin.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {isThisSuperAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          <ShieldCheck className="w-3 h-3 text-purple-600" />
                          Guru Utama (Super Admin)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          <Shield className="w-3 h-3 text-slate-500" />
                          Admin Pengampu
                        </span>
                      )}
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
                            className="text-slate-400 hover:text-slate-700 p-0.5"
                            title={isPasswordShown ? 'Sembunyikan' : 'Lihat password'}
                          >
                            {isPasswordShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Terkunci (Hanya Super Admin)</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {admin.createdAt || '2026-01-01'}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isSuperAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPasswordModal(admin)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold flex items-center gap-1 transition-colors border border-indigo-200"
                            title="Ganti Password Akun Admin Ini"
                          >
                            <Key className="w-3 h-3" />
                            <span>Ganti Password</span>
                          </button>

                          {isThisSuperAdmin ? (
                            <span
                              className="px-2 py-1 text-[10px] text-slate-400 font-medium cursor-not-allowed"
                              title="Akun Guru Utama dilindungi dari penghapusan"
                            >
                              Dilindungi
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDelete(admin)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Admin Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end text-slate-400 gap-1 text-[11px]">
                          <Lock className="w-3 h-3" />
                          <span>Terkunci</span>
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

      {/* Switch Admin for Testing Security Requirement */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Uji verifikasi keamanan: Ganti akun login antar admin untuk menguji bahwa hanya Guru Utama (Super Admin) yang dapat mengelola admin:
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {adminUsers.map((a) => (
            <button
              key={a.id}
              onClick={() => onSwitchAdminUser(a)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                a.id === currentUser.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {a.isSuperAdmin ? '★ ' : ''}{a.username}
            </button>
          ))}
        </div>
      </div>

      {/* Modal: Tambah Admin Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Tambah Administrator Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddAdmin} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Guru / Admin
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Hendra Wijaya, S.Pd"
                  value={newFullName}
                  onChange={(e) => {
                    setNewFullName(e.target.value);
                    if (!newUsername) {
                      setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Username Login Admin
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
                  Password Masuk Awal
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

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900 leading-relaxed">
                Akun admin baru akan didaftarkan sebagai <strong>Admin Pengampu</strong>. Pengaturan hak kelola admin tetap dipegang oleh Anda (Guru Utama).
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-xs"
                >
                  Simpan Akun Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ganti Password Admin */}
      {passwordChangeTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Ganti Password Admin</h3>
              </div>
              <button
                onClick={() => setPasswordChangeTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
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
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Perbarui Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
