'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

export const DICTIONARY: Translations = {
  // Common & Branding
  brand_title: { bn: 'আনলেফট ল্যান্ডগার্ড', en: 'UNLEFT LandGuard' },
  brand_subtitle: { bn: 'আনভূমি ডিটেক্টর', en: 'UNBUmi Detector' },
  brand_badge: { bn: 'বাংলাদেশ ভূমি সেবা ও দ্বৈত বিক্রি শনাক্তকরণ প্ল্যাটফর্ম (P3 / P2)', en: 'Bangladesh Multimodal Land-Fraud & Double-Selling Detection (P3 / P2)' },
  hero_headline: { bn: 'একটি দাগ। একাধিক দলিল। একটি প্রমাণ পথ।', en: 'One plot. Multiple deeds. One evidence trail.' },
  hero_title: { bn: 'একটি দাগ। একাধিক দলিল। একটি প্রমাণ পথ।', en: 'One plot. Multiple deeds. One evidence trail.' },
  hero_supporting: {
    bn: 'দলিল, খতিয়ান রেকর্ড, নামজারি তথ্য এবং দাগের পারস্পরিক সম্পর্ক ক্রস-চেক করে দ্বৈত বিক্রি ও স্বত্ব বিরোধ শনাক্ত করুন এবং তদন্তের জন্য সুনির্দিষ্ট প্রমাণ নিশ্চিত করুন।',
    en: 'Cross-check deeds, khatian records, mutation information, and parcel relationships to identify suspicious conflicts and give reviewers traceable evidence for investigation.'
  },
  hero_description: {
    bn: 'দলিল, খতিয়ান রেকর্ড, নামজারি তথ্য এবং দাগের পারস্পরিক সম্পর্ক ক্রস-চেক করে দ্বৈত বিক্রি ও স্বত্ব বিরোধ শনাক্ত করুন এবং তদন্তের জন্য সুনির্দিষ্ট প্রমাণ নিশ্চিত করুন।',
    en: 'Cross-check deeds, khatian records, mutation information, and parcel relationships to identify suspicious conflicts and give reviewers traceable evidence for investigation.'
  },
  cta_verify: { bn: 'নতুন অনুসন্ধান শুরু করুন', en: 'Start New Investigation' },
  cta_how_it_works: { bn: 'তদন্ত কার্যপদ্ধতি', en: 'Investigation Workflow' },
  cta_demo_explore: { bn: 'দ্বৈত বিক্রি ডেমো দেখুন (UB-2026-1002)', en: 'Demo Case: Double-Selling (UB-2026-1002)' },
  live_database: { bn: 'লাইভ ডাটাবেস', en: 'Live Database' },
  reseed_demo: { bn: 'ডেমো ডাটা রিসেট', en: 'Reset Demo Data' },
  reseeding: { bn: 'রিসেট হচ্ছে...', en: 'Resetting...' },
  reseed_success: { bn: '৮টি সিন্থেটিক টেস্ট কেস সফলভাবে রিসেট করা হয়েছে।', en: '8 synthetic test cases reset successfully.' },
  save: { bn: 'সংরক্ষণ করুন', en: 'Save' },
  save_changes: { bn: 'পরিবর্তন সংরক্ষণ করুন', en: 'Save Changes' },
  saving: { bn: 'সংরক্ষণ হচ্ছে...', en: 'Saving...' },
  saved_success: { bn: 'সফলভাবে সংরক্ষিত হয়েছে।', en: 'Saved successfully.' },
  cancel: { bn: 'বাতিল', en: 'Cancel' },
  refresh: { bn: 'রিফ্রেশ', en: 'Refresh' },
  view_all: { bn: 'সব দেখুন', en: 'View All' },
  details: { bn: 'বিস্তারিত', en: 'Details' },
  inspect_evidence: { bn: 'উৎস প্রমাণ দেখুন', en: 'Inspect Evidence' },
  back_to_cases: { bn: 'সকল মামলার তালিকা', en: 'All Cases Directory' },
  print_pdf: { bn: 'প্রতিবেদন প্রিন্ট / PDF', en: 'Print / Export PDF' },
  export_json: { bn: 'JSON এক্সপোর্ট', en: 'Export JSON' },
  retry: { bn: 'আবার চেষ্টা করুন', en: 'Try Again' },
  no_results: { bn: 'কোনো ফলাফল পাওয়া যায়নি', en: 'No Results Found' },
  case_not_found: { bn: 'মামলা পাওয়া যায়নি', en: 'Case Not Found' },
  search_placeholder: { bn: 'কেস নম্বর, মৌজা বা শিরোনাম লিখে খুঁজুন...', en: 'Search by case ID, mouza, or title...' },
  loading_data: { bn: 'তথ্য লোড হচ্ছে...', en: 'Loading data...' },
  
  // Navigation
  nav_overview: { bn: 'সারসংক্ষেপ', en: 'Overview' },
  nav_dashboard: { bn: 'সারসংক্ষেপ', en: 'Overview' },
  nav_new_investigation: { bn: 'নতুন অনুসন্ধান', en: 'New Investigation' },
  nav_new_case: { bn: 'নতুন অনুসন্ধান', en: 'New Investigation' },
  nav_cases: { bn: 'মামলার নথি', en: 'Cases' },
  nav_documents: { bn: 'নথিপত্র লাইব্রেরি', en: 'Documents' },
  nav_alerts: { bn: 'সতর্কতা', en: 'Alerts' },
  nav_queue: { bn: 'সতর্কতা', en: 'Alerts' },
  nav_graph: { bn: 'মালিকানা সম্পর্কচিত্র', en: 'Ownership Graph' },
  nav_reports: { bn: 'প্রতিবেদন', en: 'Reports' },
  nav_methodology: { bn: 'পদ্ধতি ও সীমাবদ্ধতা', en: 'Methodology' },
  nav_settings: { bn: 'সেটিংস ও প্রোফাইল', en: 'Settings & Profile' },
  nav_login: { bn: 'ডেমো সাইন ইন', en: 'Demo Sign In' },
  nav_logout: { bn: 'সাইন আউট', en: 'Sign Out' },

  // Operational Inquiries (Overview Page)
  dash_title: { bn: 'ভূমি স্বত্ব ও দলিল তদন্ত সারসংক্ষেপ', en: 'Investigation Overview' },
  dash_subtitle: { bn: 'দলিল অখণ্ডতা, খতিয়ান সামঞ্জস্য, বায়া চেইন এবং দাগভিত্তিক দ্বৈত বিক্রির ঝুঁকি নিরীক্ষা।', en: 'Cross-checking deed integrity, khatian records, ownership chains, and parcel-level double-selling conflicts.' },
  dash_assessment_title: { bn: 'পর্যালোচকের ৪টি মূল প্রশ্নের উত্তর (Operational Assessment)', en: 'Operational Review Assessment (4 Core Inquiries)' },
  dash_db_stats: { bn: 'বাস্তব ডাটাবেস পরিসংখ্যান', en: 'Live Database Statistics' },
  dash_q1_title: { bn: '১. কতটি মামলা তদন্তাধীন?', en: '1. Cases Under Investigation?' },
  dash_q1_desc: { bn: '{count}টি সক্রিয় কেস ({docs}টি নথি)', en: '{count} active cases ({docs} documents)' },
  dash_q2_title: { bn: '২. অমীমাংসিত দ্বন্দ্ব কতটিতে?', en: '2. Unresolved Conflicts?' },
  dash_q2_desc: { bn: '{count}টিতে দ্বৈত বিক্রি ও স্বত্ব অমিল', en: '{count} critical/double-selling conflicts' },
  dash_q3_title: { bn: '৩. মানবীয় পর্যালোচনা আবশ্যক?', en: '3. Human Review Required?' },
  dash_q3_desc: { bn: '{count}টি কেস কিউতে অপেক্ষমান', en: '{count} cases awaiting disposition' },
  dash_q4_title: { bn: '৪. পর্যালোচকের করণীয় কী?', en: '4. Recommended Reviewer Action?' },
  dash_q4_desc: { bn: 'কেস UB-2026-1002 (ধামরাই দাগ ৮৮) দ্বৈত বিক্রি সংকেত ও প্রমাণ পর্যালোচনা করুন।', en: 'Inspect Case UB-2026-1002 (Dhamrai, Dag 88) double-selling conflict and record disposition.' },
  dash_open_investigation: { bn: 'তদন্ত খুলুন', en: 'Open Investigation' },
  dash_recent_cases: { bn: 'সাম্প্রতিক দলিল যাচাই কেসসমূহ', en: 'Recent Investigation Cases' },
  dash_audit_activity: { bn: 'সাম্প্রতিক অডিট লগ (Audit Activity)', en: 'Recent Audit Log Activity' },
  dash_survey_visual_caption: { bn: 'সাব-রেজিস্ট্রি ও সহকারী কমিশনার (ভূমি) কার্যালয়ের ক্রস-রেফারেন্সিং সিমুলেশন', en: 'Sub-registry & AC Land cross-referencing simulation' },
  dash_survey_visual_alt: { bn: 'আমিন ও সার্ভেয়ারদের মৌজা ম্যাপ এবং প্লট পরিমাপ', en: 'Cadastral surveyors measuring plot boundaries on mouza map' },

  // KPI Metric Labels
  metric_total_cases: { bn: 'তদন্তাধীন মোট মামলা', en: 'Cases Under Investigation' },
  metric_critical_risks: { bn: 'অমীমাংসিত দ্বন্দ্ব ও বিরোধ', en: 'Unresolved Conflicts' },
  metric_needs_review: { bn: 'মানবীয় পর্যালোচনা আবশ্যক', en: 'Human Review Required' },
  metric_clean_cases: { bn: 'যাচাইকৃত অসঙ্গতিহীন', en: 'Verified Consistent' },
  metric_total_docs: { bn: 'মোট নথি বিশ্লেষণ', en: 'Documents Analyzed' },
  metric_docs_included: { bn: '{count}টি নথি অন্তর্ভুক্ত', en: '{count} documents included' },
  metric_urgent_action: { bn: 'জরুরি পদক্ষেপ আবশ্যক', en: 'Immediate action required' },
  metric_queue_waiting: { bn: 'পর্যালোচকের কিউতে অপেক্ষমান', en: 'Awaiting human disposition' },
  metric_clean_desc: { bn: 'অসঙ্গতিহীন যাচাই সম্পন্ন', en: 'Zero inconsistencies detected' },

  // Cases Directory
  cases_title: { bn: 'ভূমি যাচাই কেস ডিরেক্টরি', en: 'Land Verification Cases Directory' },
  cases_subtitle: { bn: 'পর্যালোচনাধীন, দ্বৈত বিক্রি ঝুঁকি এবং বৈধ হিসেবে নিষ্পত্তিকৃত দলিলের সার্বিক তালিকা।', en: 'Complete register of pending, high-conflict, and verified consistent land cases.' },
  filter_all_risks: { bn: 'সকল ঝুঁকি মাত্রা (All Risks)', en: 'All Risk Levels' },
  filter_all_status: { bn: 'সকল স্ট্যাটাস (All Status)', en: 'All Statuses' },
  col_case_ref: { bn: 'কেস রেফারেন্স', en: 'Case Reference' },
  col_title_mouza: { bn: 'শিরোনাম ও মৌজা', en: 'Title & Mouza' },
  col_risk: { bn: 'ঝুঁকি মূল্যায়ন', en: 'Risk Evaluation' },
  col_docs_anomalies: { bn: 'নথি ও সংকেত', en: 'Documents & Findings' },
  col_status: { bn: 'স্থিতি', en: 'Status' },
  col_date: { bn: 'তারিখ', en: 'Date Filed' },
  col_action: { bn: 'কার্যক্রম', en: 'Action' },
  mouza_label_short: { bn: 'মৌজা: {mouza} • দাগ: {dag}', en: 'Mouza: {mouza} • Dag: {dag}' },

  // Case Detail
  case_filed_date: { bn: 'দাখিল: {date}', en: 'Filed: {date}' },
  case_updated_date: { bn: 'সর্বশেষ আপডেট: {time}', en: 'Last updated: {time}' },
  mouza_area_label: { bn: 'মৌজা ও এলাকা', en: 'Mouza & Area' },
  dag_survey_label: { bn: 'দাগ ও জরিপ', en: 'Plot (Dag) & Survey' },
  dag_survey_val: { bn: 'দাগ নং {dag} ({survey})', en: 'Dag No. {dag} ({survey})' },
  recorded_area_label: { bn: 'রেকর্ডকৃত জমি', en: 'Recorded Area' },
  recorded_area_val: { bn: '{area} শতাংশ', en: '{area} decimals' },
  attached_docs_label: { bn: 'সংযুক্ত নথিপত্র', en: 'Attached Documents' },
  attached_docs_val: { bn: '{count}টি দলিল/খতিয়ান', en: '{count} Deeds/Khatians' },
  risk_reason_title: { bn: 'ঝুঁকি সংকেতের কারণ ও সারসংক্ষেপ:', en: 'Risk Findings Summary:' },
  risk_clean_summary: { bn: 'প্রদত্ত নথিসমূহে কোনো সুস্পষ্ট স্বত্ব বিরোধ বা খতিয়ান অমিল শনাক্ত হয়নি।', en: 'No transaction conflicts or khatian ownership discrepancies detected.' },
  rerun_checks_btn: { bn: 'পুনরায় চেক চালান', en: 'Re-run Analysis' },
  running_checks: { bn: 'যাচাই চলছে...', en: 'Analyzing...' },
  tab_findings: { bn: 'শনাক্তকৃত অসঙ্গতিসমূহ ({count})', en: 'Detected Inconsistencies ({count})' },
  tab_graph: { bn: 'মালিকানা ও লেনদেন গ্রাফ', en: 'Ownership & Transaction Graph' },
  tab_documents: { bn: 'নথি প্রিভিউ ও ওসিআর ({count})', en: 'Document Preview & OCR ({count})' },
  tab_audit: { bn: 'অডিট ট্রেইল ({count})', en: 'Audit Trail ({count})' },
  finding_rule_badge: { bn: 'রুল: {code}', en: 'Rule: {code}' },
  finding_details_label: { bn: 'শনাক্তকরণের বিস্তারিত বিবরণ:', en: 'Detection Details & Context:' },
  discrepancy_title: { bn: 'পরস্পরবিরোধী রেকর্ডসমূহ (Discrepancy Breakdown):', en: 'Conflicting Records (Discrepancy Breakdown):' },
  goto_docs_btn: { bn: 'নথি প্রমাণে যান', en: 'Inspect Source Document' },
  reviewer_action_label: { bn: 'পর্যালোচকের করণীয়:', en: 'Reviewer Recommended Action:' },
  no_findings_title: { bn: 'কোনো অসঙ্গতি বা জালিয়াতির সংকেত পাওয়া যায়নি', en: 'No Inconsistencies or Fraud Conflicts Detected' },
  no_findings_desc: { bn: 'সকল দাখিলকৃত দলিল, বায়া দলিল, আরএস খতিয়ান ও রাজস্ব রেকর্ড সম্পূর্ণ সামঞ্জস্যপূর্ণ।', en: 'All submitted deeds, chain documents, RS khatian, and revenue records are mutually consistent.' },

  // Human Review & Case Disposition Panel
  review_panel_title: { bn: 'মানবীয় পর্যালোচনা ও কেস নিষ্পত্তি (Human Review & Case Disposition)', en: 'Human Review & Case Disposition' },
  review_panel_subtitle: { bn: 'পর্যালোচকের সিদ্ধান্ত সরাসরি ডাটাবেসে সংরক্ষিত হয় এবং অডিট ট্রেইলে লিপিবদ্ধ থাকে।', en: 'Reviewer determinations are stored in the database and logged in the immutable audit trail.' },
  current_status_label: { bn: 'বর্তমান স্থিতি:', en: 'Current Status:' },
  select_status_label: { bn: 'নতুন স্থিতি নির্বাচন করুন:', en: 'Select Review Disposition:' },
  opt_flagged_review: { bn: 'পর্যালোচনা প্রয়োজন (Needs Review)', en: 'Needs Review' },
  opt_verified_clean: { bn: 'যাচাই সম্পন্ন - অসঙ্গতিহীন (Verified Clean)', en: 'Verified Clean' },
  opt_resolved: { bn: 'পর্যালোচনা সম্পন্ন / নিষ্পত্তিকৃত (Review Resolved)', en: 'Review Resolved' },
  opt_processing: { bn: 'বিশ্লেষণ চলমান (Processing)', en: 'Processing' },
  save_decision_btn: { bn: 'সিদ্ধান্ত সংরক্ষণ করুন', en: 'Submit Decision' },
  saving_decision: { bn: 'সংরক্ষণ হচ্ছে...', en: 'Saving...' },
  decision_saved_msg: { bn: 'পর্যালোচকের সিদ্ধান্ত সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে।', en: 'Reviewer decision recorded and audit log updated successfully.' },

  // Ownership Graph Visualizer
  graph_card_title: { bn: 'মালিকানা ও লেনদেন সংযোগ গ্রাফ (Ownership & Transaction Graph)', en: 'Ownership & Transaction Relationship Graph' },
  graph_card_sub: { bn: '{nodes}টি নোড • {edges}টি সংযোগ • {conflicts}টি দ্বন্দ্ব শনাক্ত', en: '{nodes} nodes • {edges} relationships • {conflicts} conflicts detected' },
  btn_graph: { bn: 'গ্রাফ', en: 'Graph' },
  btn_timeline: { bn: 'টাইমলাইন', en: 'Timeline' },
  btn_table: { bn: 'তালিকা', en: 'Table' },
  graph_conflict_banner: { bn: 'একই দাগে পরস্পরবিরোধী হস্তান্তরের পথ শনাক্ত হয়েছে (P001 / G001)', en: 'Conflicting transfer paths detected on the same plot (P001 / G001)' },
  timeline_header_title: { bn: 'কালানুক্রমিক জমি হস্তান্তর ও বিরোধ টাইমলাইন (Chronological Timeline)', en: 'Chronological Land Transfer & Conflict Timeline' },
  timeline_header_sub: { bn: 'নথির সম্পাদন তারিখ ও হস্তান্তরের পর্যায়ক্রম অনুসারে সাজানো হয়েছে', en: 'Arranged in chronological order of deed execution and registration dates' },
  timeline_event_count: { bn: '{count}টি প্রধান ইভেন্ট', en: '{count} key events' },
  year_prefix: { bn: 'সন: {year}', en: 'Year: {year}' },
  double_sale_badge: { bn: 'সম্ভাব্য দ্বৈত বিক্রির দ্বন্দ্ব (P001)', en: 'Potential Double-Selling Conflict (P001)' },
  legit_chain_badge: { bn: 'বৈধ হস্তান্তর শৃঙ্খল', en: 'Valid Chain Transfer' },
  conflict_reason_lead: { bn: 'দ্বন্দ্বের কারণ ও ট্রেসেবিলিটি:', en: 'Conflict Traceability & Reason:' },
  connected_nodes_lead: { bn: 'সংযুক্ত নোডসমূহ:', en: 'Connected Entities:' },
  tbl_source: { bn: 'উৎস নোড (Source)', en: 'Source Entity' },
  tbl_relation: { bn: 'সম্পর্ক (Relation)', en: 'Relationship' },
  tbl_target: { bn: 'লক্ষ্য নোড (Target)', en: 'Target Entity' },
  tbl_status: { bn: 'স্থিতি ও ঝুঁকি (Status)', en: 'Integrity Status' },
  tbl_conflict: { bn: 'দ্বৈত বিক্রির বিরোধ', en: 'Double-selling conflict' },
  tbl_consistent: { bn: 'সামঞ্জস্যপূর্ণ', en: 'Consistent' },
  node_detail_title: { bn: 'নোড বিবরণ', en: 'Node Details' },
  edge_detail_title: { bn: 'হস্তান্তর বিবরণ', en: 'Transfer Details' },
  id_label: { bn: 'আইডি:', en: 'ID:' },
  relation_label: { bn: 'সম্পর্ক:', en: 'Relation:' },

  // Document Viewer Component
  doc_pages_label: { bn: '{type} • {count} পৃষ্ঠা', en: '{type} • {count} pages' },
  hash_ready: { bn: 'ক্রিপ্টোগ্রাফিক হ্যাশ প্রস্তুত', en: 'Cryptographic Hash Ready' },
  hash_enrolled: { bn: 'এনরোল্ড (SHA-256)', en: 'Enrolled (SHA-256)' },
  doc_alt_scan: { bn: 'দলিল স্ক্যান অনুলিপি', en: 'Deed Scan Copy' },
  page_counter: { bn: 'পৃষ্ঠা {current} / {total}', en: 'Page {current} of {total}' },
  scan_viewer_btn: { bn: 'স্ক্যান ভিউয়ার', en: 'Scan Viewer' },
  extracted_fields_header: { bn: 'স্বয়ংক্রিয়ভাবে আহরিত ক্ষেত্র (Extracted Fields)', en: 'Extracted Structured Fields' },
  extracted_fields_count: { bn: '{count}টি তথ্য সনাক্ত', en: '{count} fields extracted' },
  field_save_success: { bn: 'তথ্য সফলভাবে সংশোধন করা হয়েছে এবং অডিট লগ লিপিবদ্ধ হয়েছে।', en: 'Field corrected successfully and recorded in audit log.' },
  ocr_confidence_badge: { bn: 'OCR: {pct}%', en: 'OCR: {pct}%' },
  correct_btn: { bn: 'সংশোধন', en: 'Correct' },
  save_btn: { bn: 'সংরক্ষণ', en: 'Save' },
  saving_btn: { bn: 'সংরক্ষণ...', en: 'Saving...' },
  cancel_btn: { bn: 'বাতিল', en: 'Cancel' },
  original_val_label: { bn: 'মূল ওসিআর:', en: 'Original OCR:' },
  corrected_badge: { bn: 'সংশোধিত', en: 'Corrected' },

  // Document Ingestion Form (/documents/new)
  new_doc_badge: { bn: 'নতুন যাচাই কেস সৃষ্টি', en: 'New Investigation Intake' },
  new_doc_title: { bn: 'ভূমি দলিল ও রেকর্ড আপলোড ওয়ার্কফ্লো', en: 'Document Ingestion & Verification Workflow' },
  new_doc_subtitle: { bn: 'প্রস্তাবিত দলিল, পূর্ববর্তী বায়া দলিল ও খতিয়ান আপলোড করুন। সিস্টেম স্বয়ংক্রিয়ভাবে হ্যাশ নির্ণয় ও ফিল্ড এক্সট্রাকশন সম্পন্ন করবে।', en: 'Upload proposed deeds, chain baya deeds, and khatian records. The system computes SHA-256 fingerprints and extracts structured fields.' },
  step1_title: { bn: '১. কেস ও দাগের বিবরণ', en: '1. Case & Parcel Specifications' },
  field_case_title: { bn: 'কেসের শিরোনাম (Title) *', en: 'Case Title *' },
  placeholder_case_title: { bn: 'যেমন: মৌজা কাউন্দিয়া আরএস দাগ ৪১২ দলিল যাচাই', en: 'e.g. Mouza Kaundia RS Dag 412 Deed Verification' },
  field_mouza: { bn: 'মৌজা (Mouza) *', en: 'Mouza Name *' },
  field_dag: { bn: 'দাগ নম্বর (Dag No.) *', en: 'Plot / Dag Number *' },
  field_survey: { bn: 'জরিপের ধরন (Survey Type) *', en: 'Cadastral Survey Type *' },
  field_area: { bn: 'জমির পরিমাণ (শতাংশে) *', en: 'Recorded Area (Decimals) *' },
  field_desc: { bn: 'অতিরিক্ত পর্যবেক্ষণ বা অনুসন্ধান নোট', en: 'Additional Notes or Reviewer Observations' },
  placeholder_desc: { bn: 'প্রাসঙ্গিক পূর্বাপর ইতিহাস, ক্রেতা-বিক্রেতার তথ্য বা অভিযোগের বিবরণ...', en: 'Relevant transaction background, party details, or dispute context...' },
  step2_title: { bn: '২. সংশ্লিষ্ট ভূমি দলিল ও রেকর্ড আপলোড', en: '2. Upload Deeds & Revenue Records' },
  step2_help: { bn: 'দ্বৈত বিক্রি ও মালিকানা চেইনের শূন্যতা যাচাই করতে মূল সাফ-কবলা দলিল, বায়া দলিল ও আরএস খতিয়ান সংযুক্ত করুন।', en: 'To verify double-selling and chain continuity, attach the proposed deed, baya deeds, and RS khatian.' },
  select_doc_type_label: { bn: 'নথির ধরন নির্বাচন করুন:', en: 'Select Document Type:' },
  add_doc_btn: { bn: 'নথি তালিকায় যোগ করুন', en: 'Add Document to Intake' },
  drag_drop_title: { bn: 'দলিল ফাইল টেনে এনে এখানে ড্রপ করুন অথবা নির্বাচন করুন', en: 'Drag and drop deed files here or click to browse' },
  drag_drop_sub: { bn: 'সমর্থিত ফরম্যাট: PDF, JPG, PNG (সর্বোচ্চ ২৫ মেগাবাইট)', en: 'Supported formats: PDF, JPG, PNG (Max 25 MB)' },
  attached_docs_heading: { bn: 'সংযুক্ত নথিপত্র ({count}টি ফাইল):', en: 'Attached Documents ({count} files):' },
  submit_investigation_btn: { bn: 'যাচাই ও অসঙ্গতি বিশ্লেষণ শুরু করুন', en: 'Initiate Ingestion & Run Rule Engine' },
  submitting_investigation: { bn: 'বিশ্লেষণ চলছে...', en: 'Analyzing...' },
  title_required_error: { bn: 'অনুগ্রহ করে কেসের একটি শিরোনাম প্রদান করুন।', en: 'Please provide a case title.' },
  docs_required_error: { bn: 'কমপক্ষে একটি ভূমি দলিল আপলোড করা আবশ্যক।', en: 'At least one land document must be uploaded.' },

  // Alerts & Review Queue Page (/review-queue)
  alerts_title: { bn: 'সতর্ক সংকেত ও পর্যালোচক কিউ', en: 'Alerts & Human Review Queue' },
  alerts_subtitle: { bn: 'মানবীয় পর্যালোচকের জন্য অপেক্ষমান অসঙ্গতি সংকেত এবং আনুষ্ঠানিক সিদ্ধান্তের কর্মক্ষেত্র।', en: 'Evidentiary conflict alerts awaiting human assessment and formal disposition.' },
  col_rule_code: { bn: 'রুল কোড', en: 'Rule Code' },
  col_alert_finding: { bn: 'শনাক্তকৃত অসঙ্গতি', en: 'Detected Conflict' },
  col_current_status: { bn: 'বর্তমান স্ট্যাটাস', en: 'Review Status' },
  col_decision_action: { bn: 'পর্যালোচক সিদ্ধান্ত', en: 'Disposition Action' },
  give_decision_btn: { bn: 'সিদ্ধান্ত দিন', en: 'Record Decision' },
  modal_decision_title: { bn: 'পর্যালোচক সিদ্ধান্ত প্রদান ও কেস নিষ্পত্তি', en: 'Record Reviewer Disposition' },
  decision_type_label: { bn: 'সিদ্ধান্তের ধরন (Disposition Type) *', en: 'Disposition Type *' },
  decision_notes_label: { bn: 'সিদ্ধান্তের যুক্তি ও আইনি মন্তব্য (Reviewer Notes) *', en: 'Reviewer Notes & Justification *' },
  save_disposition_btn: { bn: 'সিদ্ধান্ত সংরক্ষণ করুন', en: 'Submit Disposition' },
  submitting_disposition: { bn: 'সংরক্ষণ হচ্ছে...', en: 'Submitting...' },
  disposition_success_msg: { bn: 'পর্যালোচকের সিদ্ধান্ত সফলভাবে সংরক্ষিত এবং অডিট লগ লিপিবদ্ধ হয়েছে।', en: 'Reviewer disposition recorded and audit log updated successfully.' },

  // Reports Page (/reports)
  reports_page_title: { bn: 'ভূমি দলিল ও স্বত্ব তদন্ত প্রতিবেদন', en: 'Investigation Report' },
  reports_select_case: { bn: 'কেস পরিবর্তন:', en: 'Select Case:' },
  report_header_platform: { bn: 'UNLEFT LandGuard — আনলেফট ল্যান্ডগার্ড', en: 'UNLEFT LandGuard' },
  report_header_sub: { bn: 'এআই-সহায়তাকৃত ভূমি দলিল ও স্বত্ব যাচাইকরণ প্রযুক্তি প্রতিবেদন (P3 Track)', en: 'AI-Assisted Land Fraud & Double-Selling Detection Report (P3 Track)' },
  report_header_dev: { bn: 'ডেভেলপমেন্ট: UNLEFT • LandTech Innovation Hackathon 2026', en: 'Developed by UNLEFT • LandTech Innovation Hackathon 2026' },
  report_id_label: { bn: 'রিপোর্ট নং:', en: 'Report ID:' },
  report_date_label: { bn: 'তারিখ:', en: 'Date:' },
  report_status_label: { bn: 'স্ট্যাটাস:', en: 'Status:' },
  report_sec1_title: { bn: '১. কেস ও দাগের বিবরণ (Case Details)', en: '1. Case & Parcel Specifications' },
  report_case_ref: { bn: 'কেস রেফারেন্স', en: 'Case Reference' },
  report_mouza: { bn: 'মৌজা ও উপজেলা', en: 'Mouza & Upazila' },
  report_dag_survey: { bn: 'দাগ ও জরিপ', en: 'Plot (Dag) & Survey' },
  report_area: { bn: 'রেকর্ডকৃত জমির পরিমাণ', en: 'Recorded Area' },
  report_sec2_title: { bn: '২. পরীক্ষিত নথিপত্র ও ডিজিটাল ফিঙ্গারপ্রিন্ট', en: '2. Examined Documents & Cryptographic Fingerprints' },
  report_col_doc_name: { bn: 'নথির শিরোনাম', en: 'Document Title' },
  report_col_doc_type: { bn: 'নথির ধরন', en: 'Document Type' },
  report_col_hash: { bn: 'SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ', en: 'SHA-256 Cryptographic Hash' },
  report_col_status: { bn: 'স্থিতি', en: 'Status' },
  report_sec3_title: { bn: '৩. ডিটারমিনিস্টিক রুল ইঞ্জিন বিশ্লেষণ ও ফলাফল', en: '3. Deterministic Fraud-Detection Rule Findings' },
  report_sec4_title: { bn: '৪. অডিট ট্রেইল ও পর্যালোচক ইতিহাস', en: '4. Chain of Custody & Review History' },
  report_col_action: { bn: 'পদক্ষেপ', en: 'Action' },
  report_col_user: { bn: 'ব্যবহারকারী', en: 'Reviewer' },
  report_col_time: { bn: 'সময়', en: 'Timestamp' },
  report_col_details: { bn: 'বিবরণ', en: 'Details' },
  report_lang_switcher: { bn: 'প্রতিবেদনের ভাষা:', en: 'Report Language:' },

  // Methodology Page (/methodology)
  methodology_badge: { bn: 'প্রযুক্তিগত কার্যপ্রণালী ও রুল ইঞ্জিন', en: 'Technical Architecture & Rule Engine' },
  methodology_title: { bn: 'যাচাই পদ্ধতি ও সীমাবদ্ধতা', en: 'Methodology & Limitations' },
  methodology_subtitle: { bn: 'আনলেফট ল্যান্ডগার্ডের ওসিআর, ফিল্ড নরমালাইজেশন, ডিটারমিনিস্টিক রুল ইঞ্জিন ও গ্রাফ বিশ্লেষণের বৈজ্ঞানিক ব্যাখ্যা।', en: 'Scientific architecture of UNLEFT LandGuard: OCR, field normalization, 12 deterministic rules, and graph reasoning.' },
  distinction_header: { bn: 'প্রযুক্তিগত দাবির সুনির্দিষ্ট পার্থক্য (Critical Distinctions)', en: 'Critical Technical Distinctions' },
  dist_hash_title: { bn: 'ক্রিপ্টোগ্রাফিক হ্যাশ (SHA-256)', en: 'Cryptographic Hash (SHA-256)' },
  dist_hash_desc: { bn: 'ডিজিটাল ফাইলটি হুবহু একই বাইটের কিনা তা প্রমাণ করে। এটি দলিলের অন্তর্নিহিত আইনি বৈধতা বা স্বত্ব প্রমাণ করে না।', en: 'Proves byte-level digital identity of an uploaded file. It does NOT prove legal validity or authentic land title.' },
  dist_rules_title: { bn: 'ডিটারমিনিস্টিক রুলস', en: 'Deterministic Rule Engine' },
  dist_rules_desc: { bn: '১২টি স্পষ্ট নিয়ম দিয়ে রেকর্ডসমূহের মধ্যকার গাণিতিক ও তথ্যের অমিল শনাক্ত করে। ফলাফল ১০০% টেস্টেবল ও পুনরাবৃত্তিযোগ্য।', en: 'Detects transactional inconsistencies through 12 deterministic rules. Results are 100% reproducible and testable.' },
  dist_human_title: { bn: 'মানবীয় পর্যালোচনা', en: 'Human Review Principle' },
  dist_human_desc: { bn: 'সিস্টেম কেবল প্রমাণ নির্দেশক ও সংকেত প্রদানকারী। কোনো অবস্থাতেই সিস্টেম স্বয়ংক্রিয়ভাবে "জালিয়াত" ঘোষণা করে না।', en: 'The system flags evidentiary conflicts. Final legal determinations rest exclusively with authorized human officials.' },
  pipe_sec_title: { bn: '১. চার স্তরের বিশ্লেষণ আর্কিটেকচার', en: '1. Four-Stage Verification Pipeline' },
  pipe_step1_title: { bn: 'ধাপ ১: ক্রিপ্টোগ্রাফিক ফিঙ্গারপ্রিন্ট (P2)', en: 'Stage 1: Cryptographic Fingerprinting (P2)' },
  pipe_step1_desc: { bn: 'আপলোডকৃত ফাইলের SHA-256 হ্যাশ গণনা করে পূর্বে সংরক্ষিত কোনো নমুনার সাথে হুবহু মিল রয়েছে কিনা তা পরীক্ষা করা হয়।', en: 'Computes SHA-256 byte hashes upon ingestion to verify exact file duplication against registered archives.' },
  pipe_step2_title: { bn: 'ধাপ ২: ওসিআর ও স্ট্রাকচার্ড এক্সট্রাকশন', en: 'Stage 2: OCR & Structured Field Extraction' },
  pipe_step2_desc: { bn: 'দলিলের স্ক্যান কপি থেকে বাংলা সংখ্যা, দাগ, খতিয়ান, মৌজা, ক্রেতা-বিক্রেতার নাম বাউন্ডিং বক্স ও আস্থাসীমাসহ আলাদা করা হয়।', en: 'Extracts Bengali numbers, plot dag, khatian, mouza, buyer/seller names with bounding boxes and confidence scores.' },
  pipe_step3_title: { bn: 'ধাপ ৩: ডিটারমিনিস্টিক রুল ইঞ্জিন (P3)', en: 'Stage 3: Deterministic Rule Engine (P3)' },
  pipe_step3_desc: { bn: 'জেনারেটিভ এআই-এর পরিবর্তে ১২টি সুনির্দিষ্ট যাচাই নিয়মের মাধ্যমে তথ্যের সুস্পষ্ট বৈপরীত্য ও দ্বৈত বিক্রি শনাক্তকরণ।', en: 'Executes 12 deterministic verification rules to identify double-selling, broken chains, and record contradictions.' },
  pipe_step4_title: { bn: 'ধাপ ৪: নেটওয়ার্কএক্স মালিকানা গ্রাফ', en: 'Stage 4: NetworkX Ownership Graph' },
  pipe_step4_desc: { bn: 'দাগ, ব্যক্তি ও দলিলের মধ্যকার হস্তান্তর সম্পর্ক দিয়ে গ্রাফ তৈরি করে সাইকেল ও সমান্তরাল প্রতিদ্বন্দ্বী পথ খুঁজে বের করা।', en: 'Constructs relational entity graphs to detect cycles, competing transfer paths, and disjointed ownership chains.' },
  rules_sec_title: { bn: '২. ডিটারমিনিস্টিক রুল ক্যাটালগ (Rules Inventory)', en: '2. Deterministic Fraud-Detection Rules Catalogue' },
  tbl_col_code: { bn: 'কোড', en: 'Code' },
  tbl_col_name: { bn: 'নিয়মের শিরোনাম', en: 'Rule Title' },
  tbl_col_family: { bn: 'শ্রেণি', en: 'Family' },
  tbl_col_severity: { bn: 'তীব্রতা', en: 'Severity' },
  safeguards_sec_title: { bn: '৩. সীমাবদ্ধতা ও দায়িত্বশীল এআই গাইডলাইন', en: '3. Technical Limitations & Responsible AI Guidelines' },
  sg_point1: { bn: 'অনুপস্থিতি মানেই জালিয়াতি নয়: কোনো বায়া দলিল আপলোড না থাকলে সিস্টেম "নথি অনুপস্থিত" নির্দেশ করবে, তবে স্বত্ব চূড়ান্তভাবে অস্বীকার করবে না।', en: 'Absence of proof is not proof of fraud: An unattached baya deed triggers an evidentiary gap alert; it does not declare the title void.' },
  sg_point2: { bn: 'নামের বানানে পার্থক্য: নামের সাধারণ বানান বিভ্রাট বা টাইপোকে জালিয়াতি বলা হয় না; নরমালাইজেশন সাপেক্ষে পর্যালোচকের মতামত চাওয়া হয়।', en: 'Name variations and clerical typos: Phonetic spelling variations in Bengali names are normalized rather than treated as forgery.' },
  sg_point3: { bn: 'চূড়ান্ত কর্তৃত্ব মানব পর্যালোচকের: এআই কেবল সম্ভাব্য অসংগতির সপক্ষে দলিলের পৃষ্ঠা ও সংখ্যা নির্দেশ করে; বৈধতার সিদ্ধান্ত সর্বদা অনুমোদিত মানুষের।', en: 'Exclusive human adjudication: AI flags traceable contradictions; official clearance remains with authorized sub-registrars and judges.' },

  // Risk Levels
  risk_low: { bn: 'স্বাভাবিক (Low)', en: 'Low Risk' },
  risk_review: { bn: 'পর্যালোচনা স্তর (Review)', en: 'Needs Review' },
  risk_high: { bn: 'উচ্চ ঝুঁকি (High)', en: 'High Risk' },
  risk_critical: { bn: 'গুরুতর সংকেত (Critical)', en: 'Critical Conflict' },

  // Statuses
  status_pending: { bn: 'অপেক্ষমান (Pending)', en: 'Pending Ingestion' },
  status_processing: { bn: 'বিশ্লেষণ চলছে (Processing)', en: 'Processing' },
  status_flagged_review: { bn: 'পর্যালোচনা প্রয়োজন (Needs Review)', en: 'Needs Review' },
  status_verified_clean: { bn: 'অসঙ্গতিহীন (Verified Clean)', en: 'Verified Consistent' },
  status_resolved: { bn: 'নিষ্পত্তিকৃত (Resolved)', en: 'Review Resolved' },

  // Document Types
  doctype_deed: { bn: 'মূল সাফ-কবলা দলিল (Deed)', en: 'Original Title Deed' },
  doctype_baya_deed: { bn: 'বায়া দলিল / পূর্ববর্তী দলিল (Baya Deed)', en: 'Chain / Baya Deed' },
  doctype_khatian: { bn: 'খতিয়ান / সিএস-এসএ-আরএস-বিএস (Khatian)', en: 'Revenue Survey Khatian' },
  doctype_mutation: { bn: 'নামজারি খতিয়ান ও ডিসিআর (Mutation)', en: 'Mutation & DCR Record' },
  doctype_mouza_map: { bn: 'মৌজা নকশা / ক্যাডাস্ট্রাল ম্যাপ (Mouza Map)', en: 'Cadastral Mouza Map' },
  doctype_tax_receipt: { bn: 'ভূমি উন্নয়ন কর দাখিলা (Dakhila)', en: 'Land Tax Receipt (Dakhila)' },

  // Additional Landing Page Keys
  hero_badge: { bn: 'বাংলাদেশ ভূমি সেবা ও দ্বৈত বিক্রি শনাক্তকরণ প্ল্যাটফর্ম (P3 / P2)', en: 'Bangladesh Multimodal Land-Fraud & Double-Selling Detection (P3 / P2)' },
  trust_p1_label: { bn: 'প্রাথমিক ট্র্যাক', en: 'Primary Focus' },
  trust_p1_val: { bn: 'P3 দ্বৈত বিক্রি রোধ', en: 'P3 Double-Selling Prevention' },
  trust_p2_label: { bn: 'সহায়ক যাচাই', en: 'Supporting Verification' },
  trust_p2_val: { bn: 'P2 দলিল ও বায়া চেইন', en: 'P2 Deed & Baya Chain' },
  trust_p3_label: { bn: 'আইনি নিশ্চয়তা', en: 'Legal Integrity' },
  trust_p3_val: { bn: 'পর্যালোচক সিদ্ধান্ত', en: 'Reviewer Adjudication' },
  hero_img_alt: { bn: 'বাংলাদেশের গ্রামীণ কৃষি জমি ও ক্যাডাস্ট্রাল মৌজা জরিপ', en: 'Cadastral mouza survey in Bangladesh' },
  hero_img_caption: { bn: 'সাভার ও ধামরাই অঞ্চলের ক্যাডাস্ট্রাল মৌজা নকশা ও প্লট বাউন্ডারি সিমুলেশন', en: 'Cadastral mouza map and plot boundary simulation for Savar & Dhamrai' },
  prob_badge: { bn: 'সমস্যার মূল প্রেক্ষাপট', en: 'Core Context & Problem' },
  prob_title: { bn: 'কেন একই জমি বারবার বিক্রি ও জাল দলিলের সৃষ্টি হয়?', en: 'Why Does Duplicate Selling and Document Fraud Occur?' },
  prob_subtitle: { bn: 'বাংলাদেশের ভূমি রেকর্ড ব্যবস্থার ঐতিহাসিক বিকেন্দ্রীকরণ ও বিচ্ছিন্ন নথিপত্রের কারণে একাধিক জটিলতার সৃষ্টি হয় যা স্বত্ব ক্রেতা ও ব্যাংক কর্মকর্তাদের জন্য ঝুঁকিপূর্ণ।', en: 'Historical decentralization and fragmented revenue records create critical vulnerabilities for land buyers, banks, and title investigators.' },
  prob_card1_title: { bn: 'দ্বৈত বিক্রি (Duplicate Selling)', en: 'Duplicate Selling' },
  prob_card1_desc: { bn: 'একজন অসৎ ব্যক্তি একই দাগের জমি একজনের নিকট বিক্রির পর নামজারি সম্পূর্ণ হওয়ার পূর্বেই অন্য সাব-রেজিস্ট্রি অফিসে পুনরায় বিক্রয় দলিল সম্পাদন করে।', en: 'A fraudulent seller executes a subsequent deed on the same parcel at another sub-registry before the first buyer completes mutation.' },
  prob_card2_title: { bn: 'বায়া দলিলের ধারাবাহিকতা বিচ্ছিন্ন', en: 'Broken Chain of Title' },
  prob_card2_desc: { bn: 'খতিয়ানভুক্ত মূল প্রজার নিকট থেকে বর্তমান বিক্রেতা কীভাবে জমিটি ক্রয় বা ওয়ারিশসূত্রে পেলেন তার প্রয়োজনীয় বায়া দলিল ও রেকর্ড চেইন অনুপস্থিত থাকে।', en: 'Missing chain (baya) deeds linking the current seller back to the original recorded khatian proprietor.' },
  prob_card3_title: { bn: 'দলিল বনাম খতিয়ান গরমিল', en: 'Deed vs Khatian Discrepancies' },
  prob_card3_desc: { bn: 'দলিলে উল্লেখিত মোট জমির পরিমাণ অপেক্ষা খতিয়ানের রেকর্ডকৃত হিস্যা কম থাকে, অথবা মালিকের নাম ও সিএস/এসএ/আরএস জরিপ দাগে বৈসাদৃশ্য দেখা দেয়।', en: 'Deed area exceeds recorded khatian share, or discrepancies appear between plot numbers and survey records.' },
  flow_badge: { bn: 'কার্যপদ্ধতি', en: 'Workflow' },
  flow_title: { bn: 'আনভূমি ডিটেক্টর কীভাবে দলিল যাচাই করে?', en: 'How Does UNBUmi Detector Verify Records?' },
  flow_subtitle: { bn: 'একটি সুশৃঙ্খল চার-ধাপের প্রক্রিয়া যা ওসিআর থেকে শুরু করে মানবীয় পর্যালোচকের চূড়ান্ত অনুমোদন পর্যন্ত বিস্তৃত।', en: 'A disciplined four-stage pipeline spanning cryptographic ingestion, OCR, deterministic rules, and human adjudication.' },
  flow_s1_step: { bn: '০১', en: '01' },
  flow_s1_title: { bn: 'নথি আপলোড ও ফিঙ্গারপ্রিন্ট', en: 'Ingestion & Cryptographic Fingerprinting' },
  flow_s1_desc: { bn: 'মূল দলিল, বায়া দলিল, আরএস খতিয়ান ও নামজারি আপলোডের সাথে সাথে SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ নিবন্ধিত হয়।', en: 'Computes SHA-256 byte fingerprints upon upload to establish digital integrity and detect duplicate files.' },
  flow_s2_step: { bn: '০২', en: '02' },
  flow_s2_title: { bn: 'ওসিআর ও তথ্য নিষ্কাশন', en: 'OCR & Field Extraction' },
  flow_s2_desc: { bn: 'বাংলা ও ইংরেজি দলিলের দাগ, খতিয়ান, নাম, তারিখ ও জমির পরিমাণ আস্থাসীমাসহ এক্সট্রাক্ট করা হয়।', en: 'Extracts plot numbers, khatian IDs, party names, dates, and recorded area with confidence metrics.' },
  flow_s3_step: { bn: '০৩', en: '03' },
  flow_s3_title: { bn: 'ক্রস-ডকুমেন্ট ও রুল ইঞ্জিন', en: 'Cross-Document Rule Checks' },
  flow_s3_desc: { bn: '১২টি সুনির্দিষ্ট ডিটারমিনিস্টিক রুলের মাধ্যমে দ্বৈত বিক্রি, অতিরিক্ত জমি দাবি ও বায়া চেইন বিশ্লেষণ।', en: 'Applies 12 deterministic rules to detect double-selling, area over-transfers, and chain gaps.' },
  flow_s4_step: { bn: '০৪', en: '04' },
  flow_s4_title: { bn: 'মালিকানা গ্রাফ ও মানবীয় পর্যালোচনা', en: 'Graph & Human Decision' },
  flow_s4_desc: { bn: 'পারস্পরিক সংযোগের গ্রাফ ও পৃষ্ঠার প্রমাণ রেফারেন্সসহ পর্যালোচকের চূড়ান্ত সিদ্ধান্তের জন্য পেশ করা হয়।', en: 'Renders relational transfer graphs and evidentiary citations for final human adjudication.' },
  demo_badge: { bn: 'লাইভ ডেমো প্রদর্শন', en: 'Live Demo Showcase' },
  demo_title: { bn: '৮টি প্রস্তুতকৃত সিন্থেটিক কেস স্টাডি', en: '8 Synthetic Case Studies' },
  demo_subtitle: { bn: 'স্বচ্ছ পরীক্ষার জন্য প্রস্তুত বাস্তবসম্মত বৈধ ও সন্দেহজনক পরিস্থিতি', en: 'Realistic benign and conflict scenarios curated for transparent verification' },
  demo_view_all: { bn: 'সকল কেস দেখুন', en: 'View All Cases' },
  demo_view_results: { bn: 'বিশ্লেষণ ফলাফল দেখুন', en: 'Inspect Analysis Results' },
  faq_badge: { bn: 'সাধারণ জিজ্ঞাসা', en: 'FAQ' },
  faq_title: { bn: 'প্রায়শই জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)', en: 'Frequently Asked Questions' },
  faq1_q: { bn: 'আনভূমি ডিটেক্টর কি সরকারি রেজিস্ট্রি প্রতিস্থাপন করে?', en: 'Does UNBUmi Detector replace the official registry?' },
  faq1_a: { bn: 'না। এটি একটি এআই-সহায়তাকৃত পর্যালোচনামূলক সিদ্ধান্ত সমর্থন সফটওয়্যার। এটি সাব-রেজিস্ট্রার, সহকারী কমিশনার (ভূমি) বা আদালতের বিচারিক এখতিয়ারকে প্রতিস্থাপন করে না।', en: 'No. It is an AI-assisted decision-support platform designed to aid reviewers; it does not replace the statutory authority of sub-registrars, AC Land officers, or the judiciary.' },
  faq2_q: { bn: 'দ্বৈত বিক্রি কীভাবে শনাক্ত করা হয়?', en: 'How is duplicate selling detected?' },
  faq2_a: { bn: 'সিস্টেমে সংরক্ষিত পূর্ববর্তী নিবন্ধিত দলিলের দাগ নম্বর, মৌজা ও চৌহদ্দির সাথে নতুন প্রস্তাবিত দলিলের তথ্য মিলিয়ে দেখা হয়। কোনো দাগে পূর্বে সক্রিয় হস্তান্তর থাকলে সিস্টেমে দ্বৈত বিক্রির অ্যালার্ট ও গ্রাফ তৈরি হয়।', en: 'The system cross-checks parcel plot numbers, mouza records, and boundaries against prior registered deeds to flag conflicting ownership transfers.' },
  faq3_q: { bn: 'ডেমোতে ব্যবহৃত নথিপত্র কি বাস্তব মানুষের?', en: 'Are demo documents from real individuals?' },
  faq3_a: { bn: 'একেবারেই না। হ্যাকাথনের নীতিমালা ও ব্যক্তিগত গোপনীয়তা বজায় রাখতে সকল প্রদর্শনী কেস, নাম, ঠিকানা ও দাগ কাল্পনিক ও কৃত্রিমভাবে তৈরি।', en: 'Strictly no. To safeguard privacy and adhere to hackathon guidelines, all demonstration cases, names, parcels, and records are synthetic.' },
  faq4_q: { bn: 'ফাইলের হ্যাশ (SHA-256) মিললেই কি দলিল বৈধ প্রমাণিত হয়?', en: 'Does an exact SHA-256 match prove title validity?' },
  faq4_a: { bn: 'না। হ্যাশ প্রমাণ করে যে ফাইলটি হুবহু একই ডিজিটাল কপি কিনা। আইনি স্বত্বের বৈধতা নির্ধারণে নথির ভেতরের তথ্য ও রাজস্ব রেকর্ডের ক্রস-চেক অপরিহার্য।', en: 'No. A hash only proves byte-level file identity. Legal validity requires cross-checking the internal transaction chain against land survey records.' },
  responsible_title: { bn: 'দায়িত্বশীল এআই ও স্বচ্ছ যাচাইকরণ প্রতিজ্ঞা', en: 'Responsible AI & Transparent Verification' },
  responsible_desc: { bn: 'সিস্টেমের কোনো অ্যালার্ট কাউকে সরাসরি প্রতারক ঘোষণা করে না; এটি কেবল পর্যালোচকের নিকট অসঙ্গতির উৎস ও প্রাসঙ্গিক পৃষ্ঠা প্রদর্শন করে সিদ্ধান্ত গ্রহণে সহায়তা করে।', en: 'System alerts never proclaim fraud; they surface traceable evidentiary discrepancies to empower authorized human reviewers.' },
  responsible_btn: { bn: 'পদ্ধতি ও সীমাবদ্ধতা পড়ুন', en: 'Read Methodology & Limitations' },

  // Document Viewer Extra
  coord_tracking: { bn: 'উৎস স্থানাঙ্ক ও বাউন্ডিং বক্স ট্র্যাকিং সক্রিয়', en: 'Source coordinate & bounding box tracking active' },
  traceable_evidence: { bn: '✓ প্রমাণ যাচাইযোগ্য', en: '✓ Traceable Evidence' },
  edit_btn_title: { bn: 'সংশোধন করুন', en: 'Correct Value' },

  // Document Ingestion Extra
  privacy_title: { bn: 'ডেটা পলিসি নিশ্চিতকরণ:', en: 'Data Policy Confirmation:' },
  privacy_desc: { bn: 'এই যাচাই প্রক্রিয়ায় ব্যবহৃত তথ্য এনক্রিপ্ট করে প্রসেস করা হবে। হ্যাকাতন প্রদর্শনীতে কেবল অনুমোদিত সিন্থেটিক তথ্য ব্যবহার করা হচ্ছে এবং কোনো সরকারি সার্ভারে অযাচিত রিকোয়েস্ট পাঠানো হয় না।', en: 'Uploaded documents are encrypted and hashed. The demonstration operates exclusively on synthetic data without unprompted queries to government registries.' },
  doc_pack_title: { bn: '২. দলিলের কপি সংযুক্তকরণ (Multi-Document Pack)', en: '2. Multi-Document Ingestion Pack' },
  doc_pack_sub: { bn: 'সমর্থিত: PDF, JPG, PNG (সর্বোচ্চ ২৫MB)', en: 'Supported: PDF, JPG, PNG (Max 25 MB)' },
  drop_title: { bn: 'দলিলের স্ক্যান কপি টেনে এখানে আনুন অথবা ফাইল সিলেক্ট করুন', en: 'Drag and drop deed scans here or select files' },
  drop_desc: { bn: 'প্রতিটি আপলোডের জন্য SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ তৈরি করা হয়।', en: 'A cryptographic SHA-256 hash is computed for every uploaded file.' },
  add_doc: { bn: 'নথি যোগ করুন', en: 'Add Document' },
  attached_docs: { bn: 'সংযুক্ত নথিপত্র ({count}টি)', en: 'Attached Documents ({count})' },
  create_and_verify_btn: { bn: 'কেস সৃষ্টি ও যাচাই শুরু করুন', en: 'Create Case & Run Checks' },
  survey_rs: { bn: 'আরএস (RS Survey)', en: 'RS Survey' },
  survey_bs: { bn: 'বিএস (BS Survey)', en: 'BS Survey' },
  survey_sa: { bn: 'এসএ (SA Survey)', en: 'SA Survey' },
  survey_cs: { bn: 'সিএস (CS Survey)', en: 'CS Survey' },
  survey_city: { bn: 'সিটি জরিপ (City Survey)', en: 'City Survey' },

  // Review Queue Extra
  queue_title: { bn: 'পর্যালোচক ওয়ার্কস্পেস ও কিউ', en: 'Reviewer Workspace & Queue' },
  queue_subtitle: { bn: 'মানবীয় পর্যালোচকের জন্য অপেক্ষমান অসঙ্গতি সংকেত এবং আনুষ্ঠানিক সিদ্ধান্তের কর্মক্ষেত্র।', en: 'Operational workspace for human reviewers adjudicating flagged evidentiary conflicts.' },
  queue_loading: { bn: 'অসঙ্গতি কিউ লোড হচ্ছে...', en: 'Loading review queue...' },
  col_case_reference: { bn: 'কেস রেফারেন্স', en: 'Case Reference' },
  col_detected_inconsistency: { bn: 'শনাক্তকৃত অসঙ্গতি', en: 'Detected Conflict' },
  col_risk_level: { bn: 'ঝুঁকি স্তর', en: 'Risk Level' },
  col_current_status_label: { bn: 'বর্তমান স্ট্যাটাস', en: 'Current Status' },
  col_reviewer_action: { bn: 'পর্যালোচক সিদ্ধান্ত', en: 'Reviewer Action' },
  view_case_tooltip: { bn: 'কেস ও উৎস প্রমাণ দেখুন', en: 'Inspect Case & Evidence' },
  empty_queue_title: { bn: 'কিউতে কোনো অনিষ্পন্ন অসঙ্গতি নেই', en: 'No Unresolved Conflicts in Queue' },
  empty_queue_desc: { bn: 'সকল সনাক্তকৃত সংকেত পর্যালোচক কর্তৃক নিষ্পত্তি করা হয়েছে।', en: 'All flagged signals have been formally reviewed and resolved.' },
  modal_disposition_header: { bn: 'মানবীয় পর্যালোচক সিদ্ধান্ত প্রদান', en: 'Record Reviewer Disposition' },
  select_disp_type: { bn: 'সিদ্ধান্তের শ্রেণি নির্বাচন করুন *', en: 'Select Disposition Classification *' },
  disp_opt_confirmed: { bn: 'অসঙ্গতি নিশ্চিতকৃত (Confirmed Inconsistency / Flagged)', en: 'Confirmed Inconsistency (Flagged)' },
  disp_opt_resolved: { bn: 'বৈধ হিসেবে নিষ্পত্তি (Resolved Legitimate / Explanation Accepted)', en: 'Resolved Legitimate (Explanation Accepted)' },
  disp_opt_inconclusive: { bn: 'অমীমাংসিত / অতিরিক্ত বায়া দলিল তলব (Inconclusive)', en: 'Inconclusive (Additional Baya Deeds Requested)' },
  disp_opt_false_positive: { bn: 'ভ্রান্ত সংকেত / ওসিআর ত্রুটি (False Positive)', en: 'False Positive (OCR or Normalization Artifact)' },
  disp_notes_label: { bn: 'সিদ্ধান্তের যৌক্তিক কারণ ও নোট *', en: 'Justification Notes & Legal Summary *' },
  disp_notes_placeholder: { bn: 'রেজিস্ট্রি ভলিউম ও পক্ষগণের দাখিলকৃত ব্যাখ্যার সারসংক্ষেপ...', en: 'Summary of registry volume check and parties submitted explanations...' },
  disp_submit_btn: { bn: 'সিদ্ধান্ত চূড়ান্ত করুন', en: 'Finalize Disposition' },

  // Reports Extra
  report_preparing: { bn: 'প্রতিবেদন প্রস্তুত হচ্ছে...', en: 'Generating report...' },
  report_case_switch: { bn: 'কেস পরিবর্তন:', en: 'Change Case:' },
  report_print_btn: { bn: 'প্রিন্ট / PDF সংরক্ষণ', en: 'Print / Save PDF' },
  report_sec2_risk: { bn: '২. ঝুঁকি মূল্যায়ন ও সারসংক্ষেপ (Risk Priority Assessment)', en: '2. Risk Priority Assessment' },
  report_risk_level: { bn: 'ঝুঁকি স্তর: {level}', en: 'Risk Level: {level}' },
  report_risk_score: { bn: 'ঝুঁকি স্কোর: {score}/১০০', en: 'Risk Score: {score}/100' },
  report_sec3_docs: { bn: '৩. বিশ্লেষিত নথিপত্র ও ক্রিপ্টোগ্রাফিক হ্যাশ (Enrolled Documents)', en: '3. Enrolled Documents & Cryptographic Hashes' },
  report_col_category: { bn: 'শ্রেণি', en: 'Category' },
  report_sec4_findings: { bn: '৪. সনাক্তকৃত অসঙ্গতি ও উৎস প্রমাণ (Findings & Traceable Evidence)', en: '4. Findings & Traceable Evidence' },
  report_no_findings: { bn: '✓ দাখিলকৃত নথিপত্রে কোনো স্বত্ব বিরোধ বা গরমিল পাওয়া যায়নি।', en: '✓ Zero title conflicts or transaction inconsistencies detected in submitted documents.' },
  report_legal_disclaimer_title: { bn: 'আইনি সতর্কতা ও দায়মুক্তি বিবৃতি:', en: 'Legal Disclaimer & Statutory Notice:' },
  report_legal_disclaimer_body: { bn: 'এই সফটওয়্যারটি সহকারী কমিশনার (ভূমি), সাব-রেজিস্ট্রার কার্যালয় বা আদালতের কোনো অনুমোদিত প্রতিস্থাপন নয়। চূড়ান্ত স্বত্ব ও লেনদেন কেবল আইনানুগ সরকারি প্রক্রিয়া ও যাচাইকরণ সাপেক্ষে কার্যকর।', en: 'This software is an analytical decision-support system and does not replace the statutory authority of the Assistant Commissioner (Land), Sub-Registry Office, or the judiciary. Conclusive legal title is established solely through official administrative procedures.' },
  report_lang_btn: { bn: 'প্রতিবেদনের ভাষা', en: 'Report Language' },

  // Methodology Extra
  rule_family_integrity: { bn: 'নথির অখণ্ডতা', en: 'Document Integrity' },
  rule_family_chain: { bn: 'মালিকানা চেইন', en: 'Chain of Title' },
  rule_family_plot: { bn: 'দাগ ও বিরোধ', en: 'Parcel & Conflict' },
  rule_family_records: { bn: 'রেকর্ড সামঞ্জস্য', en: 'Record Consistency' },
  rule_family_evidence: { bn: 'সহায়ক প্রমাণ', en: 'Supporting Evidence' },
  rule_family_graph: { bn: 'গ্রাফ বিশ্লেষণ', en: 'Graph Reasoning' },
  rule_family_ocr: { bn: 'আহরণ মান', en: 'Extraction Quality' },
  sev_low: { bn: 'স্বল্প', en: 'Low' },
  sev_med: { bn: 'মধ্যম', en: 'Medium' },
  sev_high: { bn: 'উচ্চ', en: 'High' },
  sev_crit: { bn: 'গুরুতর', en: 'Critical' },

  // Extracted Field Keys Mapping
  field_deed_number: { bn: 'দলিল নম্বর', en: 'Deed Number' },
  field_registration_date: { bn: 'রেজিস্ট্রেশন তারিখ', en: 'Registration Date' },
  field_executant_seller: { bn: 'বিক্রেতা / দাতা', en: 'Executant / Seller' },
  field_claimant_buyer: { bn: 'ক্রেতা / গ্রহীতা', en: 'Claimant / Buyer' },
  field_mouza_name: { bn: 'মৌজা', en: 'Mouza' },
  field_dag_number: { bn: 'দাগ নম্বর', en: 'Plot / Dag No.' },
  field_khatian_number: { bn: 'খতিয়ান নম্বর', en: 'Khatian No.' },
  field_recorded_area: { bn: 'জমির পরিমাণ (শতাংশ)', en: 'Recorded Area (Decimals)' },

  // Disclaimer
  disclaimer_short: {
    bn: 'আনলেফট ল্যান্ডগার্ড একটি এআই-সহায়তাকৃত পর্যালোচনামূলক টুল; এটি কোনো সরকারি সংস্থা বা আদালতের চূড়ান্ত স্বত্ব নির্ধারণী সিদ্ধান্ত নয়।',
    en: 'UNLEFT LandGuard is an AI-assisted decision-support platform; it does not replace authorized land officials, courts, or title legal clearance.'
  }
};

// Helper function to format numbers (converts English digits to Bengali digits in 'bn' mode)
export function formatNumber(value: number | string | undefined | null, lang: Language = 'bn'): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (lang === 'en') return str;

  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

// Helper function to format dates
export function formatDate(dateStr: string | Date | undefined, lang: Language = 'bn'): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);

    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    if (lang === 'bn') {
      return `${formatNumber(day, 'bn')}/${formatNumber(month, 'bn')}/${formatNumber(year, 'bn')}`;
    }
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateStr);
  }
}

// Helper to translate status codes
export function getStatusLabel(status: string, lang: Language = 'bn'): string {
  const map: Record<string, { bn: string; en: string }> = {
    pending: { bn: 'অপেক্ষমান', en: 'Pending' },
    processing: { bn: 'বিশ্লেষণ চলছে', en: 'Processing' },
    flagged_review: { bn: 'পর্যালোচনা প্রয়োজন', en: 'Needs Review' },
    verified_clean: { bn: 'অসঙ্গতিহীন', en: 'Verified Consistent' },
    resolved: { bn: 'নিষ্পত্তিকৃত', en: 'Review Resolved' },
  };
  return map[status] ? map[status][lang] : status;
}

// Helper to translate risk levels
export function getRiskLabel(risk: string, lang: Language = 'bn'): string {
  const map: Record<string, { bn: string; en: string }> = {
    low: { bn: 'স্বাভাবিক (Low)', en: 'Low Risk' },
    review: { bn: 'পর্যালোচনা স্তর (Review)', en: 'Needs Review' },
    high: { bn: 'উচ্চ ঝুঁকি (High)', en: 'High Risk' },
    critical: { bn: 'গুরুতর সংকেত (Critical)', en: 'Critical Conflict' },
  };
  return map[risk] ? map[risk][lang] : risk;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number | string | undefined | null) => string;
  formatDate: (dateStr: string | Date | undefined) => string;
  getStatusLabel: (status: string) => string;
  getRiskLabel: (risk: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  t: (key: string) => key,
  formatNumber: (v) => (v === undefined || v === null ? '' : String(v)),
  formatDate: (d) => String(d),
  getStatusLabel: (s) => s,
  getRiskLabel: (r) => r,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('bn');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('unbhumi_lang') as Language;
    if (saved && (saved === 'bn' || saved === 'en')) {
      setLanguageState(saved);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = saved;
      }
    } else {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = 'bn';
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('unbhumi_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const activeLanguage: Language = mounted ? language : 'bn';

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = key;
    if (DICTIONARY[key]) {
      text = DICTIONARY[key][activeLanguage] || DICTIONARY[key].bn || key;
    }
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        const localizedVal = typeof val === 'number' ? formatNumber(val, activeLanguage) : String(val);
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), localizedVal);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language: activeLanguage,
        setLanguage,
        t,
        formatNumber: (v) => formatNumber(v, activeLanguage),
        formatDate: (d) => formatDate(d, activeLanguage),
        getStatusLabel: (s) => getStatusLabel(s, activeLanguage),
        getRiskLabel: (r) => getRiskLabel(r, activeLanguage),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
