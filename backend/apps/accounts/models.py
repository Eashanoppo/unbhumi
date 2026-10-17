from django.db import models
from django.contrib.auth.models import User
import secrets

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('demo_reviewer', 'Land Document Reviewer (দলিল পরীক্ষক)'),
        ('demo_supervisor', 'Supervisor / Sub-Registrar (তত্ত্বাবধায়ক)'),
        ('demo_admin', 'System Administrator (সিস্টেম অ্যাডমিন)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default='demo_reviewer')
    full_name_bn = models.CharField(max_length=128, blank=True, default='')
    organization = models.CharField(max_length=255, blank=True, default='Ministry of Land (Demo / পরীক্ষামূলক)')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class DemoToken(models.Model):
    key = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='demo_tokens')
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def generate_token_for_user(cls, user):
        token_key = secrets.token_hex(24)
        token = cls.objects.create(key=token_key, user=user)
        return token

