'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, CaseItem } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import {
  ShieldCheck, Search, Filter, PlusCircle, FileText, AlertTriangle,
  ArrowRight, RefreshCw, Calendar, MapPin
} from 'lucide-react';

export default function CasesDirectoryPage() {
  const { language, t, formatNumber, formatDate, getStatusLabel } = useLanguage();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await api.getCases({
        search,
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
    loadCases();
  }, [riskFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCases();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {t('cases_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {t('cases_subtitle')}
          </p>
        </div>

        <Link
          href="/documents/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-deep)] text-[#FAF9F6] hover:opacity-90 transition-all shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{t('cta_verify')}</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col md:flex-row gap-3 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent-deep)]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 font-medium"
          >
            <option value="">{t('filter_all_risks')}</option>
            <option value="critical">{t('risk_critical')}</option>
            <option value="high">{t('risk_high')}</option>
            <option value="review">{t('risk_review')}</option>
            <option value="low">{t('risk_low')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 font-medium"
          >
            <option value="">{t('filter_all_status')}</option>
            <option value="flagged_review">{t('opt_flagged_review')}</option>
            <option value="verified_clean">{t('opt_verified_clean')}</option>
            <option value="resolved">{t('opt_resolved')}</option>
          </select>
        </div>
      </div>

      {/* Desktop Compact Table & Mobile Responsive Cards */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent-deep)]" />
            <span>{t('loading_data')}</span>
          </div>
        ) : cases.length > 0 ? (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-surface-soft)]/40 font-semibold">
                    <th className="py-3 px-4">{t('col_case_ref')}</th>
                    <th className="py-3 px-4">{t('col_title_mouza')}</th>
                    <th className="py-3 px-4">{t('col_risk')}</th>
                    <th className="py-3 px-4">{t('col_docs_anomalies')}</th>
                    <th className="py-3 px-4">{t('col_status')}</th>
                    <th className="py-3 px-4">{t('col_date')}</th>
                    <th className="py-3 px-4 text-right">{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-[var(--bg-surface-soft)]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--accent-deep)]">
                        {c.case_number}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/cases/${c.case_number}`} className="font-semibold text-[var(--text-primary)] hover:underline block">
                          {c.title}
                        </Link>
                        {c.mouza && (
                          <span className="text-[11px] text-[var(--text-secondary)]">
                            {t('mouza_label_short', { mouza: c.mouza, dag: formatNumber(c.dag_number) })}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={c.risk_level} score={c.risk_score} />
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-primary)]">{formatNumber(c.documents_count || 0)}</span> {language === 'bn' ? 'নথি' : 'docs'} •{' '}
                        <span className={`font-semibold ${c.anomalies_count && c.anomalies_count > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {formatNumber(c.anomalies_count || 0)} {language === 'bn' ? 'সংকেত' : 'findings'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                          {getStatusLabel(c.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-mono">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/cases/${c.case_number}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--bg-surface-soft)] hover:bg-[var(--border-color)] text-xs font-semibold text-[var(--accent-deep)] border border-[var(--border-color)]"
                        >
                          <span>{t('details')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-[var(--border-color)]">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.case_number}`}
                  className="p-4 block hover:bg-[var(--bg-surface-soft)]/50 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--accent-deep)]">
                      {c.case_number}
                    </span>
                    <RiskBadge level={c.risk_level} score={c.risk_score} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{c.title}</h4>
                    {c.mouza && (
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {t('mouza_label_short', { mouza: c.mouza, dag: formatNumber(c.dag_number) })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
                    <span>{formatNumber(c.documents_count || 0)} {language === 'bn' ? 'নথি' : 'docs'} • {formatNumber(c.anomalies_count || 0)} {language === 'bn' ? 'সংকেত' : 'findings'}</span>
                    <span className="font-semibold text-[var(--accent-deep)] flex items-center gap-1">
                      <span>{t('details')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
