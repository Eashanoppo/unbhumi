import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Suspense } from 'react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0F15' },
  ],
};

export const metadata: Metadata = {
  title: 'আনভূমি ডিটেক্টর — UNBUmi Detector | AI Land Fraud & Double-Selling Prevention Platform',
  description: 'AI-assisted land document and title verification platform for Bangladesh. Detects double-selling, broken ownership chains, and deed-khatian inconsistencies with traceable evidence.',
  keywords: ['LandTech', 'Bangladesh Land Verification', 'Deed Verification', 'দলিল যাচাই', 'খতিয়ান', 'Double Selling Detection', 'UNLEFT LandGuard'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

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
            <main className="flex-1 w-full pb-20 lg:pb-0">
              {children}
            </main>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
