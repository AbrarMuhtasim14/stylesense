"""
Shared utilities for seeding scripts.
"""
from PIL import Image
from io import BytesIO
import re


def image_to_bytes(pil_image: Image.Image, quality: int = 85) -> bytes:
    buf = BytesIO()
    pil_image.convert("RGB").save(buf, format="JPEG", quality=quality)
    return buf.getvalue()


def clean_text(text: str) -> str:
    """Remove extra whitespace and non-printable chars."""
    return re.sub(r"\s+", " ", text).strip()


def estimate_price(article_type: str) -> float:
    import random
    price_ranges = {
        "Shirts":       (399,  1499),
        "Tshirts":      (299,   999),
        "Sweaters":     (699,  2499),
        "Jeans":        (999,  3499),
        "Casual Shoes": (799,  2999),
        "Sneakers":    (1499,  4999),
        "Bags":         (499,  2999),
        "Dresses":      (799,  3499),
        "Jackets":      (999,  4999),
        "Watches":      (799,  5999),
        "Sunglasses":   (399,  1999),
        "Kurtas":       (399,  1499),
    }
    low, high = price_ranges.get(article_type, (499, 1999))
    return round(random.uniform(low, high) / 100) * 100
