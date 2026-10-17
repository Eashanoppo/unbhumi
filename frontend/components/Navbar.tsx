'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, DICTIONARY } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { api, User } from '@/lib/api';
import {
  FileText, PlusCircle, ShieldCheck, Sun, Moon, Globe, Settings,
  Menu, X, GitFork, AlertTriangle, Layers, BookOpen, LogIn, LogOut,
  ChevronRight, ChevronDown, Sparkles, Info
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'investigations' | 'reports' | null>(null);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(api.getCurrentUser());
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Safe translation helper ensuring SSR and initial hydration always match Bangla defaults
  const safeT = (key: string) => {
    if (!mounted) {
      return DICTIONARY[key]?.bn || key;
    }
    return t(key);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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
      icon: GitFork,
      badge: 'Network'
    }
  ];

  const resourcesSubmenu = [
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

  const isResourcesActive = ['/reports', '/methodology', '/about'].some((p) =>
    pathname.startsWith(p)
  );

  return (
    <header
      ref={navRef}
      suppressHydrationWarning
      className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 1. Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand-accent)] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <span suppressHydrationWarning className="font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-primary)] block leading-none">
                {mounted && language === 'en' ? 'UNLEFT LandGuard' : 'আনলেফট ল্যান্ডগার্ড'}
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase block mt-1">
                UNBUmi Detector • AI LandGuard
              </span>
            </div>
          </Link>

          {/* 2. Desktop Navigation with Clean Submenus */}
          {/* 2. Desktop Navigation with Clean Submenus */}
          <nav className="hidden lg:flex items-center gap-1.5" suppressHydrationWarning>
            {/* Direct Link: Dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                pathname === '/dashboard'
                  ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${pathname === '/dashboard' ? 'text-[var(--brand-accent)]' : 'opacity-70'}`} />
              <span suppressHydrationWarning>{safeT('nav_overview')}</span>
            </Link>

            {/* Direct Link: Interactive Demo */}
            <Link
              href="/demo"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pathname === '/demo'
                  ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--brand-accent)] shadow-xs ring-1 ring-[var(--brand-accent)]/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
              <span suppressHydrationWarning>{safeT('nav_demo')}</span>
              <span className="ml-1 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--brand-accent)] text-[var(--cta-text)] font-extrabold">
                P3
              </span>
            </Link>

            {/* Submenu Dropdown 1: Investigations & Analysis */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'investigations' ? null : 'investigations')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isInvestigationActive || openDropdown === 'investigations'
                    ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-xs'
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
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-soft)] text-[var(--text-secondary)]">
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
                onClick={() => setOpenDropdown(openDropdown === 'reports' ? null : 'reports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isResourcesActive || openDropdown === 'reports'
                    ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-xs'
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
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Primary Action CTA: New Investigation */}
            <Link
              href="/documents/new"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-sm hover:shadow active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span suppressHydrationWarning>{safeT('cta_verify')}</span>
            </Link>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span suppressHydrationWarning className="font-semibold">
                {mounted && language === 'bn' ? 'English' : 'বাংলা'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] transition-all cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Sun className="w-4 h-4 text-[var(--brand-accent)]" />
              )}
            </button>

            {/* User profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
                <Link
                  href="/settings"
                  title="প্রোফাইল ও সেটিংস"
                  className="text-xs px-2.5 py-1 rounded-lg bg-[var(--accent-light)] text-[var(--text-primary)] font-bold max-w-[130px] truncate border border-[var(--border-color)] hover:opacity-90 transition-opacity"
                >
                  {currentUser.profile?.full_name_bn || currentUser.username}
                </Link>
                <Link
                  href="/settings"
                  title={language === 'bn' ? 'সেটিংস' : 'Settings'}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => { api.logout(); setCurrentUser(null); }}
                  title={safeT('nav_logout')}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span suppressHydrationWarning>{safeT('nav_login')}</span>
              </Link>
            )}
          </div>

          {/* 4. Mobile menu trigger button */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              suppressHydrationWarning
              onClick={toggleLanguage}
              className="px-2 py-1 text-xs font-bold border border-[var(--border-color)] bg-[var(--bg-surface-soft)] rounded-lg text-[var(--text-primary)]"
            >
              {mounted && language === 'bn' ? 'EN' : 'বাং'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 border border-[var(--border-color)] bg-[var(--bg-surface-soft)] rounded-lg"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Sun className="w-4 h-4 text-[var(--brand-accent)]" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-[var(--border-color)] bg-[var(--bg-surface-soft)] rounded-xl text-[var(--text-primary)]"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Clean Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          {/* Mobile Primary CTA */}
          <Link
            href="/documents/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] shadow-sm"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span suppressHydrationWarning>{safeT('cta_verify')}</span>
          </Link>

          {/* Top Links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border ${
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
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border ${
                pathname === '/demo'
                  ? 'border-[var(--brand-accent)] bg-[var(--accent-light)] text-[var(--text-primary)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
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
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
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
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
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
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-soft)]"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 opacity-70" />
                <span suppressHydrationWarning>{safeT('nav_settings')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
