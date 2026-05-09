"""
STEP 1 — Seed Database
Run from Codespaces: python scripts/seed_database.py
Pulls 100 fashion products from HuggingFace, uploads images to Supabase, inserts product rows.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from datasets import load_dataset
from supabase import create_client
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
import os, uuid, random

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET       = os.getenv("SUPABASE_BUCKET", "product-images")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

CATEGORY_MAP = {
    "Shirts":    ("Apparel", "Topwear"),
    "Tshirts":   ("Apparel", "Topwear"),
    "Sweaters":  ("Apparel", "Topwear"),
    "Jeans":     ("Apparel", "Bottomwear"),
    "Casual Shoes": ("Footwear", "Shoes"),
    "Sneakers":  ("Footwear", "Shoes"),
    "Bags":      ("Accessories", "Bags"),
    "Dresses":   ("Apparel", "Dress"),
    "Jackets":   ("Apparel", "Topwear"),
    "Watches":   ("Accessories", "Watches"),
    "Sunglasses":("Accessories", "Eyewear"),
    "Kurtas":    ("Apparel", "Topwear"),
}

TARGET_PER_CATEGORY = 9   # ~10 per category across 10 categories = ~100
TARGET_CATEGORIES   = list(CATEGORY_MAP.keys())


def select_diverse_products(ds, target=100):
    """Select diverse products balanced by category."""
    selected = []
    counts = {cat: 0 for cat in TARGET_CATEGORIES}

    for item in ds:
        article = item.get("articleType", "")
        if article in counts and counts[article] < TARGET_PER_CATEGORY:
            selected.append(item)
            counts[article] += 1
        if len(selected) >= target:
            break

    print(f"Selected {len(selected)} products.")
    for cat, count in counts.items():
        print(f"  {cat}: {count}")
    return selected


def image_to_bytes(pil_image: Image.Image) -> bytes:
    buf = BytesIO()
    pil_image.convert("RGB").save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def upload_image(image_bytes: bytes, filename: str) -> str:
    path = f"products/{filename}"
    supabase.storage.from_(BUCKET).upload(
        path,
        image_bytes,
        file_options={"content-type": "image/jpeg"},
    )
    return supabase.storage.from_(BUCKET).get_public_url(path)


def estimate_price(article_type: str) -> float:
    price_ranges = {
        "Shirts": (399, 1499),
        "Tshirts": (299, 999),
        "Sweaters": (699, 2499),
        "Jeans": (999, 3499),
        "Casual Shoes": (799, 2999),
        "Sneakers": (1499, 4999),
        "Bags": (499, 2999),
        "Dresses": (799, 3499),
        "Jackets": (999, 4999),
        "Watches": (799, 5999),
        "Sunglasses": (399, 1999),
        "Kurtas": (399, 1499),
    }
    low, high = price_ranges.get(article_type, (499, 1999))
    return round(random.uniform(low, high) / 100) * 100


def main():
    print("Loading HuggingFace fashion dataset...")
    ds = load_dataset("ceyda/fashion-products-small", split="train")
    print(f"Dataset loaded: {len(ds)} items")

    products = select_diverse_products(ds)

    for i, item in enumerate(products):
        try:
            print(f"\n[{i+1}/{len(products)}] {item['productDisplayName']}")

            # Upload image
            img_bytes = image_to_bytes(item["image"])
            filename  = f"{uuid.uuid4().hex}.jpg"
            image_url = upload_image(img_bytes, filename)
            print(f"  Image uploaded: {image_url[:60]}...")

            cat, subcat = CATEGORY_MAP.get(item["articleType"], ("Apparel", "Other"))

            # Insert into DB (no description yet — step 2 handles that)
            row = supabase.table("products").insert({
                "title":        item["productDisplayName"],
                "description":  None,
                "price":        estimate_price(item["articleType"]),
                "category":     item["articleType"],
                "sub_category": subcat,
                "color":        item.get("baseColour", ""),
                "gender":       item.get("gender", "Unisex"),
                "season":       item.get("season", ""),
                "usage_type":   item.get("usage", ""),
                "image_url":    image_url,
                "is_corrupted": False,
                "original_name": item["productDisplayName"],
            }).execute()

            print(f"  Inserted product ID: {row.data[0]['id']}")

        except Exception as e:
            print(f"  ERROR: {e}")
            continue

    print(f"\n✓ Done. {len(products)} products seeded.")


if __name__ == "__main__":
    main()
