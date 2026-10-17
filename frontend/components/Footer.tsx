'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { ShieldCheck, Info, FileCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const [currentYear, setCurrentYear] = useState<number>(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-deep)] flex items-center justify-center p-1 text-[#7ED957]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-[var(--text-primary)]">
                {language === 'bn' ? 'আনভূমি ডিটেক্টর' : 'UNBUmi Detector'}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {language === 'bn'
                ? 'আনলেফট (UNLEFT) কর্তৃক উদ্ভাবিত এআই-চালিত ভূমি দলিল ও স্বত্ব যাচাইকরণ প্ল্যাটফর্ম। দ্বৈত বিক্রি রোধ ও মালিকানা অখণ্ডতা রক্ষায় নিবেদিত।'
                : 'AI-assisted land document & title verification platform by UNLEFT. Focused on duplicate sale detection and ownership integrity.'}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] border border-[var(--border-color)]">
                Track P3: LandTech 2026
              </span>
            </div>
          </div>

          {/* Product Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              {language === 'bn' ? 'প্ল্যাটফর্ম নেভিগেশন' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav_dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/documents/new" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav_new_case')}
                </Link>
              </li>
              <li>
                <Link href="/cases" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav_cases')}
                </Link>
              </li>
              <li>
                <Link href="/review-queue" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav_queue')}
                </Link>
              </li>
              <li>
                <Link href="/ownership-graph" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav_graph')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              {language === 'bn' ? 'পদ্ধতি ও গবেষণা' : 'Methodology & Research'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/methodology" className="hover:text-[var(--text-primary)] transition-colors">
                  {language === 'bn' ? 'ওসিআর ও ডিটেকশন নিয়মাবলী' : 'OCR & Detection Rules'}
                </Link>
              </li>
              <li>
                <Link href="/methodology#safeguards" className="hover:text-[var(--text-primary)] transition-colors">
                  {language === 'bn' ? 'দায়িত্বশীল এআই নীতি' : 'Responsible AI Guardrails'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
                  {language === 'bn' ? 'আনলেফট (UNLEFT) পরিচিতি' : 'About UNLEFT Team'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  {language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Notice'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                  {language === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms of Use'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer & Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              {language === 'bn' ? 'গুরুত্বপূর্ণ সতর্কতা' : 'Notice & Disclaimer'}
            </h4>
            <div className="p-3 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)] text-[11px] leading-relaxed">
              <p className="flex items-start gap-1.5 mb-1.5 font-medium text-[var(--text-primary)]">
                <Info className="w-3.5 h-3.5 text-[var(--accent-deep)] dark:text-[#7ED957] shrink-0 mt-0.5" />
                <span>{language === 'bn' ? 'স্বাধীন সফটওয়্যার টুল' : 'Independent Tool'}</span>
              </p>
              <p>
                {t('disclaimer_short')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {currentYear} UNBUmi Detector. Developed by <strong>UNLEFT</strong> for LandTech Innovation Hackathon 2026.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>সংস্করণ: 1.0.0 (MVP)</span>
            <span>•</span>
            <span>ডেটা পলিসি: সিন্থেটিক রেকর্ড</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
