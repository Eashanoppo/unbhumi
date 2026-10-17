"""
Rules Catalogue for UNBUmi Detector.
Matches P3 (Fraud & Double-Selling Detection) & P2 (Deed & Document Integrity).
"""

RULES_CATALOGUE = [
    {
        'rule_code': 'D001',
        'family': 'document_integrity',
        'title_en': 'Identical SHA-256 Hash Found in Different Case',
        'title_bn': 'অন্য কেসে হুবহু একই ফাইলের ক্রিপ্টোগ্রাফিক হ্যাশ (SHA-256) বিদ্যমান',
        'description_en': 'The exact same digital file byte fingerprint is already enrolled in another registered case.',
        'description_bn': 'প্রস্তাবিত দলিলের বাইট-স্তরের ফিঙ্গারপ্রিন্ট অন্য একটি নিবন্ধিত লেনদেনে পূর্বে অন্তর্ভুক্ত হয়েছে। এটি পুনঃব্যবহার বা জাল প্রতিলিপি হতে পারে।',
        'severity': 'medium',
        'points': 15,
        'safeguard_explanation_bn': 'হুবহু হ্যাশ মিললেই দলিল জাল প্রমাণিত হয় না; এটি একই নথির গ্রহণযোগ্য অনুলিপিও হতে পারে। প্রাসঙ্গিক দলিল যাচাই প্রয়োজন।'
    },
    {
        'rule_code': 'D002',
        'family': 'document_integrity',
        'title_en': 'Deed Number or Registration Date Conflict',
        'title_bn': 'দলিল নম্বর বা রেজিস্ট্রেশন তারিখের বৈসাদৃশ্য',
        'description_en': 'The deed registration number or date extracted conflicts across the submitted deed, baya deed, or citation references.',
        'description_bn': 'প্রদত্ত দলিলের নম্বর অথবা তারিখ অপর নথিতে উল্লেখিত বায়া সনদের তথ্যসূত্রের সাথে মিলছে না।',
        'severity': 'high',
        'points': 20,
        'safeguard_explanation_bn': 'ওসিআর পাঠ্য ভুলের কারণে সংখ্যায় সামান্য অমিল হতে পারে; মূল দলিলের স্ক্যানকৃত পাতা ও সিল সরাসরি নিরীক্ষা করুন।'
    },
    {
        'rule_code': 'O001',
        'family': 'ownership_chain',
        'title_en': 'Broken Ownership Chain / Missing Baya Deed',
        'title_bn': 'মালিকানার ধারাবাহিকতা বিচ্ছিন্ন (বায়া দলিলের অভাব)',
        'description_en': 'The seller does not have a documented prior transfer or chain connecting to the recorded parcel owner.',
        'description_bn': 'বিক্রেতার নামে জমি হস্তান্তরের পূর্ববর্তী বায়া দলিল বা উত্তরাধিকার সূত্র নথিপত্রের তালিকায় পাওয়া যায়নি।',
        'severity': 'critical',
        'points': 30,
        'safeguard_explanation_bn': 'ওয়ারিশসূত্রে প্রাপ্ত জমির ক্ষেত্রে বায়া দলিলের বদলে ওয়ারিশান সনদ ও বণ্টননামা প্রযোজ্য হতে পারে।'
    },
    {
        'rule_code': 'O002',
        'family': 'ownership_chain',
        'title_en': 'Transfer Date Predates Documented Acquisition',
        'title_bn': 'মালিকানা অর্জনের পূর্ববর্তী তারিখে জমি হস্তান্তরের দাবি',
        'description_en': 'The claimed transfer date in the deed is earlier than the date the seller allegedly acquired the land.',
        'description_bn': 'বিক্রেতা যে তারিখে জমিটি বায়া সূত্রে অর্জন করেছিলেন বলে নথিতে উল্লেখ রয়েছে, প্রস্তাবিত হস্তান্তরের তারিখ তার পূর্ববর্তী।',
        'severity': 'critical',
        'points': 35,
        'safeguard_explanation_bn': 'তারিখের ফরম্যাট (দিন/মাস/বছর বনাম মাস/দিন/বছর) যাচাই করুন।'
    },
    {
        'rule_code': 'P001',
        'family': 'parcel_conflict',
        'title_en': 'Potential Double-Selling / Conflicting Active Transfers',
        'title_bn': 'সম্ভাব্য দ্বৈত বিক্রি (একই দাগ একাধিক সক্রিয় দলিলে বিক্রির চেষ্টা)',
        'description_en': 'The exact normalized parcel key appears in more than one conflicting active transaction without mutation resolution.',
        'description_bn': 'একই মৌজা ও খতিয়ানের অধীন নির্দিষ্ট দাগটি পূর্বে অন্য একজন ক্রেতার নিকট বিক্রির প্রমাণ সিস্টেমে বিদ্যমান।',
        'severity': 'critical',
        'points': 40,
        'safeguard_explanation_bn': 'যৌথ মালিকানাধীন দাগের ক্ষেত্রে কোনো শরিক তার নিজ অংশ বিক্রি করতে পারেন; অংশনামা ও হিস্যা যাচাই করুন।'
    },
    {
        'rule_code': 'P002',
        'family': 'parcel_conflict',
        'title_en': 'Sold Area Exceeds Recorded Parcel Area',
        'title_bn': 'বিক্রিত জমির পরিমাণ খতিয়ানের মোট রেকর্ডকৃত এলাকা অতিক্রম করেছে',
        'description_en': 'The cumulative area being transferred exceeds the total recorded area in the official khatian record.',
        'description_bn': 'খতিয়ানে উল্লেখিত মোট জমির পরিমাণ অপেক্ষা প্রস্তাবিত দলিলে অতিরিক্ত জমি বিক্রির দাবি করা হয়েছে।',
        'severity': 'high',
        'points': 25,
        'safeguard_explanation_bn': 'একর, শতাংশ বা কাঠা রূপান্তরের হিসাব এবং আংশিক জরিপ সংশোধন পুনঃনিরীক্ষা করুন।'
    },
    {
        'rule_code': 'P003',
        'family': 'parcel_conflict',
        'title_en': 'Boundary or Cadastral Map Description Mismatch',
        'title_bn': 'চৌহদ্দি ও মৌজা ম্যাপের সীমানা বর্ণনায় গরমিল',
        'description_en': 'The boundary descriptions (North, South, East, West) or plot geometry contradict adjacent land records.',
        'description_bn': 'দলিলে বর্ণিত উত্তর-দক্ষিণ-পূর্ব-পশ্চিম সীমানা ও মৌজা নকশার সংশ্লিষ্ট দাগের বাস্তব চৌহদ্দির মধ্যে অমিল পাওয়া গেছে।',
        'severity': 'medium',
        'points': 15,
        'safeguard_explanation_bn': 'পার্শ্ববর্তী দাগের মালিকানা বা অবকাঠামোগত পরিবর্তনের কারণে চৌহদ্দির নাম পরিবর্তিত হতে পারে।'
    },
    {
        'rule_code': 'K001',
        'family': 'record_consistency',
        'title_en': 'Deed–Khatian Record Contradiction',
        'title_bn': 'দলিল ও খতিয়ানের মালিকানা/দাগে অসঙ্গতি',
        'description_en': 'The seller named in the deed does not match the recorded owner or share in the latest official khatian.',
        'description_bn': 'দলিলের বিক্রেতার নামের সাথে সর্বশেষ সরবরাহকৃত আরএস/বিএস খতিয়ানের মূল প্রজা/মালিকের নাম মিলছে না।',
        'severity': 'high',
        'points': 25,
        'safeguard_explanation_bn': 'রেকর্ডীয় মালিকের মৃত্যুর পর তার ওয়ারিশগণ বিক্রেতা হলে ওয়ারিশ সনদ ও নামজারি খতিয়ান মিলিয়ে দেখা আবশ্যক।'
    },
    {
        'rule_code': 'M001',
        'family': 'record_consistency',
        'title_en': 'Deed–Mutation Record Inconsistency',
        'title_bn': 'দলিল ও নামজারি খতিয়ানের তথ্য অমিল',
        'description_en': 'The mutation case reference or mutated owner does not correspond with the deed transfer details.',
        'description_bn': 'দাখিলকৃত নামজারি খতিয়ানের কেস নম্বর বা নামজারি গ্রহীতার তথ্য দলিলের দাবির সাথে সামঞ্জস্যপূর্ণ নয়।',
        'severity': 'high',
        'points': 20,
        'safeguard_explanation_bn': 'নামজারি প্রক্রিয়া চলমান (পেন্ডিং) থাকতে পারে অথবা সহকারী কমিশনার (ভূমি) কার্যালয়ের চূড়ান্ত আদেশের তারিখ যাচাই প্রয়োজন।'
    },
    {
        'rule_code': 'T001',
        'family': 'record_consistency',
        'title_en': 'Supporting Tax Dakhila Inconsistency',
        'title_bn': 'ভূমি উন্নয়ন কর দাখিলার তথ্যে গরমিল (সহায়ক সংকেত)',
        'description_en': 'The tax receipt (dakhila) payer or holding number conflicts with the parcel or seller information.',
        'description_bn': 'ভূমি উন্নয়ন কর পরিশোধের দাখিলায় উল্লেখিত হোল্ডিং নম্বর বা করদাতার নাম জমির তথ্যের সাথে সঙ্গতিপূর্ণ নয়।',
        'severity': 'low',
        'points': 10,
        'safeguard_explanation_bn': 'কর দাখিলা কেবল সহায়ক প্রমাণ; কর রসিদ কোনো অবস্থাতেই এককভাবে স্বত্বের চূড়ান্ত প্রমাণ বহন করে না।'
    },
    {
        'rule_code': 'G001',
        'family': 'graph',
        'title_en': 'Competing Graph Ownership Paths Detected',
        'title_bn': 'মালিকানা গ্রাফে সমান্তরাল বা সাংঘর্ষিক হস্তান্তর পথ শনাক্ত',
        'description_en': 'Graph analysis identified diverging transfer paths claiming title to the identical parcel node.',
        'description_bn': 'মালিকানা গ্রাফ বিশ্লেষণে দেখা গেছে যে একটি নির্দিষ্ট দাগ থেকে একই সময়ে একাধিক অসঙ্গতিপূর্ণ হস্তান্তর নোড প্রসারিত হয়েছে।',
        'severity': 'critical',
        'points': 35,
        'safeguard_explanation_bn': 'গ্রাফ বিশ্লেষণ দলিলের দাবিগুলোর দৃশ্যমান চিত্র উপস্থাপন করে; আইনি বৈধতা সাব-রেজিস্ট্রার কার্যালয় কর্তৃক নির্ধারিত হবে।'
    },
    {
        'rule_code': 'X001',
        'family': 'extraction_quality',
        'title_en': 'Low OCR Extraction Confidence on Critical Field',
        'title_bn': 'গুরুত্বপূর্ণ তথ্যে ওসিআর পাঠোদ্ধারের নিম্ন মান (সংশোধন আবশ্যক)',
        'description_en': 'Confidence score on deed number, parcel dag, or owner name is below 0.70 threshold.',
        'description_bn': 'দলিল বা খতিয়ানের দাগ নম্বর, পরিমাণ বা নামের অংশে নথির ঝাপসা বা হস্তলিপির কারণে ওসিআর নির্ভরযোগ্যতা কম।',
        'severity': 'low',
        'points': 5,
        'safeguard_explanation_bn': 'স্বল্প নির্ভরযোগ্যতাকে কখনই প্রতারণা বলা যাবে না; পর্যালোচকের ম্যানুয়াল যাচাই ও সংশোধন আবশ্যক।'
    },
]

def ensure_rules_seeded():
    from apps.rules.models import RuleDefinition
    for r in RULES_CATALOGUE:
        RuleDefinition.objects.update_or_create(
            rule_code=r['rule_code'],
            defaults={
                'family': r['family'],
                'title_en': r['title_en'],
                'title_bn': r['title_bn'],
                'description_en': r['description_en'],
                'description_bn': r['description_bn'],
                'severity': r['severity'],
                'points': r['points'],
                'safeguard_explanation_bn': r['safeguard_explanation_bn']
            }
        )
