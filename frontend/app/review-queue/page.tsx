'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, AnomalyFinding } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import {
  AlertTriangle, CheckCircle, HelpCircle, XCircle, Filter,
  RefreshCw, Eye, MessageSquare, ArrowRight, ShieldAlert,
  ArrowLeft, Check, ShieldCheck
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Alerts Table */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent-deep)]" />
            <span>{t('queue_loading')}</span>
          </div>
        ) : alerts.length > 0 ? (
          <div className="overflow-x-auto">
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
                    <td className="py-3 px-4 font-mono font-bold text-[var(--accent-deep)]">
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
                          className="px-2.5 py-1 rounded text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] text-[var(--text-secondary)]"
                          title={t('view_case_tooltip')}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenDisposition(alert)}
                          className="px-3 py-1 rounded bg-[var(--accent-deep)] text-[#FAF9F6] hover:opacity-90 text-xs font-semibold"
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
        ) : (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] space-y-1">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-sm text-[var(--text-primary)]">{t('empty_queue_title')}</p>
            <p>{t('empty_queue_desc')}</p>
          </div>
        )}
      </div>

      {/* Human Disposition Decision Modal with Step-by-Step Progress Bar */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="max-w-lg w-full bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] p-6 space-y-5 shadow-2xl">
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
                className="text-[var(--text-secondary)] hover:text-black dark:hover:text-white p-1 rounded-lg"
              >
                ✕
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
                  className="h-full bg-gradient-to-r from-[var(--accent-deep)] to-[#7ED957] transition-all duration-300 rounded-full"
                  style={{ width: `${modalStep === 1 ? 33 : modalStep === 2 ? 66 : 100}%` }}
                />
              </div>

              {/* Step indicator badges */}
              <div className="flex items-center justify-between pt-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  className={`flex items-center gap-1 font-semibold ${modalStep === 1 ? 'text-[var(--accent-deep)] dark:text-[#7ED957]' : 'text-[var(--text-secondary)]'}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${modalStep > 1 ? 'bg-emerald-600 text-white' : modalStep === 1 ? 'bg-[var(--accent-deep)] text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {modalStep > 1 ? '✓' : formatNumber(1)}
                  </span>
                  <span>{t('disp_step1')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalStep(2)}
                  className={`flex items-center gap-1 font-semibold ${modalStep === 2 ? 'text-[var(--accent-deep)] dark:text-[#7ED957]' : 'text-[var(--text-secondary)]'}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${modalStep > 2 ? 'bg-emerald-600 text-white' : modalStep === 2 ? 'bg-[var(--accent-deep)] text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {modalStep > 2 ? '✓' : formatNumber(2)}
                  </span>
                  <span>{t('disp_step2')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (reasonBn.trim()) setModalStep(3);
                  }}
                  className={`flex items-center gap-1 font-semibold ${modalStep === 3 ? 'text-[var(--accent-deep)] dark:text-[#7ED957]' : 'text-[var(--text-secondary)]'}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${modalStep === 3 ? 'bg-[var(--accent-deep)] text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {formatNumber(3)}
                  </span>
                  <span>{t('disp_step3')}</span>
                </button>
              </div>
            </div>

            {/* Alert Context Banner */}
            <div className="p-3 rounded-lg bg-[var(--bg-surface-soft)] text-xs text-[var(--text-secondary)] space-y-1">
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
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors">
                      <input
                        type="radio"
                        name="decision"
                        value="confirmed_inconsistency"
                        checked={decision === 'confirmed_inconsistency'}
                        onChange={(e) => setDecision(e.target.value)}
                      />
                      <span>{t('disp_opt_confirmed')}</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors">
                      <input
                        type="radio"
                        name="decision"
                        value="resolved_legitimate"
                        checked={decision === 'resolved_legitimate'}
                        onChange={(e) => setDecision(e.target.value)}
                      />
                      <span>{t('disp_opt_resolved')}</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors">
                      <input
                        type="radio"
                        name="decision"
                        value="inconclusive"
                        checked={decision === 'inconclusive'}
                        onChange={(e) => setDecision(e.target.value)}
                      />
                      <span>{t('disp_opt_inconclusive')}</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors">
                      <input
                        type="radio"
                        name="decision"
                        value="false_positive"
                        checked={decision === 'false_positive'}
                        onChange={(e) => setDecision(e.target.value)}
                      />
                      <span>{t('disp_opt_false_positive')}</span>
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => setSelectedAlert(null)}
                      className="px-4 py-2 text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)]"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalStep(2)}
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>{language === 'bn' ? 'পরবর্তী: অফিসিয়াল নোট' : 'Next: Official Notes'}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: REVIEWER NOTES */}
              {modalStep === 2 && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)] block">
                      {t('disp_notes_label')}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={reasonBn}
                      onChange={(e) => setReasonBn(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] focus:ring-1 focus:ring-[var(--brand-accent)]"
                      placeholder={t('disp_notes_placeholder')}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="px-4 py-2 text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)] flex items-center gap-1"
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
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] flex items-center gap-1.5 disabled:opacity-50 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>{language === 'bn' ? 'পরবর্তী: নিশ্চিতকরণ' : 'Next: Confirmation'}</span>
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
                      <p className="font-medium text-[var(--text-primary)] italic bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-color)]">
                        &quot;{reasonBn}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>{t('disp_confirm_desc')}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => setModalStep(2)}
                      className="px-4 py-2 text-xs font-semibold border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface-soft)] flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t('btn_prev_step')}</span>
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
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
