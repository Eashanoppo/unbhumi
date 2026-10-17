from django.db import models
from django.contrib.auth.models import User
import uuid

class Case(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Ingestion (অপেক্ষমান)'),
        ('processing', 'Analyzing Documents (বিশ্লেষণ চলছে)'),
        ('flagged_review', 'Needs Review (পর্যালোচনা প্রয়োজন)'),
        ('verified_clean', 'No Inconsistency Found (যাচাই সম্পন্ন - অসঙ্গতিহীন)'),
        ('resolved', 'Review Resolved (নিষ্পত্তিকৃত)'),
    ]

    RISK_LEVEL_CHOICES = [
        ('low', 'Low Risk (স্বাভাবিক / কম ঝুঁকি)'),
        ('review', 'Needs Review (পর্যালোচনা স্তর)'),
        ('high', 'High Risk (উচ্চ ঝুঁকি)'),
        ('critical', 'Critical Conflict (গুরুতর অসঙ্গতি / সম্ভাব্য দ্বৈত বিক্রি)'),
    ]

    case_number = models.CharField(max_length=64, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    parcel = models.ForeignKey('parcels.Parcel', on_delete=models.SET_NULL, null=True, blank=True, related_name='cases')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='pending')
    risk_level = models.CharField(max_length=32, choices=RISK_LEVEL_CHOICES, default='low')
    risk_score = models.PositiveIntegerField(default=0)  # 0 to 100
    risk_summary_bn = models.TextField(blank=True, default='')
    risk_summary_en = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_cases')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_cases')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def generate_case_number(cls):
        import random
        return f"UB-{random.randint(20260000, 20269999)}"

    def save(self, *args, **kwargs):
        if not self.case_number:
            self.case_number = self.generate_case_number()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.case_number}: {self.title} ({self.get_risk_level_display()})"


class AnalysisRun(models.Model):
    STATUS_CHOICES = [
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='analysis_runs')
    run_id = models.CharField(max_length=64, default=uuid.uuid4, unique=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='started')
    rules_evaluated_count = models.PositiveIntegerField(default=0)
    anomalies_found_count = models.PositiveIntegerField(default=0)
    summary_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Run {self.run_id[:8]} on {self.case.case_number} ({self.status})"
