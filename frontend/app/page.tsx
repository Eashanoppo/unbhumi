'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { ImageArea } from '@/components/ImageArea';
import { RiskBadge } from '@/components/RiskBadge';
import {
  ShieldCheck, AlertTriangle, Activity, FileText, Check,
  ChevronRight, Zap, Info, FileCheck, Layers, Search
} from 'lucide-react';

export default function LandingPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/cases?search=${encodeURIComponent(query)}`);
    } else {
      router.push('/cases');
    }
  };

  const handleQuickSearch = (plotOrMouza: string) => {
    setSearchQuery(plotOrMouza);
    router.push(`/cases?search=${encodeURIComponent(plotOrMouza)}`);
  };

  const syntheticDemos = [
    {
      id: 'UB-2026-1001',
      title_bn: 'মৌজা কাউন্দিয়া আরএস দাগ ৪১২',
      title_en: 'Mouza Kaundia RS Dag 412',
      desc_bn: 'স্বাভাবিক ও বৈধ হস্তান্তর। সাফ-কবলা দলিল, খতিয়ান ও নামজারি সম্পূর্ণ সামঞ্জস্যপূর্ণ।',
      desc_en: 'Legitimate transaction. Title deed, khatian, and mutation records are mutually consistent.',
      risk: 'low'
    },
    {
      id: 'UB-2026-1002',
      title_bn: 'মৌজা ধামরাই আরএস দাগ ৮৮',
      title_en: 'Mouza Dhamrai RS Dag 88',
      desc_bn: 'সম্ভাব্য দ্বৈত বিক্রি: একই দাগ পূর্বে অন্য ক্রেতার নিকট বিক্রির স্পষ্ট রেকর্ড শনাক্ত।',
      desc_en: 'Potential double-selling: active competing deed registered on the same parcel.',
      risk: 'critical'
    },
    {
      id: 'UB-2026-1003',
      title_bn: 'মৌজা তেঁতুলঝোড়া দাগ ২৯১',
      title_en: 'Mouza Tetuljhora Dag 291',
      desc_bn: 'মালিকানা ধারাবাহিকতা বিচ্ছিন্ন: খতিয়ান স্বত্বাধিকারীর সাথে বিক্রেতার বায়া দলিল অনুপস্থিত।',
      desc_en: 'Broken chain of title: Missing baya deed connecting seller to recorded khatian owner.',
      risk: 'high'
    },
    {
      id: 'UB-2026-1004',
      title_bn: 'মৌজা সাভার দাগ ৫১০',
      title_en: 'Mouza Savar Dag 510',
      desc_bn: 'দলিল বনাম খতিয়ান স্বত্ব অমিল: দলিলের বিক্রেতার নামের সাথে খতিয়ানের মূল মালিক মিলছে না।',
      desc_en: 'Deed vs khatian discrepancy: deed executant name does not match survey record.',
      risk: 'high'
    }
  ];

  const workflowSteps = [
    {
      step: t('flow_s1_step'),
      title: t('flow_s1_title'),
      desc: t('flow_s1_desc')
    },
    {
      step: t('flow_s2_step'),
      title: t('flow_s2_title'),
      desc: t('flow_s2_desc')
    },
    {
      step: t('flow_s3_step'),
      title: t('flow_s3_title'),
      desc: t('flow_s3_desc')
    },
    {
      step: t('flow_s4_step'),
      title: t('flow_s4_title'),
      desc: t('flow_s4_desc')
    }
  ];

  const faqs = [
    {
      q: t('faq1_q'),
      a: t('faq1_a')
    },
    {
      q: t('faq2_q'),
      a: t('faq2_a')
    },
    {
      q: t('faq3_q'),
      a: t('faq3_a')
    },
    {
      q: t('faq4_q'),
      a: t('faq4_a')
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-20 py-6 sm:py-12">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-surface-soft)] text-[var(--brand-accent)] border border-[var(--border-color)]">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-accent)] animate-pulse" />
              <span>{t('hero_badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.18]">
              {language === 'bn' ? (
                <>
                  একটি দাগ। একাধিক দলিল। <br className="hidden sm:inline" />
                  <span className="text-[var(--brand-accent)]">একটি প্রমাণ পথ।</span>
                </>
              ) : (
                <>
                  One plot. Multiple deeds. <br className="hidden sm:inline" />
                  <span className="text-[var(--brand-accent)]">One evidence trail.</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {t('hero_description')}
            </p>

            {/* Search Type UI (Matching Image 1) */}
            <div className="pt-2">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 shadow-[0_10px_30px_-5px_rgba(21,128,61,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04)] space-y-3"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'খতিয়ান নম্বর, দাগ নম্বর অথবা মৌজার নাম দিয়ে অনুসন্ধান করুন...'
                        : 'Search by Khatian No, Plot No, or Mouza Name...'
                    }
                    className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-accent)] transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-[#15803D] hover:bg-[#126E34] text-white shadow-[0_4px_14px_rgba(21,128,61,0.35)] hover:shadow-[0_6px_20px_rgba(21,128,61,0.45)] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Search className="w-5 h-5 stroke-[2.5]" />
                  <span>{language === 'bn' ? 'রেকর্ড অনুসন্ধান করুন' : 'Search Records'}</span>
                </button>

                {/* Sub-actions & Quick Pills preserving full workflow functionality */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 px-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[var(--text-muted)] font-medium">
                      {language === 'bn' ? 'উদাহরণ:' : 'Quick tags:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickSearch('৪১২')}
                      className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] hover:text-[var(--brand-accent)] hover:border-[var(--brand-accent)] border border-[var(--border-color)] transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'দাগ ৪১২ (কাউন্দিয়া)' : 'Plot 412 (Kaundia)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSearch('৮৮')}
                      className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-500 border border-[var(--border-color)] transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'দাগ ৮৮ (দ্বৈত বিক্রি)' : 'Plot 88 (Double Sale)'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/documents/new"
                      className="font-bold text-[var(--brand-accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{language === 'bn' ? '+ নতুন ফাইল আপলোড' : '+ Upload Deed'}</span>
                    </Link>
                    <span className="text-[var(--border-color)]">•</span>
                    <Link
                      href="/demo"
                      className="font-bold text-[var(--text-secondary)] hover:text-[var(--brand-accent)] inline-flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-[var(--brand-accent)]" />
                      <span>{language === 'bn' ? 'ডেমো কেস' : 'Demo Cases'}</span>
                    </Link>
                  </div>
                </div>
              </form>
            </div>

            {/* Responsive Trust Points */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[var(--border-color)]">
              <div className="p-2 sm:p-0">
                <p className="text-xs text-[var(--text-secondary)] font-medium">{t('trust_p1_label')}</p>
                <p className="text-sm sm:text-base font-bold text-[var(--brand-accent)]">{t('trust_p1_val')}</p>
              </div>
              <div className="p-2 sm:p-0 border-t sm:border-t-0 sm:border-l border-[var(--border-color)] sm:pl-3">
                <p className="text-xs text-[var(--text-secondary)] font-medium">{t('trust_p2_label')}</p>
                <p className="text-sm sm:text-base font-bold text-[var(--brand-accent)]">{t('trust_p2_val')}</p>
              </div>
              <div className="p-2 sm:p-0 border-t sm:border-t-0 sm:border-l border-[var(--border-color)] sm:pl-3">
                <p className="text-xs text-[var(--text-secondary)] font-medium">{t('trust_p3_label')}</p>
                <p className="text-sm sm:text-base font-bold text-[var(--brand-accent)]">{t('trust_p3_val')}</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Image */}
          <div className="lg:col-span-5 order-first lg:order-last">
            <ImageArea
              src="/images/landing/1792339333.png"
              alt={t('hero_img_alt')}
              aspectRatio="video"
              className="shadow-md rounded-2xl overflow-hidden border border-[var(--border-color)]"
              caption={t('hero_img_caption')}
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. The Duplicate-Sale Problem & Inconsistencies */}
      <section className="bg-[var(--bg-surface-soft)]/60 border-y border-[var(--border-color)] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
              {t('prob_badge')}
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              {t('prob_title')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto">
              {t('prob_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs hover:border-red-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">{t('prob_card1_title')}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('prob_card1_desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs hover:border-amber-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">{t('prob_card2_title')}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('prob_card2_desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[var(--brand-accent)]">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">{t('prob_card3_title')}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('prob_card3_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Workflow Steps */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-10 sm:mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
            {t('flow_badge')}
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {t('flow_title')}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {t('flow_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {workflowSteps.map((ws, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 relative group hover:border-[var(--brand-accent)]/60 transition-colors shadow-xs"
            >
              <span className="text-3xl font-black text-[var(--brand-accent)]/20 block font-mono">
                {ws.step}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {ws.title}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {ws.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Synthetic Scenarios Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div>
              <span className="text-xs font-bold uppercase text-[var(--brand-accent)] block mb-1">
                {t('demo_badge')}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                {t('demo_title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {t('demo_subtitle')}
              </p>
            </div>
            <Link
              href="/cases"
              className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold bg-[var(--bg-surface-soft)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--brand-accent)] transition-colors"
            >
              <span>{t('demo_view_all')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syntheticDemos.map((demo) => (
              <Link
                key={demo.id}
                href={`/cases/${demo.id}`}
                className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/40 hover:bg-[var(--bg-surface-soft)] transition-all flex flex-col justify-between space-y-3 group hover:border-[var(--brand-accent)]/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--brand-accent)]">
                    {demo.id}
                  </span>
                  <RiskBadge level={demo.risk} showScore={false} size="sm" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors">
                    {language === 'bn' ? demo.title_bn : demo.title_en}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {language === 'bn' ? demo.desc_bn : demo.desc_en}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-medium">{t('demo_view_results')}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--brand-accent)]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
            {t('faq_badge')}
          </h2>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('faq_title')}
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 shadow-xs">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Responsible AI Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h4 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brand-accent)]" />
              <span>{t('responsible_title')}</span>
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {t('responsible_desc')}
            </p>
          </div>
          <Link
            href="/methodology"
            className="px-5 py-3 min-h-[44px] flex items-center justify-center rounded-xl text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] transition-colors shrink-0 shadow-xs"
          >
            {t('responsible_btn')}
          </Link>
        </div>
      </section>
    </div>
  );
}
