'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage, formatNumber, formatDate, getStatusLabel, getRiskLabel, Language } from '@/lib/i18n';
import { api, CaseItem } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { Printer, Download, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Hash, Info, Globe } from 'lucide-react';

function ReportContent() {
  const searchParams = useSearchParams();
  const caseParam = searchParams.get('case') || 'UB-2026-1002';
  const { language, t } = useLanguage();

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<string>(caseParam);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLang, setReportLang] = useState<Language>(language);

  useEffect(() => {
    setReportLang(language);
  }, [language]);

  useEffect(() => {
    async function init() {
      try {
        const caseList = await api.getCases();
        setCases(caseList);
        const data = await api.getCaseReport(selectedCaseNumber);
        setReportData(data);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [selectedCaseNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UNBUmi_Report_${selectedCaseNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-[var(--text-secondary)]">{t('report_preparing')}</div>;
  }

  const meta = reportData?.case_metadata || {};
  const documents = reportData?.documents || [];
  const anomalies = reportData?.anomalies || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Control Bar (Hidden when printing) */}
      <div className="no-print p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{t('report_case_switch')}</span>
          <select
            value={selectedCaseNumber}
            onChange={(e) => setSelectedCaseNumber(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.case_number}>
                {c.case_number} — {c.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Report Language Selector */}
          <div className="flex rounded-lg border border-[var(--border-color)] p-0.5 bg-[var(--bg-surface-soft)]">
            <button
              onClick={() => setReportLang('bn')}
              className={`px-2 py-1 text-xs font-bold rounded ${
                reportLang === 'bn' ? 'bg-[var(--accent-deep)] text-white' : 'text-[var(--text-secondary)]'
              }`}
            >
              বাংলা রিপোর্ট
            </button>
            <button
              onClick={() => setReportLang('en')}
              className={`px-2 py-1 text-xs font-bold rounded ${
                reportLang === 'en' ? 'bg-[var(--accent-deep)] text-white' : 'text-[var(--text-secondary)]'
              }`}
            >
              English Report
            </button>
          </div>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface-soft)] hover:bg-[var(--border-color)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('export_json')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--accent-deep)] text-[#FFF8E7] hover:bg-[var(--accent-deep)]/90 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#7ED957]" />
            <span>{t('report_print_btn')}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Paper Layout */}
      <div className={`card p-8 sm:p-12 rounded-2xl border border-[var(--border-color)] bg-white text-black space-y-8 shadow-md ${reportLang === 'bn' ? 'bangla-text' : ''}`}>
        {/* Official Header */}
        <div className="border-b-2 border-[#286B35] pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#286B35] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#286B35]">
                {reportLang === 'bn' ? 'UNLEFT LandGuard — আনলেফট ল্যান্ডগার্ড' : 'UNLEFT LandGuard — Evidence Report'}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              {reportLang === 'bn'
                ? 'এআই-সহায়তাকৃত ভূমি দলিল ও স্বত্ব যাচাইকরণ প্রযুক্তি প্রতিবেদন (P3 Track)'
                : 'AI-Assisted Land Title Fraud & Double-Selling Verification Report (P3 Track)'}
            </p>
            <p className="text-[11px] text-gray-500 font-mono">
              {reportLang === 'bn'
                ? 'ডেভেলপমেন্ট: UNLEFT • LandTech Innovation Hackathon 2026'
                : 'Developed by UNLEFT • LandTech Innovation Hackathon 2026'}
            </p>
          </div>

          <div className="text-right text-xs text-gray-600 space-y-1 font-mono">
            <p><strong>{reportLang === 'bn' ? 'রিপোর্ট নং:' : 'Report ID:'}</strong> {reportData?.report_id}</p>
            <p><strong>{reportLang === 'bn' ? 'তারিখ:' : 'Date:'}</strong> {formatDate(reportData?.generated_at, reportLang)}</p>
            <p><strong>{reportLang === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}</strong> {getStatusLabel(meta.status || 'flagged_review', reportLang)}</p>
          </div>
        </div>

        {/* Case Metadata Summary */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#286B35]">
            {reportLang === 'bn' ? '১. কেস ও দাগের বিবরণ (Case Details)' : '1. Case & Parcel Specifications'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs">
            <div>
              <span className="text-gray-500 block">{reportLang === 'bn' ? 'কেস রেফারেন্স' : 'Case Reference'}</span>
              <span className="font-mono font-bold text-sm">{meta.case_number}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{reportLang === 'bn' ? 'মৌজা ও এলাকা' : 'Mouza & Area'}</span>
              <span className="font-semibold">{meta.mouza || 'সাভার'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{reportLang === 'bn' ? 'দাগ ও জরিপ' : 'Plot (Dag) & Survey'}</span>
              <span className="font-semibold">
                {reportLang === 'bn'
                  ? `দাগ নং ${formatNumber(meta.dag_number, 'bn')} (${meta.survey_type})`
                  : `Dag No. ${meta.dag_number} (${meta.survey_type})`}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">{reportLang === 'bn' ? 'রেকর্ডকৃত জমি' : 'Recorded Area'}</span>
              <span className="font-semibold">
                {reportLang === 'bn' ? `${formatNumber(meta.recorded_area, 'bn')} শতাংশ` : `${meta.recorded_area} decimals`}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Priority Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#286B35]">
            {reportLang === 'bn' ? '২. ঝুঁকি মূল্যায়ন ও সারসংক্ষেপ (Risk Priority Assessment)' : '2. Risk Priority Assessment'}
          </h2>
          <div className="p-4 rounded-lg border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">
                {reportLang === 'bn' ? `ঝুঁকি স্তর: ${getRiskLabel(meta.risk_level, 'bn')}` : `Risk Evaluation: ${getRiskLabel(meta.risk_level, 'en')}`}
              </span>
              <span className="text-xs font-mono font-bold">
                {reportLang === 'bn' ? `ঝুঁকি স্কোর: ${formatNumber(meta.risk_score || 85, 'bn')}/১০০` : `Risk Score: ${meta.risk_score || 85}/100`}
              </span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed font-serif">
              {reportLang === 'bn'
                ? (meta.risk_summary_bn || reportData?.summary_bn)
                : (meta.risk_summary_en || reportData?.summary_en || meta.risk_summary_bn)}
            </p>
          </div>
        </div>

        {/* Analyzed Documents List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#286B35]">
            {reportLang === 'bn' ? '৩. বিশ্লেষিত নথিপত্র ও ক্রিপ্টোগ্রাফিক হ্যাশ (Enrolled Documents)' : '3. Enrolled Documents & Cryptographic Hashes'}
          </h2>
          <table className="w-full text-xs text-left border border-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border border-gray-200">{reportLang === 'bn' ? 'নথির শিরোনাম' : 'Document Title'}</th>
                <th className="p-2 border border-gray-200">{reportLang === 'bn' ? 'শ্রেণি' : 'Category'}</th>
                <th className="p-2 border border-gray-200">{reportLang === 'bn' ? 'SHA-256 ক্রিপ্টোগ্রাফিক ফিঙ্গারপ্রিন্ট' : 'SHA-256 Cryptographic Hash'}</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="p-2 font-medium">{d.title}</td>
                  <td className="p-2">{d.type}</td>
                  <td className="p-2 font-mono text-[11px] text-gray-600">{d.sha256}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Findings and Traceable Evidence */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#286B35]">
            {reportLang === 'bn' ? '৪. সনাক্তকৃত অসঙ্গতি ও উৎস প্রমাণ (Findings & Traceable Evidence)' : '4. Findings & Traceable Evidence'}
          </h2>
          {anomalies.length > 0 ? (
            <div className="space-y-3">
              {anomalies.map((f: any) => (
                <div key={f.id} className="p-4 rounded-lg border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-red-700">
                      [{f.rule_code_snapshot}] {reportLang === 'bn' ? f.title_bn : (f.title_en || f.title_bn)}
                    </span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-gray-100 font-mono">
                      {getRiskLabel(f.severity, reportLang)}
                    </span>
                  </div>
                  <p className="text-gray-700">
                    {reportLang === 'bn' ? f.description_bn : (f.description_en || f.description_bn)}
                  </p>
                  {(f.human_action_recommended_bn || f.human_action_recommended_en) && (
                    <p className="text-emerald-800 bg-emerald-50 p-2 rounded text-[11px]">
                      <strong>{reportLang === 'bn' ? 'পর্যালোচকের করণীয়:' : 'Reviewer Action:'}</strong>{' '}
                      {reportLang === 'bn'
                        ? (f.human_action_recommended_bn || f.human_action_recommended_en)
                        : (f.human_action_recommended_en || f.human_action_recommended_bn)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 font-semibold p-3 bg-emerald-50 rounded border border-emerald-200">
              {reportLang === 'bn'
                ? '✓ দাখিলকৃত নথিপত্রে কোনো স্বত্ব বিরোধ বা গরমিল পাওয়া যায়নি।'
                : '✓ Zero title conflicts or transaction inconsistencies detected in submitted documents.'}
            </p>
          )}
        </div>

        {/* Disclaimer & Limitations */}
        <div className="pt-6 border-t border-gray-200 text-[11px] text-gray-500 space-y-1.5 leading-relaxed">
          <p className="font-bold text-gray-700">
            {reportLang === 'bn' ? 'আইনি সতর্কতা ও দায়মুক্তি বিবৃতি:' : 'Statutory Disclaimer & Limitations:'}
          </p>
          <p>
            {reportLang === 'bn'
              ? 'এই সফটওয়্যারটি সহকারী কমিশনার (ভূমি), সাব-রেজিস্ট্রার কার্যালয় বা আদালতের কোনো অনুমোদিত প্রতিস্থাপন নয়। চূড়ান্ত স্বত্ব ও লেনদেন কেবল আইনানুগ সরকারি প্রক্রিয়া ও যাচাইকরণ সাপেক্ষে কার্যকর।'
              : 'This software is an analytical decision-support system and does not replace the statutory authority of the Assistant Commissioner (Land), Sub-Registry Office, or the judiciary. Conclusive legal title is established solely through official administrative procedures.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs">লোড হচ্ছে...</div>}>
      <ReportContent />
    </Suspense>
  );
}

