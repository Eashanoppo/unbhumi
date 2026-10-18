'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { api, CaseItem, GraphData } from '@/lib/api';
import { OwnershipGraphVisualizer } from '@/components/OwnershipGraphVisualizer';
import { GitFork, Layers, RefreshCw, AlertCircle, Info } from 'lucide-react';

export default function StandaloneOwnershipGraphPage() {
  const { language } = useLanguage();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('UB-2026-1002');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const caseList = await api.getCases();
        setCases(caseList);
        if (caseList.length > 0) {
          const target = caseList.find(c => c.case_number === 'UB-2026-1002') || caseList[0];
          setSelectedCaseId(target.case_number);
          const graph = await api.getCaseGraph(target.case_number);
          setGraphData(graph);
        }
      } catch (err) {
        console.error('Failed to init graph page:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSelectCase = async (caseNo: string) => {
    setSelectedCaseId(caseNo);
    setLoading(true);
    try {
      const graph = await api.getCaseGraph(caseNo);
      setGraphData(graph);
    } catch (err) {
      console.error('Failed to load graph for case:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-2.5">
            <GitFork className="w-7 h-7 text-[var(--accent-deep)] dark:text-[#7ED957] shrink-0" />
            <span>{language === 'bn' ? 'মালিকানা ও দ্বৈত বিক্রি সংযোগ গ্রাফ' : 'Ownership & Transfer Topology'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {language === 'bn'
              ? 'জমি, খতিয়ান, নামজারি ও দলিলের মধ্যকার মালিকানা সম্পর্কের আন্তঃসংযোগ বিশ্লেষণ।'
              : 'Cross-analyzing deeds, khatian records, mutations, and parcel transfer topologies.'}
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="case-select" className="text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap">
            {language === 'bn' ? 'কেস নির্বাচন:' : 'Select Case:'}
          </label>
          <select
            id="case-select"
            value={selectedCaseId}
            onChange={(e) => handleSelectCase(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand-accent)] min-h-[44px] touch-target cursor-pointer"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.case_number}>
                {c.case_number} — {c.title.slice(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Graph Visualizer Container */}
      {loading ? (
        <div className="p-16 sm:p-24 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col items-center justify-center space-y-3 shadow-xs">
          <RefreshCw className="w-8 h-8 text-[var(--accent-deep)] dark:text-[#7ED957] animate-spin" />
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            {language === 'bn' ? 'গ্রাফ সংযোগ হিসাব করা হচ্ছে...' : 'Computing topological entity graph...'}
          </p>
        </div>
      ) : graphData ? (
        <OwnershipGraphVisualizer data={graphData} caseId={selectedCaseId} />
      ) : (
        <div className="p-12 text-center text-xs text-[var(--text-secondary)] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          {language === 'bn' ? 'কোনো গ্রাফ ডাটা পাওয়া যায়নি।' : 'No graph topology data found.'}
        </div>
      )}

      {/* Graph Legend & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2.5 shadow-xs">
          <span className="font-bold text-[var(--text-primary)] block text-xs uppercase tracking-wider">
            {language === 'bn' ? 'নোড লেজেন্ড (Node Types)' : 'Node Types Legend'}
          </span>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#286B35] border border-[#15803D] shrink-0"></span>
              <span className="text-[var(--text-secondary)]">
                {language === 'bn' ? 'দাগ নোড: খতিয়ানভুক্ত নির্দিষ্ট জমি / প্লট' : 'Parcel Node: Specific cadastral plot'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#FFF8E7] dark:bg-emerald-950/40 border border-[#286B35] shrink-0"></span>
              <span className="text-[var(--text-secondary)]">
                {language === 'bn' ? 'দলিল নোড: সাব-রেজিস্ট্রিকৃত সাফ-কবলা হস্তান্তর' : 'Deed Node: Registered deed transfer'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F5EEDC] dark:bg-slate-800 border border-[#697265] shrink-0"></span>
              <span className="text-[var(--text-secondary)]">
                {language === 'bn' ? 'ব্যক্তি নোড: ক্রেতা, বিক্রেতা বা সাবেক মালিক' : 'Person Node: Buyer, seller, or owner'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2.5 shadow-xs">
          <span className="font-bold text-[var(--text-primary)] block text-xs uppercase tracking-wider">
            {language === 'bn' ? 'সংযোগ ও দ্বৈত বিক্রি শনাক্তকরণ' : 'Conflicts & Double-Selling'}
          </span>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            {language === 'bn'
              ? 'লাল ড্যাশযুক্ত রেখা নির্দেশ করে যে একই দাগের জমি একই বিক্রেতার নিকট থেকে দুই ভিন্ন ক্রেতার কাছে হস্তান্তরের দাবি করা হয়েছে (সম্ভাব্য দ্বৈত বিক্রি সংকেত P001/G001)।'
              : 'Red dashed edges indicate that the same parcel was concurrently claimed transferred to two distinct parties by the same grantor (Double-Selling Signal P001/G001).'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2.5 shadow-xs">
          <span className="font-bold text-[var(--text-primary)] block text-xs uppercase tracking-wider">
            {language === 'bn' ? 'অ্যাক্সেসিবিলিটি নির্দেশিকা' : 'Accessibility & Tabular View'}
          </span>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            {language === 'bn'
              ? 'গ্রাফের বিকল্প হিসেবে উপরের "তালিকা" বাটনে ক্লিক করে স্ক্রিন-রিডার উপযোগী টেবিল ফরম্যাটে সকল নোড ও সম্পর্ক অবলোকন করা সম্ভব।'
              : 'Use the "Table" button in the toolbar above for a fully screen-reader accessible tabular representation of all nodes and relationships.'}
          </p>
        </div>
      </div>
    </div>
  );
}
