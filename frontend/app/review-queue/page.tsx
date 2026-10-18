'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, AnomalyFinding } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import {
  AlertTriangle, CheckCircle, HelpCircle, XCircle, Filter,
  RefreshCw, Eye, MessageSquare, ArrowRight, ShieldAlert,
  ArrowLeft, Check, ShieldCheck, X
} from 'lucide-react';

export default function ReviewQueuePage() {
  const { language, t, getStatusLabel, formatNumber } = useLanguage();
  const [alerts, setAlerts] = useState<AnomalyFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AnomalyFinding | null>(null);
  const [decision, setDecision] = useState<string>('confirmed_inconsistency');
  const [reasonBn, setReasonBn] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlertsQueue();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleOpenDisposition = (alert: AnomalyFinding) => {
    setSelectedAlert(alert);
    setReasonBn(
      language === 'bn'
        ? (alert.human_action_recommended_bn || 'সাব-রেজিস্ট্রি ইনডেক্স ও মূল দলিল নিরীক্ষা সাপেক্ষে সিদ্ধান্ত গ্রহণ।')
        : (alert.human_action_recommended_en || 'Determine disposition based on sub-registry index book and original deed inspection.')
    );
  };

  const handleSubmitDisposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;

    setSubmitting(true);
    try {
      await api.submitDisposition(selectedAlert.id, decision, reasonBn);
      setSuccessMessage(t('disposition_success_msg'));
      setSelectedAlert(null);
      await loadAlerts();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to submit disposition:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {t('queue_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {t('queue_subtitle')}
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] transition-colors min-h-[44px] sm:min-h-0 touch-target cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--accent-deep)]' : ''}`} />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Alerts View: Desktop Table + Mobile Stacked Cards */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[var(--accent-deep)]" />
            <span className="font-medium">{t('queue_loading')}</span>
          </div>
        ) : alerts.length > 0 ? (
          <>
            {/* Mobile Stacked Cards (Visible < sm) */}
            <div className="divide-y divide-[var(--border-color)] block sm:hidden">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 space-y-3 hover:bg-[var(--bg-surface-soft)]/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-[var(--accent-deep)] dark:text-[#7ED957] bg-[var(--bg-surface-soft)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                      {alert.rule_code_snapshot}
                    </span>
                    <RiskBadge level={alert.severity} showScore={false} />
                  </div>

                  <div>
                    <Link
                      href={`/cases/${alert.case_number || alert.case_id}`}
                      className="text-xs font-bold text-[var(--accent-deep)] hover:underline flex items-center gap-1 font-mono mb-1"
                    >
                      <span>{alert.case_number || `Case #${alert.case_id}`}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <p className="font-bold text-sm text-[var(--text-primary)]">
                      {language === 'bn' ? alert.title_bn : alert.title_en}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-3">
                      {language === 'bn' ? alert.description_bn : alert.description_en}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                      {getStatusLabel(alert.status || 'flagged_review')}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/cases/${alert.case_number || alert.case_id}`}
                        className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] min-h-[44px] min-w-[44px] flex items-center justify-center touch-target"
                        title={t('view_case_tooltip')}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenDisposition(alert)}
                        className="px-4 py-2.5 rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] text-xs font-bold shadow-sm min-h-[44px] touch-target flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>{t('give_decision_btn')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (Hidden on mobile < sm) */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-surface-soft)]/40 font-semibold">
                    <th className="py-3 px-4">{t('col_rule_code')}</th>
                    <th className="py-3 px-4">{t('col_case_reference')}</th>
                    <th className="py-3 px-4">{t('col_detected_inconsistency')}</th>
                    <th className="py-3 px-4">{t('col_risk_level')}</th>
                    <th className="py-3 px-4">{t('col_current_status_label')}</th>
                    <th className="py-3 px-4 text-right">{t('col_reviewer_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-[var(--bg-surface-soft)]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--accent-deep)] dark:text-[#7ED957]">
                        {alert.rule_code_snapshot}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        <Link href={`/cases/${alert.case_number || alert.case_id}`} className="hover:underline text-[var(--accent-deep)] flex items-center gap-1 font-mono">
                          <span>{alert.case_number || `Case #${alert.case_id}`}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <p className="font-semibold text-[var(--text-primary)]">
                          {language === 'bn' ? alert.title_bn : alert.title_en}
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                          {language === 'bn' ? alert.description_bn : alert.description_en}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={alert.severity} showScore={false} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                          {getStatusLabel(alert.status || 'flagged_review')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/cases/${alert.case_number || alert.case_id}`}
                            className="p-2 rounded-lg text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title={t('view_case_tooltip')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleOpenDisposition(alert)}
                            className="px-3.5 py-1.5 rounded-lg bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            {t('give_decision_btn')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-base text-[var(--text-primary)]">{t('empty_queue_title')}</p>
            <p className="max-w-md mx-auto text-xs">{t('empty_queue_desc')}</p>
          </div>
        )}
      </div>

      {/* Human Disposition Decision Modal with Step-by-Step Progress Bar */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[var(--accent-deep)] dark:text-[#7ED957]">
                  [{selectedAlert.rule_code_snapshot}] {selectedAlert.case_number}
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {t('modal_disposition_header')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-[var(--text-secondary)] hover:text-black dark:hover:text-white p-2 rounded-xl hover:bg-[var(--bg-surface-soft)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-target cursor-pointer"
                aria-label={t('cancel')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step-by-Step Progress Bar */}
            <div className="space-y-2 bg-[var(--bg-surface-soft)]/50 p-3 rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-secondary)]">
                <span>
                  {modalStep === 1 && t('disp_step1')}
                  {modalStep === 2 && t('disp_step2')}
                  {modalStep === 3 && t('disp_step3')}
                </span>
                <span className="font-mono font-bold text-[var(--accent-deep)] dark:text-[#7ED957]">
                  {formatNumber(modalStep === 1 ? 33 : modalStep === 2 ? 66 : 100)}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--brand-accent)] to-[#7ED957] transition-all duration-300 rounded-full"
                  style={{ width: `${modalStep === 1 ? 33 : modalStep === 2 ? 66 : 100}%` }}
                />
              </div>

              {/* Step indicator badges */}
              <div className="flex items-center justify-between pt-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  className={`flex items-center gap-1 font-semibold min-h-[32px] touch-target cursor-pointer ${modalStep === 1 ? 'text-[var(--accent-deep)] dark:text-[#7ED957]' : 'text-[var(--text-secondary)]'}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${modalStep > 1 ? 'bg-emerald-600 text-white' : modalStep === 1 ? 'bg-[var(--brand-accent)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {modalStep > 1 ? <Check className="w-2.5 h-2.5" /> : formatNumber(1)}
                  </span>
                  <span>{t('disp_step1')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalStep(2)}
                  className={`flex items-center gap-1 font-semibold min-h-[32px] touch-target cursor-pointer ${modalStep === 2 ? 'text-[var(--accent-deep)] dark:text-[#7ED957]' : 'text-[var(--text-secondary)]'}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${modalStep > 2 ? 'bg-emerald-600 text-white' : modalStep === 2 ? 'bg-[var(--brand-accent)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {modalStep > 2 ? <Check className="w-2.5 h-2.5" /> : formatNumber(2)}
                  </span>
                  <span>{t('disp_step2')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (reasonBn.trim()) setModalStep(3);
                  }}
                  className={`flex items-center gap-1 font-semibold min-h-[32px] touch-target cursor-pointer ${modalStep === 3 ? 'text-[var(--accent-deep)] dark:text-[#7ED957]' : 'text-[var(--text-secondary)]'}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${modalStep === 3 ? 'bg-[var(--brand-accent)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {formatNumber(3)}
                  </span>
                  <span>{t('disp_step3')}</span>
                </button>
              </div>
            </div>

            {/* Alert Context Banner */}
            <div className="p-3 rounded-xl bg-[var(--bg-surface-soft)] text-xs text-[var(--text-secondary)] space-y-1 border border-[var(--border-color)]">
              <p className="font-bold text-[var(--text-primary)]">
                {language === 'bn' ? selectedAlert.title_bn : selectedAlert.title_en}
              </p>
              <p className="text-[11px] line-clamp-2">
                {language === 'bn' ? selectedAlert.description_bn : selectedAlert.description_en}
              </p>
            </div>

            <form onSubmit={handleSubmitDisposition} className="space-y-4">
              {/* STEP 1: SELECT DISPOSITION DETERMINATION */}
              {modalStep === 1 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--text-primary)] block">
                    {t('select_disp_type')}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors min-h-[44px] touch-target">
                      <input
                        type="radio"
                        name="decision"
                        value="confirmed_inconsistency"
                        checked={decision === 'confirmed_inconsistency'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="accent-[var(--brand-accent)] w-4 h-4"
                      />
                      <span>{t('disp_opt_confirmed')}</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors min-h-[44px] touch-target">
                      <input
                        type="radio"
                        name="decision"
                        value="resolved_legitimate"
                        checked={decision === 'resolved_legitimate'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="accent-[var(--brand-accent)] w-4 h-4"
                      />
                      <span>{t('disp_opt_resolved')}</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors min-h-[44px] touch-target">
                      <input
                        type="radio"
                        name="decision"
                        value="inconclusive"
                        checked={decision === 'inconclusive'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="accent-[var(--brand-accent)] w-4 h-4"
                      />
                      <span>{t('disp_opt_inconclusive')}</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors min-h-[44px] touch-target">
                      <input
                        type="radio"
                        name="decision"
                        value="false_positive"
                        checked={decision === 'false_positive'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="accent-[var(--brand-accent)] w-4 h-4"
                      />
                      <span>{t('disp_opt_false_positive')}</span>
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)] gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAlert(null)}
                      className="px-4 py-2.5 text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)] min-h-[44px] touch-target cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalStep(2)}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer min-h-[44px] touch-target"
                    >
                      <span>{t('btn_next_notes')}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: REVIEWER NOTES */}
              {modalStep === 2 && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-primary)] block">
                      {t('disp_notes_label')}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={reasonBn}
                      onChange={(e) => setReasonBn(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] focus:ring-1 focus:ring-[var(--brand-accent)] outline-none"
                      placeholder={t('disp_notes_placeholder')}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)] gap-2">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="px-4 py-2.5 text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)] flex items-center gap-1.5 min-h-[44px] touch-target cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t('btn_prev_step')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (reasonBn.trim()) setModalStep(3);
                      }}
                      disabled={!reasonBn.trim()}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] flex items-center gap-1.5 disabled:opacity-50 shadow-sm active:scale-95 cursor-pointer min-h-[44px] touch-target"
                    >
                      <span>{t('btn_next_confirm')}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: FINAL CONFIRMATION & SUBMIT */}
              {modalStep === 3 && (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">{t('select_disp_type')}:</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {decision === 'confirmed_inconsistency' && t('disp_opt_confirmed')}
                        {decision === 'resolved_legitimate' && t('disp_opt_resolved')}
                        {decision === 'inconclusive' && t('disp_opt_inconclusive')}
                        {decision === 'false_positive' && t('disp_opt_false_positive')}
                      </span>
                    </div>

                    <div className="border-t border-[var(--border-color)] pt-1.5 space-y-1">
                      <span className="text-[var(--text-secondary)] block">{t('disp_notes_label')}:</span>
                      <p className="font-medium text-[var(--text-primary)] italic bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-color)] break-words">
                        &quot;{reasonBn}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p>{t('disp_confirm_desc')}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)] gap-2">
                    <button
                      type="button"
                      onClick={() => setModalStep(2)}
                      className="px-4 py-2.5 text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)] flex items-center gap-1.5 min-h-[44px] touch-target cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t('btn_prev_step')}</span>
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] shadow-md hover:shadow-lg active:scale-95 cursor-pointer min-h-[44px] touch-target"
                    >
                      {submitting ? t('submitting_disposition') : t('disp_submit_btn')}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
