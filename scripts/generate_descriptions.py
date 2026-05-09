"""
STEP 2 — Generate Descriptions
Run after seed_database.py
Calls Qwen2.5-72B on AMD to write product descriptions.
Calls Qwen-VL on AMD to write visual descriptions from product images.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from supabase import create_client
from openai import OpenAI
from dotenv import load_dotenv
import os, time

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
AMD_AGENT    = os.getenv("AMD_AGENT_URL")
AMD_VISION   = os.getenv("AMD_VISION_URL")
API_KEY      = os.getenv("AMD_VLLM_API_KEY", "token-amd-hackathon")
MODEL_AGENT  = os.getenv("MODEL_AGENT")
MODEL_VISION = os.getenv("MODEL_VISION")

supabase     = create_client(SUPABASE_URL, SUPABASE_KEY)
agent_client = OpenAI(base_url=AMD_AGENT,  api_key=API_KEY)
vision_client= OpenAI(base_url=AMD_VISION, api_key=API_KEY)


def generate_description(name, color, category, season, usage):
    r = agent_client.chat.completions.create(
        model=MODEL_AGENT,
        messages=[{"role": "user", "content":
            f"Write a 3-sentence e-commerce product description.\n"
            f"Name: {name}\nColor: {color}\nCategory: {category}\n"
            f"Season: {season}\nUsage: {usage}\n"
            f"Tone: friendly and helpful. Focus on style, comfort, versatility. "
            f"Return only the description."
        }],
        max_tokens=150,
        temperature=0.7,
    )
    return r.choices[0].message.content.strip()


def generate_visual_description(image_url):
    r = vision_client.chat.completions.create(
        model=MODEL_VISION,
        messages=[{"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": image_url}},
            {"type": "text", "text":
                "Describe this product image in 2 sentences. Include: "
                "exact color, clothing type, texture, neckline/style, fit. "
                "Be precise. Return only the description."
            },
        ]}],
        max_tokens=120,
        temperature=0.1,
    )
    return r.choices[0].message.content.strip()


def main():
    # Get all products missing descriptions
    products = supabase.table("products").select("*").is_("description", "null").execute().data
    print(f"Found {len(products)} products needing descriptions.")

    for i, p in enumerate(products):
        try:
            print(f"\n[{i+1}/{len(products)}] {p['title']}")

            desc = generate_description(
                p["title"], p["color"], p["category"],
                p.get("season",""), p.get("usage_type","")
            )
            print(f"  Description: {desc[:60]}...")

            visual = generate_visual_description(p["image_url"])
            print(f"  Visual: {visual[:60]}...")

            supabase.table("products").update({
                "description": desc,
                "visual_description": visual,
            }).eq("id", p["id"]).execute()

            time.sleep(0.5)  # gentle rate limiting

        except Exception as e:
            print(f"  ERROR: {e}")
            continue

    print("\n✓ All descriptions generated.")


if __name__ == "__main__":
    main()
