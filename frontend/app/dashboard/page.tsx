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
  const { language, t, formatNumber, getStatusLabel } = useLanguage();
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
        <p className="text-sm text-[var(--text-secondary)]">{t('loading_data')}</p>
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
              {t('dash_title')}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-deep)] border border-[var(--border-color)] font-semibold">
              {t('live_database')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            {t('dash_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-soft)] transition-colors"
            title={t('reseed_demo')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
            <span>{reseeding ? t('reseeding') : t('reseed_demo')}</span>
          </button>

          <Link
            href="/cases/UB-2026-1002"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--accent-deep)] text-[var(--accent-deep)] bg-[var(--bg-surface)] hover:bg-[var(--accent-light)] transition-colors"
          >
            <span>{t('cta_demo_explore')}</span>
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
              {t('dash_assessment_title')}
            </h2>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">{t('dash_db_stats')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Q1 */}
          <div className="p-3.5 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] block">
              {t('dash_q1_title')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[var(--text-primary)]">
                {formatNumber(metrics.total_cases)}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                {t('dash_q1_desc', { count: metrics.total_cases, docs: metrics.total_docs })}
              </span>
            </div>
          </div>

          {/* Q2 */}
          <div className="p-3.5 rounded-lg bg-[var(--error-bg)]/40 border border-red-200 dark:border-red-900/60 space-y-1">
            <span className="text-[11px] font-semibold text-red-800 dark:text-red-300 block">
              {t('dash_q2_title')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-red-700 dark:text-red-400">
                {formatNumber(metrics.critical_high_count)}
              </span>
              <span className="text-[11px] text-red-700/80 dark:text-red-300">
                {t('dash_q2_desc', { count: metrics.critical_high_count })}
              </span>
            </div>
          </div>

          {/* Q3 */}
          <div className="p-3.5 rounded-lg bg-[var(--warning-bg)]/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
            <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 block">
              {t('dash_q3_title')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-800 dark:text-amber-400">
                {formatNumber(metrics.needs_review_count)}
              </span>
              <span className="text-[11px] text-amber-800/80 dark:text-amber-300">
                {t('dash_q3_desc', { count: metrics.needs_review_count })}
              </span>
            </div>
          </div>

          {/* Q4 */}
          <div className="p-3.5 rounded-lg bg-[var(--accent-light)] border border-[var(--border-color)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--accent-deep)] block">
              {t('dash_q4_title')}
            </span>
            <div className="space-y-1.5">
              <p className="text-[11px] text-[var(--text-primary)] leading-tight font-medium">
                {t('dash_q4_desc')}
              </p>
              <Link
                href="/cases/UB-2026-1002"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-deep)] hover:underline"
              >
                <span>{t('dash_open_investigation')}</span>
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
            {formatNumber(metrics.total_cases)}
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] block">
            {t('metric_docs_included', { count: metrics.total_docs })}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-red-700 dark:text-red-400">
            <span className="font-semibold">{t('metric_critical_risks')}</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {formatNumber(metrics.critical_high_count)}
          </p>
          <span className="text-[11px] text-red-600/80 dark:text-red-400 block font-medium">
            {t('metric_urgent_action')}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-400">
            <span className="font-semibold">{t('metric_needs_review')}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
            {formatNumber(metrics.needs_review_count)}
          </p>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-400 block font-medium">
            {t('metric_queue_waiting')}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400">
            <span className="font-semibold">{t('metric_clean_cases')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
            {formatNumber(metrics.clean_count)}
          </p>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400 block font-medium">
            {t('metric_clean_desc')}
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
                {t('dash_recent_cases')}
              </h3>
            </div>
            <Link
              href="/cases"
              className="text-xs font-semibold text-[var(--accent-deep)] hover:underline flex items-center gap-1"
            >
              <span>{t('view_all')}</span>
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
                      <span className="font-mono text-xs font-bold text-[var(--accent-deep)]">
                        {c.case_number}
                      </span>
                      <RiskBadge level={c.risk_level} score={c.risk_score} />
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-deep)] transition-colors">
                      {c.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {c.mouza ? t('mouza_label_short', { mouza: c.mouza, dag: formatNumber(c.dag_number) }) : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[var(--text-secondary)] shrink-0">
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[11px] border border-[var(--border-color)]">
                      {getStatusLabel(c.status)}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--text-secondary)]" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                {t('no_results')}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editorial Visual & Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          {/* Editorial Survey Side Visual */}
          <ImageArea
            src="/images/dashboard/survey-team.svg"
            alt={t('dash_survey_visual_alt')}
            aspectRatio="video"
            caption={t('dash_survey_visual_caption')}
          />

          {/* Audit Activity Feed */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 text-xs font-bold text-[var(--text-primary)]">
              <Activity className="w-4 h-4 text-[var(--accent-deep)]" />
              <span>{t('dash_audit_activity')}</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {summary?.recent_activity?.map((act) => (
                <div key={act.id} className="text-xs p-2 rounded bg-[var(--bg-surface-soft)]/50 space-y-0.5 border border-[var(--border-color)]/50">
                  <div className="flex items-center justify-between font-semibold text-[var(--text-primary)]">
                    <span>{act.action}</span>
                    <span className="font-mono text-[10px] text-[var(--accent-deep)]">{act.case_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>{language === 'bn' ? 'ব্যবহারকারী: ' : 'User: '}{act.user}</span>
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
