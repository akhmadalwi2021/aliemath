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
  Download,
  Clock,
  Calendar,
  Layers,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import { User, CBTAttempt, CBTSessionLock } from '../types';

interface StudentManagementProps {
  users: User[];
  attempts: CBTAttempt[];
  cbtSessionLocks?: CBTSessionLock[];
  onUnlockExamSession?: (sessionId: string) => void;
  onAddStudent: (newStudent: Omit<User, 'id' | 'role' | 'createdAt'>) => void;
  onEditStudent: (student: User) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  users,
  attempts,
  cbtSessionLocks = [],
  onUnlockExamSession,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [selectedSession, setSelectedSession] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formClass, setFormClass] = useState('7A');
  const [formPassword, setFormPassword] = useState('123');
  const [formSession, setFormSession] = useState('Sesi 1');
  const [formExamTime, setFormExamTime] = useState('07:30 - 09:30 WIB');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const students = users.filter((u) => u.role === 'student');

  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClass === 'Semua' || s.classGroup === selectedClass;
    const studentSesi = s.examSession || s.session || 'Sesi 1';
    const matchesSession = selectedSession === 'Semua' || studentSesi === selectedSession;
    const matchesQuery =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchQuery));
    return matchesClass && matchesSession && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormFullName('');
    setFormUsername('');
    setFormNisn('');
    setFormClass('7A');
    setFormPassword('123');
    setFormSession('Sesi 1');
    setFormExamTime('07:30 - 09:30 WIB');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (std: User) => {
    setEditingStudent(std);
    setFormFullName(std.fullName);
    setFormUsername(std.username);
    setFormNisn(std.nisn || '');
    setFormClass(std.classGroup || '7A');
    setFormPassword(std.password || '123');
    setFormSession(std.examSession || std.session || 'Sesi 1');
    setFormExamTime(std.examTime || '07:30 - 09:30 WIB');
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
        session: formSession,
        examSession: formSession,
        examTime: formExamTime,
        password: formPassword,
        status: formStatus,
      });
    } else {
      onAddStudent({
        fullName: formFullName,
        username: formUsername.toLowerCase().replace(/\s+/g, '.'),
        nisn: formNisn,
        classGroup: formClass,
        session: formSession,
        examSession: formSession,
        examTime: formExamTime,
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-slate-700">Kelas:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="Semua">Semua Kelas</option>
              <option value="7A">7A</option>
              <option value="7B">7B</option>
              <option value="8A">8A</option>
              <option value="8B">8B</option>
              <option value="9A">9A</option>
              <option value="9B">9B</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-slate-700">Sesi:</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="Semua">Semua Sesi</option>
              <option value="Sesi 1">Sesi 1</option>
              <option value="Sesi 2">Sesi 2</option>
              <option value="Sesi 3">Sesi 3</option>
              <option value="Sesi Susulan">Sesi Susulan</option>
            </select>
          </div>
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
                <th className="py-3 px-3">Sesi & Jam Ujian</th>
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
                const stdSesi = std.examSession || std.session || 'Sesi 1';
                const stdJam = std.examTime || '07:30 - 09:30 WIB';
                const activeStudentLock = cbtSessionLocks.find(
                  (l) => l.studentId === std.id && l.isLocked
                );

                return (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{std.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NISN: {std.nisn || '-'}</div>
                      {activeStudentLock && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Layar CBT Terblokir</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {std.classGroup || 'Umum'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 w-fit">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          {stdSesi}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          {stdJam}
                        </span>
                      </div>
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
                        {activeStudentLock && onUnlockExamSession && (
                          <button
                            onClick={() => {
                              if (confirm(`Buka blokir ujian CBT untuk "${std.fullName}"? Siswa akan dapat melanjutkan kembali dengan jawaban asal yang tetap tersimpan.`)) {
                                onUnlockExamSession(activeStudentLock.id);
                              }
                            }}
                            className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors animate-pulse"
                            title="Buka Blokir / Izinkan Siswa Lanjutkan Ujian CBT"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Buka CBT</span>
                          </button>
                        )}
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Data Akun & Jadwal Siswa' : 'Registrasi Akun Siswa Baru'}
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
                    <option value="7A">7A</option>
                    <option value="7B">7B</option>
                    <option value="8A">8A</option>
                    <option value="8B">8B</option>
                    <option value="9A">9A</option>
                    <option value="9B">9B</option>
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

              {/* Form Pengaturan Sesi & Jam Pelaksanaan Ujian (Req 4) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Pengaturan Sesi & Jam Pelaksanaan CBT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pilihan Sesi CBT
                    </label>
                    <div className="space-y-1.5">
                      <select
                        value={formSession}
                        onChange={(e) => setFormSession(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="Sesi 1">Sesi 1 (Pagi)</option>
                        <option value="Sesi 2">Sesi 2 (Siang)</option>
                        <option value="Sesi 3">Sesi 3 (Sore)</option>
                        <option value="Sesi Susulan">Sesi Susulan / Remedial</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Atau ketik nama sesi khusus..."
                        value={formSession}
                        onChange={(e) => setFormSession(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Jam Pelaksanaan Ujian
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 07:30 - 09:30 WIB"
                      value={formExamTime}
                      onChange={(e) => setFormExamTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                    {/* Presets */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['07:30 - 09:30 WIB', '10:00 - 12:00 WIB', '13:00 - 15:00 WIB'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormExamTime(preset)}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
                        >
                          {preset.replace(' WIB', '')}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  {editingStudent ? 'Simpan Perubahan' : 'Registrasikan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
