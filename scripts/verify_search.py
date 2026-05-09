"""
STEP 5 — Verify Search
Run after corrupt_products.py
Tests that corrupted products still surface when searched by their REAL attributes.
This is your proof the system works before the demo.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from supabase import create_client
import requests, numpy as np
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
CLIP_URL     = os.getenv("AMD_CLIP_URL")
BACKEND_URL  = os.getenv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:8000")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def search(query: str, top_k: int = 10) -> list:
    r = requests.post(
        f"{BACKEND_URL}/search/text",
        json={"query": query, "limit": top_k},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["results"]


def main():
    # Get corrupted products and their original names
    corrupted = supabase.table("products").select(
        "id, title, original_name, color, category"
    ).eq("is_corrupted", True).limit(5).execute().data

    print(f"Testing {len(corrupted)} corrupted products...\n")

    passed = 0
    for p in corrupted:
        real_query = f"{p['color']} {p['category']} {p['original_name'].split()[-1]}"
        print(f"Query: '{real_query}'")
        print(f"  Current (fake) title : {p['title']}")
        print(f"  Real product         : {p['original_name']}")

        results = search(real_query)
        result_ids = [r["id"] for r in results]

        if p["id"] in result_ids:
            rank = result_ids.index(p["id"]) + 1
            score = next(r["similarity_score"] for r in results if r["id"] == p["id"])
            print(f"  ✓ FOUND at rank #{rank} with score {score:.4f}")
            passed += 1
        else:
            print(f"  ✗ NOT FOUND in top {len(results)} results")
        print()

    print(f"Result: {passed}/{len(corrupted)} corrupted products surfaced correctly.")
    if passed == len(corrupted):
        print("✓ System working perfectly. Ready for demo.")
    else:
        print("⚠ Some products missing. Try increasing IMAGE_WEIGHT in .env (e.g. 0.7).")


if __name__ == "__main__":
    main()
