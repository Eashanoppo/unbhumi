'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, DocumentItem } from '@/lib/api';
import {
  FileText, Search, Filter, Hash, CheckCircle2,
  Eye, RefreshCw, PlusCircle, ArrowRight
} from 'lucide-react';

export default function DocumentsLibraryPage() {
  const { language, t, formatNumber } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments({ search, type: typeFilter });
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {language === 'bn' ? 'নথিপত্র ও ডিজিটাল রেজিস্ট্রি' : 'Document Library & Registry'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {language === 'bn'
              ? 'ইনজেস্টেড মূল দলিল, বায়া দলিল, আরএস খতিয়ান ও কর রসিদের কেন্দ্রীয় ক্রিপ্টোগ্রাফিক তালিকা।'
              : 'Central cryptographic registry of all enrolled title deeds, baya deeds, khatian surveys, and tax receipts.'}
          </p>
        </div>

        <Link
          href="/documents/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-xs shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>{language === 'bn' ? 'নতুন নথি আপলোড' : 'Upload New Document'}</span>
        </Link>
      </div>

      {/* Filter and Search Bar (Mobile-first 44px min height) */}
      <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col sm:flex-row gap-3 shadow-xs">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'bn' ? 'নথির শিরোনাম বা হ্যাশ দিয়ে খুঁজুন...' : 'Search by document title or hash...'}
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)]"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] cursor-pointer"
          >
            <option value="">{language === 'bn' ? 'সকল নথির ধরন' : 'All Document Types'}</option>
            <option value="deed">{t('doctype_deed') || 'মূল দলিল'}</option>
            <option value="baya_deed">{t('doctype_baya_deed') || 'বায়া দলিল'}</option>
            <option value="khatian">{t('doctype_khatian') || 'খতিয়ান'}</option>
            <option value="mutation">{t('doctype_mutation') || 'নামজারি'}</option>
            <option value="tax_receipt">{t('doctype_tax_receipt') || 'কর দাখিলা'}</option>
          </select>
        </div>
      </div>

      {/* Documents Container (Dual: Desktop Table + Mobile Stacked Cards) */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-xs text-[var(--text-secondary)] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--brand-accent)]" />
            <span>{t('loading_data')}</span>
          </div>
        ) : documents.length > 0 ? (
          <div>
            {/* 1. Desktop Table (md: and above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-surface-soft)]/60 font-semibold">
                    <th className="py-3.5 px-4">{language === 'bn' ? 'নথির শিরোনাম (Title)' : 'Document Title'}</th>
                    <th className="py-3.5 px-4">{language === 'bn' ? 'ধরন (Type)' : 'Type'}</th>
                    <th className="py-3.5 px-4">{language === 'bn' ? 'ক্রিপ্টোগ্রাফিক হ্যাশ (SHA-256)' : 'SHA-256 Fingerprint'}</th>
                    <th className="py-3.5 px-4">{language === 'bn' ? 'আকার ও পৃষ্ঠা' : 'Size & Pages'}</th>
                    <th className="py-3.5 px-4">{language === 'bn' ? 'অবস্থা (Status)' : 'Status'}</th>
                    <th className="py-3.5 px-4 text-right">{t('col_action') || 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[var(--bg-surface-soft)]/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="font-bold">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-soft)] border border-[var(--border-color)] font-medium">
                          {doc.document_type_display}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                          <span>{doc.file_hash ? `${doc.file_hash.slice(0, 16)}...` : (t('hash_ready') || 'Enrolled')}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] font-mono">
                        {formatNumber((doc.file_size_bytes / 1024).toFixed(0))} KB • {formatNumber(doc.page_count)} {language === 'bn' ? 'পৃষ্ঠা' : 'pages'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{doc.status_display}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {doc.case && (
                          <Link
                            href={`/cases/${doc.case}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-[var(--bg-surface-soft)] hover:bg-[var(--border-color)]/60 text-xs font-bold text-[var(--brand-accent)] border border-[var(--border-color)] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'কেস দেখুন' : 'View Case'}</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. Mobile Stacked Cards (sm & below) */}
            <div className="md:hidden divide-y divide-[var(--border-color)]">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 space-y-3 hover:bg-[var(--bg-surface-soft)]/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{doc.title}</h4>
                        <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                          {doc.document_type_display}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{doc.status_display}</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-[var(--text-secondary)] font-mono space-y-1 bg-[var(--bg-surface-soft)] p-2.5 rounded-xl border border-[var(--border-color)]/60">
                    <div className="flex items-center gap-1.5 break-all">
                      <Hash className="w-3 h-3 text-[var(--brand-accent)] shrink-0" />
                      <span>SHA-256: {doc.file_hash ? `${doc.file_hash.slice(0, 20)}...` : 'Enrolled'}</span>
                    </div>
                    <div>
                      {formatNumber((doc.file_size_bytes / 1024).toFixed(0))} KB • {formatNumber(doc.page_count)} {language === 'bn' ? 'পৃষ্ঠা' : 'pages'}
                    </div>
                  </div>

                  {doc.case && (
                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/cases/${doc.case}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-[var(--bg-surface-soft)] text-xs font-bold text-[var(--brand-accent)] border border-[var(--border-color)] hover:border-[var(--brand-accent)] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'কেস দেখুন' : 'View Case'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
            {t('no_results')}
          </div>
        )}
      </div>
    </div>
  );
}
