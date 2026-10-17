'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, DashboardSummary, CaseItem } from '@/lib/api';
import { ImageArea } from '@/components/ImageArea';
import { RiskBadge } from '@/components/RiskBadge';
import {
  Layers, PlusCircle, AlertCircle, CheckCircle2, FileText,
  Clock, ArrowRight, RefreshCw, GitFork, ShieldAlert, Activity,
  Database, AlertOctagon, CheckSquare, Sparkles, User, MapPin,
  Calendar, FileCheck, ShieldCheck
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
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[var(--brand-accent)] animate-spin" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in-50">
      {/* 1. TOP HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {t('dash_title')}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--brand-accent)]/40 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] animate-ping" />
              {t('live_database')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl">
            {t('dash_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Reseed Button */}
          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors cursor-pointer disabled:opacity-50"
            title={t('reseed_demo')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin text-[var(--brand-accent)]' : ''}`} />
            <span>{reseeding ? t('reseeding') : t('reseed_demo')}</span>
          </button>

          {/* Interactive Demo Shortcut */}
          <Link
            href="/demo"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--brand-accent)]/50 bg-[var(--accent-light)] text-[var(--text-primary)] hover:bg-[var(--brand-accent)] hover:text-[var(--cta-text)] transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>{language === 'bn' ? 'ইন্টারেক্টিভ ডেমো' : 'Interactive Demo'}</span>
          </Link>

          {/* Primary CTA */}
          <Link
            href="/documents/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-sm hover:shadow active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t('cta_verify')}</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 CORE OPERATIONAL REVIEW QUESTIONS */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[var(--brand-accent)]" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
              {t('dash_assessment_title')}
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1">
            <Database className="w-3 h-3 text-[var(--brand-accent)]" />
            {t('dash_db_stats')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Q1: Total cases under inquiry */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-1.5 transition-all hover:border-[var(--brand-accent)]/50">
            <span className="text-xs font-semibold text-[var(--text-secondary)] block">
              {t('dash_q1_title')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[var(--text-primary)]">
                {formatNumber(metrics.total_cases)}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {t('dash_q1_desc', { count: metrics.total_cases, docs: metrics.total_docs })}
              </span>
            </div>
          </div>

          {/* Q2: Critical Fraud Risks */}
          <div className="p-4 rounded-xl bg-[var(--card-critical-bg)] border border-[var(--card-critical-border)] space-y-1.5 transition-all">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5" />
              {t('dash_q2_title')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {formatNumber(metrics.critical_high_count)}
              </span>
              <span className="text-xs text-rose-700/80 dark:text-rose-300">
                {t('dash_q2_desc', { count: metrics.critical_high_count })}
              </span>
            </div>
          </div>

          {/* Q3: Awaiting Adjudication */}
          <div className="p-4 rounded-xl bg-[var(--card-warning-bg)] border border-[var(--card-warning-border)] space-y-1.5 transition-all">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {t('dash_q3_title')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {formatNumber(metrics.needs_review_count)}
              </span>
              <span className="text-xs text-amber-700/80 dark:text-amber-300">
                {t('dash_q3_desc', { count: metrics.needs_review_count })}
              </span>
            </div>
          </div>

          {/* Q4: Recommended Next Step */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] hover:border-[var(--brand-accent)]/40 space-y-2 transition-all">
            <span className="text-xs font-bold text-[var(--brand-accent)] block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
              {t('dash_q4_title')}
            </span>
            <p className="text-xs text-[var(--text-primary)] leading-tight">
              {t('dash_q4_desc')}
            </p>
            <Link
              href="/cases/UB-2026-1002"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] hover:text-[var(--brand-accent)] transition-colors"
            >
              <span>{t('dash_open_investigation')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY KPI METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 shadow-sm transition-all hover:border-[var(--brand-accent)]/50">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-semibold">{t('metric_total_cases')}</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] flex items-center justify-center text-[var(--brand-accent)]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {formatNumber(metrics.total_cases)}
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] block">
            {t('metric_docs_included', { count: metrics.total_docs })}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl border border-[var(--card-critical-border)] bg-[var(--card-critical-bg)] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400">
            <span className="font-bold">{t('metric_critical_risks')}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatNumber(metrics.critical_high_count)}
          </p>
          <span className="text-[11px] text-rose-700/80 dark:text-rose-300 block font-medium">
            {t('metric_urgent_action')}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl border border-[var(--card-warning-border)] bg-[var(--card-warning-bg)] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
            <span className="font-bold">{t('metric_needs_review')}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {formatNumber(metrics.needs_review_count)}
          </p>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-300 block font-medium">
            {t('metric_queue_waiting')}
          </span>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl border border-[var(--card-success-border)] bg-[var(--card-success-bg)] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
            <span className="font-bold">{t('metric_clean_cases')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatNumber(metrics.clean_count)}
          </p>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400 block font-medium">
            {t('metric_clean_desc')}
          </span>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE GRID: RECENT CASES TABLE & EDITORIAL VISUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Cases Table (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface-soft)]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--brand-accent)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {t('dash_recent_cases')}
              </h3>
            </div>
            <Link
              href="/cases"
              className="text-xs font-bold text-[var(--brand-accent)] hover:underline flex items-center gap-1"
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
                  className="p-4 hover:bg-[var(--bg-surface-soft)]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[var(--brand-accent)]">
                        {c.case_number}
                      </span>
                      <RiskBadge level={c.risk_level} score={c.risk_score} />
                    </div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors">
                      {c.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[var(--text-secondary)]" />
                      <span>{c.mouza ? t('mouza_label_short', { mouza: c.mouza, dag: formatNumber(c.dag_number) }) : ''}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[var(--text-secondary)] shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-soft)] text-[11px] font-semibold border border-[var(--border-color)] text-[var(--text-secondary)]">
                      {getStatusLabel(c.status)}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--brand-accent)]" />
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

        {/* Right Column: Editorial Visual & Activity Feed (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Survey Side Visual */}
          <ImageArea
            src="/images/dashboard/survey-team.svg"
            alt={t('dash_survey_visual_alt')}
            aspectRatio="video"
            caption={t('dash_survey_visual_caption')}
          />

          {/* Audit Activity Feed */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3 text-xs font-bold text-[var(--text-primary)]">
              <Activity className="w-4 h-4 text-[var(--brand-accent)]" />
              <span>{t('dash_audit_activity')}</span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {summary?.recent_activity?.map((act) => (
                <div
                  key={act.id}
                  className="text-xs p-2.5 rounded-xl bg-[var(--bg-surface-soft)] space-y-1 border border-[var(--border-color)]/60 transition-all hover:border-[var(--brand-accent)]/40"
                >
                  <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      {act.action}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--brand-accent)] font-bold">
                      {act.case_number}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 opacity-70" />
                      {act.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 opacity-70" />
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
