'use client';

import React, { useState } from 'react';
import { DocumentItem, ExtractedField, api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { FileText, CheckCircle, Edit3, Save, Eye, Hash, ShieldCheck, AlertCircle } from 'lucide-react';
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
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
      {/* Document Header & SHA-256 Fingerprint */}
      <div className="p-4 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface-soft)]/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-deep)] flex items-center justify-center text-[#7ED957]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{doc.title}</h4>
            <p className="text-xs text-[var(--text-secondary)]">
              {t('doc_pages_label', { type: doc.document_type_display, count: doc.page_count })}
            </p>
          </div>
        </div>

        {/* Cryptographic SHA-256 Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs">
          <Hash className="w-3.5 h-3.5 text-[var(--accent-deep)]" />
          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
            {doc.file_hash ? `${doc.file_hash.slice(0, 16)}...` : t('hash_ready')}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" /> {t('hash_enrolled')}
          </span>
        </div>
      </div>

      {/* Split Desktop / Stacked Mobile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left: Document Visual Preview / Scan Canvas */}
        <div className="lg:col-span-6 p-4 border-b lg:border-b-0 lg:border-r border-[var(--border-color)] bg-[var(--bg-surface-soft)]/30 flex flex-col justify-center items-center relative">
          <div className="w-full max-w-sm rounded-lg border border-[var(--border-color)] overflow-hidden bg-white shadow-md relative group">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/images/documents/deed-sample.svg"
                alt={t('doc_alt_scan')}
                fill
                sizes="(max-width: 768px) 100vw, 35vw"
                className="object-contain p-2"
              />
            </div>
            <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-[11px] text-gray-500">
              <span>{t('page_counter', { current: 1, total: doc.page_count })}</span>
              <span className="text-[var(--accent-deep)] font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" /> {t('scan_viewer_btn')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Extracted Structured Fields with Confidence & Editor */}
        <div className="lg:col-span-6 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {t('extracted_fields_header')}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {t('extracted_fields_count', { count: fields.length })}
              </span>
            </div>

            {saveSuccess && (
              <div className="mb-3 p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{t('field_save_success')}</span>
              </div>
            )}

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {fields.map((field) => {
                const isEditing = editingFieldId === field.id;
                const isLowConfidence = field.confidence < 0.75;

                return (
                  <div
                    key={field.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isLowConfidence
                        ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)]/40 hover:border-[var(--accent-deep)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {getFieldLabel(field)}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Confidence Meter */}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                            isLowConfidence
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {t('ocr_confidence_badge', { pct: Math.round(field.confidence * 100) })}
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(field)}
                            className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-deep)] rounded"
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
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-[var(--border-color)] bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-[var(--accent-deep)]"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditingFieldId(null)}
                            className="px-2.5 py-1 text-xs border border-[var(--border-color)] rounded"
                          >
                            {t('cancel_btn')}
                          </button>
                          <button
                            onClick={() => handleSaveEdit(field)}
                            disabled={isSaving}
                            className="px-3 py-1 text-xs bg-[var(--accent-deep)] text-white rounded font-medium flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>{isSaving ? t('saving_btn') : t('save_btn')}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between gap-2 mt-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {field.effective_value || field.raw_value}
                        </p>
                        {field.status === 'corrected' && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950 px-1 rounded">
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

          <div className="pt-3 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
            <span>{t('coord_tracking')}</span>
            <span className="text-emerald-700 dark:text-[#7ED957] font-semibold">{t('traceable_evidence')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
