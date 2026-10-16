import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Shield,
  Key,
  Database,
  ExternalLink,
  X,
  Server,
  Sparkles,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { AppDatabase, FirebaseSyncConfig } from '../types';
import {
  saveDatabaseToFirestore,
  loadDatabaseFromFirestore,
  testFirestoreConnection,
  FIRESTORE_COLLECTION,
  FIRESTORE_DOC_ID
} from '../services/storageService';

interface FirebaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: AppDatabase;
  onUpdateDatabase: (updated: AppDatabase) => void;
  onDatabasePulled?: (pulledDb: AppDatabase) => void;
  isSuperAdmin?: boolean;
}

export const FirebaseSettingsModal: React.FC<FirebaseSettingsModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  onDatabasePulled,
  isSuperAdmin = false,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  const firebaseConfig: FirebaseSyncConfig = database.firebaseConfig || {
    projectId: 'aliemath',
    superAdminUid: 'QIdqovxl9pR55TeaIJj6eNe45gF2',
    firestoreCollection: FIRESTORE_COLLECTION,
    firestoreDoc: FIRESTORE_DOC_ID,
    autoSync: true,
    lastStatus: 'connected',
  };

  if (!isOpen) return null;

  const handleCopyUid = () => {
    navigator.clipboard.writeText(firebaseConfig.superAdminUid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleToggleAutoSync = () => {
    const updatedConfig: FirebaseSyncConfig = {
      ...firebaseConfig,
      autoSync: !firebaseConfig.autoSync,
    };
    onUpdateDatabase({
      ...database,
      firebaseConfig: updatedConfig,
    });
    setFeedback({
      type: 'success',
      message: updatedConfig.autoSync
        ? 'Penyimpanan otomatis ke Firebase diaktifkan.'
        : 'Penyimpanan otomatis ke Firebase dinonaktifkan.',
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setFeedback(null);
    try {
      const res = await testFirestoreConnection();
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        onUpdateDatabase({
          ...database,
          firebaseConfig: {
            ...firebaseConfig,
            lastStatus: 'connected',
            lastErrorMessage: undefined,
          },
        });
      } else {
        setFeedback({ type: 'error', message: res.message });
        onUpdateDatabase({
          ...database,
          firebaseConfig: {
            ...firebaseConfig,
            lastStatus: 'error',
            lastErrorMessage: res.message,
          },
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menguji koneksi' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualPushToFirestore = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const res = await saveDatabaseToFirestore(database);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Berhasil menyimpan data ke Firebase Firestore (${res.updatedAt ? new Date(res.updatedAt).toLocaleTimeString('id-ID') : 'Selesai'})`,
        });
        onUpdateDatabase({
          ...database,
          firebaseConfig: {
            ...firebaseConfig,
            lastSyncedAt: res.updatedAt || new Date().toISOString(),
            lastStatus: 'connected',
          },
        });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menyimpan ke Firestore' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromFirestore = async () => {
    setIsPulling(true);
    setFeedback(null);
    try {
      const res = await loadDatabaseFromFirestore();
      if (res.success && res.data) {
        setFeedback({
          type: 'success',
          message: 'Data berhasil ditarik dari cloud Firebase Firestore dan diperbarui di aplikasi!',
        });
        if (onDatabasePulled) {
          onDatabasePulled(res.data);
        } else {
          onUpdateDatabase(res.data);
        }
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Tidak dapat mengambil data dari Firestore.',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal memuat dari Firestore' });
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Pengaturan Database Firebase
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  aliemath
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Penyimpanan Cloud Terpusat &amp; Sinkronisasi Otomatis Seluruh Perangkat
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed font-medium">{feedback.message}</div>
          </div>
        )}

        {/* Credentials and Configuration Card */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-orange-600" />
              Detail Konfigurasi Cloud
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firestore Siap Pakai
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Nama Projek Firebase</div>
              <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">aliemath</div>
              <div className="text-[10px] text-slate-500 mt-0.5">aliemath.firebaseapp.com</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Target Koleksi &amp; Dokumen</div>
              <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">appData / main</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Struktur database terpusat</div>
            </div>
          </div>

          {/* Super Admin UID Info Box */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                <Shield className="w-4 h-4 text-purple-700" />
                <span>UID Terdaftar Guru Utama (Super Admin)</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUid}
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200 cursor-pointer transition-colors"
              >
                {copiedUid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUid ? 'Tersalin' : 'Salin UID'}</span>
              </button>
            </div>
            <div className="mt-1.5 font-mono text-[11px] font-bold text-purple-950 bg-white/80 p-2 rounded border border-purple-100 select-all break-all">
              {firebaseConfig.superAdminUid}
            </div>
            <p className="text-[11px] text-purple-700 mt-1">
              Akun login dengan UID atau email ini otomatis memiliki hak akses sebagai Guru Utama &amp; Super Admin.
            </p>
          </div>
        </div>

        {/* Auto Sync Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
          <div className="space-y-0.5 pr-4">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simpan Otomatis ke Firebase (Auto-Sync)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Setiap kali Guru atau Super Admin menambah/mengubah materi, mengunggah soal CBT, atau mendaftarkan siswa, data langsung tersimpan otomatis ke cloud Firebase Firestore.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={firebaseConfig.autoSync}
              onChange={handleToggleAutoSync}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Database Inventory Counter */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-lg font-black text-slate-900">{database.materials.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Materi</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-lg font-black text-slate-900">{database.exams.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Paket CBT</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-lg font-black text-slate-900">
              {database.users.filter((u) => u.role === 'student').length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Siswa</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-lg font-black text-slate-900">
              {database.users.filter((u) => u.role === 'admin').length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Guru / Admin</div>
          </div>
        </div>

        {/* Role Privileges Summary */}
        <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-3 text-xs space-y-1.5 text-amber-900">
          <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-800">
            <Shield className="w-3.5 h-3.5" />
            <span>Hak Akses Akun: Super Admin vs Guru (Admin)</span>
          </div>
          <ul className="text-[11px] space-y-1 list-disc list-inside text-amber-800/90 leading-relaxed">
            <li>
              <strong className="text-amber-950">Super Admin (Guru Utama):</strong> Menambah/membuat akun Guru sebagai admin, akun siswa, materi pembelajaran, dan soal CBT.
            </li>
            <li>
              <strong className="text-amber-950">Guru sebagai Admin (Guru Pengampu):</strong> Menambah/membuat akun siswa, materi pembelajaran, dan soal CBT yang sama seperti Super Admin.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            disabled={isTesting}
            onClick={handleTestConnection}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Memeriksa...' : 'Uji Koneksi Firebase'}</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isPulling}
              onClick={handlePullFromFirestore}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              title="Tarik data terbaru jika ada pembaruan dari perangkat guru lain"
            >
              <DownloadCloud className={`w-4 h-4 ${isPulling ? 'animate-bounce' : ''}`} />
              <span>{isPulling ? 'Mengunduh...' : 'Tarik dari Firebase'}</span>
            </button>

            <button
              type="button"
              disabled={isSyncing}
              onClick={handleManualPushToFirestore}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyimpan...' : 'Simpan ke Firebase Sekarang'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
