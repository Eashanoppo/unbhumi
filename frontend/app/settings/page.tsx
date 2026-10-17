'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { api, User } from '@/lib/api';
import {
  Settings, User as UserIcon, Shield, Sliders, Database,
  RefreshCw, CheckCircle2, Moon, Sun, Globe, AlertTriangle
} from 'lucide-react';

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
    <div className="min-h-screen bg-cream-50 text-cream-900 transition-colors duration-200">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
            <Settings className="w-8 h-8 text-parrot-600" />
            {language === 'bn' ? 'সিস্টেম ও ব্যবহারকারী সেটিংস' : 'System & User Settings'}
          </h1>
          <p className="text-cream-600 text-sm mt-1">
            {language === 'bn'
              ? 'ইউজার প্রোফাইল, ডেমো ভূমিকা, ইন্টারফেস থিম এবং সিস্টেমের ডায়াগনস্টিক তথ্য পরিচালনা করুন।'
              : 'Manage user profiles, demo roles, UI preferences, and platform diagnostics.'}
          </p>
        </div>

        {/* Feedback Toast */}
        {toastMsg && (
          <div className="p-4 rounded-xl bg-parrot-100 border border-parrot-300 text-parrot-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-parrot-700 shrink-0" />
            <span className="font-medium text-sm">{toastMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: User Profile & Role Switcher */}
          <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-cream-900">
              <UserIcon className="w-5 h-5 text-parrot-600" />
              {language === 'bn' ? 'বর্তমান ব্যবহারকারী প্রোফাইল' : 'Active User Profile'}
            </h2>
            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-cream-600">{language === 'bn' ? 'পূর্ণ নাম:' : 'Full Name:'}</span>
                <span className="font-semibold text-cream-900">
                  {user?.profile?.full_name_bn || (language === 'bn' ? 'আব্দুল করিম (পরীক্ষক)' : 'Abdul Karim (Reviewer)')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cream-600">{language === 'bn' ? 'ইমেইল:' : 'Email:'}</span>
                <span className="font-mono text-xs text-cream-800">{user?.email || 'reviewer@unleft.org'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cream-600">{language === 'bn' ? 'সংস্থা:' : 'Organization:'}</span>
                <span className="text-cream-800">{user?.profile?.organization || 'ভূমি মন্ত্রণালয় (ডেমো)'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-cream-800 block">
                {language === 'bn' ? 'ডেমো ভূমিকা পরিবর্তন করুন:' : 'Switch Demo Role:'}
              </label>
              <div className="grid grid-cols-1 gap-2">
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
                    className={`text-left p-3 rounded-xl border text-sm transition-all ${
                      selectedRole === r.id
                        ? 'border-parrot-500 bg-parrot-50 font-bold text-parrot-900'
                        : 'border-cream-200 hover:bg-cream-100/50 text-cream-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{language === 'bn' ? r.bn : r.en}</span>
                      {selectedRole === r.id && (
                        <span className="text-xs bg-parrot-600 text-white px-2 py-0.5 rounded-full">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-normal text-cream-500 mt-1">{r.desc_bn}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: UI Preferences & Localization */}
          <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-cream-900">
              <Sliders className="w-5 h-5 text-parrot-600" />
              {language === 'bn' ? 'ইন্টারফেস পছন্দসমূহ' : 'Interface Preferences'}
            </h2>

            {/* Language Switcher */}
            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-cream-600" />
                <div>
                  <span className="font-semibold text-sm block text-cream-900">
                    {language === 'bn' ? 'পণ্য ইন্টারফেস ভাষা' : 'Interface Language'}
                  </span>
                  <span className="text-xs text-cream-500">
                    {language === 'bn' ? 'বাংলা ডিফল্ট (প্রথম ভাষা)' : 'Bangla is default primary language'}
                  </span>
                </div>
              </div>
              <div className="flex rounded-lg border border-cream-300 p-0.5 bg-cream-100">
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    language === 'bn' ? 'bg-parrot-600 text-white' : 'text-cream-700 hover:bg-cream-200'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    language === 'en' ? 'bg-parrot-600 text-white' : 'text-cream-700 hover:bg-cream-200'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-parrot-600" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <span className="font-semibold text-sm block text-cream-900">
                    {language === 'bn' ? 'ভিজ্যুয়াল থিম' : 'Color Theme'}
                  </span>
                  <span className="text-xs text-cream-500">
                    {language === 'bn' ? 'ক্রিম-হোয়াইট (ডিফল্ট) বনাম ডার্ক মোড' : 'Warm cream light mode vs Dark mode'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-lg border border-cream-300 text-xs font-bold hover:bg-cream-200 flex items-center gap-1.5 text-cream-800"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'bn' ? 'লাইট মোড' : 'Light Mode'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-cream-600" />
                    <span>{language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Palette Specs */}
            <div className="p-4 rounded-xl bg-cream-100/60 border border-cream-200 space-y-1 text-xs text-cream-700">
              <div className="font-bold text-cream-800">
                {language === 'bn' ? 'ব্র্যান্ড রঙ স্পেসিফিকেশন:' : 'Brand Palette Standards:'}
              </div>
              <div>• Parrot Green: <span className="font-mono">#7ED957</span> (Primary Accent)</div>
              <div>• Deep Leaf: <span className="font-mono">#286B35</span> (Deep Contrast)</div>
              <div>• Warm Cream: <span className="font-mono">#FFF8E7</span> (Surface Foundation)</div>
            </div>
          </div>
        </div>

        {/* Section 3: Architecture & System Diagnostics */}
        <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-cream-900">
            <Database className="w-5 h-5 text-parrot-600" />
            {language === 'bn' ? 'সিস্টেম আর্কিটেকচার ও ডেটা সংযোগ' : 'System Architecture & Data Connection'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
              <span className="text-xs text-cream-500 uppercase tracking-wide">
                {language === 'bn' ? 'ডাটাবেজ ইঞ্জিন' : 'Database Engine'}
              </span>
              <p className="font-bold text-sm text-cream-900">PostgreSQL / SQLite Dual-Mode</p>
              <p className="text-xs text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'bn' ? 'স্থানীয় ডেটা সংযোগ সক্রিয়' : 'Connected (Healthy)'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
              <span className="text-xs text-cream-500 uppercase tracking-wide">
                {language === 'bn' ? 'রুল ইঞ্জিন ক্যাটালগ' : 'Rule Engine Catalog'}
              </span>
              <p className="font-bold text-sm text-cream-900">12 Deterministic Rules (D001-X001)</p>
              <p className="text-xs text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'bn' ? 'ক্যাটালগ এনরোল্ড' : 'All Rules Active'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
              <span className="text-xs text-cream-500 uppercase tracking-wide">
                {language === 'bn' ? 'মালিকানা গ্রাফ বিশ্লেষক' : 'Ownership Graph Analyzer'}
              </span>
              <p className="font-bold text-sm text-cream-900">NetworkX Directed Multigraph</p>
              <p className="text-xs text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'bn' ? 'দ্বৈত বিক্রি ট্র্যাকিং প্রস্তুত' : 'Cycle & Conflict Ready'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Maintenance & Demo Reset */}
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                {language === 'bn' ? 'ডেমো ডেটা রিসেট ও রক্ষণাবেক্ষণ' : 'Demo Data Maintenance'}
              </h2>
              <p className="text-xs text-cream-600 max-w-xl">
                {language === 'bn'
                  ? 'হ্যাকার্থন বা ডেমো উপস্থাপনার সুবিধার্থে সমস্ত কেস, অসঙ্গতি সংকেত এবং ফিল্ড এডিটকে প্রারম্ভিক সিন্থেটিক ৮টি কেসে ফিরিয়ে আনুন।'
                  : 'Re-seed database to clean baseline with 8 pre-configured scenarios including clean transfer, broken chain, double-sale, and altered copy.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReseed}
              disabled={reseedLoading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${reseedLoading ? 'animate-spin' : ''}`} />
              {language === 'bn' ? 'ডেমো ডেটা রিসেট করুন' : 'Reset Demo Data'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
