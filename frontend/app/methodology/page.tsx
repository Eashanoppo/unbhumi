'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { BookOpen, ShieldCheck, Binary, GitFork, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';

export default function MethodologyPage() {
  const { language } = useLanguage();

  const rules = [
    { code: 'D001', name_bn: 'অভিন্ন ডিজিটাল ফাইলের হ্যাশ উপস্থিতি', family: 'নথির অখণ্ডতা', sev: 'মধ্যম' },
    { code: 'D002', name_bn: 'দলিল নম্বর বা রেজিস্ট্রেশন তারিখ অমিল', family: 'নথির অখণ্ডতা', sev: 'উচ্চ' },
    { code: 'O001', name_bn: 'মালিকানা ধারাবাহিকতা বিচ্ছিন্ন (বায়া দলিল অনুপস্থিত)', family: 'মালিকানা চেইন', sev: 'গুরুতর' },
    { code: 'O002', name_bn: 'মালিকানা অর্জনের পূর্ববর্তী তারিখে জমি হস্তান্তর', family: 'মালিকানা চেইন', sev: 'গুরুতর' },
    { code: 'P001', name_bn: 'সম্ভাব্য দ্বৈত বিক্রি (একই দাগ একাধিক দলিলে বিক্রি)', family: 'দাগ ও বিরোধ', sev: 'গুরুতর' },
    { code: 'P002', name_bn: 'বিক্রিত জমির পরিমাণ খতিয়ানের রেকর্ড অতিক্রম', family: 'দাগ ও বিরোধ', sev: 'উচ্চ' },
    { code: 'P003', name_bn: 'চৌহদ্দি ও মৌজা নকশার সীমানা বর্ণনায় গরমিল', family: 'দাগ ও বিরোধ', sev: 'মধ্যম' },
    { code: 'K001', name_bn: 'দলিল বনাম আরএস/বিএস খতিয়ান স্বত্ব অমিল', family: 'রেকর্ড সামঞ্জস্য', sev: 'উচ্চ' },
    { code: 'M001', name_bn: 'দলিল বনাম নামজারি খতিয়ানের তথ্য অমিল', family: 'রেকর্ড সামঞ্জস্য', sev: 'উচ্চ' },
    { code: 'T001', name_bn: 'সহায়ক ভূমি উন্নয়ন কর দাখিলার তথ্যে গরমিল', family: 'সহায়ক প্রমাণ', sev: 'স্বল্প' },
    { code: 'G001', name_bn: 'মালিকানা গ্রাফে সমান্তরাল হস্তান্তর পথ শনাক্ত', family: 'গ্রাফ বিশ্লেষণ', sev: 'গুরুতর' },
    { code: 'X001', name_bn: 'গুরুত্বপূর্ণ তথ্যে ওসিআর পাঠোদ্ধারের নিম্ন মান', family: 'আহরণ মান', sev: 'স্বল্প' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-[var(--border-color)] pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] border border-[var(--border-color)]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>প্রযুক্তিগত কার্যপ্রণালী ও রুল ইঞ্জিন</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
          {language === 'bn' ? 'যাচাই পদ্ধতি ও সীমাবদ্ধতা' : 'Methodology & Limitations'}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          আনভূমি ডিটেক্টরের ওসিআর, ফিল্ড নরমালাইজেশন, ডিটারমিনিস্টিক রুল ইঞ্জিন ও গ্রাফ বিশ্লেষণের বৈজ্ঞানিক ব্যাখ্যা।
        </p>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[var(--accent-deep)]" />
          <span>১. চার স্তরের বিশ্লেষণ আর্কিটেকচার</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
            <span className="text-xs font-bold text-[var(--accent-deep)] block">ধাপ ১: ক্রিপ্টোগ্রাফিক ফিঙ্গারপ্রিন্ট (P2)</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              আপলোডকৃত ফাইলের SHA-256 হ্যাশ গণনা করে পূর্বে সংরক্ষিত কোনো নমুনার সাথে হুবহু মিল রয়েছে কিনা তা পরীক্ষা করা হয়।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
            <span className="text-xs font-bold text-[var(--accent-deep)] block">ধাপ ২: ওসিআর ও স্ট্রাকচার্ড এক্সট্রাকশন</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              দলিলের স্ক্যান কপি থেকে বাংলা সংখ্যা, দাগ, খতিয়ান, মৌজা, ক্রেতা-বিক্রেতার নাম বাউন্ডিং বক্স ও আস্থাসীমাসহ আলাদা করা হয়।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
            <span className="text-xs font-bold text-[var(--accent-deep)] block">ধাপ ৩: ডিটারমিনিস্টিক রুল ইঞ্জিন (P3)</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              জেনারেটিভ এআই-এর পরিবর্তে ১২টি সুনির্দিষ্ট যাচাই নিয়মের মাধ্যমে তথ্যের সুস্পষ্ট বৈপরীত্য ও দ্বৈত বিক্রি শনাক্তকরণ।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
            <span className="text-xs font-bold text-[var(--accent-deep)] block">ধাপ ৪: নেটওয়ার্কএক্স মালিকানা গ্রাফ</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              দাগ, ব্যক্তি ও দলিলের মধ্যকার হস্তান্তর সম্পর্ক দিয়ে গ্রাফ তৈরি করে সাইকেল ও সমান্তরাল প্রতিদ্বন্দ্বী পথ খুঁজে বের করা।
            </p>
          </div>
        </div>
      </div>

      {/* 12 Rules Catalogue Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Binary className="w-5 h-5 text-[var(--accent-deep)]" />
          <span>২. ডিটারমিনিস্টিক রুল ক্যাটালগ (Rules Inventory)</span>
        </h2>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-surface-soft)]/60 border-b border-[var(--border-color)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-3">কোড</th>
                <th className="py-2.5 px-3">নিয়মের শিরোনাম</th>
                <th className="py-2.5 px-3">শ্রেণি</th>
                <th className="py-2.5 px-3">তীব্রতা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {rules.map((r) => (
                <tr key={r.code} className="hover:bg-[var(--bg-surface-soft)]/30">
                  <td className="py-2 px-3 font-mono font-bold text-[var(--accent-deep)] dark:text-[#7ED957]">{r.code}</td>
                  <td className="py-2 px-3 font-medium text-[var(--text-primary)]">{r.name_bn}</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">{r.family}</td>
                  <td className="py-2 px-3 font-semibold">{r.sev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safeguards and Uncertainty */}
      <div id="safeguards" className="p-6 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-3">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>৩. সীমাবদ্ধতা ও দায়িত্বশীল এআই গাইডলাইন</span>
        </h3>
        <ul className="text-xs text-[var(--text-secondary)] space-y-2 list-disc pl-5 leading-relaxed">
          <li><strong>অনুপস্থিতি মানেই জালিয়াতি নয়:</strong> কোনো বায়া দলিল আপলোড না থাকলে সিস্টেম "নথি অনুপস্থিত" নির্দেশ করবে, তবে স্বত্ব চূড়ান্তভাবে অস্বীকার করবে না।</li>
          <li><strong>নামের বানানে পার্থক্য:</strong> নামের সাধারণ বানান বিভ্রাট বা টাইপোকে জালিয়াতি বলা হয় না; নরমালাইজেশন সাপেক্ষে পর্যালোচকের মতামত চাওয়া হয়।</li>
          <li><strong>চূড়ান্ত কর্তৃত্ব মানব পর্যালোচকের:</strong> এআই কেবল সম্ভাব্য অসংগতির সপক্ষে দলিলের পৃষ্ঠা ও সংখ্যা নির্দেশ করে; বৈধতার সিদ্ধান্ত সর্বদা অনুমোদিত মানুষের।</li>
        </ul>
      </div>
    </div>
  );
}
