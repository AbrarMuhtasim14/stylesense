"""
STEP 1 — Seed Database
Run from Codespaces:
    python scripts/seed_database.py

Loads products from HuggingFace dataset,
uploads images to Supabase Storage,
and inserts rows into the products table.
"""

import sys
import os
import uuid
import random

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from datasets import load_dataset
from supabase import create_client
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET", "product-images")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Target categories from the REAL dataset schema
TARGET_SUBCATEGORIES = [
    "Topwear",
    "Bottomwear",
    "Shoes",
    "Bags",
    "Dress",
    "Watches",
    "Eyewear",
]

PRODUCTS_TOTAL = 100


def select_diverse_products(ds, target=100):
    """
    Select balanced products across subcategories.
    """
    selected = []

    counts = {cat: 0 for cat in TARGET_SUBCATEGORIES}
    per_category = max(1, target // len(TARGET_SUBCATEGORIES))

    for item in ds:
        subcat = item.get("subCategory", "")

        if subcat in counts and counts[subcat] < per_category:
            selected.append(item)
            counts[subcat] += 1

        if len(selected) >= target:
            break

    print(f"Selected {len(selected)} products.")
    for cat, count in counts.items():
        print(f"  {cat}: {count}")

    return selected


def image_to_bytes(pil_image: Image.Image) -> bytes:
    """
    Convert PIL image to compressed JPEG bytes.
    """
    buf = BytesIO()

    pil_image.convert("RGB").save(
        buf,
        format="JPEG",
        quality=85,
    )

    return buf.getvalue()


def upload_image(image_bytes: bytes, filename: str) -> str:
    """
    Upload image to Supabase Storage and return public URL.
    """
    path = f"products/{filename}"

    supabase.storage.from_(BUCKET).upload(
        path,
        image_bytes,
        file_options={"content-type": "image/jpeg"},
    )

    return supabase.storage.from_(BUCKET).get_public_url(path)


def estimate_price(subcategory: str) -> float:
    """
    Generate realistic mock prices.
    """
    price_ranges = {
        "Topwear": (499, 1999),
        "Bottomwear": (799, 2999),
        "Shoes": (1499, 4999),
        "Bags": (999, 3999),
        "Dress": (1299, 4999),
        "Watches": (1999, 7999),
        "Eyewear": (799, 2999),
    }

    low, high = price_ranges.get(subcategory, (499, 1999))

    return round(random.uniform(low, high) / 100) * 100


def main():
    print("Loading HuggingFace fashion dataset...")

    dataset = load_dataset(
        "ceyda/fashion-products-small",
        split="train",
    )

    print(f"Dataset loaded: {len(dataset)} items")

    products = select_diverse_products(
        dataset,
        target=PRODUCTS_TOTAL,
    )

    inserted = 0
    failed = 0

    for i, item in enumerate(products):
        try:
            title = f"{item['gender']} {item['subCategory']}"

            print(f"\n[{i+1}/{len(products)}] {title}")

            # Convert image
            image = item["image"]
            image_bytes = image_to_bytes(image)

            # Upload image
            filename = f"{uuid.uuid4().hex}.jpg"

            image_url = upload_image(
                image_bytes,
                filename,
            )

            print(f"  Image uploaded")

            # Insert into DB
            response = supabase.table("products").insert({
                "title": title,
                "description": None,
                "visual_description": None,
                "price": estimate_price(item["subCategory"]),
                "category": item["masterCategory"],
                "sub_category": item["subCategory"],
                "color": "Unknown",
                "gender": item.get("gender", "Unisex"),
                "season": "",
                "usage_type": "",
                "image_url": image_url,
                "is_corrupted": False,
                "original_name": title,
            }).execute()

            product_id = response.data[0]["id"]

            print(f"  ✓ Inserted product ID: {product_id}")

            inserted += 1

        except Exception as e:
            failed += 1
            print(f"  ✗ ERROR: {e}")

    print("\n========================================")
    print("Seeding Complete")
    print("========================================")
    print(f"Inserted: {inserted}")
    print(f"Failed:   {failed}")


if __name__ == "__main__":
    main()