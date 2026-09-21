import { AppDatabase, GitHubSyncConfig } from '../types';
import { INITIAL_DATABASE } from '../data/initialData';

const STORAGE_KEY = 'aliemath_db_v2';
const LEGACY_STORAGE_KEY = 'aliemath_db_v1';

export function loadDatabase(): AppDatabase {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy key
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
      } else {
        saveDatabase(INITIAL_DATABASE);
        return INITIAL_DATABASE;
      }
    }

    const parsed = JSON.parse(raw);

    // Normalize users: ensure admin has isSuperAdmin
    const users = (parsed.users || INITIAL_DATABASE.users).map((u: any, idx: number) => {
      const isFirstAdmin = u.role === 'admin' && (u.username === 'admin' || u.id === 'usr_admin' || idx === 0);
      return {
        ...u,
        isSuperAdmin: u.isSuperAdmin !== undefined ? u.isSuperAdmin : isFirstAdmin,
        session: u.session || (u.role === 'student' ? 'Sesi 1' : undefined),
        examTime: u.examTime || (u.role === 'student' ? '07:30 - 09:30 WIB' : undefined),
      };
    });

    // Normalize exams: ensure options are only A, B, C, D and questionType is defined
    const exams = (parsed.exams || INITIAL_DATABASE.exams).map((exam: any) => ({
      ...exam,
      questions: (exam.questions || []).map((q: any) => {
        const filteredOptions = (q.options || [])
          .filter((opt: any) => ['A', 'B', 'C', 'D'].includes(opt.id))
          .slice(0, 4);

        return {
          ...q,
          questionType: q.questionType || 'pg_tunggal',
          options: filteredOptions,
          correctOptionId: q.correctOptionId || (filteredOptions[0] ? filteredOptions[0].id : 'A'),
          correctOptionIds: q.correctOptionIds || (q.correctOptionId ? [q.correctOptionId] : ['A']),
          statements: q.statements || [],
        };
      }),
    }));

    // Ensure seed exams exist
    const existingExamIds = new Set(exams.map((e: any) => e.id));
    INITIAL_DATABASE.exams.forEach((seedExam) => {
      if (!existingExamIds.has(seedExam.id)) {
        exams.push(seedExam);
      }
    });

    // Ensure seed users exist
    const existingUserIds = new Set(users.map((u: any) => u.id));
    INITIAL_DATABASE.users.forEach((seedUser) => {
      if (!existingUserIds.has(seedUser.id)) {
        users.push(seedUser);
      }
    });

    const attempts = [...(parsed.attempts || INITIAL_DATABASE.attempts)];
    const existingAttemptIds = new Set(attempts.map((a: any) => a.id));
    INITIAL_DATABASE.attempts.forEach((seedAtt) => {
      if (!existingAttemptIds.has(seedAtt.id)) {
        attempts.push(seedAtt);
      }
    });

    const db: AppDatabase = {
      users,
      news: parsed.news || INITIAL_DATABASE.news,
      materials: parsed.materials || INITIAL_DATABASE.materials,
      exams,
      attempts,
      cbtSessionLocks: parsed.cbtSessionLocks || [],
      gitHubConfig: parsed.gitHubConfig || INITIAL_DATABASE.gitHubConfig,
    };

    // Resave to new key
    saveDatabase(db);
    return db;
  } catch (err) {
    console.error('Failed to load database from localStorage, falling back to initial data:', err);
    return INITIAL_DATABASE;
  }
}

export function saveDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save database to localStorage:', err);
  }
}

export function exportDatabaseAsJson(db: AppDatabase): void {
  const jsonStr = JSON.stringify(db, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `aliemath-database-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function resetDatabaseToDefault(): AppDatabase {
  saveDatabase(INITIAL_DATABASE);
  return INITIAL_DATABASE;
}

// GitHub REST API Integration for using GitHub repository as a cloud database
export async function syncDatabaseWithGitHub(
  db: AppDatabase,
  config: GitHubSyncConfig
): Promise<{ success: boolean; message: string; remoteData?: AppDatabase }> {
  if (!config.token || !config.owner || !config.repo || !config.filePath) {
    return {
      success: false,
      message: 'Konfigurasi GitHub belum lengkap (Token, Owner, Repo, dan Path wajib diisi).',
    };
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`;

  try {
    // 1. Get current file SHA if it exists
    let existingSha: string | undefined;
    const getRes = await fetch(url, {
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (getRes.ok) {
      const data = await getRes.json();
      existingSha = data.sha;
    }

    // 2. Commit updated JSON to GitHub
    const contentPayload = JSON.stringify(db, null, 2);
    // encode to UTF-8 base64
    const base64Content = btoa(unescape(encodeURIComponent(contentPayload)));

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `chore(aliemath): auto-sync database via Aliemath.my.id [${new Date().toISOString()}]`,
        content: base64Content,
        branch: config.branch || 'main',
        sha: existingSha,
      }),
    });

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: `Gagal sinkronisasi ke GitHub: ${errJson.message || putRes.statusText}`,
      };
    }

    return {
      success: true,
      message: `Database berhasil disinkronkan ke GitHub repository (${config.owner}/${config.repo})!`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Kesalahan jaringan saat sinkronisasi GitHub: ${error.message}`,
    };
  }
}

export async function pullDatabaseFromGitHub(
  config: GitHubSyncConfig
): Promise<{ success: boolean; message: string; remoteData?: AppDatabase }> {
  if (!config.token || !config.owner || !config.repo || !config.filePath) {
    return {
      success: false,
      message: 'Konfigurasi GitHub belum lengkap.',
    };
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch || 'main'}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Tidak dapat mengunduh file dari GitHub (${res.status} ${res.statusText}).`,
      };
    }

    const data = await res.json();
    const decodedContent = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
    const parsedData = JSON.parse(decodedContent) as AppDatabase;

    return {
      success: true,
      message: 'Berhasil mengunduh data terbaru dari GitHub!',
      remoteData: parsedData,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal membaca database dari GitHub: ${err.message}`,
    };
  }
}
