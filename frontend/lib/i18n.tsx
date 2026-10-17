'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

export const DICTIONARY: Translations = {
  // Brand & Nav
  brand_title: { bn: 'আনভূমি ল্যান্ডগার্ড', en: 'UNLEFT LandGuard' },
  brand_subtitle: { bn: 'আনভূমি ডিটেক্টর', en: 'UNBUmi Detector' },
  nav_home: { bn: 'হোম', en: 'Home' },
  nav_overview: { bn: 'ওভারভিউ', en: 'Overview' },
  nav_dashboard: { bn: 'ওভারভিউ', en: 'Overview' },
  nav_new_investigation: { bn: 'নতুন তদন্ত', en: 'New Investigation' },
  nav_new_case: { bn: 'নতুন তদন্ত', en: 'New Investigation' },
  nav_cases: { bn: 'মামলাসমূহ', en: 'Cases' },
  nav_documents: { bn: 'নথিপত্র লাইব্রেরি', en: 'Documents' },
  nav_alerts: { bn: 'সতর্ক সংকেত', en: 'Alerts' },
  nav_queue: { bn: 'সতর্ক সংকেত', en: 'Alerts' },
  nav_graph: { bn: 'মালিকানা গ্রাফ', en: 'Ownership Graph' },
  nav_reports: { bn: 'প্রতিবেদন', en: 'Reports' },
  nav_methodology: { bn: 'পদ্ধতি ও সীমাবদ্ধতা', en: 'Methodology' },
  nav_about: { bn: 'পরিচিতি', en: 'About' },
  nav_login: { bn: 'ডেমো লগইন', en: 'Demo Sign In' },
  nav_logout: { bn: 'লগআউট', en: 'Sign Out' },

  // Hero & CTA
  hero_badge: { bn: 'বাংলাদেশ ভূমি সেবা ও দ্বৈত বিক্রি শনাক্তকরণ প্ল্যাটফর্ম (P3 / P2)', en: 'Bangladesh Multimodal Land-Fraud & Double-Selling Detection (P3 / P2)' },
  hero_headline: { bn: 'একটি দাগ। একাধিক দলিল। একটি প্রমাণ পথ।', en: 'One plot. Multiple deeds. One evidence trail.' },
  hero_title: { bn: 'একটি দাগ। একাধিক দলিল। একটি প্রমাণ পথ।', en: 'One plot. Multiple deeds. One evidence trail.' },
  hero_supporting: {
    bn: 'দলিল, খতিয়ান রেকর্ড, নামজারি তথ্য এবং দাগের পারস্পরিক সম্পর্ক ক্রস-চেক করে দ্বৈত বিক্রি ও স্বত্ব বিরোধ শনাক্ত করুন এবং তদন্তের জন্য সুনির্দিষ্ট প্রমাণ নিশ্চিত করুন।',
    en: 'Cross-check deeds, khatian records, mutation information, and parcel relationships to identify suspicious conflicts and give reviewers traceable evidence for investigation.'
  },
  hero_description: {
    bn: 'দলিল, খতিয়ান রেকর্ড, নামজারি তথ্য এবং দাগের পারস্পরিক সম্পর্ক ক্রস-চেক করে দ্বৈত বিক্রি ও স্বত্ব বিরোধ শনাক্ত করুন এবং তদন্তের জন্য সুনির্দিষ্ট প্রমাণ নিশ্চিত করুন।',
    en: 'Cross-check deeds, khatian records, mutation information, and parcel relationships to identify suspicious conflicts and give reviewers traceable evidence for investigation.'
  },
  cta_verify: { bn: 'নতুন তদন্ত শুরু করুন', en: 'Start New Investigation' },
  cta_how_it_works: { bn: 'তদন্ত কার্যপদ্ধতি', en: 'Investigation Workflow' },
  cta_demo_explore: { bn: 'প্রস্তুতকৃত টেস্ট কেস দেখুন', en: 'Inspect Prepared Demo Case' },

  // Operational Questions (Overview)
  q_investigating: { bn: 'কতটি মামলা তদন্তাধীন?', en: 'How many cases are being investigated?' },
  q_unresolved: { bn: 'কতটি মামলায় অমীমাংসিত দ্বন্দ্ব রয়েছে?', en: 'How many cases have unresolved conflicts?' },
  q_human_review: { bn: 'কোন মামলাগুলোতে মানবীয় পর্যালোচনা আবশ্যক?', en: 'Which cases require human review?' },
  q_next_action: { bn: 'পর্যালোচকের পরবর্তী অগ্রাধিকারমূলক করণীয় কী?', en: 'What should the reviewer do next?' },

  // Dashboard Metrics
  metric_total_cases: { bn: 'তদন্তাধীন মোট মামলা', en: 'Cases Under Investigation' },
  metric_critical_risks: { bn: 'অমীমাংসিত দ্বন্দ্ব ও বিরোধ', en: 'Unresolved Conflicts' },
  metric_needs_review: { bn: 'মানবীয় পর্যালোচনা আবশ্যক', en: 'Human Review Required' },
  metric_clean_cases: { bn: 'যাচাইকৃত অসঙ্গতিহীন', en: 'Verified Consistent' },
  metric_total_docs: { bn: 'মোট নথি বিশ্লেষণ', en: 'Documents Analyzed' },

  // Risk Levels
  risk_low: { bn: 'স্বাভাবিক (Low)', en: 'Low Risk' },
  risk_review: { bn: 'পর্যালোচনা স্তর (Review)', en: 'Needs Review' },
  risk_high: { bn: 'উচ্চ ঝুঁকি (High)', en: 'High Risk' },
  risk_critical: { bn: 'গুরুতর সংকেত (Critical)', en: 'Critical Conflict' },

  // Statuses
  status_flagged: { bn: 'পর্যালোচনাধীন', en: 'Flagged for Review' },
  status_clean: { bn: 'অসঙ্গতিহীন', en: 'Verified Clean' },
  status_resolved: { bn: 'নিষ্পত্তিকৃত', en: 'Resolved' },
  status_processing: { bn: 'বিশ্লেষণ চলছে', en: 'Processing' },

  // Buttons & Actions
  btn_run_analysis: { bn: 'পুনরায় যাচাই চালান', en: 'Re-run Analysis' },
  btn_save_changes: { bn: 'পরিবর্তন সংরক্ষণ করুন', en: 'Save Changes' },
  btn_export_pdf: { bn: 'রিপোর্ট প্রিন্ট / PDF', en: 'Print / Export PDF' },
  btn_view_evidence: { bn: 'উৎস প্রমাণ দেখুন', en: 'View Source Evidence' },
  btn_confirm_disposition: { bn: 'পর্যালোচক সিদ্ধান্ত প্রদান', en: 'Submit Decision' },
  btn_reseed_demo: { bn: 'ডেমো ডাটা রিসেট', en: 'Reseed Demo Data' },

  // Disclaimer
  disclaimer_short: {
    bn: 'আনলেফট ল্যান্ডগার্ড একটি এআই-সহায়তাকৃত পর্যালোচনামূলক টুল; এটি কোনো সরকারি সংস্থা বা আদালতের চূড়ান্ত স্বত্ব নির্ধারণী সিদ্ধান্ত নয়।',
    en: 'UNLEFT LandGuard is an AI-assisted decision-support platform; it does not replace authorized land officials, courts, or title legal clearance.'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('bn');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('unbhumi_lang') as Language;
    if (saved && (saved === 'bn' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('unbhumi_lang', lang);
  };

  const activeLanguage: Language = mounted ? language : 'bn';

  const t = (key: string): string => {
    if (DICTIONARY[key]) {
      return DICTIONARY[key][activeLanguage] || DICTIONARY[key].bn || key;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language: activeLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};


export const useLanguage = () => useContext(LanguageContext);
