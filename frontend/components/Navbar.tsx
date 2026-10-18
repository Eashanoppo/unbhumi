'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage, DICTIONARY } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { api, User } from '@/lib/api';
import {
  FileText, Plus, ShieldCheck, Sun, Moon, Globe, Settings,
  Menu, X, AlertTriangle, Layers, BookOpen, LogOut,
  ChevronRight, ChevronDown, Zap, Info, User as UserIcon, Activity
} from 'lucide-react';
import { PremiumLanguageToggle, PremiumThemeToggle } from '@/components/PremiumToggles';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'investigations' | 'reports' | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(api.getCurrentUser());
    setOpenDropdown(null);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Safe translation helper ensuring SSR and initial hydration always match Bangla defaults
  const safeT = (key: string) => {
    if (!mounted) {
      return DICTIONARY[key]?.bn || key;
    }
    return t(key);
  };

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Keep Render server live (pings /api/v1/health/ every 8 minutes)
  useEffect(() => {
    const pingServer = async () => {
      try {
        await api.getHealth();
      } catch {
        // Silent catch for background heartbeat
      }
    };
    pingServer();
    const interval = setInterval(pingServer, 8 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  // Submenu items
  const investigationSubmenu = [
    {
      href: '/cases',
      title: safeT('nav_cases'),
      desc: safeT('nav_cases_desc'),
      icon: ShieldCheck,
      badge: 'Database'
    },
    {
      href: '/review-queue',
      title: safeT('nav_alerts'),
      desc: safeT('nav_alerts_desc'),
      icon: AlertTriangle,
      badge: 'Action'
    },
    {
      href: '/ownership-graph',
      title: safeT('nav_graph'),
      desc: safeT('nav_graph_desc'),
      icon: Activity,
      badge: 'Network'
    }
  ];

  const resourcesSubmenu = [
    {
      href: '/documents',
      title: safeT('nav_documents'),
      desc: language === 'bn' ? 'ডিজিটাল দলিলের ক্রিপ্টোগ্রাফিক ভল্ট' : 'Cryptographic Document Registry',
      icon: FileText
    },
    {
      href: '/reports',
      title: safeT('nav_reports'),
      desc: safeT('nav_reports_desc'),
      icon: FileText
    },
    {
      href: '/methodology',
      title: safeT('nav_methodology'),
      desc: safeT('nav_methodology_desc'),
      icon: BookOpen
    },
    {
      href: '/about',
      title: safeT('nav_about'),
      desc: safeT('nav_about_desc'),
      icon: Info
    }
  ];

  const isInvestigationActive = ['/cases', '/review-queue', '/ownership-graph'].some((p) =>
    pathname.startsWith(p)
  );

  const isResourcesActive = ['/documents', '/reports', '/methodology', '/about'].some((p) =>
    pathname.startsWith(p)
  );

  return (
    <>
      <header
        ref={navRef}
        suppressHydrationWarning
        className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 1. Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="UNBhumi Home">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-surface-soft)] shadow-xs transition-transform group-hover:scale-105 relative flex items-center justify-center p-1">
                <Image
                  src="/images/brand/logo.png"
                  alt="UNBHUMI Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <span suppressHydrationWarning className="font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-primary)] block leading-none">
                  {safeT('brand_title')}
                </span>
                <span suppressHydrationWarning className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase block mt-1">
                  UNBUmi Detector • AI LandGuard
                </span>
              </div>
            </Link>

            {/* 2. Desktop Navigation with Clean Submenus */}
            <nav className="hidden lg:flex items-center gap-1.5" suppressHydrationWarning aria-label="Main Navigation">
              {/* Direct Link: Dashboard */}
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${pathname === '/dashboard' ? 'text-[var(--brand-accent)]' : 'opacity-70'}`} />
                <span suppressHydrationWarning>{safeT('nav_overview')}</span>
              </Link>

              {/* Direct Link: Interactive Demo */}
              <Link
                href="/demo"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname === '/demo'
                    ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--brand-accent)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                <span suppressHydrationWarning>{safeT('nav_demo')}</span>
              </Link>

              {/* Submenu Dropdown 1: Investigations & Analysis */}
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openDropdown === 'investigations'}
                  onClick={() => setOpenDropdown(openDropdown === 'investigations' ? null : 'investigations')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isInvestigationActive || openDropdown === 'investigations'
                      ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-xs font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isInvestigationActive ? 'text-[var(--brand-accent)]' : 'opacity-70'}`} />
                  <span suppressHydrationWarning>{safeT('nav_investigations')}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'investigations' ? 'rotate-180 text-[var(--brand-accent)]' : 'opacity-60'}`} />
                </button>

                {/* Investigations Popover Menu */}
                {openDropdown === 'investigations' && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 slide-in-from-top-1 z-50">
                    <div className="px-3 py-1.5 border-b border-[var(--border-color)]/60 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      {language === 'bn' ? 'অনুসন্ধান ও সিদ্ধান্ত মডিউল' : 'Investigation Modules'}
                    </div>
                    <div className="space-y-1 mt-1">
                      {investigationSubmenu.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                              isActive
                                ? 'bg-[var(--accent-light)] text-[var(--text-primary)] font-bold'
                                : 'hover:bg-[var(--bg-surface-soft)] text-[var(--text-primary)]'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--brand-accent)]">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 truncate">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--text-primary)]">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--text-secondary)]">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Submenu Dropdown 2: Reports & Knowledge */}
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openDropdown === 'reports'}
                  onClick={() => setOpenDropdown(openDropdown === 'reports' ? null : 'reports')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isResourcesActive || openDropdown === 'reports'
                      ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-xs font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
                  }`}
                >
                  <BookOpen className={`w-3.5 h-3.5 ${isResourcesActive ? 'text-[var(--brand-accent)]' : 'opacity-70'}`} />
                  <span suppressHydrationWarning>{safeT('nav_resources')}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'reports' ? 'rotate-180 text-[var(--brand-accent)]' : 'opacity-60'}`} />
                </button>

                {/* Reports Popover Menu */}
                {openDropdown === 'reports' && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 slide-in-from-top-1 z-50">
                    <div className="px-3 py-1.5 border-b border-[var(--border-color)]/60 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      {language === 'bn' ? 'নথি ও কারিগরি নির্দেশিকা' : 'Reports & Governance'}
                    </div>
                    <div className="space-y-1 mt-1">
                      {resourcesSubmenu.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                              isActive
                                ? 'bg-[var(--accent-light)] text-[var(--text-primary)] font-bold'
                                : 'hover:bg-[var(--bg-surface-soft)] text-[var(--text-primary)]'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--brand-accent)]">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 truncate">
                              <span className="text-xs font-bold text-[var(--text-primary)] block">
                                {item.title}
                              </span>
                              <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* 3. Actions & Utilities */}
            <div className="hidden sm:flex items-center gap-2 xl:gap-2.5 shrink-0">
              {/* Primary Action CTA: New Investigation */}
              <Link
                href="/documents/new"
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-xs hover:shadow active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span suppressHydrationWarning>
                  {mounted && language === 'en' ? 'New Case' : 'নতুন অনুসন্ধান'}
                </span>
              </Link>

              {/* Premium Language Switcher */}
              <PremiumLanguageToggle />

              {/* Premium Theme Switcher */}
              <PremiumThemeToggle />

              {/* User profile / Login */}
              {currentUser ? (
                <div className="relative pl-1 border-l border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                    aria-label="User Account Menu"
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-accent)] transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[var(--brand-accent)] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                      {(currentUser.profile?.full_name_bn || currentUser.username || 'U')[0].toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate hidden xl:inline">
                      {currentUser.profile?.full_name_bn || currentUser.username}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 slide-in-from-top-1 z-50">
                      <div className="px-3 py-2 border-b border-[var(--border-color)]">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {currentUser.profile?.full_name_bn || currentUser.username}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono truncate">
                          {currentUser.email || 'reviewer@unbhumi.gov.bd'}
                        </p>
                      </div>

                      <div className="py-1 space-y-0.5">
                        <Link
                          href="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          <span suppressHydrationWarning>{mounted && language === 'en' ? 'Settings & Profile' : 'সেটিংস ও প্রোফাইল'}</span>
                        </Link>
                        <button
                          onClick={() => {
                            api.logout();
                            setCurrentUser(null);
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span suppressHydrationWarning>{safeT('nav_logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] transition-colors shadow-2xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span suppressHydrationWarning>{safeT('nav_login')}</span>
                </Link>
              )}
            </div>

            {/* 4. Mobile header controls (with 44px min touch targets) */}
            <div className="flex sm:hidden items-center gap-2">
              <PremiumLanguageToggle compact />
              <PremiumThemeToggle compact />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile drawer"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 border border-[var(--border-color)] bg-[var(--bg-surface-soft)] rounded-xl text-[var(--text-primary)]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 5. Mobile Drawer Panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
            {/* Mobile Primary CTA */}
            <Link
              href="/documents/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 rounded-xl font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span suppressHydrationWarning>{safeT('cta_verify')}</span>
            </Link>

            {/* Top Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] p-2.5 rounded-xl text-xs font-bold border ${
                  pathname === '/dashboard'
                    ? 'border-[var(--brand-accent)] bg-[var(--accent-light)] text-[var(--text-primary)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                <span suppressHydrationWarning>{safeT('nav_overview')}</span>
              </Link>

              <Link
                href="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] p-2.5 rounded-xl text-xs font-bold border ${
                  pathname === '/demo'
                    ? 'border-[var(--brand-accent)] bg-[var(--accent-light)] text-[var(--text-primary)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                <span suppressHydrationWarning>{safeT('nav_demo')}</span>
              </Link>
            </div>

            {/* Group 1: Investigations */}
            <div className="pt-2">
              <span suppressHydrationWarning className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block px-1 mb-1.5">
                {safeT('nav_investigations')}
              </span>
              <div className="space-y-1">
                {investigationSubmenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between min-h-[44px] p-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-[var(--accent-light)] text-[var(--text-primary)] font-bold border border-[var(--border-color)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[var(--brand-accent)]" />
                        <span suppressHydrationWarning>{item.title}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Group 2: Reports & Knowledge */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <span suppressHydrationWarning className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block px-1 mb-1.5">
                {safeT('nav_resources')}
              </span>
              <div className="space-y-1">
                {resourcesSubmenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between min-h-[44px] p-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-[var(--accent-light)] text-[var(--text-primary)] font-bold border border-[var(--border-color)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[var(--brand-accent)]" />
                        <span suppressHydrationWarning>{item.title}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom user section */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              {currentUser ? (
                <div className="space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between min-h-[44px] p-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-soft)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 opacity-70" />
                      <span suppressHydrationWarning>{safeT('nav_settings')}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--brand-accent)]">
                      {currentUser.profile?.full_name_bn || currentUser.username}
                    </span>
                  </Link>
                  <button
                    onClick={() => { api.logout(); setCurrentUser(null); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-between min-h-[44px] p-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4" />
                      <span suppressHydrationWarning>{safeT('nav_logout')}</span>
                    </div>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 min-h-[44px] p-2.5 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]"
                >
                  <UserIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span suppressHydrationWarning>{safeT('nav_login')}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 6. Persistent Mobile Bottom Navigation Bar (WCAG 2.2 touch targets, 5 core destinations) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md shadow-lg transition-colors duration-200"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* Item 1: Overview */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] px-1 transition-colors ${
              pathname === '/dashboard'
                ? 'text-[var(--brand-accent)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Layers className={`w-5 h-5 ${pathname === '/dashboard' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span suppressHydrationWarning className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">
              {safeT('nav_dashboard')}
            </span>
          </Link>

          {/* Item 2: Cases */}
          <Link
            href="/cases"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] px-1 transition-colors ${
              pathname.startsWith('/cases')
                ? 'text-[var(--brand-accent)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${pathname.startsWith('/cases') ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span suppressHydrationWarning className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">
              {safeT('nav_cases')}
            </span>
          </Link>

          {/* Item 3: Center Elevated Verify CTA */}
          <Link
            href="/documents/new"
            aria-label={safeT('cta_verify')}
            className="flex flex-col items-center justify-center h-full min-h-[44px] px-1 group -mt-3"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] flex items-center justify-center shadow-md active:scale-95 transition-transform">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span suppressHydrationWarning className="text-[10px] font-bold text-[var(--brand-accent)] mt-0.5 tracking-tight truncate max-w-[56px]">
              {safeT('cta_verify')}
            </span>
          </Link>

          {/* Item 4: Alerts / Queue */}
          <Link
            href="/review-queue"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] px-1 transition-colors ${
              pathname.startsWith('/review-queue')
                ? 'text-[var(--brand-accent)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 ${pathname.startsWith('/review-queue') ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span suppressHydrationWarning className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">
              {safeT('nav_alerts')}
            </span>
          </Link>

          {/* Item 5: Interactive Demo */}
          <Link
            href="/demo"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] px-1 transition-colors ${
              pathname.startsWith('/demo')
                ? 'text-[var(--brand-accent)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Zap className={`w-5 h-5 ${pathname.startsWith('/demo') ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span suppressHydrationWarning className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">
              {safeT('nav_demo')}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
};
