'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { api, CaseItem, GraphData, AnomalyFinding } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { OwnershipGraphVisualizer } from '@/components/OwnershipGraphVisualizer';
import { DocumentViewer } from '@/components/DocumentViewer';
import {
  ShieldCheck, AlertTriangle, FileText, GitFork, Printer,
  RefreshCw, CheckCircle2, Info, ArrowLeft, Clock, History, AlertCircle
} from 'lucide-react';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;
  const router = useRouter();
  const { language } = useLanguage();

  const [caseItem, setCaseItem] = useState<CaseItem | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningChecks, setRunningChecks] = useState(false);
  const [activeTab, setActiveTab] = useState<'findings' | 'graph' | 'documents' | 'audit'>('findings');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const loadCaseData = async () => {
    try {
      const data = await api.getCaseDetail(caseId);
      setCaseItem(data);
      setSelectedStatus(data.status);

      const graph = await api.getCaseGraph(caseId);
      setGraphData(graph);
    } catch (err) {
      console.error('Failed to load case detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    setSavingStatus(true);
    setStatusMessage(null);
    try {
      await api.updateCaseStatus(caseId, selectedStatus);
      await loadCaseData();
      setStatusMessage('পর্যালোচকের সিদ্ধান্ত সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে।');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleRunChecks = async () => {
    setRunningChecks(true);
    try {
      await api.runChecks(caseId);
      await loadCaseData();
    } catch (err) {
      console.error('Failed to run checks:', err);
    } finally {
      setRunningChecks(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[var(--accent-deep)] animate-spin" />
        <p className="text-sm text-[var(--text-secondary)]">কেসের বিস্তারিত তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-base text-red-600 font-semibold">কেস পাওয়া যায়নি (Case Not Found)</p>
        <Link href="/cases" className="text-xs text-[var(--accent-deep)] underline">
          সকল কেসে ফিরে যান
        </Link>
      </div>
    );
  }

  const anomalies = caseItem.anomalies || [];
  const documents = caseItem.documents || [];
  const auditEvents = caseItem.audit_events || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>সকল কেসের তালিকা</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunChecks}
            disabled={runningChecks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] text-[var(--text-primary)] transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningChecks ? 'animate-spin' : ''}`} />
            <span>{runningChecks ? 'যাচাই চলছে...' : 'পুনরায় চেক চালান'}</span>
          </button>

          <Link
            href={`/reports?case=${caseItem.case_number}`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[var(--accent-deep)] text-[#FFF8E7] hover:bg-[var(--accent-deep)]/90 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#7ED957]" />
            <span>প্রতিবেদন প্রিন্ট / PDF</span>
          </Link>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[var(--accent-deep)] dark:text-[#7ED957]">
                {caseItem.case_number}
              </span>
              <RiskBadge level={caseItem.risk_level} score={caseItem.risk_score} />
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] font-medium">
                {caseItem.status_display}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] mt-1">
              {caseItem.title}
            </h1>
          </div>

          <div className="text-xs text-[var(--text-secondary)] sm:text-right space-y-0.5">
            <p>দাখিল: {new Date(caseItem.created_at).toLocaleDateString()}</p>
            <p>সর্বশেষ আপডেট: {new Date(caseItem.updated_at).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Parcel Info Pills & Risk Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[var(--bg-surface-soft)]/60 border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)] block">মৌজা ও এলাকা</span>
            <span className="font-semibold text-sm text-[var(--text-primary)]">{caseItem.mouza || 'সাভার'}</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-surface-soft)]/60 border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)] block">দাগ ও জরিপ</span>
            <span className="font-semibold text-sm text-[var(--text-primary)]">দাগ নং {caseItem.dag_number || '৪১২'} (RS)</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-surface-soft)]/60 border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)] block">রেকর্ডকৃত জমি</span>
            <span className="font-semibold text-sm text-[var(--text-primary)]">{caseItem.recorded_area || 25} শতাংশ</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-surface-soft)]/60 border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)] block">সংযুক্ত নথিপত্র</span>
            <span className="font-semibold text-sm text-[var(--text-primary)]">{documents.length}টি দলিল/খতিয়ান</span>
          </div>
        </div>

        {/* Risk Explanation Banner */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
          caseItem.risk_level === 'critical'
            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-300'
            : caseItem.risk_level === 'high'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-300'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
        }`}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm mb-0.5">ঝুঁকি সংকেতের কারণ ও সারসংক্ষেপ:</p>
            <p>{caseItem.risk_summary_bn || 'প্রদত্ত নথিসমূহে কোনো সুস্পষ্ট স্বত্ব বিরোধ বা খতিয়ান অমিল শনাক্ত হয়নি।'}</p>
          </div>
        </div>
      </div>

      {/* Human Reviewer Decision & Disposition Panel (Phase 5 Step 7) */}
      <div className="p-4 sm:p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--accent-deep)]" />
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                মানবীয় পর্যালোচনা ও কেস নিষ্পত্তি (Human Review & Case Disposition)
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                পর্যালোচকের সিদ্ধান্ত সরাসরি ডাটাবেসে সংরক্ষিত হয় এবং অডিট ট্রেইলে লিপিবদ্ধ থাকে
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">বর্তমান স্থিতি:</span>
            <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-[var(--accent-light)] text-[var(--accent-deep)] border border-[var(--border-color)]">
              {caseItem.status_display}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="flex-1">
            <label htmlFor="review-status" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              নতুন স্থিতি নির্বাচন করুন:
            </label>
            <select
              id="review-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-medium p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-deep)]"
            >
              <option value="flagged_review">পর্যালোচনা প্রয়োজন (Needs Review)</option>
              <option value="verified_clean">যাচাই সম্পন্ন - অসঙ্গতিহীন (Verified Clean)</option>
              <option value="resolved">পর্যালোচনা সম্পন্ন / নিষ্পত্তিকৃত (Review Resolved)</option>
              <option value="processing">বিশ্লেষণ চলমান (Processing)</option>
            </select>
          </div>

          <div className="sm:self-end">
            <button
              onClick={handleUpdateStatus}
              disabled={savingStatus || selectedStatus === caseItem.status}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                selectedStatus === caseItem.status
                  ? 'bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)] cursor-not-allowed'
                  : 'bg-[var(--accent-deep)] text-[#FAF9F6] hover:opacity-90'
              }`}
            >
              {savingStatus && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{savingStatus ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--border-color)] gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('findings')}
          className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'findings'
              ? 'border-[var(--accent-deep)] text-[var(--accent-deep)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>শনাক্তকৃত অসঙ্গতিসমূহ ({anomalies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'graph'
              ? 'border-[var(--accent-deep)] text-[var(--accent-deep)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>মালিকানা ও লেনদেন গ্রাফ</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'documents'
              ? 'border-[var(--accent-deep)] text-[var(--accent-deep)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>নথি প্রিভিউ ও ওসিআর ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-[var(--accent-deep)] text-[var(--accent-deep)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>অডিট ট্রেইল ({auditEvents.length})</span>
        </button>
      </div>

      {/* Tab 1: Anomaly Findings with Traceable Evidence */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {anomalies.length > 0 ? (
            anomalies.map((f: AnomalyFinding) => (
              <div
                key={f.id}
                className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3.5 shadow-sm"
              >
                {/* Finding Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] border border-[var(--border-color)]">
                      রুল: {f.rule_code_snapshot}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {f.title_bn}
                    </h3>
                  </div>
                  <RiskBadge level={f.severity} showScore={false} />
                </div>

                {/* Finding Description (What was detected & Why it matters) */}
                <div className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-1">
                  <p className="font-medium text-[var(--text-primary)]">শনাক্তকরণের বিস্তারিত বিবরণ:</p>
                  <p>{f.description_bn}</p>
                </div>

                {/* Conflicting Records Table */}
                {f.conflicting_records && f.conflicting_records.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[var(--text-primary)]">
                        পরস্পরবিরোধী রেকর্ডসমূহ (Discrepancy Breakdown):
                      </span>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className="text-[11px] font-bold text-[var(--accent-deep)] hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>নথি প্রমাণে যান</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {f.conflicting_records.map((rec: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono text-[11px] space-y-1">
                          {Object.entries(rec).map(([k, v]) => (
                            <div key={k} className="flex justify-between border-b border-[var(--border-color)]/30 pb-0.5">
                              <span className="text-[var(--text-secondary)] font-sans">{k}:</span>
                              <span className="font-semibold text-[var(--text-primary)]">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Human Reviewer Recommended Action */}
                {f.human_action_recommended_bn && (
                  <div className="p-3 rounded-lg bg-[var(--accent-light)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-start gap-2">
                    <Info className="w-4 h-4 text-[var(--accent-deep)] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--accent-deep)]">পর্যালোচকের করণীয়: </span>
                      <span>{f.human_action_recommended_bn}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-[var(--text-primary)]">কোনো অসঙ্গতি বা জালিয়াতির সংকেত পাওয়া যায়নি</h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                সকল দাখিলকৃত দলিল, বায়া দলিল, আরএস খতিয়ান ও রাজস্ব রেকর্ড সম্পূর্ণ সামঞ্জস্যপূর্ণ।
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Ownership & Transaction Graph */}
      {activeTab === 'graph' && (
        <div>
          {graphData ? (
            <OwnershipGraphVisualizer data={graphData} />
          ) : (
            <div className="p-8 text-center text-xs text-[var(--text-secondary)]">গ্রাফ প্রস্তুত হচ্ছে...</div>
          )}
        </div>
      )}

      {/* Tab 3: Documents and Field Verification */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {documents.map((doc) => (
            <DocumentViewer key={doc.id} document={doc} onFieldUpdated={loadCaseData} />
          ))}
        </div>
      )}

      {/* Tab 4: Audit History */}
      {activeTab === 'audit' && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-color)] font-bold text-xs bg-[var(--bg-surface-soft)]/50">
            অডিট ট্রেইল ও পর্যালোচক পরিবর্তনের ইতিহাস
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {auditEvents.map((a: any) => (
              <div key={a.id} className="p-4 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">{a.action_display}</p>
                  <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {JSON.stringify(a.details)}
                  </p>
                </div>
                <div className="text-right text-[var(--text-secondary)] shrink-0">
                  <p>{a.user_email || 'System'}</p>
                  <p className="text-[11px]">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
