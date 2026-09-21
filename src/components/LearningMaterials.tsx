import React, { useState, useRef } from 'react';
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
  HelpCircle,
  ExternalLink,
  Link2,
  Paperclip,
  UploadCloud,
  FileCheck
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
  const [formSubject, setFormSubject] = useState('Matematika');
  const [formGrade, setFormGrade] = useState<LearningMaterial['gradeLevel']>('Kelas 7');
  const [formChapter, setFormChapter] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formKeyPoints, setFormKeyPoints] = useState('');
  const [formFormulas, setFormFormulas] = useState<FormulaSnippet[]>([]);
  const [newFormulaTitle, setNewFormulaTitle] = useState('');
  const [newFormulaText, setNewFormulaText] = useState('');
  const [newFormulaExplanation, setNewFormulaExplanation] = useState('');
  
  // Link and file upload states
  const [formEmbedLink, setFormEmbedLink] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentData, setFormAttachmentData] = useState('');
  const [formAttachmentSize, setFormAttachmentSize] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const grades = ['Semua', 'Kelas 7', 'Kelas 8', 'Kelas 9', 'Umum'];

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
    setFormSubject('Matematika');
    setFormGrade('Kelas 7');
    setFormChapter('Bab 1: ');
    setFormSummary('');
    setFormContent('');
    setFormKeyPoints('Konsep dasar materi\nMetode penyelesaian soal\nContoh kasus terapan');
    setFormFormulas([]);
    setFormEmbedLink('');
    setFormAttachmentName('Modul_Ringkasan_Matematika.pdf');
    setFormAttachmentData('');
    setFormAttachmentSize('1.2 MB');
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
    setFormEmbedLink(m.embedLink || '');
    setFormAttachmentName(m.attachmentName || '');
    setFormAttachmentData(m.attachmentData || '');
    setFormAttachmentSize(m.attachmentSize || '');
    setIsEditorOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Format size
    let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    if (file.size > 1024 * 1024) {
      sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormAttachmentName(file.name);
      setFormAttachmentSize(sizeStr);
      setFormAttachmentData(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setFormAttachmentName('');
    setFormAttachmentData('');
    setFormAttachmentSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadAttachment = (material: LearningMaterial) => {
    const fileName = material.attachmentName || 'Modul_Matematika_Aliemath.pdf';
    if (material.attachmentData) {
      const a = document.createElement('a');
      a.href = material.attachmentData;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a downloadable document text/pdf blob representation
      const fileContent = `=====================================================
ALIEMATH.MY.ID - DOKUMEN MATERI PEMBELAJARAN
=====================================================
Judul Materi: ${material.title}
Mata Pelajaran: ${material.subject}
Tingkat Kelas: ${material.gradeLevel}
Bab / Modul: ${material.chapter}
Penyusun: ${material.author}
Tanggal: ${material.updatedAt}

RINGKASAN & KOMPETENSI:
${material.summary}

POIN PENTING:
${(material.keyPoints || []).map((p, i) => `${i + 1}. ${p}`).join('\n')}

FORMULA & RUMUS MATEMATIKA:
${(material.formulas || []).map((f) => `• [${f.title}]: ${f.formula} (${f.explanation || '-'})`).join('\n')}

URAIAN MATERI LENGKAP:
${material.content}

${material.embedLink ? `\nTautan Referensi: ${material.embedLink}` : ''}
=====================================================
Unduhan resmi portal Aliemath.my.id
`;
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')
        ? fileName
        : `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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
        embedLink: formEmbedLink.trim() || undefined,
        attachmentName: formAttachmentName.trim() || undefined,
        attachmentData: formAttachmentData || undefined,
        attachmentSize: formAttachmentSize || undefined,
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
        embedLink: formEmbedLink.trim() || undefined,
        attachmentName: formAttachmentName.trim() || undefined,
        attachmentData: formAttachmentData || undefined,
        attachmentSize: formAttachmentSize || undefined,
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

                {/* Badges for Attached Link and Document */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-1">
                  {mat.embedLink && (
                    <a
                      href={mat.embedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[10px] border border-indigo-200 transition-colors"
                      title="Klik untuk membuka tautan materi langsung"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Tautan Eksternal</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                    </a>
                  )}

                  {mat.attachmentName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadAttachment(mat);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[10px] border border-emerald-200 transition-colors"
                      title={`Klik untuk mengunduh ${mat.attachmentName}`}
                    >
                      <Download className="w-3 h-3" />
                      <span className="max-w-[120px] truncate">{mat.attachmentName}</span>
                    </button>
                  )}
                </div>
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

            {/* Embed Link Interactive Card (Direct clickable for students) */}
            {activeMaterial.embedLink && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-950">Tautan Materi / Referensi Eksternal</div>
                    <div className="text-[11px] text-indigo-700 font-mono line-clamp-1 max-w-md">
                      {activeMaterial.embedLink}
                    </div>
                  </div>
                </div>
                <a
                  href={activeMaterial.embedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                >
                  <span>Buka Link Materi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

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

            {/* Attachment preview and real file download for students */}
            {activeMaterial.attachmentName && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950 flex items-center gap-2">
                      <span>{activeMaterial.attachmentName}</span>
                      {activeMaterial.attachmentSize && (
                        <span className="text-[10px] font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {activeMaterial.attachmentSize}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Berkas modul pendukung resmi (format DOC/PDF) untuk dipelajari secara mandiri.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadAttachment(activeMaterial)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Materi</span>
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
                    <option value="Kelas 7">Kelas 7</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 9">Kelas 9</option>
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

              {/* Form Input for Embedding Link */}
              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200/70 space-y-2">
                <label className="block font-bold text-indigo-950 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-indigo-600" />
                  Sematkan Tautan / Link Materi (Opsional)
                </label>
                <p className="text-[11px] text-indigo-700">
                  Siswa dapat langsung mengklik link ini untuk membuka modul Google Drive, video pembelajaran, atau situs referensi.
                </p>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... atau https://youtube.com/..."
                  value={formEmbedLink}
                  onChange={(e) => setFormEmbedLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              {/* Form Input for File Upload (PDF / DOC) */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/70 space-y-2">
                <label className="block font-bold text-emerald-950 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  Unggah Berkas Materi / Modul (PDF / DOC) (Opsional)
                </label>
                <p className="text-[11px] text-emerald-700">
                  Siswa dapat langsung mengunduh berkas ini. Format yang didukung: .pdf, .doc, .docx.
                </p>

                {formAttachmentName ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">{formAttachmentName}</span>
                      {formAttachmentSize && (
                        <span className="text-[10px] text-emerald-600 font-mono">({formAttachmentSize})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="text-rose-500 hover:text-rose-700 p-1 text-xs font-semibold"
                    >
                      Hapus / Ganti
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    />
                  </div>
                )}
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
