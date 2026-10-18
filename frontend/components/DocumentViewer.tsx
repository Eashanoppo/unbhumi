'use client';

import React, { useState } from 'react';
import { DocumentItem, ExtractedField, api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { FileText, CheckCircle, Edit3, Save, Eye, Hash, ShieldCheck, X } from 'lucide-react';
import Image from 'next/image';

interface DocumentViewerProps {
  document: DocumentItem;
  onFieldUpdated?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document: doc, onFieldUpdated }) => {
  const { language, t, formatNumber } = useLanguage();
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fields = doc.extracted_fields || [];

  const handleStartEdit = (field: ExtractedField) => {
    setEditingFieldId(field.id);
    setEditValue(field.effective_value);
    setSaveSuccess(false);
  };

  const handleSaveEdit = async (field: ExtractedField) => {
    setIsSaving(true);
    try {
      await api.correctField(doc.id, field.field_key, editValue);
      setEditingFieldId(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onFieldUpdated) onFieldUpdated();
    } catch (err) {
      console.error('Failed to correct field:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldLabel = (field: ExtractedField) => {
    if (language === 'bn') {
      return field.field_label_bn;
    }
    const key = `field_${field.field_key}`;
    const translated = t(key);
    if (translated !== key) return translated;
    return field.field_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-xs animate-in fade-in-50">
      {/* Document Header & SHA-256 Fingerprint */}
      <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface-soft)]/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--brand-accent)] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{doc.title}</h4>
            <p className="text-xs text-[var(--text-secondary)]">
              {t('doc_pages_label', { type: doc.document_type_display, count: formatNumber(doc.page_count) })}
            </p>
          </div>
        </div>

        {/* Cryptographic SHA-256 Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs">
          <Hash className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" />
          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
            {doc.file_hash ? `${doc.file_hash.slice(0, 16)}...` : t('hash_ready')}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
            <ShieldCheck className="w-3 h-3" /> {t('hash_enrolled')}
          </span>
        </div>
      </div>

      {/* Split Desktop / Stacked Mobile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left: Document Visual Preview / Scan Canvas */}
        <div className="lg:col-span-6 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[var(--border-color)] bg-[var(--bg-surface-soft)]/30 flex flex-col justify-center items-center relative">
          <div className="w-full max-w-sm rounded-xl border border-[var(--border-color)] overflow-hidden bg-white shadow-xs relative group">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/images/documents/deed-sample.svg"
                alt={t('doc_alt_scan')}
                fill
                sizes="(max-width: 768px) 100vw, 35vw"
                className="object-contain p-3"
              />
            </div>
            <div className="p-2.5 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-[11px] text-gray-500">
              <span>{t('page_counter', { current: formatNumber(1), total: formatNumber(doc.page_count) })}</span>
              <span className="text-[var(--brand-accent)] font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {t('scan_viewer_btn')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Extracted Structured Fields with Confidence & Editor */}
        <div className="lg:col-span-6 p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {t('extracted_fields_header')}
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('extracted_fields_count', { count: formatNumber(fields.length) })}
              </span>
            </div>

            {saveSuccess && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('field_save_success')}</span>
              </div>
            )}

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {fields.map((field) => {
                const isEditing = editingFieldId === field.id;
                const isLowConfidence = field.confidence < 0.75;

                return (
                  <div
                    key={field.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isLowConfidence
                        ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)]/40 hover:border-[var(--brand-accent)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                      <span className="font-bold text-[var(--text-primary)]">
                        {getFieldLabel(field)}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Confidence Meter */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                            isLowConfidence
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {t('ocr_confidence_badge', { pct: formatNumber(Math.round(field.confidence * 100)) })}
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(field)}
                            aria-label={t('edit_btn_title')}
                            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--brand-accent)] rounded-lg transition-colors cursor-pointer"
                            title={t('edit_btn_title')}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingFieldId(null)}
                            className="px-3 py-2 min-h-[40px] text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)] transition-colors cursor-pointer"
                          >
                            {t('cancel_btn')}
                          </button>
                          <button
                            onClick={() => handleSaveEdit(field)}
                            disabled={isSaving}
                            className="px-4 py-2 min-h-[40px] text-xs bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSaving ? t('saving_btn') : t('save_btn')}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between gap-2 mt-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {field.effective_value || field.raw_value}
                        </p>
                        {field.status === 'corrected' && (
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                            {t('corrected_badge')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
            <span>{t('coord_tracking')}</span>
            <span className="text-[var(--brand-accent)] font-bold">{t('traceable_evidence')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
