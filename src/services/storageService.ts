import { AppDatabase, GitHubSyncConfig, PrintSignatureSettings } from '../types';
import { INITIAL_DATABASE } from '../data/initialData';

const STORAGE_KEY = 'aliemath_db_v2';
const LEGACY_STORAGE_KEY = 'aliemath_db_v1';
const SERVER_SYNC_TIMESTAMP_KEY = 'aliemath_last_sync_timestamp';

export const DEFAULT_PRINT_SETTINGS: PrintSignatureSettings = {
  headmasterName: 'Drs. H. Mulyadi, M.Pd',
  headmasterNip: '19740512 199903 1 004',
  teacherName: 'Akhmad Alwi, S.Pd',
  teacherNip: '19850314 201101 1 008',
  city: 'Banjarmasin',
  dateStr: '',
};

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

    // Normalize exams: ensure options are properly formatted
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

    const attempts = [...(parsed.attempts || INITIAL_DATABASE.attempts)];

    const db: AppDatabase = {
      users: users.length > 0 ? users : INITIAL_DATABASE.users,
      news: parsed.news || INITIAL_DATABASE.news,
      materials: parsed.materials || INITIAL_DATABASE.materials,
      exams: exams.length > 0 ? exams : INITIAL_DATABASE.exams,
      attempts,
      cbtSessionLocks: parsed.cbtSessionLocks || [],
      gitHubConfig: parsed.gitHubConfig || INITIAL_DATABASE.gitHubConfig,
      printSettings: parsed.printSettings || DEFAULT_PRINT_SETTINGS,
      lastUpdatedAt: parsed.lastUpdatedAt || new Date().toISOString(),
    };

    return db;
  } catch (err) {
    console.error('Failed to load database from localStorage, falling back to initial data:', err);
    return INITIAL_DATABASE;
  }
}

export function saveDatabase(db: AppDatabase): void {
  try {
    const dataWithTimestamp: AppDatabase = {
      ...db,
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  } catch (err) {
    console.error('Failed to save database to localStorage:', err);
  }
}

/**
 * Syncs the current database to the server /api/database
 * This ensures changes made from PC immediately persist and appear on mobile phones!
 */
export async function syncDatabaseToServer(db: AppDatabase): Promise<{ success: boolean; updatedAt?: string; message: string }> {
  try {
    // 1. Always save locally first for instant offline responsiveness
    saveDatabase(db);

    // 2. Transmit to server API
    const res = await fetch('/api/database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: db }),
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Server returned status ${res.status}`,
      };
    }

    const json = await res.json();
    if (json.updatedAt) {
      localStorage.setItem(SERVER_SYNC_TIMESTAMP_KEY, json.updatedAt);
    }

    return {
      success: true,
      updatedAt: json.updatedAt,
      message: 'Berhasil disinkronkan ke server & perangkat lain!',
    };
  } catch (err: any) {
    // Silently handle if offline or static preview
    console.warn('[Sync] Could not reach server /api/database (offline or static host):', err?.message);
    return {
      success: false,
      message: 'Tersimpan di penyimpanan lokal browser.',
    };
  }
}

/**
 * Fetches the central database from the server /api/database
 * Mobile phones / other browsers use this to get the latest materials, CBT questions, and attempts!
 */
export async function fetchServerDatabase(): Promise<{ success: boolean; data?: AppDatabase; updatedAt?: string }> {
  try {
    const res = await fetch('/api/database', {
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return { success: false };
    }

    const json = await res.json();
    if (json.success && json.data) {
      const serverDb = json.data as AppDatabase;
      // Ensure required arrays exist
      if (Array.isArray(serverDb.materials) && Array.isArray(serverDb.exams)) {
        // Update localStorage with the latest server data
        saveDatabase(serverDb);
        if (json.updatedAt) {
          localStorage.setItem(SERVER_SYNC_TIMESTAMP_KEY, json.updatedAt);
        }
        return {
          success: true,
          data: serverDb,
          updatedAt: json.updatedAt,
        };
      }
    }
    return { success: false };
  } catch (err: any) {
    console.warn('[Sync] Failed to fetch server database:', err?.message);
    return { success: false };
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
  try {
    fetch('/api/database/reset', { method: 'POST' }).catch(() => {});
  } catch {}
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
