"""
Secure Storage & File Validation Service for UNBUmi Detector.
Validates file sizes, extensions, MIME types, and magic bytes.
Stores files with randomized UUID keys in private storage paths.
"""

import os
import uuid
import hashlib
from pathlib import Path
from django.conf import settings
from django.core.exceptions import ValidationError

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {'.pdf', '.png', '.jpg', '.jpeg'}

MAGIC_SIGNATURES = {
    'pdf': b'%PDF',
    'png': b'\x89PNG\r\n\x1a\n',
    'jpeg': b'\xFF\xD8\xFF',
}

def validate_file_upload(file_obj):
    """
    Validates an uploaded file object:
    - Size within limits (max 15MB)
    - Allowed extension (.pdf, .png, .jpg, .jpeg)
    - Valid magic bytes / file header signature
    """
    if not file_obj:
        raise ValidationError("কোনো ফাইল পাওয়া যায়নি (No file provided).")

    # 1. Size check
    file_size = getattr(file_obj, 'size', None)
    if file_size is None:
        try:
            file_obj.seek(0, os.SEEK_END)
            file_size = file_obj.tell()
            file_obj.seek(0)
        except Exception:
            file_size = 0

    if file_size <= 0:
        raise ValidationError("ফাইলটি খালি বা অকার্যকর (Uploaded file is empty).")

    if file_size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            f"ফাইলের আকার অনুমোদিত ১৫ মেগাবাইট সীমা অতিক্রম করেছে (File size {file_size / (1024*1024):.1f}MB exceeds 15MB limit)."
        )

    # 2. Extension check
    name = getattr(file_obj, 'name', '')
    ext = Path(name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f"অননুমোদিত ফাইল ফরম্যাট: '{ext}'। শুধুমাত্র PDF, PNG, JPG ফাইল গ্রহণযোগ্য (Unsupported file format)."
        )

    # 3. Magic byte inspection
    initial_bytes = b''
    try:
        initial_bytes = file_obj.read(16)
        file_obj.seek(0)
    except Exception as e:
        raise ValidationError(f"ফাইল পড়তে ব্যর্থ (Unable to read file header): {str(e)}")

    is_valid_magic = False
    if ext == '.pdf' and initial_bytes.startswith(MAGIC_SIGNATURES['pdf']):
        is_valid_magic = True
    elif ext == '.png' and initial_bytes.startswith(MAGIC_SIGNATURES['png'][:4]):
        is_valid_magic = True
    elif ext in ('.jpg', '.jpeg') and initial_bytes.startswith(MAGIC_SIGNATURES['jpeg'][:2]):
        is_valid_magic = True

    if not is_valid_magic:
        raise ValidationError(
            f"ফাইলের অভ্যন্তরীণ সিগনেচার সম্প্রসারণের ({ext}) সাথে মিলছে না (File signature does not match extension)."
        )

    return {
        'name': name,
        'extension': ext,
        'size_bytes': file_size,
    }


def compute_sha256(file_obj):
    """Computes SHA-256 hash of a file-like object and resets stream position."""
    hasher = hashlib.sha256()
    try:
        file_obj.seek(0)
        for chunk in file_obj.chunks() if hasattr(file_obj, 'chunks') else iter(lambda: file_obj.read(65536), b''):
            hasher.update(chunk)
        file_obj.seek(0)
    except Exception:
        pass
    return hasher.hexdigest()


def generate_secure_storage_path(filename, subfolder='documents/private'):
    """Generates a UUID-randomized storage path preserving only the safe extension."""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = '.bin'
    random_key = uuid.uuid4().hex
    return f"{subfolder}/{random_key[:2]}/{random_key}{ext}"
