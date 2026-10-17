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
  brand_title: { bn: 'আনভূমি ডিটেক্টর', en: 'UNBUmi Detector' },
  brand_subtitle: { bn: 'আনলেফট ল্যান্ডগার্ড', en: 'UNLEFT LandGuard' },
  nav_home: { bn: 'হোম', en: 'Home' },
  nav_dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  nav_new_case: { bn: 'নতুন যাচাই', en: 'New Analysis' },
  nav_cases: { bn: 'কেসসমূহ', en: 'Cases' },
  nav_documents: { bn: 'নথিপত্র লাইব্রেরি', en: 'Documents' },
  nav_queue: { bn: 'পর্যালোচনা কিউ', en: 'Review Queue' },
  nav_graph: { bn: 'মালিকানা গ্রাফ', en: 'Ownership Graph' },
  nav_reports: { bn: 'প্রতিবেদন', en: 'Reports' },
  nav_methodology: { bn: 'পদ্ধতি ও সীমাবদ্ধতা', en: 'Methodology' },
  nav_about: { bn: 'পরিচিতি', en: 'About' },
  nav_login: { bn: 'ডেমো লগইন', en: 'Demo Sign In' },
  nav_logout: { bn: 'লগআউট', en: 'Sign Out' },

  // Hero & CTA
  hero_badge: { bn: 'বাংলাদেশ ভূমি সেবা ও দলিল জালিয়াতি নিরোধ প্ল্যাটফর্ম', en: 'Bangladesh LandTech & Fraud Prevention Platform' },
  hero_title: { bn: 'এআই-সহায়তাকৃত ভূমি দলিল ও স্বত্ব যাচাইকরণ', en: 'AI-Assisted Land Document & Title Verification' },
  hero_description: {
    bn: 'দলিলের অসঙ্গতি, দ্বৈত বিক্রির ঝুঁকি, মালিকানা চেইনের ফাঁক এবং খতিয়ান-নামজারির গরমিল দ্রুত শনাক্ত করুন নির্ভরযোগ্য প্রমাণের ভিত্তিতে।',
    en: 'Identify deed inconsistencies, double-selling risks, broken ownership chains, and khatian mismatches with traceable evidence.'
  },
  cta_verify: { bn: 'ডকুমেন্ট যাচাই করুন', en: 'Verify a Document' },
  cta_how_it_works: { bn: 'কীভাবে কাজ করে', en: 'How It Works' },
  cta_demo_explore: { bn: '৮টি সিন্থেটিক কেস দেখুন', en: 'Explore 8 Synthetic Cases' },

  // Dashboard Metrics
  metric_total_cases: { bn: 'মোট যাচাই কেস', en: 'Total Cases' },
  metric_critical_risks: { bn: 'উচ্চ/গুরুতর ঝুঁকি', en: 'Critical / High Risk' },
  metric_needs_review: { bn: 'পর্যালোচনাধীন', en: 'Needs Review' },
  metric_clean_cases: { bn: 'যাচাইকৃত অসঙ্গতিহীন', en: 'Verified Clean' },
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
    bn: 'আনভূমি ডিটেক্টর একটি এআই-সহায়তাকৃত পর্যালোচনামূলক টুল; এটি কোনো সরকারি সংস্থা বা আদালতের চূড়ান্ত স্বত্ব নির্ধারণী সিদ্ধান্ত নয়।',
    en: 'UNBUmi Detector is an AI-assisted decision-support tool; it does not replace authorized land officials, courts, or title legal clearance.'
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

  useEffect(() => {
    const saved = localStorage.getItem('unbhumi_lang') as Language;
    if (saved && (saved === 'bn' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('unbhumi_lang', lang);
  };

  const t = (key: string): string => {
    if (DICTIONARY[key]) {
      return DICTIONARY[key][language] || DICTIONARY[key].bn || key;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
