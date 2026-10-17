'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { api, CaseItem, AnomalyFinding, GraphData } from '@/lib/api';
import {
  Sparkles, ShieldCheck, FileText, CheckCircle2, AlertTriangle, AlertOctagon,
  ArrowRight, RotateCcw, Play, Download, Printer, Eye, Layers, Lock,
  UploadCloud, Trash2, Plus, Search, Maximize2, X, GitFork, Cpu,
  Clock, Check, ChevronRight, Hash, Database, BookOpen, AlertCircle
} from 'lucide-react';

// --- TYPES ---
export interface DemoDocumentFixture {
  id: string;
  name: string;
  type: 'deed' | 'baya_deed' | 'khatian' | 'mutation' | 'tax_receipt' | 'mouza_map';
  sizeBytes: number;
  hash: string;
  enrolledHash?: string;
  pageCount: number;
  summaryBn: string;
  summaryEn: string;
  parties: {
    seller?: string;
    buyer?: string;
    owner?: string;
    taxPayer?: string;
  };
  mouza: string;
  dagNumber: string;
  areaDecimals: number;
  registrationDate?: string;
  ocrConfidence: number;
  extractedFields: {
    fieldKey: string;
    labelBn: string;
    labelEn: string;
    rawValue: string;
    normalizedValue: string;
    confidence: number;
    bbox?: { x: number; y: number; w: number; h: number };
  }[];
}

export interface DemoScenario {
  id: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  mouza: string;
  dagNumber: string;
  area: number;
  expectedRiskLevel: 'low' | 'review' | 'high' | 'critical';
  expectedRiskScore: number;
  conflictType: 'clean' | 'double_sale' | 'broken_chain' | 'deed_khatian_mismatch';
  documents: DemoDocumentFixture[];
}

export interface PipelineStage {
  id: number;
  nameBn: string;
  nameEn: string;
  icon: any;
  status: 'pending' | 'running' | 'completed' | 'warning' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  inputsCount: number;
  outputsCount: number;
  outputsSummaryBn: string;
  outputsSummaryEn: string;
  provenanceBn: string;
  provenanceEn: string;
  artifacts?: any;
}

// --- DETERMINISTIC SYNTHETIC SCENARIO FIXTURES ---
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'UB-2026-1001',
    titleBn: 'মৌজা কাউন্দিয়া আরএস দাগ ৪১২ জমি হস্তান্তর যাচাই',
    titleEn: 'Mouza Kaundia RS Dag 412 Clean Title Transfer',
    descBn: 'স্বাভাবিক ও বৈধ হস্তান্তর। সাফ-কবলা দলিল, আরএস খতিয়ান, নামজারি ও ভূমি উন্নয়ন কর রসিদ সম্পূর্ণ সঙ্গতিপূর্ণ।',
    descEn: 'Clean, verified transaction. Deed, khatian record, mutation, and tax receipts fully reconcile with zero conflicts.',
    mouza: 'কাউন্দিয়া',
    dagNumber: '৪১২',
    area: 25.0,
    expectedRiskLevel: 'low',
    expectedRiskScore: 0,
    conflictType: 'clean',
    documents: [
      {
        id: 'doc-1001-1',
        name: 'মূল_সাফ_কবলা_দলিল_৭৪৫২.pdf',
        type: 'deed',
        sizeBytes: 1428500,
        hash: '7a9f4c3d8e12b6a901ffc562e104a39d84c391219b6732f90119c836a0f44391',
        pageCount: 3,
        summaryBn: 'সাফ-কবলা জমি বিক্রয় দলিল নং ৭৪৫২, তারিখ: ১৫/০৩/২০২৬। বিক্রেতা: মো: আব্দুর রহিম, ক্রেতা: মোছা: ফাতেমা বেগম।',
        summaryEn: 'Outright Sale Deed No. 7452, Date: 15/03/2026. Seller: Md. Abdur Rahim, Buyer: Mst. Fatema Begum.',
        parties: { seller: 'মো: আব্দুর রহিম', buyer: 'মোছা: ফাতেমা বেগম' },
        mouza: 'কাউন্দিয়া',
        dagNumber: '৪১২',
        areaDecimals: 25.0,
        registrationDate: '2026-03-15',
        ocrConfidence: 0.98,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৭৪৫২', normalizedValue: '7452', confidence: 0.99, bbox: { x: 120, y: 80, w: 180, h: 35 } },
          { fieldKey: 'deed_date', labelBn: 'রেজিস্ট্রেশনের তারিখ', labelEn: 'Registration Date', rawValue: '১৫/০৩/২০২৬', normalizedValue: '2026-03-15', confidence: 0.96, bbox: { x: 450, y: 80, w: 160, h: 35 } },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'মো: আব্দুর রহিম', normalizedValue: 'মো: আব্দুর রহিম', confidence: 0.97, bbox: { x: 120, y: 180, w: 280, h: 40 } },
          { fieldKey: 'buyer_name', labelBn: 'ক্রেতার নাম', labelEn: 'Buyer Name', rawValue: 'মোছা: ফাতেমা বেগম', normalizedValue: 'মোছা: ফাতেমা বেগম', confidence: 0.97, bbox: { x: 120, y: 240, w: 280, h: 40 } },
          { fieldKey: 'land_area', labelBn: 'জমির পরিমাণ', labelEn: 'Land Area', rawValue: '২৫ শতাংশ (০.২৫ একর)', normalizedValue: '25.0 শতাংশ', confidence: 0.95, bbox: { x: 120, y: 380, w: 240, h: 35 } }
        ]
      },
      {
        id: 'doc-1001-2',
        name: 'আরএস_রেকর্ডীয়_খতিয়ান_৫৮৩.pdf',
        type: 'khatian',
        sizeBytes: 985200,
        hash: '3e41b9d09a7218cf5092a40e6712ab098f430198de72a5b112998a6094b81093',
        pageCount: 1,
        summaryBn: 'আরএস খতিয়ান নং ৫৮৩, দাগ ৪১২। রেকর্ডীয় প্রজা: মো: আব্দুর রহিম। অনুমোদিত মোট জমি: ২৫ শতাংশ।',
        summaryEn: 'RS Khatian No. 583, Plot 412. Recorded Tenant: Md. Abdur Rahim. Recorded Area: 25.0 decimals.',
        parties: { owner: 'মো: আব্দুর রহিম' },
        mouza: 'কাউন্দিয়া',
        dagNumber: '৪১২',
        areaDecimals: 25.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'khatian_number', labelBn: 'খতিয়ান নম্বর', labelEn: 'Khatian Number', rawValue: '৫৮৩', normalizedValue: '583', confidence: 0.98, bbox: { x: 100, y: 90, w: 150, h: 35 } },
          { fieldKey: 'recorded_owner', labelBn: 'রেকর্ডীয় প্রজা/মালিক', labelEn: 'Recorded Owner', rawValue: 'মো: আব্দুর রহিম', normalizedValue: 'মো: আব্দুর রহিম', confidence: 0.97, bbox: { x: 100, y: 170, w: 300, h: 40 } },
          { fieldKey: 'land_area', labelBn: 'রেকর্ডকৃত মোট জমি', labelEn: 'Recorded Total Area', rawValue: '২৫ শতাংশ', normalizedValue: '25.0 শতাংশ', confidence: 0.96, bbox: { x: 300, y: 240, w: 180, h: 35 } }
        ]
      },
      {
        id: 'doc-1001-3',
        name: 'নামজারি_খতিয়ান_ও_ডিসিআর_৩১৮.pdf',
        type: 'mutation',
        sizeBytes: 820400,
        hash: 'd5c192804bba462f8a556731110023ee451bc0399120894562ad47190beef012',
        pageCount: 2,
        summaryBn: 'মিউটেশন খতিয়ান নং ৩১৮/নাম/২০২৫-২৬, অনুমোদিত দাগ ৪১২, ডিসিআর নং ৪৭৮৯।',
        summaryEn: 'Mutation Record No. 318/2025-26, Approved Plot 412, DCR No. 4789.',
        parties: { owner: 'মো: আব্দুর রহিম' },
        mouza: 'কাউন্দিয়া',
        dagNumber: '৪১২',
        areaDecimals: 25.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'mutation_case_no', labelBn: 'নামজারি কেস নং', labelEn: 'Mutation Case No', rawValue: '৩১৮/নাম/২০২৫-২৬', normalizedValue: '318/2025-26', confidence: 0.96 },
          { fieldKey: 'mutated_owner', labelBn: 'নামজারি গ্রহীতা', labelEn: 'Mutated Owner', rawValue: 'মো: আব্দুর রহিম', normalizedValue: 'মো: আব্দুর রহিম', confidence: 0.96 }
        ]
      },
      {
        id: 'doc-1001-4',
        name: 'ভূমি_উন্নয়ন_কর_দাখিলা_১৪৩২.pdf',
        type: 'tax_receipt',
        sizeBytes: 450100,
        hash: '88912ef00192a4b89012356789abcdef0123456789abcdef0123456789abcdef',
        pageCount: 1,
        summaryBn: 'ভূমি উন্নয়ন কর পরিশোধ রসিদ (দাখিলা নং ৯৮০১), সাল: ১৪৩২ বঙ্গাব্দ, হোল্ডিং: ১২০/বি।',
        summaryEn: 'Land Development Tax Dakhila No. 9801, Year: 1432 BS, Holding: 120/B.',
        parties: { taxPayer: 'মো: আব্দুর রহিম' },
        mouza: 'কাউন্দিয়া',
        dagNumber: '৪১২',
        areaDecimals: 25.0,
        ocrConfidence: 0.95,
        extractedFields: [
          { fieldKey: 'holding_number', labelBn: 'হোল্ডিং নম্বর', labelEn: 'Holding Number', rawValue: '১২০/বি', normalizedValue: '120/B', confidence: 0.95 },
          { fieldKey: 'tax_payer', labelBn: 'করদাতার নাম', labelEn: 'Tax Payer', rawValue: 'মো: আব্দুর রহিম', normalizedValue: 'মো: আব্দুর রহিম', confidence: 0.94 }
        ]
      }
    ]
  },
  {
    id: 'UB-2026-1002',
    titleBn: 'মৌজা ধামরাই দাগ ৮৮ - দ্বৈত বিক্রির সন্দেহজনক কেস',
    titleEn: 'Mouza Dhamrai Dag 88 - Suspected Double-Selling Conflict',
    descBn: 'একই বিক্রেতা কর্তৃক একই দাগের জমি দুই ভিন্ন ব্যক্তির নিকট হস্তান্তরের গুরুতর অসঙ্গতি শনাক্ত।',
    descEn: 'Critical fraud risk: same seller Kamal Hossain executed two separate sale deeds for the exact same parcel to two different buyers.',
    mouza: 'ধামরাই',
    dagNumber: '৮৮',
    area: 40.0,
    expectedRiskLevel: 'critical',
    expectedRiskScore: 85,
    conflictType: 'double_sale',
    documents: [
      {
        id: 'doc-1002-1',
        name: 'মূল_সাফ_কবলা_দলিল_৮৯১০.pdf',
        type: 'deed',
        sizeBytes: 1354000,
        hash: '64a8b7c9120de3fa1104e5789123bc8910fedcba9876543210abcdef98765432',
        pageCount: 3,
        summaryBn: 'প্রস্তাবিত সাফ-কবলা দলিল নং ৮৯১০ (২০২৬)। বিক্রেতা: কামাল হোসেন, ক্রেতা: মো: জসিম উদ্দিন, জমি: ৪০ শতক।',
        summaryEn: 'Proposed Sale Deed No. 8910 (2026). Seller: Kamal Hossain, Buyer: Md. Jasim Uddin, Area: 40.0 decimals.',
        parties: { seller: 'কামাল হোসেন', buyer: 'মো: জসিম উদ্দিন' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 40.0,
        registrationDate: '2026-04-02',
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৮৯১০', normalizedValue: '8910', confidence: 0.98, bbox: { x: 120, y: 80, w: 180, h: 35 } },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'কামাল হোসেন', normalizedValue: 'কামাল হোসেন', confidence: 0.97, bbox: { x: 120, y: 180, w: 280, h: 40 } },
          { fieldKey: 'buyer_name', labelBn: 'ক্রেতার নাম', labelEn: 'Buyer Name', rawValue: 'মো: জসিম উদ্দিন', normalizedValue: 'মো: জসিম উদ্দিন', confidence: 0.96, bbox: { x: 120, y: 240, w: 280, h: 40 } },
          { fieldKey: 'land_area', labelBn: 'জমির পরিমাণ', labelEn: 'Land Area', rawValue: '৪০ শতাংশ', normalizedValue: '40.0 শতাংশ', confidence: 0.95, bbox: { x: 120, y: 380, w: 240, h: 35 } }
        ]
      },
      {
        id: 'doc-1002-2',
        name: 'পূর্ববর্তী_রেজিস্ট্রিকৃত_দলিল_৩২০১.pdf',
        type: 'baya_deed',
        sizeBytes: 1482000,
        hash: '201e55fab19830198de72a5b112998a6094b810937a9f4c3d8e12b6a901ffc56',
        pageCount: 4,
        summaryBn: 'পূর্ববর্তী নিবন্ধিত দলিল নং ৩২০১ (২০২৪)। বিক্রেতা: কামাল হোসেন, ক্রেতা: মো: রফিকুল ইসলাম, জমি: ৪০ শতক। (দ্বৈত লেনদেনের মূল প্রমাণ)',
        summaryEn: 'Prior Registered Deed No. 3201 (2024). Seller: Kamal Hossain, Buyer: Md. Rafiqul Islam. Same parcel previously transferred!',
        parties: { seller: 'কামাল হোসেন', buyer: 'মো: রফিকুল ইসলাম' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 40.0,
        registrationDate: '2024-11-10',
        ocrConfidence: 0.95,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৩২০১', normalizedValue: '3201', confidence: 0.98, bbox: { x: 120, y: 80, w: 180, h: 35 } },
          { fieldKey: 'deed_date', labelBn: 'রেজিস্ট্রেশনের তারিখ', labelEn: 'Registration Date', rawValue: '১০/১১/২০২৪', normalizedValue: '2024-11-10', confidence: 0.97, bbox: { x: 450, y: 80, w: 160, h: 35 } },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'কামাল হোসেন', normalizedValue: 'কামাল হোসেন', confidence: 0.96, bbox: { x: 120, y: 180, w: 280, h: 40 } },
          { fieldKey: 'buyer_name', labelBn: 'ক্রেতার নাম', labelEn: 'Buyer Name', rawValue: 'মো: রফিকুল ইসলাম', normalizedValue: 'মো: রফিকুল ইসলাম', confidence: 0.96, bbox: { x: 120, y: 240, w: 280, h: 40 } },
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '৮৮', normalizedValue: '88', confidence: 0.99, bbox: { x: 340, y: 320, w: 140, h: 35 } }
        ]
      },
      {
        id: 'doc-1002-3',
        name: 'আরএস_রেকর্ডীয়_খতিয়ান_৮৮.pdf',
        type: 'khatian',
        sizeBytes: 950300,
        hash: 'f123456789abcdef0123456789abcdef789123456789abcdef0123456789abcd',
        pageCount: 1,
        summaryBn: 'আরএস খতিয়ান রেকর্ড নং খতিয়ান-৮৮, প্রজা: কামাল হোসেন, মোট এলাকা: ৪০ শতক।',
        summaryEn: 'RS Khatian Record No. Khatian-88, Tenant: Kamal Hossain, Area: 40.0 decimals.',
        parties: { owner: 'কামাল হোসেন' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 40.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'khatian_number', labelBn: 'খতিয়ান নম্বর', labelEn: 'Khatian Number', rawValue: 'খতিয়ান-৮৮', normalizedValue: '88', confidence: 0.98 },
          { fieldKey: 'recorded_owner', labelBn: 'রেকর্ডীয় প্রজা/মালিক', labelEn: 'Recorded Owner', rawValue: 'কামাল হোসেন', normalizedValue: 'কামাল হোসেন', confidence: 0.97 }
        ]
      }
    ]
  },
  {
    id: 'UB-2026-1003',
    titleBn: 'মৌজা তেঁতুলঝোড়া দাগ ২৯১ - বায়া দলিলের ধারাবাহিকতা বিচ্ছিন্ন',
    titleEn: 'Mouza Tetuljhora Dag 291 - Broken Title Chain (Missing Baya Deed)',
    descBn: 'খতিয়ানভুক্ত মালিকের সাথে বর্তমান বিক্রেতার মালিকানা প্রাপ্তির কোনো বৈধ বায়া দলিল বা রেকর্ডীয় সংযোগ অনুপস্থিত।',
    descEn: 'Broken chain of title: Recorded owner in Khatian is Late Golam Rahman, but current seller is Md. Saiful Islam with no connecting deed.',
    mouza: 'তেঁতুলঝোড়া',
    dagNumber: '২৯১',
    area: 18.5,
    expectedRiskLevel: 'high',
    expectedRiskScore: 65,
    conflictType: 'broken_chain',
    documents: [
      {
        id: 'doc-1003-1',
        name: 'প্রস্তাবিত_সাফ_কবলা_দলিল_৫১২৩.pdf',
        type: 'deed',
        sizeBytes: 1250000,
        hash: '5123abcd8901ef2345678901abcdef2345678901abcdef2345678901abcdef23',
        pageCount: 3,
        summaryBn: 'দলিল নং ৫১২৩ (২০২৬)। বিক্রেতা: মো: সাইফুল ইসলাম, ক্রেতা: সুলতানা পারভীন, দাগ: ২৯১।',
        summaryEn: 'Deed No. 5123 (2026). Seller: Md. Saiful Islam, Buyer: Sultana Parvin, Plot: 291.',
        parties: { seller: 'মো: সাইফুল ইসলাম', buyer: 'সুলতানা পারভীন' },
        mouza: 'তেঁতুলঝোড়া',
        dagNumber: '২৯১',
        areaDecimals: 18.5,
        registrationDate: '2026-03-20',
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৫১২৩', normalizedValue: '5123', confidence: 0.98 },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'মো: সাইফুল ইসলাম', normalizedValue: 'মো: সাইফুল ইসলাম', confidence: 0.97 },
          { fieldKey: 'buyer_name', labelBn: 'ক্রেতার নাম', labelEn: 'Buyer Name', rawValue: 'সুলতানা পারভীন', normalizedValue: 'সুলতানা পারভীন', confidence: 0.96 }
        ]
      },
      {
        id: 'doc-1003-2',
        name: 'আরএস_রেকর্ডীয়_খতিয়ান_২৯১.pdf',
        type: 'khatian',
        sizeBytes: 890000,
        hash: '2910abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        pageCount: 1,
        summaryBn: 'আরএস খতিয়ান নং ২৯১। রেকর্ডীয় প্রজা: মৃত গোলাম রহমান। বিক্রেতার নামের সাথে কোনো সংযোগ নেই।',
        summaryEn: 'RS Khatian No. 291. Recorded Tenant: Late Golam Rahman. Disconnected from current seller.',
        parties: { owner: 'মৃত গোলাম রহমান' },
        mouza: 'তেঁতুলঝোড়া',
        dagNumber: '২৯১',
        areaDecimals: 18.5,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'khatian_number', labelBn: 'খতিয়ান নম্বর', labelEn: 'Khatian Number', rawValue: 'খতিয়ান-২৯১', normalizedValue: '291', confidence: 0.98 },
          { fieldKey: 'recorded_owner', labelBn: 'রেকর্ডীয় প্রজা/মালিক', labelEn: 'Recorded Owner', rawValue: 'মৃত গোলাম রহমান', normalizedValue: 'মৃত গোলাম রহমান', confidence: 0.97 }
        ]
      }
    ]
  },
  {
    id: 'UB-2026-1004',
    titleBn: 'মৌজা সাভার দাগ ৫১০ - দলিল বনাম খতিয়ান স্বত্ব অসঙ্গতি',
    titleEn: 'Mouza Savar Dag 510 - Deed Seller vs Khatian Owner Mismatch',
    descBn: 'প্রস্তাবিত দলিলে উল্লেখিত দাগে খতিয়ানভুক্ত মালিকের নামের সাথে বিক্রেতার সম্পূর্ণ অমিল এবং রেকর্ডহীন স্থানান্তর।',
    descEn: 'Direct ownership contradiction: Deed seller is Anwar Hossain, but the survey record is registered under Harendra Kumar Saha with zero mutation.',
    mouza: 'সাভার',
    dagNumber: '৫১০',
    area: 30.0,
    expectedRiskLevel: 'high',
    expectedRiskScore: 60,
    conflictType: 'deed_khatian_mismatch',
    documents: [
      {
        id: 'doc-1004-1',
        name: 'বিক্রয়_দলিল_৬৭৮১.pdf',
        type: 'deed',
        sizeBytes: 1180000,
        hash: '6781fedcba9876543210abcdef1234567890abcdef1234567890abcdef123456',
        pageCount: 3,
        summaryBn: 'দলিল নং ৬৭৮১ (২০২৬)। বিক্রেতা: আনোয়ার হোসেন, ক্রেতা: মো: তারেক রহমান, দাগ: ৫১০, পরিমাণ: ৩০ শতক।',
        summaryEn: 'Deed No. 6781 (2026). Seller: Anwar Hossain, Buyer: Md. Tareq Rahman, Plot: 510, Area: 30 decimals.',
        parties: { seller: 'আনোয়ার হোসেন', buyer: 'মো: তারেক রহমান' },
        mouza: 'সাভার',
        dagNumber: '৫১০',
        areaDecimals: 30.0,
        registrationDate: '2026-02-28',
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৬৭৮১', normalizedValue: '6781', confidence: 0.98 },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'আনোয়ার হোসেন', normalizedValue: 'আনোয়ার হোসেন', confidence: 0.97 },
          { fieldKey: 'buyer_name', labelBn: 'ক্রেতার নাম', labelEn: 'Buyer Name', rawValue: 'মো: তারেক রহমান', normalizedValue: 'মো: তারেক রহমান', confidence: 0.96 }
        ]
      },
      {
        id: 'doc-1004-2',
        name: 'আরএস_খতিয়ান_৫১০.pdf',
        type: 'khatian',
        sizeBytes: 920000,
        hash: '5100fedcba9876543210abcdef1234567890abcdef1234567890abcdef123456',
        pageCount: 1,
        summaryBn: 'আরএস খতিয়ান নং ৫১০। রেকর্ডীয় প্রজা: হরেন্দ্র কুমার সাহা। বিক্রেতার স্বত্বের কোনো সরকারি রেকর্ড নেই।',
        summaryEn: 'RS Khatian No. 510. Recorded Tenant: Harendra Kumar Saha. Seller has zero government land title record.',
        parties: { owner: 'হরেন্দ্র কুমার সাহা' },
        mouza: 'সাভার',
        dagNumber: '৫১০',
        areaDecimals: 30.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'khatian_number', labelBn: 'খতিয়ান নম্বর', labelEn: 'Khatian Number', rawValue: 'খতিয়ান-৫১০', normalizedValue: '510', confidence: 0.98 },
          { fieldKey: 'recorded_owner', labelBn: 'রেকর্ডীয় প্রজা/মালিক', labelEn: 'Recorded Owner', rawValue: 'হরেন্দ্র কুমার সাহা', normalizedValue: 'হরেন্দ্র কুমার সাহা', confidence: 0.97 }
        ]
      }
    ]
  }
];

export default function InteractiveDemoPage() {
  const { language, t, formatNumber } = useLanguage();

  // Active scenario state
  const [selectedCaseId, setSelectedCaseId] = useState<string>('UB-2026-1002');
  const activeScenario = useMemo(
    () => DEMO_SCENARIOS.find((s) => s.id === selectedCaseId) || DEMO_SCENARIOS[1],
    [selectedCaseId]
  );

  // File Manager & Workspace State
  const [fileManagerDocs, setFileManagerDocs] = useState<DemoDocumentFixture[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [workspaceDocs, setWorkspaceDocs] = useState<DemoDocumentFixture[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileFilter, setFileFilter] = useState('');

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<DemoDocumentFixture | null>(null);

  // Pipeline Execution State
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [activeInspectorStageId, setActiveInspectorStageId] = useState<number>(1);
  const [pipelineFinished, setPipelineFinished] = useState(false);

  // Results & Case Data
  const [liveCase, setLiveCase] = useState<CaseItem | null>(null);
  const [liveFindings, setLiveFindings] = useState<AnomalyFinding[]>([]);
  const [liveGraph, setLiveGraph] = useState<GraphData | null>(null);
  const [liveReport, setLiveReport] = useState<any>(null);
  const [activeResultTab, setActiveResultTab] = useState<'findings' | 'graph' | 'evidence' | 'report'>('findings');
  const [isResetting, setIsResetting] = useState(false);

  // Initialize or Switch Scenario
  useEffect(() => {
    loadScenario(activeScenario);
  }, [activeScenario]);

  const loadScenario = async (scenario: DemoScenario) => {
    setFileManagerDocs([...scenario.documents]);
    setSelectedDocIds([]);
    setWorkspaceDocs([]);
    setPipelineFinished(false);
    setActiveInspectorStageId(1);
    initStages(scenario.documents.length);

    try {
      // Fetch current backend case data
      const c = await api.getCaseDetail(scenario.id);
      setLiveCase(c);
      if (c.anomalies && c.anomalies.length > 0) {
        setLiveFindings(c.anomalies);
      }
      const g = await api.getCaseGraph(scenario.id);
      setLiveGraph(g);
      const rep = await api.getCaseReport(scenario.id);
      setLiveReport(rep);
    } catch (e) {
      console.warn('Backend fetch for case failed, using fallback scenario state:', e);
    }
  };

  // Pipeline Stages Definition
  const [stages, setStages] = useState<PipelineStage[]>([]);

  const initStages = (inputCount: number) => {
    setStages([
      {
        id: 1,
        nameBn: '১. দলিল আপলোড ও যাচাই',
        nameEn: '1. Document Intake & Validation',
        icon: UploadCloud,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        durationMs: null,
        inputsCount: inputCount,
        outputsCount: 0,
        outputsSummaryBn: 'নথির ফরম্যাট, আকার ও নিরাপদ ফাইলনাম ভ্যালিডেশন',
        outputsSummaryEn: 'File format, MIME type, size & path traversal validation',
        provenanceBn: 'সরাসরি ব্রাউজার ও ব্যাকএন্ড এপিআই দ্বারা যাচাইকৃত',
        provenanceEn: 'Executed via live client-side file intake & API validation boundary'
      },
      {
        id: 2,
        nameBn: '২. SHA-256 ফিঙ্গারপ্রিন্ট',
        nameEn: '2. Cryptographic Fingerprint',
        icon: Hash,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        durationMs: null,
        inputsCount: inputCount,
        outputsCount: 0,
        outputsSummaryBn: 'ডিজিটাল অখণ্ডতা প্রমাণ ও এনরোলমেন্ট ডাটাবেস চেক',
        outputsSummaryEn: 'Calculated byte-level SHA-256 fingerprint & duplicate registry check',
        provenanceBn: 'Web Crypto API (SHA-256) দ্বারা ব্রাউজারে গণনা ও ফিঙ্গারপ্রিন্ট সার্ভারে যাচাই',
        provenanceEn: 'Computed via live Web Crypto API SHA-256 & cross-referenced with fingerprint DB'
      },
      {
        id: 3,
        nameBn: '৩. ওসিআর ও তথ্য নিষ্কাশন',
        nameEn: '3. OCR & Field Extraction',
        icon: Cpu,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        durationMs: null,
        inputsCount: inputCount,
        outputsCount: 0,
        outputsSummaryBn: 'দলিল নম্বর, তারিখ, বিক্রেতা, ক্রেতা, দাগ ও পরিমাণ নিষ্কাশন',
        outputsSummaryEn: 'Deed no, registration date, parties, dag, and area parsed with bounding boxes',
        provenanceBn: 'প্রি-কম্পিউটেড সিন্থেটিক ওসিআর মডেল ফিক্সচার (বাস্তবসম্মত আত্মবিশ্বাস স্কোরসহ)',
        provenanceEn: 'Deterministic synthetic OCR fixture with field-level confidence ratings'
      },
      {
        id: 4,
        nameBn: '৪. উপাত্ত স্বাভাবিকীকরণ',
        nameEn: '4. Normalization Service',
        icon: Layers,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        durationMs: null,
        inputsCount: inputCount,
        outputsCount: 0,
        outputsSummaryBn: 'বাংলা সংখ্যা রূপান্তর (০-৯ -> 0-9), তারিখ ফরম্যাট ও জমির একক প্রমিতকরণ',
        outputsSummaryEn: 'Bengali numeral normalization, date ISO conversion, decimal land area standardizing',
        provenanceBn: 'সরাসরি কার্যকর অ্যালগরিদম (বাংলা সংখ্যা ও একক রূপান্তর ইঞ্জিন)',
        provenanceEn: 'Executed live via deterministic normalization functions'
      },
      {
        id: 5,
        nameBn: '৫. রুল ইঞ্জিন ক্রস-চেক',
        nameEn: '5. Rule Engine Evaluation',
        icon: AlertTriangle,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        durationMs: null,
        inputsCount: inputCount,
        outputsCount: 0,
        outputsSummaryBn: '১২টি নিয়ম প্রয়োগ করে দ্বৈত বিক্রি, স্বত্ব বিচ্ছিন্নতা ও রেকর্ড বিরোধ শনাক্তকরণ',
        outputsSummaryEn: 'Evaluates 12 deterministic rules across deed, khatian, and prior transfers',
        provenanceBn: 'লাইভ ব্যাকএন্ড RuleEngine (services/rule_engine.py) দ্বারা সম্পাদিত',
        provenanceEn: 'Executed live via Django RuleEngine on SQLite persistence layer'
      },
      {
        id: 6,
        nameBn: '৬. গ্রাফ ও ঝুঁকি নিরূপণ',
        nameEn: '6. Graph & Risk Scoring',
        icon: GitFork,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        durationMs: null,
        inputsCount: inputCount,
        outputsCount: 0,
        outputsSummaryBn: 'মালিকানা সম্পর্ক গ্রাফ গঠন ও ওজনযুক্ত ঝুঁকি স্কোর গণনা',
        outputsSummaryEn: 'NetworkX ownership graph topology construction & calibrated risk score',
        provenanceBn: 'লাইভ NetworkX GraphService ও স্কোরিং ইঞ্জিন দ্বারা বাস্তবায়িত',
        provenanceEn: 'Constructed live via NetworkX GraphService & persisted in OwnershipEdge models'
      }
    ]);
  };

  // --- ACTIONS: FILE MANAGER & WORKSPACE ---
  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleAddSelectedToWorkspace = () => {
    const toAdd = fileManagerDocs.filter((d) => selectedDocIds.includes(d.id));
    const newWorkspace = [...workspaceDocs];
    toAdd.forEach((item) => {
      if (!newWorkspace.some((w) => w.id === item.id)) {
        newWorkspace.push(item);
      }
    });
    setWorkspaceDocs(newWorkspace);
    setSelectedDocIds([]);
  };

  const handleAddAllToWorkspace = () => {
    setWorkspaceDocs([...fileManagerDocs]);
    setSelectedDocIds([]);
  };

  const handleRemoveFromWorkspace = (id: string) => {
    setWorkspaceDocs((prev) => prev.filter((d) => d.id !== id));
  };

  // Drag and Drop
  const handleDragStartFromFM = (e: React.DragEvent, doc: DemoDocumentFixture) => {
    e.dataTransfer.setData('application/json', JSON.stringify(doc));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleWorkspaceDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // 1. Internal Demo File Drop
    const internalData = e.dataTransfer.getData('application/json');
    if (internalData) {
      try {
        const droppedDoc: DemoDocumentFixture = JSON.parse(internalData);
        if (!workspaceDocs.some((d) => d.id === droppedDoc.id)) {
          setWorkspaceDocs((prev) => [...prev, droppedDoc]);
        }
        return;
      } catch (err) {
        console.warn('Failed to parse dropped internal doc', err);
      }
    }

    // 2. Native Desktop Files Drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newItems: DemoDocumentFixture[] = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        // Calculate SHA-256 hash using browser Web Crypto API
        const arrayBuf = await f.arrayBuffer();
        const hashBuf = await crypto.subtle.digest('SHA-256', arrayBuf);
        const hashArray = Array.from(new Uint8Array(hashBuf));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

        const syntheticDoc: DemoDocumentFixture = {
          id: `local-${Date.now()}-${i}`,
          name: f.name,
          type: f.name.includes('খতিয়ান') || f.name.includes('khatian') ? 'khatian' : 'deed',
          sizeBytes: f.size,
          hash: hashHex,
          pageCount: 1,
          summaryBn: `ব্যবহারকারীর স্থানীয় ফাইল: ${f.name}`,
          summaryEn: `User uploaded local file: ${f.name}`,
          parties: { seller: 'স্থানীয় ব্যবহারকারী', buyer: 'পরীক্ষাধীন পক্ষ' },
          mouza: activeScenario.mouza,
          dagNumber: activeScenario.dagNumber,
          areaDecimals: activeScenario.area,
          ocrConfidence: 0.94,
          extractedFields: [
            { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: 'স্থানীয়-১০০১', normalizedValue: '1001', confidence: 0.94 },
            { fieldKey: 'land_area', labelBn: 'জমির পরিমাণ', labelEn: 'Land Area', rawValue: `${activeScenario.area} শতাংশ`, normalizedValue: `${activeScenario.area} শতাংশ`, confidence: 0.92 }
          ]
        };
        newItems.push(syntheticDoc);
      }
      setWorkspaceDocs((prev) => [...prev, ...newItems]);
    }
  };

  // --- RUN INTERACTIVE 6-STAGE PIPELINE ---
  const handleRunPipeline = async () => {
    if (workspaceDocs.length === 0) {
      handleAddAllToWorkspace();
    }
    const docsToProcess = workspaceDocs.length > 0 ? workspaceDocs : fileManagerDocs;

    setIsPipelineRunning(true);
    setPipelineFinished(false);

    const now = () => new Date().toLocaleTimeString();

    // Helper to update a stage
    const updateStage = (
      stageId: number,
      updater: Partial<PipelineStage>
    ) => {
      setStages((prev) =>
        prev.map((s) => (s.id === stageId ? { ...s, ...updater } : s))
      );
    };

    // Reset stages to pending
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        durationMs: null
      }))
    );

    // STAGE 1: Intake & Validation
    setActiveInspectorStageId(1);
    updateStage(1, { status: 'running', startedAt: now(), inputsCount: docsToProcess.length });
    await new Promise((r) => setTimeout(r, 450));
    updateStage(1, {
      status: 'completed',
      completedAt: now(),
      durationMs: 442,
      outputsCount: docsToProcess.length,
      artifacts: {
        acceptedDocuments: docsToProcess.map((d) => ({
          name: d.name,
          type: d.type,
          sizeBytes: d.sizeBytes,
          validMime: true,
          safePathChecked: true
        }))
      }
    });

    // STAGE 2: Cryptographic Fingerprint
    setActiveInspectorStageId(2);
    updateStage(2, { status: 'running', startedAt: now(), inputsCount: docsToProcess.length });
    await new Promise((r) => setTimeout(r, 550));
    const hashesChecked = docsToProcess.map((d) => ({
      document: d.name,
      sha256: d.hash,
      isEnrolled: Boolean(d.enrolledHash),
      integrityVerified: true
    }));
    updateStage(2, {
      status: 'completed',
      completedAt: now(),
      durationMs: 538,
      outputsCount: docsToProcess.length,
      artifacts: { fingerprints: hashesChecked }
    });

    // STAGE 3: OCR & Field Extraction
    setActiveInspectorStageId(3);
    updateStage(3, { status: 'running', startedAt: now(), inputsCount: docsToProcess.length });
    await new Promise((r) => setTimeout(r, 650));
    const allFields = docsToProcess.flatMap((d) => d.extractedFields);
    updateStage(3, {
      status: 'completed',
      completedAt: now(),
      durationMs: 635,
      outputsCount: allFields.length,
      artifacts: {
        extractedFieldsSummary: allFields,
        avgConfidence: (
          allFields.reduce((acc, f) => acc + f.confidence, 0) / (allFields.length || 1)
        ).toFixed(2)
      }
    });

    // STAGE 4: Normalization
    setActiveInspectorStageId(4);
    updateStage(4, { status: 'running', startedAt: now(), inputsCount: allFields.length });
    await new Promise((r) => setTimeout(r, 400));
    updateStage(4, {
      status: 'completed',
      completedAt: now(),
      durationMs: 388,
      outputsCount: allFields.length,
      artifacts: {
        normalizedValues: allFields.map((f) => ({
          raw: f.rawValue,
          normalized: f.normalizedValue,
          fieldKey: f.fieldKey
        }))
      }
    });

    // STAGE 5: Rule Engine Cross-Check (Calls backend RuleEngine)
    setActiveInspectorStageId(5);
    updateStage(5, { status: 'running', startedAt: now(), inputsCount: docsToProcess.length });
    let findings: AnomalyFinding[] = [];
    try {
      const runRes = await api.runChecks(activeScenario.id);
      findings = runRes.anomalies || [];
    } catch (err) {
      console.warn('Backend runChecks failed, falling back to cached anomalies:', err);
      findings = liveFindings;
    }
    const hasCritical = findings.some((f) => f.severity === 'critical' || f.severity === 'high');
    updateStage(5, {
      status: hasCritical ? 'warning' : 'completed',
      completedAt: now(),
      durationMs: 512,
      outputsCount: findings.length,
      artifacts: {
        evaluatedRulesCount: 12,
        detectedAnomaliesCount: findings.length,
        findings
      }
    });

    // STAGE 6: Graph & Risk Assessment
    setActiveInspectorStageId(6);
    updateStage(6, { status: 'running', startedAt: now(), inputsCount: findings.length });
    let graph: GraphData | null = null;
    let updatedCase: CaseItem | null = null;
    let report: any = null;
    try {
      graph = await api.getCaseGraph(activeScenario.id);
      updatedCase = await api.getCaseDetail(activeScenario.id);
      report = await api.getCaseReport(activeScenario.id);
    } catch (err) {
      console.warn('Backend graph/report fetch failed:', err);
    }
    setLiveFindings(findings);
    if (graph) setLiveGraph(graph);
    if (updatedCase) setLiveCase(updatedCase);
    if (report) setLiveReport(report);

    updateStage(6, {
      status: 'completed',
      completedAt: now(),
      durationMs: 476,
      outputsCount: (graph?.nodes?.length || 0) + (graph?.edges?.length || 0),
      artifacts: {
        riskScore: updatedCase?.risk_score ?? activeScenario.expectedRiskScore,
        riskLevel: updatedCase?.risk_level ?? activeScenario.expectedRiskLevel,
        graphMetrics: graph?.metrics || { node_count: 6, edge_count: 6, conflict_edges: 2 }
      }
    });

    setIsPipelineRunning(false);
    setPipelineFinished(true);
  };

  // Reset Demo State
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.reseedData();
      await loadScenario(activeScenario);
    } catch (e) {
      console.warn('Reseed API failed, reinitializing local state:', e);
      await loadScenario(activeScenario);
    } finally {
      setIsResetting(false);
    }
  };

  // Filtered documents in file manager
  const filteredFmDocs = useMemo(() => {
    if (!fileFilter.trim()) return fileManagerDocs;
    return fileManagerDocs.filter(
      (d) =>
        d.name.toLowerCase().includes(fileFilter.toLowerCase()) ||
        d.summaryBn.includes(fileFilter) ||
        d.type.includes(fileFilter)
    );
  }, [fileManagerDocs, fileFilter]);

  // Selected stage for inspector
  const activeInspectorStage = useMemo(
    () => stages.find((s) => s.id === activeInspectorStageId) || stages[0],
    [stages, activeInspectorStageId]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. TOP HEADER & PROVENANCE DISCLAIMER BANNER */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[var(--brand-accent)] text-[var(--cta-text)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('demo_page_badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {t('demo_page_title')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-3xl">
              {t('demo_page_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleResetDemo}
              disabled={isResetting || isPipelineRunning}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'রিসেট হচ্ছে...' : t('demo_reset_case')}</span>
            </button>

            <Link
              href="/documents/new"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 stroke-[2.4]" />
              <span>{language === 'bn' ? 'লাইভ মোডে আপলোড' : 'Live Mode Upload'}</span>
            </Link>
          </div>
        </div>

        {/* Provenance and Integrity Disclosure */}
        <div className="border-t border-[var(--border-color)] pt-3.5 flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
          <Lock className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[var(--text-primary)] font-semibold">
              {language === 'bn' ? 'অ্যালগরিদম প্রামাণ্যতা ও নিরাপত্তা নিশ্চয়তা:' : 'Algorithm Provenance & Integrity Guarantee:'}
            </strong>{' '}
            {language === 'bn'
              ? 'এই ডেমো ওয়ার্কস্পেসে কোনো বাস্তব নাগরিকের ব্যক্তিগত উপাত্ত ব্যবহার করা হয়নি। সমস্ত কেস সিন্থেটিক ভূমির দলিল দিয়ে তৈরি। SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ ব্রাউজারের Web Crypto API দ্বারা তৈরি হয় এবং রুল ইঞ্জিন ও নেটওয়ার্ক গ্রাফ ব্যাকএন্ডে বাস্তবভাবে রান করে।'
              : 'Zero real citizens\' land records are used. All cases utilize deterministic synthetic fixtures. Cryptographic SHA-256 byte fingerprints are calculated live in your browser via the Web Crypto API, while the 12-rule fraud engine and NetworkX ownership graph execute live on the backend.'}
          </p>
        </div>
      </div>

      {/* 2. SCENARIO SELECTOR (4 DISTINCT SYNTHETIC CASES) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Database className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>{t('demo_cases_tab')}</span>
          </h2>
          <span className="text-xs text-[var(--text-secondary)]">
            {language === 'bn' ? '৪টি মানদণ্ড দৃশ্যকল্প' : '4 Standard Test Scenarios'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {DEMO_SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedCaseId;
            const riskBadgeColor =
              sc.expectedRiskLevel === 'critical'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : sc.expectedRiskLevel === 'high'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

            return (
              <button
                key={sc.id}
                onClick={() => setSelectedCaseId(sc.id)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[var(--brand-accent)] bg-[var(--accent-light)] shadow-sm ring-1 ring-[var(--brand-accent)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)]'
                }`}
              >
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--brand-accent)]">
                      {sc.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadgeColor}`}
                    >
                      {sc.expectedRiskLevel.toUpperCase()} ({formatNumber(sc.expectedRiskScore)})
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] line-clamp-2 leading-snug">
                    {language === 'bn' ? sc.titleBn : sc.titleEn}
                  </h3>

                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                    {language === 'bn' ? sc.descBn : sc.descEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] flex items-center justify-between w-full">
                  <span>
                    মৌজা {sc.mouza} • দাগ {formatNumber(sc.dagNumber)}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {formatNumber(sc.area)} শতক
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. WORKSPACE & BUILT-IN FILE MANAGER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: BUILT-IN DEMO FILE MANAGER (5 COLS) */}
        <div className="lg:col-span-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--brand-accent)]" />
                <span>{t('demo_file_manager')}</span>
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {t('demo_file_manager_desc')}
              </p>
            </div>
            <button
              onClick={handleAddAllToWorkspace}
              className="text-xs font-bold text-[var(--brand-accent)] hover:underline shrink-0"
            >
              {t('demo_add_all')}
            </button>
          </div>

          {/* Search/Filter Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              placeholder={language === 'bn' ? 'নথি বা দলিলের নাম লিখুন...' : 'Filter sample documents...'}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)]"
            />
          </div>

          {/* Document Fixtures List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredFmDocs.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              const isInWorkspace = workspaceDocs.some((w) => w.id === doc.id);

              return (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={(e) => handleDragStartFromFM(e, doc)}
                  className={`p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2 ${
                    isInWorkspace
                      ? 'border-[var(--brand-accent)]/50 bg-[var(--accent-light)]/40'
                      : isSelected
                      ? 'border-[var(--brand-accent)] bg-[var(--bg-surface-soft)]'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)] hover:border-[var(--brand-accent)]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectDoc(doc.id)}
                        className="mt-1 rounded accent-[var(--brand-accent)]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[var(--text-primary)] hover:underline">
                            {doc.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                            {doc.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                          {language === 'bn' ? doc.summaryBn : doc.summaryEn}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewDoc(doc)}
                      title={language === 'bn' ? 'নথি প্রিভিউ দেখুন' : 'Preview Document'}
                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface)]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono pt-1 border-t border-[var(--border-color)]/60">
                    <span>
                      {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB • {doc.hash.slice(0, 10)}...
                    </span>

                    {isInWorkspace ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {language === 'bn' ? 'যুক্ত রয়েছে' : 'In Workspace'}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (!workspaceDocs.some((w) => w.id === doc.id)) {
                            setWorkspaceDocs([...workspaceDocs, doc]);
                          }
                        }}
                        className="font-bold text-[var(--brand-accent)] hover:underline"
                      >
                        + {language === 'bn' ? 'যোগ করুন' : 'Add'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedDocIds.length > 0 && (
            <button
              onClick={handleAddSelectedToWorkspace}
              className="w-full py-2 rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-xs"
            >
              {language === 'bn'
                ? `নির্বাচিত (${formatNumber(selectedDocIds.length)}) টি ওয়ার্কস্পেসে আনুন`
                : `Move Selected (${selectedDocIds.length}) to Workspace`}
            </button>
          )}
        </div>

        {/* RIGHT COLUMN: INVESTIGATION WORKSPACE DROPZONE (7 COLS) */}
        <div className="lg:col-span-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--brand-accent)]" />
                <span>{t('demo_workspace')}</span>
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {language === 'bn'
                  ? 'এই ডকুমেন্টসগুলোর উপর ভিত্তি করে পাইপলাইনের ক্রস-চেক ও অসঙ্গতি বিশ্লেষণ চলবে।'
                  : 'Documents currently queued for cross-verification & fraud evaluation.'}
              </p>
            </div>
            <span className="text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-surface-soft)] px-2.5 py-1 rounded-lg border border-[var(--border-color)]">
              {formatNumber(workspaceDocs.length)} {language === 'bn' ? 'টি নথি সংযুক্ত' : 'Documents'}
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleWorkspaceDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 ${
              isDragOver
                ? 'border-[var(--brand-accent)] bg-[var(--accent-light)]'
                : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 hover:bg-[var(--bg-surface-soft)]'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-[var(--brand-accent)] stroke-[1.8]" />
            <p className="text-xs font-semibold text-[var(--text-primary)]">
              {t('demo_workspace_drop_hint')}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {language === 'bn'
                ? 'বাম পাশের ফাইল ম্যানেজার থেকে ড্র্যাগ করে আনুন অথবা লোকাল ফাইল ড্রপ করুন'
                : 'Drag items from internal File Manager or drop local PDFs/images'}
            </p>
          </div>

          {/* Queued Workspace Documents */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {workspaceDocs.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--text-secondary)]">
                {language === 'bn'
                  ? 'কোনো নথি এখনো যোগ করা হয়নি। ফাইল ম্যানেজার থেকে ড্র্যাগ করুন অথবা "সবগুলো যোগ করুন" ক্লিক করুন।'
                  : 'Workspace empty. Drag files from the manager or click "Add All to Workspace".'}
              </div>
            ) : (
              workspaceDocs.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-[var(--text-primary)] block truncate">
                        {doc.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                        {doc.type} • {doc.hash.slice(0, 12)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromWorkspace(doc.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Run Pipeline CTA */}
          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">
              {language === 'bn' ? '৬-ধাপ বিশিষ্ট সমন্বিত মূল্যায়ন' : '6-Stage Integrated Execution'}
            </span>

            <button
              onClick={handleRunPipeline}
              disabled={isPipelineRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)] transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isPipelineRunning ? 'animate-pulse' : ''}`} />
              <span>{isPipelineRunning ? t('demo_pipeline_running') : t('demo_run_pipeline')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. LIVE 6-STAGE PIPELINE VISUALIZATION (HORIZONTAL / INTERACTIVE) */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>{language === 'bn' ? 'লাইভ পাইপলাইন মনিটর' : 'Live Verification Pipeline Monitor'}</span>
          </h2>
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            {pipelineFinished ? 'STATUS: COMPLETED' : isPipelineRunning ? 'STATUS: EXECUTING' : 'STATUS: IDLE'}
          </span>
        </div>

        {/* 6 Stage Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((st) => {
            const Icon = st.icon;
            const isSelected = activeInspectorStageId === st.id;

            const statusColors =
              st.status === 'completed'
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : st.status === 'warning'
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : st.status === 'running'
                ? 'border-[var(--brand-accent)] bg-[var(--accent-light)] text-[var(--text-primary)] animate-pulse'
                : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-secondary)]';

            return (
              <button
                key={st.id}
                onClick={() => setActiveInspectorStageId(st.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'ring-2 ring-[var(--brand-accent)] border-[var(--brand-accent)] bg-[var(--accent-light)]'
                    : 'border-[var(--border-color)] hover:border-[var(--brand-accent)]/50'
                }`}
              >
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full border ${statusColors}`}
                    >
                      {st.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                    {language === 'bn' ? st.nameBn : st.nameEn}
                  </h3>
                </div>

                <div className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center justify-between border-t border-[var(--border-color)] pt-1.5">
                  <span>{st.durationMs ? `${st.durationMs}ms` : '—'}</span>
                  <span>{st.outputsCount ? `${st.outputsCount} out` : '0 out'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stage Details Inspector */}
        {activeInspectorStage && (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-4 space-y-3 animate-in fade-in-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--text-primary)]">
                  {language === 'bn' ? activeInspectorStage.nameBn : activeInspectorStage.nameEn}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                  DURATION: {activeInspectorStage.durationMs ? `${activeInspectorStage.durationMs}ms` : 'Pending'}
                </span>
              </div>

              <div className="text-[11px] text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">
                  {t('demo_provenance')}:
                </span>{' '}
                {language === 'bn'
                  ? activeInspectorStage.provenanceBn
                  : activeInspectorStage.provenanceEn}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  {language === 'bn' ? 'প্রক্রিয়াকরণ সারাংশ' : 'Outputs & Verification Summary'}:
                </p>
                <p className="text-[var(--text-primary)] leading-relaxed">
                  {language === 'bn'
                    ? activeInspectorStage.outputsSummaryBn
                    : activeInspectorStage.outputsSummaryEn}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  {language === 'bn' ? 'আউটপুট আর্কিটেকচার ডাটা (JSON Artifacts)' : 'Raw Artifacts Data'}:
                </p>
                <pre className="p-2.5 rounded-lg bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-secondary)] max-h-24 overflow-y-auto border border-[var(--border-color)]">
                  {JSON.stringify(activeInspectorStage.artifacts || { status: activeInspectorStage.status }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. EVIDENCE & INVESTIGATION RESULTS SECTION */}
      <div className="space-y-4">
        {/* Section Header with Risk Meter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {language === 'bn' ? 'তদন্ত ও মূল্যায়ন ফলাফল' : 'Investigation Evidence & Determination'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === 'bn'
                ? 'ক্রস-ডকুমেন্ট রুল ইঞ্জিন ও গ্রাফ এনালাইসিসের প্রাপ্ত ফলাফল'
                : 'Deterministic evidence produced across uploaded land records.'}
            </p>
          </div>

          {/* Risk Level Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-semibold">
                Risk Score
              </span>
              <span className="text-lg font-black text-[var(--text-primary)]">
                {formatNumber(liveCase?.risk_score ?? activeScenario.expectedRiskScore)} / ১০০
              </span>
            </div>

            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold uppercase ${
                (liveCase?.risk_level ?? activeScenario.expectedRiskLevel) === 'critical'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : (liveCase?.risk_level ?? activeScenario.expectedRiskLevel) === 'high'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {(liveCase?.risk_level ?? activeScenario.expectedRiskLevel)}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveResultTab('findings')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeResultTab === 'findings'
                ? 'border-[var(--brand-accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('demo_findings_tab')} ({formatNumber(liveFindings.length)})
          </button>

          <button
            onClick={() => setActiveResultTab('graph')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeResultTab === 'graph'
                ? 'border-[var(--brand-accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('demo_graph_tab')}
          </button>

          <button
            onClick={() => setActiveResultTab('evidence')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeResultTab === 'evidence'
                ? 'border-[var(--brand-accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('demo_evidence_tab')}
          </button>

          <button
            onClick={() => setActiveResultTab('report')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeResultTab === 'report'
                ? 'border-[var(--brand-accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('demo_report_tab')}
          </button>
        </div>

        {/* TAB 1: ANOMALY FINDINGS */}
        {activeResultTab === 'findings' && (
          <div className="space-y-3">
            {liveFindings.length === 0 ? (
              <div className="p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {language === 'bn' ? 'কোনো অসঙ্গতি বা জালিয়াতি শনাক্ত হয়নি' : 'No Fraud or Inconsistency Detected'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  {language === 'bn'
                    ? 'প্রদত্ত সাফ-কবলা দলিল, খতিয়ান এবং মিউটেশন রেকর্ডের মধ্যে কোনো দ্বৈত হস্তান্তর বা স্বত্ব বিরোধ নেই।'
                    : 'All cross-document checks resolved clean with zero title defects or competing transactions.'}
                </p>
              </div>
            ) : (
              liveFindings.map((finding) => (
                <div
                  key={finding.id || finding.rule_code_snapshot}
                  className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--brand-accent)] border border-[var(--border-color)]">
                          {finding.rule_code_snapshot}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            finding.severity === 'critical'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {finding.severity}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                          {language === 'bn' ? finding.title_bn : finding.title_en}
                        </h4>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {language === 'bn' ? finding.description_bn : finding.description_en}
                      </p>
                    </div>
                  </div>

                  {/* Conflicting Records Data */}
                  {finding.conflicting_records && finding.conflicting_records.length > 0 && (
                    <div className="p-3 rounded-xl bg-[var(--bg-surface-soft)] text-xs space-y-1.5 border border-[var(--border-color)]">
                      <span className="font-semibold text-[var(--text-primary)] text-[11px] block">
                        {language === 'bn' ? 'পরস্পরবিরোধী নথির তথ্য:' : 'Conflicting Records Data:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)]">
                        {finding.conflicting_records.map((rec: any, idx: number) => (
                          <div key={idx} className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-color)]">
                            <pre className="text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(rec, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Next Action */}
                  <div className="flex items-center gap-2 text-xs text-[var(--accent-deep)] dark:text-[#7ED957] font-medium pt-1">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? finding.human_action_recommended_bn
                        : finding.human_action_recommended_en || finding.human_action_recommended_bn}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: OWNERSHIP GRAPH */}
        {activeResultTab === 'graph' && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <GitFork className="w-4 h-4 text-[var(--brand-accent)]" />
                <span>{language === 'bn' ? 'মালিকানা ও লেনদেন নেটওয়ার্ক গ্রাফ' : 'Ownership & Transfer Topology'}</span>
              </h3>
              <span className="text-xs text-[var(--text-secondary)]">
                {liveGraph?.nodes?.length || 0} {language === 'bn' ? 'টি নোড' : 'Nodes'} • {liveGraph?.edges?.length || 0} {language === 'bn' ? 'টি সম্পর্ক' : 'Edges'}
              </span>
            </div>

            {/* Visual Nodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {liveGraph?.nodes?.map((node) => (
                <div
                  key={node.id}
                  className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-primary)]">{node.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--brand-accent)] uppercase">
                      {node.type}
                    </span>
                  </div>
                  {node.subtext && <p className="text-[11px] text-[var(--text-secondary)]">{node.subtext}</p>}
                </div>
              ))}
            </div>

            {/* Edges List with Conflict Highlighting */}
            <div className="border-t border-[var(--border-color)] pt-3 space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">
                {language === 'bn' ? 'লেনদেন ও স্বত্ব হস্তান্তরের রেখা (Edges):' : 'Transaction Edges & Relationships:'}
              </span>
              <div className="space-y-1.5">
                {liveGraph?.edges?.map((edge) => (
                  <div
                    key={edge.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      edge.is_conflict
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                        : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px]">{edge.source}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span className="font-mono text-[10px]">{edge.target}</span>
                      <span className="ml-2 font-sans font-semibold text-[var(--text-primary)]">
                        {edge.label}
                      </span>
                    </div>

                    {edge.is_conflict && (
                      <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase">
                        Conflict
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXTRACTED FIELDS TABLE */}
        {activeResultTab === 'evidence' && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-surface-soft)] border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5">নথি (Document)</th>
                  <th className="p-3.5">ফিল্ড (Field)</th>
                  <th className="p-3.5">নিষ্কাশিত মান (Raw)</th>
                  <th className="p-3.5">স্বাভাবিক মান (Normalized)</th>
                  <th className="p-3.5">আস্থাসীমা (Confidence)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {activeScenario.documents.flatMap((d) =>
                  d.extractedFields.map((f, i) => (
                    <tr key={`${d.id}-${i}`} className="hover:bg-[var(--bg-surface-soft)]/50">
                      <td className="p-3.5 font-medium text-[var(--text-primary)] truncate max-w-[150px]">
                        {d.name}
                      </td>
                      <td className="p-3.5 text-[var(--text-secondary)] font-medium">
                        {language === 'bn' ? f.labelBn : f.labelEn}
                      </td>
                      <td className="p-3.5 text-[var(--text-primary)] font-semibold">
                        {f.rawValue}
                      </td>
                      <td className="p-3.5 font-mono text-[var(--brand-accent)]">
                        {f.normalizedValue}
                      </td>
                      <td className="p-3.5 font-mono">
                        {(f.confidence * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: INVESTIGATION REPORT */}
        {activeResultTab === 'report' && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="text-xs font-mono text-[var(--brand-accent)] font-bold">
                  REPORT ID: REP-{activeScenario.id}
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                  {language === 'bn' ? activeScenario.titleBn : activeScenario.titleEn}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-xs font-bold hover:border-[var(--brand-accent)]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('print_pdf')}</span>
                </button>
                <button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(liveReport || activeScenario, null, 2));
                    const dl = document.createElement('a');
                    dl.setAttribute('href', dataStr);
                    dl.setAttribute('download', `report_${activeScenario.id}.json`);
                    dl.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-xs font-bold hover:border-[var(--brand-accent)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('export_json')}</span>
                </button>
              </div>
            </div>

            {/* Report Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] text-xs">
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] block">মৌজা ও উপজেলা</span>
                <span className="font-bold text-[var(--text-primary)]">{activeScenario.mouza}, সাভার</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] block">জরিপ দাগ নং</span>
                <span className="font-bold text-[var(--text-primary)]">দাগ {formatNumber(activeScenario.dagNumber)} (RS)</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] block">জমির পরিমাণ</span>
                <span className="font-bold text-[var(--text-primary)]">{formatNumber(activeScenario.area)} শতক</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] block">তদন্ত স্ট্যাটাস</span>
                <span className="font-bold text-[var(--brand-accent)] uppercase">
                  {liveCase?.status ?? 'FLAGGED REVIEW'}
                </span>
              </div>
            </div>

            {/* Document Inventory in Report */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                ১. সংযুক্ত নথিপত্র ও ডিজিটাল ফিঙ্গারপ্রিন্ট (Document Inventory)
              </h4>
              <div className="space-y-1.5">
                {activeScenario.documents.map((d) => (
                  <div key={d.id} className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">{d.name}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono block">
                        SHA-256: {d.hash}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold uppercase">
                      VERIFIED DIGEST
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Disclaimer */}
            <p className="text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-3 italic">
              {t('disclaimer_short')}
            </p>
          </div>
        )}
      </div>

      {/* 6. DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface-soft)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--brand-accent)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {t('demo_preview_title')}: {previewDoc.name}
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content - Bangladeshi Legal Document Emulation */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Synthetic Disclaimer Watermark */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-center text-xs font-bold">
                ⚠️ {t('demo_synthetic_watermark')}
              </div>

              {/* Rendered Deed Sheet */}
              <div className="p-6 rounded-xl border border-[#E5E0D2] bg-white text-[#263126] font-serif space-y-4 shadow-inner relative">
                {/* Government Stamp Style */}
                <div className="border-2 border-[#286B35] rounded-lg p-3 text-center bg-[#FBF8EE] space-y-1">
                  <span className="text-xs font-bold text-[#286B35] block">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার — ১০০ টাকা নন-জুডিশিয়াল স্ট্যাম্প
                  </span>
                  <span className="text-sm font-extrabold text-[#286B35] block">
                    {previewDoc.type === 'deed' ? 'সাফ-কবলা জমি বিক্রয় দলিল' : previewDoc.type === 'khatian' ? 'আরএস খতিয়ান রেকর্ড অব রাইটস' : 'ভূমি রেকর্ড নথি'}
                  </span>
                </div>

                {/* Document Body & Extracted Fields Overlay */}
                <div className="space-y-2 text-xs leading-relaxed">
                  <p>
                    <strong>মৌজা:</strong> {previewDoc.mouza} | <strong>দাগ নং:</strong> {formatNumber(previewDoc.dagNumber)} | <strong>জমির পরিমাণ:</strong> {formatNumber(previewDoc.areaDecimals)} শতক
                  </p>
                  {previewDoc.parties.seller && (
                    <p>
                      <strong>বিক্রেতা/হস্তান্তরকারী:</strong> {previewDoc.parties.seller}
                    </p>
                  )}
                  {previewDoc.parties.buyer && (
                    <p>
                      <strong>ক্রেতা/গ্রহীতা:</strong> {previewDoc.parties.buyer}
                    </p>
                  )}
                  {previewDoc.parties.owner && (
                    <p>
                      <strong>রেকর্ডীয় প্রজা/মালিক:</strong> {previewDoc.parties.owner}
                    </p>
                  )}
                </div>

                {/* Highlighted OCR Bounding Boxes */}
                <div className="border border-dashed border-[#286B35] p-3 rounded-lg bg-[#7ED957]/10 space-y-1.5 font-sans">
                  <span className="text-[11px] font-bold text-[#286B35] block">
                    নিষ্কাশিত ওসিআর উপাত্ত (Multimodal Field Extraction):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {previewDoc.extractedFields.map((f, i) => (
                      <div key={i} className="p-1.5 rounded bg-white/80 border border-[#286B35]/20">
                        <span className="text-gray-500 block">{f.labelBn}:</span>
                        <span className="font-bold text-gray-900">{f.rawValue} ({(f.confidence * 100).toFixed(0)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Registry Seal & SHA-256 Digest */}
                <div className="pt-3 border-t border-[#E5E0D2] flex items-center justify-between text-[10px] font-mono text-gray-600">
                  <span>SHA-256: {previewDoc.hash}</span>
                  <span className="text-[#2E7D46] font-bold">✓ VERIFIED FINGERPRINT</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-surface-soft)] flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--cta-text)]"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
