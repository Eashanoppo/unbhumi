"""
Natural Language Inference (NLI) Conflict Screening Service.
Evaluates premise-hypothesis pairs for documentary contradiction without overriding deterministic rules.
"""

from typing import Dict, Any, Optional

class BaseNLIProvider:
    """Abstract interface for NLI conflict screening."""
    def check_conflict(self, premise: str, hypothesis: str) -> Dict[str, Any]:
        raise NotImplementedError


class NLIConflictProvider(BaseNLIProvider):
    """
    Sub-10ms offline NLI conflict screening rule helper.
    Converts claims into explicit premises and hypotheses:
    e.g., Premise: Seller acquired 20 decimals in 2020.
          Hypothesis: Seller claims to sell 30 decimals in 2026.
    Returns: 'contradiction', 'entailment', or 'neutral'.
    """

    def check_conflict(self, premise: str, hypothesis: str) -> Dict[str, Any]:
        p = (premise or '').strip().lower()
        h = (hypothesis or '').strip().lower()

        if not p or not h:
            return {'verdict': 'neutral', 'confidence': 0.5, 'reason': 'Empty premise or hypothesis'}

        # Fast heuristic checks for contradictions
        # 1. Area contradiction: sold > acquired
        import re
        bn_to_ar = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'}
        p_clean = ''.join(bn_to_ar.get(c, c) for c in p)
        h_clean = ''.join(bn_to_ar.get(c, c) for c in h)

        p_nums = [float(x) for x in re.findall(r'[0-9]+(?:\.[0-9]+)?', p_clean)]
        h_nums = [float(x) for x in re.findall(r'[0-9]+(?:\.[0-9]+)?', h_clean)]

        if p_nums and h_nums:
            if ('অর্জন' in p or 'রেকর্ড' in p or 'acquired' in p or 'recorded' in p) and \
               ('বিক্রি' in h or 'হস্তান্তর' in h or 'selling' in h or 'transferred' in h):
                if h_nums[0] > (p_nums[0] + 0.05):
                    return {
                        'verdict': 'contradiction',
                        'confidence': 0.95,
                        'reason': f'প্রস্তাবিত বিক্রির পরিমাণ ({h_nums[0]}) নথির অনুমোদিত সীমা ({p_nums[0]}) অতিক্রম করেছে।'
                    }

        # 2. Status contradiction: rejected vs approved
        if ('বাতিল' in p or 'খারিজ' in p or 'rejected' in p) and ('অনুমোদিত' in h or 'বৈধ' in h or 'approved' in h):
            return {
                'verdict': 'contradiction',
                'confidence': 0.92,
                'reason': 'নথির বিদ্যমান বাতিলের আদেশের বিপরীতে বৈধতার দাবি সাংঘর্ষিক।'
            }

        return {'verdict': 'neutral', 'confidence': 0.70, 'reason': 'No explicit textual contradiction detected.'}
