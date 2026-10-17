'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, DashboardSummary, CaseItem } from '@/lib/api';
import { ImageArea } from '@/components/ImageArea';
import { RiskBadge } from '@/components/RiskBadge';
import {
  Layers, PlusCircle, AlertCircle, CheckCircle2, FileText,
  Clock, ArrowRight, RefreshCw, GitFork, ShieldAlert, Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReseed = async () => {
    setReseeding(true);
    try {
      await api.reseedData();
      await loadData();
    } catch (err) {
      console.error('Failed to reseed:', err);
    } finally {
      setReseeding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[var(--accent-deep)] animate-spin" />
        <p className="text-sm text-[var(--text-secondary)]">ড্যাশবোর্ড তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  const metrics = summary?.metrics || {
    total_cases: 0,
    critical_high_count: 0,
    needs_review_count: 0,
    clean_count: 0,
    total_docs: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              {language === 'bn' ? 'ভূমি স্বত্ব ও দলিল তদন্ত ওভারভিউ' : 'Investigation Overview'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-deep)] border border-[var(--border-color)] font-semibold">
              লাইভ ডাটাবেস
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            {language === 'bn'
              ? 'দলিল অখণ্ডতা, খতিয়ান সামঞ্জস্য, বায়া চেইন এবং দাগভিত্তিক দ্বৈত বিক্রির ঝুঁকি নিরীক্ষা।'
              : 'Cross-checking deed integrity, khatian records, ownership chains, and parcel-level double-selling conflicts.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-soft)] transition-colors"
            title="৮টি টেস্ট কেস পুনরায় প্রস্তুত করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
            <span>{reseeding ? 'রিসেট হচ্ছে...' : 'ডেমো ডাটা রিসেট'}</span>
          </button>

          <Link
            href="/cases/UB-2026-1002"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--accent-deep)] text-[var(--accent-deep)] bg-[var(--bg-surface)] hover:bg-[var(--accent-light)] transition-colors"
          >
            <span>{language === 'bn' ? 'ডেমো কেস (UB-2026-1002)' : 'Demo Case (UB-2026-1002)'}</span>
          </Link>

          <Link
            href="/documents/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[var(--accent-deep)] text-[#FAF9F6] hover:opacity-90 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('cta_verify')}</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Operational Review Questions */}
      <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[var(--accent-deep)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              {language === 'bn' ? 'পর্যালোচকের ৪টি মূল প্রশ্নের উত্তর (Operational Review Assessment)' : 'Operational Review Assessment (4 Core Inquiries)'}
            </h2>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">বাস্তব ডাটাবেস পরিসংখ্যান</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Q1 */}
          <div className="p-3.5 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] block">
              ১. কতটি মামলা তদন্তাধীন?
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[var(--text-primary)]">{metrics.total_cases}</span>
              <span className="text-[11px] text-[var(--text-secondary)]">সক্রিয় কেস ({metrics.total_docs} নথি)</span>
            </div>
          </div>

          {/* Q2 */}
          <div className="p-3.5 rounded-lg bg-[var(--error-bg)]/40 border border-red-200 dark:border-red-900/60 space-y-1">
            <span className="text-[11px] font-semibold text-red-800 dark:text-red-300 block">
              ২. অমীমাংসিত দ্বন্দ্ব কতটিতে?
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-red-700 dark:text-red-400">{metrics.critical_high_count}</span>
              <span className="text-[11px] text-red-700/80 dark:text-red-300">গুরুতর / দ্বৈত বিক্রি দ্বন্দ্ব</span>
            </div>
          </div>

          {/* Q3 */}
          <div className="p-3.5 rounded-lg bg-[var(--warning-bg)]/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
            <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 block">
              ৩. মানবীয় পর্যালোচনা আবশ্যক?
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-800 dark:text-amber-400">{metrics.needs_review_count}</span>
              <span className="text-[11px] text-amber-800/80 dark:text-amber-300">কিউতে অপেক্ষমান কেস</span>
            </div>
          </div>

          {/* Q4 */}
          <div className="p-3.5 rounded-lg bg-[var(--accent-light)] border border-[var(--border-color)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--accent-deep)] block">
              ৪. পর্যালোচকের করণীয় কী?
            </span>
            <div className="space-y-1.5">
              <p className="text-[11px] text-[var(--text-primary)] leading-tight font-medium">
                কেস UB-2026-1002 (ধামরাই দাগ ৮৮) দ্বৈত বিক্রি সংকেত ও প্রমাণ পর্যালোচনা করুন।
              </p>
              <Link
                href="/cases/UB-2026-1002"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-deep)] hover:underline"
              >
                <span>তদন্ত খুলুন</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-medium">{t('metric_total_cases')}</span>
            <Layers className="w-4 h-4 text-[var(--accent-deep)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {metrics.total_cases}
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] block">
            {metrics.total_docs}টি নথি অন্তর্ভুক্ত
          </span>
        </div>

        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-red-700 dark:text-red-400">
            <span className="font-semibold">{t('metric_critical_risks')}</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {metrics.critical_high_count}
          </p>
          <span className="text-[11px] text-red-600/80 dark:text-red-400 block font-medium">
            জরুরি পদক্ষেপ আবশ্যক
          </span>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-400">
            <span className="font-semibold">{t('metric_needs_review')}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
            {metrics.needs_review_count}
          </p>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-400 block font-medium">
            পর্যালোচকের কিউতে অপেক্ষমান
          </span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400">
            <span className="font-semibold">{t('metric_clean_cases')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
            {metrics.clean_count}
          </p>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400 block font-medium">
            অসঙ্গতিহীন যাচাই সম্পন্ন
          </span>
        </div>
      </div>

      {/* Main Grid: Recent Cases & Survey Visual Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Cases Table */}
        <div className="lg:col-span-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface-soft)]/40">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent-deep)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {language === 'bn' ? 'সাম্প্রতিক দলিল যাচাই কেসসমূহ' : 'Recent Cases'}
              </h3>
            </div>
            <Link
              href="/cases"
              className="text-xs font-semibold text-[var(--accent-deep)] dark:text-[#7ED957] hover:underline flex items-center gap-1"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {summary?.recent_cases && summary.recent_cases.length > 0 ? (
              summary.recent_cases.map((c: CaseItem) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.case_number}`}
                  className="p-4 hover:bg-[var(--bg-surface-soft)]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--accent-deep)] dark:text-[#7ED957]">
                        {c.case_number}
                      </span>
                      <RiskBadge level={c.risk_level} score={c.risk_score} />
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-deep)] transition-colors">
                      {c.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {c.mouza ? `মৌজা: ${c.mouza} • দাগ: ${c.dag_number}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[var(--text-secondary)] shrink-0">
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[11px]">
                      {c.status_display}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--text-secondary)]" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                কোনো কেস রেকর্ড পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editorial Visual & Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          {/* Editorial Survey Side Visual */}
          <ImageArea
            src="/images/dashboard/survey-team.svg"
            alt="আমিন ও সার্ভেয়ারদের মৌজা ম্যাপ এবং প্লট পরিমাপ"
            aspectRatio="video"
            caption="সাব-রেজিস্ট্রি ও সহকারী কমিশনার (ভূমি) কার্যালয়ের ক্রস-রেফারেন্সিং সিমুলেশন"
          />

          {/* Audit Activity Feed */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 text-xs font-bold text-[var(--text-primary)]">
              <Activity className="w-4 h-4 text-[var(--accent-deep)]" />
              <span>সাম্প্রতিক অডিট লগ (Audit Activity)</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {summary?.recent_activity?.map((act) => (
                <div key={act.id} className="text-xs p-2 rounded bg-[var(--bg-surface-soft)]/50 space-y-0.5">
                  <div className="flex items-center justify-between font-semibold text-[var(--text-primary)]">
                    <span>{act.action}</span>
                    <span className="font-mono text-[10px] text-[var(--accent-deep)]">{act.case_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>ব্যবহারকারী: {act.user}</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
