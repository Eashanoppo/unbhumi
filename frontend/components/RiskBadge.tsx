'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
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

  switch (level) {
    case 'critical':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full border bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 shadow-xs ${sizeClasses}`}
        >
          <AlertCircle className={`${iconSize} text-rose-600 dark:text-rose-400 shrink-0`} />
          <span>{language === 'bn' ? 'গুরুতর সংকেত' : 'Critical Conflict'}</span>
          {showScore && formattedScore !== null && (
            <span className="opacity-90 font-mono font-bold">({formattedScore})</span>
          )}
        </span>
      );
    case 'high':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full border bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 shadow-xs ${sizeClasses}`}
        >
          <AlertTriangle className={`${iconSize} text-amber-600 dark:text-amber-400 shrink-0`} />
          <span>{language === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk'}</span>
          {showScore && formattedScore !== null && (
            <span className="opacity-90 font-mono font-bold">({formattedScore})</span>
          )}
        </span>
      );
    case 'review':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full border bg-sky-50 text-sky-900 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800/60 shadow-xs ${sizeClasses}`}
        >
          <HelpCircle className={`${iconSize} text-sky-600 dark:text-sky-400 shrink-0`} />
          <span>{language === 'bn' ? 'পর্যালোচনা স্তর' : 'Needs Review'}</span>
          {showScore && formattedScore !== null && (
            <span className="opacity-90 font-mono font-bold">({formattedScore})</span>
          )}
        </span>
      );
    case 'low':
    default:
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full border bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 shadow-xs ${sizeClasses}`}
        >
          <CheckCircle2 className={`${iconSize} text-emerald-600 dark:text-emerald-400 shrink-0`} />
          <span>{language === 'bn' ? 'স্বাভাবিক' : 'Low Risk'}</span>
          {showScore && formattedScore !== null && (
            <span className="opacity-90 font-mono font-bold">({formattedScore})</span>
          )}
        </span>
      );
  }
};
