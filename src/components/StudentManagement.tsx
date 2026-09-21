import React, { useState, useRef } from 'react';
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
  Upload,
  Clock,
  Calendar,
  Layers,
  Lock,
  Unlock,
  ShieldAlert,
  FileCheck,
  RefreshCw,
  HelpCircle,
  Check
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
  onBatchImportStudents?: (
    students: Omit<User, 'id' | 'role' | 'createdAt'>[],
    mode?: 'merge' | 'replace'
  ) => void;
}

interface ParsedStudentRow {
  fullName: string;
  username: string;
  password: string;
  classGroup: string;
  session: string;
  examTime: string;
  isValid: boolean;
  validationError?: string;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  users,
  attempts,
  cbtSessionLocks = [],
  onUnlockExamSession,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onBatchImportStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [selectedSession, setSelectedSession] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Form states (NISN removed)
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formClass, setFormClass] = useState('7A');
  const [formPassword, setFormPassword] = useState('123');
  const [formSession, setFormSession] = useState('Sesi 1');
  const [formExamTime, setFormExamTime] = useState('07:30 - 09:30 WIB');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // Upload & Template States
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [parsedStudents, setParsedStudents] = useState<ParsedStudentRow[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const students = users.filter((u) => u.role === 'student');

  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClass === 'Semua' || s.classGroup === selectedClass;
    const studentSesi = s.examSession || s.session || 'Sesi 1';
    const matchesSession = selectedSession === 'Semua' || studentSesi === selectedSession;
    const matchesQuery =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.classGroup && s.classGroup.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesClass && matchesSession && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormFullName('');
    setFormUsername('');
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
        fullName: formFullName.trim(),
        username: formUsername.toLowerCase().replace(/\s+/g, '.'),
        classGroup: formClass,
        session: formSession,
        examSession: formSession,
        examTime: formExamTime,
        password: formPassword,
        status: formStatus,
      });
    } else {
      onAddStudent({
        fullName: formFullName.trim(),
        username: formUsername.toLowerCase().replace(/\s+/g, '.'),
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

  // ---------------- Template Download (CSV / Excel Compatible) ----------------
  const handleDownloadTemplate = () => {
    const headers = ['Nama Lengkap', 'Username', 'Password', 'Kelas', 'Sesi', 'Jam Ujian'];
    const sampleRows = [
      ['Ahmad Fauzi Rahman', 'ahmad.fauzi', '123456', '7A', 'Sesi 1', '07:30 - 09:30 WIB'],
      ['Siti Nurhaliza Putri', 'siti.nurhaliza', '123456', '7A', 'Sesi 1', '07:30 - 09:30 WIB'],
      ['Budi Santoso', 'budi.santoso', '123456', '7B', 'Sesi 2', '10:00 - 12:00 WIB'],
      ['Dewi Lestari', 'dewi.lestari', '123456', '8A', 'Sesi 1', '07:30 - 09:30 WIB'],
      ['Rian Hidayat', 'rian.hidayat', '123456', '9A', 'Sesi 1', '07:30 - 09:30 WIB'],
    ];

    // Prepend UTF-8 BOM (\uFEFF) for Indonesian Excel compatibility
    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...sampleRows.map((row) =>
          row.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_akun_siswa_cbt_aliemath.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------------- CSV / Text File Parsing ----------------
  const parseCSVText = (text: string) => {
    setUploadError('');
    const lines = text
      .split(/\r\n|\n|\r/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setUploadError('File template kosong atau tidak berisi data.');
      setParsedStudents([]);
      return;
    }

    // Detect delimiter: comma, semicolon, or tab
    const firstLine = lines[0];
    let delimiter = ',';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;

    if (semiCount > commaCount && semiCount >= tabCount) {
      delimiter = ';';
    } else if (tabCount > commaCount && tabCount > semiCount) {
      delimiter = '\t';
    }

    const splitRow = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const firstRowCols = splitRow(lines[0]).map((c) => c.toLowerCase().replace(/["\r]/g, ''));
    const isHeaderRow =
      firstRowCols.some((c) => c.includes('nama') || c.includes('user') || c.includes('pass') || c.includes('kelas'));

    let startIndex = 0;
    let nameIdx = 0;
    let usernameIdx = 1;
    let passwordIdx = 2;
    let classIdx = 3;
    let sessionIdx = 4;
    let examTimeIdx = 5;

    if (isHeaderRow) {
      startIndex = 1;
      firstRowCols.forEach((col, idx) => {
        if (col.includes('nama')) nameIdx = idx;
        else if (col.includes('user')) usernameIdx = idx;
        else if (col.includes('pass') || col.includes('sandi') || col.includes('pin')) passwordIdx = idx;
        else if (col.includes('kelas') || col.includes('rombel')) classIdx = idx;
        else if (col.includes('sesi') || col.includes('session')) sessionIdx = idx;
        else if (col.includes('jam') || col.includes('waktu') || col.includes('time')) examTimeIdx = idx;
      });
    }

    const parsed: ParsedStudentRow[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = splitRow(lines[i]).map((c) => c.replace(/^["']|["']$/g, '').trim());
      if (cols.length === 0 || cols.every((c) => c === '')) continue;

      const rawFullName = cols[nameIdx] || '';
      let rawUsername = cols[usernameIdx] || '';
      const rawPassword = cols[passwordIdx] || '123456';
      const rawClass = cols[classIdx] || '7A';
      const rawSession = cols[sessionIdx] || 'Sesi 1';
      const rawExamTime = cols[examTimeIdx] || '07:30 - 09:30 WIB';

      // If username not provided, derive from full name
      if (!rawUsername && rawFullName) {
        rawUsername = rawFullName.toLowerCase().replace(/\s+/g, '.');
      }

      const isValid = Boolean(rawFullName.trim() && rawUsername.trim());
      let validationError = '';
      if (!rawFullName.trim()) {
        validationError = 'Nama siswa wajib diisi';
      } else if (!rawUsername.trim()) {
        validationError = 'Username wajib diisi';
      }

      parsed.push({
        fullName: rawFullName,
        username: rawUsername.toLowerCase().replace(/\s+/g, '.'),
        password: rawPassword,
        classGroup: rawClass,
        session: rawSession,
        examTime: rawExamTime,
        isValid,
        validationError,
      });
    }

    if (parsed.length === 0) {
      setUploadError('Tidak ada baris data siswa yang berhasil dibaca dari file ini.');
    }

    setParsedStudents(parsed);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFileName(file.name);
    setUploadError('');
    setSyncSuccessMessage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        parseCSVText(content);
      }
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file. Pastikan format file teks atau CSV valid.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleSyncToDatabase = () => {
    const validRows = parsedStudents.filter((s) => s.isValid);
    if (validRows.length === 0) {
      setUploadError('Tidak ada data siswa valid untuk disinkronkan.');
      return;
    }

    if (onBatchImportStudents) {
      const payload = validRows.map((r) => ({
        fullName: r.fullName,
        username: r.username,
        password: r.password,
        classGroup: r.classGroup,
        session: r.session,
        examSession: r.session,
        examTime: r.examTime,
        status: 'active' as const,
      }));

      onBatchImportStudents(payload, importMode);
      setSyncSuccessMessage(
        `Sukses! ${validRows.length} akun siswa berhasil disinkronkan ke database. Siswa kini dapat langsung menggunakan Username & Password tersebut untuk login ujian CBT!`
      );
      setParsedStudents([]);
      setUploadedFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setSyncSuccessMessage('');
      }, 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Manajemen Akun Siswa & Ujian CBT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Data Akun Siswa Terdaftar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Siswa hanya dapat login ke ujian CBT menggunakan akun resmi yang didaftarkan langsung oleh Guru / Admin. Unduh template atau upload file untuk sinkronisasi massal.
          </p>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            id="btn-download-student-template"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Unduh Template Excel/CSV untuk diisi akun siswa"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Unduh Template</span>
          </button>

          <button
            id="btn-upload-student-template"
            onClick={() => {
              setParsedStudents([]);
              setUploadError('');
              setSyncSuccessMessage('');
              setUploadedFileName('');
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="Upload file template untuk sinkronisasi ke database"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Template</span>
          </button>

          <button
            id="btn-register-student"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrasi Siswa</span>
          </button>
        </div>
      </div>

      {/* Roster Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Total Siswa Terdaftar</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{students.length} Orang</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Memiliki kredensial akun CBT</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Akun Aktif</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {students.filter((s) => s.status === 'active').length} Orang
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dapat login & ulangan CBT</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Total Pengerjaan Ujian</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{attempts.length} Sesi</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Hasil pengerjaan tersimpan</div>
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

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, username, atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada data siswa ditemukan. Silakan tambahkan atau upload template siswa.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
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
                      <td className="py-3 px-3 font-mono text-slate-600 bg-slate-50/80 rounded px-2">
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
                                if (
                                  confirm(
                                    `Buka blokir ujian CBT untuk "${std.fullName}"? Siswa akan dapat melanjutkan kembali dengan jawaban asal yang tetap tersimpan.`
                                  )
                                ) {
                                  onUnlockExamSession(activeStudentLock.id);
                                }
                              }}
                              className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors animate-pulse cursor-pointer"
                              title="Buka Blokir / Izinkan Siswa Lanjutkan Ujian CBT"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Buka CBT</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(std)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
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
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- Upload Template Modal ---------------- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Upload & Sinkronisasi Template Akun Siswa
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Import daftar siswa beserta username & password untuk ujian CBT secara otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction banner */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Format Kolom Template:
                </span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Format Template Di Sini
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                File CSV/Excel harus memiliki kolom: <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono text-[10px] text-slate-800">Nama Lengkap, Username, Password, Kelas, Sesi, Jam Ujian</code>.
                Username dan Password ini akan langsung aktif di database untuk digunakan siswa saat membuka ujian CBT.
              </p>
            </div>

            {/* Success message banner */}
            {syncSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[11px] font-semibold leading-relaxed">{syncSuccessMessage}</span>
              </div>
            )}

            {/* Error message banner */}
            {uploadError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{uploadError}</span>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .txt, text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">
                {uploadedFileName ? uploadedFileName : 'Klik atau seret file CSV template ke sini'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Mendukung file .CSV (pemisah koma atau titik-koma dari Excel)
              </p>
            </div>

            {/* Parsed Preview Table */}
            {parsedStudents.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Pratinjau Data Siswa:</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {parsedStudents.filter((s) => s.isValid).length} Baris Siap Disinkronkan
                    </span>
                  </div>

                  {/* Mode Import Option */}
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 text-[11px] font-medium">Gabung / Perbarui</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 text-[11px] font-medium">Ganti Seluruh Data</span>
                    </label>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 sticky top-0 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">No</th>
                        <th className="py-2 px-3">Nama Lengkap</th>
                        <th className="py-2 px-3">Username CBT</th>
                        <th className="py-2 px-3">Password</th>
                        <th className="py-2 px-3">Kelas</th>
                        <th className="py-2 px-3">Sesi</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {parsedStudents.map((row, idx) => (
                        <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/60'}>
                          <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{row.fullName || '-'}</td>
                          <td className="py-2 px-3 font-mono text-blue-700">{row.username || '-'}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{row.password || '-'}</td>
                          <td className="py-2 px-3">{row.classGroup}</td>
                          <td className="py-2 px-3">{row.session}</td>
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold">
                                <Check className="w-3 h-3 text-emerald-600" /> Siap
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-700 font-bold">
                                <X className="w-3 h-3 text-rose-600" /> {row.validationError}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={parsedStudents.filter((s) => s.isValid).length === 0}
                onClick={handleSyncToDatabase}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sinkronkan ke Database Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Register/Edit Single Student Modal (NISN Removed) ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Data Akun & Jadwal Siswa' : 'Registrasi Akun Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
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
                  <label className="block font-semibold text-slate-700 mb-1">Username Login CBT</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Rombel / Kelas</label>
                <select
                  value={formClass}
                  onChange={(e) => setFormClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="7A">7A</option>
                  <option value="7B">7B</option>
                  <option value="8A">8A</option>
                  <option value="8B">8B</option>
                  <option value="9A">9A</option>
                  <option value="9B">9B</option>
                </select>
              </div>

              {/* Pengaturan Sesi & Jam Pelaksanaan Ujian CBT */}
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
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['07:30 - 09:30 WIB', '10:00 - 12:00 WIB', '13:00 - 15:00 WIB'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormExamTime(preset)}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors cursor-pointer"
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
                  onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
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
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
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
