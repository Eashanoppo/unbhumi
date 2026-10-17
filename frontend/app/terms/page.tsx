'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Scale, AlertCircle, FileCheck } from 'lucide-react';

export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-[var(--border-color)] pb-4 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
          {language === 'bn' ? 'ব্যবহারের শর্তাবলী ও আইনি দায়মুক্তি' : 'Terms of Service & Disclaimer'}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          কার্যকর তারিখ: ১৭ অক্টোবর ২০২৬ • সংস্করণ ১.০ (এমভিপি)
        </p>
      </div>

      <div className="space-y-6 text-xs text-[var(--text-secondary)] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[var(--accent-deep)]" />
            <span>১. আইনি পরামর্শের বিকল্প নয়</span>
          </h2>
          <p>
            আনভূমি ডিটেক্টর দ্বারা প্রদত্ত অ্যালার্ট, স্কোর ও প্রতিবেদন কোনো অবস্থাতেই সাব-রেজিস্ট্রার কার্যালয়, সহকারী কমিশনার (ভূমি), দেওয়ানী আদালত বা সনদপ্রাপ্ত আইনজীবীর আইনি মতামতের বিকল্প নয়। এটি একটি প্রযুক্তিগত সিদ্ধান্ত-সমর্থন প্রোটোটাইপ।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>২. দায়মুক্তি বিবৃতি</span>
          </h2>
          <p>
            আনলেফট (UNLEFT) টিম বা আনভূমি ডিটেক্টর কোনো দলিলের আইনগত নির্ভুলতা বা ১০০% প্রতারণা শনাক্তকরণের গ্যারান্টি প্রদান করে না। কোনো ব্যবহারকারী এই সফটওয়্যারের ফলাফলের ওপর একক ভিত্তি করে আর্থিক বা জমি রেজিস্ট্রেশনের চূড়ান্ত সিদ্ধান্ত গ্রহণ করলে তার দায় একান্তই ব্যবহারকারীর।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-[var(--accent-deep)]" />
            <span>৩. উন্মুক্ত হ্যাকাথন প্রদর্শনী ও লাইসেন্স</span>
          </h2>
          <p>
            এই প্রজেক্টটি ল্যান্ডটেক ইনোভেশন হ্যাকাথন ২০২৬-এর জন্য নির্মিত হয়েছে। এর সমস্ত কোড ও আর্কিটেকচার একাডেমিক ও উদ্ভাবনী মূল্যায়নের জন্য উন্মুক্ত।
          </p>
        </section>
      </div>
    </div>
  );
}
