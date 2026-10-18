'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Globe, Check } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';

interface ToggleProps {
  compact?: boolean;
  className?: string;
}

/**
 * Premium segmented language toggle switch (Bangla / English)
 * Styled with warm cream and parrot green shaders.
 */
export const PremiumLanguageToggle: React.FC<ToggleProps> = ({ compact = false, className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isBn = !mounted || language === 'bn';

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`relative inline-flex items-center p-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface-soft)] shadow-inner transition-colors duration-200 select-none ${
        compact ? 'h-9' : 'h-10'
      } ${className}`}
    >
      {/* Sliding pill indicator */}
      <div
        className={`absolute top-1 bottom-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[0_2px_8px_rgba(21,128,61,0.12)] transition-all duration-300 ease-out pointer-events-none ${
          isBn
            ? compact
              ? 'left-1 w-[38px]'
              : 'left-1 w-[58px]'
            : compact
              ? 'left-[42px] w-[38px]'
              : 'left-[62px] w-[58px]'
        }`}
      />

      {/* Bangla Option */}
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        aria-pressed={isBn}
        className={`relative z-10 flex items-center justify-center font-bold transition-all duration-200 cursor-pointer rounded-full ${
          compact ? 'px-2.5 py-1 text-xs min-w-[38px]' : 'px-3 py-1.5 text-xs min-w-[58px]'
        } ${
          isBn
            ? 'text-[var(--brand-accent)] font-extrabold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
        }`}
      >
        <span>{compact ? 'বাং' : 'বাংলা'}</span>
      </button>

      {/* English Option */}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={!isBn}
        className={`relative z-10 flex items-center justify-center font-bold transition-all duration-200 cursor-pointer rounded-full ${
          compact ? 'px-2.5 py-1 text-xs min-w-[38px]' : 'px-3 py-1.5 text-xs min-w-[58px]'
        } ${
          !isBn
            ? 'text-[var(--brand-accent)] font-extrabold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
        }`}
      >
        <span>{compact ? 'EN' : 'Eng'}</span>
      </button>
    </div>
  );
};

/**
 * Premium Theme Toggle Switch (Dark / Light)
 * Styled with warm cream and parrot green shaders with smooth sliding motion.
 */
export const PremiumThemeToggle: React.FC<ToggleProps> = ({ compact = false, className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDark}
      className={`relative inline-flex items-center rounded-full border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-1 transition-all duration-300 shadow-inner cursor-pointer hover:border-[var(--brand-accent)] active:scale-95 ${
        compact ? 'w-[68px] h-9' : 'w-[78px] h-10'
      } ${className}`}
    >
      {/* Background Icons */}
      <div className="w-full flex items-center justify-between px-1.5 pointer-events-none text-[var(--text-muted)]">
        <Sun className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${!isDark ? 'text-amber-500 opacity-20' : 'opacity-40'}`} />
        <Moon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${isDark ? 'text-[var(--brand-accent)] opacity-20' : 'opacity-40'}`} />
      </div>

      {/* Sliding Thumb Pill */}
      <div
        className={`absolute top-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[0_2px_10px_rgba(21,128,61,0.18)] flex items-center justify-center transition-all duration-300 ease-out ${
          compact ? 'w-7 h-7' : 'w-8 h-8'
        } ${
          isDark
            ? compact
              ? 'left-[36px] bg-[var(--bg-surface-soft)]'
              : 'left-[42px] bg-[var(--bg-surface-soft)]'
            : 'left-1'
        }`}
      >
        {isDark ? (
          <Moon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[var(--brand-accent)] fill-[var(--brand-accent)]/20 animate-in spin-in-180 duration-300`} />
        ) : (
          <Sun className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-500 fill-amber-500/20 animate-in spin-in-180 duration-300`} />
        )}
      </div>
    </button>
  );
};
