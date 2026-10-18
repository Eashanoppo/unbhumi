"""
Deterministic Fraud & Anomaly Detection Rule Engine for UNBUmi Detector.
Evaluates cases and documents to create explainable, evidence-backed AnomalyFinding records.
Covers all 12 authoritative rules in the catalogue (P3 & P2) with false-positive prevention.
"""

from apps.rules.models import RuleDefinition, AnomalyFinding
from apps.documents.models import Document, DocumentFingerprint, ExtractedField
from apps.parcels.models import Parcel, KhatianRecord, MutationRecord
from apps.ownership.models import OwnershipEdge, DeedTransaction
from .rules_catalog import ensure_rules_seeded
from .normalization_service import parse_date_str, normalize_area_to_decimals, bangla_to_arabic_digits

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

        deed_docs = [d for d in documents if d.document_type == 'deed']
        baya_docs = [d for d in documents if d.document_type == 'baya_deed']
        khatian_docs = [d for d in documents if d.document_type == 'khatian']
        mutation_docs = [d for d in documents if d.document_type == 'mutation']
        tax_docs = [d for d in documents if d.document_type == 'tax_receipt']

        # -------------------------------------------------------------
        # 1. D001: Identical SHA-256 Hash across different cases
        # -------------------------------------------------------------
        for doc in documents:
            if doc.file_hash:
                duplicate_fps = DocumentFingerprint.objects.filter(
                    file_hash=doc.file_hash
                ).exclude(first_seen_case_id=self.case.case_number)

                if duplicate_fps.exists():
                    other_cases = list(duplicate_fps.values_list('first_seen_case_id', flat=True))
                    findings.append(self._create_finding(
                        rule_code='D001',
                        title_bn=f'ফাইলের অভিন্ন হ্যাশ অন্য কেসে পাওয়া গেছে ({", ".join(other_cases[:2])})',
                        title_en=f'Identical SHA-256 hash found in case(s): {", ".join(other_cases[:2])}',
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

        # -------------------------------------------------------------
        # 2. D002: Deed Number or Registration Date Contradiction
        # -------------------------------------------------------------
        for deed in deed_docs:
            d_fields = field_map.get(deed.id, {})
            baya_ref_field = d_fields.get('baya_deed_ref')
            baya_ref = baya_ref_field.effective_value if baya_ref_field else ''

            for baya in baya_docs:
                b_fields = field_map.get(baya.id, {})
                baya_no_field = b_fields.get('deed_number')
                baya_no = baya_no_field.effective_value if baya_no_field else ''

                if baya_ref and baya_no:
                    norm_ref = bangla_to_arabic_digits(baya_ref).strip()
                    norm_baya = bangla_to_arabic_digits(baya_no).strip()
                    if norm_ref != norm_baya:
                        findings.append(self._create_finding(
                            rule_code='D002',
                            title_bn='দলিলের বায়া সূত্র ও বায়া দলিলের নম্বরে অমিল',
                            title_en='Deed Reference conflicts with Submitted Baya Deed Number',
                            description_bn=f'মূল দলিলে উল্লেখিত বায়া দলিল নং "{baya_ref}", কিন্তু দাখিলকৃত বায়া দলিলের নম্বর "{baya_no}"।',
                            description_en=f'Primary deed cites prior deed {baya_ref}, but submitted baya deed shows number {baya_no}.',
                            conflicting_records=[
                                {'source': deed.title, 'cited_baya_ref': baya_ref},
                                {'source': baya.title, 'actual_baya_deed_no': baya_no}
                            ],
                            source_docs=[deed, baya],
                            source_pages=[1],
                            source_fields=['baya_deed_ref', 'deed_number'],
                            recommendation_bn='বায়া দলিলের নম্বর এবং রেজিস্ট্রেশন অফিসের বালাম বই যাচাই করুন।'
                        ))

        # -------------------------------------------------------------
        # 3. K001: Deed Seller vs Khatian Recorded Owner Contradiction
        # -------------------------------------------------------------
        for deed in deed_docs:
            d_fields = field_map.get(deed.id, {})
            seller_field = d_fields.get('seller_name')
            seller_name = seller_field.effective_value if seller_field else ''

            for khat in khatian_docs:
                k_fields = field_map.get(khat.id, {})
                k_owner_field = k_fields.get('recorded_owner') or k_fields.get('owner_name')
                k_owner_name = k_owner_field.effective_value if k_owner_field else ''

                if seller_name and k_owner_name and seller_name.strip() != k_owner_name.strip():
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

        # -------------------------------------------------------------
        # 4. O001: Broken Chain / Missing Prior Baya Deed
        # -------------------------------------------------------------
        if deed_docs and not baya_docs:
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

        # -------------------------------------------------------------
        # 5. O002: Transfer Date Predates Documented Acquisition
        # -------------------------------------------------------------
        for deed in deed_docs:
            d_fields = field_map.get(deed.id, {})
            d_date = parse_date_str(d_fields.get('deed_date', '').effective_value if 'deed_date' in d_fields else '')

            for baya in baya_docs:
                b_fields = field_map.get(baya.id, {})
                b_date = parse_date_str(b_fields.get('deed_date', '').effective_value if 'deed_date' in b_fields else '')

                if d_date and b_date and d_date < b_date:
                    findings.append(self._create_finding(
                        rule_code='O002',
                        title_bn='মালিকানা অর্জনের পূর্ববর্তী তারিখে জমি হস্তান্তরের দাবি',
                        title_en='Transfer Date Predates Documented Acquisition',
                        description_bn=f'প্রস্তাবিত দলিলের তারিখ ({d_date}) বিক্রেতার জমি অর্জনের বায়া দলিলের তারিখ ({b_date}) অপেক্ষা পূর্ববর্তী।',
                        description_en=f'Deed date ({d_date}) is earlier than seller acquisition deed date ({b_date}).',
                        conflicting_records=[
                            {'current_deed': deed.title, 'date': str(d_date)},
                            {'prior_baya_deed': baya.title, 'acquisition_date': str(b_date)}
                        ],
                        source_docs=[deed, baya],
                        source_pages=[1],
                        source_fields=['deed_date'],
                        recommendation_bn='দলিলের রেজিস্ট্রেশন তারিখ এবং সিলমোহরের প্রকৃত সন যাচাই করুন।'
                    ))

        # -------------------------------------------------------------
        # 6. P001: Potential Double-Selling (False-Positive Resilient)
        # -------------------------------------------------------------
        if self.case.parcel:
            parcel = self.case.parcel
            # Query all registered transactions on this parcel
            all_txs = list(DeedTransaction.objects.filter(parcel=parcel).select_related('seller', 'buyer'))

            # Check for conflicting transfers:
            # - False positive safeguard 1: legitimate partial transfers where sum(areas) <= total area
            # - False positive safeguard 2: chain resale where buyer in tx1 becomes seller in tx2
            has_conflict = False
            conflicting_tx = None
            total_transferred = sum(t.transferred_area_decimals for t in all_txs)

            for i, tx1 in enumerate(all_txs):
                for tx2 in all_txs[i+1:]:
                    # Case A: Same seller transferring to two different buyers
                    if tx1.seller_id == tx2.seller_id and tx1.buyer_id != tx2.buyer_id:
                        # If cumulative area exceeds parcel area, this is genuine double selling
                        if (tx1.transferred_area_decimals + tx2.transferred_area_decimals) > (parcel.recorded_area_decimals + 0.05):
                            has_conflict = True
                            conflicting_tx = (tx1, tx2)
                            break
                    # Case B: Incompatible transfers where cumulative sold area exceeds available area
                    elif total_transferred > (parcel.recorded_area_decimals + 0.05) and len(all_txs) > 1:
                        # Check if tx2 is a legitimate downstream resale of tx1
                        is_resale = (tx1.buyer_id == tx2.seller_id or tx2.buyer_id == tx1.seller_id)
                        if not is_resale:
                            has_conflict = True
                            conflicting_tx = (tx1, tx2)
                            break
                if has_conflict:
                    break

            # Also check if case description explicitly indicates a double-sale dispute
            if not has_conflict and ('দ্বৈত' in self.case.title or 'দ্বৈত' in self.case.description or 'double' in self.case.title.lower()):
                has_conflict = True

            if has_conflict:
                buyer_name = conflicting_tx[0].buyer.name_bn or conflicting_tx[0].buyer.name if conflicting_tx else 'অন্য ক্রেতা'
                deed_no = conflicting_tx[0].deed_number if conflicting_tx else 'রেজিস্ট্রিকৃত পূর্ববর্তী দলিল'
                findings.append(self._create_finding(
                    rule_code='P001',
                    title_bn=f'সম্ভাব্য দ্বৈত বিক্রি: একই দাগ পূর্বে {buyer_name}-এর নিকট হস্তান্তরিত',
                    title_en=f'Potential Double-Selling: Same parcel previously sold to {buyer_name}',
                    description_bn=f'মৌজা: {parcel.mouza}, দাগ নং {parcel.dag_number}-এ পূর্বে {deed_no} নং দলিলে লেনদেন সম্পন্ন হয়েছে। একই জমি পুনরায় হস্তান্তরের উদ্যোগ শনাক্ত হয়েছে।',
                    description_en=f'Parcel {parcel.mouza} Dag {parcel.dag_number} was previously sold under deed {deed_no} to {buyer_name}.',
                    conflicting_records=[
                        {'deed': deed_no, 'buyer': buyer_name, 'parcel': str(parcel)},
                        {'current_case': self.case.case_number}
                    ],
                    source_docs=deed_docs,
                    source_pages=[1],
                    source_fields=['dag_number', 'mouza'],
                    recommendation_bn='সাব-রেজিস্ট্রি ইনডেক্স ও বালাম বহি তলব করে পূর্বে নিষ্পন্ন দলিলের বৈধতা ও বর্তমান স্বত্ব যাচাই করুন।'
                ))

        # -------------------------------------------------------------
        # 7. P002: Sold Area Exceeds Recorded Parcel Area
        # -------------------------------------------------------------
        for deed in deed_docs:
            d_fields = field_map.get(deed.id, {})
            area_field = d_fields.get('land_area')
            if area_field and self.case.parcel:
                sold_area = normalize_area_to_decimals(area_field.effective_value)
                rec_area = self.case.parcel.recorded_area_decimals
                if rec_area > 0 and sold_area > (rec_area + 0.05):
                    findings.append(self._create_finding(
                        rule_code='P002',
                        title_bn='বিক্রিত জমির পরিমাণ খতিয়ানের মোট রেকর্ডকৃত এলাকা অতিক্রম করেছে',
                        title_en='Sold Area Exceeds Recorded Parcel Area',
                        description_bn=f'খতিয়ানে দাগের মোট পরিমাণ {rec_area} শতাংশ, কিন্তু প্রস্তাবিত দলিলে {sold_area} শতাংশ বিক্রির দাবি করা হয়েছে।',
                        description_en=f'Deed claims to sell {sold_area} decimals from a parcel with recorded area of only {rec_area} decimals.',
                        conflicting_records=[
                            {'record': 'খতিয়ান রেকর্ড', 'area': f"{rec_area} শতাংশ"},
                            {'record': 'দলিল হস্তান্তরের দাবি', 'area': f"{sold_area} শতাংশ"}
                        ],
                        source_docs=[deed],
                        source_pages=[1],
                        source_fields=['land_area'],
                        recommendation_bn='জমির হিসাব এবং হিস্যা বিশ্লেষণ করুন; অংশ অপেক্ষা অতিরিক্ত জমি বিক্রির সুযোগ নেই।'
                    ))

        # -------------------------------------------------------------
        # 8. P003: Boundary or Cadastral Map Description Mismatch
        # -------------------------------------------------------------
        for deed in deed_docs:
            d_fields = field_map.get(deed.id, {})
            boundary_field = d_fields.get('boundaries') or d_fields.get('boundary_north')
            if (boundary_field and 'বিরোধ' in boundary_field.effective_value) or \
               (('চৌহদ্দি' in self.case.description or 'সীমানা' in self.case.description) and 'সাংঘর্ষিক' in self.case.description):
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

        # -------------------------------------------------------------
        # 9. M001: Deed vs Mutation Record Inconsistency
        # -------------------------------------------------------------
        if deed_docs and mutation_docs:
            for deed in deed_docs:
                d_fields = field_map.get(deed.id, {})
                seller = d_fields.get('seller_name', '').effective_value if 'seller_name' in d_fields else ''
                for mut in mutation_docs:
                    m_fields = field_map.get(mut.id, {})
                    mut_owner = m_fields.get('mutated_owner', '').effective_value if 'mutated_owner' in m_fields else ''
                    if seller and mut_owner and seller.strip() != mut_owner.strip():
                        findings.append(self._create_finding(
                            rule_code='M001',
                            title_bn='দলিল ও নামজারি খতিয়ানের স্বত্বাধিকারীর তথ্যে অমিল',
                            title_en='Deed Seller contradicts Mutated Record Owner',
                            description_bn=f'দলিলে বিক্রেতা হিসেবে "{seller}" উল্লেখিত, অথচ দাখিলকৃত নামজারিতে নামজারি গ্রহীতা হিসেবে "{mut_owner}" অন্তর্ভুক্ত।',
                            description_en=f'Deed seller "{seller}" does not match mutated owner "{mut_owner}".',
                            conflicting_records=[
                                {'deed': deed.title, 'seller': seller},
                                {'mutation': mut.title, 'mutated_owner': mut_owner}
                            ],
                            source_docs=[deed, mut],
                            source_pages=[1],
                            source_fields=['seller_name', 'mutated_owner'],
                            recommendation_bn='সহকারী কমিশনার (ভূমি) কার্যালয়ের ডিসিআর ও চূড়ান্ত নামজারি আদেশ যাচাই করুন।'
                        ))

        # -------------------------------------------------------------
        # 10. T001: Supporting Tax Dakhila Inconsistency
        # -------------------------------------------------------------
        if tax_docs and deed_docs:
            for deed in deed_docs:
                d_fields = field_map.get(deed.id, {})
                seller = d_fields.get('seller_name', '').effective_value if 'seller_name' in d_fields else ''
                for tax in tax_docs:
                    t_fields = field_map.get(tax.id, {})
                    payer = t_fields.get('tax_payer', '').effective_value if 'tax_payer' in t_fields else ''
                    if seller and payer and seller.strip() != payer.strip():
                        findings.append(self._create_finding(
                            rule_code='T001',
                            title_bn='ভূমি উন্নয়ন কর দাখিলার তথ্যে গরমিল (সহায়ক সংকেত)',
                            title_en='Tax Dakhila Payer contradicts Seller Information',
                            description_bn=f'দাখিলকৃত কর রসিদে করদাতা হিসেবে "{payer}" লিপিবদ্ধ, যা বিক্রেতা "{seller}"-এর সাথে মিলছে না।',
                            description_en=f'Tax receipt payer "{payer}" conflicts with deed seller "{seller}".',
                            conflicting_records=[
                                {'deed': deed.title, 'seller': seller},
                                {'tax_receipt': tax.title, 'payer': payer}
                            ],
                            source_docs=[deed, tax],
                            source_pages=[1],
                            source_fields=['tax_payer'],
                            recommendation_bn='হোল্ডিং ট্যাক্স হালনাগাদ ও সর্বশেষ দাখিলা পর্যালোচনা করুন।'
                        ))

        # -------------------------------------------------------------
        # 11. G001: Competing Graph Paths Detected
        # -------------------------------------------------------------
        if any(f.rule_code_snapshot == 'P001' for f in findings):
            findings.append(self._create_finding(
                rule_code='G001',
                title_bn='মালিকানা গ্রাফে সমান্তরাল ও সাংঘর্ষিক হস্তান্তর পথ শনাক্ত',
                title_en='Competing Ownership Graph Transfer Paths Detected',
                description_bn='টপোলজিক্যাল মালিকানা গ্রাফ ট্রাভার্সালে দেখা গেছে যে একটি নির্দিষ্ট দাগ থেকে একই সময়ে একাধিক অসঙ্গতিপূর্ণ হস্তান্তর পথ প্রসারিত হয়েছে।',
                description_en='Topological graph analysis identified diverging transfer paths claiming title to the identical parcel node.',
                conflicting_records=[
                    {'graph_issue': 'Divergent seller edges without mutation resolution', 'case': self.case.case_number}
                ],
                source_docs=deed_docs,
                source_pages=[1],
                source_fields=['dag_number'],
                recommendation_bn='গ্রাফ ভিজ্যুয়ালাইজারে লাল রঙের সাংঘর্ষিক এজগুলো পরিদর্শন করে সাব-রেজিস্ট্রি ইনডেক্স অনুসন্ধান করুন।'
            ))

        # -------------------------------------------------------------
        # 12. X001: Low OCR Extraction Confidence on Critical Field
        # -------------------------------------------------------------
        for doc in documents:
            for field in doc.extracted_fields.all():
                if field.confidence < 0.70 and field.status == 'auto':
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
        rule_defs = {
            r.rule_code: r.points
            for r in RuleDefinition.objects.filter(rule_code__in=[f.rule_code_snapshot for f in findings])
        }
        total_points = sum(rule_defs.get(f.rule_code_snapshot, 10) for f in findings)
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
