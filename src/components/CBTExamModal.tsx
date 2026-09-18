import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Flag,
  Save,
  X,
  Award,
  ArrowRight
} from 'lucide-react';
import { CBTExam, CBTAttempt, User } from '../types';

interface CBTExamModalProps {
  exam: CBTExam;
  student: User;
  onCompleteExam: (attempt: CBTAttempt) => void;
  onClose: () => void;
}

export const CBTExamModal: React.FC<CBTExamModalProps> = ({
  exam,
  student,
  onCompleteExam,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState(exam.durationMinutes * 60);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [finalAttempt, setFinalAttempt] = useState<CBTAttempt | null>(null);

  const startTime = React.useRef(new Date().toISOString());

  // Countdown timer
  useEffect(() => {
    if (showResultScreen) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResultScreen]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = exam.questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const toggleFlagCurrent = () => {
    if (!currentQuestion) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  const handleSubmitExam = () => {
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;

    exam.questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (studentAns === q.correctOptionId) {
        score += q.points || Math.round(100 / exam.questions.length);
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const percentage = Math.round((correctCount / exam.questions.length) * 100);
    const isPassed = percentage >= exam.passingScore;
    const timeSpent = exam.durationMinutes * 60 - secondsRemaining;

    const attempt: CBTAttempt = {
      id: `att_${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId: student.id,
      studentName: student.fullName,
      studentClass: student.classGroup || 'Umum',
      studentNisn: student.nisn,
      answers,
      flaggedQuestions: Array.from(flagged),
      score: percentage,
      correctCount,
      wrongCount,
      totalQuestions: exam.questions.length,
      percentage,
      isPassed,
      startedAt: startTime.current,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
    };

    setFinalAttempt(attempt);
    setShowResultScreen(true);
    setIsSubmitConfirmOpen(false);
    onCompleteExam(attempt);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = exam.questions.length - answeredCount;

  // Result Summary View
  if (showResultScreen && finalAttempt) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
              finalAttempt.isPassed
                ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20'
                : 'bg-amber-100 text-amber-600 shadow-amber-500/20'
            }`}
          >
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                finalAttempt.isPassed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {finalAttempt.isPassed ? 'LULUS KKM' : 'REMEDIAL DIPERLUKAN'}
            </span>
            <h2 className="text-2xl font-black text-slate-900">Hasil Ujian CBT</h2>
            <p className="text-xs text-slate-500 mt-1">{exam.title}</p>
          </div>

          {/* Score Box */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Nilai CBT</div>
              <div className="text-2xl font-black text-blue-600">{finalAttempt.score}</div>
              <div className="text-[10px] text-slate-400">KKM: {exam.passingScore}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Benar</div>
              <div className="text-2xl font-black text-emerald-600">{finalAttempt.correctCount}</div>
              <div className="text-[10px] text-slate-400">dari {finalAttempt.totalQuestions} soal</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Waktu</div>
              <div className="text-base font-bold text-slate-800 mt-1">
                {Math.floor(finalAttempt.timeSpentSeconds / 60)}m {finalAttempt.timeSpentSeconds % 60}s
              </div>
              <div className="text-[10px] text-slate-400">Durasi</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Data nilai telah otomatis terekam ke sistem database Aliemath. Kamu dapat melihat rincian pembahasan soal di menu <strong>Riwayat & Nilai Tugas</strong>.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors"
          >
            Kembali ke Portal Siswa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xs flex flex-col">
      {/* CBT Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm font-mono">
            CBT
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 line-clamp-1">{exam.title}</h2>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>{student.fullName} ({student.classGroup || 'Siswa'})</span>
              <span>•</span>
              <span>NISN: {student.nisn || '-'}</span>
            </div>
          </div>
        </div>

        {/* Timer Box */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
              secondsRemaining < 300
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setIsSubmitConfirmOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Selesai Ujian</span>
          </button>
        </div>
      </header>

      {/* CBT Body: Questions Center + Question Grid Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl w-full mx-auto p-4 gap-4">
        {/* Main Question Area */}
        <main className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-sm">
          {currentQuestion ? (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Soal Nomor {currentIndex + 1} dari {exam.questions.length}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Bobot: {currentQuestion.points || Math.round(100 / exam.questions.length)} Poin
                </span>
              </div>

              {/* Question Text */}
              <div className="text-slate-900 text-base font-medium leading-relaxed">
                {currentQuestion.questionText}
              </div>

              {/* Math Formula Highlight if available */}
              {currentQuestion.questionFormula && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm text-indigo-700 font-bold">
                  {currentQuestion.questionFormula}
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        }`}
                      >
                        {option.id}
                      </div>
                      <span className="text-sm font-medium leading-snug pt-0.5">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Tidak ada butir soal.</p>
          )}

          {/* Navigation Bottom Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3 mt-6">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className={`px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
            </button>

            {/* Ragu-Ragu toggle */}
            <button
              onClick={toggleFlagCurrent}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                currentQuestion && flagged.has(currentQuestion.id)
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{currentQuestion && flagged.has(currentQuestion.id) ? 'Ragu-Ragu (Aktif)' : 'Tandai Ragu-Ragu'}</span>
            </button>

            {currentIndex === exam.questions.length - 1 ? (
              <button
                onClick={() => setIsSubmitConfirmOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <span>Selesaikan Ujian</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
              >
                <span>Soal Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>

        {/* Question Grid Navigator Sidebar */}
        <aside className="w-full md:w-72 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shrink-0 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Nomor Soal CBT
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {answeredCount}/{exam.questions.length} Terjawab
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isFlagged = flagged.has(q.id);
                const isCurrent = currentIndex === idx;

                let colorClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isFlagged) {
                  colorClass = 'bg-amber-400 text-amber-950 font-bold';
                } else if (isAnswered) {
                  colorClass = 'bg-blue-600 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs flex flex-col items-center justify-center relative transition-all ${colorClass} ${
                      isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {answers[q.id] && (
                      <span className="text-[9px] opacity-80 uppercase leading-none font-mono">
                        {answers[q.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-blue-600" />
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-amber-400" />
                <span>Ragu-Ragu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" />
                <span>Belum Dijawab</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsSubmitConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Kumpulkan Ujian
            </button>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Selesai Ujian?</h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda telah menjawab <strong>{answeredCount}</strong> dari{' '}
              <strong>{exam.questions.length}</strong> soal.
              {unansweredCount > 0 && (
                <span className="text-rose-600 font-semibold block mt-1">
                  Masih terdapat {unansweredCount} soal yang belum Anda jawab!
                </span>
              )}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Periksa Kembali
              </button>
              <button
                onClick={handleSubmitExam}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                Ya, Kumpulkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
