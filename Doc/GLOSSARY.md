# UNLEFT LandGuard — Bilingual LandTech & Legal Terminology Glossary
**দ্বিভাষিক ভূমি সেবা ও দলিল জালিয়াতি নিরোধ শব্দকোষ**  
*Document Version: 1.0.0 | Prepared for LandTech Innovation Hackathon 2026*

This official bilingual glossary defines the core land administration, cadastral surveying, cryptographic, and fraud-detection terms used across **UNLEFT LandGuard** (UNBUmi Detector). It governs all interface translations, report generation, and system documentation to ensure precise, grammatically natural Bangladeshi Bangla and professional legal-tech English.

---

## 1. Core Land Records & Documents (দলিল ও রেকর্ডপত্র)

| English Term | Preferred Bangla | Explanation (English) | Explanation (Bangla) | Usage & Context Rules |
|---|---|---|---|---|
| **Deed / Title Deed** | সাফ-কবলা দলিল / মূল দলিল | The registered legal instrument transferring ownership from seller to buyer. | জমি হস্তান্তরের মূল নিবন্ধিত আইনি দলিল যার মাধ্যমে ক্রেতা মালিকানা লাভ করেন। | In source records, retain deed number (e.g., দলিল নং ৪৪০১/২০২৪). |
| **Registered Deed** | নিবন্ধিত দলিল | A deed formally registered under the Registration Act 1908 at a Sub-Registry Office. | সাব-রেজিস্ট্রি অফিসে ১৯০৮ সালের রেজিস্ট্রেশন আইনের অধীনে বিধিমোতাবেক নিবন্ধিত দলিল। | Use when distinguishing officially registered instruments from unverified private contracts. |
| **Baya Deed / Chain Deed** | বায়া দলিল / পূর্ববর্তী দলিল | Previous historical deeds proving how the current seller acquired title from earlier owners. | বর্তমান বিক্রেতা কীভাবে জমির স্বত্ব পেয়েছিলেন তা প্রমাণকারী পূর্ববর্তী হস্তান্তর দলিল। | Critical for Rule `O001` (Broken ownership chain). |
| **Khatian / Record of Rights (RoR)** | খতিয়ান / স্বত্বলিপি | Official revenue survey record published by the government showing ownership, plot, and share. | সরকারের ভূমি জরিপ বিভাগ কর্তৃক প্রস্তুতকৃত স্বত্বলিপি যাতে জমির মালিক, দাগ ও হিস্যার হিসাব থাকে। | Specify survey type where known: CS, SA, RS, BS/City (e.g., আরএস খতিয়ান). |
| **Mutation / Namjari** | নামজারি ও জমাভাগ (মিউটেশন) | The administrative procedure updating the RoR and tax roll when ownership changes via sale/inheritance. | হস্তান্তরের পর এসিল্যান্ড কর্তৃক রেকর্ড সংশোধন ও ক্রেতার নামে নতুন খতিয়ান খোলার প্রক্রিয়া। | Use "নামজারি" in UI; retain "Mutation Record" in English. |
| **Dakhila / Land Tax Receipt** | ভূমি উন্নয়ন কর দাখিলা | Official receipt proving payment of annual land development tax to the Union Land Office. | ইউনিয়ন ভূমি সহকারী কর্মকর্তার নিকট বার্ষিক ভূমি উন্নয়ন কর পরিশোধের সরকারি রসিদ। | Rule `T001` checks consistency of tax receipts. |
| **Mouza Map / Cadastral Map** | মৌজা নকশা / ক্যাডাস্ট্রাল ম্যাপ | Geographic survey sheet depicting boundaries and layout of all plots within a revenue village. | নির্দিষ্ট রাজস্ব মৌজার আওতাধীন সকল দাগের ভৌগোলিক সীমানা প্রদর্শনকারী জরিপ মানচিত্র। | Used in boundary and overlap analysis (Rule `P003`). |

---

## 2. Parcel & Cadastral Geography (দাগ, জমি ও মৌজা)

| English Term | Preferred Bangla | Explanation (English) | Explanation (Bangla) | Usage & Context Rules |
|---|---|---|---|---|
| **Parcel / Plot** | জমি / প্লট / দাগ | A geographically defined, numbered tract of land subject to discrete ownership. | একক মালিকানা বা হিস্যাভুক্ত সুনির্দিষ্ট সীমারেখা বিশিষ্ট পরিমাপকৃত ভূমি। | Use "দাগ" when referring to numbered plots; "জমি" for land in general. |
| **Dag Number / Plot Number** | দাগ নম্বর | The unique identifier assigned to a parcel on the cadastral survey map. | মৌজা নকশায় প্রতিটি জমির প্লট চিহ্নিতকরণের সরকারি নম্বর। | Retain original numerals in document citations (e.g., দাগ নং ৮৮). |
| **Mouza** | মৌজা | The foundational cadastral revenue unit in Bangladesh land administration. | জরিপ ও রাজস্ব আদায়ের মৌলিক ভৌগোলিক একক (গ্রাম বা মহল্লা স্তর)। | Keep official name as transliterated in records (e.g., মৌজা: ধামরাই). |
| **Recorded Area (Decimals)** | রেকর্ডকৃত জমির পরিমাণ (শতাংশ) | The land area registered in decimals (1 decimal = 435.6 sq ft = 1/100 acre). | খতিয়ান বা দলিলে উল্লিখিত জমির পরিমাপ (১ শতাংশ = ৪৩৫.৬ বর্গফুট)। | Format: "৪০.০ শতাংশ" / "40.0 decimals". |
| **Chouhaddi / Boundaries** | চৌহদ্দি (চারদিকের সীমানা) | The four bordering descriptions (North, South, East, West) defining parcel perimeters. | হস্তান্তরিত জমির উত্তর, দক্ষিণ, পূর্ব ও পশ্চিম পার্শ্ববর্তী দাগ বা সীমানার বর্ণনা। | Rule `P003` cross-checks boundary consistency. |

---

## 3. Parties & Transactions (পক্ষ ও হস্তান্তর)

| English Term | Preferred Bangla | Explanation (English) | Explanation (Bangla) | Usage & Context Rules |
|---|---|---|---|---|
| **Recorded Owner** | রেকর্ডভুক্ত মালিক | The person whose title is recognized in the official government RoR (Khatian). | সরকারি খতিয়ান বা স্বত্বলিপিতে নাম অন্তর্ভুক্ত বৈধ জমির মালিক। | Essential for cross-checking against the seller named in a deed. |
| **Seller** | বিক্রেতা / দাতা | The party transferring the land interest in a deed. | দলিলের মাধ্যমে যিনি জমির স্বত্ব বা দখল অন্যের নিকট হস্তান্তর করছেন। | Do not confuse with previous Baya sellers. |
| **Buyer** | ক্রেতা / গ্রহীতা | The party receiving the land title in consideration of payment. | যিনি মূল্য পরিশোধের বিনিময়ে দলিলের মাধ্যমে জমির মালিকানা গ্রহণ করছেন। | In double-selling cases, identify Competing Buyers (প্রতিদ্বন্দ্বী ক্রেতা). |
| **Ownership Chain** | মালিকানা ধারাবাহিকতা (চেইন) | The unbroken sequence of transfers connecting the sovereign or CS record to the current seller. | সিএস খতিয়ান থেকে বর্তমান বিক্রেতা পর্যন্ত জমি হস্তান্তরের অবিচ্ছিন্ন আইনি পরম্পরা। | Rule `O001` & `O002` verify chain continuity. |
| **Competing Buyer** | প্রতিদ্বন্দ্বী ক্রেতা | A subsequent or parallel buyer claiming the same parcel under conflicting deeds. | একই দাগের জমি অপর দলিলের মাধ্যমে ক্রয়ের দাবিদার দ্বিতীয় ব্যক্তি। | Used exclusively in double-selling investigations. |

---

## 4. Fraud Detection & Investigation Terms (জালিয়াতি ও অনুসন্ধান)

| English Term | Preferred Bangla | Explanation (English) | Explanation (Bangla) | Usage & Context Rules |
|---|---|---|---|---|
| **Potential Double-Selling** | সম্ভাব্য দ্বৈত বিক্রি | Suspicion that the same parcel was sold to multiple buyers without legitimate title. | একই দাগের জমি পূর্বে বিক্রির পরও পুনরায় অন্য ব্যক্তির নিকট বিক্রির চেষ্টা। | Never state "Double-Selling Confirmed"; use "Potential" until adjudicated. |
| **Broken Ownership Chain** | মালিকানা ধারাবাহিকতা বিচ্ছিন্ন | An ownership gap where the seller cannot produce the intermediate Baya deed. | বিক্রেতার পক্ষে স্বত্বাধিকারী হওয়ার পূর্ববর্তী দলিলের আইনি লিংকের অনুপস্থিতি। | Rule `O001`. |
| **Deed–Khatian Mismatch** | দলিল বনাম খতিয়ান অমিল | Contradiction between the owner recorded in the revenue khatian and the deed seller. | খতিয়ানের বৈধ মালিকের নামের সাথে প্রস্তাবিত দলিলের বিক্রেতার নামের গরমিল। | Rule `K001`. |
| **Cryptographic Fingerprint** | নথির ডিজিটাল ফিঙ্গারপ্রিন্ট | SHA-256 hash verifying if a digital document matches an identical registered file byte-for-byte. | ফাইলের বাইট পরীক্ষা করে অবিকল ডিজিটাল প্রতিলিপি শনাক্তকারী হ্যাশ কোড। | Distinguish clearly: proving file identity is NOT proving legal title authenticity! |
| **Discrepancy Breakdown** | পরস্পরবিরোধী তথ্যের তুলনামূলক বিবরণ | Side-by-side presentation of conflicting fields across different instruments. | একাধিক দলিলের মধ্যে অমিল হওয়া তথ্য পাশাপাশি রেখে তুলনামূলক প্রদর্শন। | Shown in Case Findings and Investigation Reports. |
| **Traceable Evidence** | সূত্রবদ্ধ প্রমাণ-সহায়ক তথ্য | Specific document IDs, page numbers, and bounding-box coordinates backing a finding. | যে সুনির্দিষ্ট নথি, পৃষ্ঠা ও তথ্যের ওপর ভিত্তি করে সিস্টেমে অ্যালার্ট তৈরি হয়েছে। | Every alert must link to traceable evidence. |
| **Human Review** | মানবীয় পর্যালোচনা | Mandatory assessment by an authorized officer; system does NOT make legal rulings. | সাব-রেজিস্ট্রার বা তদন্তকারী কর্মকর্তা কর্তৃক সংকেত যাচাই ও সিদ্ধান্ত গ্রহণ। | AI assists; the human decides. |

---

## 5. System Statuses & Dispositions (স্থিতি ও পর্যালোচক সিদ্ধান্ত)

| Code / Key | Preferred Bangla | Preferred English | Explanation & Usage |
|---|---|---|---|
| `pending` | অপেক্ষমান | Pending Ingestion | Case created, documents awaiting analysis. |
| `processing` | বিশ্লেষণ চলছে | Processing | Extraction and rule checks currently executing. |
| `flagged_review` | পর্যালোচনা প্রয়োজন | Needs Review | Deterministic rules detected inconsistencies; review queue dispatch. |
| `verified_clean` | অসঙ্গতিহীন | Verified Consistent | No transaction conflicts or chain gaps detected across records. |
| `resolved` | নিষ্পত্তি হয়েছে | Review Resolved | Human reviewer completed investigation and recorded official disposition. |
| `critical` | গুরুতর সংকেত | Critical Conflict | Severe conflict: double-selling or temporal transfer impossibility. |
| `high` | উচ্চ ঝুঁকি | High Risk | Missing Baya deed, deed-khatian owner mismatch, area inflation. |
| `review` | পর্যালোচনা স্তর | Review Priority | Moderate discrepancy or low OCR confidence requiring human eye. |
| `low` | স্বাভাবিক | Low Risk | No suspicious patterns detected. |
