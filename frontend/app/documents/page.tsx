'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, DocumentItem } from '@/lib/api';
import { FileText, Search, Filter, Hash, CheckCircle2, AlertTriangle, Eye, RefreshCw } from 'lucide-react';

export default function DocumentsLibraryPage() {
  const { language } = useLanguage();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {language === 'bn' ? 'নথিপত্র ও ডিজিটাল রেজিস্ট্রি' : 'Document Library'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            ইনজেস্টেড দলিল, বায়া দলিল, আরএস খতিয়ান ও কর রসিদের কেন্দ্রীয় ক্রিপ্টোগ্রাফিক তালিকা।
          </p>
        </div>

        <Link
          href="/documents/new"
          className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent-deep)] text-[#FFF8E7] hover:bg-[var(--accent-deep)]/90 transition-all shadow-sm"
        >
          নতুন নথি আপলোড
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নথির শিরোনাম বা হ্যাশ দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent-deep)]"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 font-medium"
          >
            <option value="">সকল নথির ধরন</option>
            <option value="deed">মূল দলিল</option>
            <option value="baya_deed">বায়া দলিল</option>
            <option value="khatian">খতিয়ান</option>
            <option value="mutation">নামজারি</option>
            <option value="tax_receipt">কর দাখিলা</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent-deep)]" />
            <span>নথিপত্র লোড হচ্ছে...</span>
          </div>
        ) : documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-surface-soft)]/40 font-semibold">
                  <th className="py-3 px-4">নথির শিরোনাম (Title)</th>
                  <th className="py-3 px-4">ধরন (Type)</th>
                  <th className="py-3 px-4">ক্রিপ্টোগ্রাফিক হ্যাশ (SHA-256)</th>
                  <th className="py-3 px-4">সাইজ ও পৃষ্ঠা</th>
                  <th className="py-3 px-4">অবস্থা (Status)</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[var(--bg-surface-soft)]/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--accent-deep)]" />
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {doc.document_type_display}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[var(--accent-deep)]" />
                        <span>{doc.file_hash ? `${doc.file_hash.slice(0, 16)}...` : 'এনরোল্ড'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {(doc.file_size_bytes / 1024).toFixed(0)} KB • {doc.page_count} পৃষ্ঠা
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> {doc.status_display}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {doc.case && (
                        <Link
                          href={`/cases/${doc.case}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-deep)] dark:text-[#7ED957] hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>কেস দেখুন</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
            কোনো নথি পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  );
}
