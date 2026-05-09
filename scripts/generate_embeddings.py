"""
STEP 3 — Generate Embeddings
Run after generate_descriptions.py
Calls CLIP on AMD for all 100 products, stores 512-dim vectors in pgvector.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from supabase import create_client
import requests, numpy as np
from dotenv import load_dotenv
import os, time

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
CLIP_URL     = os.getenv("AMD_CLIP_URL")
IMG_WEIGHT   = float(os.getenv("IMAGE_WEIGHT", "0.6"))
TXT_WEIGHT   = float(os.getenv("TEXT_WEIGHT", "0.4"))

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def embed_image(image_url):
    r = requests.post(f"{CLIP_URL}/embed/image", json={"image_url": image_url}, timeout=30)
    r.raise_for_status()
    return np.array(r.json()["embedding"])


def embed_text(text):
    r = requests.post(f"{CLIP_URL}/embed/text", json={"text": text}, timeout=30)
    r.raise_for_status()
    return np.array(r.json()["embedding"])


def combine(img_emb, txt_emb):
    combined = IMG_WEIGHT * img_emb + TXT_WEIGHT * txt_emb
    combined = combined / (np.linalg.norm(combined) + 1e-8)
    return combined


def main():
    # Get products that don't have embeddings yet
    all_products = supabase.table("products").select("id, title, image_url, visual_description, color, category").execute().data
    existing_ids = {
        row["product_id"]
        for row in supabase.table("product_embeddings").select("product_id").execute().data
    }
    products = [p for p in all_products if p["id"] not in existing_ids]
    print(f"Generating embeddings for {len(products)} products...")

    for i, p in enumerate(products):
        try:
            print(f"\n[{i+1}/{len(products)}] {p['title']}")

            # Build search text from visual_description (truth) not title
            visual_text = p.get("visual_description") or p["title"]
            search_text = f"{visual_text} {p['color']} {p['category']}"

            img_emb  = embed_image(p["image_url"])
            txt_emb  = embed_text(search_text)
            combined = combine(img_emb, txt_emb)

            supabase.table("product_embeddings").insert({
                "product_id":         p["id"],
                "visual_embedding":   img_emb.tolist(),
                "text_embedding":     txt_emb.tolist(),
                "combined_embedding": combined.tolist(),
            }).execute()

            print(f"  ✓ Embedding stored")
            time.sleep(0.2)

        except Exception as e:
            print(f"  ERROR: {e}")
            continue

    print(f"\n✓ Done. Embeddings generated for {len(products)} products.")


if __name__ == "__main__":
    main()
