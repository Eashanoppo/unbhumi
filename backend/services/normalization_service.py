"""
Normalization & Entity Resolution Service for UNBUmi Detector.
Standardizes Bengali digits, land measurement units (decimals/katha/acre/bigha),
party names, and synchronizes document extractions into relational models.
"""

import re
from datetime import datetime
from apps.ownership.models import PersonOrParty, DeedTransaction
from apps.parcels.models import Parcel, KhatianRecord, MutationRecord

BANGLA_TO_ARABIC_DIGITS = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
}

ARABIC_TO_BANGLA_DIGITS = {v: k for k, v in BANGLA_TO_ARABIC_DIGITS.items()}

def bangla_to_arabic_digits(text: str) -> str:
    """Converts Bengali numerical digits to Arabic digits (ASCII)."""
    if not text:
        return ''
    return ''.join(BANGLA_TO_ARABIC_DIGITS.get(ch, ch) for ch in text)

def arabic_to_bangla_digits(text: str) -> str:
    """Converts Arabic (ASCII) digits to Bengali digits."""
    if not text:
        return ''
    return ''.join(ARABIC_TO_BANGLA_DIGITS.get(ch, ch) for ch in text)

def clean_name(name: str) -> str:
    """Standardizes names, stripping common prefixes and excess whitespace."""
    if not name:
        return ''
    cleaned = re.sub(r'^(মোঃ|মো:|মো\.|মুহাম্মদ|মোহাম্মদ|শ্রী|শ্রীমতী|মোছাঃ|মোছা:|মোছা\.)\s*', '', name.strip())
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()

def normalize_area_to_decimals(raw_text: str) -> float:
    """
    Normalizes diverse land area expressions into decimal (শতক/শতাংশ) units.
    Conversions in Bangladesh standard surveying:
    - 1 decimal / শতাংশ / শতক = 1.0 decimal
    - 1 katha (কাঠা) = 1.65 decimals
    - 1 acre (একর) = 100.0 decimals
    - 1 bigha (বিঘা) = 33.0 decimals
    """
    if not raw_text:
        return 0.0

    text = bangla_to_arabic_digits(raw_text).lower()

    # Search for numeric match
    match = re.search(r'([0-9]+(?:\.[0-9]+)?)', text)
    if not match:
        return 0.0

    val = float(match.group(1))

    if 'একর' in text or 'acre' in text:
        return round(val * 100.0, 3)
    elif 'বিঘা' in text or 'bigha' in text:
        return round(val * 33.0, 3)
    elif 'কাঠা' in text or 'katha' in text or 'cottah' in text:
        return round(val * 1.65, 3)
    else:
        # Default unit is decimal / শতাংশ
        return round(val, 3)

def parse_date_str(date_str: str):
    """Parses date string supporting DD/MM/YYYY, YYYY-MM-DD, or Bangla numerals."""
    if not date_str:
        return None
    ascii_date = bangla_to_arabic_digits(date_str).strip()
    patterns = [
        '%Y-%m-%d',
        '%d/%m/%Y',
        '%d-%m-%Y',
        '%d.%m.%Y',
        '%Y/%m/%d'
    ]
    for p in patterns:
        try:
            return datetime.strptime(ascii_date, p).date()
        except ValueError:
            pass
    return None

def normalize_parcel_key(district, upazila, mouza, survey_type, dag_number):
    """Generates canonical normalized key for parcel deduplication."""
    def clean(s):
        s_ascii = bangla_to_arabic_digits(str(s or ''))
        return re.sub(r'[^a-zA-Z0-9\u0980-\u09FF]', '', s_ascii.strip().lower())
    return f"{clean(district)}_{clean(upazila)}_{clean(mouza)}_{clean(survey_type)}_{clean(dag_number)}"


class NormalizationService:
    @staticmethod
    def sync_entities_from_document(document):
        """
        Reconciles approved/extracted fields from a document into relational models:
        - Parcel
        - DeedTransaction
        - KhatianRecord
        - MutationRecord
        - PersonOrParty
        """
        field_dict = {
            f.field_key: f.effective_value
            for f in document.extracted_fields.all()
        }
        if not field_dict:
            return

        case = document.case
        parcel = case.parcel if case else None

        # Resolve or update Parcel
        dag_raw = field_dict.get('dag_number', '')
        mouza_raw = field_dict.get('mouza', '')
        survey_type = field_dict.get('survey_type', '').upper()
        area_raw = field_dict.get('land_area', '')
        area_decimals = normalize_area_to_decimals(area_raw)

        if dag_raw and mouza_raw:
            norm_dag = bangla_to_arabic_digits(dag_raw).strip()
            district = field_dict.get('district') or (parcel.district if parcel and parcel.district else '')
            upazila = field_dict.get('upazila') or (parcel.upazila if parcel and parcel.upazila else '')
            norm_key = normalize_parcel_key(
                district=district,
                upazila=upazila,
                mouza=mouza_raw,
                survey_type=survey_type,
                dag_number=norm_dag
            )
            parcel, _ = Parcel.objects.get_or_create(
                normalized_key=norm_key,
                defaults={
                    'mouza': mouza_raw,
                    'dag_number': dag_raw,
                    'survey_type': survey_type or 'unspecified',
                    'district': district,
                    'upazila': upazila,
                    'recorded_area_decimals': area_decimals if area_decimals > 0 else (parcel.recorded_area_decimals if parcel else 0.0)
                }
            )
            if case and not case.parcel:
                case.parcel = parcel
                case.save(update_fields=['parcel'])

        # 1. Deed Document -> DeedTransaction & Parties
        if document.document_type in ('deed', 'baya_deed'):
            deed_no = bangla_to_arabic_digits(field_dict.get('deed_number', '')) or f"DOC-{document.id}"
            seller_name = field_dict.get('seller_name', '')
            buyer_name = field_dict.get('buyer_name', '')
            deed_date_str = field_dict.get('deed_date', '')
            deed_date = parse_date_str(deed_date_str)
            baya_ref = field_dict.get('baya_deed_ref', field_dict.get('prior_deed_reference', ''))
            sub_reg = field_dict.get('sub_registry_office', field_dict.get('sub_registry', ''))

            if seller_name and buyer_name and parcel:
                seller, _ = PersonOrParty.objects.get_or_create(
                    name=seller_name,
                    defaults={'name_bn': seller_name}
                )
                buyer, _ = PersonOrParty.objects.get_or_create(
                    name=buyer_name,
                    defaults={'name_bn': buyer_name}
                )
                # Ensure idempotency while preventing cross-document or cross-parcel collision
                DeedTransaction.objects.update_or_create(
                    deed_number=deed_no,
                    parcel=parcel,
                    source_document=document,
                    defaults={
                        'seller': seller,
                        'buyer': buyer,
                        'deed_date': deed_date,
                        'sub_registry_office': sub_reg or '',
                        'transferred_area_decimals': area_decimals if area_decimals > 0 else 0.0,
                        'prior_deed_reference': baya_ref,
                    }
                )

        # 2. Khatian Document -> KhatianRecord
        elif document.document_type == 'khatian':
            khatian_no = bangla_to_arabic_digits(field_dict.get('khatian_number', '')) or f"KHAT-{document.id}"
            owner_name = field_dict.get('recorded_owner', field_dict.get('owner_name', ''))
            if owner_name and parcel:
                KhatianRecord.objects.update_or_create(
                    parcel=parcel,
                    khatian_number=khatian_no,
                    defaults={
                        'survey_type': survey_type or 'unspecified',
                        'recorded_owner_name': owner_name,
                        'recorded_area_decimals': area_decimals if area_decimals > 0 else 0.0,
                        'source_document': document
                    }
                )

        # 3. Mutation Document -> MutationRecord
        elif document.document_type == 'mutation':
            mut_case_no = bangla_to_arabic_digits(field_dict.get('mutation_case_no', field_dict.get('case_number', ''))) or f"MUT-{document.id}"
            mut_owner = field_dict.get('mutated_owner', '')
            dcr_no = field_dict.get('dcr_number', '')
            if mut_owner and parcel:
                MutationRecord.objects.update_or_create(
                    parcel=parcel,
                    case_number=mut_case_no,
                    defaults={
                        'mutated_khatian_number': field_dict.get('mutated_khatian_number', ''),
                        'mutated_owner_name': mut_owner,
                        'dcr_number': dcr_no,
                        'source_document': document
                    }
                )
