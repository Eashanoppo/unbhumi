'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { api, ScanPreviewResult } from '@/lib/api';
import { ImageArea } from '@/components/ImageArea';
import { RiskBadge } from '@/components/RiskBadge';
import {
  ShieldCheck, AlertTriangle, Activity, FileText, Check,
  ChevronRight, Zap, Info, FileCheck, Layers, Search,
  UploadCloud, Scan, Copy, Loader2, Sparkles, Trash2,
  ArrowRight, FileUp, AlertCircle, ChevronDown
} from 'lucide-react';

export default function LandingPage() {
  const { language, t, formatNumber } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Document OCR State (Step 2 capabilities on Hero)
  const ocrFileInputRef = useRef<HTMLInputElement>(null);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrDocType, setOcrDocType] = useState('deed');
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrFileName, setOcrFileName] = useState('');
  const [ocrFileSize, setOcrFileSize] = useState(0);
  const [ocrFileHash, setOcrFileHash] = useState('');
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<ScanPreviewResult | null>(null);
  const [ocrError, setOcrError] = useState('');
  const [isOcrCopied, setIsOcrCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processOcrFile = async (file: File) => {
    setIsOcrOpen(true);
    setOcrFile(file);
    setOcrFileName(file.name);
    setOcrFileSize(file.size);
    setOcrError('');
    setIsOcrScanning(true);
    setOcrResult(null);

    // Compute SHA-256 hash
    try {
      const buffer = await file.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuf));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setOcrFileHash(hashHex);
    } catch {
      setOcrFileHash(Math.random().toString(16).substring(2, 10));
    }

    try {
      const res = await api.scanDocumentPreview(file, ocrDocType);
      setOcrResult(res);
    } catch (err: any) {
      console.error('OCR preview failed:', err);
      setOcrError(
        language === 'bn'
          ? 'নথি পাঠোদ্ধারে সমস্যা হয়েছে। অনুগ্রহ করে পরিষ্কার স্ক্যান কপি আপলোড করুন।'
          : 'Document OCR processing failed. Please upload a clear scan.'
      );
    } finally {
      setIsOcrScanning(false);
      if (ocrFileInputRef.current) ocrFileInputRef.current.value = '';
    }
  };

  const handleOcrFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await processOcrFile(file);
  };

  const handleOcrFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const file = e.dataTransfer.files[0];
    await processOcrFile(file);
  };

  const handleTestSampleOcr = () => {
    setIsOcrOpen(true);
    setOcrFileName('সাফ_কবলা_দলিল_কাউন্দিয়া_১২৩৪.pdf');
    setOcrFileSize(642500);
    setOcrFileHash('d58c19a4e76a084c7811ef3b55a12093539fb5f8efbb4682024');
    setOcrError('');
    setIsOcrScanning(true);
    setTimeout(() => {
      setOcrResult({
        success: true,
        confidence: 0.94,
        words_count: 84,
        engine: 'Tesseract 5.5.0',
        engine_version: '5.5.0',
        language: 'ben+eng',
        bounding_boxes: [],
        extracted_fields: [],
        suggested: {
          mouza: 'কাউন্দিয়া',
          dag_number: '৪১২',
          area: '25.0',
          survey_type: 'RS'
        },
        raw_ocr_text:
          'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\n' +
          'সাব-রেজিস্ট্রারের কার্যালয়, সাভার, ঢাকা\n' +
          'মূল সাফ-কবলা দলিল নং: ১২৩৪/২০২৪\n' +
          'মৌজা: কাউন্দিয়া, জেএল নং: ৪২\n' +
          'খতিয়ান নং: আরএস ৫২০৪, সাবেক খতিয়ান: ২৩১০\n' +
          'দাগ নং: আরএস ৪১২, সাবেক দাগ: ৩৫৮\n' +
          'জমির শ্রেণি: নাল, হস্তান্তরিত জমির পরিমাণ: ২৫.০ শতক (২৫ শতাংশ)\n' +
          'বিক্রেতা: মোঃ রফিকুল ইসলাম, পিতা: মরহুম আব্দুল কাদের\n' +
          'ক্রেতা: এহসানুল হক, পিতা: শামসুল হক\n' +
          'চৌহদ্দি: উত্তরে দাগ ৪১০, দক্ষিণে রাস্তা, পূর্বে দাগ ৪১৩, পশ্চিমে খাল।\n' +
          'স্বত্ব ঘোষণা: বিক্রেতা নিরঙ্কুশ ও নির্ভেজাল স্বত্বাধিকারী হিসেবে এই জমি বিক্রয় করিলেন।'
      });
      setIsOcrScanning(false);
    }, 600);
  };

  const handleCopyOcrText = () => {
    if (ocrResult?.raw_ocr_text) {
      navigator.clipboard.writeText(ocrResult.raw_ocr_text);
      setIsOcrCopied(true);
      setTimeout(() => setIsOcrCopied(false), 2000);
    }
  };

  const handleResetOcr = () => {
    setOcrFile(null);
    setOcrFileName('');
    setOcrFileSize(0);
    setOcrFileHash('');
    setOcrResult(null);
    setOcrError('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/cases?search=${encodeURIComponent(query)}`);
    } else {
      router.push('/cases');
    }
  };

  const handleQuickSearch = (plotOrMouza: string) => {
    setSearchQuery(plotOrMouza);
    router.push(`/cases?search=${encodeURIComponent(plotOrMouza)}`);
  };

  const syntheticDemos = [
    {
      id: 'UB-2026-1001',
      title_bn: 'মৌজা কাউন্দিয়া আরএস দাগ ৪১২',
      title_en: 'Mouza Kaundia RS Dag 412',
      desc_bn: 'স্বাভাবিক ও বৈধ হস্তান্তর। সাফ-কবলা দলিল, খতিয়ান ও নামজারি সম্পূর্ণ সামঞ্জস্যপূর্ণ।',
      desc_en: 'Legitimate transaction. Title deed, khatian, and mutation records are mutually consistent.',
      risk: 'low'
    },
    {
      id: 'UB-2026-1002',
      title_bn: 'মৌজা ধামরাই আরএস দাগ ৮৮',
      title_en: 'Mouza Dhamrai RS Dag 88',
      desc_bn: 'সম্ভাব্য দ্বৈত বিক্রি: একই দাগ পূর্বে অন্য ক্রেতার নিকট বিক্রির স্পষ্ট রেকর্ড শনাক্ত।',
      desc_en: 'Potential double-selling: active competing deed registered on the same parcel.',
      risk: 'critical'
    },
    {
      id: 'UB-2026-1003',
      title_bn: 'মৌজা তেঁতুলঝোড়া দাগ ২৯১',
      title_en: 'Mouza Tetuljhora Dag 291',
      desc_bn: 'মালিকানা ধারাবাহিকতা বিচ্ছিন্ন: খতিয়ান স্বত্বাধিকারীর সাথে বিক্রেতার বায়া দলিল অনুপস্থিত।',
      desc_en: 'Broken chain of title: Missing baya deed connecting seller to recorded khatian owner.',
      risk: 'high'
    },
    {
      id: 'UB-2026-1004',
      title_bn: 'মৌজা সাভার দাগ ৫১০',
      title_en: 'Mouza Savar Dag 510',
      desc_bn: 'দলিল বনাম খতিয়ান স্বত্ব অমিল: দলিলের বিক্রেতার নামের সাথে খতিয়ানের মূল মালিক মিলছে না।',
      desc_en: 'Deed vs khatian discrepancy: deed executant name does not match survey record.',
      risk: 'high'
    }
  ];

  const workflowSteps = [
    {
      step: t('flow_s1_step'),
      title: t('flow_s1_title'),
      desc: t('flow_s1_desc')
    },
    {
      step: t('flow_s2_step'),
      title: t('flow_s2_title'),
      desc: t('flow_s2_desc')
    },
    {
      step: t('flow_s3_step'),
      title: t('flow_s3_title'),
      desc: t('flow_s3_desc')
    },
    {
      step: t('flow_s4_step'),
      title: t('flow_s4_title'),
      desc: t('flow_s4_desc')
    }
  ];

  const faqs = [
    {
      q: t('faq1_q'),
      a: t('faq1_a')
    },
    {
      q: t('faq2_q'),
      a: t('faq2_a')
    },
    {
      q: t('faq3_q'),
      a: t('faq3_a')
    },
    {
      q: t('faq4_q'),
      a: t('faq4_a')
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-20 py-6 sm:py-12">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-surface-soft)] text-[var(--brand-accent)] border border-[var(--border-color)]">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-accent)] animate-pulse" />
              <span>{t('hero_badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.18]">
              {language === 'bn' ? (
                <>
                  একটি দাগ। একাধিক দলিল। <br className="hidden sm:inline" />
                  <span className="text-[var(--brand-accent)]">একটি প্রমাণ পথ।</span>
                </>
              ) : (
                <>
                  One plot. Multiple deeds. <br className="hidden sm:inline" />
                  <span className="text-[var(--brand-accent)]">One evidence trail.</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {t('hero_description')}
            </p>

            {/* Search & Document OCR Hero Form */}
            <div className="pt-2">
              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_10px_30px_-5px_rgba(21,128,61,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04)] space-y-3.5">
                {/* 1. Upper Field: Unified Search Bar with Search Record Button */}
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        language === 'bn'
                          ? 'খতিয়ান নম্বর, দাগ নম্বর অথবা মৌজার নাম দিয়ে অনুসন্ধান করুন...'
                          : 'Search by Khatian No, Plot No, or Mouza Name...'
                      }
                      className="w-full pl-10 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-accent)] transition-all font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 py-3 sm:py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm bg-[#15803D] hover:bg-[#126E34] text-white shadow-[0_4px_14px_rgba(21,128,61,0.3)] hover:shadow-[0_6px_20px_rgba(21,128,61,0.4)] active:scale-[0.98] transition-all cursor-pointer shrink-0"
                  >
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>{language === 'bn' ? 'রেকর্ড অনুসন্ধান করুন' : 'Search Records'}</span>
                  </button>
                </form>

                {/* 2. Document OCR Feature — Dropdown / Collapsible Type */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleOcrFileDrop}
                  className={`rounded-2xl border transition-all shadow-xs ${
                    isOcrOpen
                      ? 'border-[var(--brand-accent)]/50 bg-[var(--bg-surface-soft)]/75 p-3.5 sm:p-4.5 space-y-3'
                      : isDragOver
                        ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)]/10 p-2.5'
                        : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 hover:border-[var(--brand-accent)]/40 p-2.5'
                  }`}
                >
                  {/* Dropdown Toggle Header Button */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOcrOpen(!isOcrOpen)}
                      className="flex-1 flex items-center justify-between gap-2.5 text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-[var(--brand-accent)] shrink-0 group-hover:scale-105 transition-transform">
                          <Scan className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors">
                              {language === 'bn' ? 'নথি সরাসরি ওসিআর স্ক্যানার' : 'Direct Document OCR Scanner'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--brand-accent)]/15 text-[var(--brand-accent)] border border-[var(--brand-accent)]/30">
                              {language === 'bn' ? 'বাংলা ও ইংরেজি' : 'BN & EN'}
                            </span>
                            {ocrResult && !isOcrOpen && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 animate-pulse">
                                {language === 'bn' ? '✓ টেক্সট প্রস্তুত' : '✓ Extracted'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {language === 'bn'
                              ? 'দলিল বা খতিয়ান আপলোড করে সরাসরি পাঠযোগ্য টেক্সট ও তফসিল বের করুন'
                              : 'Upload deed or khatian to extract raw text & schedule in seconds'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-accent)] shrink-0 pl-1">
                        <span className="text-[11px] font-medium text-[var(--text-secondary)] hidden sm:inline">
                          {isOcrOpen
                            ? (language === 'bn' ? 'সংকুচিত করুন' : 'Collapse')
                            : (language === 'bn' ? 'ওসিআর ড্রপডাউন' : 'Open Dropdown')}
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--brand-accent)] group-hover:border-[var(--brand-accent)] transition-all">
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isOcrOpen ? 'rotate-180 text-[var(--brand-accent)]' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={ocrFileInputRef}
                    onChange={handleOcrFileSelect}
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                  />

                  {/* Dropdown Expanded Body */}
                  {isOcrOpen && (
                    <div className="pt-2 border-t border-[var(--border-color)] space-y-3">
                      {/* Document Type Selector Bar */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                            {language === 'bn' ? 'নথির ধরন:' : 'Document Type:'}
                          </span>
                          <select
                            value={ocrDocType}
                            onChange={(e) => setOcrDocType(e.target.value)}
                            className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-[var(--brand-accent)]/20 focus:outline-none cursor-pointer"
                          >
                            <option value="deed">{language === 'bn' ? 'মূল সাফ-কবলা দলিল' : 'Title Deed'}</option>
                            <option value="baya_deed">{language === 'bn' ? 'বায়া দলিল' : 'Baya Deed'}</option>
                            <option value="khatian">{language === 'bn' ? 'খতিয়ান (RS/CS)' : 'Khatian'}</option>
                            <option value="mutation">{language === 'bn' ? 'নামজারি খতিয়ান' : 'Mutation'}</option>
                            <option value="tax_receipt">{language === 'bn' ? 'ভূমি কর দাখিলা' : 'Tax Receipt'}</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsOcrOpen(false)}
                          className="text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-accent)] hover:underline cursor-pointer"
                        >
                          {language === 'bn' ? 'ড্রপডাউন বন্ধ করুন ✕' : 'Close Dropdown ✕'}
                        </button>
                      </div>

                      {/* Empty/Ready Dropzone */}
                      {!ocrResult && !isOcrScanning && (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={handleOcrFileDrop}
                          className={`p-4 sm:p-5 border-2 border-dashed rounded-xl transition-all text-center flex flex-col items-center justify-center gap-2 ${
                            isDragOver
                              ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)]/10 scale-[1.01]'
                              : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--brand-accent)]/60'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex items-center justify-center text-[var(--brand-accent)]">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                              {language === 'bn'
                                ? 'দলিল বা রেকর্ডের ফাইল এখানে ড্রপ করুন'
                                : 'Drop deed or land document scan here'}
                            </p>
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              {language === 'bn'
                                ? 'সমর্থিত ফরম্যাট: PDF, JPG, PNG (সর্বোচ্চ ২৫ এমবি)'
                                : 'Supports PDF, JPG, PNG (up to 25MB)'}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => ocrFileInputRef.current?.click()}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'ফাইল নির্বাচন ও ওসিআর' : 'Select Document & Run OCR'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleTestSampleOcr}
                              className="px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)] text-[var(--text-primary)] transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>{language === 'bn' ? 'নমুনা দলিল দিয়ে টেস্ট করুন' : 'Try Sample Deed'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Scanning Active State */}
                      {isOcrScanning && (
                        <div className="py-7 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col items-center justify-center space-y-2.5 text-center">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full border-2 border-[var(--brand-accent)] border-t-transparent animate-spin" />
                            <Scan className="w-4 h-4 text-[var(--brand-accent)] absolute inset-0 m-auto animate-pulse" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                              {language === 'bn' ? 'ট্যাসেরাক্ট ওসিআর পাঠোদ্ধার চলছে...' : 'Running Tesseract 5.5 OCR Extraction...'}
                            </p>
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              {ocrFileName ? `${ocrFileName} • ` : ''}
                              {language === 'bn'
                                ? 'বাংলা লিপি, ইংরেজি সংখ্যা ও তফসিল শনাক্তকরণ প্রক্রিয়াধীন'
                                : 'Processing Bengali script, plot numbers & schedule'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* OCR Error Display */}
                      {ocrError && !isOcrScanning && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-900 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                            <span>{ocrError}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOcrError('')}
                            className="text-[11px] font-bold underline cursor-pointer"
                          >
                            {language === 'bn' ? 'মুছে ফেলুন' : 'Dismiss'}
                          </button>
                        </div>
                      )}

                      {/* Completed OCR Result Display */}
                      {ocrResult && !isOcrScanning && (
                        <div className="space-y-3 pt-0.5">
                          {/* Metrics & Hash Bar */}
                          <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[var(--text-primary)] truncate max-w-[180px]">
                                {ocrFileName || 'দলিল_নথি'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                                কনফিডেন্স: {Math.round(ocrResult.confidence * 100)}%
                              </span>
                              <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                                শব্দ: {formatNumber(ocrResult.words_count)}
                              </span>
                              <span className="font-mono text-[10px] text-[var(--text-muted)] hidden sm:inline">
                                ইঞ্জিন: {ocrResult.engine || 'Tesseract 5.5'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={handleCopyOcrText}
                                className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-soft)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-bold text-[var(--brand-accent)] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {isOcrCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{language === 'bn' ? 'টেক্সট কপি' : 'Copy Text'}</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={handleResetOcr}
                                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                title={language === 'bn' ? 'রিসেট' : 'Reset'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Suggested Schedule Notification */}
                          {ocrResult.suggested && (ocrResult.suggested.dag_number || ocrResult.suggested.mouza) && (
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                                <span className="font-medium">
                                  {language === 'bn' ? 'শনাক্তকৃত তফসিল:' : 'Extracted Schedule:'}{' '}
                                  {ocrResult.suggested.mouza && (
                                    <strong className="font-bold text-blue-950 dark:text-blue-50">
                                      মৌজা: {ocrResult.suggested.mouza},{' '}
                                    </strong>
                                  )}
                                  {ocrResult.suggested.dag_number && (
                                    <strong className="font-bold text-blue-950 dark:text-blue-50">
                                      দাগ নং: {ocrResult.suggested.dag_number}{' '}
                                    </strong>
                                  )}
                                  {ocrResult.suggested.area && (
                                    <span className="text-blue-900 dark:text-blue-200">
                                      ({ocrResult.suggested.area} শতক)
                                    </span>
                                  )}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const params = new URLSearchParams();
                                  if (ocrResult?.suggested?.mouza) params.set('mouza', ocrResult.suggested.mouza);
                                  if (ocrResult?.suggested?.dag_number) params.set('dag', String(ocrResult.suggested.dag_number));
                                  if (ocrResult?.suggested?.area) params.set('area', String(ocrResult.suggested.area));
                                  router.push(`/documents/new?${params.toString()}`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] transition-colors shrink-0 cursor-pointer text-center"
                              >
                                {language === 'bn' ? 'এই তফসিলে কেস শুরু' : 'Apply to Case'}
                              </button>
                            </div>
                          )}

                          {/* Raw OCR Text Box - Compact scrollable */}
                          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 space-y-1.5 shadow-xs">
                            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-primary)]">
                              <span>{language === 'bn' ? 'সরাসরি পাঠোদ্ধারকৃত লেখা (Raw OCR Text Stream):' : 'Raw OCR Extracted Text Stream:'}</span>
                              <span className="font-mono text-[10px] text-emerald-800 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                Tesseract 5.5
                              </span>
                            </div>
                            <div className="max-h-36 overflow-y-auto p-3 rounded-lg bg-[var(--bg-surface-soft)] font-sans text-xs text-stone-900 dark:text-stone-100 font-medium leading-relaxed whitespace-pre-wrap select-text border border-[var(--border-color)]">
                              {ocrResult.raw_ocr_text || (
                                <span className="text-[var(--text-secondary)] italic">
                                  {language === 'bn' ? 'কোনো পাঠযোগ্য লেখা পাওয়া যায়নি।' : 'No readable text extracted.'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bottom Direct CTA */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  const params = new URLSearchParams();
                                  if (ocrResult?.suggested?.mouza) params.set('mouza', ocrResult.suggested.mouza);
                                  if (ocrResult?.suggested?.dag_number) params.set('dag', String(ocrResult.suggested.dag_number));
                                  if (ocrResult?.suggested?.area) params.set('area', String(ocrResult.suggested.area));
                                  router.push(`/documents/new?${params.toString()}`);
                                }}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span>{language === 'bn' ? '🚀 পূর্ণাঙ্গ কেস যাচাইয়ে ব্যবহার করুন' : 'Verify in Full Case Pipeline'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => ocrFileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-color)] hover:bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] transition-colors text-center cursor-pointer"
                              >
                                {language === 'bn' ? '🔄 অন্য নথি স্ক্যান' : 'Scan Another'}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsOcrOpen(false)}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)] transition-colors text-center cursor-pointer"
                            >
                              {language === 'bn' ? 'সংকুচিত করুন' : 'Collapse'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Sub-actions & Quick Pills preserving full workflow functionality */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 px-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[var(--text-muted)] font-medium">
                      {language === 'bn' ? 'উদাহরণ:' : 'Quick tags:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickSearch('৪১২')}
                      className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] hover:text-[var(--brand-accent)] hover:border-[var(--brand-accent)] border border-[var(--border-color)] transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'দাগ ৪১২ (কাউন্দিয়া)' : 'Plot 412 (Kaundia)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSearch('৮৮')}
                      className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-500 border border-[var(--border-color)] transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'দাগ ৮৮ (দ্বৈত বিক্রি)' : 'Plot 88 (Double Sale)'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/documents/new"
                      className="font-bold text-[var(--brand-accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{language === 'bn' ? '+ নতুন ফাইল আপলোড' : '+ Upload Deed'}</span>
                    </Link>
                    <span className="text-[var(--border-color)]">•</span>
                    <Link
                      href="/demo"
                      className="font-bold text-[var(--text-secondary)] hover:text-[var(--brand-accent)] inline-flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-[var(--brand-accent)]" />
                      <span>{language === 'bn' ? 'ডেমো কেস' : 'Demo Cases'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Responsive Trust Points */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[var(--border-color)]">
              <div className="p-2 sm:p-0">
                <p className="text-xs text-[var(--text-secondary)] font-medium">{t('trust_p1_label')}</p>
                <p className="text-sm sm:text-base font-bold text-[var(--brand-accent)]">{t('trust_p1_val')}</p>
              </div>
              <div className="p-2 sm:p-0 border-t sm:border-t-0 sm:border-l border-[var(--border-color)] sm:pl-3">
                <p className="text-xs text-[var(--text-secondary)] font-medium">{t('trust_p2_label')}</p>
                <p className="text-sm sm:text-base font-bold text-[var(--brand-accent)]">{t('trust_p2_val')}</p>
              </div>
              <div className="p-2 sm:p-0 border-t sm:border-t-0 sm:border-l border-[var(--border-color)] sm:pl-3">
                <p className="text-xs text-[var(--text-secondary)] font-medium">{t('trust_p3_label')}</p>
                <p className="text-sm sm:text-base font-bold text-[var(--brand-accent)]">{t('trust_p3_val')}</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Image */}
          <div className="lg:col-span-5 order-first lg:order-last">
            <ImageArea
              src="/images/landing/1792339333.png"
              alt={t('hero_img_alt')}
              aspectRatio="video"
              className="shadow-md rounded-2xl overflow-hidden border border-[var(--border-color)]"
              caption={t('hero_img_caption')}
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. The Duplicate-Sale Problem & Inconsistencies */}
      <section className="bg-[var(--bg-surface-soft)]/60 border-y border-[var(--border-color)] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
              {t('prob_badge')}
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              {t('prob_title')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto">
              {t('prob_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs hover:border-red-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">{t('prob_card1_title')}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('prob_card1_desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs hover:border-amber-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">{t('prob_card2_title')}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('prob_card2_desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[var(--brand-accent)]">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">{t('prob_card3_title')}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('prob_card3_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Workflow Steps */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-10 sm:mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
            {t('flow_badge')}
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {t('flow_title')}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {t('flow_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {workflowSteps.map((ws, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 relative group hover:border-[var(--brand-accent)]/60 transition-colors shadow-xs"
            >
              <span className="text-3xl font-black text-[var(--brand-accent)]/20 block font-mono">
                {ws.step}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {ws.title}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {ws.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Synthetic Scenarios Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div>
              <span className="text-xs font-bold uppercase text-[var(--brand-accent)] block mb-1">
                {t('demo_badge')}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                {t('demo_title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {t('demo_subtitle')}
              </p>
            </div>
            <Link
              href="/cases"
              className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold bg-[var(--bg-surface-soft)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--brand-accent)] transition-colors"
            >
              <span>{t('demo_view_all')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syntheticDemos.map((demo) => (
              <Link
                key={demo.id}
                href={`/cases/${demo.id}`}
                className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]/40 hover:bg-[var(--bg-surface-soft)] transition-all flex flex-col justify-between space-y-3 group hover:border-[var(--brand-accent)]/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--brand-accent)]">
                    {demo.id}
                  </span>
                  <RiskBadge level={demo.risk} showScore={false} size="sm" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors">
                    {language === 'bn' ? demo.title_bn : demo.title_en}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {language === 'bn' ? demo.desc_bn : demo.desc_en}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-medium">{t('demo_view_results')}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--brand-accent)]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
            {t('faq_badge')}
          </h2>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('faq_title')}
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 shadow-xs">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Responsible AI Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h4 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brand-accent)]" />
              <span>{t('responsible_title')}</span>
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {t('responsible_desc')}
            </p>
          </div>
          <Link
            href="/methodology"
            className="px-5 py-3 min-h-[44px] flex items-center justify-center rounded-xl text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] transition-colors shrink-0 shadow-xs"
          >
            {t('responsible_btn')}
          </Link>
        </div>
      </section>
    </div>
  );
}
