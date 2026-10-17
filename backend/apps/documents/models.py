from django.db import models
from django.contrib.auth.models import User
import hashlib

class Document(models.Model):
    DOCUMENT_TYPES = [
        ('deed', 'Registered Deed (মূল দলিল)'),
        ('baya_deed', 'Baya Deed / Prior Deed (বায়া দলিল)'),
        ('khatian', 'Khatian / Record of Rights (খতিয়ান - CS/SA/RS/BS)'),
        ('mutation', 'Mutation Khatian (নামজারি খতিয়ান / ডিসিআর)'),
        ('mouza_map', 'Mouza Map / Cadastral Sheet (মৌজা নকশা)'),
        ('tax_receipt', 'Land Tax Dakhila (ভূমি উন্নয়ন কর দাখিলা)'),
        ('other', 'Other Supporting Record (অন্যান্য প্রমাণপত্র)'),
    ]

    STATUS_CHOICES = [
        ('uploaded', 'Uploaded (আপলোড সম্পন্ন)'),
        ('processing', 'Processing (বিশ্লেষণ চলছে)'),
        ('extracted', 'Extracted (তথ্য নিষ্কাশিত)'),
        ('verified', 'Verified (যাচাইকৃত)'),
        ('failed', 'Processing Failed (ত্রুটি)'),
    ]

    case = models.ForeignKey('cases.Case', on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    document_type = models.CharField(max_length=32, choices=DOCUMENT_TYPES, default='deed')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/%Y/%m/', null=True, blank=True)
    file_hash = models.CharField(max_length=64, blank=True, db_index=True)
    file_size_bytes = models.PositiveIntegerField(default=0)
    page_count = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='uploaded')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_hash(self, content_bytes=None):
        if content_bytes:
            self.file_hash = hashlib.sha256(content_bytes).hexdigest()
            self.file_size_bytes = len(content_bytes)
        elif self.file:
            hasher = hashlib.sha256()
            for chunk in self.file.chunks():
                hasher.update(chunk)
            self.file_hash = hasher.hexdigest()
            self.file_size_bytes = self.file.size
        return self.file_hash

    def __str__(self):
        return f"{self.title} ({self.get_document_type_display()})"


class DocumentPage(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='pages')
    page_number = models.PositiveIntegerField(default=1)
    image = models.ImageField(upload_to='document_pages/%Y/%m/', null=True, blank=True)
    ocr_text = models.TextField(blank=True, default='')
    ocr_confidence = models.FloatField(default=0.92)

    class Meta:
        ordering = ['page_number']

    def __str__(self):
        return f"{self.document.title} - Page {self.page_number}"


class DocumentFingerprint(models.Model):
    file_hash = models.CharField(max_length=64, unique=True, db_index=True)
    first_seen_document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True)
    first_seen_case_id = models.CharField(max_length=64, blank=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"SHA-256: {self.file_hash[:12]}... (Case: {self.first_seen_case_id})"


class ExtractedField(models.Model):
    STATUS_CHOICES = [
        ('auto', 'Auto-Extracted (স্বয়ংক্রিয়)'),
        ('corrected', 'Human Corrected (সংশোধিত)'),
        ('confirmed', 'Reviewer Confirmed (নিশ্চিতকৃত)'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='extracted_fields')
    page_number = models.PositiveIntegerField(default=1)
    field_key = models.CharField(max_length=64, db_index=True)
    field_label_bn = models.CharField(max_length=128)
    raw_value = models.TextField(blank=True, default='')
    normalized_value = models.TextField(blank=True, default='')
    confidence = models.FloatField(default=0.95)
    bounding_box = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='auto')
    corrected_value = models.TextField(blank=True, default='')
    corrected_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def effective_value(self):
        return self.corrected_value if self.status == 'corrected' and self.corrected_value else self.normalized_value or self.raw_value

    def __str__(self):
        return f"{self.field_label_bn}: {self.effective_value}"
