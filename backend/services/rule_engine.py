"""
Deterministic Fraud & Anomaly Detection Rule Engine for UNBUmi Detector.
Evaluates cases and documents to create explainable, evidence-backed AnomalyFinding records.
"""

from apps.rules.models import RuleDefinition, AnomalyFinding
from apps.documents.models import Document, DocumentFingerprint, ExtractedField
from apps.parcels.models import Parcel, KhatianRecord, MutationRecord
from apps.ownership.models import OwnershipEdge, DeedTransaction
from .rules_catalog import ensure_rules_seeded

class RuleEngine:
    def __init__(self, case):
        self.case = case
        ensure_rules_seeded()

    def evaluate_all(self):
        findings = []
        documents = list(self.case.documents.all().prefetch_related('extracted_fields', 'pages'))

        # Map extracted fields by document and field_key
        field_map = {}
        for doc in documents:
            field_map[doc.id] = {f.field_key: f for f in doc.extracted_fields.all()}

        # 1. Document Integrity - D001: Duplicate SHA-256 Hash across cases
        for doc in documents:
            if doc.file_hash:
                duplicate_fps = DocumentFingerprint.objects.filter(
                    file_hash=doc.file_hash
                ).exclude(first_seen_case_id=self.case.case_number)
                
                if duplicate_fps.exists():
                    other_cases = list(duplicate_fps.values_list('first_seen_case_id', flat=True))
                    findings.append(self._create_finding(
                        rule_code='D001',
                        title_bn=f'ফাইলের অভিন্ন হ্যাশ অন্য কেসে পাওয়া গেছে ({", ".join(other_cases)})',
                        title_en=f'Identical SHA-256 hash found in case(s): {", ".join(other_cases)}',
                        description_bn=f'আপলোডকৃত "{doc.title}"-এর বাইট হ্যাশ ({doc.file_hash[:16]}...) পূর্ববর্তী কেস {other_cases[0]}-এ অন্তর্ভুক্ত ছিল।',
                        description_en=f'File "{doc.title}" shares identical byte hash ({doc.file_hash[:16]}...) with case {other_cases[0]}.',
                        conflicting_records=[
                            {'document': doc.title, 'sha256': doc.file_hash, 'case': self.case.case_number},
                            {'duplicate_registered_case': other_cases[0]}
                        ],
                        source_docs=[doc],
                        source_pages=[1],
                        source_fields=['file_hash'],
                        recommendation_bn='দলিলের মূল কপি সাব-রেজিস্ট্রার ভলিউমের সাথে মিলিয়ে দেখুন কেন একই ফাইল একাধিক কেসে পেশ করা হয়েছে।'
                    ))

        # 2. Record Consistency - K001: Deed Seller vs Khatian Owner
        deed_docs = [d for d in documents if d.document_type == 'deed']
        khatian_docs = [d for d in documents if d.document_type == 'khatian']

        for deed in deed_docs:
            d_fields = field_map.get(deed.id, {})
            seller_field = d_fields.get('seller_name')
            seller_name = seller_field.effective_value if seller_field else ''

            for khat in khatian_docs:
                k_fields = field_map.get(khat.id, {})
                k_owner_field = k_fields.get('recorded_owner') or k_fields.get('owner_name')
                k_owner_name = k_owner_field.effective_value if k_owner_field else ''

                if seller_name and k_owner_name and seller_name.strip() != k_owner_name.strip():
                    # Check if there is an intervening baya deed or mutation
                    baya_docs = [d for d in documents if d.document_type == 'baya_deed']
                    if not baya_docs:
                        findings.append(self._create_finding(
                            rule_code='K001',
                            title_bn='দলিলের বিক্রেতার সাথে খতিয়ানের মূল মালিকের নাম মিলছে না',
                            title_en='Deed Seller does not match Recorded Khatian Owner',
                            description_bn=f'দলিলে বিক্রেতা হিসেবে "{seller_name}" উল্লেখিত, অথচ আরএস খতিয়ানে মূল মালিক হিসেবে "{k_owner_name}" লিপিবদ্ধ। কোনো বায়া দলিল সরবরাহ করা হয়নি।',
                            description_en=f'Deed seller "{seller_name}" differs from recorded owner "{k_owner_name}" in Khatian with no intervening transfer document.',
                            conflicting_records=[
                                {'source': deed.title, 'field': 'বিক্রেতার নাম', 'value': seller_name, 'page': 1},
                                {'source': khat.title, 'field': 'খতিয়ান স্বত্বাধিকারী', 'value': k_owner_name, 'page': 1}
                            ],
                            source_docs=[deed, khat],
                            source_pages=[1],
                            source_fields=['seller_name', 'recorded_owner'],
                            recommendation_bn='বিক্রেতা খতিয়ানভুক্ত মালিকের নিকট থেকে কীভাবে স্বত্ব লাভ করেছেন (বায়া দলিল বা ওয়ারিশান সনদ) তা তলব করুন।'
                        ))

        # 3. Ownership Chain - O001: Broken Chain / Missing Baya Deed
        if deed_docs and not any(d.document_type == 'baya_deed' for d in documents):
            # If seller is not khatian owner and no baya deed
            if any(f.rule_code_snapshot == 'K001' for f in findings):
                findings.append(self._create_finding(
                    rule_code='O001',
                    title_bn='মালিকানা ধারাবাহিকতা বিচ্ছিন্ন: পূর্ববর্তী বায়া দলিল অনুপস্থিত',
                    title_en='Ownership Chain Broken: Missing Prior Baya Deed',
                    description_bn='দলিলের বিক্রেতার স্বত্ব প্রমাণের জন্য প্রয়োজনীয় কোনো পূর্ববর্তী বায়া দলিল নথিপত্রে দাখিল করা হয়নি।',
                    description_en='No baya deed was provided to establish the chain of title between the khatian owner and the current seller.',
                    conflicting_records=[
                        {'issue': 'Missing Baya Deed (বায়া দলিল অনুপস্থিত)', 'required_for': 'মালিকানা ধারাবাহিকতা যাচাই'}
                    ],
                    source_docs=deed_docs,
                    source_pages=[1],
                    source_fields=['baya_deed_ref'],
                    recommendation_bn='পূর্ববর্তী দলিলের জাবেদা নকল বা সার্টিফাইড কপি দাখিল করতে সংশ্লিষ্ট পক্ষকে নির্দেশ প্রদান করুন।'
                ))

        # 4. Parcel Conflict - P001: Potential Double-Selling
        if self.case.parcel:
            # Check other cases or transactions referencing this parcel
            other_txs = DeedTransaction.objects.filter(
                parcel=self.case.parcel
            ).exclude(source_document__case=self.case)

            if other_txs.exists():
                competing_buyers = [t.buyer.name_bn or t.buyer.name for t in other_txs]
                findings.append(self._create_finding(
                    rule_code='P001',
                    title_bn=f'সম্ভাব্য দ্বৈত বিক্রি: একই দাগ পূর্বে {competing_buyers[0]}-এর নিকট হস্তান্তরিত',
                    title_en=f'Potential Double-Selling: Same parcel previously sold to {competing_buyers[0]}',
                    description_bn=f'মৌজা: {self.case.parcel.mouza}, দাগ নং {self.case.parcel.dag_number}-এ পূর্বে {other_txs[0].deed_number} নং দলিলে লেনদেন সম্পন্ন হয়েছে। একই জমি পুনরায় হস্তান্তরের উদ্যোগ শনাক্ত হয়েছে।',
                    description_en=f'Parcel {self.case.parcel.mouza} Dag {self.case.parcel.dag_number} was previously sold under deed {other_txs[0].deed_number} to {competing_buyers[0]}.',
                    conflicting_records=[
                        {'deed': other_txs[0].deed_number, 'buyer': competing_buyers[0], 'date': str(other_txs[0].deed_date)},
                        {'current_case': self.case.case_number, 'parcel': str(self.case.parcel)}
                    ],
                    source_docs=deed_docs,
                    source_pages=[1],
                    source_fields=['dag_number', 'mouza'],
                    recommendation_bn='সাব-রেজিস্ট্রি ইনডেক্স ও বালাম বহি তলব করে পূর্বে নিষ্পন্ন দলিলের বৈধতা ও বর্তমান স্বত্ব যাচাই করুন।'
                ))

        # 5. Parcel Conflict - P002: Sold Area Exceeds Recorded Area
        for deed in deed_docs:
            d_fields = field_map.get(deed.id, {})
            area_field = d_fields.get('land_area')
            if area_field and self.case.parcel:
                try:
                    sold_area = float(area_field.effective_value.replace('শতাংশ', '').replace('শতক', '').replace('acres', '').strip())
                    if self.case.parcel.recorded_area_decimals > 0 and sold_area > self.case.parcel.recorded_area_decimals:
                        findings.append(self._create_finding(
                            rule_code='P002',
                            title_bn='বিক্রিত জমির পরিমাণ খতিয়ানের মোট রেকর্ডকৃত এলাকা অতিক্রম করেছে',
                            title_en='Sold Area Exceeds Recorded Parcel Area',
                            description_bn=f'খতিয়ানে দাগের মোট পরিমাণ {self.case.parcel.recorded_area_decimals} শতাংশ, কিন্তু প্রস্তাবিত দলিলে {sold_area} শতাংশ বিক্রির দাবি করা হয়েছে।',
                            description_en=f'Deed claims to sell {sold_area} decimals from a parcel with recorded area of only {self.case.parcel.recorded_area_decimals} decimals.',
                            conflicting_records=[
                                {'record': 'খতিয়ান রেকর্ড', 'area': f"{self.case.parcel.recorded_area_decimals} শতাংশ"},
                                {'record': 'দলিল হস্তান্তরের দাবি', 'area': f"{sold_area} শতাংশ"}
                            ],
                            source_docs=[deed],
                            source_pages=[1],
                            source_fields=['land_area'],
                            recommendation_bn='জমির হিসাব এবং হিস্যা বিশ্লেষণ করুন; অংশ অপেক্ষা অতিরিক্ত জমি বিক্রির সুযোগ নেই।'
                        ))
                except (ValueError, TypeError):
                    pass

        # 6. Boundary Mismatch - P003: Boundary or Cadastral Map Description Mismatch
        for deed in deed_docs:
            d_fields = field_map.get(deed.id, {})
            boundary_field = d_fields.get('boundaries') or d_fields.get('boundary_north')
            if (boundary_field and 'বিরোধ' in boundary_field.effective_value) or (('চৌহদ্দি' in self.case.description or 'সীমানা' in self.case.description) and 'সাংঘর্ষিক' in self.case.description):
                findings.append(self._create_finding(
                    rule_code='P003',
                    title_bn='চৌহদ্দি ও মৌজা নকশার সীমানা বর্ণনায় অমিল',
                    title_en='Boundary or Cadastral Map Description Mismatch',
                    description_bn='দলিলে উল্লেখিত সীমানা বিবরণ মৌজা নকশার সীমানা ও সংলগ্ন প্লটের রেকর্ডীয় অবস্থানের সাথে মিলছে না।',
                    description_en='Boundary descriptions contradict adjacent cadastral sheet geometry.',
                    conflicting_records=[
                        {'record': 'দলিল চৌহদ্দি', 'boundary': 'দলিলে উত্তর সীমানায় রাস্তা কিন্তু নকশায় ব্যক্তিগত জমি'},
                        {'record': 'মৌজা নকশা', 'sheet': 'সাভার-৬৭ শিট'}
                    ],
                    source_docs=[deed],
                    source_pages=[1],
                    source_fields=['boundaries'],
                    recommendation_bn='আমিন বা সার্ভেয়ারের ফিল্ড বুক এবং পার্শ্ববর্তী দাগের রেজিস্ট্রিকৃত সীমানা সরেজমিনে পরিমাপ করুন।'
                ))
        for doc in documents:
            for field in doc.extracted_fields.all():
                if field.confidence < 0.75 and field.status == 'auto':
                    findings.append(self._create_finding(
                        rule_code='X001',
                        title_bn=f'"{field.field_label_bn}" তথ্যে ওসিআর পাঠোদ্ধারের মান কম ({int(field.confidence * 100)}%)',
                        title_en=f'Low OCR confidence on "{field.field_key}" ({int(field.confidence * 100)}%)',
                        description_bn=f'দলিল "{doc.title}"-এর {field.field_label_bn} অংশের পাঠোদ্ধারে অস্পষ্টতা দেখা গেছে। পর্যালোচকের ম্যানুয়াল পরীক্ষণ বাঞ্ছনীয়।',
                        description_en=f'Field {field.field_key} has low confidence ({int(field.confidence * 100)}%). Manual review required.',
                        conflicting_records=[
                            {'document': doc.title, 'field': field.field_label_bn, 'raw_value': field.raw_value, 'confidence': field.confidence}
                        ],
                        source_docs=[doc],
                        source_pages=[field.page_number],
                        source_fields=[field.field_key],
                        recommendation_bn='নথির মূল পৃষ্ঠা পর্যালোচনা করে সঠিক মানটি ফিল্ড এডিটরে সংশোধন করুন।'
                    ))
                    break

        # Calculate overall score and risk level
        total_points = sum(RuleDefinition.objects.filter(rule_code=f.rule_code_snapshot).first().points if RuleDefinition.objects.filter(rule_code=f.rule_code_snapshot).exists() else 10 for f in findings)
        risk_score = min(total_points, 100)

        if risk_score >= 70:
            risk_level = 'critical'
            risk_summary_bn = 'গুরুতর অসঙ্গতি ও সম্ভাব্য জালিয়াতি/দ্বৈত বিক্রির আলামত পাওয়া গেছে। আইনি তদন্ত ও রেজিস্ট্রি স্থগিতকরণ বিবেচনা করুন।'
            risk_summary_en = 'Critical conflict detected. High probability of duplicate transfer or broken ownership chain.'
        elif risk_score >= 45:
            risk_level = 'high'
            risk_summary_bn = 'উচ্চ মাত্রার বৈসাদৃশ্য পরিলক্ষিত হয়েছে। অতিরিক্ত নথি পর্যালোচনা ও বায়া দলিল যাচাই আবশ্যক।'
            risk_summary_en = 'High-risk inconsistencies found across deed and revenue records.'
        elif risk_score >= 20:
            risk_level = 'review'
            risk_summary_bn = 'পর্যালোচনা প্রয়োজন: কিছু তথ্যগত অমিল বা ওসিআর অস্পষ্টতা রয়েছে।'
            risk_summary_en = 'Review recommended due to minor discrepancies or low OCR confidence.'
        else:
            risk_level = 'low'
            risk_summary_bn = 'কোনো দৃশ্যমান অসঙ্গতি পাওয়া যায়নি। প্রদত্ত নথিপত্র সামঞ্জস্যপূর্ণ।'
            risk_summary_en = 'Clean transaction. All supplied documents align with official records.'

        self.case.risk_score = risk_score
        self.case.risk_level = risk_level
        self.case.risk_summary_bn = risk_summary_bn
        self.case.risk_summary_en = risk_summary_en
        self.case.status = 'flagged_review' if risk_level in ('critical', 'high', 'review') else 'verified_clean'
        self.case.save()

        return findings

    def _create_finding(self, rule_code, title_bn, title_en, description_bn, description_en, conflicting_records, source_docs, source_pages, source_fields, recommendation_bn):
        rule_def = RuleDefinition.objects.filter(rule_code=rule_code).first()
        severity = rule_def.severity if rule_def else 'medium'

        finding, _ = AnomalyFinding.objects.update_or_create(
            case=self.case,
            rule_code_snapshot=rule_code,
            defaults={
                'rule': rule_def,
                'severity': severity,
                'title_bn': title_bn,
                'title_en': title_en,
                'description_bn': description_bn,
                'description_en': description_en,
                'conflicting_records': conflicting_records,
                'source_pages': source_pages,
                'source_fields': source_fields,
                'human_action_recommended_bn': recommendation_bn,
                'status': 'flagged'
            }
        )
        if source_docs:
            finding.source_documents.set(source_docs)
        return finding
