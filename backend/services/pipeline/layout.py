"""
Document Layout Analysis, Khatian Table Extraction & Cadastral Map Vision Services.
Handles structured tabular land schedules and spatial boundary descriptions.
"""

import re
from typing import List, Dict, Any, Optional

class TableExtractionProvider:
    """
    Parses multi-column Khatian (Record of Rights) and porcha schedules.
    Preserves row-column relationships (dag number, khatian number, owner share, land type, area).
    """

    @classmethod
    def extract_khatian_schedule(cls, text: str) -> List[Dict[str, Any]]:
        """
        Extracts tabular rows from Khatian schedules.
        Columns:
        1. খতিয়ান নং (Khatian Number)
        2. দাগ নং (Dag/Plot Number)
        3. অংশ / হিস্যা (Share / Proportion)
        4. জমির শ্রেণি (Classification: নাল, ভিটি, বাড়ি, পুকুর, ধানি)
        5. পরিমাণ (Area in decimals/acres)
        """
        rows = []
        lines = [ln.strip() for ln in text.split('\n') if ln.strip()]

        # Pattern matching schedule rows with numerals and land types
        row_pattern = re.compile(
            r'(?:খতিয়ান|খতিয়ান)?\s*[:ঃ]?\s*([০-৯0-9]+)?.*?(\b[০-৯0-9]{1,5}\b).*?(নাল|ভিটি|বাড়ি|বাড়ি|ধনি|ধানি|পুকুর|বাণিজ্যিক|পতিত).*?([০-৯0-9\.]+\s*(?:শতাংশ|শতক|একর|কাঠা)?)',
            re.IGNORECASE
        )

        for line in lines:
            m = row_pattern.search(line)
            if m:
                khat_no = m.group(1) or ''
                dag_no = m.group(2) or ''
                land_type = m.group(3) or 'নাল'
                area = m.group(4) or ''
                rows.append({
                    'khatian_number': khat_no,
                    'dag_number': dag_no,
                    'land_classification': land_type,
                    'area_raw': area,
                    'raw_line': line
                })

        return rows


class MapVisionProvider:
    """
    Computer vision provider for cadastral mouza maps (মৌজা নকশা) and boundary descriptions.
    Separates visible textual boundary labels from inferred spatial topology.
    """

    BOUNDARY_KEYWORDS = {
        'north': ['উত্তর', 'উত্তরে', 'north'],
        'south': ['দক্ষিণ', 'দক্ষিণে', 'south'],
        'east': ['পূর্ব', 'পূর্বে', 'east'],
        'west': ['পশ্চিম', 'পশ্চিমে', 'west'],
    }

    @classmethod
    def parse_boundaries(cls, text: str) -> Dict[str, str]:
        """
        Extracts 4-way plot boundary descriptions (চৌহদ্দি) from deed schedule or map annotations.
        """
        boundaries = {
            'north': '',
            'south': '',
            'east': '',
            'west': ''
        }

        # 1. Look for explicit directional sections
        lines = text.split('\n')
        for line in lines:
            clean = line.strip()
            # North
            if any(k in clean.lower() for k in cls.BOUNDARY_KEYWORDS['north']):
                m = re.search(r'(?:উত্তর|উত্তরে|north)\s*[:ঃ\-]?\s*([^\n,;।]+)', clean, re.IGNORECASE)
                if m and not boundaries['north']:
                    boundaries['north'] = m.group(1).strip()
            # South
            if any(k in clean.lower() for k in cls.BOUNDARY_KEYWORDS['south']):
                m = re.search(r'(?:দক্ষিণ|দক্ষিণে|south)\s*[:ঃ\-]?\s*([^\n,;।]+)', clean, re.IGNORECASE)
                if m and not boundaries['south']:
                    boundaries['south'] = m.group(1).strip()
            # East
            if any(k in clean.lower() for k in cls.BOUNDARY_KEYWORDS['east']):
                m = re.search(r'(?:পূর্ব|পূর্বে|east)\s*[:ঃ\-]?\s*([^\n,;।]+)', clean, re.IGNORECASE)
                if m and not boundaries['east']:
                    boundaries['east'] = m.group(1).strip()
            # West
            if any(k in clean.lower() for k in cls.BOUNDARY_KEYWORDS['west']):
                m = re.search(r'(?:পশ্চিম|পশ্চিমে|west)\s*[:ঃ\-]?\s*([^\n,;।]+)', clean, re.IGNORECASE)
                if m and not boundaries['west']:
                    boundaries['west'] = m.group(1).strip()

        return boundaries

    @classmethod
    def analyze_map_sheet(cls, text: str, width: float, height: float) -> Dict[str, Any]:
        """
        Extracts mouza sheet metadata, sheet number, and JL number.
        Returns explicit status to prevent ungrounded spatial deductions.
        """
        jl_match = re.search(r'জে\s*এল\s*(?:নম্বর|নং)?\s*[:ঃ]?\s*([০-৯0-9a-zA-Z\-]+)', text)
        sheet_match = re.search(r'শিট\s*(?:নম্বর|নং)?\s*[:ঃ]?\s*([০-৯0-9]+)', text)
        mouza_match = re.search(r'মৌজা\s*[:ঃ]?\s*([^\n,;০-৯0-9]{3,30})', text)

        return {
            'is_map_sheet': bool('নকশা' in text or 'ম্যাপ' in text or 'মৌজা' in text),
            'jl_number': jl_match.group(1).strip() if jl_match else '',
            'sheet_number': sheet_match.group(1).strip() if sheet_match else '',
            'mouza_name': mouza_match.group(1).strip() if mouza_match else '',
            'boundaries': cls.parse_boundaries(text),
            'dimensions': {'width': width, 'height': height},
            'status': 'label_extracted' if jl_match or sheet_match else 'partial'
        }
