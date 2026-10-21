from typing import Optional
from django.db import models

class PersonOrParty(models.Model):
    id: int
    name = models.CharField(max_length=255)
    name_bn = models.CharField(max_length=255, blank=True, default='')
    father_or_husband_name = models.CharField(max_length=255, blank=True, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    party_type = models.CharField(max_length=32, default='individual')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name_bn or self.name


class DeedTransaction(models.Model):
    id: int
    seller_id: int
    buyer_id: int
    parcel_id: int
    source_document_id: Optional[int]

    deed_number = models.CharField(max_length=64, db_index=True)
    deed_date = models.DateField(null=True, blank=True)
    sub_registry_office = models.CharField(max_length=128, blank=True, default='')
    seller = models.ForeignKey(PersonOrParty, on_delete=models.CASCADE, related_name='sold_transactions')
    buyer = models.ForeignKey(PersonOrParty, on_delete=models.CASCADE, related_name='bought_transactions')
    parcel = models.ForeignKey('parcels.Parcel', on_delete=models.CASCADE, related_name='transactions')
    transferred_area_decimals = models.FloatField(default=0.0)
    prior_deed_reference = models.CharField(max_length=128, blank=True, default='')
    source_document = models.ForeignKey('documents.Document', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"দলিল নং {self.deed_number} ({self.seller} -> {self.buyer})"


class OwnershipEdge(models.Model):
    RELATION_TYPES = [
        ('TRANSFERS_TO', 'Transfers Ownership To (মালিকানা হস্তান্তর)'),
        ('SELLER_OF', 'Seller in Deed (বিক্রেতা)'),
        ('BUYER_OF', 'Buyer in Deed (ক্রেতা)'),
        ('REFERS_TO_PARCEL', 'Refers to Parcel (দাগের অন্তর্ভুক্ত)'),
        ('RECORDED_IN_KHATIAN', 'Recorded in Khatian (খতিয়ানভুক্ত)'),
        ('MUTATED_IN', 'Mutated in Record (নামজারিকৃত)'),
        ('CONFLICTS_WITH', 'Conflicts With (সন্দেহজনক বিরোধ)'),
    ]

    case = models.ForeignKey('cases.Case', on_delete=models.CASCADE, related_name='ownership_edges')
    source_node_type = models.CharField(max_length=32)
    source_node_id = models.CharField(max_length=128)
    source_node_label = models.CharField(max_length=255)
    target_node_type = models.CharField(max_length=32)
    target_node_id = models.CharField(max_length=128)
    target_node_label = models.CharField(max_length=255)
    relation_type = models.CharField(max_length=32, choices=RELATION_TYPES)
    is_conflict = models.BooleanField(default=False)
    conflict_reason = models.TextField(blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        flag = " [!] CONFLICT" if self.is_conflict else ""
        return f"{self.source_node_label} --[{self.relation_type}]--> {self.target_node_label}{flag}"
