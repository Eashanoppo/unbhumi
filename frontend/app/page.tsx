'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { ImageArea } from '@/components/ImageArea';
import { RiskBadge } from '@/components/RiskBadge';
import {
  ShieldCheck, AlertTriangle, GitFork, FileText, CheckCircle2,
  ArrowRight, Search, Lock, Layers, Eye, HelpCircle, FileCheck
} from 'lucide-react';

export default function LandingPage() {
  const { language, t } = useLanguage();

  const syntheticDemos = [
    {
      id: 'UB-2026-1001',
      title: 'মৌজা কাউন্দিয়া আরএস দাগ ৪১২',
      type: 'clean',
      desc: 'স্বাভাবিক ও বৈধ হস্তান্তর। সাফ-কবলা দলিল, খতিয়ান ও নামজারি সম্পূর্ণ সামঞ্জস্যপূর্ণ।',
      risk: 'low',
      riskText: 'অসঙ্গতিহীন'
    },
    {
      id: 'UB-2026-1002',
      title: 'মৌজা ধামরাই আরএস দাগ ৮৮',
      type: 'double_sale',
      desc: 'সম্ভাব্য দ্বৈত বিক্রি: একই দাগ পূর্বে অন্য ক্রেতার নিকট বিক্রির স্পষ্ট রেকর্ড শনাক্ত।',
      risk: 'critical',
      riskText: 'গুরুতর সংকেত (দ্বৈত বিক্রি)'
    },
    {
      id: 'UB-2026-1003',
      title: 'মৌজা তেঁতুলঝোড়া দাগ ২৯১',
      type: 'broken_chain',
      desc: 'মালিকানা ধারাবাহিকতা বিচ্ছিন্ন: খতিয়ান স্বত্বাধিকারীর সাথে বিক্রেতার বায়া দলিল অনুপস্থিত।',
      risk: 'high',
      riskText: 'উচ্চ ঝুঁকি (বায়া দলিল বিচ্ছিন্ন)'
    },
    {
      id: 'UB-2026-1004',
      title: 'মৌজা সাভার দাগ ৫১০',
      type: 'deed_khatian_mismatch',
      desc: 'দলিল বনাম খতিয়ান স্বত্ব অমিল: দলিলের বিক্রেতার নামের সাথে খতিয়ানের মূল মালিক মিলছে না।',
      risk: 'high',
      riskText: 'উচ্চ ঝুঁকি (খতিয়ান অমিল)'
    }
  ];

  const workflowSteps = [
    {
      step: '০১',
      title_bn: 'নথি আপলোড ও ফিঙ্গারপ্রিন্ট',
      title_en: 'Upload & Hash Fingerprint',
      desc_bn: 'মূল দলিল, বায়া দলিল, আরএস খতিয়ান ও নামজারি আপলোডের সাথে সাথে SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ নিবন্ধিত হয়।'
    },
    {
      step: '০২',
      title_bn: 'ওসিআর ও তথ্য নিষ্কাশন',
      title_en: 'OCR & Field Extraction',
      desc_bn: 'বাংলা ও ইংরেজি দলিলের দাগ, খতিয়ান, নাম, তারিখ ও জমির পরিমাণ আস্থাসীমাসহ এক্সট্রাক্ট করা হয়।'
    },
    {
      step: '০৩',
      title_bn: 'ক্রস-ডকুমেন্ট ও রুল ইঞ্জিন',
      title_en: 'Cross-Document Rule Checks',
      desc_bn: '১২টি সুনির্দিষ্ট ডিটারমিনিস্টিক রুলের মাধ্যমে দ্বৈত বিক্রি, অতিরিক্ত জমি দাবি ও বায়া চেইন বিশ্লেষণ।'
    },
    {
      step: '০৪',
      title_bn: 'মালিকানা গ্রাফ ও মানবীয় পর্যালোচনা',
      title_en: 'Graph & Human Decision',
      desc_bn: 'পারস্পরিক সংযোগের গ্রাফ ও পৃষ্ঠার প্রমাণ রেফারেন্সসহ পর্যালোচকের চূড়ান্ত সিদ্ধান্তের জন্য পেশ করা হয়।'
    }
  ];

  const faqs = [
    {
      q: 'আনভূমি ডিটেক্টর কি সরকারি রেজিস্ট্রি প্রতিস্থাপন করে?',
      a: 'না। এটি একটি এআই-সহায়তাকৃত পর্যালোচনামূলক সিদ্ধান্ত সমর্থন সফটওয়্যার। এটি সাব-রেজিস্ট্রার, সহকারী কমিশনার (ভূমি) বা আদালতের বিচারিক এখতিয়ারকে প্রতিস্থাপন করে না।'
    },
    {
      q: 'দ্বৈত বিক্রি কীভাবে শনাক্ত করা হয়?',
      a: 'সিস্টেমে সংরক্ষিত পূর্ববর্তী নিবন্ধিত দলিলের দাগ নম্বর, মৌজা ও চৌহদ্দির সাথে নতুন প্রস্তাবিত দলিলের তথ্য মিলিয়ে দেখা হয়। কোনো দাগে পূর্বে সক্রিয় হস্তান্তর থাকলে সিস্টেমে দ্বৈত বিক্রির অ্যালার্ট ও গ্রাফ তৈরি হয়।'
    },
    {
      q: 'ডেমোতে ব্যবহৃত নথিপত্র কি বাস্তব মানুষের?',
      a: 'একেবারেই না। হ্যাকাথনের নীতিমালা ও ব্যক্তিগত গোপনীয়তা বজায় রাখতে সকল প্রদর্শনী কেস, নাম, ঠিকানা ও দাগ কাল্পনিক ও কৃত্রিমভাবে তৈরি।'
    },
    {
      q: 'ফাইলের হ্যাশ (SHA-256) মিললেই কি দলিল বৈধ প্রমাণিত হয়?',
      a: 'না। হ্যাশ প্রমাণ করে যে ফাইলটি হুবহু একই ডিজিটাল কপি কিনা। আইনি স্বত্বের বৈধতা নির্ধারণে নথির ভেতরের তথ্য ও রাজস্ব রেকর্ডের ক্রস-চেক অপরিহার্য।'
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
                  <span className="text-[var(--accent-deep)]">একটি প্রমাণ পথ।</span>
                </>
              ) : (
                <>
                  One plot. Multiple deeds. <br className="hidden sm:inline" />
                  <span className="text-[var(--accent-deep)]">One evidence trail.</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'দলিল, খতিয়ান রেকর্ড, নামজারি তথ্য এবং দাগের পারস্পরিক সম্পর্ক ক্রস-চেক করে দ্বৈত বিক্রি ও স্বত্ব বিরোধ শনাক্ত করুন এবং তদন্তের জন্য সুনির্দিষ্ট প্রমাণ নিশ্চিত করুন।'
                : 'Cross-check deeds, khatian records, mutation information, and parcel relationships to identify suspicious conflicts and give reviewers traceable evidence for investigation.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/documents/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-deep)] text-[#FAF9F6] hover:opacity-90 transition-all shadow-sm"
              >
                <span>{t('cta_verify')}</span>
                <ArrowRight className="w-4 h-4 text-[#FAF9F6]" />
              </Link>
              <Link
                href="/cases/UB-2026-1002"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors"
              >
                <span>{language === 'bn' ? 'দ্বৈত বিক্রি ডেমো দেখুন (UB-2026-1002)' : 'Demo Case: Double-Selling (UB-2026-1002)'}</span>
              </Link>
            </div>

            {/* Trust points */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-[var(--border-color)]">
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">প্রাথমিক ট্র্যাক</p>
                <p className="text-sm font-bold text-[var(--accent-deep)]">P3 দ্বৈত বিক্রি রোধ</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">সহায়ক যাচাই</p>
                <p className="text-sm font-bold text-[var(--accent-deep)]">P2 দলিল ও বায়া চেইন</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">আইনি নিশ্চয়তা</p>
                <p className="text-sm font-bold text-[var(--accent-deep)]">পর্যালোচক সিদ্ধান্ত</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Image */}
          <div className="lg:col-span-5">
            <ImageArea
              src="/images/landing/hero-landscape.svg"
              alt="বাংলাদেশের গ্রামীণ কৃষি জমি ও ক্যাডাস্ট্রাল মৌজা জরিপ"
              aspectRatio="video"
              className="shadow-lg"
              caption="সাভার ও ধামরাই অঞ্চলের ক্যাডাস্ট্রাল মৌজা নকশা ও প্লট বাউন্ডারি সিমুলেশন"
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
              সমস্যার মূল প্রেক্ষাপট
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              কেন একই জমি বারবার বিক্রি ও জাল দলিলের সৃষ্টি হয়?
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              বাংলাদেশের ভূমি রেকর্ড ব্যবস্থার ঐতিহাসিক বিকেন্দ্রীকরণ ও বিচ্ছিন্ন নথিপত্রের কারণে একাধিক জটিলতার সৃষ্টি হয় যা স্বত্ব ক্রেতা ও ব্যাংক কর্মকর্তাদের জন্য ঝুঁকিপূর্ণ।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">দ্বৈত বিক্রি (Duplicate Selling)</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                একজন অসৎ ব্যক্তি একই দাগের জমি একজনের নিকট বিক্রির পর নামজারি সম্পূর্ণ হওয়ার পূর্বেই অন্য সাব-রেজিস্ট্রি অফিসে পুনরায় বিক্রয় দলিল সম্পাদন করে।
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700">
                <GitFork className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">বায়া দলিলের ধারাবাহিকতা বিচ্ছিন্ন</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                খতিয়ানভুক্ত মূল প্রজার নিকট থেকে বর্তমান বিক্রেতা কীভাবে জমিটি ক্রয় বা ওয়ারিশসূত্রে পেলেন তার প্রয়োজনীয় বায়া দলিল ও রেকর্ড চেইন অনুপস্থিত থাকে।
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">দলিল বনাম খতিয়ান গরমিল</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                দলিলে উল্লেখিত মোট জমির পরিমাণ অপেক্ষা খতিয়ানের রেকর্ডকৃত হিস্যা কম থাকে, অথবা মালিকের নাম ও সিএস/এসএ/আরএস জরিপ দাগে বৈসাদৃশ্য দেখা দেয়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Workflow Steps */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-deep)] dark:text-[#7ED957]">
            কার্যপদ্ধতি
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            আনভূমি ডিটেক্টর কীভাবে দলিল যাচাই করে?
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            একটি সুশৃঙ্খল চার-ধাপের প্রক্রিয়া যা ওসিআর থেকে শুরু করে মানবীয় পর্যালোচকের চূড়ান্ত অনুমোদন পর্যন্ত বিস্তৃত।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((ws, i) => (
            <div key={i} className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 relative group hover:border-[var(--accent-deep)] transition-colors">
              <span className="text-3xl font-black text-[var(--accent-deep)]/20 dark:text-[#7ED957]/20 block">
                {ws.step}
              </span>
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                {ws.title_bn}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {ws.desc_bn}
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
                লাইভ ডেমো প্রদর্শন
              </span>
              <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
                ৮টি প্রস্তুতকৃত সিন্থেটিক কেস স্টাডি
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                স্বচ্ছ পরীক্ষার জন্য প্রস্তুত বাস্তবসম্মত বৈধ ও সন্দেহজনক পরিস্থিতি
              </p>
            </div>
            <Link
              href="/cases"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
            >
              <span>সকল কেস দেখুন</span>
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
                    {demo.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {demo.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>বিশ্লেষণ ফলাফল দেখুন</span>
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
            সাধারণ জিজ্ঞাসা
          </h2>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            প্রায়শই জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)
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
              <span>দায়িত্বশীল এআই ও স্বচ্ছ যাচাইকরণ প্রতিজ্ঞা</span>
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              সিস্টেমের কোনো অ্যালার্ট কাউকে সরাসরি প্রতারক ঘোষণা করে না; এটি কেবল পর্যালোচকের নিকট অসঙ্গতির উৎস ও প্রাসঙ্গিক পৃষ্ঠা প্রদর্শন করে সিদ্ধান্ত গ্রহণে সহায়তা করে।
            </p>
          </div>
          <Link
            href="/methodology"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors shrink-0"
          >
            পদ্ধতি ও সীমাবদ্ধতা পড়ুন
          </Link>
        </div>
      </section>
    </div>
  );
}
