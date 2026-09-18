import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Edit,
  Trash2,
  ChevronRight,
  Clock,
  User,
  CheckCircle2,
  FileText,
  Video,
  Download,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { LearningMaterial, UserRole, FormulaSnippet } from '../types';

interface LearningMaterialsProps {
  materials: LearningMaterial[];
  userRole: UserRole;
  onAddMaterial: (newMat: Omit<LearningMaterial, 'id'>) => void;
  onEditMaterial: (mat: LearningMaterial) => void;
  onDeleteMaterial: (id: string) => void;
}

export const LearningMaterials: React.FC<LearningMaterialsProps> = ({
  materials,
  userRole,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<LearningMaterial | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Matematika Wajib');
  const [formGrade, setFormGrade] = useState<LearningMaterial['gradeLevel']>('Kelas 10');
  const [formChapter, setFormChapter] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formKeyPoints, setFormKeyPoints] = useState('');
  const [formFormulas, setFormFormulas] = useState<FormulaSnippet[]>([]);
  const [newFormulaTitle, setNewFormulaTitle] = useState('');
  const [newFormulaText, setNewFormulaText] = useState('');
  const [newFormulaExplanation, setNewFormulaExplanation] = useState('');
  const [formAttachment, setFormAttachment] = useState('');

  const grades = ['Semua', 'Kelas 10', 'Kelas 11', 'Kelas 12', 'Umum'];

  const filteredMaterials = materials.filter((m) => {
    const matchesGrade = selectedGrade === 'Semua' || m.gradeLevel === selectedGrade;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormTitle('');
    setFormSubject('Matematika Wajib');
    setFormGrade('Kelas 10');
    setFormChapter('Bab 1: ');
    setFormSummary('');
    setFormContent('');
    setFormKeyPoints('Konsep dasar materi\nMetode penyelesaian soal\nContoh kasus terapan');
    setFormFormulas([]);
    setFormAttachment('Modul_Ringkasan_Matematika.pdf');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (m: LearningMaterial) => {
    setEditingMaterial(m);
    setFormTitle(m.title);
    setFormSubject(m.subject);
    setFormGrade(m.gradeLevel);
    setFormChapter(m.chapter);
    setFormSummary(m.summary);
    setFormContent(m.content);
    setFormKeyPoints((m.keyPoints || []).join('\n'));
    setFormFormulas(m.formulas || []);
    setFormAttachment(m.attachmentName || '');
    setIsEditorOpen(true);
  };

  const handleAddFormulaSnippet = () => {
    if (!newFormulaTitle.trim() || !newFormulaText.trim()) return;
    setFormFormulas([
      ...formFormulas,
      {
        title: newFormulaTitle.trim(),
        formula: newFormulaText.trim(),
        explanation: newFormulaExplanation.trim(),
      },
    ]);
    setNewFormulaTitle('');
    setNewFormulaText('');
    setNewFormulaExplanation('');
  };

  const handleRemoveFormula = (idx: number) => {
    setFormFormulas(formFormulas.filter((_, i) => i !== idx));
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const keyPointsArray = formKeyPoints
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const nowStr = new Date().toISOString().split('T')[0];

    if (editingMaterial) {
      onEditMaterial({
        ...editingMaterial,
        title: formTitle,
        subject: formSubject,
        gradeLevel: formGrade,
        chapter: formChapter,
        summary: formSummary,
        content: formContent,
        keyPoints: keyPointsArray,
        formulas: formFormulas,
        attachmentName: formAttachment || undefined,
        updatedAt: nowStr,
      });
    } else {
      onAddMaterial({
        title: formTitle,
        subject: formSubject,
        gradeLevel: formGrade,
        chapter: formChapter,
        summary: formSummary,
        content: formContent,
        keyPoints: keyPointsArray,
        formulas: formFormulas,
        attachmentName: formAttachment || undefined,
        createdAt: nowStr,
        updatedAt: nowStr,
        author: 'Admin Aliemath',
      });
    }

    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Materi Pembelajaran Interaktif</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Modul & Rumus Matematika
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pusat bahan ajar terstruktur, pembuktian formula, dan rangkuman materi dari pengajar Aliemath.
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            id="btn-add-material"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Materi Baru
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {grades.map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedGrade === grade
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi, bab, atau rumus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-700">Tidak ada materi pembelajaran yang ditemukan.</p>
          <p className="text-xs text-slate-400 mt-1">Admin dapat menambahkan materi baru menggunakan tombol di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {mat.gradeLevel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{mat.subject}</span>
                </div>

                <div className="text-[11px] font-semibold text-indigo-600 mb-1">{mat.chapter}</div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {mat.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {mat.summary}
                </p>

                {/* Formulas preview snippet */}
                {mat.formulas && mat.formulas.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-700 space-y-1">
                    <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                      Rumus Kunci:
                    </div>
                    <div className="text-blue-700 font-bold truncate">
                      {mat.formulas[0].title}: <span className="text-slate-800">{mat.formulas[0].formula}</span>
                    </div>
                    {mat.formulas.length > 1 && (
                      <div className="text-[10px] text-slate-400 font-sans">
                        +{mat.formulas.length - 1} rumus lainnya dalam materi ini
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveMaterial(mat)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
                >
                  Pelajari Materi <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {userRole === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(mat)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ubah Isi Materi"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus materi "${mat.title}"?`)) {
                          onDeleteMaterial(mat.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Materi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Material Reader Modal */}
      {activeMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {activeMaterial.gradeLevel}
                </span>
                <span className="text-xs text-slate-500 font-medium">{activeMaterial.subject}</span>
              </div>
              <button
                onClick={() => setActiveMaterial(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <span className="text-xs font-bold text-indigo-600">{activeMaterial.chapter}</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{activeMaterial.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span>Pengampu: <strong className="text-slate-700">{activeMaterial.author}</strong></span>
                <span>•</span>
                <span>Terakhir diperbarui: {activeMaterial.updatedAt}</span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-950 leading-relaxed">
              <strong className="block text-blue-800 font-bold mb-1">Ikhtisar & Kompetensi:</strong>
              {activeMaterial.summary}
            </div>

            {/* Formulas Showcase */}
            {activeMaterial.formulas && activeMaterial.formulas.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Bank Rumus & Formula Kunci
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeMaterial.formulas.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-xs shadow-xs space-y-1.5"
                    >
                      <div className="text-[11px] font-sans font-bold text-slate-400">{item.title}</div>
                      <div className="text-sm font-bold text-amber-300 py-1 border-y border-slate-800">
                        {item.formula}
                      </div>
                      {item.explanation && (
                        <div className="text-[11px] font-sans text-slate-300 font-normal leading-relaxed">
                          {item.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Points */}
            {activeMaterial.keyPoints && activeMaterial.keyPoints.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Poin Penting Pembahasan
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeMaterial.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Content */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Uraian & Penjelasan Lengkap
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {activeMaterial.content}
              </div>
            </div>

            {/* Attachment preview / download simulator */}
            {activeMaterial.attachmentName && (
              <div className="mt-6 flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Lampiran: {activeMaterial.attachmentName}</span>
                </div>
                <button
                  onClick={() => alert(`Mengunduh berkas ${activeMaterial.attachmentName}...`)}
                  className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Dokumen
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    const m = activeMaterial;
                    setActiveMaterial(null);
                    handleOpenEdit(m);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 font-semibold text-xs hover:bg-blue-50"
                >
                  Ubah Materi Ini
                </button>
              )}
              <button
                onClick={() => setActiveMaterial(null)}
                className="ml-auto px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Editor Modal for Adding/Editing Material */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingMaterial ? 'Ubah Isi Materi Pembelajaran' : 'Tambah Materi Pembelajaran Baru'}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Judul Materi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Turunan dan Integral Fungsi Aljabar"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Kelas 10">Kelas 10</option>
                    <option value="Kelas 11">Kelas 11</option>
                    <option value="Kelas 12">Kelas 12</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bab / Modul</label>
                  <input
                    type="text"
                    placeholder="Bab 3: Kalkulus Dasar"
                    value={formChapter}
                    onChange={(e) => setFormChapter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ringkasan / Kompetensi Dasar</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ringkasan materi yang akan dipelajari siswa..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Dynamic Formula Builder */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">Rumus Matematika / Formula Terkait</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Rumus (cth: Rumus ABC)"
                    value={newFormulaTitle}
                    onChange={(e) => setNewFormulaTitle(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Formula Matematika (cth: x = -b ± √(b²-4ac) / 2a)"
                    value={newFormulaText}
                    onChange={(e) => setNewFormulaText(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Keterangan rumus singkat..."
                    value={newFormulaExplanation}
                    onChange={(e) => setNewFormulaExplanation(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFormulaSnippet}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Tambah Rumus
                  </button>
                </div>

                {formFormulas.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {formFormulas.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                      >
                        <div>
                          <strong className="text-slate-800">{f.title}: </strong>
                          <span className="font-mono text-blue-700">{f.formula}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFormula(i)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Poin Penting (Satu poin per baris)
                </label>
                <textarea
                  rows={3}
                  placeholder="Poin 1&#10;Poin 2&#10;Poin 3"
                  value={formKeyPoints}
                  onChange={(e) => setFormKeyPoints(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi / Uraian Materi Lengkap</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Tuliskan penjelasan materi, contoh soal, dan langkah penyelesaian..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Berkas Lampiran PDF / Rangkuman</label>
                <input
                  type="text"
                  placeholder="Contoh: Modul_Matematika_Kelas10.pdf"
                  value={formAttachment}
                  onChange={(e) => setFormAttachment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs"
                >
                  {editingMaterial ? 'Simpan Perubahan Materi' : 'Publikasikan Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
