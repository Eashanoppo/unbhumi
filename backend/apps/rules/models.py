from django.db import models

class RuleDefinition(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low (স্বল্প)'),
        ('medium', 'Medium (মধ্যম)'),
        ('high', 'High (উচ্চ)'),
        ('critical', 'Critical (গুরুতর)'),
    ]

    RULE_FAMILY_CHOICES = [
        ('document_integrity', 'Document Integrity (নথির অখণ্ডতা)'),
        ('ownership_chain', 'Ownership Chain (মালিকানা ধারাবাহিকতা)'),
        ('parcel_conflict', 'Parcel Conflict & Overlap (দাগ ও সীমানা বিরোধ)'),
        ('record_consistency', 'Record Consistency (খতিয়ান ও নামজারি সামঞ্জস্য)'),
        ('graph', 'Graph Relationship Conflict (মালিকানা সংযোগ বিরোধ)'),
        ('extraction_quality', 'Extraction Quality & OCR (তথ্য আহরণ মান)'),
    ]

    rule_code = models.CharField(max_length=32, unique=True, db_index=True)
    family = models.CharField(max_length=32, choices=RULE_FAMILY_CHOICES)
    title_en = models.CharField(max_length=255)
    title_bn = models.CharField(max_length=255)
    description_en = models.TextField()
    description_bn = models.TextField()
    severity = models.CharField(max_length=16, choices=SEVERITY_CHOICES, default='medium')
    points = models.PositiveIntegerField(default=15)
    safeguard_explanation_bn = models.TextField(blank=True, default='')

    def __str__(self):
        return f"[{self.rule_code}] {self.title_bn} ({self.get_severity_display()})"


class AnomalyFinding(models.Model):
    STATUS_CHOICES = [
        ('flagged', 'Flagged for Review (পর্যালোচনাধীন)'),
        ('confirmed_inconsistency', 'Confirmed Inconsistency (অসঙ্গতি নিশ্চিতকৃত)'),
        ('resolved_legitimate', 'Resolved / Legitimate Record (বৈধ সমাধানকৃত)'),
        ('inconclusive', 'Inconclusive / More Docs Needed (অমীমাংসিত / অতিরিক্ত নথি প্রয়োজন)'),
        ('false_positive', 'False Positive / Scan Noise (ভ্রান্ত সংকেত)'),
    ]

    case = models.ForeignKey('cases.Case', on_delete=models.CASCADE, related_name='anomalies')
    rule = models.ForeignKey(RuleDefinition, on_delete=models.SET_NULL, null=True, blank=True, related_name='findings')
    rule_code_snapshot = models.CharField(max_length=32, db_index=True)
    severity = models.CharField(max_length=16, default='medium')
    title_bn = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255)
    description_bn = models.TextField()
    description_en = models.TextField()
    conflicting_records = models.JSONField(default=list, blank=True)
    source_documents = models.ManyToManyField('documents.Document', blank=True, related_name='anomalies')
    source_pages = models.JSONField(default=list, blank=True)
    source_fields = models.JSONField(default=list, blank=True)
    human_action_recommended_bn = models.TextField(blank=True, default='')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='flagged')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.rule_code_snapshot}] {self.title_bn} ({self.status})"
