'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-[var(--border-color)] pb-4 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
          {language === 'bn' ? 'গোপনীয়তা ও ডেটা সুরক্ষা নীতি' : 'Privacy & Data Protection Policy'}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          কার্যকর তারিখ: ১৭ অক্টোবর ২০২৬ • সংস্করণ ১.০ (এমভিপি)
        </p>
      </div>

      <div className="space-y-6 text-xs text-[var(--text-secondary)] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-[var(--accent-deep)]" />
            <span>১. কাল্পনিক ও সিন্থেটিক ডেটা পলিসি</span>
          </h2>
          <p>
            আনভূমি ডিটেক্টর প্ল্যাটফর্মের হ্যাকাতন সংস্করণে প্রদর্শিত সকল কেস, ব্যক্তি ও প্রতিষ্ঠানের নাম, ঠিকানা এবং দাগ নম্বর কাল্পনিক বা সিন্থেটিক ডেটাসেটের অংশ। কোনো বাস্তব নাগরিকের ব্যক্তিগত পরিচয় বা অপ্রকাশ্য জমি সংক্রান্ত গোপন তথ্য এই পাবলিক প্রোটোটাইপে ব্যবহৃত হয়নি।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[var(--accent-deep)]" />
            <span>২. সরকারি সার্ভার ও স্ক্র্যাপিং মুক্ত অবস্থান</span>
          </h2>
          <p>
            এই সফটওয়্যারটি সরকারি কোনো ভূমিসেবা ওয়েবসাইট বা ডাটাবেসে অননুমোদিত স্ক্র্যাপিং, স্বয়ংক্রিয় ডাউনলোড বা অনুপ্রবেশের চেষ্টা চালায় না। সমস্ত যাচাই কেবল ব্যবহারকারীর আপলোডকৃত নথি ও অভ্যন্তরীণ ডাটাবেসের মধ্যে সীমাবদ্ধ।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-deep)]" />
            <span>৩. ক্রিপ্টোগ্রাফিক সুরক্ষা ও অডিট লগ</span>
          </h2>
          <p>
            সিস্টেমে ইনজেস্টেড দলিলের অখণ্ডতা বজায় রাখতে প্রতিটি ফাইলের একমুখী SHA-256 হ্যাশ তৈরি করা হয়। পর্যালোচকের যেকোনো পরিবর্তন বা সিদ্ধান্ত সময় ও ব্যবহারকারী আইডিসহ অপরিবর্তনীয় অডিট লগে সংরক্ষিত হয়।
          </p>
        </section>
      </div>
    </div>
  );
}
