import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  Award,
  BookOpen,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Search,
  ChevronRight,
  Filter,
  Calendar,
  ListOrdered,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  HelpCircle,
  Check,
  X,
  PlusCircle,
  Eye,
  CheckSquare,
  Layers,
  Lock,
  Unlock,
  ShieldAlert,
  AlertOctagon,
  RefreshCw,
  Info,
  GraduationCap,
  Printer,
  Save,
  Sparkles
} from 'lucide-react';
import { CBTExam, CBTAttempt, CBTQuestion, CBTQuestionType, ComplexStatement, CBTSessionLock, User, UserRole } from '../types';
import { CBTStudentLoginModal } from './CBTStudentLoginModal';
import { CBTPrintModal, CBTPrintType } from './CBTPrintModal';

interface CBTSectionProps {
  exams: CBTExam[];
  attempts: CBTAttempt[];
  cbtSessionLocks?: CBTSessionLock[];
  currentUser: User;
  allUsers?: User[];
  cbtStudent?: User | null;
  onCbtStudentLogin?: (student: User, exam: CBTExam) => void;
  onCbtStudentLogout?: () => void;
  onStartExam: (exam: CBTExam, student?: User) => void;
  onAddExam: (newExam: Omit<CBTExam, 'id'>) => void;
  onEditExam: (exam: CBTExam) => void;
  onDeleteExam: (id: string) => void;
  onUpdateQuestions: (examId: string, questions: CBTQuestion[]) => void;
  onUnlockExamSession?: (sessionId: string) => void;
  onResetExamSession?: (sessionId: string) => void;
}

export const CBTSection: React.FC<CBTSectionProps> = ({
  exams,
  attempts,
  cbtSessionLocks = [],
  currentUser,
  allUsers = [],
  cbtStudent,
  onCbtStudentLogin,
  onCbtStudentLogout,
  onStartExam,
  onAddExam,
  onEditExam,
  onDeleteExam,
  onUpdateQuestions,
  onUnlockExamSession,
  onResetExamSession,
}) => {
  // Tabs:
  // For Student: 'active_tasks' | 'history' | 'grades'
  // For Admin: 'manage_exams' | 'question_bank' | 'student_results' | 'cbt_locks'
  const [activeTab, setActiveTab] = useState<string>(
    currentUser.role === 'admin' ? 'manage_exams' : 'active_tasks'
  );

  const [loginModalExam, setLoginModalExam] = useState<CBTExam | null>(null);

  const effectiveStudent = cbtStudent || (currentUser.role === 'student' && currentUser.id !== 'guest' ? currentUser : null);

  const [searchLockQuery, setSearchLockQuery] = useState('');
  const [filterLockStatus, setFilterLockStatus] = useState<'all' | 'locked' | 'unlocked'>('all');

  const lockedSessionsCount = cbtSessionLocks.filter((l) => l.isLocked).length;

  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<CBTAttempt | null>(null);
  const [selectedExamIdForQuestions, setSelectedExamIdForQuestions] = useState<string | null>(null);
  const [questionSubmitMode, setQuestionSubmitMode] = useState<'close' | 'continue'>('close');
  const [questionSaveNotice, setQuestionSaveNotice] = useState<string | null>(null);

  // Admin Exam Form State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<CBTExam | null>(null);
  const [formExamTitle, setFormExamTitle] = useState('');
  const [formExamDesc, setFormExamDesc] = useState('');
  const [formExamGrade, setFormExamGrade] = useState<CBTExam['gradeLevel']>('Kelas 7');
  const [formExamSubject, setFormExamSubject] = useState('Matematika');
  const [formExamDuration, setFormExamDuration] = useState(20);
  const [formExamPassing, setFormExamPassing] = useState(75);
  const [formExamIsActive, setFormExamIsActive] = useState(true);

  // Admin Question Form State (PG Tunggal, PG Kompleks, MCMA)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CBTQuestion | null>(null);
  const [formQuestionType, setFormQuestionType] = useState<CBTQuestionType>('pg_tunggal');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formQuestionFormula, setFormQuestionFormula] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formCorrectOpt, setFormCorrectOpt] = useState('A');
  const [formCorrectOptIds, setFormCorrectOptIds] = useState<string[]>(['A']);
  const [formStatements, setFormStatements] = useState<ComplexStatement[]>([
    { id: 'stmt_1', statementText: '', correctValue: 'benar' },
    { id: 'stmt_2', statementText: '', correctValue: 'salah' },
    { id: 'stmt_3', statementText: '', correctValue: 'benar' },
  ]);
  const [formExplanation, setFormExplanation] = useState('');
  const [formPoints, setFormPoints] = useState(20);

  // Filter for results and class grouping
  const [resultsClassFilter, setResultsClassFilter] = useState('Semua');
  const [resultsViewMode, setResultsViewMode] = useState<'per_exam' | 'all_exams_leger'>('per_exam');
  const [resultsGradeFilter, setResultsGradeFilter] = useState<'Semua' | 'Kelas 7' | 'Kelas 8' | 'Kelas 9'>('Kelas 7');
  const [resultsSpecificClass, setResultsSpecificClass] = useState('Semua');
  const [selectedExamForResultsId, setSelectedExamForResultsId] = useState<string>('');
  const [resultsSearchText, setResultsSearchText] = useState('');

  // Filter for Bank Soal & Formula per kelas
  const [bankGradeFilter, setBankGradeFilter] = useState<'Semua' | 'Kelas 7' | 'Kelas 8' | 'Kelas 9'>('Kelas 7');
  const [bankFormulaFilter, setBankFormulaFilter] = useState<'all' | 'formula_only'>('all');
  const [bankSearchText, setBankSearchText] = useState('');

  // State for Print Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalType, setPrintModalType] = useState<CBTPrintType>('exam_recap');
  const [printModalExam, setPrintModalExam] = useState<CBTExam | null>(null);
  const [printModalTargetClass, setPrintModalTargetClass] = useState<string>('Semua');
  const [printModalStudent, setPrintModalStudent] = useState<User | null>(null);

  // Student specific attempts
  const myAttempts = effectiveStudent ? attempts.filter((att) => att.studentId === effectiveStudent.id) : [];

  // Handle open add exam
  const handleOpenAddExam = () => {
    setEditingExam(null);
    setFormExamTitle('');
    setFormExamDesc('Ujian berbasis komputer (CBT) materi matematika.');
    setFormExamGrade('Kelas 7');
    setFormExamSubject('Matematika');
    setFormExamDuration(20);
    setFormExamPassing(75);
    setFormExamIsActive(true);
    setIsExamModalOpen(true);
  };

  const handleOpenEditExam = (e: CBTExam) => {
    setEditingExam(e);
    setFormExamTitle(e.title);
    setFormExamDesc(e.description);
    setFormExamGrade(e.gradeLevel);
    setFormExamSubject(e.subject);
    setFormExamDuration(e.durationMinutes);
    setFormExamPassing(e.passingScore);
    setFormExamIsActive(e.isActive);
    setIsExamModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExamTitle.trim()) return;

    if (editingExam) {
      onEditExam({
        ...editingExam,
        title: formExamTitle,
        description: formExamDesc,
        gradeLevel: formExamGrade,
        subject: formExamSubject,
        durationMinutes: Number(formExamDuration),
        passingScore: Number(formExamPassing),
        isActive: formExamIsActive,
      });
    } else {
      onAddExam({
        title: formExamTitle,
        description: formExamDesc,
        gradeLevel: formExamGrade,
        subject: formExamSubject,
        durationMinutes: Number(formExamDuration),
        totalQuestions: 0,
        passingScore: Number(formExamPassing),
        isActive: formExamIsActive,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        questions: [],
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
    setIsExamModalOpen(false);
  };

  // Open question modal
  const handleOpenAddQuestion = (exam: CBTExam) => {
    setSelectedExamIdForQuestions(exam.id);
    setEditingQuestion(null);
    setFormQuestionType('pg_tunggal');
    setFormQuestionText('');
    setFormQuestionFormula('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
    setFormCorrectOpt('A');
    setFormCorrectOptIds(['A']);
    setFormStatements([
      { id: `stmt_${Date.now()}_1`, statementText: '', correctValue: 'benar' },
      { id: `stmt_${Date.now()}_2`, statementText: '', correctValue: 'salah' },
      { id: `stmt_${Date.now()}_3`, statementText: '', correctValue: 'benar' },
    ]);
    setFormExplanation('');
    setFormPoints(20);
    setQuestionSaveNotice(null);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (exam: CBTExam, q: CBTQuestion) => {
    setSelectedExamIdForQuestions(exam.id);
    setEditingQuestion(q);
    setFormQuestionType(q.questionType || 'pg_tunggal');
    setFormQuestionText(q.questionText);
    setFormQuestionFormula(q.questionFormula || '');
    setFormOptA(q.options?.find((o) => o.id === 'A')?.text || '');
    setFormOptB(q.options?.find((o) => o.id === 'B')?.text || '');
    setFormOptC(q.options?.find((o) => o.id === 'C')?.text || '');
    setFormOptD(q.options?.find((o) => o.id === 'D')?.text || '');
    setFormCorrectOpt(q.correctOptionId || 'A');
    setFormCorrectOptIds(
      q.correctOptionIds && q.correctOptionIds.length > 0
        ? q.correctOptionIds
        : q.correctOptionId
        ? [q.correctOptionId]
        : ['A']
    );
    setFormStatements(
      q.statements && q.statements.length > 0
        ? q.statements
        : [
            { id: `stmt_${Date.now()}_1`, statementText: '', correctValue: 'benar' },
            { id: `stmt_${Date.now()}_2`, statementText: '', correctValue: 'salah' },
            { id: `stmt_${Date.now()}_3`, statementText: '', correctValue: 'benar' },
          ]
    );
    setFormExplanation(q.explanation);
    setFormPoints(q.points || 20);
    setQuestionSaveNotice(null);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent, continueAdding: boolean = false) => {
    e.preventDefault();
    const currentExam = exams.find((x) => x.id === selectedExamIdForQuestions);
    if (!currentExam || !formQuestionText.trim()) return;

    // Only options A, B, C, D (4 options strictly, no E)
    const options = [
      { id: 'A', text: formOptA.trim() },
      { id: 'B', text: formOptB.trim() },
      { id: 'C', text: formOptC.trim() },
      { id: 'D', text: formOptD.trim() },
    ].filter((o) => o.text !== '');

    const validStatements = formStatements.filter((s) => s.statementText.trim() !== '');

    let updatedQuestions: CBTQuestion[] = [...(currentExam.questions || [])];

    if (editingQuestion) {
      updatedQuestions = updatedQuestions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              questionType: formQuestionType,
              questionText: formQuestionText.trim(),
              questionFormula: formQuestionFormula.trim() || undefined,
              options: formQuestionType === 'pg_kompleks' ? [] : options,
              correctOptionId: formQuestionType === 'pg_tunggal' ? formCorrectOpt : undefined,
              correctOptionIds: formQuestionType === 'mcma' ? formCorrectOptIds : undefined,
              statements: formQuestionType === 'pg_kompleks' ? validStatements : undefined,
              explanation: formExplanation.trim(),
              points: Number(formPoints) || 20,
            }
          : q
      );
    } else {
      const newQ: CBTQuestion = {
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        number: updatedQuestions.length + 1,
        questionType: formQuestionType,
        questionText: formQuestionText.trim(),
        questionFormula: formQuestionFormula.trim() || undefined,
        options: formQuestionType === 'pg_kompleks' ? [] : options,
        correctOptionId: formQuestionType === 'pg_tunggal' ? formCorrectOpt : undefined,
        correctOptionIds: formQuestionType === 'mcma' ? formCorrectOptIds : undefined,
        statements: formQuestionType === 'pg_kompleks' ? validStatements : undefined,
        explanation: formExplanation.trim(),
        points: Number(formPoints) || 20,
      };
      updatedQuestions.push(newQ);
    }

    // Renumber sequentially
    updatedQuestions = updatedQuestions.map((q, idx) => ({
      ...q,
      number: idx + 1,
    }));

    onUpdateQuestions(currentExam.id, updatedQuestions);

    if (continueAdding && !editingQuestion) {
      const savedNumber = updatedQuestions.length;
      setQuestionSaveNotice(
        `✓ Soal #${savedNumber} berhasil disimpan ke paket "${currentExam.title}"! Form telah siap untuk input soal ke-${savedNumber + 1}.`
      );
      // Reset fields for consecutive input
      setFormQuestionText('');
      setFormQuestionFormula('');
      setFormOptA('');
      setFormOptB('');
      setFormOptC('');
      setFormOptD('');
      setFormExplanation('');
      setFormCorrectOpt('A');
      setFormCorrectOptIds(['A']);
      setFormStatements([
        { id: `stmt_${Date.now()}_1`, statementText: '', correctValue: 'benar' },
        { id: `stmt_${Date.now()}_2`, statementText: '', correctValue: 'salah' },
        { id: `stmt_${Date.now()}_3`, statementText: '', correctValue: 'benar' },
      ]);
    } else {
      setQuestionSaveNotice(null);
      setIsQuestionModalOpen(false);
    }
  };

  const handleDeleteQuestion = (exam: CBTExam, qId: string) => {
    if (!confirm('Hapus butir soal ini dari bank soal?')) return;
    const updated = exam.questions
      .filter((q) => q.id !== qId)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
    onUpdateQuestions(exam.id, updated);
  };

  // Export results CSV
  const handleExportCSV = () => {
    const headers = ['Nama Siswa', 'Kelas', 'NISN', 'Ujian CBT', 'Skor', 'Status', 'Tanggal Selesai'];
    const rows = attempts.map((a) => [
      `"${a.studentName}"`,
      `"${a.studentClass}"`,
      `"${a.studentNisn || '-'}"`,
      `"${a.examTitle}"`,
      a.score,
      a.isPassed ? 'LULUS' : 'REMEDIAL',
      `"${new Date(a.completedAt).toLocaleString('id-ID')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-nilai-cbt-aliemath-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <FileCheck2 className="w-4 h-4" />
            <span>Computer Based Test (CBT) & Bank Soal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Soal Latihan & Evaluasi Matematika
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentUser.role === 'admin'
              ? 'Kelola paket ujian, butir bank soal CBT berumus, dan pantau rekapitulasi nilai seluruh siswa.'
              : 'Kerjakan tugas CBT mandiri, pantau batas waktu pengerjaan, dan pelajari pembahasan nilai.'}
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            id="btn-add-cbt-exam"
            onClick={handleOpenAddExam}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Buat Paket Ujian CBT
          </button>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {currentUser.role === 'student' ? (
          <>
            <button
              onClick={() => setActiveTab('active_tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'active_tasks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              1. Tugas & Ujian Terkini
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              2. Riwayat Pengerjaan ({myAttempts.length})
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'grades'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              3. Nilai Tugas & Pembahasan
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('manage_exams')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'manage_exams'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Kelola Paket Ujian CBT ({exams.length})
            </button>
            <button
              onClick={() => setActiveTab('question_bank')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'question_bank'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Bank Soal & Formula
            </button>
            <button
              onClick={() => setActiveTab('student_results')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'student_results'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Rekapitulasi Nilai Siswa ({attempts.length})
            </button>
            <button
              id="tab-cbt-locks"
              onClick={() => setActiveTab('cbt_locks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'cbt_locks'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : lockedSessionsCount > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Monitor & Reset Layar Siswa</span>
              {lockedSessionsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  {lockedSessionsCount} Terkunci
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* ================= STUDENT VIEW ================= */}
      {/* 1. Tugas Terkini */}
      {currentUser.role === 'student' && activeTab === 'active_tasks' && (
        <div className="space-y-4">
          {effectiveStudent ? (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-950">Peserta CBT: {effectiveStudent.fullName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-800 font-semibold">
                      Kelas {effectiveStudent.classGroup}
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-700/80">
                    Username: <span className="font-mono font-medium">{effectiveStudent.username}</span> • Sesi: {effectiveStudent.session || 'Sesi 1'}
                  </div>
                </div>
              </div>
              {onCbtStudentLogout && (
                <button
                  id="btn-logout-cbt-student"
                  onClick={onCbtStudentLogout}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Keluar Sesi Siswa
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start sm:items-center gap-3 text-slate-700 text-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Info className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <strong className="text-slate-900">Portal Ulangan & Ujian CBT Siswa:</strong> Siswa hanya login saat hendak mengerjakan soal ujian CBT. Klik tombol <strong>"Mulai Ujian CBT"</strong> pada paket ujian di bawah untuk memasukkan akun yang telah dibuatkan oleh Guru.
              </div>
            </div>
          )}

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Paket Ujian CBT Aktif Siap Dikerjakan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams
              .filter((e) => e.isActive)
              .map((exam) => {
                const existingAttempt = myAttempts.find((a) => a.examId === exam.id);
                const hasTaken = Boolean(existingAttempt);
                const studentLock = effectiveStudent ? cbtSessionLocks.find(
                  (l) => l.studentId === effectiveStudent.id && l.examId === exam.id && l.isLocked
                ) : null;

                return (
                  <div
                    key={exam.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                      studentLock ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {exam.gradeLevel}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">{exam.subject}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">{exam.title}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{exam.description}</p>

                      <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Durasi</div>
                          <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>{exam.durationMinutes} Menit</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Jumlah Soal</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">
                            {exam.questions.length} Butir
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Standar KKM</div>
                          <div className="text-xs font-bold text-emerald-600 mt-0.5">
                            {exam.passingScore}
                          </div>
                        </div>
                      </div>

                      {studentLock && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-rose-700">
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Akses CBT Terblokir Sistem!</span>
                          </div>
                          <p className="text-[11px] text-rose-800/90 leading-relaxed">
                            {studentLock.lockReason || 'Terdeteksi mencoba meninggalkan layar ujian CBT.'}
                          </p>
                          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Jawaban asal ({Object.keys(studentLock.savedAnswers || {}).length} soal) tersimpan aman. Hubungi Guru Pengawas untuk membuka blokir!</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      {studentLock ? (
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          Terblokir (Pelanggaran Layar)
                        </span>
                      ) : hasTaken ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-slate-700">
                            Sudah dikerjakan (Nilai: <strong className="text-blue-600">{existingAttempt?.score}</strong>)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          Belum Dikerjakan
                        </span>
                      )}

                      <button
                        id={`btn-exam-${exam.id}`}
                        onClick={() => {
                          if (effectiveStudent) {
                            onStartExam(exam, effectiveStudent);
                          } else {
                            setLoginModalExam(exam);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          studentLock
                            ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-500/20'
                            : hasTaken
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20'
                        }`}
                      >
                        {studentLock ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Lihat Layar Terkunci</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{hasTaken ? 'Ulangi CBT (Latihan)' : 'Mulai Ujian CBT'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 2. Riwayat Tugas Siswa */}
      {currentUser.role === 'student' && activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Riwayat Pengerjaan Tugas & Ujian CBT
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Total {myAttempts.length} Percobaan Tersimpan
            </span>
          </div>

          {myAttempts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Kamu belum mengerjakan tugas atau ujian CBT apapun. Buka menu <strong>Tugas Terkini</strong> untuk memulai!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myAttempts.map((att) => (
                <div key={att.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          att.isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.isPassed ? 'LULUS KKM' : 'REMEDIAL'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(att.completedAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{att.examTitle}</h4>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span>Benar: <strong className="text-emerald-600">{att.correctCount}</strong> / {att.totalQuestions} Soal</span>
                      <span>•</span>
                      <span>Waktu: {Math.floor(att.timeSpentSeconds / 60)} menit</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-black text-blue-600">{att.score}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Skor Akhir</div>
                    </div>
                    <button
                      onClick={() => setSelectedAttemptForReview(att)}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold"
                    >
                      Lihat Pembahasan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Nilai Tugas & Pembahasan Siswa */}
      {currentUser.role === 'student' && activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Transkrip & Catatan Capaian Belajar Mandiri</h3>
              <p className="text-xs text-slate-500">Rekapitulasi seluruh nilai tugas dan ulangan harian yang telah kamu ikuti</p>
            </div>
            {effectiveStudent && (
              <button
                id="btn-print-student-my-transcript"
                onClick={() => {
                  setPrintModalType('student_transcript');
                  setPrintModalStudent(effectiveStudent);
                  setIsPrintModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Transkrip Nilai Saya</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-400 font-semibold">Rata-Rata Nilai CBT</div>
              <div className="text-3xl font-black text-blue-600 mt-1">
                {myAttempts.length > 0
                  ? Math.round(myAttempts.reduce((acc, c) => acc + c.score, 0) / myAttempts.length)
                  : 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Skala 0 - 100</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-400 font-semibold">Tugas Tuntas (Lulus)</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                {myAttempts.filter((a) => a.isPassed).length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Melampaui KKM</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="text-xs text-slate-400 font-semibold">Perlu Remedial</div>
              <div className="text-3xl font-black text-rose-500 mt-1">
                {myAttempts.filter((a) => !a.isPassed).length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Di bawah KKM</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Pilih Ujian untuk Melihat Pembahasan Lengkap</h3>
            <div className="space-y-2">
              {myAttempts.map((att) => (
                <div
                  key={att.id}
                  onClick={() => setSelectedAttemptForReview(att)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{att.examTitle}</div>
                    <div className="text-[11px] text-slate-500">
                      Diselesaikan: {new Date(att.completedAt).toLocaleDateString('id-ID')} • Skor: {att.score}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= ADMIN VIEW ================= */}
      {/* 1. Kelola Paket Ujian CBT */}
      {currentUser.role === 'admin' && activeTab === 'manage_exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Daftar Paket Ujian CBT Aktif & Arsip
            </div>
            <button
              onClick={handleOpenAddExam}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
            >
              + Buat Paket Ujian
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {exam.gradeLevel}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        exam.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {exam.isActive ? 'Status: Aktif' : 'Status: Ditutup'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{exam.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exam.description}</p>

                  <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Durasi</span>
                      <strong className="text-slate-800">{exam.durationMinutes}m</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Butir Soal</span>
                      <strong className="text-slate-800">{exam.questions.length}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">KKM</span>
                      <strong className="text-emerald-600">{exam.passingScore}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedExamIdForQuestions(exam.id);
                        setBankGradeFilter(exam.gradeLevel === 'Semua Kelas' ? 'Semua' : exam.gradeLevel);
                        setActiveTab('question_bank');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Kelola Soal ({exam.questions.length}) <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenAddQuestion(exam)}
                      className="text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Tambah Butir Soal Baru Langsung ke Paket Ini"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Soal</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditExam(exam)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Setting Ujian"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus paket ujian "${exam.title}"?`)) {
                          onDeleteExam(exam.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Paket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Bank Soal & Formula (Admin) */}
      {currentUser.role === 'admin' && activeTab === 'question_bank' && (() => {
        const gradeFilteredExams = exams.filter((ex) => {
          if (bankGradeFilter === 'Semua') return true;
          return ex.gradeLevel === bankGradeFilter || ex.gradeLevel === 'Semua Kelas';
        });

        // Always resolve activeExam from latest exams state so question count and array are always fresh
        const activeExam = (selectedExamIdForQuestions && gradeFilteredExams.find((e) => e.id === selectedExamIdForQuestions))
          || (selectedExamIdForQuestions && exams.find((e) => e.id === selectedExamIdForQuestions))
          || gradeFilteredExams[0]
          || exams[0]
          || null;

        const displayedQuestions = (activeExam?.questions || []).filter((q) => {
          if (bankFormulaFilter === 'formula_only' && !q.questionFormula) {
            return false;
          }
          if (bankSearchText.trim()) {
            const query = bankSearchText.toLowerCase();
            const textMatch = q.questionText.toLowerCase().includes(query);
            const formulaMatch = q.questionFormula?.toLowerCase().includes(query) || false;
            const explanationMatch = q.explanation?.toLowerCase().includes(query) || false;
            return textMatch || formulaMatch || explanationMatch;
          }
          return true;
        });

        const totalFormulaCountInExam = (activeExam?.questions || []).filter((q) => Boolean(q.questionFormula)).length;

        return (
          <div className="space-y-4">
            {/* Header Toolbar: Filter Kelompok Kelas, Formula Filter, dan Pemilihan Paket Ujian */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bank Soal & Formula Matematika Berdasarkan Tingkat Kelas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pemisahan butir soal per kelompok kelas agar paket soal Kelas 7, Kelas 8, dan Kelas 9 tidak tercampur.
                  </p>
                </div>

                {activeExam && (
                  <button
                    id="btn-add-question-modal"
                    onClick={() => handleOpenAddQuestion(activeExam)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs flex items-center gap-1.5 self-start lg:self-auto cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Soal ke {activeExam.gradeLevel}
                  </button>
                )}
              </div>

              {/* Filter Tabs: Kelompok Kelas */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  Kelompok Kelas:
                </span>
                {(['Kelas 7', 'Kelas 8', 'Kelas 9', 'Semua'] as const).map((grade) => {
                  const countForGrade = exams.filter((e) => grade === 'Semua' || e.gradeLevel === grade).length;
                  const isSelected = bankGradeFilter === grade;
                  return (
                    <button
                      key={grade}
                      onClick={() => {
                        setBankGradeFilter(grade);
                        const matchedExams = exams.filter((e) => grade === 'Semua' || e.gradeLevel === grade || e.gradeLevel === 'Semua Kelas');
                        if (matchedExams.length > 0) {
                          setSelectedExamIdForQuestions(matchedExams[0].id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {grade === 'Semua' ? 'Semua Tingkat' : grade} ({countForGrade} Paket)
                    </button>
                  );
                })}
              </div>

              {/* Sub-Filters: Paket Ujian Dropdown, Formula Only Toggle, & Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Pilih Paket Soal ({bankGradeFilter}):
                  </label>
                  <select
                    value={activeExam?.id || ''}
                    onChange={(e) => {
                      setSelectedExamIdForQuestions(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {gradeFilteredExams.length === 0 ? (
                      <option value="">Tidak ada paket ujian di tingkat {bankGradeFilter}</option>
                    ) : (
                      gradeFilteredExams.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          [{ex.gradeLevel}] {ex.title} ({ex.questions.length} butir)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Filter Formula / Rumus:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBankFormulaFilter('all')}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                        bankFormulaFilter === 'all'
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Semua ({activeExam?.questions.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBankFormulaFilter('formula_only')}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
                        bankFormulaFilter === 'formula_only'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <span>Rumus ({totalFormulaCountInExam})</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Cari Teks / Formula Soal:
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ketik kata kunci rumus..."
                      value={bankSearchText}
                      onChange={(e) => setBankSearchText(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Questions list */}
            {activeExam ? (
              <div className="space-y-3">
                {/* Active Exam Summary Card */}
                <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-xs">
                      {activeExam.gradeLevel}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{activeExam.title}</span>
                      <div className="text-slate-500 text-[11px]">
                        Mata Pelajaran: {activeExam.subject} • KKM: {activeExam.passingScore} • Durasi: {activeExam.durationMinutes} menit
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-semibold text-[11px]">
                    <span>Total: {activeExam.questions.length} butir</span>
                    <span>•</span>
                    <span className="text-blue-700 font-bold">{totalFormulaCountInExam} berumus</span>
                  </div>
                </div>

                {displayedQuestions.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400 space-y-2">
                    <p className="font-semibold text-slate-600">
                      {bankFormulaFilter === 'formula_only'
                        ? 'Tidak ditemukan butir soal yang memiliki formula matematika khusus pada paket ini.'
                        : 'Belum ada butir soal yang cocok dengan filter atau paket ujian ini.'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Klik tombol <strong>Tambah Soal ke {activeExam.gradeLevel}</strong> untuk menambahkan soal baru.
                    </p>
                  </div>
                ) : (
                  displayedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            q.questionType === 'mcma'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : q.questionType === 'pg_kompleks'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {q.questionType === 'mcma'
                            ? 'PG Kompleks / MCMA'
                            : q.questionType === 'pg_kompleks'
                            ? 'PG Kompleks (Benar/Salah)'
                            : 'Pilihan Ganda Tunggal'}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Bobot: {q.points} Poin
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditQuestion(activeExam, q)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Edit Butir Soal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(activeExam, q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Hapus Butir Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-900 font-medium">
                      {q.questionText}
                    </div>

                    {q.questionFormula && (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-blue-700 font-bold">
                        Formula: {q.questionFormula}
                      </div>
                    )}

                    {/* Options list for PG Tunggal */}
                    {(!q.questionType || q.questionType === 'pg_tunggal') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                        {q.options?.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-lg border flex items-center gap-2 ${
                              opt.id === q.correctOptionId
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center text-[10px]">
                              {opt.id}
                            </span>
                            <span>{opt.text}</span>
                            {opt.id === q.correctOptionId && (
                              <span className="ml-auto text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Kunci Benar
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Options list for MCMA (Multiple Choice Multiple Answer) */}
                    {q.questionType === 'mcma' && (
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="text-[11px] font-semibold text-purple-900">
                          Pilihan Jawaban (Kunci Jawaban Jamak: {(q.correctOptionIds || []).join(', ')}):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options?.map((opt) => {
                            const isCorrectKey = q.correctOptionIds?.includes(opt.id);
                            return (
                              <div
                                key={opt.id}
                                className={`p-2 rounded-lg border flex items-center gap-2 ${
                                  isCorrectKey
                                    ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-md bg-white border border-current flex items-center justify-center text-[10px]">
                                  {opt.id}
                                </span>
                                <span>{opt.text}</span>
                                {isCorrectKey && (
                                  <span className="ml-auto text-[10px] font-bold text-purple-700 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-purple-600" /> Kunci Benar
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Table of Statements for PG Kompleks (Benar / Salah) */}
                    {q.questionType === 'pg_kompleks' && (
                      <div className="pt-1 text-xs space-y-2">
                        <div className="text-[11px] font-semibold text-amber-900">
                          Tabel Pernyataan & Kunci Evaluasi:
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                              <tr>
                                <th className="p-2.5 font-bold">Pernyataan Soal</th>
                                <th className="p-2.5 text-right font-bold w-36">Kunci Jawaban</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {q.statements?.map((stmt, sIdx) => (
                                <tr key={stmt.id || sIdx} className="hover:bg-slate-50/60">
                                  <td className="p-2.5 text-slate-800">{stmt.statementText}</td>
                                  <td className="p-2.5 text-right">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                        stmt.correctValue === 'benar'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {stmt.correctValue === 'benar' ? '✓ BENAR' : '✗ SALAH'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                        <strong className="text-slate-800">Pembahasan: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">Pilih paket ujian terlebih dahulu.</div>
          )}
        </div>
      );
    })()}

      {/* 3. Rekapitulasi Nilai Siswa (Admin) */}
      {currentUser.role === 'admin' && activeTab === 'student_results' && (() => {
        // Compute available student list and classes
        const studentUsers = allUsers.filter((u) => u.role === 'student');
        const availableRombelClasses = Array.from(
          new Set(
            [
              ...studentUsers.map((u) => u.classGroup).filter(Boolean),
              ...attempts.map((a) => a.studentClass).filter(Boolean),
            ] as string[]
          )
        ).sort();

        // Exams filtered by grade level
        const gradeFilteredExams = exams.filter((ex) => {
          if (resultsGradeFilter === 'Semua') return true;
          return ex.gradeLevel === resultsGradeFilter || ex.gradeLevel === 'Semua Kelas';
        });

        // Currently selected exam for Mode 1 (Per-Ujian)
        const currentSelectedExam = (selectedExamForResultsId && gradeFilteredExams.find((e) => e.id === selectedExamForResultsId))
          || gradeFilteredExams[0]
          || exams[0]
          || null;

        // Mode 1 Filtered Attempts (Strictly separated per exam!)
        const mode1Attempts = attempts.filter((att) => {
          if (!currentSelectedExam) return false;
          if (att.examId !== currentSelectedExam.id) return false;
          if (resultsGradeFilter !== 'Semua') {
            if (currentSelectedExam.gradeLevel !== resultsGradeFilter && currentSelectedExam.gradeLevel !== 'Semua Kelas') {
              return false;
            }
          }
          if (resultsSpecificClass !== 'Semua' && att.studentClass !== resultsSpecificClass) {
            return false;
          }
          if (resultsSearchText.trim()) {
            const q = resultsSearchText.toLowerCase();
            const nameMatch = att.studentName.toLowerCase().includes(q);
            const nisnMatch = att.studentNisn?.toLowerCase().includes(q);
            return nameMatch || nisnMatch;
          }
          return true;
        });

        // Mode 1 Stats (Average, High, Low, Passing Rate)
        const mode1Scores = mode1Attempts.map((a) => a.score);
        const mode1AvgScore = mode1Scores.length > 0 ? (mode1Scores.reduce((a, b) => a + b, 0) / mode1Scores.length) : 0;
        const mode1Highest = mode1Scores.length > 0 ? Math.max(...mode1Scores) : 0;
        const mode1Lowest = mode1Scores.length > 0 ? Math.min(...mode1Scores) : 0;
        const mode1PassedCount = mode1Attempts.filter((a) => a.isPassed).length;
        const mode1PassingRate = mode1Attempts.length > 0 ? Math.round((mode1PassedCount / mode1Attempts.length) * 100) : 0;

        // Mode 2: Leger & Transkrip Nilai Keseluruhan
        // Filter students by selected grade and class
        const mode2Students = studentUsers.filter((s) => {
          const sClass = s.classGroup || '';
          if (resultsGradeFilter === 'Kelas 7' && !sClass.startsWith('7')) return false;
          if (resultsGradeFilter === 'Kelas 8' && !sClass.startsWith('8')) return false;
          if (resultsGradeFilter === 'Kelas 9' && !sClass.startsWith('9')) return false;
          if (resultsSpecificClass !== 'Semua' && sClass !== resultsSpecificClass) return false;
          if (resultsSearchText.trim()) {
            const q = resultsSearchText.toLowerCase();
            const matchName = s.fullName.toLowerCase().includes(q);
            const matchNisn = s.nisn?.toLowerCase().includes(q);
            return matchName || matchNisn;
          }
          return true;
        });

        // Exams in scope for Leger
        const examsForLeger = exams.filter((ex) => {
          if (resultsGradeFilter === 'Semua') return true;
          return ex.gradeLevel === resultsGradeFilter || ex.gradeLevel === 'Semua Kelas';
        });

        // Compute column averages for Leger
        const examAverages: { [examId: string]: number } = {};
        examsForLeger.forEach((ex) => {
          const exAttempts = attempts.filter((a) => {
            if (a.examId !== ex.id) return false;
            if (resultsGradeFilter === 'Kelas 7' && !a.studentClass?.startsWith('7')) return false;
            if (resultsGradeFilter === 'Kelas 8' && !a.studentClass?.startsWith('8')) return false;
            if (resultsGradeFilter === 'Kelas 9' && !a.studentClass?.startsWith('9')) return false;
            if (resultsSpecificClass !== 'Semua' && a.studentClass !== resultsSpecificClass) return false;
            return true;
          });
          if (exAttempts.length > 0) {
            const sum = exAttempts.reduce((acc, curr) => acc + curr.score, 0);
            examAverages[ex.id] = Math.round(sum / exAttempts.length);
          } else {
            examAverages[ex.id] = 0;
          }
        });

        return (
          <div className="space-y-4">
            {/* Main Header & View Mode Switcher */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Rekapitulasi Nilai Siswa Per Kelompok Kelas & Format Siap Cetak
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sistem pemisahan nilai per paket ujian dan transkrip kumulatif ulangan matematika dengan perhitungan rata-rata otomatis.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {resultsViewMode === 'per_exam' && currentSelectedExam && (
                    <button
                      id="btn-print-exam-recap"
                      onClick={() => {
                        setPrintModalType('exam_recap');
                        setPrintModalExam(currentSelectedExam);
                        setPrintModalTargetClass(resultsSpecificClass);
                        setPrintModalStudent(null);
                        setIsPrintModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Form Nilai Ujian (Print Out)</span>
                    </button>
                  )}

                  {resultsViewMode === 'all_exams_leger' && (
                    <button
                      id="btn-print-class-leger"
                      onClick={() => {
                        setPrintModalType('class_leger');
                        setPrintModalExam(null);
                        setPrintModalTargetClass(resultsSpecificClass !== 'Semua' ? resultsSpecificClass : resultsGradeFilter);
                        setPrintModalStudent(null);
                        setIsPrintModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Leger Nilai Kelas (Print Out)</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh CSV</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Mode Tampilan Nilai */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResultsViewMode('per_exam')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    resultsViewMode === 'per_exam'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>1. Rekap Nilai Per Ujian (Terpisah Per Ujian)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultsViewMode('all_exams_leger')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    resultsViewMode === 'all_exams_leger'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>2. Transkrip & Leger Nilai Keseluruhan (Ulangan 1, 2, 3...)</span>
                </button>
              </div>

              {/* Filter Kelompok Kelas Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  Kelompok Kelas:
                </span>
                {(['Kelas 7', 'Kelas 8', 'Kelas 9', 'Semua'] as const).map((grade) => {
                  const isSelected = resultsGradeFilter === grade;
                  return (
                    <button
                      key={grade}
                      onClick={() => {
                        setResultsGradeFilter(grade);
                        setResultsSpecificClass('Semua');
                        // pick an exam matching that grade if in per_exam mode
                        const matched = exams.filter((e) => grade === 'Semua' || e.gradeLevel === grade || e.gradeLevel === 'Semua Kelas');
                        if (matched.length > 0) {
                          setSelectedExamForResultsId(matched[0].id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {grade === 'Semua' ? 'Semua Tingkat' : grade}
                    </button>
                  );
                })}
              </div>

              {/* Secondary Filter Bar: Rombel Kelas, Paket Ujian (for Mode 1), & Pencarian Siswa */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {resultsViewMode === 'per_exam' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Pilih Paket Ujian CBT ({resultsGradeFilter}):
                    </label>
                    <select
                      value={currentSelectedExam?.id || ''}
                      onChange={(e) => setSelectedExamForResultsId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {gradeFilteredExams.length === 0 ? (
                        <option value="">Tidak ada paket ujian pada tingkat {resultsGradeFilter}</option>
                      ) : (
                        gradeFilteredExams.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            [{ex.gradeLevel}] {ex.title} (KKM: {ex.passingScore})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Filter Rombel / Kelas Siswa:
                  </label>
                  <select
                    value={resultsSpecificClass}
                    onChange={(e) => setResultsSpecificClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Semua">Semua Rombel ({resultsGradeFilter})</option>
                    {availableRombelClasses
                      .filter((cls) => {
                        if (resultsGradeFilter === 'Kelas 7') return cls.startsWith('7');
                        if (resultsGradeFilter === 'Kelas 8') return cls.startsWith('8');
                        if (resultsGradeFilter === 'Kelas 9') return cls.startsWith('9');
                        return true;
                      })
                      .map((cls) => (
                        <option key={cls} value={cls}>
                          Kelas {cls}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Cari Nama Siswa / NISN:
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ketik nama siswa..."
                      value={resultsSearchText}
                      onChange={(e) => setResultsSearchText(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ================= MODE 1: REKAP NILAI PER UJIAN ================= */}
            {resultsViewMode === 'per_exam' && (
              <div className="space-y-4">
                {currentSelectedExam ? (
                  <>
                    {/* Exam Header Card & Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs md:col-span-1">
                        <div className="text-[11px] text-slate-500 font-semibold">Paket Ujian Terpilih</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5 truncate">{currentSelectedExam.title}</div>
                        <div className="text-[10px] text-blue-600 font-bold mt-1">
                          Tingkat: {currentSelectedExam.gradeLevel} • KKM: {currentSelectedExam.passingScore}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
                        <div className="text-[11px] text-slate-500 font-semibold">Rata-Rata Nilai Kelas</div>
                        <div className="text-2xl font-black text-blue-600 mt-0.5">
                          {mode1AvgScore.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-slate-400">Dari {mode1Attempts.length} Siswa Terdata</div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
                        <div className="text-[11px] text-slate-500 font-semibold">Rentang Nilai (Min - Max)</div>
                        <div className="text-lg font-black text-slate-800 mt-1">
                          {mode1Attempts.length > 0 ? `${mode1Lowest} - ${mode1Highest}` : '-'}
                        </div>
                        <div className="text-[10px] text-slate-400">Skala 0 - 100</div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
                        <div className="text-[11px] text-slate-500 font-semibold">Ketuntasan Belajar</div>
                        <div className="text-2xl font-black text-emerald-600 mt-0.5">
                          {mode1PassingRate}%
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold">
                          {mode1PassedCount} dari {mode1Attempts.length} Lulus KKM
                        </div>
                      </div>
                    </div>

                    {/* Notification Notice: Per-Exam Separation */}
                    <div className="bg-blue-50/70 border border-blue-200/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-900">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          <strong>Formulir Nilai Resmi Ujian:</strong> Nilai pada tabel di bawah ini terpisah khusus untuk <strong>{currentSelectedExam.title}</strong>, tidak digabung dengan ujian lain sehingga siap dicetak langsung.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setPrintModalType('exam_recap');
                          setPrintModalExam(currentSelectedExam);
                          setPrintModalTargetClass(resultsSpecificClass);
                          setIsPrintModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 shrink-0 cursor-pointer shadow-xs"
                      >
                        Buka Preview Cetak
                      </button>
                    </div>

                    {/* Table of Students in Mode 1 */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                            <tr>
                              <th className="py-3 px-3 w-12 text-center">No</th>
                              <th className="py-3 px-4">Nama Siswa</th>
                              <th className="py-3 px-3">NISN</th>
                              <th className="py-3 px-3 text-center">Kelas</th>
                              <th className="py-3 px-3 text-center">Benar / Total</th>
                              <th className="py-3 px-3 text-center">Nilai Ujian</th>
                              <th className="py-3 px-3 text-center">Status</th>
                              <th className="py-3 px-3">Waktu Selesai</th>
                              <th className="py-3 px-3 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {mode1Attempts.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                                  Belum ada siswa dari kelas yang dipilih yang menyelesaikan ujian {currentSelectedExam.title}.
                                </td>
                              </tr>
                            ) : (
                              mode1Attempts.map((att, idx) => (
                                <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                  <td className="py-3 px-4 font-bold text-slate-900">{att.studentName}</td>
                                  <td className="py-3 px-3 font-mono text-slate-500">{att.studentNisn || '-'}</td>
                                  <td className="py-3 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                      {att.studentClass}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-center font-medium text-slate-600">
                                    {att.correctCount} / {att.totalQuestions}
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <span className="text-sm font-black text-blue-600">{att.score}</span>
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        att.isPassed
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {att.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-[11px] text-slate-500">
                                    {new Date(att.completedAt).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => setSelectedAttemptForReview(att)}
                                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 p-1 hover:bg-blue-50 rounded"
                                        title="Review Jawaban & Pembahasan"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Review</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          const matchedStudent: User = allUsers.find((u) => u.id === att.studentId || u.fullName === att.studentName) || {
                                            id: att.studentId,
                                            username: att.studentName.toLowerCase().replace(/\s+/g, '_'),
                                            fullName: att.studentName,
                                            role: 'student',
                                            status: 'active',
                                            createdAt: new Date().toISOString(),
                                            classGroup: att.studentClass,
                                            nisn: att.studentNisn,
                                          };
                                          setPrintModalType('student_transcript');
                                          setPrintModalStudent(matchedStudent);
                                          setIsPrintModalOpen(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 p-1 hover:bg-indigo-50 rounded"
                                        title="Cetak Transkrip Siswa"
                                      >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Transkrip</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                          {mode1Attempts.length > 0 && (
                            <tfoot className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-slate-800 text-xs">
                              <tr>
                                <td colSpan={5} className="py-3 px-4 text-right uppercase tracking-wider text-slate-700">
                                  Rata-Rata Nilai Kelas:
                                </td>
                                <td className="py-3 px-3 text-center text-sm font-black text-blue-700">
                                  {mode1AvgScore.toFixed(1)}
                                </td>
                                <td colSpan={3} className="py-3 px-4 text-xs font-semibold text-slate-600">
                                  Ketuntasan: {mode1PassingRate}% (KKM: {currentSelectedExam.passingScore})
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                    Pilih paket ujian terlebih dahulu.
                  </div>
                )}
              </div>
            )}

            {/* ================= MODE 2: TRANSKRIP & LEGER NILAI KESELURUHAN ================= */}
            {resultsViewMode === 'all_exams_leger' && (
              <div className="space-y-4">
                {/* Leger Overview Banner */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-indigo-950 text-sm">
                      Leger Nilai Keseluruhan Ulangan / Latihan Siswa
                    </h4>
                    <p className="text-indigo-800/80 text-[11px] mt-0.5">
                      Menampilkan perbandingan nilai Ulangan 1, Ulangan 2, Ulangan 3 dan seterusnya beserta kalkulasi rata-rata per ulangan dan rata-rata kumulatif per siswa.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setPrintModalType('class_leger');
                        setPrintModalTargetClass(resultsSpecificClass !== 'Semua' ? resultsSpecificClass : resultsGradeFilter);
                        setIsPrintModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Leger Kelas</span>
                    </button>
                  </div>
                </div>

                {/* Leger Matrix Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="py-3 px-3 w-12 text-center border-r border-slate-200">No</th>
                          <th className="py-3 px-3 font-mono text-slate-600 border-r border-slate-200">NISN</th>
                          <th className="py-3 px-4 min-w-[180px] border-r border-slate-200">Nama Lengkap Siswa</th>
                          <th className="py-3 px-3 text-center border-r border-slate-200">Kelas</th>
                          {examsForLeger.map((ex, exIdx) => (
                            <th key={ex.id} className="py-3 px-3 text-center min-w-[100px] border-r border-slate-200">
                              <span className="block text-indigo-700 font-extrabold">U{exIdx + 1}</span>
                              <span className="block text-[9px] text-slate-500 font-normal truncate max-w-[120px]" title={ex.title}>
                                {ex.title}
                              </span>
                            </th>
                          ))}
                          <th className="py-3 px-3 text-center min-w-[90px] bg-blue-50/80 text-blue-900 border-r border-slate-200 font-extrabold">
                            Rata-Rata
                          </th>
                          <th className="py-3 px-3 text-center w-20 border-r border-slate-200">Predikat</th>
                          <th className="py-3 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mode2Students.length === 0 ? (
                          <tr>
                            <td colSpan={6 + examsForLeger.length} className="py-8 text-center text-slate-400 text-xs">
                              Tidak ada siswa yang terdata pada kelompok {resultsGradeFilter} {resultsSpecificClass !== 'Semua' ? `(${resultsSpecificClass})` : ''}.
                            </td>
                          </tr>
                        ) : (
                          mode2Students.map((student, sIdx) => {
                            // Find attempts by this student
                            const studentScores: number[] = [];

                            return (
                              <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-3 text-center font-bold text-slate-400 border-r border-slate-100">
                                  {sIdx + 1}
                                </td>
                                <td className="py-3 px-3 font-mono text-slate-500 border-r border-slate-100">
                                  {student.nisn || '-'}
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-100">
                                  {student.fullName}
                                </td>
                                <td className="py-3 px-3 text-center border-r border-slate-100">
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                    {student.classGroup}
                                  </span>
                                </td>

                                {/* Exam score columns */}
                                {examsForLeger.map((ex) => {
                                  const att = attempts.find((a) => a.studentId === student.id && a.examId === ex.id);
                                  if (att) {
                                    studentScores.push(att.score);
                                  }
                                  return (
                                    <td key={ex.id} className="py-3 px-3 text-center border-r border-slate-100 font-semibold">
                                      {att ? (
                                        <span className={att.score >= ex.passingScore ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                                          {att.score}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>
                                  );
                                })}

                                {/* Average Score */}
                                {(() => {
                                  const avg = studentScores.length > 0
                                    ? Math.round(studentScores.reduce((a, b) => a + b, 0) / studentScores.length)
                                    : null;
                                  const predicate = avg !== null
                                    ? avg >= 85
                                      ? 'Sangat Baik'
                                      : avg >= 75
                                      ? 'Baik'
                                      : 'Remedial'
                                    : '-';
                                  return (
                                    <>
                                      <td className="py-3 px-3 text-center bg-blue-50/50 border-r border-slate-100">
                                        {avg !== null ? (
                                          <span className="text-sm font-black text-blue-700">{avg}</span>
                                        ) : (
                                          <span className="text-slate-400 text-[11px]">-</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-3 text-center border-r border-slate-100">
                                        <span
                                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            predicate === 'Sangat Baik'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : predicate === 'Baik'
                                              ? 'bg-blue-100 text-blue-800'
                                              : 'bg-rose-100 text-rose-800'
                                          }`}
                                        >
                                          {predicate}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3 text-right">
                                        <button
                                          onClick={() => {
                                            setPrintModalType('student_transcript');
                                            setPrintModalStudent(student);
                                            setIsPrintModalOpen(true);
                                          }}
                                          className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 p-1 hover:bg-indigo-50 rounded"
                                          title="Cetak Transkrip Nilai Siswa Ini"
                                        >
                                          <Printer className="w-3.5 h-3.5" />
                                          <span>Cetak Transkrip</span>
                                        </button>
                                      </td>
                                    </>
                                  );
                                })()}
                              </tr>
                            );
                          })
                        )}
                      </tbody>

                      {/* Footer Row: Rata-Rata Per Ulangan dan Rata-Rata Total Kelas */}
                      {mode2Students.length > 0 && (
                        <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800 text-xs">
                          <tr>
                            <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-slate-700 border-r border-slate-200">
                              Rata-Rata Per Ulangan:
                            </td>
                            {examsForLeger.map((ex) => (
                              <td key={ex.id} className="py-3 px-3 text-center border-r border-slate-200 text-blue-700 font-black">
                                {examAverages[ex.id] || 0}
                              </td>
                            ))}
                            {(() => {
                              const validAvgs = Object.values(examAverages).filter((v) => v > 0);
                              const grandAverage = validAvgs.length > 0
                                ? Math.round(validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length)
                                : 0;
                              return (
                                <>
                                  <td className="py-3 px-3 text-center bg-blue-100 text-blue-900 border-r border-slate-200 text-sm font-black">
                                    {grandAverage}
                                  </td>
                                  <td colSpan={2} className="py-3 px-3 text-center text-[10px] text-slate-500 font-normal">
                                    Rata-Rata Total Kelas
                                  </td>
                                </>
                              );
                            })()}
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. Monitor & Reset Layar CBT Siswa (Admin Only) */}
      {currentUser.role === 'admin' && activeTab === 'cbt_locks' && (
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Pengawasan Anti-Curang & Buka Kunci Layar CBT</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Pusat Reset Akses & Monitor Layar Ujian Siswa
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Siswa terkunci otomatis di layar CBT. Jika siswa mencoba keluar dari layar (berganti tab browser, membuka aplikasi lain, atau keluar dari fullscreen), sistem otomatis <strong>memblokir siswa</strong>. 
                <span className="text-emerald-700 font-semibold ml-1">
                  Seluruh jawaban asal siswa tetap tersimpan aman di database.
                </span> Klik <strong>"Buka Blokir"</strong> untuk mengizinkan siswa melanjutkan ujian.
              </p>
            </div>

            {lockedSessionsCount > 0 && onUnlockExamSession && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Buka blokir untuk SEMUA ${lockedSessionsCount} siswa yang saat ini terkunci? Jawaban masing-masing siswa tetap tersimpan aman.`
                    )
                  ) {
                    cbtSessionLocks
                      .filter((l) => l.isLocked)
                      .forEach((l) => onUnlockExamSession(l.id));
                  }
                }}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all"
              >
                <Unlock className="w-4 h-4" />
                <span>Buka Blokir Semua ({lockedSessionsCount} Siswa)</span>
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-2xl border shadow-xs ${
                lockedSessionsCount > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-950 ring-2 ring-rose-300'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Siswa Terblokir Saat Ini</span>
                <ShieldAlert className={`w-4 h-4 ${lockedSessionsCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
              </div>
              <div className="text-3xl font-black mt-2 text-rose-600">
                {lockedSessionsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {lockedSessionsCount > 0
                  ? 'Memerlukan reset/buka kunci dari guru pengawas'
                  : 'Semua siswa tertib di layar ujian'}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Total Riwayat Sesi CBT</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black mt-2 text-blue-600">
                {cbtSessionLocks.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Sesi ujian terpantau oleh sistem anti-curang
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Status Keamanan Sistem</span>
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm font-black mt-2 text-emerald-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Fullscreen & Anti-Tab Aktif
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Auto-save jawaban aktif berkala
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Cari siswa, NISN, atau paket ujian..."
                value={searchLockQuery}
                onChange={(e) => setSearchLockQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Status:</span>
              <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs">
                <button
                  onClick={() => setFilterLockStatus('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    filterLockStatus === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({cbtSessionLocks.length})
                </button>
                <button
                  onClick={() => setFilterLockStatus('locked')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    filterLockStatus === 'locked'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-700 hover:text-rose-900'
                  }`}
                >
                  Terblokir ({lockedSessionsCount})
                </button>
                <button
                  onClick={() => setFilterLockStatus('unlocked')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    filterLockStatus === 'unlocked'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dibuka ({cbtSessionLocks.filter((l) => !l.isLocked).length})
                </button>
              </div>
            </div>
          </div>

          {/* Table of Session Locks */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Nama Siswa & NISN</th>
                    <th className="py-3 px-3">Kelas / Sesi</th>
                    <th className="py-3 px-4">Paket Ujian CBT</th>
                    <th className="py-3 px-3">Status Layar</th>
                    <th className="py-3 px-3">Pelanggaran</th>
                    <th className="py-3 px-3">Jawaban Asal</th>
                    <th className="py-3 px-3">Sisa Waktu</th>
                    <th className="py-3 px-3 text-right">Aksi Reset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cbtSessionLocks
                    .filter((l) => {
                      if (filterLockStatus === 'locked') return l.isLocked;
                      if (filterLockStatus === 'unlocked') return !l.isLocked;
                      return true;
                    })
                    .filter((l) => {
                      const q = searchLockQuery.toLowerCase();
                      return (
                        l.studentName.toLowerCase().includes(q) ||
                        (l.studentNisn || '').toLowerCase().includes(q) ||
                        l.examTitle.toLowerCase().includes(q) ||
                        (l.studentClass || '').toLowerCase().includes(q)
                      );
                    })
                    .map((l) => {
                      const savedCount = Object.keys(l.savedAnswers || {}).length;
                      const minutesLeft = Math.floor(l.savedSecondsRemaining / 60);
                      const secondsLeft = l.savedSecondsRemaining % 60;

                      return (
                        <tr
                          key={l.id}
                          className={`transition-colors ${
                            l.isLocked ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{l.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              NISN: {l.studentNisn || '-'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              {l.studentClass || 'Umum'}
                            </span>
                            {l.studentSession && (
                              <span className="block text-[10px] text-slate-500 mt-0.5">
                                {l.studentSession}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {l.examTitle}
                          </td>
                          <td className="py-3.5 px-3">
                            {l.isLocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-xs animate-pulse">
                                <Lock className="w-3 h-3" />
                                <span>TERBLOKIR</span>
                              </span>
                            ) : l.isCompleted ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Selesai</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                <Unlock className="w-3 h-3 text-blue-600" />
                                <span>Dibuka ({l.unlockedBy || 'Admin'})</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="text-[11px] font-bold text-rose-700">
                              {l.violationCount}x Percobaan
                            </div>
                            <div className="text-[10px] text-slate-500 max-w-[200px] truncate" title={l.lockReason}>
                              {l.lockReason || 'Keluar layar CBT'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{savedCount} Soal Tersimpan</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="text-xs font-mono font-bold text-slate-800">
                              {minutesLeft}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
                            </div>
                            <div className="text-[10px] text-slate-400">Sisa Pengerjaan</div>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {l.isLocked && onUnlockExamSession && (
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Buka blokir ujian untuk "${l.studentName}"?\n\nJawaban yang telah diisi (${savedCount} soal) tetap tersimpan utuh dan siswa dapat langsung melanjutkan ujian.`
                                      )
                                    ) {
                                      onUnlockExamSession(l.id);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                                  title="Izinkan siswa kembali masuk dan melanjutkan pengerjaan CBT"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Buka Blokir</span>
                                </button>
                              )}

                              {onResetExamSession && (
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Reset total sesi CBT untuk "${l.studentName}"?\n\nPeringatan: Ini akan menghapus sesi terkunci ini. Gunakan hanya jika ingin siswa memulai ulang dari awal.`
                                      )
                                    ) {
                                      onResetExamSession(l.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Reset/Hapus Sesi Ini"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {cbtSessionLocks.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        Belum ada sesi CBT yang terkunci atau terdaftar. Seluruh siswa ujian berjalan tertib.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal: Question-by-Question review with student answer vs correct answer and step-by-step explanation */}
      {selectedAttemptForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Review Hasil Ujian CBT</span>
                <h3 className="text-lg font-black text-slate-900">{selectedAttemptForReview.examTitle}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Siswa: {selectedAttemptForReview.studentName} ({selectedAttemptForReview.studentClass})
                </div>
              </div>
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score header */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Skor Akhir</span>
                <div className="text-xl font-black text-blue-600">{selectedAttemptForReview.score}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Jawaban Benar</span>
                <div className="text-xl font-black text-emerald-600">
                  {selectedAttemptForReview.correctCount}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Jawaban Salah</span>
                <div className="text-xl font-black text-rose-500">
                  {selectedAttemptForReview.wrongCount}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Status Kelulusan</span>
                <div
                  className={`text-sm font-bold mt-1 ${
                    selectedAttemptForReview.isPassed ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {selectedAttemptForReview.isPassed ? 'LULUS' : 'REMEDIAL'}
                </div>
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="space-y-4">
              {(() => {
                const targetExam = exams.find((e) => e.id === selectedAttemptForReview.examId);
                if (!targetExam) {
                  return (
                    <p className="text-xs text-slate-400">
                      Rincian soal paket ini telah diperbarui atau dipindahkan.
                    </p>
                  );
                }

                return targetExam.questions.map((q, idx) => {
                  const studentAns = selectedAttemptForReview.answers[q.id];
                  let isCorrect = false;
                  let pointsEarned = 0;

                  if (q.questionType === 'mcma') {
                    const studentPicks = Array.isArray(studentAns)
                      ? studentAns
                      : studentAns
                      ? [studentAns]
                      : [];
                    const correctKeys = q.correctOptionIds || [];
                    const correctPicks = studentPicks.filter((p) => correctKeys.includes(p)).length;
                    const wrongPicks = studentPicks.filter((p) => !correctKeys.includes(p)).length;
                    const ratio = Math.max(0, (correctPicks - wrongPicks) / Math.max(1, correctKeys.length));
                    pointsEarned = Math.round(ratio * (q.points || 20));
                    isCorrect = ratio >= 0.99;
                  } else if (q.questionType === 'pg_kompleks') {
                    const studentStmts =
                      typeof studentAns === 'object' && studentAns !== null && !Array.isArray(studentAns)
                        ? (studentAns as Record<string, 'benar' | 'salah'>)
                        : {};
                    const statements = q.statements || [];
                    const matchCount = statements.filter(
                      (s) => studentStmts[s.id] === s.correctValue
                    ).length;
                    const ratio = matchCount / Math.max(1, statements.length);
                    pointsEarned = Math.round(ratio * (q.points || 20));
                    isCorrect = ratio >= 0.99;
                  } else {
                    // PG Tunggal
                    isCorrect = studentAns === q.correctOptionId;
                    pointsEarned = isCorrect ? (q.points || 20) : 0;
                  }

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                        isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : pointsEarned > 0
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">Soal Nomor {idx + 1}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              q.questionType === 'mcma'
                                ? 'bg-purple-100 text-purple-800'
                                : q.questionType === 'pg_kompleks'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {q.questionType === 'mcma'
                              ? 'MCMA'
                              : q.questionType === 'pg_kompleks'
                              ? 'PG Kompleks'
                              : 'PG Tunggal'}
                          </span>
                        </div>
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : pointsEarned > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCorrect
                            ? `Benar Penuh (+${pointsEarned} Poin)`
                            : pointsEarned > 0
                            ? `Sebagian (+${pointsEarned}/${q.points || 20} Poin)`
                            : `Salah (0 Poin)`}
                        </span>
                      </div>

                      <div className="text-slate-900 font-medium">{q.questionText}</div>

                      {q.questionFormula && (
                        <div className="p-2 rounded bg-white font-mono text-xs text-indigo-700 font-bold border border-slate-200">
                          {q.questionFormula}
                        </div>
                      )}

                      {/* Options breakdown for PG Tunggal */}
                      {(!q.questionType || q.questionType === 'pg_tunggal') && (
                        <div className="space-y-1">
                          {q.options?.map((opt) => {
                            const wasChosen = studentAns === opt.id;
                            const isRight = q.correctOptionId === opt.id;

                            return (
                              <div
                                key={opt.id}
                                className={`p-2 rounded-lg flex items-center justify-between ${
                                  isRight
                                    ? 'bg-emerald-100/70 border border-emerald-300 font-bold text-emerald-950'
                                    : wasChosen
                                    ? 'bg-rose-100/70 border border-rose-300 font-medium text-rose-950'
                                    : 'bg-white border border-slate-200 text-slate-600'
                                }`}
                              >
                                <span>
                                  <strong>{opt.id}.</strong> {opt.text}
                                </span>
                                {isRight && (
                                  <span className="text-[10px] font-bold text-emerald-700">Kunci Benar ✓</span>
                                )}
                                {!isRight && wasChosen && (
                                  <span className="text-[10px] font-bold text-rose-600">Jawaban Siswa ✗</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Options breakdown for MCMA */}
                      {q.questionType === 'mcma' && (
                        <div className="space-y-1">
                          {q.options?.map((opt) => {
                            const studentPicks = Array.isArray(studentAns) ? studentAns : [];
                            const wasChosen = studentPicks.includes(opt.id);
                            const isKey = q.correctOptionIds?.includes(opt.id);

                            return (
                              <div
                                key={opt.id}
                                className={`p-2 rounded-lg flex items-center justify-between ${
                                  isKey && wasChosen
                                    ? 'bg-emerald-100/70 border border-emerald-300 font-bold text-emerald-950'
                                    : isKey && !wasChosen
                                    ? 'bg-purple-100/70 border border-purple-300 font-medium text-purple-950'
                                    : !isKey && wasChosen
                                    ? 'bg-rose-100/70 border border-rose-300 font-medium text-rose-950'
                                    : 'bg-white border border-slate-200 text-slate-600'
                                }`}
                              >
                                <span>
                                  <strong>{opt.id}.</strong> {opt.text}
                                </span>
                                {isKey && wasChosen && (
                                  <span className="text-[10px] font-bold text-emerald-700">
                                    Kunci Benar & Dipilih Siswa ✓
                                  </span>
                                )}
                                {isKey && !wasChosen && (
                                  <span className="text-[10px] font-bold text-purple-700">
                                    Kunci Benar (Tidak Dipilih)
                                  </span>
                                )}
                                {!isKey && wasChosen && (
                                  <span className="text-[10px] font-bold text-rose-600">
                                    Pilihan Keliru ✗
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Statements breakdown for PG Kompleks */}
                      {q.questionType === 'pg_kompleks' && (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px]">
                              <tr>
                                <th className="p-2">Pernyataan</th>
                                <th className="p-2 text-center w-28">Kunci Jawaban</th>
                                <th className="p-2 text-center w-28">Jawaban Siswa</th>
                                <th className="p-2 text-right w-20">Hasil</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                              {q.statements?.map((stmt) => {
                                const studentStmts =
                                  typeof studentAns === 'object' && studentAns !== null && !Array.isArray(studentAns)
                                    ? (studentAns as Record<string, 'benar' | 'salah'>)
                                    : {};
                                const userVal = studentStmts[stmt.id];
                                const isMatch = userVal === stmt.correctValue;

                                return (
                                  <tr key={stmt.id} className="hover:bg-slate-50/50">
                                    <td className="p-2 text-slate-800">{stmt.statementText}</td>
                                    <td className="p-2 text-center font-bold">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] ${
                                          stmt.correctValue === 'benar'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-rose-100 text-rose-800'
                                        }`}
                                      >
                                        {stmt.correctValue === 'benar' ? 'BENAR' : 'SALAH'}
                                      </span>
                                    </td>
                                    <td className="p-2 text-center font-bold">
                                      {userVal ? (
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] ${
                                            userVal === 'benar'
                                              ? 'bg-slate-100 text-slate-800'
                                              : 'bg-slate-100 text-slate-800'
                                          }`}
                                        >
                                          {userVal === 'benar' ? 'BENAR' : 'SALAH'}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 text-[10px]">Belum Dijawab</span>
                                      )}
                                    </td>
                                    <td className="p-2 text-right font-bold">
                                      <span
                                        className={`text-[10px] ${
                                          isMatch ? 'text-emerald-700' : 'text-rose-600'
                                        }`}
                                      >
                                        {isMatch ? 'Tepat ✓' : 'Keliru ✗'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 leading-relaxed font-sans">
                          <strong className="text-blue-700 block mb-0.5">Pembahasan & Langkah Pengerjaan:</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Exam Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingExam ? 'Ubah Paket Ujian CBT' : 'Buat Paket Ujian CBT Baru'}
              </h3>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Paket Ujian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PTS CBT Matematika Kelas X Semester Ganjil"
                  value={formExamTitle}
                  onChange={(e) => setFormExamTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={formExamGrade}
                    onChange={(e) => setFormExamGrade(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Kelas 7">Kelas 7</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 9">Kelas 9</option>
                    <option value="Semua Kelas">Semua Kelas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={formExamSubject}
                    onChange={(e) => setFormExamSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi Ujian (Menit)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    required
                    value={formExamDuration}
                    onChange={(e) => setFormExamDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Standar KKM (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formExamPassing}
                    onChange={(e) => setFormExamPassing(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instruksi / Deskripsi Ujian</label>
                <textarea
                  rows={2}
                  value={formExamDesc}
                  onChange={(e) => setFormExamDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-active-exam"
                  checked={formExamIsActive}
                  onChange={(e) => setFormExamIsActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chk-active-exam" className="font-semibold text-slate-700 cursor-pointer">
                  Aktifkan Paket Ujian (Dapat langsung dikerjakan siswa)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs"
                >
                  {editingExam ? 'Simpan Pengaturan' : 'Buat Ujian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Question Modal */}
      {isQuestionModalOpen && (() => {
        const modalTargetExam = exams.find((e) => e.id === selectedExamIdForQuestions) || null;
        if (!modalTargetExam) return null;
        const currentQuestionsCount = modalTargetExam.questions?.length || 0;
        const nextQuestionNumber = currentQuestionsCount + 1;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black">
                      {modalTargetExam.gradeLevel}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {editingQuestion ? `Edit Butir Soal #${editingQuestion.number || ''}` : `Input Butir Soal #${nextQuestionNumber}`}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {editingQuestion ? 'Edit Butir Soal CBT' : `Tambah Soal Baru ke ${modalTargetExam.title}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Paket: <strong className="text-slate-800">{modalTargetExam.title}</strong> • Total tersimpan: <strong className="text-blue-700">{currentQuestionsCount} butir</strong> (bebas tambah tanpa batasan)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuestionModalOpen(false);
                    setQuestionSaveNotice(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Real-time notification banner inside modal */}
              {questionSaveNotice && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-emerald-900 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{questionSaveNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuestionSaveNotice(null)}
                    className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={(e) => handleSaveQuestion(e, questionSubmitMode === 'continue')} className="space-y-4 mt-4 text-xs">
              {/* Bentuk Soal Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Bentuk Soal CBT</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormQuestionType('pg_tunggal')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formQuestionType === 'pg_tunggal'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">PG Tunggal</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                      Pilihan A, B, C, D (1 Jawaban Benar)
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormQuestionType('mcma')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formQuestionType === 'mcma'
                        ? 'border-purple-500 bg-purple-50/80 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">PG Kompleks (MCMA)</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                      Pilihan A, B, C, D (Jawaban Benar &gt; 1)
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormQuestionType('pg_kompleks')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formQuestionType === 'pg_kompleks'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">PG Kompleks Pernyataan</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                      Tabel Evaluasi (Benar / Salah)
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pertanyaan Soal</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan teks pertanyaan matematika di sini..."
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Formula Matematika Utama (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: f(x) = 2x² - 8x + 6"
                  value={formQuestionFormula}
                  onChange={(e) => setFormQuestionFormula(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Form Options for PG Tunggal and MCMA (Strictly A, B, C, D) */}
              {(formQuestionType === 'pg_tunggal' || formQuestionType === 'mcma') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800">Pilihan Jawaban (A, B, C, D):</label>
                    <span className="text-[10px] text-slate-400 font-medium">Hanya 4 Pilihan (A - D)</span>
                  </div>
                  {[
                    { id: 'A', val: formOptA, setVal: setFormOptA },
                    { id: 'B', val: formOptB, setVal: setFormOptB },
                    { id: 'C', val: formOptC, setVal: setFormOptC },
                    { id: 'D', val: formOptD, setVal: setFormOptD },
                  ].map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-100 font-bold flex items-center justify-center text-slate-700 shrink-0">
                        {opt.id}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Pilihan ${opt.id}...`}
                        value={opt.val}
                        onChange={(e) => opt.setVal(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Kunci Jawaban untuk PG Tunggal */}
              {formQuestionType === 'pg_tunggal' && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70 space-y-1.5">
                  <label className="block font-bold text-blue-950">Kunci Jawaban Benar (1 Pilihan):</label>
                  <select
                    value={formCorrectOpt}
                    onChange={(e) => setFormCorrectOpt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-blue-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-bold text-blue-900"
                  >
                    <option value="A">Pilihan A</option>
                    <option value="B">Pilihan B</option>
                    <option value="C">Pilihan C</option>
                    <option value="D">Pilihan D</option>
                  </select>
                </div>
              )}

              {/* Kunci Jawaban untuk MCMA (Multiple Choice Multiple Answer) */}
              {formQuestionType === 'mcma' && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-purple-950">
                      Kunci Jawaban Benar MCMA (Centang Semua yang Benar):
                    </label>
                    <span className="text-[10px] text-purple-700 font-medium">
                      Terpilih: {formCorrectOptIds.join(', ') || 'Belum ada'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const isChecked = formCorrectOptIds.includes(optKey);
                      return (
                        <button
                          key={optKey}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              if (formCorrectOptIds.length > 1) {
                                setFormCorrectOptIds(formCorrectOptIds.filter((k) => k !== optKey));
                              }
                            } else {
                              setFormCorrectOptIds([...formCorrectOptIds, optKey].sort());
                            }
                          }}
                          className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                            isChecked
                              ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Pilihan {optKey}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-purple-800 leading-tight">
                    * <strong>Penskoran Proporsional MCMA:</strong> Skor siswa dihitung otomatis berdasarkan proporsi jawaban benar yang dipilih.
                  </p>
                </div>
              )}

              {/* Form Pernyataan untuk PG Kompleks (Benar / Salah) */}
              {formQuestionType === 'pg_kompleks' && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-bold text-amber-950">
                        Daftar Pernyataan & Kunci Evaluasi (Benar / Salah):
                      </label>
                      <p className="text-[10px] text-amber-800">
                        Tambahkan pernyataan matematika untuk dinilai Benar atau Salah oleh siswa.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormStatements([
                          ...formStatements,
                          {
                            id: `stmt_${Date.now()}_${formStatements.length + 1}`,
                            statementText: '',
                            correctValue: 'benar',
                          },
                        ])
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pernyataan</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formStatements.map((stmt, idx) => (
                      <div
                        key={stmt.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center text-slate-600 text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder={`Tulis pernyataan ${idx + 1}...`}
                          value={stmt.statementText}
                          onChange={(e) =>
                            setFormStatements(
                              formStatements.map((s) =>
                                s.id === stmt.id ? { ...s, statementText: e.target.value } : s
                              )
                            )
                          }
                          className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setFormStatements(
                                formStatements.map((s) =>
                                  s.id === stmt.id ? { ...s, correctValue: 'benar' } : s
                                )
                              )
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                              stmt.correctValue === 'benar'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            ✓ Benar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormStatements(
                                formStatements.map((s) =>
                                  s.id === stmt.id ? { ...s, correctValue: 'salah' } : s
                                )
                              )
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                              stmt.correctValue === 'salah'
                                ? 'bg-rose-600 border-rose-600 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            ✗ Salah
                          </button>
                          {formStatements.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormStatements(formStatements.filter((s) => s.id !== stmt.id))
                              }
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Hapus Pernyataan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-amber-800 leading-tight">
                    * <strong>Penskoran Proporsional PG Kompleks:</strong> Setiap butir pernyataan bernilai bobot proporsional terhadap total bobot soal.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bobot Poin Soal</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center text-[11px] text-slate-500 pt-5">
                  Bobot standar 20 poin (dikonversi ke skala 100 secara otomatis).
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pembahasan & Langkah Solusi
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan rumus dan langkah pengerjaan yang benar agar siswa dapat mempelajarinya saat review..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Dapat menambah butir soal sebanyak mungkin tanpa batasan.</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuestionModalOpen(false);
                      setQuestionSaveNotice(null);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                  {editingQuestion ? (
                    <button
                      type="submit"
                      onClick={() => setQuestionSubmitMode('close')}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan Soal</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="submit"
                        onClick={() => setQuestionSubmitMode('close')}
                        className="px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold cursor-pointer text-xs"
                      >
                        Simpan & Tutup
                      </button>
                      <button
                        type="submit"
                        onClick={() => setQuestionSubmitMode('continue')}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Simpan & Tambah Soal Berikutnya (+1)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    })()}
      {/* Student Login Modal for starting CBT Exam */}
      <CBTStudentLoginModal
        isOpen={Boolean(loginModalExam)}
        exam={loginModalExam}
        users={allUsers}
        onClose={() => setLoginModalExam(null)}
        onLoginSuccess={(student, targetExam) => {
          if (onCbtStudentLogin) {
            onCbtStudentLogin(student, targetExam);
          }
          onStartExam(targetExam, student);
          setLoginModalExam(null);
        }}
      />

      {/* Print Report Modal (Exam Recap, Class Leger, Student Transcript) */}
      <CBTPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        printType={printModalType}
        exam={printModalExam}
        exams={exams}
        attempts={attempts}
        students={allUsers.filter((u) => u.role === 'student')}
        targetClass={printModalTargetClass}
        selectedStudent={printModalStudent}
      />
    </div>
  );
};
