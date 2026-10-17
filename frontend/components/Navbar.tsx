'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { api, User } from '@/lib/api';
import {
  FileText, PlusCircle, ShieldCheck, Sun, Moon, Globe, Settings,
  Menu, X, GitFork, AlertTriangle, Layers, BookOpen, LogIn, LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(api.getCurrentUser());
  }, [pathname]);

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const navLinks = [
    { href: '/dashboard', label: t('nav_dashboard'), icon: Layers },
    { href: '/cases', label: t('nav_cases'), icon: ShieldCheck },
    { href: '/documents', label: t('nav_documents'), icon: FileText },
    { href: '/review-queue', label: t('nav_queue'), icon: AlertTriangle },
    { href: '/ownership-graph', label: t('nav_graph'), icon: GitFork },
    { href: '/methodology', label: t('nav_methodology'), icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-deep)] flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-[#7ED957]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[var(--accent-deep)] dark:text-[#7ED957] block leading-none">
                {language === 'bn' ? 'আনভূমি ডিটেক্টর' : 'UNBUmi Detector'}
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase">
                UNLEFT LandGuard
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="hidden sm:flex items-center gap-2">
            {/* New Analysis Primary CTA */}
            <Link
              href="/documents/new"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-[var(--accent-deep)] text-[#FFF8E7] hover:bg-[var(--accent-deep)]/90 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#7ED957]" />
              <span>{t('cta_verify')}</span>
            </Link>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--accent-deep)]" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* User profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
                <Link
                  href="/settings"
                  title="প্রোফাইল ও সেটিংস"
                  className="text-xs px-2 py-1 rounded bg-[var(--accent-parrot)]/20 text-[var(--accent-deep)] dark:text-[#7ED957] font-medium max-w-[120px] truncate hover:opacity-80 transition-opacity"
                >
                  {currentUser.profile?.full_name_bn || currentUser.username}
                </Link>
                <Link
                  href="/settings"
                  title={language === 'bn' ? 'সেটিংস' : 'Settings'}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => { api.logout(); setCurrentUser(null); }}
                  title="লগআউট"
                  className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 rounded"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-surface-soft)]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('nav_login')}</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 text-xs font-bold border border-[var(--border-color)] rounded"
            >
              {language === 'bn' ? 'EN' : 'বাং'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 border border-[var(--border-color)] rounded"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/documents/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold bg-[var(--accent-deep)] text-[#FFF8E7] mb-3"
          >
            <PlusCircle className="w-4 h-4 text-[#7ED957]" />
            <span>{t('cta_verify')}</span>
          </Link>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base ${
                  isActive
                    ? 'bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] font-bold'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="w-5 h-5 opacity-80" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base ${
              pathname === '/settings'
                ? 'bg-[var(--bg-surface-soft)] text-[var(--accent-deep)] dark:text-[#7ED957] font-bold'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            <Settings className="w-5 h-5 opacity-80" />
            <span>{language === 'bn' ? 'সেটিংস ও প্রোফাইল' : 'Settings & Profile'}</span>
          </Link>

          <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium">
                  {currentUser.profile?.full_name_bn || currentUser.username}
                </span>
                <button
                  onClick={() => { api.logout(); setCurrentUser(null); setMobileMenuOpen(false); }}
                  className="text-xs text-red-600 font-semibold"
                >
                  {t('nav_logout')}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[var(--accent-deep)] dark:text-[#7ED957]"
              >
                {t('nav_login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
