'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight,
  ShieldCheck, Trash2, Plus, Info, FileUp
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
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setErrorMsg(t('title_required_error'));
      return;
    }
    if (documents.length === 0) {
      setErrorMsg(t('docs_required_error'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const createdCase = await api.createCase({
        title,
        description,
        mouza,
        dag_number: dagNumber,
        survey_type: surveyType,
        area: parseFloat(area) || 20.0
      });

      // Run initial check
      await api.runChecks(createdCase.case_number);
      router.push(`/cases/${createdCase.case_number}`);
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'bn' ? 'কেস তৈরিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' : 'Failed to create case. Please try again.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] border border-[var(--border-color)]">
          <FileUp className="w-3.5 h-3.5" />
          <span>{t('new_doc_badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
          {t('new_doc_title')}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          {t('new_doc_subtitle')}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Case & Parcel Details */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--accent-deep)] dark:text-[#7ED957]">
            {t('step1_title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                {t('field_case_title')}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('placeholder_case_title')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] focus:ring-1 focus:ring-[var(--accent-deep)] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                {t('field_mouza')}
              </label>
              <input
                type="text"
                value={mouza}
                onChange={(e) => setMouza(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                {t('field_dag')}
              </label>
              <input
                type="text"
                value={dagNumber}
                onChange={(e) => setDagNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                {t('field_survey')}
              </label>
              <select
                value={surveyType}
                onChange={(e) => setSurveyType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]"
              >
                <option value="RS">{t('survey_rs')}</option>
                <option value="BS">{t('survey_bs')}</option>
                <option value="SA">{t('survey_sa')}</option>
                <option value="CS">{t('survey_cs')}</option>
                <option value="city">{t('survey_city')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                {t('field_area')}
              </label>
              <input
                type="number"
                step="0.1"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                {t('field_desc')}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('placeholder_desc')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Document Upload & Fingerprinting */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--accent-deep)] dark:text-[#7ED957]">
              {t('doc_pack_title')}
            </h2>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              {t('doc_pack_sub')}
            </span>
          </div>

          {/* Upload Dropzone */}
          <div className="p-6 border-2 border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-surface-soft)]/40 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-deep)]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                {t('drop_title')}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {t('drop_desc')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] font-medium"
              >
                {docTypeKeys.map((key) => (
                  <option key={key} value={key}>{t(`doctype_${key}`)}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddSyntheticFile}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-deep)] text-[#FFF8E7] hover:bg-[var(--accent-deep)]/90 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('add_doc')}</span>
              </button>
            </div>
          </div>

          {/* List of Attached Documents */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-[var(--text-primary)] block">
              {t('attached_docs', { count: documents.length })}
            </span>

            <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-surface)]">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[var(--accent-deep)] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text-primary)] truncate">{doc.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-mono truncate">
                        SHA-256: {doc.hash.slice(0, 20)}... • {(doc.size / 1024).toFixed(0)} KB • {t(`doctype_${doc.type}`)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title={t('cancel')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Privacy Guardrail & Submit */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
          <Info className="w-4 h-4 text-[var(--accent-deep)] shrink-0 mt-0.5" />
          <p>
            <strong>{t('privacy_title')}</strong> {t('privacy_desc')}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)]"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[var(--accent-deep)] text-[#FFF8E7] hover:bg-[var(--accent-deep)]/90 transition-all flex items-center gap-2 shadow-sm"
          >
            <span>{isSubmitting ? t('submitting_investigation') : t('create_and_verify_btn')}</span>
            <ArrowRight className="w-4 h-4 text-[#7ED957]" />
          </button>
        </div>
      </form>
    </div>
  );
}
