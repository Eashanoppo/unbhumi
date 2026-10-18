'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Check, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface RiskBadgeProps {
  level: 'low' | 'review' | 'high' | 'critical' | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = true,
  size = 'md',
}) => {
  const { language, formatNumber } = useLanguage();

  const isSmall = size === 'sm';
  const sizeClasses = isSmall
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-0.5 gap-1.5';
  const iconSize = isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5';

  const formattedScore = score !== undefined ? formatNumber(score) : null;

  // Single uniform box color across all risk levels as requested
  const baseBadge = `inline-flex items-center rounded-full border border-[var(--border-color)] bg-[var(--bg-surface-soft)] shadow-2xs font-semibold ${sizeClasses}`;

  switch (level) {
    case 'critical':
      return (
        <span className={baseBadge}>
          <AlertCircle className={`${iconSize} text-rose-600 dark:text-rose-400 shrink-0`} />
          <span className="text-rose-700 dark:text-rose-400 font-bold">
            {language === 'bn' ? 'গুরুতর সংকেত' : 'Critical Conflict'}
          </span>
          {showScore && formattedScore !== null && (
            <span className="text-[var(--text-muted)] font-mono text-[10px]">({formattedScore})</span>
          )}
        </span>
      );
    case 'high':
      return (
        <span className={baseBadge}>
          <AlertTriangle className={`${iconSize} text-amber-600 dark:text-amber-400 shrink-0`} />
          <span className="text-amber-700 dark:text-amber-400 font-bold">
            {language === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk'}
          </span>
          {showScore && formattedScore !== null && (
            <span className="text-[var(--text-muted)] font-mono text-[10px]">({formattedScore})</span>
          )}
        </span>
      );
    case 'review':
      return (
        <span className={baseBadge}>
          <Info className={`${iconSize} text-sky-600 dark:text-sky-400 shrink-0`} />
          <span className="text-sky-700 dark:text-sky-400 font-semibold">
            {language === 'bn' ? 'পর্যালোচনা স্তর' : 'Needs Review'}
          </span>
          {showScore && formattedScore !== null && (
            <span className="text-[var(--text-muted)] font-mono text-[10px]">({formattedScore})</span>
          )}
        </span>
      );
    case 'low':
    default:
      return (
        <span className={baseBadge}>
          <Check className={`${iconSize} text-[var(--brand-accent)] shrink-0`} />
          <span className="text-[var(--brand-accent)] font-semibold">
            {language === 'bn' ? 'স্বাভাবিক' : 'Low Risk'}
          </span>
          {showScore && formattedScore !== null && (
            <span className="text-[var(--text-muted)] font-mono text-[10px]">({formattedScore})</span>
          )}
        </span>
      );
  }
};
