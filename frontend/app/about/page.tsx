'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { ImageArea } from '@/components/ImageArea';
import { ShieldCheck, Target, Users, Landmark, Scale, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-[var(--border-color)] pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] border border-[var(--border-color)]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>আনলেফট (UNLEFT) উদ্যোগ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
          {language === 'bn' ? 'আনভূমি ডিটেক্টর সম্পর্কে' : 'About UNBUmi Detector'}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          বাংলাদেশের ভূমিসেবা খাতে এআই-সহায়তাকৃত দলিল যাচাই ও দ্বৈত বিক্রি নিরোধের এক নির্ভরযোগ্য প্রযুক্তিগত সমাধান।
        </p>
      </div>

      {/* Visual Image */}
      <ImageArea
        src="/images/landing/hero-landscape.svg"
        alt="বাংলাদেশের ভূমি ও দলিল পর্যালোচনা"
        aspectRatio="video"
        caption="আনভূমি ডিটেক্টর — ভূমি অধিকার সুরক্ষা ও স্বচ্ছ লেনদেনের প্রতিশ্রুতি"
      />

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[var(--accent-deep)] dark:text-[#7ED957]">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">আমাদের লক্ষ্য ও উদ্দেশ্য</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            ভূমি লেনদেনে জাল দলিল, মালিকানা চেইনের ফাঁক এবং একই জমি একাধিক ব্যক্তির নিকট বিক্রির প্রচেষ্টা রোধে মানব পর্যালোচকদের হাতে প্রমাণ-ভিত্তিক স্মার্ট টুল তুলে দেওয়া।
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">দায়িত্বশীল এআই দৃষ্টিভঙ্গি</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            আমরা বিশ্বাস করি কৃত্রিম বুদ্ধিমত্তা সিদ্ধান্ত সমর্থন করতে পারে, তবে চূড়ান্ত সিদ্ধান্ত সর্বদা একজন অনুমোদিত ভূমি কর্মকর্তা বা বিচারকের হাতেই থাকা বাঞ্ছনীয়।
          </p>
        </div>
      </div>

      {/* Target Audiences */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          কাদের জন্য এই প্ল্যাটফর্ম? (Target Stakeholders)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 space-y-2">
            <Landmark className="w-5 h-5 text-[var(--accent-deep)]" />
            <h4 className="text-xs font-bold text-[var(--text-primary)]">সাব-রেজিস্ট্রি ও ভূমি কার্যালয়</h4>
            <p className="text-[11px] text-[var(--text-secondary)]">দলিল রেজিস্ট্রেশনের পূর্বে পূর্ববর্তী বায়া ও খতিয়ানের ধারাবাহিকতা দ্রুত নিশ্চিত করতে।</p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 space-y-2">
            <Users className="w-5 h-5 text-[var(--accent-deep)]" />
            <h4 className="text-xs font-bold text-[var(--text-primary)]">ব্যাংক ও আর্থিক প্রতিষ্ঠান</h4>
            <p className="text-[11px] text-[var(--text-secondary)]">জমি বন্ধক রেখে ঋণ প্রদানের পূর্বে কোল্যাটারাল জমির দ্বৈত বন্ধক বা স্বত্ব বিরোধ যাচাই।</p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 space-y-2">
            <HeartHandshake className="w-5 h-5 text-[var(--accent-deep)]" />
            <h4 className="text-xs font-bold text-[var(--text-primary)]">রিয়েল এস্টেট ও ক্রেতা সাধারণ</h4>
            <p className="text-[11px] text-[var(--text-secondary)]">জমি ক্রয়ের পূর্বে প্রয়োজনীয় নথিপত্রের অখণ্ডতা ও দাগের সঠিক মালিকানা পরীক্ষা করতে।</p>
          </div>
        </div>
      </div>
    </div>
  );
}
