'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import { ShieldCheck, UserCheck, Key, ArrowRight, Info, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'demo_reviewer' | 'demo_supervisor' | 'demo_admin'>('demo_reviewer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const demoRoles = [
    {
      id: 'demo_reviewer',
      title_bn: 'দলিল পরীক্ষক (Document Reviewer)',
      title_en: 'Document Reviewer',
      email: 'reviewer@unleft.org',
      desc_bn: 'কেস ও দলিল আপলোড, ওসিআর তথ্য সংশোধন, অসঙ্গতি পর্যালোচনা ও সিদ্ধান্ত গ্রহণ।'
    },
    {
      id: 'demo_supervisor',
      title_bn: 'সাব-রেজিস্ট্রার / সুপারভাইজার',
      title_en: 'Supervisor / Sub-Registrar',
      email: 'supervisor@unleft.org',
      desc_bn: 'উচ্চ ঝুঁকির কেস চূড়ান্ত অনুমোদন, রিপোর্ট অনুমোদন ও রেজিস্ট্রি নির্দেশনা।'
    },
    {
      id: 'demo_admin',
      title_bn: 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
      title_en: 'System Administrator',
      email: 'admin@unleft.org',
      desc_bn: 'রুল ইঞ্জিনের ক্যাটালগ কনফিগারেশন, অডিট লগ পর্যবেক্ষণ ও ডেমো ডাটাবেস রিসেট।'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await api.demoLogin(selectedRole);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'লগইন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-deep)] mx-auto flex items-center justify-center text-[#7ED957] mb-3 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {language === 'bn' ? 'ডেমো লগইন প্ল্যাটফর্ম' : 'Demo Authentication'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === 'bn'
              ? 'হ্যাকাতন পরীক্ষণের জন্য নিম্নের যেকোনো একটি সংরক্ষিত ভূমিকা নির্বাচন করে প্রবেশ করুন।'
              : 'Select a seeded demo role to test the full verification and review workflow.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Role Selector Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {language === 'bn' ? 'ব্যবহারকারীর ভূমিকা নির্বাচন' : 'Select User Role'}
          </label>

          <div className="space-y-2.5">
            {demoRoles.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[var(--accent-deep)] bg-[var(--bg-surface-soft)] shadow-sm'
                      : 'border-[var(--border-color)] hover:border-gray-300 bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[var(--text-primary)]">
                      {role.title_bn}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {role.email}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {role.desc_bn}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--accent-deep)] text-[#FFF8E7] hover:bg-[var(--accent-deep)]/90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{loading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করে ড্যাশবোর্ডে প্রবেশ করুন'}</span>
              <ArrowRight className="w-4 h-4 text-[#7ED957]" />
            </button>
          </div>
        </form>

        {/* Security & Google OAuth note */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] text-[11px] space-y-1 text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Lock className="w-3.5 h-3.5 text-[var(--accent-deep)] dark:text-[#7ED957]" />
            <span>নিরাপত্তা ও ভবিষ্যৎ ইন্টিগ্রেশন</span>
          </div>
          <p>
            এমভিপি সংস্করণে ব্যাকএন্ডের সিকিউর টোকেন ভিত্তিক অথেনটিকেশন কার্যকর। পরবর্তী ধাপে প্রাতিষ্ঠানিক Google OAuth 2.0 / OpenID Connect সংযোগের আর্কিটেকচার সংরক্ষিত রয়েছে।
          </p>
        </div>
      </div>
    </div>
  );
}
