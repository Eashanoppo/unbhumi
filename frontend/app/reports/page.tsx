'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, CaseItem } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { Printer, Download, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Hash, Info } from 'lucide-react';

function ReportContent() {
  const searchParams = useSearchParams();
  const caseParam = searchParams.get('case') || 'UB-2026-1002';

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<string>(caseParam);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    return <div className="p-16 text-center text-xs text-[var(--text-secondary)]">প্রতিবেদন প্রস্তুত হচ্ছে...</div>;
  }

  const meta = reportData?.case_metadata || {};
  const documents = reportData?.documents || [];
  const anomalies = reportData?.anomalies || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Control Bar (Hidden when printing) */}
      <div className="no-print p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">কেস পরিবর্তন:</span>
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
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface-soft)] hover:bg-[var(--border-color)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON এক্সপোর্ট</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--accent-deep)] text-[#FFF8E7] hover:bg-[var(--accent-deep)]/90 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#7ED957]" />
            <span>প্রিন্ট / PDF সংরক্ষণ</span>
          </button>
        </div>
      </div>

      {/* Printable Report Paper Layout */}
      <div className="card p-8 sm:p-12 rounded-2xl border border-[var(--border-color)] bg-white text-black space-y-8 shadow-md">
        {/* Official Header */}
        <div className="border-b-2 border-[#286B35] pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#286B35] flex items-center justify-center text-[#7ED957]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#286B35]">
                UNBUmi Detector — আনভূমি ডিটেক্টর
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              এআই-সহায়তাকৃত ভূমি দলিল ও স্বত্ব যাচাইকরণ প্রযুক্তি প্রতিবেদন (P3 Track)
            </p>
            <p className="text-[11px] text-gray-500 font-mono">
              ডেভেলপমেন্ট: UNLEFT • LandTech Innovation Hackathon 2026
            </p>
          </div>

          <div className="text-right text-xs text-gray-600 space-y-1 font-mono">
            <p><strong>রিপোর্ট নং:</strong> {reportData?.report_id}</p>
            <p><strong>তারিখ:</strong> {reportData?.generated_at ? new Date(reportData.generated_at).toLocaleDateString() : '১৭/১০/২০২৬'}</p>
            <p><strong>স্ট্যাটাস:</strong> {meta.status}</p>
          </div>
        </div>

        {/* Case Metadata Summary */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#286B35]">
            ১. কেস ও দাগের বিবরণ (Case Details)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs">
            <div>
              <span className="text-gray-500 block">কেস রেফারেন্স</span>
              <span className="font-mono font-bold text-sm">{meta.case_number}</span>
            </div>
            <div>
              <span className="text-gray-500 block">মৌজা ও উপজেলা</span>
              <span className="font-semibold">{meta.mouza || 'সাভার'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">দাগ ও জরিপ</span>
              <span className="font-semibold">দাগ নং {meta.dag_number} ({meta.survey_type})</span>
            </div>
            <div>
              <span className="text-gray-500 block">রেকর্ডকৃত জমি</span>
              <span className="font-semibold">{meta.recorded_area} শতাংশ</span>
            </div>
          </div>
        </div>

        {/* Risk Priority Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#286B35]">
            ২. ঝুঁকি মূল্যায়ন ও সারসংক্ষেপ (Risk Priority Assessment)
          </h2>
          <div className="p-4 rounded-lg border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">ঝুঁকি স্তর: {meta.risk_level}</span>
              <span className="text-xs font-mono font-bold">ঝুঁকি স্কোর: {meta.risk_score}/১০০</span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed font-serif">
              {meta.risk_summary_bn}
            </p>
          </div>
        </div>

        {/* Analyzed Documents List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#286B35]">
            ৩. বিশ্লেষিত নথিপত্র ও ক্রিপ্টোগ্রাফিক হ্যাশ (Enrolled Documents)
          </h2>
          <table className="w-full text-xs text-left border border-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border border-gray-200">নথির শিরোনাম</th>
                <th className="p-2 border border-gray-200">শ্রেণি</th>
                <th className="p-2 border border-gray-200">SHA-256 ক্রিপ্টোগ্রাফিক ফিঙ্গারপ্রিন্ট</th>
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
            ৪. সনাক্তকৃত অসঙ্গতি ও উৎস প্রমাণ (Findings & Traceable Evidence)
          </h2>
          {anomalies.length > 0 ? (
            <div className="space-y-3">
              {anomalies.map((f: any) => (
                <div key={f.id} className="p-4 rounded-lg border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-red-700">[{f.rule_code_snapshot}] {f.title_bn}</span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-gray-100">{f.severity}</span>
                  </div>
                  <p className="text-gray-700">{f.description_bn}</p>
                  {f.human_action_recommended_bn && (
                    <p className="text-emerald-800 bg-emerald-50 p-2 rounded text-[11px]">
                      <strong>পর্যালোচকের করণীয়:</strong> {f.human_action_recommended_bn}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 font-semibold p-3 bg-emerald-50 rounded border border-emerald-200">
              ✓ দাখিলকৃত নথিপত্রে কোনো স্বত্ব বিরোধ বা গরমিল পাওয়া যায়নি।
            </p>
          )}
        </div>

        {/* Disclaimer & Limitations */}
        <div className="pt-6 border-t border-gray-200 text-[11px] text-gray-500 space-y-1.5 leading-relaxed">
          <p className="font-bold text-gray-700">আইনি সতর্কতা ও দায়মুক্তি বিবৃতি:</p>
          <p>
            {reportData?.disclaimer} এই সফটওয়্যারটি সহকারী কমিশনার (ভূমি), সাব-রেজিস্ট্রার কার্যালয় বা আদালতের কোনো অনুমোদিত প্রতিস্থাপন নয়। চূড়ান্ত স্বত্ব ও লেনদেন কেবল আইনানুগ সরকারি প্রক্রিয়া ও যাচাইকরণ সাপেক্ষে কার্যকর।
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
