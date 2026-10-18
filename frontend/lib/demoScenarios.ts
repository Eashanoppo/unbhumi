// UNBHUMI — Realistic Deterministic Synthetic Scenarios & Core Documents Fixtures
// Comprehensive coverage of all 6 Mandatory Core Bangladeshi Land Document Types:
// 1. Registered Deed (দলিল) [deed]
// 2. Previous Deeds / বায়া দলিল [baya_deed]
// 3. Latest Khatian (খতিয়ান) [khatian]
// 4. Mutation Khatian (নামজারি খতিয়ান ও ডিসিআর) [mutation]
// 5. Mouza Map + Plot/Dag Details (মৌজা নকশা ও দাগ বাউন্ডারি) [mouza_map]
// 6. Land Tax Dakhila (ভূমি উন্নয়ন কর দাখিলা - সহায়ক প্রমাণপত্র মাত্র) [tax_receipt]

export interface DemoDocumentFixture {
  id: string;
  name: string;
  type: 'deed' | 'baya_deed' | 'khatian' | 'mutation' | 'tax_receipt' | 'mouza_map';
  sizeBytes: number;
  hash: string;
  enrolledHash?: string;
  hasTampering?: boolean;
  tamperingDetailsBn?: string;
  tamperingDetailsEn?: string;
  khatianType?: string;
  subRegistry?: string;
  mutationCaseNo?: string;
  dcrNo?: string;
  holdingNo?: string;
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
  conflictType: string;
  caseBadge: string;
  personaBn: string;
  personaEn: string;
  ruleCode: string;
  documents: DemoDocumentFixture[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  // -------------------------------------------------------------
  // 1. BASELINE: CLEAN TITLE TRANSFER (স্বাভাবিক ও বৈধ হস্তান্তর)
  // -------------------------------------------------------------
  {
    id: 'UB-2026-1001',
    titleBn: 'মৌজা কাউন্দিয়া আরএস দাগ ৪১২ জমি হস্তান্তর যাচাই (বৈধ ভিত্তি)',
    titleEn: 'Mouza Kaundia RS Dag 412 Clean Title Transfer (Verified Baseline)',
    descBn: 'স্বাভাবিক ও বৈধ হস্তান্তর। সাফ-কবলা দলিল, বায়া দলিল, আরএস খতিয়ান, নামজারি ও ভূমি উন্নয়ন কর রসিদ সম্পূর্ণ সঙ্গতিপূর্ণ।',
    descEn: 'Clean, verified transaction. Deed, title chain, khatian record, mutation, mouza map, and tax receipts fully reconcile with zero conflicts.',
    mouza: 'কাউন্দিয়া',
    dagNumber: '৪১২',
    area: 25.0,
    expectedRiskLevel: 'low',
    expectedRiskScore: 0,
    conflictType: 'clean',
    caseBadge: 'Baseline (Clean)',
    personaBn: 'সাব-রেজিস্ট্রি অফিস ও সাধারণ নাগরিক',
    personaEn: 'Sub-Registry & Citizen',
    ruleCode: 'PASS_ALL',
    documents: [
      {
        id: 'doc-1001-1',
        name: 'মূল_সাফ_কবলা_দলিল_৭৪৫২.pdf',
        type: 'deed',
        sizeBytes: 1428500,
        hash: '7a9f4c3d8e12b6a901ffc562e104a39d84c391219b6732f90119c836a0f44391',
        pageCount: 3,
        summaryBn: 'সাফ-কবলা জমি বিক্রয় দলিল নং ৭৪৫২ (২০২৬)। বিক্রেতা: মো: আব্দুর রহিম, ক্রেতা: মোছা: ফাতেমা বেগম, দাগ: ৪১২, পরিমাণ: ২৫ শতক।',
        summaryEn: 'Outright Sale Deed No. 7452 (2026). Seller: Md. Abdur Rahim, Buyer: Mst. Fatema Begum, Dag: 412, Area: 25.0 dec.',
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
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '৪১২', normalizedValue: '412', confidence: 0.99, bbox: { x: 300, y: 320, w: 140, h: 35 } },
          { fieldKey: 'land_area', labelBn: 'জমির পরিমাণ', labelEn: 'Land Area', rawValue: '২৫ শতাংশ', normalizedValue: '25.0 শতাংশ', confidence: 0.95, bbox: { x: 120, y: 380, w: 240, h: 35 } }
        ]
      },
      {
        id: 'doc-1001-2',
        name: 'পূর্ববর্তী_বায়া_দলিল_২৪০৫.pdf',
        type: 'baya_deed',
        sizeBytes: 1512000,
        hash: '91bc8201a45e78bc912304ef1234567890abcdef1234567890abcdef12345678',
        pageCount: 4,
        summaryBn: 'বায়া দলিল নং ২৪০৫ (২০১০)। হস্তান্তরের ঐতিহাসিক চেইন: আলীমুদ্দিন মিয়া → মো: আব্দুর রহিম। স্বত্ব শৃঙ্খল অক্ষত।',
        summaryEn: 'Historical Baya Deed No. 2405 (2010). Title lineage: Alimuddin Mia → Md. Abdur Rahim. Unbroken chain.',
        parties: { seller: 'আলীমুদ্দিন মিয়া', buyer: 'মো: আব্দুর রহিম' },
        mouza: 'কাউন্দিয়া',
        dagNumber: '৪১২',
        areaDecimals: 25.0,
        registrationDate: '2010-06-20',
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'বায়া দলিল নম্বর', labelEn: 'Baya Deed No', rawValue: '২৪০৫', normalizedValue: '2405', confidence: 0.97 },
          { fieldKey: 'seller_name', labelBn: 'পূর্ববর্তী বিক্রেতা', labelEn: 'Prior Seller', rawValue: 'আলীমুদ্দিন মিয়া', normalizedValue: 'আলীমুদ্দিন মিয়া', confidence: 0.96 },
          { fieldKey: 'buyer_name', labelBn: 'বর্তমান বিক্রেতা (তদানীন্তন ক্রেতা)', labelEn: 'Current Seller (Prior Buyer)', rawValue: 'মো: আব্দুর রহিম', normalizedValue: 'মো: আব্দুর রহিম', confidence: 0.97 }
        ]
      },
      {
        id: 'doc-1001-3',
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
        id: 'doc-1001-4',
        name: 'নামজারি_খতিয়ান_ও_ডিসিআর_৩১৮.pdf',
        type: 'mutation',
        sizeBytes: 820400,
        hash: 'd5c192804bba462f8a556731110023ee451bc0399120894562ad47190beef012',
        pageCount: 2,
        summaryBn: 'মিউটেশন খতিয়ান নং ৩১৮/নাম/২০২৫-২৬, অনুমোদিত দাগ ৪১২, ডিসিআর নং ৪৭৮৯। সহকারী কমিশনার (ভূমি) অনুমোদিত।',
        summaryEn: 'Mutation Record No. 318/2025-26, Approved Plot 412, DCR No. 4789. Officially mutated by AC Land.',
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
        id: 'doc-1001-5',
        name: 'মৌজা_নকশা_কাউন্দিয়া_দাগ_৪১২.pdf',
        type: 'mouza_map',
        sizeBytes: 2100000,
        hash: '4120cadastral890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        pageCount: 1,
        summaryBn: 'মৌজা নকশা শিট নং ৩, আরএস দাগ ৪১২। পরিধি: ২৫ শতক। সীমানা: উত্তরে দাগ ৪১১, দক্ষিণে দাগ ৪১৩, পূর্বে রাস্তা।',
        summaryEn: 'Mouza Cadastral Sheet 3, RS Plot 412. Area: 25.0 dec. Boundaries: North Dag 411, South Dag 413, East Road.',
        parties: { owner: 'মো: আব্দুর রহিম' },
        mouza: 'কাউন্দিয়া',
        dagNumber: '৪১২',
        areaDecimals: 25.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'mouza_sheet', labelBn: 'নকশা শিট নং', labelEn: 'Map Sheet No', rawValue: '০৩', normalizedValue: '3', confidence: 0.98 },
          { fieldKey: 'dag_number', labelBn: 'চিহ্নিত দাগ', labelEn: 'Survey Plot', rawValue: '৪১২', normalizedValue: '412', confidence: 0.99 },
          { fieldKey: 'boundaries', labelBn: 'চারপাশের সীমানা', labelEn: 'Boundaries', rawValue: 'উ: ৪১১, দ: ৪১৩, পূ: রাস্তা', normalizedValue: 'North: 411, South: 413, East: Road', confidence: 0.95 }
        ]
      },
      {
        id: 'doc-1001-6',
        name: 'ভূমি_উন্নয়ন_কর_দাখিলা_১৪৩২.pdf',
        type: 'tax_receipt',
        sizeBytes: 450100,
        hash: '88912ef00192a4b89012356789abcdef0123456789abcdef0123456789abcdef',
        pageCount: 1,
        summaryBn: 'ভূমি উন্নয়ন কর পরিশোধ রসিদ (দাখিলা নং ৯৮০১), সাল: ১৪৩২ বঙ্গাব্দ, হোল্ডিং: ১২০/বি। [সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার চূড়ান্ত প্রমাণ নয়]',
        summaryEn: 'Land Development Tax Dakhila No. 9801, Year: 1432 BS, Holding: 120/B. [Supporting evidence only - does NOT prove ownership by itself]',
        parties: { taxPayer: 'মো: আব্দুর রহিম' },
        mouza: 'কাউন্দিয়া',
        dagNumber: '৪১২',
        areaDecimals: 25.0,
        ocrConfidence: 0.95,
        extractedFields: [
          { fieldKey: 'holding_number', labelBn: 'হোল্ডিং নম্বর', labelEn: 'Holding Number', rawValue: '১২০/বি', normalizedValue: '120/B', confidence: 0.95 },
          { fieldKey: 'tax_payer', labelBn: 'করদাতার নাম', labelEn: 'Tax Payer', rawValue: 'মো: আব্দুর রহিম', normalizedValue: 'মো: আব্দুর রহিম', confidence: 0.94 },
          { fieldKey: 'legal_disclaimer', labelBn: 'আইনি শর্তাবলী', labelEn: 'Legal Note', rawValue: 'সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার প্রমাণ নয়', normalizedValue: 'Supporting Only', confidence: 0.99 }
        ]
      }
    ]
  },

  // ---------------------------------------------------------------------------------
  // CASE A: PARTIAL PARCEL TRANSFER & AREA CONFLICT (Rule P002)
  // Scenario: 50 dec total. Current deed sells 30, but prior deed already sold 25.
  // 30 + 25 = 55 dec > 50 dec!
  // Target Persona: Sub-Registry Office, Real Estate Developers
  // ---------------------------------------------------------------------------------
  {
    id: 'UB-2026-CASE-A',
    titleBn: 'কেস এ: আংশিক দাগ হস্তান্তর ও এরিয়া ওভারফ্লো (Rule P002)',
    titleEn: 'Case A: Partial Parcel Transfer & Area Conflict (Rule P002)',
    descBn: '৫০ শতক মূল দাগ থেকে বর্তমান দলিলে ৩০ শতক বিক্রয়ের প্রস্তাব, কিন্তু পূর্বে একই দাগে ২৫ শতক বিক্রয় হয়ে যাওয়ায় মোট বিক্রিত জমি (৫৫ শতক) খতিয়ানের মূল ধারণক্ষমতা (৫০ শতক) অতিক্রম করেছে।',
    descEn: 'A large 50-decimal plot is being sold. Current deed transfers 30 dec, but prior deed already sold 25 dec of the same dag (total 55 dec > 50 dec khatian limit).',
    mouza: 'হেমায়েতপুর',
    dagNumber: '২০৫',
    area: 30.0,
    expectedRiskLevel: 'high',
    expectedRiskScore: 78,
    conflictType: 'partial_area_deficit',
    caseBadge: 'Case A (Rule P002)',
    personaBn: 'সাব-রেজিস্ট্রি অফিস ও রিয়েল এস্টেট ডেভেলপার',
    personaEn: 'Sub-Registry & Real Estate Developers',
    ruleCode: 'RULE_P002_AREA_OVERFLOW',
    documents: [
      {
        id: 'doc-caseA-1',
        name: 'প্রস্তাবিত_সাফ_কবলা_দলিল_৯৮২১_৩০_শতক.pdf',
        type: 'deed',
        sizeBytes: 1390000,
        hash: 'a1029384bcdef1234567890abcdef1234567890abcdef1234567890abcdef123',
        pageCount: 3,
        summaryBn: 'প্রস্তাবিত বিক্রয় দলিল নং ৯৮২১ (২০২৬)। বিক্রেতা তারিকুল ইসলাম দাগ ২০৫ থেকে ৩০ শতক জমি গ্রীন ল্যান্ড প্রোপার্টিজ লিঃ এর নিকট বিক্রয়ের জন্য উপস্থাপন করেছেন।',
        summaryEn: 'Proposed Sale Deed No. 9821 (2026). Seller Tariqul Islam sells 30.0 decimals from Dag 205 to Green Land Properties Ltd.',
        parties: { seller: 'তারিকুল ইসলাম', buyer: 'গ্রীন ল্যান্ড প্রোপার্টিজ লিঃ' },
        mouza: 'হেমায়েতপুর',
        dagNumber: '২০৫',
        areaDecimals: 30.0,
        registrationDate: '2026-04-10',
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৯৮২১', normalizedValue: '9821', confidence: 0.98, bbox: { x: 120, y: 80, w: 180, h: 35 } },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'তারিকুল ইসলাম', normalizedValue: 'তারিকুল ইসলাম', confidence: 0.97, bbox: { x: 120, y: 180, w: 280, h: 40 } },
          { fieldKey: 'buyer_name', labelBn: 'ক্রেতার নাম', labelEn: 'Buyer Name', rawValue: 'গ্রীন ল্যান্ড প্রোপার্টিজ লিঃ', normalizedValue: 'Green Land Properties Ltd', confidence: 0.96, bbox: { x: 120, y: 240, w: 280, h: 40 } },
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '২০৫', normalizedValue: '205', confidence: 0.99, bbox: { x: 300, y: 320, w: 140, h: 35 } },
          { fieldKey: 'land_area', labelBn: 'জমির পরিমাণ', labelEn: 'Transferred Area', rawValue: '৩০ শতক', normalizedValue: '30.0 শতাংশ', confidence: 0.96, bbox: { x: 120, y: 380, w: 240, h: 35 } }
        ]
      },
      {
        id: 'doc-caseA-2',
        name: 'পূর্ববর্তী_আংশিক_বিক্রয়_দলিল_৫৪০১_২৫_শতক.pdf',
        type: 'baya_deed',
        sizeBytes: 1450000,
        hash: '54019384bcdef1234567890abcdef1234567890abcdef1234567890abcdef123',
        pageCount: 3,
        summaryBn: 'পূর্ববর্তী নিবন্ধিত বিক্রয় দলিল নং ৫৪০১ (২০২৪)। একই বিক্রেতা তারিকুল ইসলাম এই দাগের ২৫ শতক জমি ইতোপূর্বে মো: আব্দুল হালিমের নিকট হস্তান্তর করেছেন।',
        summaryEn: 'Prior Sale Deed No. 5401 (2024). Same seller Tariqul Islam previously transferred 25.0 decimals to Md. Abdul Halim.',
        parties: { seller: 'তারিকুল ইসলাম', buyer: 'মো: আব্দুল হালিম' },
        mouza: 'হেমায়েতপুর',
        dagNumber: '২০৫',
        areaDecimals: 25.0,
        registrationDate: '2024-08-12',
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'পূর্ববর্তী দলিল নং', labelEn: 'Prior Deed No', rawValue: '৫৪০১', normalizedValue: '5401', confidence: 0.98 },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'তারিকুল ইসলাম', normalizedValue: 'তারিকুল ইসলাম', confidence: 0.97 },
          { fieldKey: 'buyer_name', labelBn: 'পূর্ববর্তী ক্রেতা', labelEn: 'Prior Buyer', rawValue: 'মো: আব্দুল হালিম', normalizedValue: 'মো: আব্দুল হালিম', confidence: 0.96 },
          { fieldKey: 'land_area', labelBn: 'হস্তান্তরিত জমি', labelEn: 'Transferred Area', rawValue: '২৫ শতক', normalizedValue: '25.0 শতাংশ', confidence: 0.97 }
        ]
      },
      {
        id: 'doc-caseA-3',
        name: 'বিএস_রেকর্ডীয়_খতিয়ান_১০৪_মোট_৫০_শতক.pdf',
        type: 'khatian',
        sizeBytes: 1120000,
        hash: '10409384bcdef1234567890abcdef1234567890abcdef1234567890abcdef123',
        pageCount: 1,
        summaryBn: 'বিএস খতিয়ান নং ১০৪, দাগ ২০৫। মোট রেকর্ডীয় জমি: ৫০ শতক। পূর্ববর্তী ২৫ শতক বিক্রির পর বিক্রেতার অবশিষ্ট প্রাপ্য মাত্র ২৫ শতক।',
        summaryEn: 'BS Khatian No. 104, Plot 205. Total Recorded Parcel Area: 50.0 decimals. After prior 25 dec sale, seller only retains 25 dec.',
        parties: { owner: 'তারিকুল ইসলাম' },
        mouza: 'হেমায়েতপুর',
        dagNumber: '২০৫',
        areaDecimals: 50.0,
        ocrConfidence: 0.98,
        extractedFields: [
          { fieldKey: 'khatian_number', labelBn: 'খতিয়ান নম্বর', labelEn: 'Khatian Number', rawValue: '১০৪', normalizedValue: '104', confidence: 0.98 },
          { fieldKey: 'recorded_owner', labelBn: 'রেকর্ডীয় প্রজা', labelEn: 'Recorded Owner', rawValue: 'তারিকুল ইসলাম', normalizedValue: 'তারিকুল ইসলাম', confidence: 0.97 },
          { fieldKey: 'total_plot_area', labelBn: 'দাগের মোট জমি', labelEn: 'Total Plot Area', rawValue: '৫০ শতক (০.৫০ একর)', normalizedValue: '50.0 শতাংশ', confidence: 0.99 }
        ]
      },
      {
        id: 'doc-caseA-4',
        name: 'নামজারি_খতিয়ান_পূর্ববর্তী_হালিম_২০২.pdf',
        type: 'mutation',
        sizeBytes: 890000,
        hash: '20209384bcdef1234567890abcdef1234567890abcdef1234567890abcdef123',
        pageCount: 2,
        summaryBn: 'নামজারি খতিয়ান নং ২০২/নাম/২০২৪-২৫। আব্দুল হালিমের অনুকূলে দাগ ২০৫ হতে ২৫ শতক খারিজ অনুমোদিত ও চূড়ান্ত রেকর্ডভুক্ত।',
        summaryEn: 'Mutation Record No. 202/2024-25. 25.0 decimals from Dag 205 legally mutated in favor of Abdul Halim.',
        parties: { owner: 'মো: আব্দুল হালিম' },
        mouza: 'হেমায়েতপুর',
        dagNumber: '২০৫',
        areaDecimals: 25.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'mutated_owner', labelBn: 'খারিজ গ্রহীতা', labelEn: 'Mutated Owner', rawValue: 'মো: আব্দুল হালিম', normalizedValue: 'মো: আব্দুল হালিম', confidence: 0.96 },
          { fieldKey: 'mutated_area', labelBn: 'খারিজকৃত জমি', labelEn: 'Mutated Area', rawValue: '২৫ শতক', normalizedValue: '25.0 শতাংশ', confidence: 0.98 }
        ]
      },
      {
        id: 'doc-caseA-5',
        name: 'মৌজা_নকশা_হেমায়েতপুর_দাগ_২০৫_পার্টিশন.pdf',
        type: 'mouza_map',
        sizeBytes: 1950000,
        hash: '2050mapcadastral1234567890abcdef1234567890abcdef1234567890abcdef12',
        pageCount: 1,
        summaryBn: 'মৌজা নকশা দাগ ২০৫ (মোট ৫০ শতক)। পশ্চিমাংশ ২৫ শতক আব্দুল হালিমের দখলে, পূর্বাংশে অবশিষ্ট ২৫ শতক। ৩০ শতকের প্রস্তাব নকশায় অবাস্তব।',
        summaryEn: 'Mouza Cadastral Map Plot 205 (50 dec total). Western 25 dec occupied by Halim. 30 dec transfer physically impossible.',
        parties: { owner: 'তারিকুল ইসলাম' },
        mouza: 'হেমায়েতপুর',
        dagNumber: '২০৫',
        areaDecimals: 50.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Plot Number', rawValue: '২০৫', normalizedValue: '205', confidence: 0.99 },
          { fieldKey: 'partition_status', labelBn: 'দখল স্থিতি', labelEn: 'Partition Status', rawValue: 'পশ্চিমাংশ ২৫ শতক দখলীয়', normalizedValue: 'Western 25 dec occupied', confidence: 0.94 }
        ]
      },
      {
        id: 'doc-caseA-6',
        name: 'ভূমি_উন্নয়ন_কর_দাখিলা_১৪৩২.pdf',
        type: 'tax_receipt',
        sizeBytes: 420000,
        hash: 'tax2051432bcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        pageCount: 1,
        summaryBn: 'ভূমি উন্নয়ন কর পরিশোধ দাখিলা নং ৪১২০ (১৪৩২ বঙ্গাব্দ)। [সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার চূড়ান্ত প্রমাণ নয়]',
        summaryEn: 'Land Development Tax Dakhila No. 4120. [Supporting evidence only - does NOT prove ownership by itself]',
        parties: { taxPayer: 'তারিকুল ইসলাম' },
        mouza: 'হেমায়েতপুর',
        dagNumber: '২০৫',
        areaDecimals: 50.0,
        ocrConfidence: 0.94,
        extractedFields: [
          { fieldKey: 'tax_payer', labelBn: 'করদাতা', labelEn: 'Tax Payer', rawValue: 'তারিকুল ইসলাম', normalizedValue: 'তারিকুল ইসলাম', confidence: 0.95 },
          { fieldKey: 'disclaimer', labelBn: 'আইনি ঘোষণা', labelEn: 'Statutory Note', rawValue: 'সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার প্রমাণ নয়', normalizedValue: 'Supporting Only', confidence: 0.99 }
        ]
      }
    ]
  },

  // ---------------------------------------------------------------------------------
  // CASE B: CRYPTOGRAPHIC HASH TAMPERING DETECTION (Rule D001 / P2 Support)
  // Scenario: Visual similarity high, but SHA-256 mismatch detected. File altered since enrollment.
  // Target Persona: Banks (Collateral Verification), AC Land
  // ---------------------------------------------------------------------------------
  {
    id: 'UB-2026-CASE-B',
    titleBn: 'কেস বি: ক্রিপ্টোগ্রাফিক হ্যাশ টেম্পারিং ও জাল দলিল শনাক্তকরণ (Rule D001)',
    titleEn: 'Case B: Cryptographic Hash Tampering Detection (Rule D001 / P2)',
    descBn: 'সাব-রেজিস্ট্রি ভল্টে রক্ষিত মূল দলিলের সাথে আপলোডকৃত নথির দৃশ্যমান সাদৃশ্য উচ্চ হলেও, দলিলের সংখ্যা ফটোশপে বিকৃত করায় SHA-256 হ্যাশ অমিল শনাক্ত হয়েছে।',
    descEn: 'Visual similarity high, but SHA-256 hash mismatch detected. Proposed deed digits altered via image editing since original enrollment in registry vault.',
    mouza: 'সাভার',
    dagNumber: '১৯',
    area: 15.0,
    expectedRiskLevel: 'critical',
    expectedRiskScore: 94,
    conflictType: 'hash_tampering',
    caseBadge: 'Case B (Rule D001)',
    personaBn: 'ব্যাংক (জামানত যাচাই) ও সহকারী কমিশনার (ভূমি)',
    personaEn: 'Banks (Collateral) & AC Land',
    ruleCode: 'RULE_D001_TAMPER_DETECTED',
    documents: [
      {
        id: 'doc-caseB-1',
        name: 'টেম্পারড_সাফ_কবলা_দলিল_৪৪১২_মুদ্রিত.pdf',
        type: 'deed',
        sizeBytes: 1380000,
        hash: '8f430198de72a5b112998a6094b810937a9f4c3d8e12b6a901ffc562e104a39d',
        enrolledHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        hasTampering: true,
        pageCount: 3,
        summaryBn: 'ডিজিটালভাবে বিকৃত দলিল নং ৪৪১২। মূল সংরক্ষিত দলিলের নম্বর ছিল ৪৪১১; ফটোশপ বা পিডিএফ এডিটরে একটি ডিজিট পরিবর্তন করে প্রতারণামূলকভাবে দাখিল করা হয়েছে।',
        summaryEn: 'Digitally altered Deed No. 4412. Enrolled original was 4411; single digit altered via Photoshop to fabricate deed number.',
        parties: { seller: 'শফিউল আলম', buyer: 'মোমিনুল হক' },
        mouza: 'সাভার',
        dagNumber: '১৯',
        areaDecimals: 15.0,
        registrationDate: '2026-03-22',
        ocrConfidence: 0.95,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'বিকৃত দলিল নম্বর', labelEn: 'Altered Deed Number', rawValue: '৪৪১২ [সন্দেহজনক এডিট]', normalizedValue: '4412', confidence: 0.88, bbox: { x: 120, y: 80, w: 180, h: 35 } },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'শফিউল আলম', normalizedValue: 'শফিউল আলম', confidence: 0.96, bbox: { x: 120, y: 180, w: 280, h: 40 } },
          { fieldKey: 'buyer_name', labelBn: 'ক্রেতার নাম', labelEn: 'Buyer Name', rawValue: 'মোমিনুল হক', normalizedValue: 'মোমিনুল হক', confidence: 0.96, bbox: { x: 120, y: 240, w: 280, h: 40 } },
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '১৯', normalizedValue: '19', confidence: 0.98, bbox: { x: 300, y: 320, w: 140, h: 35 } },
          { fieldKey: 'sha256_audit', labelBn: 'হ্যাশ অখণ্ডতা যাচাই', labelEn: 'Hash Verification', rawValue: 'MISMATCH (8f43... vs e3b0...)', normalizedValue: 'FAIL', confidence: 0.99 }
        ]
      },
      {
        id: 'doc-caseB-2',
        name: 'ভল্ট_সংরক্ষিত_প্রকৃত_মূল_দলিল_৪৪১১.pdf',
        type: 'baya_deed',
        sizeBytes: 1378000,
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        pageCount: 3,
        summaryBn: 'সাব-রেজিস্ট্রি ডিজিটাল ভল্টে সংরক্ষিত অপরিবর্তিত মূল সাফ-কবলা দলিল নং ৪৪১১। প্রকৃত ক্রেতা ছিলেন অন্য ব্যক্তি।',
        summaryEn: 'Authentic enrolled Deed No. 4411 stored in Sub-Registry Digital Vault. True buyer in government record was different party.',
        parties: { seller: 'শফিউল আলম', buyer: 'মো: রফিকুল ইসলাম' },
        mouza: 'সাভার',
        dagNumber: '১৯',
        areaDecimals: 15.0,
        registrationDate: '2023-11-15',
        ocrConfidence: 0.98,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'ভল্ট মূল দলিল নং', labelEn: 'Vault Enrolled Deed', rawValue: '৪৪১১', normalizedValue: '4411', confidence: 0.99 },
          { fieldKey: 'genuine_buyer', labelBn: 'প্রকৃত ক্রেতা', labelEn: 'Genuine Buyer', rawValue: 'মো: রফিকুল ইসলাম', normalizedValue: 'মো: রফিকুল ইসলাম', confidence: 0.98 }
        ]
      },
      {
        id: 'doc-caseB-3',
        name: 'আরএস_রেকর্ডীয়_খতিয়ান_১৯.pdf',
        type: 'khatian',
        sizeBytes: 940000,
        hash: 'khat1901234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 1,
        summaryBn: 'আরএস খতিয়ান নং ১৯, দাগ ১৯। রেকর্ডীয় প্রজা: শফিউল আলম।',
        summaryEn: 'RS Khatian No. 19, Plot 19. Recorded tenant: Shafiul Alam.',
        parties: { owner: 'শফিউল আলম' },
        mouza: 'সাভার',
        dagNumber: '১৯',
        areaDecimals: 15.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'khatian_number', labelBn: 'খতিয়ান নম্বর', labelEn: 'Khatian Number', rawValue: '১৯', normalizedValue: '19', confidence: 0.98 }
        ]
      },
      {
        id: 'doc-caseB-4',
        name: 'নামজারি_খতিয়ান_১৯_খ.pdf',
        type: 'mutation',
        sizeBytes: 810000,
        hash: 'mut1901234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 1,
        summaryBn: 'নামজারি খতিয়ান আবেদন স্থগিত স্থিতি। ভুয়া দলিলের কারণে এসি ল্যান্ড কোর্ট কর্তৃক হোল্ড।',
        summaryEn: 'Mutation verification held by AC Land pending forensic deed audit.',
        parties: { owner: 'শফিউল আলম' },
        mouza: 'সাভার',
        dagNumber: '১৯',
        areaDecimals: 15.0,
        ocrConfidence: 0.95,
        extractedFields: [
          { fieldKey: 'mutation_status', labelBn: 'নামজারি স্থিতি', labelEn: 'Mutation Status', rawValue: 'স্থগিত / তদন্তাধীন', normalizedValue: 'ON_HOLD', confidence: 0.96 }
        ]
      },
      {
        id: 'doc-caseB-5',
        name: 'মৌজা_নকশা_সাভার_দাগ_১৯.pdf',
        type: 'mouza_map',
        sizeBytes: 1880000,
        hash: 'map1901234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 1,
        summaryBn: 'মৌজা নকশা দাগ ১৯। সাভার পৌর এলাকা সংলগ্ন।',
        summaryEn: 'Mouza Cadastral Map Dag 19, Savar.',
        parties: { owner: 'শফিউল আলম' },
        mouza: 'সাভার',
        dagNumber: '১৯',
        areaDecimals: 15.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '১৯', normalizedValue: '19', confidence: 0.99 }
        ]
      },
      {
        id: 'doc-caseB-6',
        name: 'ভূমি_উন্নয়ন_কর_দাখিলা_১৪৩২.pdf',
        type: 'tax_receipt',
        sizeBytes: 410000,
        hash: 'tax1901234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 1,
        summaryBn: 'ভূমি উন্নয়ন কর দাখিলা নং ৯১২৮ (১৪৩২)। [সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার চূড়ান্ত প্রমাণ নয়]',
        summaryEn: 'Land Tax Dakhila No. 9128. [Supporting evidence only - does NOT prove ownership by itself]',
        parties: { taxPayer: 'শফিউল আলম' },
        mouza: 'সাভার',
        dagNumber: '১৯',
        areaDecimals: 15.0,
        ocrConfidence: 0.95,
        extractedFields: [
          { fieldKey: 'disclaimer', labelBn: 'আইনি ঘোষণা', labelEn: 'Statutory Note', rawValue: 'সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার প্রমাণ নয়', normalizedValue: 'Supporting Only', confidence: 0.99 }
        ]
      }
    ]
  },

  // ---------------------------------------------------------------------------------
  // CASE C: HISTORICAL SURVEY TRANSITION CONFLICT (CS → SA → RS → BS) (Rule P004)
  // Scenario: Proposed deed mentions RS Dag 88, but BS survey split the parcel into BS 142 & 143.
  // Target Persona: DLRS (Dept of Land Records and Surveys), Land Lawyers
  // ---------------------------------------------------------------------------------
  {
    id: 'UB-2026-CASE-C',
    titleBn: 'কেস সি: জরিপ রূপান্তর দ্বন্দ্ব সিএস-এসএ-আরএস বনাম বিএস (Rule P004)',
    titleEn: 'Case C: Historical Survey Transition Conflict (CS → SA → RS → BS)',
    descBn: 'প্রস্তাবিত দলিলে আরএস দাগ ৮৮ উল্লেখ থাকলেও হাল বিএস জরিপে দাগটি দ্বিখণ্ডিত হয়ে বিএস ১৪২ ও ১৪৩ দাগে বিভক্ত হয়েছে। জরিপ রূপান্তরের অস্পষ্টতায় সীমানা সংঘাত।',
    descEn: 'Deed cites RS Dag 88, but the latest BS Survey bifurcated this plot into BS Dags 142 & 143. Ambiguous survey transition without batowara decree.',
    mouza: 'ধামরাই',
    dagNumber: '৮৮',
    area: 32.0,
    expectedRiskLevel: 'high',
    expectedRiskScore: 72,
    conflictType: 'survey_transition_conflict',
    caseBadge: 'Case C (Rule P004)',
    personaBn: 'ডিএলআরএস (ভূমি রেকর্ড ও জরিপ অধিদপ্তর) ও আইনজীবী',
    personaEn: 'DLRS & Land Lawyers',
    ruleCode: 'RULE_P004_SURVEY_BIFURCATION',
    documents: [
      {
        id: 'doc-caseC-1',
        name: 'প্রস্তাবিত_সাফ_কবলা_দলিল_৭২০১_আরএস_দাগ_৮৮.pdf',
        type: 'deed',
        sizeBytes: 1410000,
        hash: '7201c1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        pageCount: 3,
        summaryBn: 'প্রস্তাবিত দলিল নং ৭২০১ (২০২৬)। বিক্রেতা নূরুল হুদা আরএস ৮৮ দাগ থেকে ৩২ শতক জমি বিক্রয়ের দলিল তৈরি করেছেন, কিন্তু হাল বিএস দাগের কোনো উল্লেখ করেননি।',
        summaryEn: 'Proposed Deed No. 7201 (2026). Seller Nurul Huda transfers 32.0 dec citing RS Dag 88, completely ignoring latest BS survey split.',
        parties: { seller: 'নূরুল হুদা', buyer: 'মনিরুল ইসলাম' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 32.0,
        registrationDate: '2026-03-28',
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৭২০১', normalizedValue: '7201', confidence: 0.98, bbox: { x: 120, y: 80, w: 180, h: 35 } },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'নূরুল হুদা', normalizedValue: 'নূরুল হুদা', confidence: 0.97, bbox: { x: 120, y: 180, w: 280, h: 40 } },
          { fieldKey: 'survey_era_cited', labelBn: 'দলিলে বর্ণিত জরিপ', labelEn: 'Survey Era Cited', rawValue: 'আরএস জরিপ (দাগ ৮৮)', normalizedValue: 'RS Survey (Dag 88)', confidence: 0.96 },
          { fieldKey: 'land_area', labelBn: 'জমির পরিমাণ', labelEn: 'Area', rawValue: '৩২ শতক', normalizedValue: '32.0 শতাংশ', confidence: 0.97 }
        ]
      },
      {
        id: 'doc-caseC-2',
        name: 'সিএস_ও_এসএ_ঐতিহাসিক_দলিল_১১৫.pdf',
        type: 'baya_deed',
        sizeBytes: 1620000,
        hash: 'baya115c1234567890abcdef1234567890abcdef1234567890abcdef123456789',
        pageCount: 4,
        summaryBn: 'ঐতিহাসিক স্বত্ব চেইন: সিএস দাগ ৪৫ → এসএ দাগ ৬২ → আরএস দাগ ৮৮। ঐতিহাসিক জরিপ রূপান্তর ক্রম।',
        summaryEn: 'Historical chain: CS Dag 45 → SA Dag 62 → RS Dag 88. Prior survey transition verified.',
        parties: { seller: 'মৌলভী আব্দুস সামাদ', buyer: 'নূরুল হুদা' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 32.0,
        registrationDate: '1985-05-14',
        ocrConfidence: 0.94,
        extractedFields: [
          { fieldKey: 'cs_dag', labelBn: 'সিএস দাগ', labelEn: 'CS Dag', rawValue: '৪৫', normalizedValue: '45', confidence: 0.95 },
          { fieldKey: 'sa_dag', labelBn: 'এসএ দাগ', labelEn: 'SA Dag', rawValue: '৬২', normalizedValue: '62', confidence: 0.95 },
          { fieldKey: 'rs_dag', labelBn: 'আরএস দাগ', labelEn: 'RS Dag', rawValue: '৮৮', normalizedValue: '88', confidence: 0.97 }
        ]
      },
      {
        id: 'doc-caseC-3',
        name: 'হাল_বিএস_খতিয়ান_১৪২_ও_১৪৩.pdf',
        type: 'khatian',
        sizeBytes: 1050000,
        hash: 'bs142c1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 2,
        summaryBn: 'বাংলাদেশ সার্ভে (বিএস) চূড়ান্ত খতিয়ান। আরএস ৮৮ দাগ দ্বিখণ্ডিত হয়ে বিএস ১৪২ (১৮ শতক) ও বিএস ১৪৩ (১৪ শতক) গঠিত হয়েছে। পৃথক প্রজাস্বত্ব রেকর্ড।',
        summaryEn: 'Bangladesh Survey (BS) Final Record. RS 88 partitioned into BS 142 (18 dec) & BS 143 (14 dec) with distinct tenant rights.',
        parties: { owner: 'নূরুল হুদা ও ওয়ারিশগণ' },
        mouza: 'ধামরাই',
        dagNumber: '১৪২, ১৪৩',
        areaDecimals: 32.0,
        ocrConfidence: 0.98,
        extractedFields: [
          { fieldKey: 'bs_dag_1', labelBn: 'বিএস দাগ ১', labelEn: 'BS Plot 1', rawValue: '১৪২ (১৮ শতক)', normalizedValue: '142 (18 dec)', confidence: 0.98 },
          { fieldKey: 'bs_dag_2', labelBn: 'বিএস দাগ ২', labelEn: 'BS Plot 2', rawValue: '১৪৩ (১৪ শতক)', normalizedValue: '143 (14 dec)', confidence: 0.98 },
          { fieldKey: 'survey_conflict_note', labelBn: 'জরিপ অসঙ্গতি ফ্ল্যাগ', labelEn: 'Survey Conflict Note', rawValue: 'আরএস ৮৮ দাগ হাল বিএস জরিপে দ্বিখণ্ডিত', normalizedValue: 'BIFURCATED_PLOT', confidence: 0.99 }
        ]
      },
      {
        id: 'doc-caseC-4',
        name: 'নামজারি_খতিয়ান_অমীমাংসিত_জরিপ.pdf',
        type: 'mutation',
        sizeBytes: 780000,
        hash: 'mutcasec1234567890abcdef1234567890abcdef1234567890abcdef123456789',
        pageCount: 1,
        summaryBn: 'নামজারি রেকর্ডে বিএস দাগ ম্যাপিং অসম্পূর্ণ। সহকারী কমিশনার (ভূমি) অফিস কর্তৃক বাটোয়ারা ডিক্রি উপস্থাপনের নির্দেশ।',
        summaryEn: 'Mutation record incomplete. AC Land requires formal partition decree before approving mutated khatian.',
        parties: { owner: 'নূরুল হুদা' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 32.0,
        ocrConfidence: 0.95,
        extractedFields: [
          { fieldKey: 'mutation_order', labelBn: 'এসি ল্যান্ড মন্তব্য', labelEn: 'AC Land Directive', rawValue: 'বিএস দাগ স্পষ্টীকরণের জন্য বাটোয়ারা ডিক্রি প্রয়োজন', normalizedValue: 'REQUIRE_PARTITION_DECREE', confidence: 0.96 }
        ]
      },
      {
        id: 'doc-caseC-5',
        name: 'মৌজা_তুলনামূলক_নকশা_আরএস_বনাম_বিএস.pdf',
        type: 'mouza_map',
        sizeBytes: 2300000,
        hash: 'mapcasec1234567890abcdef1234567890abcdef1234567890abcdef123456789',
        pageCount: 1,
        summaryBn: 'ডিএলআরএস কম্পারেটিভ ট্রেসিং ম্যাপ: আরএস ৮৮ দাগের মাঝখান দিয়ে নতুন বিএস জরিপের সীমানা বিভাজন রেখা সুস্পষ্ট।',
        summaryEn: 'DLRS Comparative Cadastral Overlay: Clear demarcation line bisecting RS Dag 88 into BS 142 & BS 143.',
        parties: { owner: 'নূরুল হুদা' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮ / ১৪২-১৪৩',
        areaDecimals: 32.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'map_overlay_result', labelBn: 'নকশা রূপান্তর ফল', labelEn: 'Overlay Demarcation', rawValue: 'আরএস ৮৮ দাগের বিভাজন চিহ্নিত (BS Split)', normalizedValue: 'BIFURCATED_CADASTRE', confidence: 0.97 }
        ]
      },
      {
        id: 'doc-caseC-6',
        name: 'ভূমি_উন্নয়ন_কর_দাখিলা_১৪৩১.pdf',
        type: 'tax_receipt',
        sizeBytes: 430000,
        hash: 'taxcasec1234567890abcdef1234567890abcdef1234567890abcdef123456789',
        pageCount: 1,
        summaryBn: 'ভূমি উন্নয়ন কর দাখিলা নং ৭৭১০ (১৪৩১ বঙ্গাব্দ)। [সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার চূড়ান্ত প্রমাণ নয়]',
        summaryEn: 'Land Development Tax Dakhila No. 7710. [Supporting evidence only - does NOT prove ownership by itself]',
        parties: { taxPayer: 'নূরুল হুদা' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 32.0,
        ocrConfidence: 0.94,
        extractedFields: [
          { fieldKey: 'disclaimer', labelBn: 'আইনি ঘোষণা', labelEn: 'Statutory Note', rawValue: 'সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার প্রমাণ নয়', normalizedValue: 'Supporting Only', confidence: 0.99 }
        ]
      }
    ]
  },

  // ---------------------------------------------------------------------------------
  // CASE D: REGISTRATION VS. MUTATION MISMATCH (Rule M001)
  // Scenario: Deed appears recently registered, but AC Land mutation belongs to a different person/dag or shows REJECTED status.
  // Target Persona: Banks & Financial Institutions, AC Land
  // ---------------------------------------------------------------------------------
  {
    id: 'UB-2026-CASE-D',
    titleBn: 'কেস ডি: রেজিস্ট্রেশন বনাম নামজারি অমিল ও বাতিল খারিজ (Rule M001)',
    titleEn: 'Case D: Registration vs. Mutation Mismatch (Rule M001)',
    descBn: 'দলিল বৈধ মনে হলেও সহকারী কমিশনার (ভূমি) অফিসের নামজারি খতিয়ান ভিন্ন ব্যক্তির নামে অথবা খারিজ আবেদনের স্থিতি "REJECTED / বাতিল" হিসেবে চিহ্নিত।',
    descEn: 'Deed shows a valid, recent sale, but supplied mutation khatian belongs to a different person or shows REJECTED status in AC Land records.',
    mouza: 'সাভার',
    dagNumber: '৩১০',
    area: 22.0,
    expectedRiskLevel: 'high',
    expectedRiskScore: 68,
    conflictType: 'registration_mutation_mismatch',
    caseBadge: 'Case D (Rule M001)',
    personaBn: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান এবং এসি ল্যান্ড',
    personaEn: 'Banks & Financial Institutions, AC Land',
    ruleCode: 'RULE_M001_MUTATION_REJECTED',
    documents: [
      {
        id: 'doc-caseD-1',
        name: 'নিবন্ধিত_সাফ_কবলা_দলিল_৬১০৯.pdf',
        type: 'deed',
        sizeBytes: 1320000,
        hash: '6109d1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        pageCount: 3,
        summaryBn: 'সাফ-কবলা দলিল নং ৬১০৯ (২০২৬)। বিক্রেতা মাহবুবুর রহমান দাগ ৩১০ থেকে ২২ শতক জমি সেলিম রেজার নিকট বিক্রয় করেছেন।',
        summaryEn: 'Registered Sale Deed No. 6109 (2026). Seller Mahbubur Rahman transfers 22.0 dec in Plot 310 to Selim Reza.',
        parties: { seller: 'মাহবুবুর রহমান', buyer: 'সেলিম রেজা' },
        mouza: 'সাভার',
        dagNumber: '৩১০',
        areaDecimals: 22.0,
        registrationDate: '2026-02-18',
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৬১০৯', normalizedValue: '6109', confidence: 0.98, bbox: { x: 120, y: 80, w: 180, h: 35 } },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'মাহবুবুর রহমান', normalizedValue: 'মাহবুবুর রহমান', confidence: 0.97, bbox: { x: 120, y: 180, w: 280, h: 40 } },
          { fieldKey: 'buyer_name', labelBn: 'ক্রেতার নাম', labelEn: 'Buyer Name', rawValue: 'সেলিম রেজা', normalizedValue: 'সেলিম রেজা', confidence: 0.97, bbox: { x: 120, y: 240, w: 280, h: 40 } },
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '৩১০', normalizedValue: '310', confidence: 0.99, bbox: { x: 300, y: 320, w: 140, h: 35 } }
        ]
      },
      {
        id: 'doc-caseD-2',
        name: 'পূর্ববর্তী_বায়া_দলিল_২৩৯১.pdf',
        type: 'baya_deed',
        sizeBytes: 1430000,
        hash: '2391d1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        pageCount: 3,
        summaryBn: 'বায়া দলিল নং ২৩৯১ (২০১২)। মাহবুবুর রহমানের স্বত্ব অর্জন।',
        summaryEn: 'Baya Deed No. 2391 (2012). Title acquisition by Mahbubur Rahman.',
        parties: { seller: 'হাজী আব্দুল করিম', buyer: 'মাহবুবুর রহমান' },
        mouza: 'সাভার',
        dagNumber: '৩১০',
        areaDecimals: 22.0,
        registrationDate: '2012-10-05',
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'বায়া দলিল নং', labelEn: 'Baya Deed No', rawValue: '২৩৯১', normalizedValue: '2391', confidence: 0.97 }
        ]
      },
      {
        id: 'doc-caseD-3',
        name: 'আরএস_খতিয়ান_৩১০.pdf',
        type: 'khatian',
        sizeBytes: 980000,
        hash: 'khat310d1234567890abcdef1234567890abcdef1234567890abcdef123456789',
        pageCount: 1,
        summaryBn: 'আরএস খতিয়ান নং ৩১০। রেকর্ডীয় প্রজা: হাজী আব্দুল করিম (সাবেক)।',
        summaryEn: 'RS Khatian No. 310. Recorded owner: Haji Abdul Karim (Former).',
        parties: { owner: 'হাজী আব্দুল করিম' },
        mouza: 'সাভার',
        dagNumber: '৩১০',
        areaDecimals: 22.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'khatian_number', labelBn: 'খতিয়ান নম্বর', labelEn: 'Khatian Number', rawValue: '৩১০', normalizedValue: '310', confidence: 0.98 }
        ]
      },
      {
        id: 'doc-caseD-4',
        name: 'নামজারি_আবেদন_বাতিল_আদেশনামা_৫৯২.pdf',
        type: 'mutation',
        sizeBytes: 860000,
        hash: 'mutreject592d1234567890abcdef1234567890abcdef1234567890abcdef123',
        pageCount: 2,
        summaryBn: 'সহকারী কমিশনার (ভূমি) অফিস সাভার, মিউটেশন কেস নং ৫৯২/২০২৫। আদেশ: "সীমানা নিয়ে স্থানীয় আপত্তি ও শুনানিতে অনুপস্থিতির কারণে আবেদন নামঞ্জুর/বাতিল (REJECTED)।"',
        summaryEn: 'AC Land Savar Mutation Case No. 592/2025. Official Order: "Mutation REJECTED due to boundary dispute objection and non-appearance at hearing."',
        parties: { owner: 'সেলিম রেজা' },
        mouza: 'সাভার',
        dagNumber: '৩১০',
        areaDecimals: 22.0,
        ocrConfidence: 0.98,
        extractedFields: [
          { fieldKey: 'mutation_case_no', labelBn: 'নামজারি কেস নং', labelEn: 'Mutation Case No', rawValue: '৫৯২/২০২৫', normalizedValue: '592/2025', confidence: 0.98 },
          { fieldKey: 'mutation_order_status', labelBn: 'সরকারি আদেশের স্থিতি', labelEn: 'Order Status', rawValue: 'নামঞ্জুর / বাতিল (REJECTED)', normalizedValue: 'REJECTED', confidence: 0.99, bbox: { x: 120, y: 150, w: 260, h: 40 } },
          { fieldKey: 'rejection_ground', labelBn: 'বাতিলের কারণ', labelEn: 'Rejection Ground', rawValue: 'সীমানা আপত্তি ও অনুপস্থিতি', normalizedValue: 'Dispute & Non-appearance', confidence: 0.95 }
        ]
      },
      {
        id: 'doc-caseD-5',
        name: 'মৌজা_নকশা_দাগ_৩১০.pdf',
        type: 'mouza_map',
        sizeBytes: 1910000,
        hash: 'map310d1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 1,
        summaryBn: 'মৌজা নকশা দাগ ৩১০। সীমানা বিরোধ চিহ্নিত।',
        summaryEn: 'Mouza Cadastral Map Plot 310.',
        parties: { owner: 'মাহবুবুর রহমান' },
        mouza: 'সাভার',
        dagNumber: '৩১০',
        areaDecimals: 22.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '৩১০', normalizedValue: '310', confidence: 0.99 }
        ]
      },
      {
        id: 'doc-caseD-6',
        name: 'ভূমি_উন্নয়ন_কর_দাখিলা_১৪৩২.pdf',
        type: 'tax_receipt',
        sizeBytes: 415000,
        hash: 'tax310d1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 1,
        summaryBn: 'ভূমি উন্নয়ন কর দাখিলা (সাবেক হোল্ডিংয়ে পরিশোধিত)। [সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার চূড়ান্ত প্রমাণ নয়]',
        summaryEn: 'Tax Dakhila paid under former holding. [Supporting evidence only - does NOT prove ownership by itself]',
        parties: { taxPayer: 'হাজী আব্দুল করিম' },
        mouza: 'সাভার',
        dagNumber: '৩১০',
        areaDecimals: 22.0,
        ocrConfidence: 0.95,
        extractedFields: [
          { fieldKey: 'disclaimer', labelBn: 'আইনি ঘোষণা', labelEn: 'Statutory Note', rawValue: 'সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার প্রমাণ নয়', normalizedValue: 'Supporting Only', confidence: 0.99 }
        ]
      }
    ]
  },

  // ---------------------------------------------------------------------------------
  // CASE E: COLLATERAL / MORTGAGE CONFLICT (Rule G001)
  // Scenario: Bank Reviewer persona uploads docs for loan. Dag already pledged to Agrani Bank with court injunction!
  // Target Persona: Bank Loan Officers
  // ---------------------------------------------------------------------------------
  {
    id: 'UB-2026-CASE-E',
    titleBn: 'কেস ই: ব্যাংক বন্ধকী সম্পত্তি ও দেওয়ানি মামলার স্থগিতাদেশ (Rule G001)',
    titleEn: 'Case E: Collateral / Active Bank Mortgage Conflict (Rule G001)',
    descBn: 'ব্যাংক ঋণ পর্যালোচনায় দেখা যায় প্রস্তাবিত দাগটি অগ্রণী ব্যাংকে ইতোপূর্বে দায়বদ্ধ এবং অর্থঋণ আদালত-২ ঢাকায় সক্রিয় দেওয়ানি মামলা ও স্থগিতাদেশ জারি রয়েছে।',
    descEn: 'Bank reviewer flags that Dag 770 is already encumbered as registered collateral to Agrani Bank with an active court injunction in Money Suit No. 44/2025.',
    mouza: 'সাভার',
    dagNumber: '৭৭০',
    area: 45.0,
    expectedRiskLevel: 'critical',
    expectedRiskScore: 90,
    conflictType: 'mortgage_collateral_conflict',
    caseBadge: 'Case E (Rule G001)',
    personaBn: 'ব্যাংক ঋণ কর্মকর্তা (Bank Loan Officer)',
    personaEn: 'Bank Loan Officers',
    ruleCode: 'RULE_G001_MORTGAGE_LIEN',
    documents: [
      {
        id: 'doc-caseE-1',
        name: 'ঋণ_জামানতের_জন্য_প্রস্তাবিত_দলিল_৩৩৫৫.pdf',
        type: 'deed',
        sizeBytes: 1440000,
        hash: '3355e1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        pageCount: 3,
        summaryBn: 'ব্যাংক ঋণ সুবিধার বিপরীতে জামানত হিসেবে প্রস্তাবিত দলিল নং ৩৩৫৫। রিয়াজ মোর্শেদ দাগ ৭৭০ এর ৪৫ শতক জমি মর্টগেজ প্রদানের জন্য আবেদন করেছেন।',
        summaryEn: 'Deed No. 3355 submitted as loan collateral. Riaz Morshed applies to mortgage 45.0 dec in Plot 770 for corporate financing.',
        parties: { seller: 'রিয়াজ মোর্শেদ', buyer: 'ডেল্টা টেক্সটাইল লিঃ' },
        mouza: 'সাভার',
        dagNumber: '৭৭০',
        areaDecimals: 45.0,
        registrationDate: '2026-03-30',
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৩৩৫৫', normalizedValue: '3355', confidence: 0.98, bbox: { x: 120, y: 80, w: 180, h: 35 } },
          { fieldKey: 'applicant', labelBn: 'ঋণ আবেদনকারী/মালিক', labelEn: 'Applicant/Owner', rawValue: 'রিয়াজ মোর্শেদ', normalizedValue: 'রিয়াজ মোর্শেদ', confidence: 0.97 },
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '৭৭০', normalizedValue: '770', confidence: 0.99, bbox: { x: 300, y: 320, w: 140, h: 35 } },
          { fieldKey: 'land_area', labelBn: 'জমির পরিমাণ', labelEn: 'Land Area', rawValue: '৪৫ শতক', normalizedValue: '45.0 শতাংশ', confidence: 0.96 }
        ]
      },
      {
        id: 'doc-caseE-2',
        name: 'অগ্রণী_ব্যাংক_রেজিস্টার্ড_বন্ধকনামা_দলিল_১২০১.pdf',
        type: 'baya_deed',
        sizeBytes: 1530000,
        hash: 'mortgage1201e1234567890abcdef1234567890abcdef1234567890abcdef1234',
        pageCount: 4,
        summaryBn: 'রেজিস্টার্ড মর্টগেজ দলিল নং ১২০১ (২০২৩)। অগ্রণী ব্যাংক প্রধান শাখার অনুকূলে এই দাগটি ৮ কোটি টাকার সিসি হাইপোথিকেশন ঋণের বিপরীতে রেজিস্টার্ড বন্ধকযুক্ত।',
        summaryEn: 'Registered Mortgage Deed No. 1201 (2023). Pledged to Agrani Bank Principal Branch against 8 Crore BDT commercial loan lien.',
        parties: { seller: 'রিয়াজ মোর্শেদ', buyer: 'অগ্রণী ব্যাংক পিএলসি' },
        mouza: 'সাভার',
        dagNumber: '৭৭০',
        areaDecimals: 45.0,
        registrationDate: '2023-04-12',
        ocrConfidence: 0.98,
        extractedFields: [
          { fieldKey: 'mortgage_deed_no', labelBn: 'বন্ধক দলিল নং', labelEn: 'Mortgage Deed No', rawValue: '১২০১', normalizedValue: '1201', confidence: 0.99 },
          { fieldKey: 'mortgagee_bank', labelBn: 'বন্ধকগ্রহীতা ব্যাংক', labelEn: 'Mortgagee Bank', rawValue: 'অগ্রণী ব্যাংক পিএলসি', normalizedValue: 'Agrani Bank PLC', confidence: 0.98 },
          { fieldKey: 'encumbrance_amount', labelBn: 'দায়বদ্ধ ঋণের পরিমাণ', labelEn: 'Lien Exposure', rawValue: '৮,০০,০০,০০০/- (আট কোটি টাকা)', normalizedValue: '80,000,000 BDT', confidence: 0.97 }
        ]
      },
      {
        id: 'doc-caseE-3',
        name: 'আরএস_রেকর্ডীয়_খতিয়ান_৭৭০.pdf',
        type: 'khatian',
        sizeBytes: 950000,
        hash: 'khat770e1234567890abcdef1234567890abcdef1234567890abcdef123456789',
        pageCount: 1,
        summaryBn: 'আরএস খতিয়ান নং ৭৭০। রেকর্ডীয় প্রজা: রিয়াজ মোর্শেদ।',
        summaryEn: 'RS Khatian No. 770. Tenant: Riaz Morshed.',
        parties: { owner: 'রিয়াজ মোর্শেদ' },
        mouza: 'সাভার',
        dagNumber: '৭৭০',
        areaDecimals: 45.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'khatian_number', labelBn: 'খতিয়ান নম্বর', labelEn: 'Khatian Number', rawValue: '৭৭০', normalizedValue: '770', confidence: 0.98 }
        ]
      },
      {
        id: 'doc-caseE-4',
        name: 'নামজারি_খতিয়ান_দায়যুক্ত_৭৭০.pdf',
        type: 'mutation',
        sizeBytes: 880000,
        hash: 'mut770e1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 2,
        summaryBn: 'নামজারি খতিয়ান নং ৮২০। মন্তব্য কলামে লাল কালিতে "অগ্রণী ব্যাংক লিঃ এর নিকট দায়বদ্ধ (Encumbered)" সিলমোহর।',
        summaryEn: 'Mutation record bearing Bank Lien Encumbrance Note in remarks column.',
        parties: { owner: 'রিয়াজ মোর্শেদ' },
        mouza: 'সাভার',
        dagNumber: '৭৭০',
        areaDecimals: 45.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'encumbrance_seal', labelBn: 'দায়বদ্ধতার সিল', labelEn: 'Encumbrance Seal', rawValue: 'অগ্রণী ব্যাংক বরাবরে দায়বদ্ধ', normalizedValue: 'BANK_LIEN_ACTIVE', confidence: 0.98 }
        ]
      },
      {
        id: 'doc-caseE-5',
        name: 'মৌজা_নকশা_দাগ_৭৭০_বাউন্ডারি.pdf',
        type: 'mouza_map',
        sizeBytes: 1980000,
        hash: 'map770e1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 1,
        summaryBn: 'মৌজা নকশা দাগ ৭৭০। কারখানা বাউন্ডারি সংলগ্ন বাণিজ্যিক প্লট।',
        summaryEn: 'Mouza Cadastral Map Plot 770. Commercial plot adjacent to factory.',
        parties: { owner: 'রিয়াজ মোর্শেদ' },
        mouza: 'সাভার',
        dagNumber: '৭৭০',
        areaDecimals: 45.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '৭৭০', normalizedValue: '770', confidence: 0.99 }
        ]
      },
      {
        id: 'doc-caseE-6',
        name: 'অর্থঋণ_আদালত_মামলা_স্থগিতাদেশ_নোটিশ.pdf',
        type: 'tax_receipt',
        sizeBytes: 520000,
        hash: 'courtinjunctione1234567890abcdef1234567890abcdef1234567890abcdef',
        pageCount: 1,
        summaryBn: 'অর্থঋণ আদালত-২ ঢাকা, অর্থ জারি মামলা নং ৪৪/২০২৫। আদেশ: "দাগ ৭৭০ এর জমি হস্তান্তর বা পুনরায় বন্ধক প্রদানে নিষেধাজ্ঞা জারি"। সংগে কর দাখিলা। [সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার প্রমাণ নয়]',
        summaryEn: 'Artha Rin Adalat-2 Dhaka Money Suit 44/2025. Injunction against encumbering or transferring Dag 770. [Supporting evidence only - does NOT prove ownership by itself]',
        parties: { taxPayer: 'রিয়াজ মোর্শেদ' },
        mouza: 'সাভার',
        dagNumber: '৭৭০',
        areaDecimals: 45.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'court_case_no', labelBn: 'আদালত মামলা নং', labelEn: 'Court Suit No', rawValue: 'অর্থ জারি মামলা নং ৪৪/২০২৫', normalizedValue: 'Money Suit 44/2025', confidence: 0.98 },
          { fieldKey: 'injunction_order', labelBn: 'স্থগিতাদেশ আদেশ', labelEn: 'Injunction Order', rawValue: 'হস্তান্তর ও জামানতে নিষেধাজ্ঞা বহাল', normalizedValue: 'INJUNCTION_ACTIVE', confidence: 0.99 },
          { fieldKey: 'disclaimer', labelBn: 'আইনি ঘোষণা', labelEn: 'Statutory Note', rawValue: 'সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার প্রমাণ নয়', normalizedValue: 'Supporting Only', confidence: 0.99 }
        ]
      }
    ]
  },

  // ---------------------------------------------------------------------------------
  // CASE F: LOW OCR CONFIDENCE / HUMAN-IN-THE-LOOP FLAG (Rule X001)
  // Scenario: Smudged stamp/ink on Dag number (45% confidence). AI flags human review gate.
  // Target Persona: All / Responsible AI Audit
  // ---------------------------------------------------------------------------------
  {
    id: 'UB-2026-CASE-F',
    titleBn: 'কেস এফ: নিম্ন ওসিআর নির্ভুলতা ও মানব পর্যালোচনা ফ্ল্যাগ (Rule X001)',
    titleEn: 'Case F: Low OCR Confidence / Human-in-the-Loop Gate (Rule X001)',
    descBn: 'নথির সিল ও দাগ নম্বরে কালি ছড়ানো থাকায় ওসিআর আত্মবিশ্বাস ৪৫% এ নেমে এসেছে। স্বয়ংক্রিয় সিদ্ধান্ত স্থগিত রেখে মানব পর্যালোচনার (HITL) জন্য পাঠানো হয়েছে।',
    descEn: 'Smudged seal and faded handwritten ink on Dag number triggers Low Confidence (45%). AI halts automated scoring and escalates to Human-in-the-Loop review.',
    mouza: 'ধামরাই',
    dagNumber: '৮৮',
    area: 28.0,
    expectedRiskLevel: 'review',
    expectedRiskScore: 52,
    conflictType: 'low_ocr_confidence_hitl',
    caseBadge: 'Case F (Rule X001)',
    personaBn: 'সকল ব্যবহারকারী (দায়িত্বশীল এআই অডিট)',
    personaEn: 'All Users (Responsible AI Audit)',
    ruleCode: 'RULE_X001_LOW_CONFIDENCE_HITL',
    documents: [
      {
        id: 'doc-caseF-1',
        name: 'অস্পষ্ট_হাতে_লেখা_দলিল_দাগ_কালি_ছড়ানো_৫৮১০.pdf',
        type: 'deed',
        sizeBytes: 1520000,
        hash: '5810f1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        pageCount: 3,
        summaryBn: 'দলিল নং ৫৮১০ (১৯৯৮)। রাজস্ব স্ট্যাম্পের কালি ছড়ানো থাকায় দাগ নম্বর (৮৮ নাকি ৮৯) স্পষ্টভাবে পড়া যাচ্ছে না। ওসিআর কনফিডেন্স ৪৫% এ নেমে এসেছে।',
        summaryEn: 'Deed No. 5810 (1998). Smudged official stamp ink obscures plot number (88 or 89). OCR Confidence dropped to 45%. Human verification mandated.',
        parties: { seller: 'আকরাম আলী', buyer: 'মো: জাহিদুল ইসলাম' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 28.0,
        registrationDate: '1998-11-20',
        ocrConfidence: 0.45,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'দলিল নম্বর', labelEn: 'Deed Number', rawValue: '৫৮১০', normalizedValue: '5810', confidence: 0.94, bbox: { x: 120, y: 80, w: 180, h: 35 } },
          { fieldKey: 'seller_name', labelBn: 'বিক্রেতার নাম', labelEn: 'Seller Name', rawValue: 'আকরাম আলী', normalizedValue: 'আকরাম আলী', confidence: 0.92, bbox: { x: 120, y: 180, w: 280, h: 40 } },
          { fieldKey: 'buyer_name', labelBn: 'ক্রেতার নাম', labelEn: 'Buyer Name', rawValue: 'মো: জাহিদুল ইসলাম', normalizedValue: 'মো: জাহিদুল ইসলাম', confidence: 0.93, bbox: { x: 120, y: 240, w: 280, h: 40 } },
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর (অস্পষ্ট)', labelEn: 'Dag Number (Smudged)', rawValue: '৮৮? [কালি ছড়ানো - ৪৫%]', normalizedValue: '88', confidence: 0.45, bbox: { x: 300, y: 320, w: 140, h: 35 } },
          { fieldKey: 'land_area', labelBn: 'জমির পরিমাণ', labelEn: 'Land Area', rawValue: '২৮ শতক', normalizedValue: '28.0 শতাংশ', confidence: 0.89 }
        ]
      },
      {
        id: 'doc-caseF-2',
        name: 'পূর্ববর্তী_বায়া_দলিল_১৯৮৮.pdf',
        type: 'baya_deed',
        sizeBytes: 1490000,
        hash: 'baya1988f1234567890abcdef1234567890abcdef1234567890abcdef12345678',
        pageCount: 3,
        summaryBn: '১৯৮৮ সালের হস্তান্তরিত বায়া দলিল।',
        summaryEn: 'Historical 1988 baya title deed.',
        parties: { seller: 'বশির উদ্দিন', buyer: 'আকরাম আলী' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 28.0,
        registrationDate: '1988-02-14',
        ocrConfidence: 0.92,
        extractedFields: [
          { fieldKey: 'deed_number', labelBn: 'বায়া দলিল নং', labelEn: 'Baya Deed No', rawValue: '১৬৮০', normalizedValue: '1680', confidence: 0.93 }
        ]
      },
      {
        id: 'doc-caseF-3',
        name: 'সিএস_খতিয়ান_রেকর্ড_৮৮.pdf',
        type: 'khatian',
        sizeBytes: 920000,
        hash: 'khat88f1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        pageCount: 1,
        summaryBn: 'সিএস খতিয়ান নং ৮৮। প্রজা: বশির উদ্দিন।',
        summaryEn: 'CS Khatian No. 88. Tenant: Bashir Uddin.',
        parties: { owner: 'বশির উদ্দিন' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 28.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'khatian_number', labelBn: 'খতিয়ান নম্বর', labelEn: 'Khatian Number', rawValue: '৮৮', normalizedValue: '88', confidence: 0.98 }
        ]
      },
      {
        id: 'doc-caseF-4',
        name: 'নামজারি_খতিয়ান_৫৮১০.pdf',
        type: 'mutation',
        sizeBytes: 810000,
        hash: 'mutcaseF1234567890abcdef1234567890abcdef1234567890abcdef123456789',
        pageCount: 1,
        summaryBn: 'নামজারি নথি। দাগ নম্বরে অস্পষ্টতার রেফারেন্স।',
        summaryEn: 'Mutation record. References plot smudging.',
        parties: { owner: 'মো: জাহিদুল ইসলাম' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 28.0,
        ocrConfidence: 0.94,
        extractedFields: [
          { fieldKey: 'mutation_note', labelBn: 'নোট', labelEn: 'Note', rawValue: 'মূল দলিল তলবের আদেশ', normalizedValue: 'CALL_ORIGINAL_DEED', confidence: 0.95 }
        ]
      },
      {
        id: 'doc-caseF-5',
        name: 'মৌজা_নকশা_দাগ_৮৮_ক্যাডাস্ট্রাল.pdf',
        type: 'mouza_map',
        sizeBytes: 2050000,
        hash: 'mapcaseF1234567890abcdef1234567890abcdef1234567890abcdef123456789',
        pageCount: 1,
        summaryBn: 'মৌজা নকশা দাগ ৮৮ ও পার্শ্ববর্তী দাগ ৮৯। ভৌগোলিক সীমানা যাচাই।',
        summaryEn: 'Mouza Cadastral Map Plot 88 & Adjacent Plot 89.',
        parties: { owner: 'আকরাম আলী' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 28.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '৮৮', normalizedValue: '88', confidence: 0.99 }
        ]
      },
      {
        id: 'doc-caseF-6',
        name: 'ভূমি_উন্নয়ন_কর_দাখিলা_১৪৩২.pdf',
        type: 'tax_receipt',
        sizeBytes: 420000,
        hash: 'taxcaseF1234567890abcdef1234567890abcdef1234567890abcdef123456789',
        pageCount: 1,
        summaryBn: 'ভূমি উন্নয়ন কর দাখিলা নং ৯৫১২। [সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার চূড়ান্ত প্রমাণ নয়]',
        summaryEn: 'Land Development Tax Dakhila No. 9512. [Supporting evidence only - does NOT prove ownership by itself]',
        parties: { taxPayer: 'মো: জাহিদুল ইসলাম' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 28.0,
        ocrConfidence: 0.94,
        extractedFields: [
          { fieldKey: 'disclaimer', labelBn: 'আইনি ঘোষণা', labelEn: 'Statutory Note', rawValue: 'সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার প্রমাণ নয়', normalizedValue: 'Supporting Only', confidence: 0.99 }
        ]
      }
    ]
  },

  // ---------------------------------------------------------------------------------
  // CLASSIC: SUSPECTED DOUBLE-SELLING CONFLICT (Rule P003 / P3)
  // Scenario: Same seller Kamal Hossain executes two separate deeds for exact same parcel to two buyers!
  // ---------------------------------------------------------------------------------
  {
    id: 'UB-2026-1002',
    titleBn: 'মৌজা ধামরাই দাগ ৮৮ - দ্বৈত বিক্রির গুরুতর কেস (Classic Double-Sale)',
    titleEn: 'Mouza Dhamrai Dag 88 - Classic Double-Sale Conflict',
    descBn: 'একই বিক্রেতা কামাল হোসেন কর্তৃক একই দাগের জমি দুই ভিন্ন ব্যক্তির নিকট মাত্র ২০ দিনের ব্যবধানে বিক্রয়ের অপরাধমূলক দ্বৈত হস্তান্তর শনাক্ত।',
    descEn: 'Critical fraud risk: same seller Kamal Hossain executed two separate sale deeds for the exact same parcel to two different buyers within 20 days.',
    mouza: 'ধামরাই',
    dagNumber: '৮৮',
    area: 40.0,
    expectedRiskLevel: 'critical',
    expectedRiskScore: 85,
    conflictType: 'double_sale',
    caseBadge: 'Double Sale (P3)',
    personaBn: 'সাব-রেজিস্ট্রি ও ফৌজদারি অডিট',
    personaEn: 'Sub-Registry & Fraud Investigation',
    ruleCode: 'RULE_P003_DOUBLE_SALE',
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
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '৮৮', normalizedValue: '88', confidence: 0.99, bbox: { x: 300, y: 320, w: 140, h: 35 } },
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
      },
      {
        id: 'doc-1002-4',
        name: 'নামজারি_খতিয়ান_রফিকুল_৮৮.pdf',
        type: 'mutation',
        sizeBytes: 840000,
        hash: 'mut88rafiqul1234567890abcdef1234567890abcdef1234567890abcdef12',
        pageCount: 2,
        summaryBn: 'রফিকুল ইসলামের অনুকূলে পূর্বে অনুমোদিত নামজারি খতিয়ান। দাগ ৮৮ এর ৪০ শতক সম্পূর্ণ তার নামে হালনাগাদ।',
        summaryEn: 'Mutation Record previously approved for Rafiqul Islam. Entire 40.0 dec mutated.',
        parties: { owner: 'মো: রফিকুল ইসলাম' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 40.0,
        ocrConfidence: 0.96,
        extractedFields: [
          { fieldKey: 'mutated_owner', labelBn: 'নামজারি গ্রহীতা', labelEn: 'Mutated Owner', rawValue: 'মো: রফিকুল ইসলাম', normalizedValue: 'মো: রফিকুল ইসলাম', confidence: 0.97 }
        ]
      },
      {
        id: 'doc-1002-5',
        name: 'মৌজা_নকশা_ধামরাই_দাগ_৮৮.pdf',
        type: 'mouza_map',
        sizeBytes: 2150000,
        hash: 'map88dhamrai1234567890abcdef1234567890abcdef1234567890abcdef12',
        pageCount: 1,
        summaryBn: 'মৌজা নকশা শিট নং ২, দাগ ৮৮ (৪০ শতক)। সীমানা বিরোধ ও দখল সংঘাত।',
        summaryEn: 'Mouza Cadastral Map Plot 88 (40 dec). Double sale conflict zone.',
        parties: { owner: 'কামাল হোসেন' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 40.0,
        ocrConfidence: 0.97,
        extractedFields: [
          { fieldKey: 'dag_number', labelBn: 'দাগ নম্বর', labelEn: 'Dag Number', rawValue: '৮৮', normalizedValue: '88', confidence: 0.99 }
        ]
      },
      {
        id: 'doc-1002-6',
        name: 'ভূমি_উন্নয়ন_কর_দাখিলা_১৪৩২.pdf',
        type: 'tax_receipt',
        sizeBytes: 440000,
        hash: 'tax88dhamrai1234567890abcdef1234567890abcdef1234567890abcdef12',
        pageCount: 1,
        summaryBn: 'ভূমি উন্নয়ন কর দাখিলা নং ৯৪৫০ (১৪৩২ বঙ্গাব্দ)। [সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার চূড়ান্ত প্রমাণ নয়]',
        summaryEn: 'Land Development Tax Dakhila No. 9450. [Supporting evidence only - does NOT prove ownership by itself]',
        parties: { taxPayer: 'মো: রফিকুল ইসলাম' },
        mouza: 'ধামরাই',
        dagNumber: '৮৮',
        areaDecimals: 40.0,
        ocrConfidence: 0.95,
        extractedFields: [
          { fieldKey: 'disclaimer', labelBn: 'আইনি ঘোষণা', labelEn: 'Statutory Note', rawValue: 'সহায়ক প্রমাণপত্র মাত্র — এককভাবে মালিকানার প্রমাণ নয়', normalizedValue: 'Supporting Only', confidence: 0.99 }
        ]
      }
    ]
  }
];
