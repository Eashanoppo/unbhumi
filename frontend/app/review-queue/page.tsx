'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, AnomalyFinding } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import {
  AlertTriangle, CheckCircle, HelpCircle, XCircle, Filter,
  RefreshCw, Eye, MessageSquare, ArrowRight, ShieldAlert
} from 'lucide-react';

export default function ReviewQueuePage() {
  const { language } = useLanguage();
  const [alerts, setAlerts] = useState<AnomalyFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AnomalyFinding | null>(null);
  const [decision, setDecision] = useState<string>('confirmed_inconsistency');
  const [reasonBn, setReasonBn] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    setReasonBn(alert.human_action_recommended_bn || 'সাব-রেজিস্ট্রি ইনডেক্স ও মূল দলিল নিরীক্ষা সাপেক্ষে সিদ্ধান্ত গ্রহণ।');
  };

  const handleSubmitDisposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;

    setSubmitting(true);
    try {
      await api.submitDisposition(selectedAlert.id, decision, reasonBn);
      setSuccessMessage('পর্যালোচকের সিদ্ধান্ত সফলভাবে সংরক্ষিত এবং অডিট লগ লিপিবদ্ধ হয়েছে।');
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
            {language === 'bn' ? 'পর্যালোচক ওয়ার্কস্পেস ও কিউ' : 'Review Queue'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            মানবীয় পর্যালোচকের জন্য অপেক্ষমান অসঙ্গতি সংকেত এবং আনুষ্ঠানিক সিদ্ধান্তের কর্মক্ষেত্র।
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>রিফ্রেশ</span>
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
            <span>অসঙ্গতি কিউ লোড হচ্ছে...</span>
          </div>
        ) : alerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-surface-soft)]/40 font-semibold">
                  <th className="py-3 px-4">রুল কোড</th>
                  <th className="py-3 px-4">কেস রেফারেন্স</th>
                  <th className="py-3 px-4">শনাক্তকৃত অসঙ্গতি</th>
                  <th className="py-3 px-4">ঝুঁকি স্তর</th>
                  <th className="py-3 px-4">বর্তমান স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">পর্যালোচক সিদ্ধান্ত</th>
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
                        <span>{alert.case_number || `কেস #${alert.case_id}`}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-semibold text-[var(--text-primary)]">{alert.title_bn}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{alert.description_bn}</p>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={alert.severity} showScore={false} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                        {alert.status_display}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/cases/${alert.case_number || alert.case_id}`}
                          className="px-2.5 py-1 rounded text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] text-[var(--text-secondary)]"
                          title="কেস ও উৎস প্রমাণ দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenDisposition(alert)}
                          className="px-3 py-1 rounded bg-[var(--accent-deep)] text-[#FAF9F6] hover:opacity-90 text-xs font-semibold"
                        >
                          সিদ্ধান্ত দিন
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
            <p className="font-bold text-sm text-[var(--text-primary)]">কিউতে কোনো অনিষ্পন্ন অসঙ্গতি নেই</p>
            <p>সকল সনাক্তকৃত সংকেত পর্যালোচক কর্তৃক নিষ্পত্তি করা হয়েছে।</p>
          </div>
        )}
      </div>

      {/* Human Disposition Decision Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="max-w-lg w-full bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[var(--accent-deep)]">
                  [{selectedAlert.rule_code_snapshot}] {selectedAlert.case_number}
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  মানবীয় পর্যালোচক সিদ্ধান্ত প্রদান
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-[var(--text-secondary)] hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-surface-soft)] text-xs text-[var(--text-secondary)] space-y-1">
              <p className="font-bold text-[var(--text-primary)]">{selectedAlert.title_bn}</p>
              <p>{selectedAlert.description_bn}</p>
            </div>

            <form onSubmit={handleSubmitDisposition} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] block">
                  সিদ্ধান্তের শ্রেণি নির্বাচন করুন *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]">
                    <input
                      type="radio"
                      name="decision"
                      value="confirmed_inconsistency"
                      checked={decision === 'confirmed_inconsistency'}
                      onChange={(e) => setDecision(e.target.value)}
                    />
                    <span>অসঙ্গতি নিশ্চিতকৃত (Confirmed Inconsistency / Flagged)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]">
                    <input
                      type="radio"
                      name="decision"
                      value="resolved_legitimate"
                      checked={decision === 'resolved_legitimate'}
                      onChange={(e) => setDecision(e.target.value)}
                    />
                    <span>বৈধ হিসেবে নিষ্পত্তি (Resolved Legitimate / Explanation Accepted)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]">
                    <input
                      type="radio"
                      name="decision"
                      value="inconclusive"
                      checked={decision === 'inconclusive'}
                      onChange={(e) => setDecision(e.target.value)}
                    />
                    <span>অমীমাংসিত / অতিরিক্ত বায়া দলিল তলব (Inconclusive)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border-color)] cursor-pointer text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]">
                    <input
                      type="radio"
                      name="decision"
                      value="false_positive"
                      checked={decision === 'false_positive'}
                      onChange={(e) => setDecision(e.target.value)}
                    />
                    <span>ভ্রান্ত সংকেত / ওসিআর ত্রুটি (False Positive)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)] block">
                  সিদ্ধান্তের যৌক্তিক কারণ ও নোট *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reasonBn}
                  onChange={(e) => setReasonBn(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] focus:ring-1 focus:ring-[var(--accent-deep)]"
                  placeholder="রেজিস্ট্রি ভলিউম ও পক্ষগণের দাখিলকৃত ব্যাখ্যার সারসংক্ষেপ..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 text-xs font-semibold border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-surface-soft)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[var(--accent-deep)] text-[#FFF8E7] hover:bg-[var(--accent-deep)]/90"
                >
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত চূড়ান্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
