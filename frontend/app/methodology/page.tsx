'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { BookOpen, ShieldCheck, Binary, GitFork, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';

export default function MethodologyPage() {
  const { language, t } = useLanguage();

  const rules = [
    {
      code: 'D001',
      name_bn: 'অভিন্ন ডিজিটাল ফাইলের হ্যাশ উপস্থিতি',
      name_en: 'Identical Digital File Hash Registered (Exact Duplicate)',
      family_key: 'rule_family_integrity',
      sev_key: 'sev_med'
    },
    {
      code: 'D002',
      name_bn: 'দলিল নম্বর বা রেজিস্ট্রেশন তারিখ অমিল',
      name_en: 'Deed Number or Registration Date Discrepancy',
      family_key: 'rule_family_integrity',
      sev_key: 'sev_high'
    },
    {
      code: 'O001',
      name_bn: 'মালিকানা ধারাবাহিকতা বিচ্ছিন্ন (বায়া দলিল অনুপস্থিত)',
      name_en: 'Broken Chain of Title (Missing Baya Deed)',
      family_key: 'rule_family_chain',
      sev_key: 'sev_crit'
    },
    {
      code: 'O002',
      name_bn: 'মালিকানা অর্জনের পূর্ববর্তী তারিখে জমি হস্তান্তর',
      name_en: 'Transfer Date Precedes Recorded Ownership Acquisition',
      family_key: 'rule_family_chain',
      sev_key: 'sev_crit'
    },
    {
      code: 'P001',
      name_bn: 'সম্ভাব্য দ্বৈত বিক্রি (একই দাগ একাধিক দলিলে বিক্রি)',
      name_en: 'Potential Double-Selling Conflict (Same Parcel in Multiple Active Deeds)',
      family_key: 'rule_family_plot',
      sev_key: 'sev_crit'
    },
    {
      code: 'P002',
      name_bn: 'বিক্রিত জমির পরিমাণ খতিয়ানের রেকর্ড অতিক্রম',
      name_en: 'Transferred Area Exceeds Recorded Khatian Ceiling',
      family_key: 'rule_family_plot',
      sev_key: 'sev_high'
    },
    {
      code: 'P003',
      name_bn: 'চৌহদ্দি ও মৌজা নকশার সীমানা বর্ণনায় গরমিল',
      name_en: 'Boundary & Mouza Map Description Inconsistency',
      family_key: 'rule_family_plot',
      sev_key: 'sev_med'
    },
    {
      code: 'K001',
      name_bn: 'দলিল বনাম আরএস/বিএস খতিয়ান স্বত্ব অমিল',
      name_en: 'Deed Executant vs RS/BS Survey Ownership Mismatch',
      family_key: 'rule_family_records',
      sev_key: 'sev_high'
    },
    {
      code: 'M001',
      name_bn: 'দলিল বনাম নামজারি খতিয়ানের তথ্য অমিল',
      name_en: 'Deed vs Mutation (Namjari) DCR Discrepancy',
      family_key: 'rule_family_records',
      sev_key: 'sev_high'
    },
    {
      code: 'T001',
      name_bn: 'সহায়ক ভূমি উন্নয়ন কর দাখিলার তথ্যে গরমিল',
      name_en: 'Land Development Tax (Dakhila) Verification Discrepancy',
      family_key: 'rule_family_evidence',
      sev_key: 'sev_low'
    },
    {
      code: 'G001',
      name_bn: 'মালিকানা গ্রাফে সমান্তরাল হস্তান্তর পথ শনাক্ত',
      name_en: 'Competing Parallel Transfer Paths Detected in Graph',
      family_key: 'rule_family_graph',
      sev_key: 'sev_crit'
    },
    {
      code: 'X001',
      name_bn: 'গুরুত্বপূর্ণ তথ্যে ওসিআর পাঠোদ্ধারের নিম্ন মান',
      name_en: 'Low OCR Optical Confidence on Critical Identifier',
      family_key: 'rule_family_ocr',
      sev_key: 'sev_low'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-[var(--border-color)] pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] border border-[var(--border-color)]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('methodology_badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
          {t('methodology_title')}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          {t('methodology_subtitle')}
        </p>
      </div>

      {/* Technical Distinction Matrix */}
      <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-deep)]" />
          <span>{t('distinction_header')}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-1">
            <span className="font-bold text-[var(--accent-deep)] block">{t('dist_hash_title')}</span>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              {t('dist_hash_desc')}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-1">
            <span className="font-bold text-[var(--accent-deep)] block">{t('dist_rules_title')}</span>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              {t('dist_rules_desc')}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-1">
            <span className="font-bold text-[var(--accent-deep)] block">{t('dist_human_title')}</span>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              {t('dist_human_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[var(--accent-deep)]" />
          <span>{t('pipe_sec_title')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
            <span className="text-xs font-bold text-[var(--accent-deep)] block">{t('pipe_step1_title')}</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('pipe_step1_desc')}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
            <span className="text-xs font-bold text-[var(--accent-deep)] block">{t('pipe_step2_title')}</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('pipe_step2_desc')}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
            <span className="text-xs font-bold text-[var(--accent-deep)] block">{t('pipe_step3_title')}</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('pipe_step3_desc')}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
            <span className="text-xs font-bold text-[var(--accent-deep)] block">{t('pipe_step4_title')}</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('pipe_step4_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* 12 Rules Catalogue Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Binary className="w-5 h-5 text-[var(--accent-deep)]" />
          <span>{t('rules_sec_title')}</span>
        </h2>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-surface-soft)]/60 border-b border-[var(--border-color)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-3">{t('tbl_col_code')}</th>
                <th className="py-2.5 px-3">{t('tbl_col_name')}</th>
                <th className="py-2.5 px-3">{t('tbl_col_family')}</th>
                <th className="py-2.5 px-3">{t('tbl_col_severity')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {rules.map((r) => (
                <tr key={r.code} className="hover:bg-[var(--bg-surface-soft)]/30">
                  <td className="py-2 px-3 font-mono font-bold text-[var(--accent-deep)]">{r.code}</td>
                  <td className="py-2 px-3 font-medium text-[var(--text-primary)]">
                    {language === 'bn' ? r.name_bn : r.name_en}
                  </td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">
                    {t(r.family_key)}
                  </td>
                  <td className="py-2 px-3 font-semibold">
                    {t(r.sev_key)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safeguards and Uncertainty */}
      <div id="safeguards" className="p-6 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-3">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>{t('safeguards_sec_title')}</span>
        </h3>
        <ul className="text-xs text-[var(--text-secondary)] space-y-2 list-disc pl-5 leading-relaxed">
          <li>{t('sg_point1')}</li>
          <li>{t('sg_point2')}</li>
          <li>{t('sg_point3')}</li>
        </ul>
      </div>
    </div>
  );
}
