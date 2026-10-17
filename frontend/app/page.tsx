'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { ImageArea } from '@/components/ImageArea';
import { RiskBadge } from '@/components/RiskBadge';
import {
  ShieldCheck, AlertTriangle, GitFork, FileText, CheckCircle2,
  ArrowRight, Search, Lock, Layers, Eye, HelpCircle, FileCheck, Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const { language, t } = useLanguage();

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
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#A3B4A6] border border-[var(--border-color)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-deep)]"></span>
              <span>{t('hero_badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.18]">
              {language === 'bn' ? (
                <>
                  একটি দাগ। একাধিক দলিল। <br className="hidden sm:inline" />
                  <span className="text-emerald-700 dark:text-[var(--brand-accent)]">একটি প্রমাণ পথ।</span>
                </>
              ) : (
                <>
                  One plot. Multiple deeds. <br className="hidden sm:inline" />
                  <span className="text-emerald-700 dark:text-[var(--brand-accent)]">One evidence trail.</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {t('hero_description')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/documents/new"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-sm hover:shadow"
              >
                <span>{t('cta_verify')}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/demo"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border border-[var(--brand-accent)]/60 bg-[var(--accent-light)] text-[var(--accent-deep)] dark:text-[#7ED957] hover:bg-[var(--brand-accent)] hover:text-[var(--cta-text)] transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'bn' ? 'ইন্টারেক্টিভ ডেমো চালান' : 'Try Interactive Demo'}</span>
              </Link>
            </div>

            {/* Trust points */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-[var(--border-color)]">
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">{t('trust_p1_label')}</p>
                <p className="text-sm font-bold text-[var(--accent-deep)]">{t('trust_p1_val')}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">{t('trust_p2_label')}</p>
                <p className="text-sm font-bold text-[var(--accent-deep)]">{t('trust_p2_val')}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">{t('trust_p3_label')}</p>
                <p className="text-sm font-bold text-[var(--accent-deep)]">{t('trust_p3_val')}</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Image */}
          <div className="lg:col-span-5">
            <ImageArea
              src="/images/landing/hero-landscape.svg"
              alt={t('hero_img_alt')}
              aspectRatio="video"
              className="shadow-lg"
              caption={t('hero_img_caption')}
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. The Duplicate-Sale Problem & Inconsistencies */}
      <section className="bg-[var(--bg-surface-soft)]/50 border-y border-[var(--border-color)] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-deep)] dark:text-[#7ED957]">
              {t('prob_badge')}
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              {t('prob_title')}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('prob_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">{t('prob_card1_title')}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('prob_card1_desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700">
                <GitFork className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">{t('prob_card2_title')}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('prob_card2_desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700">
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
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-deep)] dark:text-[#7ED957]">
            {t('flow_badge')}
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {t('flow_title')}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {t('flow_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((ws, i) => (
            <div key={i} className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 relative group hover:border-[var(--accent-deep)] transition-colors">
              <span className="text-3xl font-black text-[var(--accent-deep)]/20 dark:text-[#7ED957]/20 block">
                {ws.step}
              </span>
              <h4 className="text-base font-bold text-[var(--text-primary)]">
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
        <div className="p-8 sm:p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div>
              <span className="text-xs font-bold uppercase text-[var(--accent-deep)] dark:text-[#7ED957] block mb-1">
                {t('demo_badge')}
              </span>
              <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
                {t('demo_title')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {t('demo_subtitle')}
              </p>
            </div>
            <Link
              href="/cases"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
            >
              <span>{t('demo_view_all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syntheticDemos.map((demo) => (
              <Link
                key={demo.id}
                href={`/cases/${demo.id}`}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/40 hover:bg-[var(--bg-surface-soft)] transition-colors flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--accent-deep)] dark:text-[#7ED957]">
                    {demo.id}
                  </span>
                  <RiskBadge level={demo.risk} showScore={false} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-deep)] transition-colors">
                    {language === 'bn' ? demo.title_bn : demo.title_en}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {language === 'bn' ? demo.desc_bn : demo.desc_en}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{t('demo_view_results')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-deep)] dark:text-[#7ED957]">
            {t('faq_badge')}
          </h2>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('faq_title')}
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-deep)] dark:text-[#7ED957] shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Responsible AI Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--accent-deep)] dark:text-[#7ED957]" />
              <span>{t('responsible_title')}</span>
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {t('responsible_desc')}
            </p>
          </div>
          <Link
            href="/methodology"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors shrink-0"
          >
            {t('responsible_btn')}
          </Link>
        </div>
      </section>
    </div>
  );
}
