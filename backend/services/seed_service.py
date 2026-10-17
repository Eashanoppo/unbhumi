"""
Comprehensive Synthetic Data Seed Service for UNBUmi Detector.
Generates reproducible demo users, 8 realistic Bangladeshi land cases,
associated documents, SHA-256 fingerprints, extracted fields, anomalies, and ownership graphs.
"""

from django.contrib.auth.models import User
from apps.accounts.models import UserProfile, DemoToken
from apps.cases.models import Case, AnalysisRun
from apps.documents.models import Document, DocumentPage, DocumentFingerprint, ExtractedField
from apps.parcels.models import Parcel, KhatianRecord, MutationRecord
from apps.ownership.models import PersonOrParty, DeedTransaction, OwnershipEdge
from apps.rules.models import RuleDefinition, AnomalyFinding
from apps.audit.models import AuditEvent, ReviewerDecision
from .rules_catalog import ensure_rules_seeded
from .rule_engine import RuleEngine
from .graph_service import GraphService
import hashlib

def seed_demo_data():
    ensure_rules_seeded()

    # 1. Seed Demo Users
    users_data = [
        ('reviewer@unleft.org', 'demo_reviewer', 'আব্দুল করিম', 'সাব-রেজিস্ট্রি কার্যালয় (Reviewer)'),
        ('supervisor@unleft.org', 'demo_supervisor', 'রাশেদ চৌধুরী', 'উপজেলা ভূমি অফিস (Supervisor)'),
        ('admin@unleft.org', 'demo_admin', 'তানভীর আহমেদ', 'সিস্টেম অ্যাডমিনিস্ট্রেশন (Admin)'),
    ]

    seeded_users = {}
    for email, role, bn_name, org in users_data:
        username = email.split('@')[0]
        user, _ = User.objects.get_or_create(username=username, defaults={'email': email, 'first_name': bn_name})
        user.set_password('demo123')
        user.save()
        profile, _ = UserProfile.objects.update_or_create(
            user=user,
            defaults={'role': role, 'full_name_bn': bn_name, 'organization': org}
        )
        token = DemoToken.generate_token_for_user(user)
        seeded_users[role] = (user, token)

    primary_user = seeded_users['demo_reviewer'][0]

    # Clear existing synthetic demo cases to ensure clean state
    Case.objects.all().delete()
    Parcel.objects.all().delete()
    PersonOrParty.objects.all().delete()
    DocumentFingerprint.objects.all().delete()
    Document.objects.all().delete()

    # Seed 8 Scenarios
    scenarios = [
        {
            'case_number': 'UB-2026-1001',
            'title': 'মৌজা কাউন্দিয়া আরএস দাগ ৪১২ জমি হস্তান্তর যাচাই',
            'desc': 'স্বাভাবিক ও বৈধ হস্তান্তর। সাফ-কবলা দলিল, আরএস খতিয়ান, নামজারি ও ভূমি উন্নয়ন কর রসিদ সম্পূর্ণ সঙ্গতিপূর্ণ।',
            'mouza': 'কাউন্দিয়া',
            'dag': '৪১২',
            'survey': 'RS',
            'area': 25.0,
            'seller': 'মো: আব্দুর রহিম',
            'buyer': 'মোছা: ফাতেমা বেগম',
            'deed_no': '৭৪৫২',
            'deed_date': '2026-03-15',
            'conflict_type': 'clean'
        },
        {
            'case_number': 'UB-2026-1002',
            'title': 'মৌজা ধামরাই দাগ ৮৮ - দ্বৈত বিক্রির সন্দেহজনক কেস',
            'desc': 'একই বিক্রেতা কর্তৃক একই দাগের জমি দুই ভিন্ন ব্যক্তির নিকট হস্তান্তরের গুরুতর অসঙ্গতি শনাক্ত।',
            'mouza': 'ধামরাই',
            'dag': '৮৮',
            'survey': 'RS',
            'area': 40.0,
            'seller': 'কামাল হোসেন',
            'buyer': 'মো: জসিম উদ্দিন',
            'deed_no': '৮৯১০',
            'deed_date': '2026-04-02',
            'conflict_type': 'double_sale',
            'prior_buyer': 'মো: রফিকুল ইসলাম',
            'prior_deed_no': '৩২০১'
        },
        {
            'case_number': 'UB-2026-1003',
            'title': 'মৌজা তেঁতুলঝোড়া দাগ ২৯১ - বায়া দলিলের ধারাবাহিকতা বিচ্ছিন্ন',
            'desc': 'খতিয়ানভুক্ত মালিকের সাথে বর্তমান বিক্রেতার মালিকানা প্রাপ্তির কোনো বৈধ বায়া দলিল বা রেকর্ডীয় সংযোগ অনুপস্থিত।',
            'mouza': 'তেঁতুলঝোড়া',
            'dag': '২৯১',
            'survey': 'RS',
            'area': 18.5,
            'seller': 'মো: সাইফুল ইসলাম',
            'buyer': 'সুলতানা পারভীন',
            'deed_no': '৫১২৩',
            'deed_date': '2026-03-20',
            'conflict_type': 'broken_chain',
            'khatian_owner': 'মৃত গোলাম রহমান'
        },
        {
            'case_number': 'UB-2026-1004',
            'title': 'মৌজা সাভার দাগ ৫১০ - দলিল বনাম খতিয়ান স্বত্ব অসঙ্গতি',
            'desc': 'প্রস্তাবিত দলিলে উল্লেখিত দাগে খতিয়ানভুক্ত মালিকের নামের সাথে বিক্রেতার সম্পূর্ণ অমিল এবং রেকর্ডহীন স্থানান্তর।',
            'mouza': 'সাভার',
            'dag': '৫১০',
            'survey': 'RS',
            'area': 30.0,
            'seller': 'আনোয়ার হোসেন',
            'buyer': 'মো: তারেক রহমান',
            'deed_no': '৬৭৮১',
            'deed_date': '2026-02-28',
            'conflict_type': 'deed_khatian_mismatch',
            'khatian_owner': 'হরেন্দ্র কুমার সাহা'
        },
        {
            'case_number': 'UB-2026-1005',
            'title': 'মৌজা বনগাঁও দাগ ১৪৫ - রেকর্ড অপেক্ষা অতিরিক্ত জমি বিক্রির দাবি',
            'desc': 'খতিয়ানে অনুমোদিত মোট এলাকা ৮০ শতাংশ, কিন্তু প্রস্তাবিত দলিলে ১২০ শতাংশ জমি বিক্রির দাবি করা হয়েছে।',
            'mouza': 'বনগাঁও',
            'dag': '১৪৫',
            'survey': 'RS',
            'area': 80.0,
            'sold_area': 120.0,
            'seller': 'বজলুর রশীদ',
            'buyer': 'আব্দুল কাদের',
            'deed_no': '৯৩০২',
            'deed_date': '2026-04-10',
            'conflict_type': 'area_excess'
        },
        {
            'case_number': 'UB-2026-1006',
            'title': 'মৌজা আশুলিয়া দাগ ৩২০ - এনরোল্ড ফাইলের সাথে হ্যাশ বৈসাদৃশ্য',
            'desc': 'পূর্বে এনরোলকৃত একই রেজিস্ট্রেশন দলিলের সাথে ডিজিটাল ফাইলের বাইট হ্যাশ ও ভেতরের ভলিউম নম্বরে বিকৃতি।',
            'mouza': 'আশুলিয়া',
            'dag': '৩২০',
            'survey': 'RS',
            'area': 50.0,
            'seller': 'মাসুদ রানা',
            'buyer': 'ফারুক আহমেদ',
            'deed_no': '৪৪০২',
            'deed_date': '2026-01-14',
            'conflict_type': 'altered_copy'
        },
        {
            'case_number': 'UB-2026-1007',
            'title': 'মৌজা জিরাবো দাগ ৬৭ - মৌজা ম্যাপ ও চতুঃসীমানা বিরোধ',
            'desc': 'দলিলে উল্লেখিত উত্তর ও পূর্ব সীমানা মৌজা নকশা এবং সংলগ্ন দাগের রেজিস্ট্রিকৃত সীমানার সাথে সাংঘর্ষিক।',
            'mouza': 'জিরাবো',
            'dag': '৬৭',
            'survey': 'RS',
            'area': 22.0,
            'seller': 'মাহবুবুর রহমান',
            'buyer': 'নাজমুল হুদা',
            'deed_no': '৩১৫০',
            'deed_date': '2026-03-08',
            'conflict_type': 'boundary_mismatch'
        },
        {
            'case_number': 'UB-2026-1008',
            'title': 'মৌজা বিরুলিয়া দাগ ১৮০ - হস্তলিখিত ঝাপসা নথি ও নিম্ন ওসিআর মান',
            'desc': 'পুরনো হাতে লেখা দলিলের কারণে ওসিআর আস্থাসীমা ৫০%-এর নিচে। পর্যালোচকের ম্যানুয়াল যাচাই ও সংশোধন প্রয়োজন।',
            'mouza': 'বিরুলিয়া',
            'dag': '১৮০',
            'survey': 'RS',
            'area': 15.0,
            'seller': 'আমির হোসেন',
            'buyer': 'বেলাল হোসেন',
            'deed_no': '১২০৫',
            'deed_date': '2026-04-05',
            'conflict_type': 'low_ocr'
        },
    ]

    for item in scenarios:
        # Create Parcel
        parcel = Parcel.objects.create(
            mouza=item['mouza'],
            jl_number='১২',
            upazila='সাভার',
            district='ঢাকা',
            survey_type=item['survey'],
            dag_number=item['dag'],
            recorded_area_decimals=item['area'],
            boundaries={'north': 'রাস্তা', 'south': 'আলীম মিয়ার জমি', 'east': 'নদী', 'west': 'খাস জমি'}
        )

        # Create Case
        case = Case.objects.create(
            case_number=item['case_number'],
            title=item['title'],
            description=item['desc'],
            parcel=parcel,
            created_by=primary_user,
            assigned_to=primary_user
        )

        # Create Parties
        seller = PersonOrParty.objects.create(name=item['seller'], name_bn=item['seller'], party_type='individual')
        buyer = PersonOrParty.objects.create(name=item['buyer'], name_bn=item['buyer'], party_type='individual')

        # Create Transaction
        sold_area = item.get('sold_area', item['area'])
        tx = DeedTransaction.objects.create(
            deed_number=item['deed_no'],
            deed_date=item['deed_date'],
            sub_registry_office='সাভার সাব-রেজিস্ট্রি কার্যালয়',
            seller=seller,
            buyer=buyer,
            parcel=parcel,
            transferred_area_decimals=sold_area
        )

        # Create Khatian
        khatian_owner = item.get('khatian_owner', item['seller'])
        khat = KhatianRecord.objects.create(
            parcel=parcel,
            khatian_number=f"খতিয়ান-{item['dag']}",
            survey_type='RS',
            recorded_owner_name=khatian_owner,
            recorded_area_decimals=item['area']
        )

        # Create Mutation Record
        MutationRecord.objects.create(
            parcel=parcel,
            case_number=f"মিস-{item['dag']}/২০২৫",
            mutated_khatian_number=f"নামজারি-{item['dag']}",
            mutated_owner_name=item['seller'] if item['conflict_type'] != 'deed_khatian_mismatch' else khatian_owner,
            status='approved'
        )

        # Seed Documents for this case
        deed_hash = hashlib.sha256(f"{item['case_number']}_{item['deed_no']}_content".encode()).hexdigest()
        
        # In altered_copy scenario, seed a conflicting hash enrollment in fingerprint DB
        if item['conflict_type'] == 'altered_copy':
            DocumentFingerprint.objects.create(
                file_hash=deed_hash,
                first_seen_case_id='UB-2025-0044',
                notes='পূর্ববর্তী নিবন্ধিত মূল দলিলের এনরোলমেন্ট'
            )

        # Document 1: Main Deed
        doc_deed = Document.objects.create(
            case=case,
            document_type='deed',
            title=f"মূল সাফ-কবলা দলিল (নং {item['deed_no']})",
            file_hash=deed_hash,
            file_size_bytes=1428500,
            page_count=3,
            status='extracted',
            uploaded_by=primary_user
        )
        tx.source_document = doc_deed
        tx.save()

        # Handle Double Sale Special Case (Second transaction on same parcel in a different case)
        if item['conflict_type'] == 'double_sale':
            prior_buyer = PersonOrParty.objects.create(name=item['prior_buyer'], name_bn=item['prior_buyer'])
            DeedTransaction.objects.create(
                deed_number=item['prior_deed_no'],
                deed_date='2024-11-10',
                sub_registry_office='সাভার সাব-রেজিস্ট্রি কার্যালয়',
                seller=seller,
                buyer=prior_buyer,
                parcel=parcel,
                transferred_area_decimals=item['area'],
                source_document=None
            )
        DocumentPage.objects.create(
            document=doc_deed,
            page_number=1,
            ocr_text=f"দলিল নং {item['deed_no']}, বিক্রেতা: {item['seller']}, ক্রেতা: {item['buyer']}, দাগ: {item['dag']}, পরিমাণ: {sold_area} শতাংশ।",
            ocr_confidence=0.55 if item['conflict_type'] == 'low_ocr' else 0.96
        )
        ExtractedField.objects.create(
            document=doc_deed,
            field_key='deed_number',
            field_label_bn='দলিল নম্বর',
            raw_value=item['deed_no'],
            normalized_value=item['deed_no'],
            confidence=0.50 if item['conflict_type'] == 'low_ocr' else 0.98,
            bounding_box={'x': 100, 'y': 80, 'w': 140, 'h': 35}
        )
        ExtractedField.objects.create(
            document=doc_deed,
            field_key='seller_name',
            field_label_bn='বিক্রেতার নাম',
            raw_value=item['seller'],
            normalized_value=item['seller'],
            confidence=0.52 if item['conflict_type'] == 'low_ocr' else 0.96,
            bounding_box={'x': 100, 'y': 160, 'w': 280, 'h': 40}
        )
        ExtractedField.objects.create(
            document=doc_deed,
            field_key='land_area',
            field_label_bn='জমির পরিমাণ',
            raw_value=f"{sold_area} শতাংশ",
            normalized_value=f"{sold_area} শতাংশ",
            confidence=0.54 if item['conflict_type'] == 'low_ocr' else 0.95,
            bounding_box={'x': 100, 'y': 240, 'w': 200, 'h': 35}
        )

        # Document 2: Khatian Record
        khat_hash = hashlib.sha256(f"{item['case_number']}_khatian".encode()).hexdigest()
        doc_khat = Document.objects.create(
            case=case,
            document_type='khatian',
            title=f"আরএস খতিয়ান (দাগ {item['dag']})",
            file_hash=khat_hash,
            file_size_bytes=985200,
            page_count=1,
            status='extracted',
            uploaded_by=primary_user
        )
        DocumentPage.objects.create(
            document=doc_khat,
            page_number=1,
            ocr_text=f"খতিয়ান নং {khat.khatian_number}, দাগ নং {item['dag']}, প্রজা: {khatian_owner}, পরিমাণ: {item['area']} শতক।",
            ocr_confidence=0.97
        )
        ExtractedField.objects.create(
            document=doc_khat,
            field_key='recorded_owner',
            field_label_bn='রেকর্ডীয় প্রজা/মালিক',
            raw_value=khatian_owner,
            normalized_value=khatian_owner,
            confidence=0.97,
            bounding_box={'x': 120, 'y': 150, 'w': 260, 'h': 40}
        )

        # Run Deterministic Rule Engine on Case
        engine = RuleEngine(case)
        engine.evaluate_all()

        # Build and Persist Ownership Graph
        graph_service = GraphService(case)
        graph_service.build_and_persist_graph()

        # Log Audit Event
        AuditEvent.objects.create(
            case=case,
            user=primary_user,
            action='seed_data',
            details={'case_number': case.case_number, 'status': case.status, 'risk_score': case.risk_score}
        )

    return len(scenarios)
