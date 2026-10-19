'use client';

import React, { useState } from 'react';
import { DocumentItem, ExtractedField, api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import {
  FileText, CheckCircle, Edit3, Save, Eye, Hash,
  ShieldCheck, X, Scan, Copy, ExternalLink, Info
} from 'lucide-react';
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
  const [viewTab, setViewTab] = useState<'scan' | 'ocr'>('scan');
  const [copied, setCopied] = useState(false);

  const fields = doc.extracted_fields || [];

  // Compute file URL
  const fileUrl = doc.file_url
    ? (doc.file_url.startsWith('http') ? doc.file_url : `http://localhost:8000${doc.file_url}`)
    : (doc.file ? (doc.file.startsWith('http') ? doc.file : `http://localhost:8000${doc.file}`) : null);

  const isImageFile = fileUrl && (
    fileUrl.toLowerCase().endsWith('.jpg') ||
    fileUrl.toLowerCase().endsWith('.jpeg') ||
    fileUrl.toLowerCase().endsWith('.png') ||
    fileUrl.toLowerCase().endsWith('.webp')
  );

  const isPdfFile = fileUrl && fileUrl.toLowerCase().endsWith('.pdf');

  const rawOcrText = doc.raw_ocr_text || (doc.pages && doc.pages.length > 0 ? doc.pages.map(p => p.ocr_text).join('\n\n') : '');

  const handleCopyOcr = () => {
    if (rawOcrText) {
      navigator.clipboard.writeText(rawOcrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              {t('doc_pages_label', { type: doc.document_type_display, count: formatNumber(doc.page_count || 1) })}
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
        {/* Left: Document Visual Preview / Scan Canvas / Live OCR Text */}
        <div className="lg:col-span-6 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[var(--border-color)] bg-[var(--bg-surface-soft)]/30 flex flex-col justify-between">
          <div>
            {/* View Mode Toggle Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewTab('scan')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewTab === 'scan'
                      ? 'bg-[var(--brand-accent)] text-[var(--cta-text)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মূল স্ক্যান কপি' : 'Document Scan'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('ocr')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewTab === 'ocr'
                      ? 'bg-[var(--brand-accent)] text-[var(--cta-text)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ওসিআর টেক্সট' : 'Live OCR Text'}</span>
                </button>
              </div>

              {viewTab === 'ocr' && rawOcrText && (
                <button
                  type="button"
                  onClick={handleCopyOcr}
                  className="text-[11px] font-bold text-[var(--brand-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'টেক্সট কপি' : 'Copy Text')}</span>
                </button>
              )}
            </div>

            {/* Tab 1: Visual Image / PDF Scan */}
            {viewTab === 'scan' ? (
              <div className="w-full rounded-xl border border-[var(--border-color)] overflow-hidden bg-white shadow-xs relative flex flex-col items-center justify-center min-h-[380px]">
                {isImageFile ? (
                  <div className="relative w-full h-[380px] flex items-center justify-center p-2 bg-gray-50">
                    <img
                      src={fileUrl}
                      alt={doc.title}
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>
                ) : isPdfFile ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-gray-900">{doc.title}</h5>
                      <p className="text-[11px] text-gray-500 mt-0.5">ডিজিটাল ও স্ক্যানকৃত পিডিএফ নথি</p>
                    </div>
                    <a
                      href={`http://localhost:8000/api/v1/documents/${doc.id}/file/`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--brand-accent)] text-[var(--cta-text)] shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>পিডিএফ ব্রাউজারে খুলুন</span>
                    </a>
                  </div>
                ) : (
                  <div className="relative aspect-[3/4] w-full max-w-sm">
                    <Image
                      src="/images/documents/deed-sample.svg"
                      alt={t('doc_alt_scan')}
                      fill
                      sizes="(max-width: 768px) 100vw, 35vw"
                      className="object-contain p-3"
                    />
                  </div>
                )}
                <div className="w-full p-2.5 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-[11px] text-gray-500">
                  <span>{t('page_counter', { current: formatNumber(1), total: formatNumber(doc.page_count || 1) })}</span>
                  <span className="text-[var(--brand-accent)] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {doc.file_hash ? `${doc.file_hash.slice(0, 10)}...` : 'ক্রিপ্টোগ্রাফিক হ্যাশ'}
                  </span>
                </div>
              </div>
            ) : (
              /* Tab 2: Genuine Extracted OCR Raw Text */
              <div className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-xs flex flex-col justify-between min-h-[380px] space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2 font-mono">
                  <span>ইঞ্জিন: Tesseract OCR 5.5.0</span>
                  <span>ভাষা: script/Bengali+eng</span>
                </div>
                <div className="flex-1 max-h-[340px] overflow-y-auto p-3 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)] font-sans text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap select-text">
                  {rawOcrText ? rawOcrText : (
                    <div className="py-12 text-center text-[var(--text-secondary)] space-y-2">
                      <FileText className="w-8 h-8 mx-auto opacity-40" />
                      <p>এই নথির কোনো ডিজিটাল টেক্সট বা ওসিআর টেক্সট সংরক্ষিত নেই।</p>
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] flex justify-between pt-1">
                  <span>মোট শব্দ: {rawOcrText ? formatNumber(rawOcrText.split(/\s+/).filter(Boolean).length) : 0}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">ওসিআর সম্পন্ন</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
            <span>{t('coord_tracking')}</span>
            <span className="text-[var(--brand-accent)] font-bold">{t('traceable_evidence')}</span>
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

            {fields.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-surface-soft)]/30 text-center space-y-2 my-4">
                <Info className="w-6 h-6 text-[var(--brand-accent)] mx-auto" />
                <h5 className="text-xs font-bold text-[var(--text-primary)]">
                  {language === 'bn' ? 'স্বয়ংক্রিয় তফসিল ফিল্ড এখনো যুক্ত করা হয়নি' : 'No Structured Fields Extracted'}
                </h5>
                <p className="text-[11px] text-[var(--text-secondary)] max-w-xs mx-auto">
                  {language === 'bn'
                    ? 'বাম পাশের "ওসিআর টেক্সট" ট্যাবে সম্পূর্ণ পাঠোদ্ধারকৃত লেখা পাওয়া গেছে। অস্পষ্ট বা এআই-তৈরি ছবির ক্ষেত্রে আপনি ম্যানুয়ালি তথ্য যোগ করতে পারেন।'
                    : 'The OCR text is available on the left tab. You can manually correct or confirm fields.'}
                </p>
              </div>
            ) : (
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
            )}
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
