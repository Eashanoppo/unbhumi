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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
          <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span>গুরুতর সংকেত</span>
          {showScore && score !== undefined && <span className="opacity-80">({score})</span>}
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>উচ্চ ঝুঁকি</span>
          {showScore && score !== undefined && <span className="opacity-80">({score})</span>}
        </span>
      );
    case 'review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-900 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800">
          <HelpCircle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
          <span>পর্যালোচনা স্তর</span>
          {showScore && score !== undefined && <span className="opacity-80">({score})</span>}
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>স্বাভাবিক</span>
          {showScore && score !== undefined && <span className="opacity-80">({score})</span>}
        </span>
      );
  }
};
