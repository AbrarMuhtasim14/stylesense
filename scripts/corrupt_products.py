"""
STEP 4 — Corrupt Products
Run after generate_embeddings.py
Swaps title+description for 25 products. Embeddings are NOT touched.
The vector truth stays intact. Only display text changes.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from supabase import create_client
from dotenv import load_dotenv
import os, random

load_dotenv()

SUPABASE_URL  = os.getenv("SUPABASE_URL")
SUPABASE_KEY  = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
CORRUPT_COUNT = int(os.getenv("CORRUPT_COUNT", "25"))

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def main():
    products = supabase.table("products").select("id, title, description, color, category").execute().data
    print(f"Total products: {len(products)}")

    # Pick 25 random products to corrupt
    corrupt_targets = random.sample(products, CORRUPT_COUNT)
    corrupt_ids = {p["id"] for p in corrupt_targets}

    # Build a pool of wrong titles+descriptions from non-corrupted products
    non_targets = [p for p in products if p["id"] not in corrupt_ids]

    print(f"Corrupting {CORRUPT_COUNT} products...")

    for i, target in enumerate(corrupt_targets):
        # Pick a completely different product as the source of wrong text
        # Avoid same category to maximize confusion
        different_cat = [
            p for p in non_targets
            if p["category"] != target["category"]
        ]
        source = random.choice(different_cat if different_cat else non_targets)

        print(f"\n[{i+1}/{CORRUPT_COUNT}]")
        print(f"  Real product  : {target['title']} ({target['category']}, {target['color']})")
        print(f"  Fake title    : {source['title']}")

        supabase.table("products").update({
            "title":        source["title"],
            "description":  source["description"],
            "is_corrupted": True,
            # visual_description and image_url are NOT changed
            # embeddings table is NOT touched
        }).eq("id", target["id"]).execute()

    print(f"\n✓ {CORRUPT_COUNT} products corrupted.")
    print("  Their images and embeddings are still correct.")
    print("  Only display title and description were swapped.")


if __name__ == "__main__":
    main()
