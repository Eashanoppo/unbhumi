'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: 'low' | 'review' | 'high' | 'critical' | string;
  score?: number;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = true }) => {
  switch (level) {
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>গুরুতর সংকেত</span>
          {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>উচ্চ ঝুঁকি</span>
          {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
        </span>
      );
    case 'review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20">
          <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>পর্যালোচনা স্তর</span>
          {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>স্বাভাবিক</span>
          {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
        </span>
      );
  }
};
