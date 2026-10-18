'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { api, CaseItem } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import {
  Search, Filter, Plus, AlertTriangle,
  ChevronRight, RefreshCw, MapPin
} from 'lucide-react';

function CasesContent() {
  const { language, t, formatNumber, formatDate, getStatusLabel } = useLanguage();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadCases = async (query = search) => {
    setLoading(true);
    try {
      const data = await api.getCases({
        search: query,
        risk: riskFilter,
        status: statusFilter
      });
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlQuery = searchParams?.get('search') || '';
    if (urlQuery !== search) {
      setSearch(urlQuery);
      loadCases(urlQuery);
    } else {
      loadCases();
    }
  }, [riskFilter, statusFilter, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCases();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 animate-in fade-in-50">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {t('cases_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {t('cases_subtitle')}
          </p>
        </div>

        <Link
          href="/documents/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('cta_verify')}</span>
        </Link>
      </div>

      {/* Filter and Search Bar (Mobile 44px min touch height) */}
      <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col md:flex-row gap-3 shadow-xs">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)]"
          />
        </form>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--text-secondary)] shrink-0 hidden sm:inline" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] cursor-pointer"
            >
              <option value="">{t('filter_all_risks')}</option>
              <option value="critical">{t('risk_critical')}</option>
              <option value="high">{t('risk_high')}</option>
              <option value="review">{t('risk_review')}</option>
              <option value="low">{t('risk_low')}</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:border-[var(--brand-accent)] cursor-pointer"
          >
            <option value="">{t('filter_all_status')}</option>
            <option value="flagged_review">{t('opt_flagged_review')}</option>
            <option value="verified_clean">{t('opt_verified_clean')}</option>
            <option value="resolved">{t('opt_resolved')}</option>
          </select>
        </div>
      </div>

      {/* Desktop Compact Table & Mobile Responsive Cards */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-xs text-[var(--text-secondary)] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--brand-accent)]" />
            <span>{t('loading_data')}</span>
          </div>
        ) : cases.length > 0 ? (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-surface-soft)]/60 font-semibold">
                    <th className="py-3.5 px-4">{t('col_case_ref')}</th>
                    <th className="py-3.5 px-4">{t('col_title_mouza')}</th>
                    <th className="py-3.5 px-4">{t('col_risk')}</th>
                    <th className="py-3.5 px-4">{t('col_docs_anomalies')}</th>
                    <th className="py-3.5 px-4">{t('col_status')}</th>
                    <th className="py-3.5 px-4">{t('col_date')}</th>
                    <th className="py-3.5 px-4 text-right">{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-[var(--bg-surface-soft)]/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[var(--brand-accent)]">
                        {c.case_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link href={`/cases/${c.case_number}`} className="font-bold text-[var(--text-primary)] hover:text-[var(--brand-accent)] transition-colors block">
                          {c.title}
                        </Link>
                        {c.mouza && (
                          <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                            <span>{t('mouza_label_short', { mouza: c.mouza, dag: formatNumber(c.dag_number) })}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={c.risk_level} score={c.risk_score} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{formatNumber(c.documents_count || 0)}</span> {language === 'bn' ? 'নথি' : 'docs'} •{' '}
                        <span className={`font-semibold ${c.anomalies_count && c.anomalies_count > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {formatNumber(c.anomalies_count || 0)} {language === 'bn' ? 'সংকেত' : 'findings'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                          {getStatusLabel(c.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] font-mono text-[11px]">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/cases/${c.case_number}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-lg bg-[var(--bg-surface-soft)] hover:bg-[var(--border-color)]/60 text-xs font-bold text-[var(--brand-accent)] border border-[var(--border-color)] transition-colors"
                        >
                          <span>{t('details')}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (sm & below) */}
            <div className="md:hidden divide-y divide-[var(--border-color)]">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.case_number}`}
                  className="p-4 block hover:bg-[var(--bg-surface-soft)]/50 transition-colors space-y-2.5 min-h-[44px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--brand-accent)]">
                      {c.case_number}
                    </span>
                    <RiskBadge level={c.risk_level} score={c.risk_score} size="sm" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{c.title}</h4>
                    {c.mouza && (
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                        <span>{t('mouza_label_short', { mouza: c.mouza, dag: formatNumber(c.dag_number) })}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-color)]/40">
                    <span className="truncate">
                      {formatNumber(c.documents_count || 0)} {language === 'bn' ? 'নথি' : 'docs'} •{' '}
                      <span className={c.anomalies_count && c.anomalies_count > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-emerald-700 font-semibold'}>
                        {formatNumber(c.anomalies_count || 0)} {language === 'bn' ? 'সংকেত' : 'findings'}
                      </span>
                    </span>
                    <span className="font-bold text-[var(--brand-accent)] flex items-center gap-1 shrink-0 ml-2">
                      <span>{t('details')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
            {t('no_results')}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CasesDirectoryPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-xs text-[var(--text-secondary)]">লোড হচ্ছে...</div>}>
      <CasesContent />
    </Suspense>
  );
}
