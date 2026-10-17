'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { api, User } from '@/lib/api';
import {
  FileText, PlusCircle, ShieldCheck, Sun, Moon, Globe, Settings,
  Menu, X, GitFork, AlertTriangle, Layers, BookOpen, LogIn, LogOut,
  ChevronRight, Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(api.getCurrentUser());
  }, [pathname]);

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

  const navLinks = [
    { href: '/dashboard', label: t('nav_overview'), icon: Layers },
    { href: '/cases', label: t('nav_cases'), icon: ShieldCheck },
    { href: '/review-queue', label: t('nav_alerts'), icon: AlertTriangle },
    { href: '/ownership-graph', label: t('nav_graph'), icon: GitFork },
    { href: '/reports', label: t('nav_reports'), icon: FileText },
    { href: '/methodology', label: t('nav_methodology'), icon: BookOpen },
  ];

  return (
    <header suppressHydrationWarning className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand-accent)] text-[#0B1B28] dark:text-[#0B1116] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--brand-accent)] dark:text-[var(--brand-accent)]' : 'opacity-70'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* New Investigation Primary Action CTA */}
            <Link
              href="/documents/new"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-sm hover:shadow active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('cta_verify')}</span>
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
                  title={t('nav_logout')}
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
                <span>{t('nav_login')}</span>
              </Link>
            )}
          </div>

          {/* Mobile menu trigger button */}
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
              className="p-1.5 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] border border-[var(--border-color)]"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 pt-3 pb-6 space-y-2.5 shadow-xl animate-in slide-in-from-top-2">
          {/* Mobile Primary CTA */}
          <Link
            href="/documents/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] shadow-sm mb-3"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>{t('cta_verify')}</span>
          </Link>

          {/* Navigation items */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-light)] text-[var(--text-primary)] font-bold border border-[var(--border-color)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--brand-accent)]' : 'opacity-70'}`} />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              );
            })}
          </div>

          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              pathname === '/settings'
                ? 'bg-[var(--accent-light)] text-[var(--text-primary)] font-bold border border-[var(--border-color)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 opacity-70" />
              <span>{language === 'bn' ? 'সেটিংস ও প্রোফাইল' : 'Settings & Profile'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          </Link>

          {/* Mobile Footer Auth Section */}
          <div className="pt-3 border-t border-[var(--border-color)]">
            {currentUser ? (
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">
                    {currentUser.profile?.full_name_bn || currentUser.username}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {currentUser.profile?.role || 'Land Reviewer'}
                  </span>
                </div>
                <button
                  onClick={() => { api.logout(); setCurrentUser(null); setMobileMenuOpen(false); }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30"
                >
                  {t('nav_logout')}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('nav_login')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
