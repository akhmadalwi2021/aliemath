import React, { useState, useRef } from 'react';
import {
  Newspaper,
  Plus,
  Calendar,
  User,
  Tag,
  Pin,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  BookOpen,
  CheckCircle,
  X,
  AlertCircle,
  Link2,
  Paperclip,
  Download,
  Image,
  FileText,
  FileCheck
} from 'lucide-react';
import { NewsItem, UserRole } from '../types';

interface NewsSectionProps {
  news: NewsItem[];
  userRole: UserRole;
  onAddNews: (newItem: Omit<NewsItem, 'id'>) => void;
  onEditNews: (item: NewsItem) => void;
  onDeleteNews: (id: string) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  userRole,
  onAddNews,
  onEditNews,
  onDeleteNews,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsItem | null>(null);

  // Form states for Admin
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<NewsItem['category']>('Pengumuman');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('Admin Aliemath');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formTags, setFormTags] = useState('');

  // New Link, File, and Image Upload states
  const [formEmbedLink, setFormEmbedLink] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentData, setFormAttachmentData] = useState('');
  const [formAttachmentSize, setFormAttachmentSize] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  const docInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Semua', 'Pengumuman', 'Jadwal', 'Tips & Trik', 'Prestasi', 'Materi'];

  const filteredNews = news.filter((item) => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormCategory('Pengumuman');
    setFormExcerpt('');
    setFormContent('');
    setFormAuthor('Admin Aliemath');
    setFormIsPinned(false);
    setFormTags('Matematika, Aliemath');
    setFormEmbedLink('');
    setFormAttachmentName('');
    setFormAttachmentData('');
    setFormAttachmentSize('');
    setFormImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setEditingArticle(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormExcerpt(item.excerpt);
    setFormContent(item.content);
    setFormAuthor(item.author);
    setFormIsPinned(item.isPinned);
    setFormTags(item.tags.join(', '));
    setFormEmbedLink(item.embedLink || '');
    setFormAttachmentName(item.attachmentName || '');
    setFormAttachmentData(item.attachmentData || '');
    setFormAttachmentSize(item.attachmentSize || '');
    setFormImageUrl(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadFile = (item: NewsItem) => {
    const fileName = item.attachmentName || 'Dokumen_Pengumuman_Aliemath.pdf';
    if (item.attachmentData) {
      const a = document.createElement('a');
      a.href = item.attachmentData;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const text = `=====================================================
ALIEMATH.MY.ID - DOKUMEN PENGUMUMAN / BERITA
=====================================================
Judul: ${item.title}
Kategori: ${item.category}
Penulis: ${item.author}
Tanggal: ${item.publishDate}

RINGKASAN:
${item.excerpt}

ISI LENGKAP:
${item.content}

${item.embedLink ? `\nTautan: ${item.embedLink}` : ''}
=====================================================
`;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
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

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingArticle) {
      onEditNews({
        ...editingArticle,
        title: formTitle,
        category: formCategory,
        excerpt: formExcerpt || formContent.slice(0, 120) + '...',
        content: formContent,
        author: formAuthor,
        isPinned: formIsPinned,
        tags: tagsArray,
        embedLink: formEmbedLink.trim() || undefined,
        attachmentName: formAttachmentName.trim() || undefined,
        attachmentData: formAttachmentData || undefined,
        attachmentSize: formAttachmentSize || undefined,
        imageUrl: formImageUrl || undefined,
      });
    } else {
      onAddNews({
        title: formTitle,
        slug: formTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        excerpt: formExcerpt || formContent.slice(0, 120) + '...',
        content: formContent,
        category: formCategory,
        author: formAuthor,
        publishDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        isPinned: formIsPinned,
        tags: tagsArray,
        coverGradient: 'from-blue-600 to-indigo-800',
        embedLink: formEmbedLink.trim() || undefined,
        attachmentName: formAttachmentName.trim() || undefined,
        attachmentData: formAttachmentData || undefined,
        attachmentSize: formAttachmentSize || undefined,
        imageUrl: formImageUrl || undefined,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-lg shadow-blue-900/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Portal Pembelajaran & Ujian Mandiri Aliemath.my.id
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Berita & Informasi Terkini
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Pusat pembaruan agenda pembelajaran, pengumuman ujian CBT, materi matematika kurikulum merdeka, dan prestasi siswa Aliemath.
          </p>

          {userRole === 'admin' && (
            <div className="pt-2">
              <button
                id="btn-add-news"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-800 font-bold text-sm shadow-md hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Berita / Pengumuman Baru
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berita atau pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* News Feed Cards */}
      {filteredNews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Newspaper className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-700">Tidak ada berita atau pengumuman yang cocok.</p>
          <p className="text-xs text-slate-400 mt-1">Coba kata kunci pencarian lain atau ganti kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.category === 'Pengumuman'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.category === 'Jadwal'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.category === 'Tips & Trik'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : item.category === 'Prestasi'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <Pin className="w-3 h-3 fill-rose-600" /> Disematkan
                      </span>
                    )}
                  </div>

                  {userRole === 'admin' && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit Berita"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus pengumuman "${item.title}"?`)) {
                            onDeleteNews(item.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Hapus Berita"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h2 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </h2>

                {/* News Image Preview if available */}
                {item.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 aspect-video max-h-40 bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {item.excerpt}
                </p>

                {/* Badges for Attached Link and Document */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-1">
                  {item.embedLink && (
                    <a
                      href={item.embedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[10px] border border-indigo-200 transition-colors"
                      title="Buka tautan yang disematkan langsung"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Tautan Eksternal</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                    </a>
                  )}

                  {item.attachmentName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(item);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[10px] border border-emerald-200 transition-colors"
                      title={`Unduh ${item.attachmentName}`}
                    >
                      <Download className="w-3 h-3" />
                      <span className="max-w-[120px] truncate">{item.attachmentName}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.publishDate}
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {item.author}
                  </span>
                </div>

                <button
                  onClick={() => setActiveArticle(item)}
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                >
                  Baca Selengkapnya →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 leading-snug">
              {activeArticle.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 mb-4">
              <span>Oleh: <strong className="text-slate-700">{activeArticle.author}</strong></span>
              <span>•</span>
              <span>{activeArticle.publishDate}</span>
            </div>

            {/* Featured Image in Modal */}
            {activeArticle.imageUrl && (
              <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 shadow-xs">
                <img
                  src={activeArticle.imageUrl}
                  alt={activeArticle.title}
                  className="w-full max-h-72 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Embed Link Interactive Card */}
            {activeArticle.embedLink && (
              <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-950">Tautan Tersemat</div>
                    <div className="text-[11px] text-indigo-700 font-mono line-clamp-1 max-w-md">
                      {activeArticle.embedLink}
                    </div>
                  </div>
                </div>
                <a
                  href={activeArticle.embedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                >
                  <span>Buka Link Langsung</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="prose prose-slate prose-sm max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {activeArticle.content}
            </div>

            {/* Downloadable Attachment (DOC/PDF) */}
            {activeArticle.attachmentName && (
              <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950 flex items-center gap-2">
                      <span>{activeArticle.attachmentName}</span>
                      {activeArticle.attachmentSize && (
                        <span className="text-[10px] font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {activeArticle.attachmentSize}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Lampiran dokumen resmi (DOC / PDF) terkait pengumuman ini.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(activeArticle)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen</span>
                </button>
              </div>
            )}

            {activeArticle.tags && activeArticle.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {activeArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingArticle ? 'Ubah Berita / Pengumuman' : 'Tambah Berita Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Berita</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Simulasi CBT Matematika Kelas X"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Jadwal">Jadwal</option>
                    <option value="Tips & Trik">Tips & Trik</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Materi">Materi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penulis / Author</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ringkasan Singkat (Excerpt)</label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan 1-2 kalimat untuk preview..."
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Konten Lengkap Berita</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tuliskan isi berita, panduan, atau pengumuman..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans"
                />
              </div>

              {/* Form Input for Embedding Link */}
              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200/70 space-y-2">
                <label className="block font-bold text-indigo-950 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-indigo-600" />
                  Sematkan Tautan / Link (Opsional)
                </label>
                <p className="text-[11px] text-indigo-700">
                  Siswa dapat langsung mengklik link ini untuk membuka rujukan pengumuman, formulir eksternal, atau situs terkait.
                </p>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formEmbedLink}
                  onChange={(e) => setFormEmbedLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              {/* Form Input for Uploading DOC / PDF File */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/70 space-y-2">
                <label className="block font-bold text-emerald-950 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  Unggah Berkas Pengumuman (DOC / PDF) (Opsional)
                </label>
                <p className="text-[11px] text-emerald-700">
                  Siswa dapat langsung mengunduh berkas ini. Format: .pdf, .doc, .docx.
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
                      onClick={() => {
                        setFormAttachmentName('');
                        setFormAttachmentData('');
                        setFormAttachmentSize('');
                        if (docInputRef.current) docInputRef.current.value = '';
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1 text-xs font-semibold"
                    >
                      Hapus / Ganti
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleDocUpload}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Form Input for Uploading Image (JPEG / JPG) */}
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-2">
                <label className="block font-bold text-amber-950 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-amber-600" />
                  Unggah Gambar Berita / Poster (JPEG / JPG / PNG) (Opsional)
                </label>
                <p className="text-[11px] text-amber-800">
                  Gambar akan ditampilkan sebagai poster sampul berita dan di kartu informasi.
                </p>

                {formImageUrl ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border border-amber-200 max-h-36 bg-white">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-full h-36 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl('');
                        if (imageInputRef.current) imageInputRef.current.value = '';
                      }}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                    >
                      Hapus Gambar
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleImageUpload}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Matematika, PTS, Tips"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-pinned"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chk-pinned" className="font-semibold text-slate-700 cursor-pointer">
                  Sematkan di bagian atas (Pinned Announcement)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs"
                >
                  {editingArticle ? 'Simpan Perubahan' : 'Terbitkan Berita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
