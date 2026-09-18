import React, { useState } from 'react';
import {
  GitBranch,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Key,
  FolderGit2,
  X,
  Copy,
  Check
} from 'lucide-react';
import { AppDatabase, GitHubSyncConfig } from '../types';
import {
  exportDatabaseAsJson,
  syncDatabaseWithGitHub,
  pullDatabaseFromGitHub,
  resetDatabaseToDefault
} from '../services/storageService';

interface GitHubSyncModalProps {
  database: AppDatabase;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDatabase: (db: AppDatabase) => void;
  onUpdateConfig: (config: GitHubSyncConfig) => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  database,
  isOpen,
  onClose,
  onUpdateDatabase,
  onUpdateConfig,
}) => {
  const [config, setConfig] = useState<GitHubSyncConfig>(
    database.gitHubConfig || {
      token: '',
      owner: '',
      repo: 'aliemath-database',
      branch: 'main',
      filePath: 'data/aliemath-db.json',
      autoSync: false,
    }
  );

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedVercelGuide, setCopiedVercelGuide] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDatabaseAsJson(database);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.materials && parsed.exams && parsed.users) {
          onUpdateDatabase(parsed);
          setStatusMessage({
            type: 'success',
            text: 'Database berhasil dimuat dan dipulihkan dari file JSON!',
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Format berkas JSON tidak sesuai struktur Aliemath Database.',
          });
        }
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Gagal membaca file JSON: ${err.message}`,
        });
      }
    };
    reader.readAsText(file);
  };

  const handlePushToGitHub = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    const result = await syncDatabaseWithGitHub(database, config);
    setIsLoading(false);

    if (result.success) {
      const updatedConfig = { ...config, lastSyncedAt: new Date().toISOString() };
      setConfig(updatedConfig);
      onUpdateConfig(updatedConfig);
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handlePullFromGitHub = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    const result = await pullDatabaseFromGitHub(config);
    setIsLoading(false);

    if (result.success && result.remoteData) {
      onUpdateDatabase(result.remoteData);
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data ke data bawaan awal Aliemath?')) {
      const def = resetDatabaseToDefault();
      onUpdateDatabase(def);
      setStatusMessage({ type: 'success', text: 'Data berhasil direset ke setelan awal.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                GitHub Database & Integrasi Vercel
              </h2>
              <p className="text-xs text-slate-500">
                Gunakan GitHub sebagai penyimpanan database awan (Cloud JSON DB) & deployment Vercel tanpa kendala server.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status alert */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Section 1: 1-Click Backup & Restore */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Cadangkan & Pulihkan File Database (JSON)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Unduh file <code>aliemath-db.json</code> untuk disimpan di repositori GitHub Anda secara manual atau otomatis.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Backup Database (.json)
            </button>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer shadow-xs transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Impor Data dari JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              onClick={handleResetData}
              className="px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold ml-auto"
            >
              Reset Data Bawaan
            </button>
          </div>
        </div>

        {/* Section 2: GitHub Direct REST API Database Sync */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-blue-600" />
              2. Sinkronisasi Langsung ke Repositori GitHub
            </h3>
            {config.lastSyncedAt && (
              <span className="text-[10px] text-emerald-700 font-medium">
                Terakhir disinkronkan: {new Date(config.lastSyncedAt).toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Hubungkan Personal Access Token (PAT) GitHub untuk menyimpan pembaharuan materi, berita, dan nilai CBT langsung ke file dalam repo GitHub Anda sebagai basis data.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GitHub Personal Access Token</label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={config.token}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GitHub Username / Owner</label>
              <input
                type="text"
                placeholder="contoh: afzgaming2025"
                value={config.owner}
                onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Repository</label>
              <input
                type="text"
                placeholder="aliemath-database"
                value={config.repo}
                onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch</label>
              <input
                type="text"
                value={config.branch}
                onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Path File DB di Repo</label>
              <input
                type="text"
                value={config.filePath}
                onChange={(e) => setConfig({ ...config, filePath: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              disabled={isLoading || !config.token || !config.owner}
              onClick={handlePushToGitHub}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Simpan & Commit ke GitHub DB</span>
            </button>

            <button
              disabled={isLoading || !config.token || !config.owner}
              onClick={handlePullFromGitHub}
              className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 font-bold text-xs transition-colors"
            >
              Tarik dari GitHub
            </button>
          </div>
        </div>

        {/* Section 3: Vercel Deploy Guide */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <strong className="text-blue-900 font-bold flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-blue-700" />
              Panduan Deploy ke Vercel (Domain Aliemath.my.id)
            </strong>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
            <li>
              Unggah (push) seluruh kode proyek ini ke repositori GitHub pribadi Anda.
            </li>
            <li>
              Buka <strong>vercel.com</strong> → Pilih <strong>Add New Project</strong> → Import repo GitHub Anda.
            </li>
            <li>
              Pengaturan otomatis sudah terpasang: Framework Preset: <code>Vite</code>, Output Directory: <code>dist</code>, dan file <code>vercel.json</code> sudah tersedia untuk menangani routing SPA.
            </li>
            <li>
              Di dashboard Vercel, masuk ke menu <strong>Settings &gt; Domains</strong>, lalu tambahkan domain kustom Anda <code>Aliemath.my.id</code>.
            </li>
          </ol>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
