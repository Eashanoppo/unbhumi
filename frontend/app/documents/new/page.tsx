'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight,
  ArrowLeft, ShieldCheck, Trash2, Plus, Info, FileUp, Sparkles,
  Layers, Check, Loader2, Edit3
} from 'lucide-react';

interface UploadItem {
  id: string;
  name: string;
  type: string;
  size: number;
  hash: string;
}

export default function NewAnalysisPage() {
  const router = useRouter();
  const { language, t, formatNumber } = useLanguage();

  // Wizard Step State (1: Parcel, 2: Documents, 3: Review & Submit)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Case & Parcel metadata
  const [title, setTitle] = useState('');
  const [mouza, setMouza] = useState('কাউন্দিয়া');
  const [dagNumber, setDagNumber] = useState('৪১২');
  const [surveyType, setSurveyType] = useState('RS');
  const [area, setArea] = useState('25.0');
  const [description, setDescription] = useState('');

  // Step 2: Uploaded documents list
  const [documents, setDocuments] = useState<UploadItem[]>([
    {
      id: 'doc-1',
      name: 'মূল_সাফ_কবলা_দলিল_৭৪৫২.pdf',
      type: 'deed',
      size: 1428500,
      hash: '7a9f4c3d8e12b6a901ffc562e104a39d84c391219b6732f90119c836a0f44391'
    },
    {
      id: 'doc-2',
      name: 'আরএস_খতিয়ান_৫৮৩.pdf',
      type: 'khatian',
      size: 985200,
      hash: '3e41b9d09a7218cf5092a40e6712ab098f430198de72a5b112998a6094b81093'
    }
  ]);

  const [newDocType, setNewDocType] = useState('baya_deed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStage, setSubmissionStage] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const docTypeKeys = ['deed', 'baya_deed', 'khatian', 'mutation', 'mouza_map', 'tax_receipt'];

  const handleAddSyntheticFile = () => {
    const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const prefix = t(`doctype_${newDocType}`).split(' ')[0];
    const newItem: UploadItem = {
      id: `doc-${Date.now()}`,
      name: `${prefix}_doc_${Date.now().toString().slice(-4)}.pdf`,
      type: newDocType,
      size: Math.floor(Math.random() * 800000) + 400000,
      hash: `${randomHex}${randomHex}${randomHex}${randomHex}`.slice(0, 64)
    };
    setDocuments([...documents, newItem]);
    setErrorMsg('');
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  const handleNextFromStep1 = () => {
    if (!title.trim()) {
      setErrorMsg(t('title_required_error'));
      return;
    }
    setErrorMsg('');
    setCurrentStep(2);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextFromStep2 = () => {
    if (documents.length === 0) {
      setErrorMsg(t('docs_required_error'));
      return;
    }
    setErrorMsg('');
    setCurrentStep(3);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(t('title_required_error'));
      setCurrentStep(1);
      return;
    }
    if (documents.length === 0) {
      setErrorMsg(t('docs_required_error'));
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSubmissionProgress(15);
    setSubmissionStage(1);

    try {
      setTimeout(() => {
        setSubmissionProgress(40);
        setSubmissionStage(2);
      }, 700);

      const createdCase = await api.createCase({
        title,
        description,
        mouza,
        dag_number: dagNumber,
        survey_type: surveyType,
        area: parseFloat(area) || 20.0
      });

      setSubmissionProgress(75);
      setSubmissionStage(3);

      await api.runChecks(createdCase.case_number);
      setSubmissionProgress(100);
      setSubmissionStage(4);

      setTimeout(() => {
        router.push(`/cases/${createdCase.case_number}`);
      }, 600);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setErrorMsg(message || (language === 'bn' ? 'কেস তৈরিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' : 'Failed to create case. Please try again.'));
      setIsSubmitting(false);
      setSubmissionProgress(0);
    }
  };

  const progressPercent = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-surface-soft)] text-[var(--brand-accent)] border border-[var(--border-color)]">
          <FileUp className="w-3.5 h-3.5" />
          <span>{t('new_doc_badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          {t('new_doc_title')}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {t('new_doc_subtitle')}
        </p>
      </div>

      {/* STEP-BY-STEP PROGRESS BAR */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* Progress bar metadata */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--brand-accent)] uppercase tracking-wider truncate mr-2">
            {currentStep === 3
              ? t('step_progress_ready', { current: formatNumber(currentStep), total: formatNumber(3) })
              : t('step_progress_label', { current: formatNumber(currentStep), total: formatNumber(3), pct: formatNumber(progressPercent) })}
          </span>
          <span className="font-mono text-xs font-bold text-[var(--text-secondary)] shrink-0">
            {formatNumber(progressPercent)}%
          </span>
        </div>

        {/* Dynamic Progress Bar Fill Track */}
        <div className="w-full h-2.5 bg-[var(--bg-surface-soft)] rounded-full overflow-hidden border border-[var(--border-color)] relative">
          <div
            className="h-full bg-[var(--brand-accent)] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Nodes Indicators */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
          {/* Step 1 Node */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-start gap-2 sm:gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer min-h-[44px] ${
              currentStep === 1
                ? 'bg-[var(--bg-surface-soft)] ring-1 ring-[var(--brand-accent)]'
                : 'hover:bg-[var(--bg-surface-soft)]/50 opacity-80'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                currentStep > 1
                  ? 'bg-[var(--brand-accent)] text-white'
                  : currentStep === 1
                  ? 'bg-[var(--brand-accent)] text-[var(--cta-text)] ring-4 ring-[var(--brand-accent)]/20'
                  : 'bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}
            >
              {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : formatNumber(1)}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                {t('step_parcel_short')}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">
                {t('step_parcel_desc')}
              </p>
            </div>
          </button>

          {/* Step 2 Node */}
          <button
            type="button"
            onClick={() => {
              if (title.trim()) setCurrentStep(2);
              else setErrorMsg(t('title_required_error'));
            }}
            className={`flex items-start gap-2 sm:gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer min-h-[44px] ${
              currentStep === 2
                ? 'bg-[var(--bg-surface-soft)] ring-1 ring-[var(--brand-accent)]'
                : 'hover:bg-[var(--bg-surface-soft)]/50 opacity-80'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                currentStep > 2
                  ? 'bg-[var(--brand-accent)] text-white'
                  : currentStep === 2
                  ? 'bg-[var(--brand-accent)] text-[var(--cta-text)] ring-4 ring-[var(--brand-accent)]/20'
                  : 'bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}
            >
              {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : formatNumber(2)}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                {t('step_docs_short')}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">
                {t('step_docs_desc')}
              </p>
            </div>
          </button>

          {/* Step 3 Node */}
          <button
            type="button"
            onClick={() => {
              if (!title.trim()) {
                setErrorMsg(t('title_required_error'));
                return;
              }
              if (documents.length === 0) {
                setErrorMsg(t('docs_required_error'));
                return;
              }
              setCurrentStep(3);
            }}
            className={`flex items-start gap-2 sm:gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer min-h-[44px] ${
              currentStep === 3
                ? 'bg-[var(--bg-surface-soft)] ring-1 ring-[var(--brand-accent)]'
                : 'hover:bg-[var(--bg-surface-soft)]/50 opacity-80'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                currentStep === 3
                  ? 'bg-[var(--brand-accent)] text-[var(--cta-text)] ring-4 ring-[var(--brand-accent)]/20'
                  : 'bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}
            >
              {formatNumber(3)}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                {t('step_review_short')}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">
                {t('step_review_desc')}
              </p>
            </div>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP CONTENT CONTAINER */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ======================================================== */}
        {/* STEP 1: CASE & PARCEL DETAILS */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--brand-accent)] text-[var(--cta-text)] font-bold flex items-center justify-center text-xs">
                    {formatNumber(1)}
                  </span>
                  <span>{t('step1_title')}</span>
                </h2>
                <span className="text-xs text-[var(--text-secondary)] font-medium hidden sm:inline">
                  {t('step_parcel_desc')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                    <span>{t('field_case_title')}</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('placeholder_case_title')}
                    className="w-full px-3.5 py-3 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    {t('field_mouza')}
                  </label>
                  <input
                    type="text"
                    value={mouza}
                    onChange={(e) => setMouza(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    {t('field_dag')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={dagNumber}
                    onChange={(e) => setDagNumber(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] font-mono focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    {t('field_survey')}
                  </label>
                  <select
                    value={surveyType}
                    onChange={(e) => setSurveyType(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] font-medium focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] focus:outline-none"
                  >
                    <option value="RS">{t('survey_rs')}</option>
                    <option value="BS">{t('survey_bs')}</option>
                    <option value="SA">{t('survey_sa')}</option>
                    <option value="CS">{t('survey_cs')}</option>
                    <option value="city">{t('survey_city')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    {t('field_area')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    {t('field_desc')}
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('placeholder_desc')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-3 min-h-[44px] text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)] transition-colors flex items-center justify-center cursor-pointer"
              >
                {t('cancel')}
              </button>

              <button
                type="button"
                onClick={handleNextFromStep1}
                className="px-6 py-3 min-h-[44px] text-xs font-bold rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <span>{t('btn_next_docs')}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: DOCUMENT UPLOAD & FINGERPRINTING */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--brand-accent)] text-[var(--cta-text)] font-bold flex items-center justify-center text-xs">
                    {formatNumber(2)}
                  </span>
                  <span>{t('doc_pack_title')}</span>
                </h2>
                <span className="text-xs text-[var(--text-secondary)] font-medium hidden sm:inline">
                  {t('doc_pack_sub')}
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="p-6 sm:p-8 border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-surface-soft)]/40 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--brand-accent)] shadow-xs">
                  <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="max-w-md">
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {t('drop_title')}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {t('drop_desc')}
                  </p>
                </div>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-2">
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] font-medium focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] focus:outline-none"
                  >
                    {docTypeKeys.map((key) => (
                      <option key={key} value={key}>{t(`doctype_${key}`)}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddSyntheticFile}
                    className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[var(--brand-accent)] text-[var(--cta-text)] hover:bg-[var(--brand-accent-hover)] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('add_doc')}</span>
                  </button>
                </div>
              </div>

              {/* Attached Documents List */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span>{t('attached_docs', { count: formatNumber(documents.length) })}</span>
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {language === 'bn' ? 'ব্রাউজারেই SHA-256 প্রস্তুত' : 'Client-side SHA-256 generated'}
                  </span>
                </div>

                <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-[var(--bg-surface-soft)]/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex items-center justify-center text-[var(--brand-accent)] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--text-primary)] truncate">{doc.name}</p>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono break-all truncate sm:break-normal">
                            SHA-256: {doc.hash.slice(0, 16)}... • {formatNumber((doc.size / 1024).toFixed(0))} KB •{' '}
                            <span className="font-sans font-medium text-[var(--brand-accent)]">
                              {t(`doctype_${doc.type}`)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        title={t('cancel')}
                        aria-label="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-3 min-h-[44px] text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('btn_prev_step')}</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep2}
                className="px-6 py-3 min-h-[44px] text-xs font-bold rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <span>{t('btn_next_review')}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: REVIEW, PRIVACY GUARDRAIL & VERIFICATION */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-7 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--brand-accent)] text-[var(--cta-text)] font-bold flex items-center justify-center text-xs">
                    {formatNumber(3)}
                  </span>
                  <span>{t('step3_summary_title')}</span>
                </h2>
                <span className="text-xs text-[var(--brand-accent)] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'যাচাইয়ের জন্য প্রস্তুত' : 'Ready for Verification'}</span>
                </span>
              </div>

              {/* Summary Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Case Info Summary */}
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[var(--brand-accent)]" />
                      <span>{t('summary_case_details')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] font-semibold text-[var(--brand-accent)] hover:underline flex items-center gap-1 cursor-pointer p-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-[var(--text-primary)]">{title}</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)] pt-1">
                      <div>
                        <span>{t('field_mouza')}: </span>
                        <strong className="text-[var(--text-primary)]">{mouza}</strong>
                      </div>
                      <div>
                        <span>{t('field_dag')}: </span>
                        <strong className="text-[var(--text-primary)] font-mono">{formatNumber(dagNumber)}</strong>
                      </div>
                      <div>
                        <span>{t('field_survey')}: </span>
                        <strong className="text-[var(--text-primary)]">{surveyType}</strong>
                      </div>
                      <div>
                        <span>{t('field_area')}: </span>
                        <strong className="text-[var(--text-primary)]">{formatNumber(area)} {language === 'bn' ? 'শতাংশ' : 'decimals'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Package Summary */}
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[var(--brand-accent)]" />
                      <span>{t('summary_doc_package')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-[11px] font-semibold text-[var(--brand-accent)] hover:underline flex items-center gap-1 cursor-pointer p-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-[var(--text-primary)]">
                      {formatNumber(documents.length)} {language === 'bn' ? 'টি নথি সংযুক্ত' : 'documents attached'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {documents.map((d) => (
                        <span
                          key={d.id}
                          className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[10px] font-medium border border-[var(--border-color)] text-[var(--text-secondary)]"
                        >
                          {t(`doctype_${d.type}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Integrity Notice */}
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                <ShieldCheck className="w-5 h-5 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">{t('summary_integrity')}</p>
                  <p className="text-[11px] opacity-90 leading-relaxed">{t('summary_integrity_desc')}</p>
                </div>
              </div>

              {/* Privacy Guardrails */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
                <Info className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>{t('privacy_title')}: </strong> {t('privacy_desc')}
                </p>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-3 min-h-[44px] text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('btn_prev_step')}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3.5 min-h-[44px] text-xs sm:text-sm font-bold rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmitting ? t('submitting_investigation') : t('create_and_verify_btn')}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ======================================================== */}
      {/* LIVE SUBMISSION MULTI-STAGE PROGRESS MODAL */}
      {/* ======================================================== */}
      {isSubmitting && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50"
        >
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-accent)] text-[var(--cta-text)] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  {t('stage_progress_title')}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {formatNumber(submissionProgress)}% {language === 'bn' ? 'সম্পন্ন' : 'completed'}
                </p>
              </div>
            </div>

            {/* Modal Progress Bar */}
            <div className="w-full h-3 bg-[var(--bg-surface-soft)] rounded-full overflow-hidden border border-[var(--border-color)]">
              <div
                className="h-full bg-[var(--brand-accent)] transition-all duration-300 rounded-full"
                style={{ width: `${submissionProgress}%` }}
              />
            </div>

            {/* Stages Checklist */}
            <div className="space-y-3 text-xs">
              {/* Stage 1 */}
              <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${submissionStage >= 1 ? 'bg-[var(--bg-surface-soft)]' : 'opacity-40'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${submissionStage > 1 ? 'bg-[var(--brand-accent)] text-white' : submissionStage === 1 ? 'bg-[var(--brand-accent)] text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}>
                  {submissionStage > 1 ? <Check className="w-3 h-3" /> : '1'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">{t('verifying_stage_1')}</p>
                </div>
              </div>

              {/* Stage 2 */}
              <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${submissionStage >= 2 ? 'bg-[var(--bg-surface-soft)]' : 'opacity-40'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${submissionStage > 2 ? 'bg-[var(--brand-accent)] text-white' : submissionStage === 2 ? 'bg-[var(--brand-accent)] text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}>
                  {submissionStage > 2 ? <Check className="w-3 h-3" /> : '2'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">{t('verifying_stage_2')}</p>
                </div>
              </div>

              {/* Stage 3 */}
              <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${submissionStage >= 3 ? 'bg-[var(--bg-surface-soft)]' : 'opacity-40'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${submissionStage > 3 ? 'bg-[var(--brand-accent)] text-white' : submissionStage === 3 ? 'bg-[var(--brand-accent)] text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}>
                  {submissionStage > 3 ? <Check className="w-3 h-3" /> : '3'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">{t('verifying_stage_3')}</p>
                </div>
              </div>

              {/* Stage 4 */}
              <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${submissionStage >= 4 ? 'bg-[var(--bg-surface-soft)]' : 'opacity-40'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${submissionStage === 4 ? 'bg-[var(--brand-accent)] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {submissionStage === 4 ? <Check className="w-3 h-3" /> : '4'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">{t('verifying_stage_4')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
