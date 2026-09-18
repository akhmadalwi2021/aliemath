import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  GraduationCap,
  Key,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  LogIn,
  AlertCircle,
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { User, CBTAttempt } from '../types';

interface StudentManagementProps {
  users: User[];
  attempts: CBTAttempt[];
  onAddStudent: (newStudent: Omit<User, 'id' | 'role' | 'createdAt'>) => void;
  onEditStudent: (student: User) => void;
  onDeleteStudent: (id: string) => void;
  onSwitchToStudent: (student: User) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  users,
  attempts,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onSwitchToStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formClass, setFormClass] = useState('X MIPA 1');
  const [formPassword, setFormPassword] = useState('123');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const students = users.filter((u) => u.role === 'student');

  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClass === 'Semua' || s.classGroup === selectedClass;
    const matchesQuery =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchQuery));
    return matchesClass && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormFullName('');
    setFormUsername('');
    setFormNisn('');
    setFormClass('X MIPA 1');
    setFormPassword('123');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (std: User) => {
    setEditingStudent(std);
    setFormFullName(std.fullName);
    setFormUsername(std.username);
    setFormNisn(std.nisn || '');
    setFormClass(std.classGroup || 'X MIPA 1');
    setFormPassword(std.password || '123');
    setFormStatus(std.status);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formUsername.trim()) return;

    if (editingStudent) {
      onEditStudent({
        ...editingStudent,
        fullName: formFullName,
        username: formUsername.toLowerCase().replace(/\s+/g, '.'),
        nisn: formNisn,
        classGroup: formClass,
        password: formPassword,
        status: formStatus,
      });
    } else {
      onAddStudent({
        fullName: formFullName,
        username: formUsername.toLowerCase().replace(/\s+/g, '.'),
        nisn: formNisn,
        classGroup: formClass,
        password: formPassword,
        status: formStatus,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Manajemen Akses & Registrasi Siswa</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Data Akun Siswa Terdaftar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Siswa hanya dapat login menggunakan akun resmi yang didaftarkan langsung oleh Administrator / Guru Aliemath.
          </p>
        </div>

        <button
          id="btn-register-student"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Registrasi Siswa Baru
        </button>
      </div>

      {/* Roster Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Total Siswa Terdaftar</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{students.length} Orang</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Memiliki kredensial akun</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Akun Aktif</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {students.filter((s) => s.status === 'active').length} Orang
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dapat login & ujian CBT</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Total Pengerjaan Ujian</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{attempts.length} Sesi</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Hasil ujian terekam</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Filter Kelas:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="Semua">Semua Kelas</option>
            <option value="X MIPA 1">X MIPA 1</option>
            <option value="XI MIPA 2">XI MIPA 2</option>
            <option value="XII MIPA 3">XII MIPA 3</option>
          </select>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, username, atau NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama Lengkap & NISN</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Username Login</th>
                <th className="py-3 px-3">Password Siswa</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Aktivitas CBT</th>
                <th className="py-3 px-3 text-right">Aksi Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std) => {
                const stdAttempts = attempts.filter((a) => a.studentId === std.id);
                return (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{std.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NISN: {std.nisn || '-'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {std.classGroup || 'Umum'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-blue-700">{std.username}</td>
                    <td className="py-3 px-3 font-mono text-slate-500 bg-slate-50/60 rounded">
                      {std.password || '******'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          std.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {std.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" /> Nonaktif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[11px] font-bold text-slate-700">
                        {stdAttempts.length} Tugas Dikerjakan
                      </div>
                      {stdAttempts.length > 0 && (
                        <div className="text-[10px] text-slate-400">
                          Rata-rata: {Math.round(stdAttempts.reduce((a, b) => a + b.score, 0) / stdAttempts.length)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSwitchToStudent(std)}
                          className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Uji Login Sebagai Siswa Ini"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Login Siswa</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(std)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit Akun"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus akun siswa "${std.fullName}"?`)) {
                              onDeleteStudent(std.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Data Akun Siswa' : 'Registrasi Akun Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizki Pratama"
                  value={formFullName}
                  onChange={(e) => {
                    setFormFullName(e.target.value);
                    if (!editingStudent && !formUsername) {
                      setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="rizki.pratama"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN (Nomor Induk)</label>
                  <input
                    type="text"
                    placeholder="0078912344"
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombel / Kelas</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="X MIPA 1">X MIPA 1</option>
                    <option value="X MIPA 2">X MIPA 2</option>
                    <option value="XI MIPA 1">XI MIPA 1</option>
                    <option value="XI MIPA 2">XI MIPA 2</option>
                    <option value="XII MIPA 1">XII MIPA 1</option>
                    <option value="XII MIPA 3">XII MIPA 3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password Masuk</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Keaktifan Akun</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="active">Aktif (Dapat Mengikuti CBT)</option>
                  <option value="inactive">Nonaktif (Akses Dikunci)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs"
                >
                  {editingStudent ? 'Simpan Data' : 'Registrasikan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
