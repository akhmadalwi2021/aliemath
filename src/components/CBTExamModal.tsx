import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Check,
  Calendar,
  Lock,
  Unlock,
  ShieldAlert,
  Maximize2,
  Minimize2,
  AlertOctagon,
  RefreshCw,
  Info
} from 'lucide-react';
import { CBTExam, CBTAttempt, CBTSessionLock, User } from '../types';

interface CBTExamModalProps {
  exam: CBTExam;
  student: User;
  initialSessionLock?: CBTSessionLock;
  onUpdateSessionProgress?: (progress: {
    answers: Record<string, any>;
    flagged: string[];
    secondsRemaining: number;
  }) => void;
  onLockExamSession: (lockInfo: {
    examId: string;
    examTitle: string;
    student: User;
    reason: string;
    answers: Record<string, any>;
    flagged: string[];
    secondsRemaining: number;
  }) => void;
  onUnlockExamSession?: (sessionId: string) => void;
  onCompleteExam: (attempt: CBTAttempt) => void;
  onClose: () => void;
}

export const CBTExamModal: React.FC<CBTExamModalProps> = ({
  exam,
  student,
  initialSessionLock,
  onUpdateSessionProgress,
  onLockExamSession,
  onUnlockExamSession,
  onCompleteExam,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Restore previous saved answers if available
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    return initialSessionLock?.savedAnswers || {};
  });
  const [flagged, setFlagged] = useState<Set<string>>(() => {
    return new Set(initialSessionLock?.savedFlagged || []);
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (initialSessionLock && typeof initialSessionLock.savedSecondsRemaining === 'number' && initialSessionLock.savedSecondsRemaining > 0) {
      return initialSessionLock.savedSecondsRemaining;
    }
    return exam.durationMinutes * 60;
  });

  // Lock and Anti-cheat states
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return Boolean(initialSessionLock?.isLocked);
  });
  const [lockReason, setLockReason] = useState<string>(() => {
    return initialSessionLock?.lockReason || 'Terdeteksi mencoba meninggalkan layar ujian CBT.';
  });
  const [violationCount, setViolationCount] = useState<number>(() => {
    return initialSessionLock?.violationCount || (initialSessionLock?.isLocked ? 1 : 0);
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [justUnlockedNotice, setJustUnlockedNotice] = useState(false);

  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [finalAttempt, setFinalAttempt] = useState<CBTAttempt | null>(null);

  const startTime = useRef(new Date().toISOString());
  const isLockedRef = useRef(isLocked);
  const answersRef = useRef(answers);
  const flaggedRef = useRef(flagged);
  const secondsRemainingRef = useRef(secondsRemaining);
  const showResultScreenRef = useRef(showResultScreen);

  // Keep refs in sync for event listeners
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    flaggedRef.current = flagged;
  }, [flagged]);
  useEffect(() => {
    secondsRemainingRef.current = secondsRemaining;
  }, [secondsRemaining]);
  useEffect(() => {
    showResultScreenRef.current = showResultScreen;
  }, [showResultScreen]);

  // Request fullscreen on enter
  const enterFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          // Ignored if user gesture required
        });
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    enterFullscreen();
  }, []);

  // Sync prop changes if unlocked from external parent
  useEffect(() => {
    if (initialSessionLock) {
      if (!initialSessionLock.isLocked && isLocked) {
        setIsLocked(false);
        setJustUnlockedNotice(true);
        if (initialSessionLock.savedAnswers) {
          setAnswers(initialSessionLock.savedAnswers);
        }
        if (initialSessionLock.savedFlagged) {
          setFlagged(new Set(initialSessionLock.savedFlagged));
        }
        if (typeof initialSessionLock.savedSecondsRemaining === 'number') {
          setSecondsRemaining(initialSessionLock.savedSecondsRemaining);
        }
        setTimeout(() => setJustUnlockedNotice(false), 4000);
      } else if (initialSessionLock.isLocked && !isLocked) {
        setIsLocked(true);
        setLockReason(initialSessionLock.lockReason || 'Akses CBT diblokir oleh sistem.');
      }
    }
  }, [initialSessionLock?.isLocked, initialSessionLock?.updatedAt]);

  // Trigger Lock Mechanism
  const triggerLock = (reason: string) => {
    if (showResultScreenRef.current || isLockedRef.current) return;

    setIsLocked(true);
    setLockReason(reason);
    setViolationCount((prev) => prev + 1);

    onLockExamSession({
      examId: exam.id,
      examTitle: exam.title,
      student,
      reason,
      answers: answersRef.current,
      flagged: Array.from(flaggedRef.current),
      secondsRemaining: secondsRemainingRef.current,
    });
  };

  // Anti-Cheat & Screen Lock Listeners
  useEffect(() => {
    if (showResultScreen || isLocked) return;

    // 1. Visibility change (tab switch or minimize)
    const handleVisibilityChange = () => {
      if (document.hidden && !showResultScreenRef.current && !isLockedRef.current) {
        triggerLock('Terdeteksi berpindah tab browser atau meminimalkan layar ujian CBT.');
      }
    };

    // 2. Window Blur (loss of focus)
    const handleWindowBlur = () => {
      // Debounce slightly to prevent accidental input focus blur
      setTimeout(() => {
        if (!document.hasFocus() && !showResultScreenRef.current && !isLockedRef.current) {
          triggerLock('Terdeteksi kehilangan fokus layar ujian (berpindah ke jendela atau aplikasi lain).');
        }
      }, 500);
    };

    // 3. Fullscreen change (detect student exiting fullscreen)
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull && !showResultScreenRef.current && !isLockedRef.current) {
        triggerLock('Terdeteksi keluar dari mode layar penuh (fullscreen CBT ditutup).');
      }
    };

    // 4. Beforeunload (accidental close or reload)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      triggerLock('Terdeteksi mencoba memuat ulang (reload) atau menutup halaman ujian CBT.');
      e.returnValue = 'Ujian CBT sedang berlangsung! Keluar dari halaman akan memblokir akun ujian Anda!';
      return e.returnValue;
    };

    // 5. Prevent keyboard shortcuts (F5, F11, Ctrl+R, Alt+Tab, Escape)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResultScreenRef.current || isLockedRef.current) return;

      const forbiddenKeys = ['f5', 'f11', 'f12'];
      const keyLower = e.key.toLowerCase();

      if (forbiddenKeys.includes(keyLower) || ((e.ctrlKey || e.metaKey) && ['r', 'w', 't', 'n', 'p'].includes(keyLower))) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock(`Terdeteksi menekan kombinasi tombol pintas terlarang (${e.key}) pada keyboard.`);
      }
    };

    // 6. Disable right click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isLocked, showResultScreen]);

  // Periodic autosave to session storage & App state so answers are NEVER lost
  useEffect(() => {
    if (showResultScreen || isLocked) return;
    onUpdateSessionProgress?.({
      answers,
      flagged: Array.from(flagged),
      secondsRemaining,
    });
  }, [answers, flagged, secondsRemaining, isLocked, showResultScreen]);

  // Countdown timer
  useEffect(() => {
    if (showResultScreen || isLocked) return;

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
  }, [showResultScreen, isLocked]);

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

  const handleToggleMcmaOption = (optionId: string) => {
    if (!currentQuestion) return;
    const currentPicks: string[] = Array.isArray(answers[currentQuestion.id])
      ? answers[currentQuestion.id]
      : [];
    const updated = currentPicks.includes(optionId)
      ? currentPicks.filter((id) => id !== optionId)
      : [...currentPicks, optionId].sort();
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: updated,
    }));
  };

  const handleSetStatementValue = (statementId: string, val: 'benar' | 'salah') => {
    if (!currentQuestion) return;
    const currentMap =
      answers[currentQuestion.id] &&
      typeof answers[currentQuestion.id] === 'object' &&
      !Array.isArray(answers[currentQuestion.id])
        ? answers[currentQuestion.id]
        : {};
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...currentMap,
        [statementId]: val,
      },
    }));
  };

  const isQuestionAnswered = (q: (typeof exam.questions)[0]) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.questionType === 'mcma') {
      return Array.isArray(ans) && ans.length > 0;
    }
    if (q.questionType === 'pg_kompleks') {
      if (typeof ans !== 'object' || Array.isArray(ans)) return false;
      const stmts = q.statements || [];
      return stmts.length > 0 && stmts.every((s) => ans[s.id] !== undefined);
    }
    return typeof ans === 'string' && ans.length > 0;
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
    let earnedTotal = 0;
    let maxTotal = 0;
    let correctCount = 0;
    let wrongCount = 0;

    exam.questions.forEach((q) => {
      const qPoints = q.points || 20;
      maxTotal += qPoints;
      const studentAns = answers[q.id];

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
        const earned = Math.round(ratio * qPoints);
        earnedTotal += earned;
        if (ratio >= 0.99) {
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (q.questionType === 'pg_kompleks') {
        const studentStmts =
          typeof studentAns === 'object' && studentAns !== null && !Array.isArray(studentAns)
            ? (studentAns as Record<string, 'benar' | 'salah'>)
            : {};
        const stmts = q.statements || [];
        const matchCount = stmts.filter((s) => studentStmts[s.id] === s.correctValue).length;
        const ratio = stmts.length > 0 ? matchCount / stmts.length : 0;
        const earned = Math.round(ratio * qPoints);
        earnedTotal += earned;
        if (ratio >= 0.99) {
          correctCount++;
        } else {
          wrongCount++;
        }
      } else {
        // PG Tunggal
        const isCorrect = studentAns === q.correctOptionId;
        if (isCorrect) {
          earnedTotal += qPoints;
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    const percentage = maxTotal > 0 ? Math.min(100, Math.round((earnedTotal / maxTotal) * 100)) : 0;
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
      studentSession: student.examSession || student.session,
      studentExamTime: student.examTime,
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

  const answeredCount = exam.questions.filter(isQuestionAnswered).length;
  const unansweredCount = exam.questions.length - answeredCount;

  // ----------------------------------------------------
  // SCREEN 1: LOCKED SCREEN (AKSES DIBLOKIR KARENA KELUAR LAYAR)
  // ----------------------------------------------------
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Top Red Alert Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 animate-pulse" />

          {/* Alert Icon */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 animate-bounce">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-600/30 text-rose-300 border border-rose-500/50 uppercase tracking-widest">
              <AlertOctagon className="w-3.5 h-3.5" />
              UJIAN CBT DIBLOKIR SISTEM
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Akses Layar CBT Terkunci
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Siswa terdeteksi melakukan pelanggaran dengan mencoba meninggalkan layar ujian CBT.
            </p>
          </div>

          {/* Violation Details Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Peserta Ujian:</span>
              <strong className="text-white font-semibold">{student.fullName} ({student.classGroup || 'Siswa'})</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Paket Ujian:</span>
              <strong className="text-white font-semibold">{exam.title}</strong>
            </div>
            <div className="flex justify-between items-start text-slate-400 gap-2">
              <span className="shrink-0">Alasan Pelanggaran:</span>
              <span className="text-rose-400 font-semibold text-right">{lockReason}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Jumlah Pelanggaran:</span>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold">
                {violationCount} Kali
              </span>
            </div>
          </div>

          {/* Reassurance that Answers are 100% Safe */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-left space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>JAWABAN ASAL SISWA TETAP TERSIMPAN AMAN!</span>
            </div>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              Anda tidak perlu khawatir: Sistem telah menyimpan <strong>{answeredCount} dari {exam.questions.length} soal</strong> yang telah Anda kerjakan beserta sisa waktu ujian (<strong>{formatTime(secondsRemaining)}</strong>). Jawaban tidak akan hilang saat admin membuka blokir.
            </p>
          </div>

          {/* Instruction to call teacher */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-left text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-300 font-bold">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Instruksi untuk Siswa:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Silakan segera angkat tangan dan lapor kepada <strong>Guru Pengawas / Administrator CBT</strong> untuk mereset dan membuka kembali akses ujian Anda. Anda tidak dapat melanjutkan secara mandiri.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                if (initialSessionLock && !initialSessionLock.isLocked) {
                  setIsLocked(false);
                  enterFullscreen();
                } else {
                  alert('Status CBT Masih Terblokir: Harap minta Guru Administrator untuk menekan tombol "Buka Blokir / Izinkan Ujian" pada panel pengawas.');
                }
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Periksa Status Buka Blokir (Refresh)</span>
            </button>

            {/* Quick Simulation Button for Teacher/Testing Demo */}
            {onUnlockExamSession && (
              <button
                onClick={() => {
                  const sessionId = `lock_${student.id}_${exam.id}`;
                  onUnlockExamSession(sessionId);
                  setIsLocked(false);
                  enterFullscreen();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulasi Admin Buka Kunci (Mode Guru / Demo)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN 2: RESULT SUMMARY SCREEN
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // SCREEN 3: ACTIVE LOCKED CBT EXAMINATION RUNNER
  // ----------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xs flex flex-col select-none">
      {/* Just Unlocked Toast Banner */}
      {justUnlockedNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md animate-pulse">
          <Unlock className="w-4 h-4" />
          <span>Akses Ujian Dibuka Kembali oleh Admin! Seluruh jawaban Anda berhasil dipulihkan.</span>
        </div>
      )}

      {/* CBT Anti-Cheat & Screen Lock Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 sm:px-6 py-1.5 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            Layar CBT Terkunci (Anti-Curang Aktif)
          </span>
          <span className="hidden md:inline text-[11px] text-slate-400">
            Dilarang berpindah tab atau keluar dari layar penuh. Pelanggaran akan memblokir ujian.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation test button for testing purposes */}
          <button
            onClick={() => triggerLock('Uji Coba: Siswa mengklik tombol simulasi pindah tab.')}
            className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
            title="Uji coba sistem deteksi keluar layar CBT"
          >
            ⚡ Tes Blokir Keluar Layar
          </button>

          {!isFullscreen ? (
            <button
              onClick={enterFullscreen}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Fullscreen</span>
            </button>
          ) : (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Fullscreen Aktif
            </span>
          )}
        </div>
      </div>

      {/* CBT Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm font-mono">
            CBT
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 line-clamp-1">{exam.title}</h2>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">{student.fullName}</span>
              <span>•</span>
              <span>{student.classGroup || 'Siswa'}</span>
              <span>•</span>
              <span>NISN: {student.nisn || '-'}</span>
              {student.examSession && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    {student.examSession} {student.examTime ? `(${student.examTime})` : ''}
                  </span>
                </>
              )}
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Soal Nomor {currentIndex + 1} dari {exam.questions.length}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      currentQuestion.questionType === 'mcma'
                        ? 'bg-purple-100 text-purple-800'
                        : currentQuestion.questionType === 'pg_kompleks'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {currentQuestion.questionType === 'mcma'
                      ? 'PG Kompleks (MCMA)'
                      : currentQuestion.questionType === 'pg_kompleks'
                      ? 'PG Kompleks (Pernyataan)'
                      : 'PG Tunggal'}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Bobot: {currentQuestion.points || 20} Poin
                </span>
              </div>

              {/* Question Stem */}
              <div className="space-y-3">
                <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                  {currentQuestion.questionText}
                </p>

                {/* Question Formula / Code if exists */}
                {currentQuestion.questionFormula && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-indigo-700">
                    {currentQuestion.questionFormula}
                  </div>
                )}
              </div>

              {/* ANSWER OPTIONS RENDERING BASED ON QUESTION TYPE */}
              <div className="pt-2">
                {/* 1. PG TUNGGAL (Pilihan A, B, C, D) */}
                {currentQuestion.questionType === 'pg_tunggal' && (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Pilihlah satu jawaban yang paling tepat:
                    </div>
                    {currentQuestion.options.slice(0, 4).map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id)}
                          className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className={`text-sm pt-1 leading-relaxed ${isSelected ? 'font-semibold text-blue-950' : 'text-slate-700'}`}>
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. MCMA (Pilihan Ganda Jawaban Ganda A, B, C, D) */}
                {currentQuestion.questionType === 'mcma' && (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-200 mb-3">
                      💡 <strong>Petunjuk Soal MCMA:</strong> Anda dapat memilih <strong>lebih dari satu jawaban</strong> yang benar dengan mencentang kotak di bawah ini.
                    </div>
                    {currentQuestion.options.slice(0, 4).map((opt) => {
                      const currentPicks: string[] = Array.isArray(answers[currentQuestion.id])
                        ? answers[currentQuestion.id]
                        : [];
                      const isChecked = currentPicks.includes(opt.id);

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleToggleMcmaOption(opt.id)}
                          className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                            isChecked
                              ? 'bg-purple-50 border-purple-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 transition-colors ${
                              isChecked
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {isChecked ? <Check className="w-4 h-4" /> : opt.id}
                          </div>
                          <span className={`text-sm pt-1 leading-relaxed ${isChecked ? 'font-semibold text-purple-950' : 'text-slate-700'}`}>
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. PG KOMPLEKS (Tabel Benar/Salah) */}
                {currentQuestion.questionType === 'pg_kompleks' && (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-3">
                      💡 <strong>Petunjuk Soal Kompleks:</strong> Tentukan nilai kebenaran (<strong>Benar</strong> atau <strong>Salah</strong>) untuk setiap pernyataan berikut.
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                          <tr>
                            <th className="p-3 sm:p-4">Pernyataan Soal</th>
                            <th className="p-3 sm:p-4 text-center w-24">Benar</th>
                            <th className="p-3 sm:p-4 text-center w-24">Salah</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(currentQuestion.statements || []).map((stmt) => {
                            const currentAnsMap =
                              answers[currentQuestion.id] &&
                              typeof answers[currentQuestion.id] === 'object' &&
                              !Array.isArray(answers[currentQuestion.id])
                                ? answers[currentQuestion.id]
                                : {};
                            const currentVal = currentAnsMap[stmt.id];

                            return (
                              <tr key={stmt.id} className="hover:bg-slate-50/60">
                                <td className="p-3 sm:p-4 text-slate-800 font-medium">
                                  {stmt.statementText}
                                </td>
                                <td className="p-3 sm:p-4 text-center">
                                  <button
                                    onClick={() => handleSetStatementValue(stmt.id, 'benar')}
                                    className={`w-8 h-8 rounded-lg font-bold text-xs inline-flex items-center justify-center transition-all ${
                                      currentVal === 'benar'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    B
                                  </button>
                                </td>
                                <td className="p-3 sm:p-4 text-center">
                                  <button
                                    onClick={() => handleSetStatementValue(stmt.id, 'salah')}
                                    className={`w-8 h-8 rounded-lg font-bold text-xs inline-flex items-center justify-center transition-all ${
                                      currentVal === 'salah'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    S
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Tidak ada soal dalam paket ini.</div>
          )}

          {/* Navigation Controls at Bottom */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-2 mt-6">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={toggleFlagCurrent}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentQuestion && flagged.has(currentQuestion.id)
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Ragu-Ragu</span>
            </button>

            {currentIndex < exam.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitConfirmOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesai & Kumpulkan</span>
              </button>
            )}
          </div>
        </main>

        {/* Sidebar: Navigation Grid */}
        <aside className="w-full md:w-80 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Daftar Nomor Soal
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                {answeredCount}/{exam.questions.length} Terjawab
              </span>
            </div>

            {/* Grid Numbers */}
            <div className="grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto p-1">
              {exam.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = isQuestionAnswered(q);
                const isFlagged = flagged.has(q.id);

                let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isAnswered) {
                  bgClass = 'bg-blue-600 text-white font-bold';
                }
                if (isFlagged) {
                  bgClass = 'bg-amber-500 text-white font-bold';
                }
                if (isCurrent) {
                  bgClass += ' ring-2 ring-blue-400 ring-offset-2';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs flex items-center justify-center transition-all ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block" />
                <span>Sudah Dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block" />
                <span>Ragu-Ragu ({flagged.size})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 inline-block" />
                <span>Belum Dijawab ({unansweredCount})</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsSubmitConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Kumpulkan Ujian CBT</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Konfirmasi Kumpulkan Ujian</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menyelesaikan ujian CBT ini? Setelah dikumpulkan, Anda tidak dapat mengubah jawaban lagi.
              {unansweredCount > 0 && (
                <span className="block font-semibold text-rose-600 mt-2">
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
