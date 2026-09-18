import { AppDatabase, GitHubSyncConfig } from '../types';
import { INITIAL_DATABASE } from '../data/initialData';

const STORAGE_KEY = 'aliemath_db_v1';

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabase(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw);
    // Ensure all collections exist
    return {
      users: parsed.users || INITIAL_DATABASE.users,
      news: parsed.news || INITIAL_DATABASE.news,
      materials: parsed.materials || INITIAL_DATABASE.materials,
      exams: parsed.exams || INITIAL_DATABASE.exams,
      attempts: parsed.attempts || INITIAL_DATABASE.attempts,
      gitHubConfig: parsed.gitHubConfig || INITIAL_DATABASE.gitHubConfig,
    };
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
