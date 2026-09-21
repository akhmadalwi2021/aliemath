import React, { useRef, useState } from 'react';
import {
  Printer,
  X,
  Download,
  FileText,
  Award,
  Calendar,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronDown
} from 'lucide-react';
import { CBTExam, CBTAttempt, User } from '../types';

export type CBTPrintType = 'exam_recap' | 'class_leger' | 'student_transcript';

interface CBTPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  printType: CBTPrintType;
  exam?: CBTExam | null;
  targetClass?: string;
  exams: CBTExam[];
  attempts: CBTAttempt[];
  students: User[];
  selectedStudent?: User | null;
  teacherName?: string;
}

export const CBTPrintModal: React.FC<CBTPrintModalProps> = ({
  isOpen,
  onClose,
  printType: initialPrintType,
  exam,
  targetClass = 'Semua',
  exams,
  attempts,
  students,
  selectedStudent: initialStudent,
  teacherName = 'Bpk. Akhmad Alwi, S.Pd',
}) => {
  const [activePrintType, setActivePrintType] = useState<CBTPrintType>(initialPrintType);
  const [selectedExamId, setSelectedExamId] = useState<string>(exam?.id || (exams[0]?.id || ''));
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(targetClass);
  const [currentStudentId, setCurrentStudentId] = useState<string>(
    initialStudent?.id || (students.find((s) => s.role === 'student')?.id || '')
  );

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentExam = exams.find((e) => e.id === selectedExamId) || exam || exams[0];
  const activeStudent = students.find((s) => s.id === currentStudentId) || initialStudent;

  // Grade/Class options helper
  const availableClasses = Array.from(
    new Set(students.filter((s) => s.role === 'student' && s.classGroup).map((s) => s.classGroup as string))
  ).sort();

  // Filter students based on selectedClassFilter
  const filteredStudents = students.filter((s) => {
    if (s.role !== 'student') return false;
    if (selectedClassFilter === 'Semua') return true;
    if (selectedClassFilter === 'Kelas 7') return s.classGroup?.startsWith('7');
    if (selectedClassFilter === 'Kelas 8') return s.classGroup?.startsWith('8');
    if (selectedClassFilter === 'Kelas 9') return s.classGroup?.startsWith('9');
    return s.classGroup === selectedClassFilter;
  });

  // Handle browser print
  const handlePrint = () => {
    window.print();
  };

  // Helper date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // -------------------------------------------------------------
  // DATA PREPARATION: 1. REKAP NILAI PER UJIAN (Terpisah per ujian)
  // -------------------------------------------------------------
  const examAttempts = currentExam
    ? attempts.filter((att) => att.examId === currentExam.id)
    : [];

  // Group attempts with students (so registered students who haven't taken it can also be listed or filtered)
  const examRows = filteredStudents.map((std) => {
    const att = examAttempts.find((a) => a.studentId === std.id);
    return {
      student: std,
      attempt: att || null,
      score: att ? att.score : null,
      isPassed: att ? att.isPassed : false,
      completedAt: att ? att.completedAt : null,
      correctCount: att ? att.correctCount : null,
      totalQuestions: att ? att.totalQuestions : currentExam?.questions.length || 0,
    };
  });

  // Calculate statistics for current exam
  const submittedRows = examRows.filter((r) => r.score !== null);
  const examScores = submittedRows.map((r) => r.score as number);
  const examAverage = examScores.length > 0
    ? Number((examScores.reduce((a, b) => a + b, 0) / examScores.length).toFixed(1))
    : 0;
  const examMaxScore = examScores.length > 0 ? Math.max(...examScores) : 0;
  const examMinScore = examScores.length > 0 ? Math.min(...examScores) : 0;
  const passedCount = submittedRows.filter((r) => r.isPassed).length;
  const passingRate = submittedRows.length > 0
    ? Math.round((passedCount / submittedRows.length) * 100)
    : 0;

  // -------------------------------------------------------------
  // DATA PREPARATION: 2. LEGER NILAI KESELURUHAN (Seluruh Ulangan Kelas)
  // -------------------------------------------------------------
  // Filter relevant exams by class group if applicable
  const relevantExams = exams.filter((ex) => {
    if (selectedClassFilter === 'Kelas 7' || selectedClassFilter.startsWith('7')) {
      return ex.gradeLevel === 'Kelas 7' || ex.gradeLevel === 'Semua Kelas';
    }
    if (selectedClassFilter === 'Kelas 8' || selectedClassFilter.startsWith('8')) {
      return ex.gradeLevel === 'Kelas 8' || ex.gradeLevel === 'Semua Kelas';
    }
    if (selectedClassFilter === 'Kelas 9' || selectedClassFilter.startsWith('9')) {
      return ex.gradeLevel === 'Kelas 9' || ex.gradeLevel === 'Semua Kelas';
    }
    return true;
  });

  const legerRows = filteredStudents.map((std) => {
    const studentAttempts = attempts.filter((a) => a.studentId === std.id);
    const examScoresMap: Record<string, number | null> = {};
    let totalScore = 0;
    let countTaken = 0;

    relevantExams.forEach((ex) => {
      const att = studentAttempts.find((a) => a.examId === ex.id);
      if (att) {
        examScoresMap[ex.id] = att.score;
        totalScore += att.score;
        countTaken += 1;
      } else {
        examScoresMap[ex.id] = null;
      }
    });

    const average = countTaken > 0 ? Number((totalScore / countTaken).toFixed(1)) : 0;

    let gradePredicate = '-';
    if (countTaken > 0) {
      if (average >= 90) gradePredicate = 'A (Sangat Baik)';
      else if (average >= 80) gradePredicate = 'B (Baik)';
      else if (average >= 70) gradePredicate = 'C (Cukup)';
      else gradePredicate = 'D (Perlu Bimbingan)';
    }

    return {
      student: std,
      examScoresMap,
      countTaken,
      totalScore,
      average,
      gradePredicate,
    };
  });

  // Calculate column averages for each exam in leger
  const examAveragesLeger: Record<string, number> = {};
  relevantExams.forEach((ex) => {
    const scores = legerRows
      .map((r) => r.examScoresMap[ex.id])
      .filter((s): s is number => s !== null);
    examAveragesLeger[ex.id] = scores.length > 0
      ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : 0;
  });

  const allLegerAverages = legerRows
    .filter((r) => r.countTaken > 0)
    .map((r) => r.average);
  const overallLegerAverage = allLegerAverages.length > 0
    ? Number((allLegerAverages.reduce((a, b) => a + b, 0) / allLegerAverages.length).toFixed(1))
    : 0;

  // -------------------------------------------------------------
  // DATA PREPARATION: 3. TRANSKRIP NILAI INDIVIDUAL PER SISWA
  // -------------------------------------------------------------
  const studentAllAttempts = activeStudent
    ? attempts.filter((att) => att.studentId === activeStudent.id)
    : [];

  const studentTotalScore = studentAllAttempts.reduce((acc, a) => acc + a.score, 0);
  const studentAverage = studentAllAttempts.length > 0
    ? Number((studentTotalScore / studentAllAttempts.length).toFixed(1))
    : 0;
  const studentHighest = studentAllAttempts.length > 0
    ? Math.max(...studentAllAttempts.map((a) => a.score))
    : 0;
  const studentLowest = studentAllAttempts.length > 0
    ? Math.min(...studentAllAttempts.map((a) => a.score))
    : 0;

  let studentPredicate = 'Belum Ada Penilaian';
  if (studentAllAttempts.length > 0) {
    if (studentAverage >= 90) studentPredicate = 'A (Istimewa / Sangat Memuaskan)';
    else if (studentAverage >= 80) studentPredicate = 'B (Baik / Memuaskan)';
    else if (studentAverage >= 70) studentPredicate = 'C (Cukup / Tuntas)';
    else studentPredicate = 'D (Perlu Bimbingan / Remedial)';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Container Dialog */}
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Top Controls Toolbar (Hidden when printing via CSS @media print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Format Cetak Rekapitulasi & Transkrip Nilai</h2>
              <p className="text-xs text-slate-500">
                Tampilan format resmi siap cetak / simpan sebagai dokumen PDF A4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              id="btn-trigger-print"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-600/20 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              title="Tutup Modal Cetak"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Configuration Bar (Hidden when printing) */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 print:hidden text-xs">
          {/* Print Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActivePrintType('exam_recap')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activePrintType === 'exam_recap'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Rekap Per Ujian (Terpisah)
            </button>
            <button
              onClick={() => setActivePrintType('class_leger')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activePrintType === 'class_leger'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Leger Nilai Keseluruhan Kelas
            </button>
            <button
              onClick={() => setActivePrintType('student_transcript')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activePrintType === 'student_transcript'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Transkrip Nilai Per Siswa
            </button>
          </div>

          {/* Contextual Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {activePrintType === 'exam_recap' && (
              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-700 whitespace-nowrap">Paket Ujian:</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 max-w-[220px] truncate"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      [{ex.gradeLevel}] {ex.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activePrintType !== 'student_transcript' && (
              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-700 whitespace-nowrap">Kelompok Kelas:</label>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="Semua">Semua Siswa</option>
                  <optgroup label="Tingkat Kelas">
                    <option value="Kelas 7">Tingkat Kelas 7 (Semua)</option>
                    <option value="Kelas 8">Tingkat Kelas 8 (Semua)</option>
                    <option value="Kelas 9">Tingkat Kelas 9 (Semua)</option>
                  </optgroup>
                  <optgroup label="Rombel Spesifik">
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Kelas {cls}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            {activePrintType === 'student_transcript' && (
              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-700 whitespace-nowrap">Pilih Siswa:</label>
                <select
                  value={currentStudentId}
                  onChange={(e) => setCurrentStudentId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 max-w-[240px] truncate"
                >
                  {students
                    .filter((s) => s.role === 'student')
                    .map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.fullName} ({std.classGroup || 'Umum'})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Printable Paper Area (Styled as clean official school document) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 print:p-0 print:bg-white">
          <div
            ref={printAreaRef}
            id="cbt-printable-sheet"
            className="max-w-4xl mx-auto bg-white p-8 sm:p-10 shadow-md print:shadow-none print:p-6 print:max-w-none border border-slate-200 print:border-none rounded-xl print:rounded-none text-slate-900"
          >
            {/* ============================================================== */}
            {/* OFFICIAL KOP SURAT / SCHOOL HEADER                             */}
            {/* ============================================================== */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-black shrink-0 print:border print:border-slate-900">
                  <span className="text-xl tracking-tighter">CBT</span>
                  <span className="text-[9px] uppercase tracking-widest text-slate-300">MATH</span>
                </div>
                <div className="text-center flex-1">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-600">
                    Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
                  </h3>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
                    PORTAL EVALUASI & CBT MANDIRI ALIEMATH.MY.ID
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Platform Pembelajaran & Computer Based Test Terintegrasi • Domain: www.aliemath.my.id
                  </p>
                </div>
                <div className="w-16 h-16 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center p-1 shrink-0">
                  <span className="text-[9px] font-bold text-slate-400">TAHUN</span>
                  <span className="text-xs font-black text-slate-800">2026</span>
                  <span className="text-[8px] text-slate-500">KURIKULUM</span>
                </div>
              </div>
              <div className="h-0.5 bg-slate-900 mt-3" />
            </div>

            {/* ============================================================== */}
            {/* MODE 1: REKAPITULASI NILAI PER UJIAN (TERPISAH PER UJIAN)      */}
            {/* ============================================================== */}
            {activePrintType === 'exam_recap' && currentExam && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-base sm:text-lg font-black uppercase text-slate-950 underline underline-offset-4">
                    DAFTAR REKAPITULASI NILAI UJIAN / EVALUASI CBT
                  </h2>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">
                    (Form Rekapitulasi Nilai Resmi Per Butir Paket Ujian)
                  </div>
                </div>

                {/* Exam Meta Info Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs mb-6 print:bg-white print:border-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Mata Pelajaran</span>
                    <strong className="text-slate-900">{currentExam.subject || 'Matematika'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Paket Ujian</span>
                    <strong className="text-slate-900">{currentExam.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Kelompok / Tingkat</span>
                    <strong className="text-slate-900">
                      {selectedClassFilter === 'Semua' ? currentExam.gradeLevel : selectedClassFilter}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Standar KKM</span>
                    <strong className="text-emerald-700 font-black">{currentExam.passingScore} Poin</strong>
                  </div>
                </div>

                {/* Score Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-300 print:border-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 print:bg-slate-200">
                        <th className="py-2.5 px-3 border-r border-slate-300 w-10 text-center">No.</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-28">NISN / User</th>
                        <th className="py-2.5 px-4 border-r border-slate-300">Nama Siswa</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-20 text-center">Kelas</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-24 text-center">Benar / Soal</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-24 text-center font-black">
                          Nilai Siswa
                        </th>
                        <th className="py-2.5 px-3 text-center w-24 font-bold">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {examRows.map((row, idx) => (
                        <tr
                          key={row.student.id}
                          className={idx % 2 === 1 ? 'bg-slate-50/50 print:bg-slate-100/40' : ''}
                        >
                          <td className="py-2 px-3 border-r border-slate-200 text-center font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px]">
                            {row.student.nisn || row.student.username}
                          </td>
                          <td className="py-2 px-4 border-r border-slate-200 font-bold text-slate-900">
                            {row.student.fullName}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold">
                            {row.student.classGroup || '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center text-slate-600">
                            {row.score !== null ? `${row.correctCount}/${row.totalQuestions}` : '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center font-black text-sm text-slate-900">
                            {row.score !== null ? (
                              <span className={row.isPassed ? 'text-slate-950' : 'text-rose-700 font-black'}>
                                {row.score}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal italic text-[10px]">Belum Ujian</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {row.score !== null ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  row.isPassed
                                    ? 'text-emerald-800 bg-emerald-50 print:bg-transparent print:text-slate-900'
                                    : 'text-rose-800 bg-rose-50 print:bg-transparent print:text-rose-900 font-black'
                                }`}
                              >
                                {row.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {examRows.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                            Tidak ada data siswa untuk kelompok kelas yang dipilih.
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* Bottom Summary Table Row */}
                    <tfoot>
                      <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-400 text-slate-900 print:bg-slate-200">
                        <td colSpan={5} className="py-3 px-4 text-right uppercase text-xs">
                          Rata-Rata Nilai Kelas:
                        </td>
                        <td className="py-3 px-3 text-center text-base font-black text-blue-900 border-r border-slate-300">
                          {examAverage}
                        </td>
                        <td className="py-3 px-3 text-center text-[10px] text-slate-600 font-semibold">
                          Skala 0 - 100
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bottom Statistics Summary */}
                <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs print:bg-white print:border-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Siswa Terdaftar</span>
                    <strong className="text-slate-900 text-sm">{examRows.length} Siswa</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Siswa Sudah Mengerjakan</span>
                    <strong className="text-slate-900 text-sm">
                      {submittedRows.length} Siswa ({examRows.length > 0 ? Math.round((submittedRows.length / examRows.length) * 100) : 0}%)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Nilai Tertinggi / Terendah</span>
                    <strong className="text-slate-900 text-sm">{examMaxScore} / {examMinScore}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Ketuntasan Belajar</span>
                    <strong className="text-emerald-700 text-sm font-black">
                      {passedCount} Tuntas ({passingRate}%)
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* MODE 2: LEGER NILAI KESELURUHAN KELAS (SELURUH ULANGAN/UJIAN)  */}
            {/* ============================================================== */}
            {activePrintType === 'class_leger' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-base sm:text-lg font-black uppercase text-slate-950 underline underline-offset-4">
                    BUKU LEGER REKAPITULASI NILAI KESELURUHAN ULANGAN CBT
                  </h2>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">
                    Kelompok / Tingkat: <strong className="text-slate-900">{selectedClassFilter}</strong> • Tahun Pelajaran 2026/2027
                  </div>
                </div>

                {/* Table Leger */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-300 print:border-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 print:bg-slate-200">
                        <th className="py-2 px-2 border-r border-slate-300 w-8 text-center text-[10px]">No.</th>
                        <th className="py-2 px-3 border-r border-slate-300 w-24">NISN</th>
                        <th className="py-2 px-3 border-r border-slate-300 min-w-[140px]">Nama Siswa</th>
                        <th className="py-2 px-2 border-r border-slate-300 w-14 text-center">Kelas</th>
                        {relevantExams.map((ex, exIdx) => (
                          <th
                            key={ex.id}
                            className="py-2 px-2 border-r border-slate-300 text-center w-16 text-[10px]"
                            title={ex.title}
                          >
                            <span className="block font-black text-slate-900">U{exIdx + 1}</span>
                            <span className="text-[9px] text-slate-500 font-normal">KKM {ex.passingScore}</span>
                          </th>
                        ))}
                        <th className="py-2 px-3 border-r border-slate-300 text-center w-20 font-black bg-blue-50/60 print:bg-slate-200">
                          Rata-Rata
                        </th>
                        <th className="py-2 px-2 text-center w-24 font-bold text-[10px]">Predikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {legerRows.map((row, idx) => (
                        <tr
                          key={row.student.id}
                          className={idx % 2 === 1 ? 'bg-slate-50/50 print:bg-slate-100/40' : ''}
                        >
                          <td className="py-2 px-2 border-r border-slate-200 text-center font-medium text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono text-[10px]">
                            {row.student.nisn || '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                            {row.student.fullName}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 text-center font-semibold">
                            {row.student.classGroup || '-'}
                          </td>
                          {relevantExams.map((ex) => {
                            const val = row.examScoresMap[ex.id];
                            const isPassing = val !== null && val >= ex.passingScore;
                            return (
                              <td
                                key={ex.id}
                                className="py-2 px-2 border-r border-slate-200 text-center font-semibold text-xs"
                              >
                                {val !== null ? (
                                  <span className={isPassing ? 'text-slate-900' : 'text-rose-700 font-bold'}>
                                    {val}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 text-[10px]">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-2 px-3 border-r border-slate-200 text-center font-black text-sm text-blue-900 bg-blue-50/30 print:bg-transparent">
                            {row.countTaken > 0 ? row.average : '-'}
                          </td>
                          <td className="py-2 px-2 text-center text-[10px] font-bold text-slate-700">
                            {row.gradePredicate}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* Footer Row: Rata-Rata Tiap Ulangan & Keseluruhan */}
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900 print:bg-slate-200">
                        <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[11px]">
                          Rata-Rata Per Ulangan:
                        </td>
                        {relevantExams.map((ex) => (
                          <td
                            key={ex.id}
                            className="py-2.5 px-2 text-center text-xs font-black text-slate-900 border-r border-slate-300"
                          >
                            {examAveragesLeger[ex.id] || 0}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-center text-sm font-black text-blue-950 border-r border-slate-300 bg-blue-100/60 print:bg-slate-300">
                          {overallLegerAverage}
                        </td>
                        <td className="py-2.5 px-2 text-center text-[9px] text-slate-600">
                          Rata-Rata Total
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Exam Title Legend */}
                <div className="mt-4 p-3 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-600 print:bg-white">
                  <div className="font-bold text-slate-800 mb-1">Keterangan Kolom Paket Ulangan:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {relevantExams.map((ex, idx) => (
                      <div key={ex.id} className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 font-bold text-slate-800 text-[10px]">
                          U{idx + 1}
                        </span>
                        <span className="truncate">{ex.title} (KKM: {ex.passingScore})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* MODE 3: TRANSKRIP NILAI INDIVIDUAL PER SISWA                   */}
            {/* ============================================================== */}
            {activePrintType === 'student_transcript' && activeStudent && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-base sm:text-lg font-black uppercase text-slate-950 underline underline-offset-4">
                    TRANSKRIP HASIL EVALUASI & ULANGAN CBT SISWA
                  </h2>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">
                    Lembar Catatan Capaian Belajar Matematika Siswa
                  </div>
                </div>

                {/* Student Identity Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6 print:bg-white print:border-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Nama Lengkap Siswa</span>
                    <strong className="text-slate-900 text-sm">{activeStudent.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">NISN / No. Induk</span>
                    <strong className="text-slate-900 font-mono text-sm">{activeStudent.nisn || activeStudent.username}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Kelas / Sesi</span>
                    <strong className="text-slate-900 text-sm">
                      {activeStudent.classGroup || 'Umum'} • {activeStudent.session || 'Sesi 1'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Tahun Pelajaran</span>
                    <strong className="text-slate-900 text-sm">2026/2027</strong>
                  </div>
                </div>

                {/* Table of all attempts for this student */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-300 print:border-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 print:bg-slate-200">
                        <th className="py-2.5 px-3 border-r border-slate-300 w-10 text-center">No.</th>
                        <th className="py-2.5 px-4 border-r border-slate-300">Nama Paket Ulangan / Ujian CBT</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-28 text-center">Tanggal Pengerjaan</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-20 text-center">Standar KKM</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-24 text-center">Benar / Soal</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-24 text-center font-black">
                          Nilai Ulangan
                        </th>
                        <th className="py-2.5 px-3 text-center w-24 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {studentAllAttempts.map((att, idx) => {
                        const targetEx = exams.find((e) => e.id === att.examId);
                        const kkm = targetEx?.passingScore || 75;
                        return (
                          <tr
                            key={att.id}
                            className={idx % 2 === 1 ? 'bg-slate-50/50 print:bg-slate-100/40' : ''}
                          >
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-4 border-r border-slate-200 font-bold text-slate-900">
                              {att.examTitle}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-600 text-[11px]">
                              {formatDate(att.completedAt)}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-semibold text-slate-700">
                              {kkm}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-600">
                              {att.correctCount}/{att.totalQuestions}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-black text-sm text-slate-900">
                              <span className={att.isPassed ? 'text-slate-900' : 'text-rose-700 font-black'}>
                                {att.score}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  att.isPassed
                                    ? 'text-emerald-800 bg-emerald-50 print:bg-transparent print:text-slate-900'
                                    : 'text-rose-800 bg-rose-50 print:bg-transparent print:text-rose-900'
                                }`}
                              >
                                {att.isPassed ? 'LULUS' : 'REMEDIAL'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {studentAllAttempts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                            Siswa ini belum memiliki riwayat pengerjaan tugas atau ulangan CBT.
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* Footer Row: Rata-Rata Transkrip Siswa */}
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900 print:bg-slate-200">
                        <td colSpan={5} className="py-3 px-4 text-right uppercase text-xs">
                          Rata-Rata Nilai Keseluruhan Ulangan:
                        </td>
                        <td className="py-3 px-3 text-center text-base font-black text-blue-950 border-r border-slate-300">
                          {studentAverage}
                        </td>
                        <td className="py-3 px-3 text-center text-[10px] text-slate-600 font-semibold">
                          Skala 0 - 100
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Transkrip Summary Stats */}
                <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs print:bg-white print:border-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Ulangan Diikuti</span>
                    <strong className="text-slate-900 text-sm">{studentAllAttempts.length} Paket Soal</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Nilai Tertinggi / Terendah</span>
                    <strong className="text-slate-900 text-sm">{studentHighest} / {studentLowest}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Rata-Rata Akhir</span>
                    <strong className="text-blue-900 text-sm font-black">{studentAverage}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Predikat Kelulusan</span>
                    <strong className="text-emerald-800 text-xs font-black">{studentPredicate}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* SIGNATURE SECTION (TANDA TANGAN RESMI PENGESAHAN DOKUMEN)      */}
            {/* ============================================================== */}
            <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-800 print:mt-8">
              <div className="flex items-start justify-between">
                <div className="text-center w-56">
                  <p className="text-slate-500 text-[11px]">Mengetahui,</p>
                  <p className="font-bold text-slate-900 mt-0.5">Kepala Sekolah</p>
                  <div className="h-16 sm:h-20" />
                  <p className="font-bold underline text-slate-900">Drs. H. Mulyadi, M.Pd</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. 19740512 199903 1 004</p>
                </div>

                <div className="text-center w-56">
                  <p className="text-slate-500 text-[11px]">
                    Ditetapkan di Tempat, {formatDate()}
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    Guru Pengampu / Pengawas CBT
                  </p>
                  <div className="h-16 sm:h-20" />
                  <p className="font-bold underline text-slate-900">{teacherName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. 19850314 201101 1 008</p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <span>Dokumen dicetak secara otomatis dari Sistem CBT Aliemath.my.id</span>
                <span>Halaman 1 dari 1 • Sah & Terverifikasi Sistem</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
