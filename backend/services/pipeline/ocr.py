"""
Modular OCR and Document Extraction Engine for UNBhumi LandGuard.
Supports digital PDFs via pdfplumber, scanned PDFs via pypdfium2 at 300 DPI,
pixel-level preprocessing, and real Bengali + English OCR via Tesseract.
"""

import io
import os
import re
import shutil
import logging
import unicodedata
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance
import pdfplumber

logger = logging.getLogger(__name__)

# Try importing pypdfium2
try:
    import pypdfium2 as pdfium
    HAS_PYPDFIUM2 = True
except ImportError:
    HAS_PYPDFIUM2 = False

# Try importing pytesseract
try:
    import pytesseract
    HAS_PYTESSERACT = True
except ImportError:
    HAS_PYTESSERACT = False


def find_tesseract_binary() -> Optional[str]:
    """Auto-detects the tesseract binary on Windows and Linux/container environments."""
    # 1. Environment variable or Django settings override
    env_cmd = os.environ.get('TESSERACT_CMD')
    if env_cmd and os.path.exists(env_cmd):
        return env_cmd

    # 2. Check system PATH
    which_cmd = shutil.which('tesseract')
    if which_cmd:
        return which_cmd

    # 3. Known Windows standard install paths
    win_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expanduser(r"~\AppData\Local\Tesseract-OCR\tesseract.exe"),
        os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
    ]
    for p in win_paths:
        if os.path.exists(p):
            return p

    # 4. Standard Linux paths
    linux_paths = ["/usr/bin/tesseract", "/usr/local/bin/tesseract"]
    for p in linux_paths:
        if os.path.exists(p):
            return p

    return None


def setup_tessdata_prefix() -> Optional[str]:
    """Auto-detects and configures TESSDATA_PREFIX to locate Bengali & English models."""
    existing = os.environ.get('TESSDATA_PREFIX')
    if existing and os.path.exists(existing):
        if os.path.exists(os.path.join(existing, 'ben.traineddata')) or os.path.exists(os.path.join(existing, 'Bengali.traineddata')):
            return existing

    # Project local tessdata directory (backend/tessdata)
    project_tessdata = Path(__file__).resolve().parent.parent.parent / 'tessdata'
    if project_tessdata.exists() and (project_tessdata / 'ben.traineddata').exists():
        os.environ['TESSDATA_PREFIX'] = str(project_tessdata)
        return str(project_tessdata)

    standard_paths = [
        r"C:\Program Files\Tesseract-OCR\tessdata",
        r"C:\Program Files (x86)\Tesseract-OCR\tessdata",
        os.path.expanduser(r"~\AppData\Local\Tesseract-OCR\tessdata"),
        "/usr/share/tesseract-ocr/5/tessdata",
        "/usr/share/tesseract-ocr/4.00/tessdata",
        "/usr/share/tessdata",
    ]
    for p in standard_paths:
        if os.path.exists(p) and (os.path.exists(os.path.join(p, 'ben.traineddata')) or os.path.exists(os.path.join(p, 'Bengali.traineddata'))):
            os.environ['TESSDATA_PREFIX'] = p
            return p

    return existing


# Initialize tessdata prefix on load
setup_tessdata_prefix()


class BaseOCRProvider:
    """Abstract interface for Optical Character Recognition providers."""
    def extract_image(self, image: Image.Image) -> Dict[str, Any]:
        raise NotImplementedError

    def is_available(self) -> bool:
        raise NotImplementedError


class ImagePreprocessor:
    """Applies safe image enhancements to improve OCR accuracy on scanned land records."""
    @staticmethod
    def preprocess(image: Image.Image) -> Image.Image:
        try:
            # 1. Correct EXIF orientation
            image = ImageOps.exif_transpose(image)
        except Exception:
            pass

        # 2. Convert palette or RGBA to RGB
        if image.mode in ('RGBA', 'LA', 'P'):
            bg = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            bg.paste(image, mask=image.split()[-1] if 'A' in image.mode else None)
            image = bg
        elif image.mode != 'RGB':
            image = image.convert('RGB')

        # 3. Scale up low-resolution images for OCR legibility
        w, h = image.size
        min_dim = min(w, h)
        if min_dim < 1200:
            scale_factor = 1200.0 / min_dim
            new_w = int(w * scale_factor)
            new_h = int(h * scale_factor)
            image = image.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # 4. Enhance contrast for faint stamps and ink
        try:
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.25)
        except Exception:
            pass

        return image


class TesseractOCRProvider(BaseOCRProvider):
    """
    Real local Tesseract OCR engine supporting Bengali (script/Bengali, ben) and English.
    Provides genuine character-level confidence, word bounding boxes, and engine provenance.
    """
    def __init__(self, tesseract_cmd: Optional[str] = None, lang: Optional[str] = None):
        setup_tessdata_prefix()
        self.cmd = tesseract_cmd or find_tesseract_binary()
        if self.cmd and HAS_PYTESSERACT:
            pytesseract.pytesseract.tesseract_cmd = self.cmd
        self.lang = lang or self._detect_best_language()
        self.version = self._get_version()

    def _get_version(self) -> str:
        if not self.cmd or not HAS_PYTESSERACT:
            return "unavailable"
        try:
            v = pytesseract.get_tesseract_version()
            return str(v)
        except Exception:
            return "tesseract-unknown"

    def _detect_best_language(self) -> str:
        """Determines whether ben+eng, script/Bengali, or eng is installed."""
        if not self.cmd or not HAS_PYTESSERACT:
            return "eng"
        try:
            setup_tessdata_prefix()
            langs = pytesseract.get_languages()
            # Prioritize Bengali + English
            if 'ben' in langs and 'eng' in langs:
                return 'ben+eng'
            if 'Bengali' in langs and 'eng' in langs:
                return 'Bengali+eng'
            if 'script/Bengali' in langs or r'script\Bengali' in langs:
                return 'script/Bengali+eng'
            if 'ben' in langs:
                return 'ben'
            if 'Bengali' in langs:
                return 'Bengali'
            if 'eng' in langs:
                return 'eng'
        except Exception:
            pass
        return 'ben+eng'

    def is_available(self) -> bool:
        return bool(self.cmd and os.path.exists(self.cmd) and HAS_PYTESSERACT)

    def extract_image(self, image: Image.Image) -> Dict[str, Any]:
        """
        Executes genuine OCR on a PIL Image:
        Returns:
            {
                'text': str,
                'confidence': float (0.0 to 1.0),
                'words_count': int,
                'bounding_boxes': list of {word, conf, x, y, w, h},
                'engine': 'tesseract',
                'engine_version': str,
                'language': str
            }
        """
        if not self.is_available():
            w, h = image.size
            return {
                'text': f"[OCR ইঞ্জিন অনুপস্থিত: Tesseract ইনস্টল করা নেই / Tesseract binary not found. নথির আকার: {w}x{h}]",
                'confidence': 0.0,
                'words_count': 0,
                'bounding_boxes': [],
                'engine': 'none',
                'engine_version': 'none',
                'language': self.lang,
                'status': 'provider_unavailable'
            }

        prep_img = ImagePreprocessor.preprocess(image)
        w, h = prep_img.size

        setup_tessdata_prefix()

        try:
            # 1. Extract full text
            raw_text = pytesseract.image_to_string(prep_img, lang=self.lang)

            # 2. Extract word-level data and genuine confidence
            data = pytesseract.image_to_data(prep_img, lang=self.lang, output_type=pytesseract.Output.DICT)
            
            words_count = 0
            valid_confs = []
            bboxes = []

            n_boxes = len(data.get('text', []))
            for i in range(n_boxes):
                w_text = data['text'][i].strip()
                c = float(data['conf'][i])
                if w_text and c > 0:
                    words_count += 1
                    valid_confs.append(c)
                    bboxes.append({
                        'word': w_text,
                        'confidence': round(c / 100.0, 3),
                        'x': int(data['left'][i]),
                        'y': int(data['top'][i]),
                        'w': int(data['width'][i]),
                        'h': int(data['height'][i])
                    })

            # Calculate genuine average confidence
            if valid_confs:
                avg_conf = sum(valid_confs) / len(valid_confs) / 100.0
            else:
                avg_conf = 0.50 if raw_text.strip() else 0.20

            return {
                'text': raw_text.strip(),
                'confidence': round(avg_conf, 3),
                'words_count': words_count,
                'bounding_boxes': bboxes,
                'engine': 'tesseract',
                'engine_version': self.version,
                'language': self.lang,
                'width': float(w),
                'height': float(h),
                'status': 'success'
            }

        except Exception as e:
            logger.warning(f"Tesseract OCR failed: {str(e)}")
            return {
                'text': f"[OCR পাঠোদ্ধারে ব্যর্থ / OCR Execution Error: {str(e)}]",
                'confidence': 0.10,
                'words_count': 0,
                'bounding_boxes': [],
                'engine': 'tesseract',
                'engine_version': self.version,
                'language': self.lang,
                'width': float(w),
                'height': float(h),
                'status': 'error',
                'error_detail': str(e)
            }


class PDFPageRenderer:
    """
    Renders PDF pages to 300 DPI PIL images using pypdfium2.
    Safe bounded execution, page count caps, and memory cleanup.
    """
    MAX_PAGES_DEFAULT = 50
    DEFAULT_DPI = 300

    @classmethod
    def render_pdf(cls, file_bytes_or_path, max_pages: int = MAX_PAGES_DEFAULT, dpi: int = DEFAULT_DPI) -> List[Tuple[int, Image.Image]]:
        """
        Renders PDF pages to list of (page_num, PIL.Image).
        """
        if not HAS_PYPDFIUM2:
            return []

        rendered = []
        doc = None
        try:
            if isinstance(file_bytes_or_path, (bytes, bytearray)):
                doc = pdfium.PdfDocument(io.BytesIO(file_bytes_or_path))
            else:
                doc = pdfium.PdfDocument(str(file_bytes_or_path))

            total_pages = min(len(doc), max_pages)
            scale = dpi / 72.0  # Standard PDF resolution is 72 points per inch

            for idx in range(total_pages):
                page = doc[idx]
                bitmap = page.render(scale=scale)
                pil_image = bitmap.to_pil()
                try:
                    bitmap.close()
                except Exception:
                    pass
                try:
                    page.close()
                except Exception:
                    pass
                rendered.append((idx + 1, pil_image))

        except Exception as e:
            logger.warning(f"PDF page rendering failed: {str(e)}")
        finally:
            if doc:
                try:
                    doc.close()
                except Exception:
                    pass

        return rendered

    @classmethod
    def render_single_page(cls, file_bytes_or_path, page_idx: int, dpi: int = DEFAULT_DPI) -> Optional[Image.Image]:
        """
        Renders a single PDF page (0-indexed) at target DPI in ~60ms without re-rendering prior pages.
        """
        if not HAS_PYPDFIUM2:
            return None

        doc = None
        should_close = False
        try:
            if HAS_PYPDFIUM2 and isinstance(file_bytes_or_path, pdfium.PdfDocument):
                doc = file_bytes_or_path
                should_close = False
            elif isinstance(file_bytes_or_path, (bytes, bytearray)):
                doc = pdfium.PdfDocument(io.BytesIO(file_bytes_or_path))
                should_close = True
            else:
                doc = pdfium.PdfDocument(str(file_bytes_or_path))
                should_close = True

            if page_idx < 0 or page_idx >= len(doc):
                return None

            scale = dpi / 72.0
            page = doc[page_idx]
            bitmap = page.render(scale=scale)
            pil_image = bitmap.to_pil()
            try:
                bitmap.close()
            except Exception:
                pass
            try:
                page.close()
            except Exception:
                pass
            return pil_image
        except Exception as e:
            logger.warning(f"Error rendering single PDF page {page_idx}: {e}")
            return None
        finally:
            if should_close and doc:
                try:
                    doc.close()
                except Exception:
                    pass


class DigitalPDFExtractor:
    """
    Extracts text, word coordinates, and character metrics from digital PDFs via pdfplumber.
    Identifies whether pages contain genuine clean text streams, or corrupted legacy font encodings.
    """
    @staticmethod
    def is_corrupted_digital_stream(text: str) -> bool:
        """
        Detects if PDF embedded digital text suffers from broken font encodings,
        inverted Bengali vowel signs (e.g. \u09BF before consonant),
        decomposed rephs (\u09B0\u09CD after consonant), inverted ya-phala,
        or collapsed word spacing.
        """
        if not text or len(text.strip()) < 10:
            return False

        # 1. Broken Bengali vowel signs (e.g. \u09BF or \u09C7 starting a token or preceding consonant)
        if re.search(r'(?:^|[\s\(\[\{])[\u09BF\u09C7\u09C8\u09C1\u09C2\u09C3\u09CD][\u0995-\u09B9]', text):
            return True

        # 2. Inverted Reph: consonant + \u09B0\u09CD (e.g. স্মাটর্)
        if re.search(r'[\u0995-\u09B9]\u09B0\u09CD(?:[\s\n\.,\)\],]|$)', text):
            return True

        # 3. Inverted ya-phala: \u09AF\u09CD (e.g. লয্ান্ড or বয্বহার)
        if '\u09AF\u09CD' in text:
            return True

        # 4. Long unspaced tokens (e.g. LandTechSoftwareforSmartE-GovernanceinBangladesh)
        tokens = text.split()
        long_tokens = [w for w in tokens if len(w) > 28 and not w.startswith(('http', 'www', 'data:', 'file:'))]
        if len(long_tokens) >= 2:
            return True

        return False

    @classmethod
    def extract_page(cls, page) -> Dict[str, Any]:
        raw_text = page.extract_text() or ''
        words = page.extract_words() or []
        char_count = len(raw_text.strip())
        is_corrupt = cls.is_corrupted_digital_stream(raw_text)

        bboxes = []
        for w in words:
            bboxes.append({
                'word': w.get('text', ''),
                'confidence': 0.95,
                'x': int(w.get('x0', 0)),
                'y': int(w.get('top', 0)),
                'w': int(w.get('x1', 0) - w.get('x0', 0)),
                'h': int(w.get('bottom', 0) - w.get('top', 0))
            })

        # Calculate calibrated digital confidence
        if is_corrupt:
            confidence = 0.30  # Corrupted font encoding; must fallback to visual OCR
            is_digital = False
        elif char_count > 100:
            confidence = 0.95
            is_digital = True
        elif char_count > 20:
            confidence = 0.85
            is_digital = True
        elif char_count > 0:
            confidence = 0.65
            is_digital = False
        else:
            confidence = 0.0  # Zero embedded text; requires scanned OCR
            is_digital = False

        return {
            'text': raw_text.strip(),
            'words_count': len(words),
            'confidence': confidence,
            'bounding_boxes': bboxes,
            'char_count': char_count,
            'is_digital': is_digital,
            'is_corrupted': is_corrupt,
            'width': float(page.width),
            'height': float(page.height)
        }


class OCRRouter:
    """
    Intelligent document router:
    1. Inspects file type (PDF vs Image).
    2. For PDFs: tries digital extraction via pdfplumber page by page.
    3. If digital text layer is absent or corrupted (legacy fonts with broken vowels/spacing), renders page at 300 DPI via pypdfium2 and runs Tesseract OCR.
    4. For Images (PNG, JPG): preprocesses pixels and runs real Tesseract OCR.
    5. Returns unified page-by-page extraction output with genuine confidence and provenance.
    """
    def __init__(self, ocr_provider: Optional[BaseOCRProvider] = None):
        self.ocr_provider = ocr_provider or TesseractOCRProvider()

    def process(self, file_path_or_bytes, is_pdf: bool, max_pages: Optional[int] = None) -> List[Dict[str, Any]]:
        if is_pdf:
            return self._process_pdf(file_path_or_bytes, max_pages=max_pages)
        else:
            return self._process_image(file_path_or_bytes)

    def _process_pdf(self, target, max_pages: Optional[int] = None) -> List[Dict[str, Any]]:
        pages_data = []
        pdfium_doc = None
        if HAS_PYPDFIUM2:
            try:
                if isinstance(target, (bytes, bytearray)):
                    pdfium_doc = pdfium.PdfDocument(io.BytesIO(target))
                else:
                    pdfium_doc = pdfium.PdfDocument(str(target))
            except Exception:
                pass

        try:
            if isinstance(target, (bytes, bytearray)):
                f_stream = io.BytesIO(target)
                pdf = pdfplumber.open(f_stream)
            else:
                pdf = pdfplumber.open(str(target))

            with pdf:
                total_to_process = min(len(pdf.pages), max_pages) if max_pages else len(pdf.pages)
                for idx in range(1, total_to_process + 1):
                    page = pdf.pages[idx - 1]
                    digital_res = DigitalPDFExtractor.extract_page(page)

                    if digital_res['is_digital']:
                        # Page has verified high-quality, uncorrupted embedded text
                        pages_data.append({
                            'page_number': idx,
                            'text': digital_res['text'],
                            'confidence': digital_res['confidence'],
                            'words_count': digital_res['words_count'],
                            'bounding_boxes': digital_res['bounding_boxes'],
                            'width': digital_res['width'],
                            'height': digital_res['height'],
                            'extraction_type': 'digital_text_stream',
                            'engine': 'pdfplumber'
                        })
                    else:
                        # Scanned image embedded inside PDF OR corrupted digital font encoding;
                        # Render page at 300 DPI and run genuine Tesseract OCR (ben+eng)
                        render_source = pdfium_doc if pdfium_doc else target
                        rendered_img = PDFPageRenderer.render_single_page(render_source, page_idx=idx - 1, dpi=300)

                        if rendered_img and self.ocr_provider.is_available():
                            ocr_res = self.ocr_provider.extract_image(rendered_img)
                            pages_data.append({
                                'page_number': idx,
                                'text': ocr_res['text'],
                                'confidence': ocr_res['confidence'],
                                'words_count': ocr_res['words_count'],
                                'bounding_boxes': ocr_res['bounding_boxes'],
                                'width': float(rendered_img.width),
                                'height': float(rendered_img.height),
                                'extraction_type': 'scanned_ocr_300dpi' if not digital_res.get('is_corrupted') else 'visual_ocr_repaired',
                                'engine': ocr_res['engine'],
                                'engine_version': ocr_res['engine_version']
                            })
                        else:
                            # Fallback if renderer or OCR is unavailable
                            pages_data.append({
                                'page_number': idx,
                                'text': digital_res['text'] or "[স্ক্যানকৃত পাতা: ওসিআর প্রক্রিয়াকরণ প্রয়োজন / Scanned Page Requires OCR]",
                                'confidence': 0.45,
                                'words_count': digital_res['words_count'],
                                'bounding_boxes': [],
                                'width': digital_res['width'],
                                'height': digital_res['height'],
                                'extraction_type': 'scanned_placeholder',
                                'engine': 'unextracted'
                            })

        except Exception as e:
            logger.error(f"Error parsing PDF: {str(e)}")
            pages_data.append({
                'page_number': 1,
                'text': f"[PDF পাঠোদ্ধারে ত্রুটি / Parser Error: {str(e)}]",
                'confidence': 0.20,
                'words_count': 0,
                'bounding_boxes': [],
                'width': 612.0,
                'height': 792.0,
                'extraction_type': 'error',
                'engine': 'none'
            })
        finally:
            if pdfium_doc:
                try:
                    pdfium_doc.close()
                except Exception:
                    pass

        return pages_data

    def _process_image(self, target) -> List[Dict[str, Any]]:
        try:
            if isinstance(target, (bytes, bytearray)):
                img = Image.open(io.BytesIO(target))
            else:
                img = Image.open(str(target))

            if self.ocr_provider.is_available():
                ocr_res = self.ocr_provider.extract_image(img)
                return [{
                    'page_number': 1,
                    'text': ocr_res['text'],
                    'confidence': ocr_res['confidence'],
                    'words_count': ocr_res['words_count'],
                    'bounding_boxes': ocr_res['bounding_boxes'],
                    'width': ocr_res['width'],
                    'height': ocr_res['height'],
                    'extraction_type': 'image_ocr',
                    'engine': ocr_res['engine'],
                    'engine_version': ocr_res['engine_version']
                }]
            else:
                w, h = img.size
                return [{
                    'page_number': 1,
                    'text': f"[স্ক্যানকৃত চিত্র নথি: রেজোলিউশন {w}x{h} পিক্সেল। হস্তলিপি/সিল নিরীক্ষা ও ফিল্ড রিভিউ আবশ্যক।]",
                    'confidence': 0.50,
                    'words_count': 0,
                    'bounding_boxes': [],
                    'width': float(w),
                    'height': float(h),
                    'extraction_type': 'image_stub',
                    'engine': 'none'
                }]
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            return [{
                'page_number': 1,
                'text': f"[চিত্র লোড করতে ব্যর্থ / Image Load Failed: {str(e)}]",
                'confidence': 0.15,
                'words_count': 0,
                'bounding_boxes': [],
                'width': 0.0,
                'height': 0.0,
                'extraction_type': 'error',
                'engine': 'none'
            }]
