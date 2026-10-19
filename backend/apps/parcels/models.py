from django.db import models

class Parcel(models.Model):
    SURVEY_TYPES = [
        ('CS', 'Cadastral Survey (সিএস)'),
        ('SA', 'State Acquisition Survey (এসএ)'),
        ('RS', 'Revisional Survey (আরএস)'),
        ('BS', 'Bangladesh Survey (বিএস)'),
        ('BRS', 'BRS (বিআরএস)'),
        ('city', 'City Survey (সিটি জরিপ)'),
    ]

    mouza = models.CharField(max_length=128, db_index=True)
    jl_number = models.CharField(max_length=32, blank=True, default='')
    upazila = models.CharField(max_length=128, blank=True, default='')
    district = models.CharField(max_length=128, blank=True, default='')
    survey_type = models.CharField(max_length=16, choices=SURVEY_TYPES, blank=True, default='')
    dag_number = models.CharField(max_length=64, db_index=True)
    normalized_key = models.CharField(max_length=255, unique=True, db_index=True)
    recorded_area_decimals = models.FloatField(default=0.0)
    boundaries = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def generate_normalized_key(cls, district, upazila, mouza, survey_type, dag_number):
        import re
        def clean(s):
            return re.sub(r'[^a-zA-Z0-9\u0980-\u09FF]', '', str(s).strip().lower())
        return f"{clean(district)}_{clean(upazila)}_{clean(mouza)}_{clean(survey_type)}_{clean(dag_number)}"

    def save(self, *args, **kwargs):
        if not self.normalized_key:
            self.normalized_key = self.generate_normalized_key(
                self.district, self.upazila, self.mouza, self.survey_type, self.dag_number
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.mouza} | {self.survey_type} দাগ: {self.dag_number} ({self.recorded_area_decimals} শতাংশ)"


class KhatianRecord(models.Model):
    parcel = models.ForeignKey(Parcel, on_delete=models.CASCADE, related_name='khatians')
    khatian_number = models.CharField(max_length=64, db_index=True)
    survey_type = models.CharField(max_length=16, blank=True, default='')
    recorded_owner_name = models.CharField(max_length=255)
    recorded_area_decimals = models.FloatField(default=0.0)
    source_document = models.ForeignKey('documents.Document', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"খতিয়ান নং {self.khatian_number} ({self.recorded_owner_name})"


class MutationRecord(models.Model):
    parcel = models.ForeignKey(Parcel, on_delete=models.CASCADE, related_name='mutations')
    case_number = models.CharField(max_length=128, db_index=True)
    mutated_khatian_number = models.CharField(max_length=64)
    mutated_owner_name = models.CharField(max_length=255)
    dcr_number = models.CharField(max_length=64, blank=True, default='')
    mutation_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=32, default='approved')
    source_document = models.ForeignKey('documents.Document', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"নামজারি কেস {self.case_number} ({self.mutated_owner_name})"
