'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, CaseItem, GraphData, AnomalyFinding } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { OwnershipGraphVisualizer } from '@/components/OwnershipGraphVisualizer';
import { DocumentViewer } from '@/components/DocumentViewer';
import {
  ShieldCheck, AlertTriangle, FileText, GitFork, Printer,
  RefreshCw, CheckCircle2, Info, ArrowLeft, History, AlertCircle, Sparkles
} from 'lucide-react';
import { CaseAIChatDrawer } from '@/components/CaseAIChatDrawer';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;
  const { language, t, formatNumber, formatDate, getStatusLabel } = useLanguage();

  const [caseItem, setCaseItem] = useState<CaseItem | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningChecks, setRunningChecks] = useState(false);
  const [activeTab, setActiveTab] = useState<'findings' | 'graph' | 'documents' | 'audit'>('findings');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);

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

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    setSavingStatus(true);
    setStatusMessage(null);
    try {
      await api.updateCaseStatus(caseId, selectedStatus);
      await loadCaseData();
      setStatusMessage(t('decision_saved_msg') || (language === 'bn' ? 'পর্যালোচকের সিদ্ধান্ত সফলভাবে সংরক্ষিত হয়েছে।' : 'Decision saved successfully.'));
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
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[var(--brand-accent)] animate-spin" />
        <p className="text-sm text-[var(--text-secondary)]">{t('loading_data')}</p>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-base text-red-600 font-semibold">{t('case_not_found')}</p>
        <Link href="/cases" className="text-xs text-[var(--brand-accent)] underline">
          {t('back_to_cases')}
        </Link>
      </div>
    );
  }

  const anomalies = caseItem.anomalies || [];
  const documents = caseItem.documents || [];
  const auditEvents = caseItem.audit_events || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 animate-in fade-in-50">
      {/* Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[44px] py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back_to_cases')}</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAiChatOpen(true)}
            aria-label={language === 'bn' ? 'এআই আইনি পরামর্শক' : 'AI Legal Advisor'}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white transition-all shadow-md active:scale-95 cursor-pointer ring-1 ring-emerald-400/40 hover:shadow-emerald-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span>{language === 'bn' ? 'এআই পরামর্শক (Chat)' : 'AI Advisor (Chat)'}</span>
          </button>

          <button
            onClick={handleRunChecks}
            disabled={runningChecks}
            aria-label={t('rerun_checks_btn')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] text-[var(--text-primary)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningChecks ? 'animate-spin text-[var(--brand-accent)]' : ''}`} />
            <span>{runningChecks ? t('running_checks') : t('rerun_checks_btn')}</span>
          </button>

          <Link
            href={`/reports?case=${caseItem.case_number}`}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('print_pdf')}</span>
          </Link>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="p-5 sm:p-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-[var(--brand-accent)]">
                {caseItem.case_number}
              </span>
              <RiskBadge level={caseItem.risk_level} score={caseItem.risk_score} size="sm" />
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] font-semibold border border-[var(--border-color)]">
                {getStatusLabel(caseItem.status)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {caseItem.title}
            </h1>
          </div>

          <div className="text-xs text-[var(--text-secondary)] sm:text-right space-y-0.5 font-mono">
            <p>{t('case_filed_date', { date: formatDate(caseItem.created_at) })}</p>
            <p>{t('case_updated_date', { time: new Date(caseItem.updated_at).toLocaleTimeString() })}</p>
          </div>
        </div>

        {/* Parcel Info Pills (Responsive 2 cols on mobile, 4 cols on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-surface-soft)]/60 border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)] text-[11px] block">{t('mouza_area_label')}</span>
            <span className="font-bold text-sm text-[var(--text-primary)] truncate block mt-0.5">{caseItem.mouza || '—'}</span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-surface-soft)]/60 border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)] text-[11px] block">{t('dag_survey_label')}</span>
            <span className="font-bold text-sm text-[var(--text-primary)] truncate block mt-0.5 font-mono">
              {caseItem.dag_number
                ? t('dag_survey_val', { dag: formatNumber(caseItem.dag_number), survey: caseItem.parcel?.survey_type || '' })
                : '—'}
            </span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-surface-soft)]/60 border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)] text-[11px] block">{t('recorded_area_label')}</span>
            <span className="font-bold text-sm text-[var(--text-primary)] truncate block mt-0.5 font-mono">
              {caseItem.recorded_area !== undefined && caseItem.recorded_area !== null
                ? t('recorded_area_val', { area: formatNumber(caseItem.recorded_area) })
                : '—'}
            </span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-surface-soft)]/60 border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)] text-[11px] block">{t('attached_docs_label')}</span>
            <span className="font-bold text-sm text-[var(--text-primary)] truncate block mt-0.5 font-mono">
              {t('attached_docs_val', { count: formatNumber(documents.length) })}
            </span>
          </div>
        </div>

        {/* Risk Explanation Banner */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
          caseItem.risk_level === 'critical'
            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
            : caseItem.risk_level === 'high'
            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
        }`}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-sm">{t('risk_reason_title')}</p>
            <p>
              {language === 'bn'
                ? (caseItem.risk_summary_bn || t('risk_clean_summary'))
                : (caseItem.risk_summary_en || caseItem.risk_summary_bn || t('risk_clean_summary'))}
            </p>
          </div>
        </div>
      </div>

      {/* Human Reviewer Decision & Disposition Panel */}
      <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--brand-accent)]" />
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {t('review_panel_title')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {t('review_panel_subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">{t('current_status_label')}</span>
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-[var(--accent-light)] text-[var(--brand-accent)] border border-[var(--border-color)]">
              {getStatusLabel(caseItem.status)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="flex-1">
            <label htmlFor="review-status" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {t('select_status_label')}
            </label>
            <select
              id="review-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-medium p-2.5 min-h-[44px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] cursor-pointer"
            >
              <option value="flagged_review">{t('opt_flagged_review')}</option>
              <option value="verified_clean">{t('opt_verified_clean')}</option>
              <option value="resolved">{t('opt_resolved')}</option>
              <option value="processing">{t('opt_processing')}</option>
            </select>
          </div>

          <div className="sm:self-end">
            <button
              onClick={handleUpdateStatus}
              disabled={savingStatus || selectedStatus === caseItem.status}
              className={`w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                selectedStatus === caseItem.status
                  ? 'bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)] cursor-not-allowed opacity-60'
                  : 'bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)]'
              }`}
            >
              {savingStatus && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{savingStatus ? t('saving_decision') : t('save_decision_btn')}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs (Accessible, touch-friendly min 44px) */}
      <div className="flex border-b border-[var(--border-color)] gap-1 sm:gap-2 text-xs font-semibold overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('findings')}
          className={`px-3.5 py-3 min-h-[44px] flex items-center gap-1.5 border-b-2 transition-colors shrink-0 cursor-pointer ${
            activeTab === 'findings'
              ? 'border-[var(--brand-accent)] text-[var(--brand-accent)] font-bold'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{t('tab_findings', { count: formatNumber(anomalies.length) })}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('graph')}
          className={`px-3.5 py-3 min-h-[44px] flex items-center gap-1.5 border-b-2 transition-colors shrink-0 cursor-pointer ${
            activeTab === 'graph'
              ? 'border-[var(--brand-accent)] text-[var(--brand-accent)] font-bold'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>{t('tab_graph')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-3 min-h-[44px] flex items-center gap-1.5 border-b-2 transition-colors shrink-0 cursor-pointer ${
            activeTab === 'documents'
              ? 'border-[var(--brand-accent)] text-[var(--brand-accent)] font-bold'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('tab_documents', { count: formatNumber(documents.length) })}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-3 min-h-[44px] flex items-center gap-1.5 border-b-2 transition-colors shrink-0 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-[var(--brand-accent)] text-[var(--brand-accent)] font-bold'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t('tab_audit', { count: formatNumber(auditEvents.length) })}</span>
        </button>
      </div>

      {/* Tab 1: Anomaly Findings with Traceable Evidence */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {anomalies.length > 0 ? (
            anomalies.map((f: AnomalyFinding) => (
              <div
                key={f.id}
                className="p-5 sm:p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-xs"
              >
                {/* Finding Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--brand-accent)] border border-[var(--border-color)]">
                      {t('finding_rule_badge', { code: f.rule_code_snapshot })}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {language === 'bn' ? f.title_bn : (f.title_en || f.title_bn)}
                    </h3>
                  </div>
                  <RiskBadge level={f.severity} showScore={false} size="sm" />
                </div>

                {/* Finding Description */}
                <div className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">{t('finding_details_label')}</p>
                  <p>{language === 'bn' ? f.description_bn : (f.description_en || f.description_bn)}</p>
                </div>

                {/* Conflicting Records Table (Mobile-safe break-all) */}
                {f.conflicting_records && f.conflicting_records.length > 0 && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[var(--text-primary)]">
                        {t('discrepancy_title')}
                      </span>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className="text-[11px] font-bold text-[var(--brand-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{t('goto_docs_btn')}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {f.conflicting_records.map((rec: Record<string, unknown>, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono text-[11px] space-y-1">
                          {Object.entries(rec).map(([k, v]) => (
                            <div key={k} className="flex justify-between border-b border-[var(--border-color)]/30 pb-0.5 gap-2">
                              <span className="text-[var(--text-secondary)] font-sans truncate">{k}:</span>
                              <span className="font-semibold text-[var(--text-primary)] break-all text-right">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Human Reviewer Recommended Action */}
                {f.human_action_recommended_bn && (
                  <div className="p-3.5 rounded-xl bg-[var(--accent-light)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-[var(--brand-accent)]">{t('reviewer_action_label')} </span>
                      <span>{f.human_action_recommended_bn}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-[var(--text-primary)]">{t('no_findings_title')}</h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                {t('no_findings_desc')}
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
            <div className="p-8 text-center text-xs text-[var(--text-secondary)]">{t('loading_data')}</div>
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
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[var(--border-color)] font-bold text-xs bg-[var(--bg-surface-soft)]/60">
            {t('report_sec4_title')}
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {auditEvents.map((a: { id: number; action_display: string; details: unknown; user_email?: string; created_at: string }) => (
              <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">{a.action_display}</p>
                  <p className="font-mono text-[11px] text-[var(--text-secondary)] break-all">
                    {JSON.stringify(a.details)}
                  </p>
                </div>
                <div className="text-left sm:text-right text-[var(--text-secondary)] shrink-0 font-mono text-[11px]">
                  <p>{a.user_email || 'System'}</p>
                  <p>{formatDate(a.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating AI Legal Advisor Trigger Button */}
      <button
        onClick={() => setAiChatOpen(true)}
        aria-label={language === 'bn' ? 'এআই আইনি পরামর্শকের সাথে চ্যাট করুন' : 'Chat with AI Legal Advisor'}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-xs shadow-xl shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500 hover:scale-105 active:scale-95 transition-all border border-emerald-300/40 cursor-pointer group"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </div>
        <span className="tracking-wide">
          {language === 'bn' ? 'এআই পরামর্শক (GraphRAG)' : 'AI Advisor (GraphRAG)'}
        </span>
      </button>

      {/* AI Legal Advisor Drawer */}
      <CaseAIChatDrawer
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        caseItem={caseItem}
      />
    </div>
  );
}
