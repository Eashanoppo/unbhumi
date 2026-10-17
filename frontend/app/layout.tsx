import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'আনভূমি ডিটেক্টর — UNBUmi Detector | AI Land Fraud & Double-Selling Prevention Platform',
  description: 'AI-assisted land document and title verification platform for Bangladesh. Detects double-selling, broken ownership chains, and deed-khatian inconsistencies with traceable evidence.',
  keywords: ['LandTech', 'Bangladesh Land Verification', 'Deed Verification', 'দলিল যাচাই', 'খতিয়ান', 'Double Selling Detection'],
};

import { Suspense } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen antialiased selection:bg-[#15803D]/20 selection:text-[#15803D]">
        <ThemeProvider>
          <LanguageProvider>
            <Suspense fallback={<div className="h-16 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface)]" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 w-full">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
