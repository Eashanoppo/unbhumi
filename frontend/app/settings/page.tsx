'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { api, User } from '@/lib/api';
import {
  Settings, User as UserIcon, Shield, Sliders, Database,
  RefreshCw, CheckCircle2, Moon, Sun, Globe, AlertTriangle
} from 'lucide-react';
import { PremiumLanguageToggle, PremiumThemeToggle } from '@/components/PremiumToggles';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('demo_reviewer');
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [reseedLoading, setReseedLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await api.getCurrentUser();
        if (u) {
          setUser(u);
          setSelectedRole(u.profile?.role || 'demo_reviewer');
        }
      } catch (err) {
        console.error('Failed to load user', err);
      }
    };
    loadUser();
  }, []);

  const handleRoleChange = async (newRole: string) => {
    setIsSwitchingRole(true);
    try {
      const res = await api.demoLogin(newRole);
      if (res && res.user) {
        setUser(res.user);
        setSelectedRole(res.user.profile?.role || newRole);
        setToastMsg(
          language === 'bn'
            ? `সফলভাবে ${res.user.profile?.full_name_bn || newRole}-এ ভূমিকা পরিবর্তন করা হয়েছে`
            : `Role changed to ${res.user.username} (${newRole})`
        );
      }

    } catch (err) {
      console.error('Role switch failed', err);
    } finally {
      setIsSwitchingRole(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleReseed = async () => {
    if (!window.confirm(
      language === 'bn'
        ? 'আপনি কি নিশ্চিত যে ডেমো ডেটাবেজ পুনরায় প্রারম্ভিক অবস্থায় রিসেট করতে চান?'
        : 'Are you sure you want to re-seed demo data to default baseline?'
    )) {
      return;
    }
    setReseedLoading(true);
    try {
      await api.reseedData();
      setToastMsg(
        language === 'bn'
          ? '৮টি সিন্থেটিক কেস ও ১৬টি নথি সফলভাবে পুনরায় ইনিশিয়ালাইজ করা হয়েছে'
          : 'Successfully re-seeded 8 synthetic cases and 16 documents'
      );
    } catch (err) {
      console.error('Reseed error', err);
    } finally {
      setReseedLoading(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="border-b border-[var(--border-color)] pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3 text-[var(--text-primary)]">
            <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--brand-accent)]" />
            <span>{language === 'bn' ? 'সিস্টেম ও ব্যবহারকারী সেটিংস' : 'System & User Settings'}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
            {language === 'bn'
              ? 'ইউজার প্রোফাইল, ডেমো ভূমিকা, ইন্টারফেস থিম এবং সিস্টেমের ডায়াগনস্টিক তথ্য পরিচালনা করুন।'
              : 'Manage user profiles, demo roles, UI preferences, and platform diagnostics.'}
          </p>
        </div>

        {/* Feedback Toast */}
        {toastMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium text-xs sm:text-sm">{toastMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: User Profile & Role Switcher */}
          <div className="bg-[var(--bg-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--border-color)] shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
              <UserIcon className="w-5 h-5 text-[var(--brand-accent)]" />
              <span>{language === 'bn' ? 'বর্তমান ব্যবহারকারী প্রোফাইল' : 'Active User Profile'}</span>
            </h2>
            <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[var(--text-secondary)]">{language === 'bn' ? 'পূর্ণ নাম:' : 'Full Name:'}</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {user?.profile?.full_name_bn || (language === 'bn' ? 'আব্দুল করিম (পরীক্ষক)' : 'Abdul Karim (Reviewer)')}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[var(--text-secondary)]">{language === 'bn' ? 'ইমেইল:' : 'Email:'}</span>
                <span className="font-mono text-xs text-[var(--text-primary)]">{user?.email || 'reviewer@unleft.org'}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[var(--text-secondary)]">{language === 'bn' ? 'সংস্থা:' : 'Organization:'}</span>
                <span className="text-[var(--text-primary)]">{user?.profile?.organization || (language === 'bn' ? 'ভূমি মন্ত্রণালয় (ডেমো)' : 'Ministry of Land (Demo)')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-[var(--text-primary)] block">
                {language === 'bn' ? 'ডেমো ভূমিকা পরিবর্তন করুন:' : 'Switch Demo Role:'}
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    id: 'demo_reviewer',
                    bn: 'দলিল পরীক্ষক (Land Document Reviewer)',
                    en: 'Land Document Reviewer',
                    desc_bn: 'দলিল যাচাই, অসঙ্গতি শনাক্তকরণ ও ফিল্ড এডিট'
                  },
                  {
                    id: 'demo_supervisor',
                    bn: 'তত্ত্বাবধায়ক / সাব-রেজিস্ট্রার (Sub-Registrar)',
                    en: 'Supervisor / Sub-Registrar',
                    desc_bn: 'চূড়ান্ত রায় ও রেজিস্ট্রি নিষ্পত্তির এখতিয়ার'
                  },
                  {
                    id: 'demo_admin',
                    bn: 'সিস্টেম অ্যাডমিন (System Administrator)',
                    en: 'System Administrator',
                    desc_bn: 'রুল কনফিগারেশন ও ডাটাবেজ পুনঃবীজকরণ'
                  }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleChange(r.id)}
                    disabled={isSwitchingRole}
                    className={`text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all min-h-[52px] touch-target cursor-pointer ${
                      selectedRole === r.id
                        ? 'border-[var(--brand-accent)] bg-[var(--accent-light)] font-bold text-[var(--text-primary)] ring-1 ring-[var(--brand-accent)]/30 shadow-xs'
                        : 'border-[var(--border-color)] hover:bg-[var(--bg-surface-soft)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{language === 'bn' ? r.bn : r.en}</span>
                      {selectedRole === r.id && (
                        <span className="text-[10px] bg-[var(--brand-accent)] text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-normal text-[var(--text-secondary)] mt-1">{r.desc_bn}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: UI Preferences & Localization */}
          <div className="bg-[var(--bg-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--border-color)] shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
              <Sliders className="w-5 h-5 text-[var(--brand-accent)]" />
              <span>{language === 'bn' ? 'ইন্টারফেস পছন্দসমূহ' : 'Interface Preferences'}</span>
            </h2>

            {/* Language Switcher */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block text-[var(--text-primary)]">
                    {language === 'bn' ? 'পণ্য ইন্টারফেস ভাষা' : 'Interface Language'}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {language === 'bn' ? 'বাংলা ডিফল্ট (প্রথম ভাষা)' : 'Bangla is default primary language'}
                  </span>
                </div>
              </div>
              <PremiumLanguageToggle />
            </div>

            {/* Theme Toggle */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-[var(--brand-accent)] shrink-0" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <div>
                  <span className="font-bold text-xs sm:text-sm block text-[var(--text-primary)]">
                    {language === 'bn' ? 'ভিজ্যুয়াল থিম' : 'Color Theme'}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {language === 'bn' ? 'লাইট মোড (ডিফল্ট) বনাম ডার্ক মোড' : 'Light mode (default) vs Dark mode'}
                  </span>
                </div>
              </div>
              <PremiumThemeToggle />
            </div>

            {/* Palette Specs */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)]/60 border border-[var(--border-color)] space-y-1 text-xs text-[var(--text-secondary)]">
              <div className="font-bold text-[var(--text-primary)]">
                {language === 'bn' ? 'ব্র্যান্ড রঙ স্পেসিফিকেশন (প্যারট ও ক্রিম):' : 'Brand Palette Standards (Parrot & Cream):'}
              </div>
              <div>• Parrot Primary: <span className="font-mono text-[var(--text-primary)]">#15803D / #1EA955</span></div>
              <div>• Cream Surface & Canvas: <span className="font-mono text-[var(--text-primary)]">#FAF8F5 / #F3EFE6</span></div>
              <div>• Obsidian Forest Dark: <span className="font-mono text-[var(--text-primary)]">#0C130E / #121E16</span></div>
            </div>
          </div>
        </div>

        {/* Section 3: Architecture & System Diagnostics */}
        <div className="bg-[var(--bg-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--border-color)] shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <Database className="w-5 h-5 text-[var(--brand-accent)]" />
            <span>{language === 'bn' ? 'সিস্টেম আর্কিটেকচার ও ডেটা সংযোগ' : 'System Architecture & Data Connection'}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold block">
                {language === 'bn' ? 'ডাটাবেজ ইঞ্জিন' : 'Database Engine'}
              </span>
              <p className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">PostgreSQL / SQLite Dual-Mode</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'স্থানীয় ডেটা সংযোগ সক্রিয়' : 'Connected (Healthy)'}</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold block">
                {language === 'bn' ? 'রুল ইঞ্জিন ক্যাটালগ' : 'Rule Engine Catalog'}
              </span>
              <p className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">12 Deterministic Rules (D001-X001)</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ক্যাটালগ এনরোল্ড' : 'All Rules Active'}</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold block">
                {language === 'bn' ? 'মালিকানা গ্রাফ বিশ্লেষক' : 'Ownership Graph Analyzer'}
              </span>
              <p className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">NetworkX Directed Multigraph</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'দ্বৈত বিক্রি ট্র্যাকিং প্রস্তুত' : 'Cycle & Conflict Ready'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Maintenance & Demo Reset */}
        <div className="bg-[var(--bg-surface)] rounded-2xl p-5 sm:p-6 border border-amber-500/30 dark:border-amber-500/20 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'bn' ? 'ডেমো ডেটা রিসেট ও রক্ষণাবেক্ষণ' : 'Demo Data Maintenance'}</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
                {language === 'bn'
                  ? 'হ্যাকার্থন বা ডেমো উপস্থাপনার সুবিধার্থে সমস্ত কেস, অসঙ্গতি সংকেত এবং ফিল্ড এডিটকে প্রারম্ভিক সিন্থেটিক ৮টি কেসে ফিরিয়ে আনুন।'
                  : 'Re-seed database to clean baseline with 8 pre-configured scenarios including clean transfer, broken chain, double-sale, and altered copy.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReseed}
              disabled={reseedLoading}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all min-h-[44px] touch-target cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${reseedLoading ? 'animate-spin' : ''}`} />
              <span>{language === 'bn' ? 'ডেমো ডেটা রিসেট করুন' : 'Reset Demo Data'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
