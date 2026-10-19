'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { Info } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(2026);

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  // During SSR and initial client hydration, guarantee default Bangla to prevent hydration mismatches
  const isBn = mounted ? language === 'bn' : true;

  return (
    <footer suppressHydrationWarning className="w-full border-t border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div suppressHydrationWarning className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--bg-surface-soft)] flex items-center justify-center p-0.5 shadow-xs">
                <Image
                  src="/images/brand/logo.png"
                  alt="UNBHUMI Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <span suppressHydrationWarning className="font-bold text-base text-[var(--text-primary)]">
                {isBn ? 'আনভূমি ডিটেক্টর' : 'UNBhumi Detector'}
              </span>
            </div>
            <p suppressHydrationWarning className="text-xs leading-relaxed">
              {isBn
                ? 'আনলেফট (UNLEFT) কর্তৃক উদ্ভাবিত এআই-চালিত ভূমি দলিল ও স্বত্ব যাচাইকরণ প্ল্যাটফর্ম। দ্বৈত বিক্রি রোধ ও মালিকানা অখণ্ডতা রক্ষায় নিবেদিত।'
                : 'AI-assisted land document & title verification platform by UNLEFT. Focused on duplicate sale detection and ownership integrity.'}
            </p>
            <div className="pt-2">
              <span suppressHydrationWarning className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] border border-[var(--border-color)]">
                Track P3: LandTech 2026
              </span>
            </div>
          </div>

          {/* Product Navigation */}
          <div>
            <h4 suppressHydrationWarning className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              {isBn ? 'প্ল্যাটফর্ম নেভিগেশন' : 'Navigation'}
            </h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/dashboard" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {t('nav_dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/documents/new" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {t('nav_new_case')}
                </Link>
              </li>
              <li>
                <Link href="/cases" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {t('nav_cases')}
                </Link>
              </li>
              <li>
                <Link href="/review-queue" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {t('nav_queue')}
                </Link>
              </li>
              <li>
                <Link href="/ownership-graph" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {t('nav_graph')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Compliance */}
          <div>
            <h4 suppressHydrationWarning className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              {isBn ? 'পদ্ধতি ও গবেষণা' : 'Methodology & Research'}
            </h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/methodology" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {isBn ? 'ওসিআর ও ডিটেকশন নিয়মাবলী' : 'OCR & Detection Rules'}
                </Link>
              </li>
              <li>
                <Link href="/methodology#safeguards" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {isBn ? 'দায়িত্বশীল এআই নীতি' : 'Responsible AI Guardrails'}
                </Link>
              </li>
              <li>
                <Link href="/about" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {isBn ? 'আনলেফট (UNLEFT) পরিচিতি' : 'About UNLEFT Team'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {isBn ? 'গোপনীয়তা নীতি' : 'Privacy Notice'}
                </Link>
              </li>
              <li>
                <Link href="/terms" suppressHydrationWarning className="hover:text-[var(--text-primary)] transition-colors py-1.5 inline-block">
                  {isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Use'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer & Transparency */}
          <div>
            <h4 suppressHydrationWarning className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              {isBn ? 'গুরুত্বপূর্ণ সতর্কতা' : 'Notice & Disclaimer'}
            </h4>
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] text-[11px] leading-relaxed">
              <p suppressHydrationWarning className="flex items-start gap-1.5 mb-1.5 font-bold text-[var(--text-primary)]">
                <Info className="w-3.5 h-3.5 text-[var(--accent-deep)] dark:text-[#7ED957] shrink-0 mt-0.5" />
                <span>{isBn ? 'স্বাধীন সফটওয়্যার টুল' : 'Independent Analytical Tool'}</span>
              </p>
              <p suppressHydrationWarning>
                {t('disclaimer_short')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div suppressHydrationWarning className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-center sm:text-left">
          <p suppressHydrationWarning>
            © {currentYear} UNBhumi Detector. Developed by <strong>UNLEFT</strong> for LandTech Innovation Hackathon 2026.
          </p>
          <div suppressHydrationWarning className="flex items-center gap-4 text-[11px]">
            <span suppressHydrationWarning>{isBn ? 'সংস্করণ: ১.০.০ (MVP)' : 'Version: 1.0.0 (MVP)'}</span>
            <span>•</span>
            <span suppressHydrationWarning>{isBn ? 'ডেটা পলিসি: সিন্থেটিক রেকর্ড' : 'Data Policy: Synthetic Records'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
