export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  password?: string;
  email?: string; // Email untuk login Firebase
  firebaseUid?: string; // UID Firebase Auth (e.g. QIdqovxl9pR55TeaIJj6eNe45gF2)
  nisn?: string;
  classGroup?: string;
  session?: string; // Sesi 1, Sesi 2, Sesi 3, dll
  examSession?: string; // Sesi 1, Sesi 2, alias
  examTime?: string; // 07:30 - 09:30 WIB, dll
  isSuperAdmin?: boolean; // Hanya guru/admin utama yang bisa kelola admin lain
  status: 'active' | 'inactive';
  createdAt: string;
  subjectAssigned?: string; // Bidang pengampu / catatan guru
}

export interface FirebaseSyncConfig {
  projectId: string; // e.g. 'aliemath'
  superAdminUid: string; // 'QIdqovxl9pR55TeaIJj6eNe45gF2'
  firestoreCollection: string; // 'appData'
  firestoreDoc: string; // 'main'
  autoSync: boolean; // Simpan otomatis setiap perubahan
  lastSyncedAt?: string;
  lastStatus?: 'connected' | 'error' | 'syncing' | 'idle';
  lastErrorMessage?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'Pengumuman' | 'Tips & Trik' | 'Prestasi' | 'Jadwal' | 'Materi';
  author: string;
  publishDate: string;
  isPinned: boolean;
  coverGradient?: string;
  imageUrl?: string; // Upload gambar jpeg/jpg
  embedLink?: string; // Link sematan eksternal (opsi)
  attachmentName?: string; // File lampiran doc / pdf
  attachmentData?: string; // Data base64 atau URL unduh
  attachmentSize?: string;
  tags: string[];
}

export interface FormulaSnippet {
  title: string;
  formula: string;
  explanation: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  subject: string;
  gradeLevel: 'Kelas 7' | 'Kelas 8' | 'Kelas 9' | 'Umum';
  chapter: string;
  summary: string;
  content: string;
  keyPoints: string[];
  formulas: FormulaSnippet[];
  imageUrl?: string; // Upload gambar / ilustrasi materi
  videoUrl?: string;
  embedLink?: string; // Sematkan link materi (opsi)
  attachmentName?: string; // File lampiran doc / pdf
  attachmentData?: string; // Data base64 atau URL unduh
  attachmentSize?: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export type CBTQuestionType = 'pg_tunggal' | 'pg_kompleks' | 'mcma';

export interface ComplexStatement {
  id: string;
  statementText: string;
  correctValue: 'benar' | 'salah';
}

export interface CBTQuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface CBTQuestion {
  id: string;
  number: number;
  questionType: CBTQuestionType; // 'pg_tunggal' | 'pg_kompleks' | 'mcma'
  questionText: string;
  questionFormula?: string;
  options: CBTQuestionOption[]; // Pilihan A, B, C, D (maksimal 4)
  correctOptionId?: string; // Untuk pg_tunggal (e.g. 'A')
  correctOptionIds?: string[]; // Untuk mcma (e.g. ['A', 'C'])
  statements?: ComplexStatement[]; // Untuk pg_kompleks (pernyataan benar/salah)
  explanation: string;
  points: number;
}

export interface CBTExam {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: 'Kelas 7' | 'Kelas 8' | 'Kelas 9' | 'Semua Kelas';
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  questions: CBTQuestion[];
  createdAt: string;
}

export interface CBTAttempt {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNisn?: string;
  studentSession?: string;
  studentExamTime?: string;
  answers: Record<string, any>; // questionId -> string | string[] | Record<string, 'benar' | 'salah'>
  flaggedQuestions: string[];
  score: number; // e.g. 85
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  startedAt: string;
  completedAt: string;
  timeSpentSeconds: number;
}

export interface GitHubSyncConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface CBTSessionLock {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNisn?: string;
  studentSession?: string;
  studentExamTime?: string;
  examId: string;
  examTitle: string;
  isLocked: boolean; // true = sedang terblokir karena keluar dari layar CBT
  lockReason?: string;
  lockedAt?: string;
  unlockedBy?: string;
  unlockedAt?: string;
  violationCount: number;
  savedAnswers: Record<string, any>; // Jawaban asal siswa tetap tersimpan aman
  savedFlagged: string[];
  savedSecondsRemaining: number;
  isCompleted?: boolean;
  updatedAt: string;
}

export interface PrintSignatureSettings {
  headmasterName: string;
  headmasterNip: string;
  teacherName: string;
  teacherNip: string;
  city?: string;
  dateStr?: string;
}

export interface AppDatabase {
  users: User[];
  news: NewsItem[];
  materials: LearningMaterial[];
  exams: CBTExam[];
  attempts: CBTAttempt[];
  cbtSessionLocks?: CBTSessionLock[];
  gitHubConfig?: GitHubSyncConfig;
  firebaseConfig?: FirebaseSyncConfig;
  printSettings?: PrintSignatureSettings;
  lastUpdatedAt?: string;
}

