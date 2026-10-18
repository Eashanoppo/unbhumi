'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Shield, ShieldCheck, AlertTriangle, AlertCircle,
  Check, Info, Hash, Scan, Eye, Play, Pause, RefreshCw,
  MapPin, Calendar, User, Scale, Clock, ExternalLink,
  Layers, CheckSquare, Zap, Activity
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { DemoDocumentFixture } from '@/app/demo/page';

interface DocumentGenuineViewerProps {
  doc: DemoDocumentFixture;
  isScanningDefault?: boolean;
}

export const DocumentGenuineViewer: React.FC<DocumentGenuineViewerProps> = ({
  doc,
  isScanningDefault = true,
}) => {
  const { language, formatNumber } = useLanguage();
  const [isScanning, setIsScanning] = useState(isScanningDefault);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [scanProgress, setScanProgress] = useState(65);
  const [humanVerifiedDag, setHumanVerifiedDag] = useState(doc.dagNumber);
  const [humanConfirmed, setHumanConfirmed] = useState(false);

  // Scan progress cycle simulation
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 10 : prev + 15));
    }, 450);
    return () => clearInterval(interval);
  }, [isScanning]);

  const isBn = language === 'bn';

  // 6 Core Mandatory Document Metadata & Detection Capabilities
  const getDocTypeMetadata = () => {
    switch (doc.type) {
      case 'deed':
        return {
          titleBn: '১. নিবন্ধিত সাফ-কবলা দলিল (Registered Deed)',
          titleEn: '1. Registered Title Deed',
          purposeBn: 'জমি কীভাবে হস্তান্তর হয়েছে, দলিল নম্বর, তারিখ, ক্রেতা-বিক্রেতা বিবরণ এবং জমির তফসিল যাচাইকরণ।',
          purposeEn: 'Verify how land was transferred, deed number, date, buyer-seller details, and land schedule.',
          detectsBn: 'ভুয়া/জাল দলিল এবং দ্বৈত বিক্রয় সংক্রান্ত ঝুঁকি (P2/P3)।',
          detectsEn: 'Detects fake deeds and duplicate selling risks (P2/P3).',
          badgeColor: 'border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
        };
      case 'baya_deed':
        return {
          titleBn: '২. পূর্ববর্তী দলিল / বায়া দলিল (Previous Baya Deed)',
          titleEn: '2. Previous Deeds / Baya Chain Deed',
          purposeBn: 'মালিকানা হস্তান্তরের ঐতিহাসিক চেইন ও ধারাবাহিকতা যাচাইকরণ।',
          purposeEn: 'Verify historical ownership chain and title transfer lineage.',
          detectsBn: 'মালিকানা ইতিহাসের অসঙ্গতি এবং বিচ্ছিন্ন বা সন্দেহজনক হস্তান্তর (P2/P3)।',
          detectsEn: 'Detects ownership history gaps and suspicious transfers (P2/P3).',
          badgeColor: 'border-amber-600/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
        };
      case 'khatian':
        return {
          titleBn: `৩. সর্বশেষ খতিয়ান (${doc.khatianType || 'RS'} Record of Rights)`,
          titleEn: `3. Latest Khatian (${doc.khatianType || 'RS'} Survey Record)`,
          purposeBn: 'সরকারি নথিতে বর্তমান মালিকের নাম, খতিয়ান নম্বর, দাগ নম্বর এবং অনুমোদিত জমির পরিমাণ যাচাই।',
          purposeEn: 'Verify current owner name, khatian number, dag number, and land area in government records.',
          detectsBn: 'দলিল বনাম সরকারি ভূমি রেকর্ডের অসঙ্গতি ও স্বত্বহীন বিক্রি (P2/P3)।',
          detectsEn: 'Detects mismatches between deed and government land records (P2/P3).',
          badgeColor: 'border-blue-600/30 bg-blue-500/10 text-blue-800 dark:text-blue-300',
        };
      case 'mutation':
        return {
          titleBn: '৪. নামজারি খতিয়ান ও ডিসিআর (Mutation Khatian & DCR)',
          titleEn: '4. Mutation Khatian & DCR Record',
          purposeBn: 'হস্তান্তরের পর সরকারি ভূমি রেকর্ডে মালিকানা পরিবর্তন প্রতিফলিত হয়েছে কিনা তা যাচাইকরণ।',
          purposeEn: 'Verify if ownership change is officially reflected in revenue records after transfer.',
          detectsBn: 'দলিল নিবন্ধন বনাম নামজারি খতিয়ানের গরমিল ও খারিজহীন হস্তান্তর (P3)।',
          detectsEn: 'Detects mismatches between deed registration and mutation records (P3).',
          badgeColor: 'border-purple-600/30 bg-purple-500/10 text-purple-800 dark:text-purple-300',
        };
      case 'mouza_map':
        return {
          titleBn: '৫. মৌজা নকশা ও দাগের সীমানা (Mouza Cadastral Map)',
          titleEn: '5. Mouza Map & Plot Boundaries',
          purposeBn: 'জমির অবস্থান, দাগ নম্বর, সীমানা ও প্রতিবেশী দাগের চৌহদ্দি চিহ্নিতকরণ।',
          purposeEn: 'Identify land location, dag number, area, and physical parcel boundaries.',
          detectsBn: 'একই দাগ বা দাগের একই নির্দিষ্ট অংশ একাধিক দলিলে বিক্রি (P3)।',
          detectsEn: 'Detects same dag/land portion used in multiple competing sale deeds (P3).',
          badgeColor: 'border-teal-600/30 bg-teal-500/10 text-teal-800 dark:text-teal-300',
        };
      case 'tax_receipt':
      default:
        return {
          titleBn: '৬. ভূমি উন্নয়ন কর দাখিলা (Land Development Tax Dakhila)',
          titleEn: '6. Land Development Tax Dakhila',
          purposeBn: 'ভূমি উন্নয়ন কর পরিশোধের সহায়ক প্রমাণপত্র যাচাইকরণ।',
          purposeEn: 'Supporting evidence for land tax payment verification.',
          detectsBn: 'খাজনা বকেয়া ও হোল্ডিং নম্বর মিল। (সতর্কতা: এককভাবে মালিকানা প্রমাণ করে না) (P2/P3)।',
          detectsEn: 'Tax clearance status. (Note: Supporting only - does NOT prove ownership by itself) (P2/P3).',
          badgeColor: 'border-orange-600/30 bg-orange-500/10 text-orange-800 dark:text-orange-300',
        };
    }
  };

  const meta = getDocTypeMetadata();

  return (
    <div className="space-y-4">
      {/* 1. CORE DOCUMENT MANDATORY CLASSIFICATION & DETECTION CAPABILITY HEADER */}
      <div className={`p-4 rounded-xl border ${meta.badgeColor} space-y-2`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-current/20 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <h3 className="text-xs sm:text-sm font-extrabold tracking-tight">
              {isBn ? meta.titleBn : meta.titleEn}
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30 font-bold uppercase tracking-wider">
            Mandatory Core Document
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs leading-relaxed">
          <div>
            <span className="font-bold block text-[11px] opacity-80">
              {isBn ? 'উদ্দেশ্য (Purpose):' : 'Verification Purpose:'}
            </span>
            <p className="opacity-95">{isBn ? meta.purposeBn : meta.purposeEn}</p>
          </div>
          <div>
            <span className="font-bold block text-[11px] opacity-80">
              {isBn ? 'শনাক্ত করে (Detects):' : 'Fraud Detection Scope:'}
            </span>
            <p className="opacity-95 font-medium">{isBn ? meta.detectsBn : meta.detectsEn}</p>
          </div>
        </div>

        {/* Supporting Only Disclaimer for Tax Dakhila */}
        {doc.type === 'tax_receipt' && (
          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-600/40 text-amber-900 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isBn
                ? 'বিশেষ নোট: ভূমি উন্নয়ন কর দাখিলা একটি সহায়ক প্রমাণপত্র মাত্র — এটি এককভাবে মালিকানার চূড়ান্ত প্রমাণ বহন করে না।'
                : 'Note: Tax Dakhila is supporting evidence only — it does NOT prove ownership by itself.'}
            </span>
          </div>
        )}
      </div>

      {/* 2. LIVE OCR SCAN CONTROLLER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScanning(!isScanning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isScanning
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-accent)]'
            }`}
          >
            {isScanning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{isBn ? 'স্ক্যান থামান' : 'Pause Scan'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{isBn ? 'লাইভ স্ক্যান চালান' : 'Live Scan'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              showBoundingBoxes
                ? 'border-[var(--brand-accent)] bg-[var(--accent-light)] text-[var(--brand-accent)] font-bold'
                : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
            }`}
          >
            {isBn ? 'ওসিআর বক্স' : 'Bounding Boxes'}
          </button>
        </div>

        {/* Real-time telemetry readout */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
            <span>{isScanning ? (isBn ? 'স্ক্যান চলমান...' : 'Scanning...') : (isBn ? 'স্ক্যান বিরতি' : 'Idle')}</span>
          </span>
          <span className="hidden sm:inline border-l border-[var(--border-color)] pl-3">
            OCR: Tesseract v5.3 + Vision
          </span>
          <span className="border-l border-[var(--border-color)] pl-3 font-bold text-[var(--brand-accent)]">
            {(doc.ocrConfidence * 100).toFixed(0)}% Confidence
          </span>
        </div>
      </div>

      {/* 3. CASE B: HASH TAMPERING WARNING BANNER */}
      {doc.hasTampering && (
        <div className="p-3.5 rounded-xl border-2 border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200 text-xs space-y-1 animate-pulse">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{isBn ? 'ডিজিটাল জালিয়াতি শনাক্ত: SHA-256 হ্যাশ অসঙ্গতি!' : 'Digital Forgery Detected: SHA-256 Hash Tampering!'}</span>
          </div>
          <p className="leading-relaxed font-medium">
            {isBn
              ? doc.tamperingDetailsBn || 'দৃষ্টিগোচরভাবে নথিটি একই মনে হলেও, ফাইলের অভ্যন্তরে ডিজিটাল পরিবর্তন করা হয়েছে। মূল এনরোল্ড রেজিস্ট্রির সাথে SHA-256 হ্যাশের অমিল রয়েছে।'
              : doc.tamperingDetailsEn || 'Visual similarity is high, but SHA-256 hash mismatch detected. File altered since original enrollment.'}
          </p>
          <div className="pt-1 text-[11px] font-mono space-y-0.5">
            <div><span className="text-gray-500">Current File Digest:</span> <span className="font-bold text-rose-700 dark:text-rose-400">{doc.hash}</span></div>
            {doc.enrolledHash && <div><span className="text-gray-500">Enrolled Registry Digest:</span> <span className="font-bold text-emerald-700 dark:text-emerald-400">{doc.enrolledHash}</span></div>}
          </div>
        </div>
      )}

      {/* 4. CASE F: LOW CONFIDENCE & HUMAN-IN-THE-LOOP ESCALATION BANNER */}
      {doc.ocrConfidence < 0.6 && (
        <div className="p-3.5 rounded-xl border border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{isBn ? 'নিম্ন আস্থাসীমা (Low Confidence) — মানবীয় পর্যালোচনা তলব' : 'Low OCR Confidence (45%) — Human Review Required'}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 font-bold">
              Rule X001 Active
            </span>
          </div>
          <p className="leading-relaxed">
            {isBn
              ? 'দাগ নম্বর ও জমির পরিমাণে অস্পষ্ট কালি বা হস্তাক্ষর কাটাকাটি রয়েছে। এআই স্বয়ংক্রিয় সিদ্ধান্ত না নিয়ে দায়িত্বশীলভাবে পর্যালোচকের নিশ্চিতকরণ তলব করেছে।'
              : 'Document has smudged ink or handwritten alteration on Dag number. Human correction required before final risk scoring.'}
          </p>

          <div className="pt-2 border-t border-amber-500/30 flex flex-wrap items-center gap-3">
            <span className="font-bold">{isBn ? 'দাগ নম্বর নিশ্চিত করুন:' : 'Confirm Dag Number:'}</span>
            <input
              type="text"
              value={humanVerifiedDag}
              onChange={(e) => setHumanVerifiedDag(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-amber-500/40 bg-white dark:bg-black font-mono font-bold w-24 text-center"
            />
            <button
              type="button"
              onClick={() => setHumanConfirmed(true)}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors"
            >
              {humanConfirmed ? (isBn ? '✓ নিশ্চিতকৃত' : '✓ Verified') : (isBn ? 'নিশ্চিত করুন' : 'Confirm')}
            </button>
          </div>
        </div>
      )}

      {/* 5. AUTHENTIC DOCUMENT SHEET CANVAS WITH REAL SCANNER OVERLAY */}
      <div className="relative rounded-2xl border-2 border-[var(--border-color)] bg-[#FFFDF8] dark:bg-[#151D18] p-5 sm:p-7 shadow-lg overflow-hidden select-none transition-colors">
        {/* Dynamic Holographic Scan Laser Bar */}
        {isScanning && (
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_18px_#22C55E] z-30 animate-scan-line pointer-events-none">
            <div className="absolute right-3 -top-5 px-2 py-0.5 rounded bg-emerald-900/90 border border-emerald-400 text-emerald-300 text-[9px] font-mono font-bold uppercase tracking-widest shadow-xs">
              SCANNING {scanProgress}%
            </div>
          </div>
        )}

        {/* Matrix Watermark Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#15803D_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-5 animate-ocr-grid" />

        {/* ---------------- DOCUMENT BODY BASED ON TYPE ---------------- */}

        {/* TYPE 1: REGISTERED DEED (দলিল) */}
        {doc.type === 'deed' && (
          <div className="space-y-5 text-[#242C24] dark:text-[#E2ECE2] font-serif">
            {/* 100 Taka Stamp Frame */}
            <div className="border-4 border-double border-[#15803D] rounded-xl p-4 text-center bg-[#F9F7EE] dark:bg-[#18261C] space-y-1 relative">
              <span className="text-[10px] font-mono tracking-widest text-emerald-700 dark:text-emerald-400 font-bold block uppercase">
                NON-JUDICIAL STAMP • BD REVENUE 100 TAKA • SERIAL: খগ-৮৯১২০৩৪
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#15803D] dark:text-emerald-400 tracking-tight">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার — সাফ-কবলা জমি বিক্রয় দলিলপত্র
              </h2>
              <p className="text-[11px] font-sans text-gray-600 dark:text-gray-300">
                সাব-রেজিস্ট্রি কার্যালয়: {doc.subRegistry || 'সাভার'}, জেলা: ঢাকা
              </p>
            </div>

            {/* Preamble */}
            <div className="text-xs leading-relaxed space-y-2 font-serif text-justify">
              <p>
                লিখিতং <strong>{doc.parties.seller || 'মো: আব্দুর রহিম'}</strong> (জাতীয় পরিচয়পত্র নং: ১৯৭৫২৬৯২৪০১২৩), পিতা: মৃত করিম বক্স, সাং: {doc.mouza}, থানা: সাভার, জেলা: ঢাকা—পক্ষ বিক্রেতা/হস্তান্তরকারী।
              </p>
              <p>
                কস্য সাফ-কবলা জমি বিক্রয় দলিলপত্র অত্র লিখিত পড়ার মর্ম এই যে, নিম্ন তপশিলভুক্ত জমি আমার নামীয় খতিয়ানভুক্ত স্বত্বাধীন বটে। অদ্য তারিখে সর্বসাকুল্যে পণ মূল্য গ্রহণ করিয়া ক্রেতা <strong>{doc.parties.buyer || 'মোছা: ফাতেমা বেগম'}</strong> বরাবরে জমি চিরতরে হস্তান্তর করিলাম।
              </p>
            </div>

            {/* Schedule of Land (তফসিল) */}
            <div className="p-3.5 rounded-xl border border-[#DCD5C5] dark:border-emerald-900/40 bg-white/70 dark:bg-black/30 font-sans space-y-2 text-xs">
              <span className="font-bold text-[11px] text-[#15803D] dark:text-emerald-400 block border-b pb-1">
                হস্তান্তরিত জমির তফসিল পরিচয় (Schedule of Land):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div><span className="text-gray-500 block">মৌজা:</span> <span className="font-bold">{doc.mouza}</span></div>
                <div><span className="text-gray-500 block">দাগ নং:</span> <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatNumber(doc.dagNumber)}</span></div>
                <div><span className="text-gray-500 block">জমির পরিমাণ:</span> <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatNumber(doc.areaDecimals)} শতক</span></div>
                <div><span className="text-gray-500 block">রেজিস্ট্রি তারিখ:</span> <span className="font-bold">{doc.registrationDate || '২০২৬-০৩-১৫'}</span></div>
              </div>
            </div>

            {/* Thumb Impressions & Sub-Registrar Seal */}
            <div className="pt-2 border-t border-[#DCD5C5] dark:border-emerald-900/30 flex items-center justify-between font-sans text-[10px]">
              <div className="border border-gray-400 p-2 rounded text-center w-24">
                <span className="text-[9px] text-gray-500 block">টিপসহি (Thumb)</span>
                <span className="font-mono text-emerald-600 font-bold">[SEAL IMPRINT]</span>
              </div>
              <div className="text-right">
                <span className="font-bold block">সাব-রেজিস্ট্রারের স্বাক্ষর ও সিল</span>
                <span className="text-gray-500 font-mono">ভলিউম নং: ১২০/২০২৬, পৃষ্ঠা: ৪৫-৪৮</span>
              </div>
            </div>
          </div>
        )}

        {/* TYPE 2: PREVIOUS DEED / বায়া দলিল */}
        {doc.type === 'baya_deed' && (
          <div className="space-y-4 text-[#2C2418] dark:text-[#E8E2D5] font-serif bg-[#FAF5E8]/60 dark:bg-[#1E1912]/40 p-4 rounded-xl border border-[#DECFA9] dark:border-amber-900/40">
            <div className="border-2 border-amber-700/60 rounded-lg p-3 text-center bg-[#F4ECD8] dark:bg-[#2A2218] space-y-0.5">
              <span className="text-[10px] font-mono text-amber-800 dark:text-amber-400 font-bold block uppercase">
                HISTORICAL CHAIN DEED • ৫০ টাকা স্ট্যাম্প • বায়া দলিল নং {doc.extractedFields.find(f => f.fieldKey === 'deed_number')?.rawValue || '৩২০১'}
              </span>
              <h2 className="text-base font-bold text-amber-900 dark:text-amber-300">
                পূর্ববর্তী বায়া হস্তান্তর দলিল (Chain of Title Deed)
              </h2>
              <span className="text-[11px] font-sans text-gray-600 dark:text-gray-400">
                সম্পাদন সাল: {doc.registrationDate || '২০২৪-১১-১০'}
              </span>
            </div>

            <div className="text-xs leading-relaxed space-y-2 text-justify">
              <p>
                <strong>বায়া দলিলের স্বত্ব হস্তান্তর পরম্পরা:</strong> পূর্বতন মূল রেকর্ডীয় মালিক <strong>{doc.parties.seller}</strong> এর নিকট হইতে অত্র বায়া কবলা দলিলের মাধ্যমে ক্রেতা <strong>{doc.parties.buyer}</strong> জমির দখল ও স্বত্ব গ্রহণ করিয়াছিলেন।
              </p>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 font-sans text-[11px] space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-400 block">মালিকানা ধারাবাহিকতা চেইন (Chain of Title Lineage):</span>
                <p className="font-mono text-[10px]">
                  {doc.parties.seller} (Seller) ➔ {doc.parties.buyer} (Buyer) • দাগ নং: {formatNumber(doc.dagNumber)} • পরিমাণ: {formatNumber(doc.areaDecimals)} শতক
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TYPE 3: KHATIAN (খতিয়ান — RS / BS) */}
        {doc.type === 'khatian' && (
          <div className="space-y-4 font-sans text-[#202920] dark:text-[#E2ECE2]">
            <div className="border-b-2 border-[#15803D] pb-3 text-center space-y-0.5">
              <h2 className="text-base sm:text-lg font-black text-[#15803D] dark:text-emerald-400">
                বাংলাদেশ ফরম নং ১০৭৭ — খতিয়ান ও স্বত্বলিপি (Record of Rights)
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 dark:text-gray-300 font-medium">
                <span>জেলা: ঢাকা</span>
                <span>থানা: সাভার</span>
                <span>মৌজা: {doc.mouza}</span>
                <span>জরিপ: <strong>{doc.khatianType || 'RS'}</strong></span>
                <span>খতিয়ান নং: <strong>{formatNumber(doc.dagNumber)}</strong></span>
              </div>
            </div>

            {/* Official Khatian 6-Column Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[var(--border-color)] border-collapse">
                <thead className="bg-[var(--bg-surface-soft)] text-[11px] font-bold text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-2 border border-[var(--border-color)]">প্রজার নাম ও পিতা</th>
                    <th className="p-2 border border-[var(--border-color)]">অংশ</th>
                    <th className="p-2 border border-[var(--border-color)]">দাগ নং</th>
                    <th className="p-2 border border-[var(--border-color)]">শ্রেণী</th>
                    <th className="p-2 border border-[var(--border-color)]">মোট জমি</th>
                    <th className="p-2 border border-[var(--border-color)]">খাজনা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  <tr>
                    <td className="p-2 border border-[var(--border-color)] font-bold">{doc.parties.owner || 'রেকর্ডীয় প্রজা'}</td>
                    <td className="p-2 border border-[var(--border-color)] font-mono">১.০০০</td>
                    <td className="p-2 border border-[var(--border-color)] font-bold text-emerald-700 dark:text-emerald-300">{formatNumber(doc.dagNumber)}</td>
                    <td className="p-2 border border-[var(--border-color)]">নাল জমি</td>
                    <td className="p-2 border border-[var(--border-color)] font-bold text-emerald-700 dark:text-emerald-300">{formatNumber(doc.areaDecimals)} শতক</td>
                    <td className="p-2 border border-[var(--border-color)]">১২০ টাকা</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <span>DLRS LAND SURVEY RECORD REGISTER</span>
              <span className="text-emerald-700 font-bold">✓ GOVERNMENT AUDIT CERTIFIED</span>
            </div>
          </div>
        )}

        {/* TYPE 4: MUTATION KHATIAN (নামজারি খতিয়ান) */}
        {doc.type === 'mutation' && (
          <div className="space-y-4 font-sans text-[#202920] dark:text-[#E2ECE2]">
            <div className="border-2 border-purple-600/40 rounded-xl p-3 bg-purple-500/5 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
                MINISTRY OF LAND • E-MUTATION SYSTEM
              </span>
              <h2 className="text-base font-extrabold text-purple-800 dark:text-purple-300">
                সহকারী কমিশনার (ভূমি) এর কার্যালয় — নামজারি ও জমাভাগ খতিয়ান
              </h2>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                নামজারি কেস নং: <strong>{doc.mutationCaseNo || '৩১৮/নাম/২০২৫-২৬'}</strong> | ডিসিআর নং: <strong>{doc.dcrNo || '৪৭৮৯'}</strong>
              </p>
            </div>

            <div className="p-3 rounded-lg border border-purple-500/30 bg-white/60 dark:bg-black/30 text-xs space-y-2">
              <span className="font-bold text-purple-800 dark:text-purple-300 block">আদেশনামা (Mutation Order Decree):</span>
              <p className="leading-relaxed">
                সাবেক খতিয়ান হইতে কর্তন করিয়া আবেদনকারী <strong>{doc.parties.owner}</strong> এর অনুকূলে নামজারি মঞ্জুর করা হইল। দাগ নং <strong>{formatNumber(doc.dagNumber)}</strong>, জমি <strong>{formatNumber(doc.areaDecimals)} শতক</strong>। সরকারি রেজিস্টারে হাল খতিয়ান খোলার আদেশ বলবৎ।
              </p>
            </div>
          </div>
        )}

        {/* TYPE 5: MOUZA CADATRAL MAP (মৌজা নকশা) */}
        {doc.type === 'mouza_map' && (
          <div className="space-y-4 font-sans">
            {/* DLRS & map.land.gov.bd Official Header */}
            <div className="border border-teal-600/30 dark:border-teal-500/20 rounded-xl p-3 bg-teal-500/5 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার — ভূমি রেকর্ড ও জরিপ অধিদপ্তর (DLRS)
              </span>
              <h2 className="text-base font-bold text-teal-900 dark:text-teal-200">
                ডিজিটাল মৌজা ক্যাডাস্ট্রাল মানচিত্র (map.land.gov.bd)
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-gray-600 dark:text-gray-400 font-mono">
                <span>মৌজা: <strong>{doc.mouza}</strong></span>
                <span>•</span>
                <span>জে.এল. নং: <strong>০৪</strong></span>
                <span>•</span>
                <span>সিট নং: <strong>০৩</strong></span>
                <span>•</span>
                <span>স্কেল: <strong>১৬ ইঞ্চি = ১ মাইল</strong></span>
              </div>
            </div>

            {/* SVG Cadastral Plot Boundary Vector Visualization */}
            <div className="p-4 rounded-xl bg-[#F4F1EA] dark:bg-[#121B14] border border-[#DDD6C5] dark:border-teal-900/30 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
              {/* Geodesic Coordinate Watermark */}
              <div className="absolute top-2 left-2 text-[9px] font-mono text-gray-400 dark:text-gray-600">
                WGS-84: 23°50'12"N, 90°15'44"E
              </div>
              <div className="absolute top-2 right-2 text-[9px] font-mono text-teal-700 dark:text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                GIS VERIFIED
              </div>

              <svg viewBox="0 0 400 220" className="w-full max-w-md h-48 drop-shadow-xs">
                {/* Adjacent plots */}
                <polygon points="40,20 180,30 170,110 30,95" fill="#E6DFCE" stroke="#8C8270" strokeWidth="1.5" />
                <text x="90" y="70" fontSize="12" fill="#5A5243" fontWeight="bold">দাগ ৮৭</text>

                <polygon points="180,30 360,25 350,115 170,110" fill="#E6DFCE" stroke="#8C8270" strokeWidth="1.5" />
                <text x="250" y="75" fontSize="12" fill="#5A5243" fontWeight="bold">দাগ ৮৯</text>

                {/* Main Highlighted Target Plot */}
                <polygon points="80,105 270,112 250,200 65,190" fill="#22C55E" fillOpacity="0.25" stroke="#15803D" strokeWidth="2.5" className="animate-pulse" />
                <text x="145" y="155" fontSize="16" fill="#15803D" fontWeight="900">দাগ {formatNumber(doc.dagNumber)}</text>
                <text x="135" y="175" fontSize="11" fill="#15803D" fontWeight="bold">({formatNumber(doc.areaDecimals)} শতক)</text>

                {/* Road */}
                <path d="M 10,210 Q 200,215 390,210" stroke="#B45309" strokeWidth="6" strokeDasharray="6,4" fill="none" />
                <text x="180" y="218" fontSize="9" fill="#B45309" fontWeight="bold">পাবলিক রাস্তা (Public Road)</text>

                {/* North Arrow */}
                <g transform="translate(365, 30)">
                  <polygon points="0,-15 5,0 -5,0" fill="#DC2626" />
                  <polygon points="0,15 5,0 -5,0" fill="#4B5563" />
                  <text x="-4" y="-18" fontSize="10" fontWeight="bold" fill="#DC2626">N</text>
                </g>
              </svg>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] w-full font-mono bg-white/70 dark:bg-black/40 p-2.5 rounded-lg border border-teal-500/20">
                <div><span className="text-gray-500 block">উত্তর সীমানা:</span> <span className="font-bold">দাগ ৮৭ (১২০ ফুট)</span></div>
                <div><span className="text-gray-500 block">দক্ষিণ সীমানা:</span> <span className="font-bold">রাস্তা (১১৮ ফুট)</span></div>
                <div><span className="text-gray-500 block">পূর্ব সীমানা:</span> <span className="font-bold">দাগ ৮৯ (৯০ ফুট)</span></div>
                <div><span className="text-gray-500 block">পশ্চিম সীমানা:</span> <span className="font-bold">দাগ ৯১ (৮৮ ফুট)</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TYPE 6: LAND TAX DAKHILA (ভূমি উন্নয়ন কর দাখিলা) */}
        {doc.type === 'tax_receipt' && (
          <div className="space-y-4 font-sans text-[#202920] dark:text-[#E2ECE2]">
            <div className="border-2 border-orange-600/40 rounded-xl p-3 bg-orange-500/5 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider block">
                GOVERNMENT OF BANGLADESH • e-LDTAX ONLINE RECEIPT
              </span>
              <h2 className="text-base font-extrabold text-orange-800 dark:text-orange-300">
                ভূমি উন্নয়ন কর পরিশোধের দাখিলা (রসিদ নং ৯৮০১)
              </h2>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                হোল্ডিং নং: <strong>{doc.holdingNo || '১২০/বি'}</strong> | অর্থবছর: <strong>১৪৩১-১৪৩২ বঙ্গাব্দ</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border border-orange-500/20 bg-white/60 dark:bg-black/30 text-xs">
              <div><span className="text-gray-500 block">করদাতার নাম:</span> <span className="font-bold">{doc.parties.taxPayer || doc.parties.owner}</span></div>
              <div><span className="text-gray-500 block">দাগ নং:</span> <span className="font-bold">{formatNumber(doc.dagNumber)}</span></div>
              <div><span className="text-gray-500 block">পরিশোধিত অর্থ:</span> <span className="font-bold text-emerald-700 dark:text-emerald-400">৩৫০ টাকা</span></div>
            </div>
          </div>
        )}

        {/* ---------------- BOUNDING BOXES OVERLAY (OCR EXTRACTION) ---------------- */}
        {showBoundingBoxes && doc.extractedFields && doc.extractedFields.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--brand-accent)] mb-2">
              <span className="flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5" />
                <span>{isBn ? 'নিষ্কাশিত মাল্টিমোডাল ওসিআর ফিল্ড উপাত্ত:' : 'Extracted Multimodal OCR Fields:'}</span>
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                {doc.extractedFields.length} Fields Parsed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {doc.extractedFields.map((f, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl border transition-all ${
                    f.confidence < 0.6
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 animate-pulse'
                      : 'border-[var(--brand-accent)]/30 bg-white/80 dark:bg-black/40 text-[var(--text-primary)] hover:border-[var(--brand-accent)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                    <span>{isBn ? f.labelBn : f.labelEn}</span>
                    <span className="font-mono font-bold text-[var(--brand-accent)]">
                      {(f.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="font-bold text-xs font-mono block mt-0.5 truncate">
                    {f.rawValue}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- REGISTRY SEAL & CRYPTOGRAPHIC VERIFICATION ---------------- */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5 truncate">
            <Hash className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" />
            <span className="truncate">SHA-256: {doc.hash}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED DIGITAL LEDGER</span>
          </span>
        </div>
      </div>
    </div>
  );
};
