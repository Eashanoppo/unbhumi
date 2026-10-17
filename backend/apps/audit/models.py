from django.db import models
from django.contrib.auth.models import User

class ReviewerDecision(models.Model):
    DECISION_CHOICES = [
        ('confirmed_inconsistency', 'Confirmed Inconsistency (অসঙ্গতি নিশ্চিতকৃত)'),
        ('resolved_legitimate', 'Resolved / Legitimate Record (বৈধ হিসেবে নিষ্পত্তি)'),
        ('inconclusive', 'Inconclusive / More Evidence Needed (অমীমাংসিত / অতিরিক্ত নথি প্রয়োজন)'),
        ('false_positive', 'False Positive (ভ্রান্ত সংকেত চিহ্নিত)'),
    ]

    case = models.ForeignKey('cases.Case', on_delete=models.CASCADE, related_name='reviewer_decisions')
    finding = models.ForeignKey('rules.AnomalyFinding', on_delete=models.SET_NULL, null=True, blank=True, related_name='decisions')
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    decision = models.CharField(max_length=32, choices=DECISION_CHOICES)
    reason_bn = models.TextField(verbose_name='সিদ্ধান্তের কারণ (বাংলা)')
    reason_en = models.TextField(blank=True, default='', verbose_name='Decision Reason (English)')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.case.case_number} - {self.get_decision_display()} by {self.reviewer}"


class AuditEvent(models.Model):
    ACTION_CHOICES = [
        ('upload', 'Document Upload (নথি আপলোড)'),
        ('extract', 'Field Extraction (তথ্য আহরণ)'),
        ('run_checks', 'Run Rules Check (অসঙ্গতি পরীক্ষা)'),
        ('correct_field', 'Field Correction (তথ্য সংশোধন)'),
        ('review_disposition', 'Review Disposition (পর্যালোচক সিদ্ধান্ত)'),
        ('export_report', 'Report Export (প্রতিবেদন ডাউনলোড)'),
        ('seed_data', 'Seed Demo Data (ডেমো তথ্য প্রস্তুতকরণ)'),
    ]

    case = models.ForeignKey('cases.Case', on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_events')
    document = models.ForeignKey('documents.Document', on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_events')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {self.get_action_display()} - {self.user}"
