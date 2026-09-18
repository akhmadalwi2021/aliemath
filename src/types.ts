export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  password?: string;
  nisn?: string;
  classGroup?: string;
  status: 'active' | 'inactive';
  createdAt: string;
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
  videoUrl?: string;
  attachmentName?: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface CBTQuestionOption {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface CBTQuestion {
  id: string;
  number: number;
  questionText: string;
  questionFormula?: string;
  options: CBTQuestionOption[];
  correctOptionId: string;
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
  answers: Record<string, string>; // questionId -> optionId
  flaggedQuestions: string[];
  score: number; // e.g. 80
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

export interface AppDatabase {
  users: User[];
  news: NewsItem[];
  materials: LearningMaterial[];
  exams: CBTExam[];
  attempts: CBTAttempt[];
  gitHubConfig?: GitHubSyncConfig;
}
