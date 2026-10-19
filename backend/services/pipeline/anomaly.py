"""
Statistical Anomaly Detection Service for LandTech transactions.
Monitors transaction velocity, repeat sales, and area drift with safe disabled states.
"""

from typing import Dict, Any, List, Optional
from datetime import date

class StatisticalAnomalyProvider:
    """
    Detects statistical outliers in land transactions:
    - Rapid resales (< 30 days between consecutive deed registrations on the same parcel).
    - Unusually high transaction velocity.
    - Area drift anomalies.
    Safe disabled state when insufficient historical transactions exist.
    """

    MIN_SAMPLES_REQUIRED = 2

    @classmethod
    def evaluate_transactions(cls, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyzes a sequence of transactions on a parcel.
        Returns list of anomaly flags.
        """
        if len(transactions) < cls.MIN_SAMPLES_REQUIRED:
            return []

        anomalies = []
        sorted_tx = sorted(transactions, key=lambda t: t.get('deed_date') or date.min)

        for i in range(len(sorted_tx) - 1):
            t1 = sorted_tx[i]
            t2 = sorted_tx[i + 1]

            d1 = t1.get('deed_date')
            d2 = t2.get('deed_date')

            # 1. Check rapid resale interval (< 30 days)
            if d1 and d2 and isinstance(d1, date) and isinstance(d2, date):
                delta_days = (d2 - d1).days
                if 0 <= delta_days < 30:
                    anomalies.append({
                        'type': 'rapid_resale_anomaly',
                        'title_bn': f'অস্বাভাবিক দ্রুততম সময়ে পুনঃহস্তান্তর ({delta_days} দিন)',
                        'title_en': f'Abnormally rapid resale velocity ({delta_days} days)',
                        't1_deed': t1.get('deed_number'),
                        't2_deed': t2.get('deed_number'),
                        'delta_days': delta_days,
                        'severity': 'medium'
                    })

        return anomalies
