from db.supabase_client import supabase
from config import settings
import json


def get_all_products(limit: int = 100, offset: int = 0):
    res = (
        supabase.table("products")
        .select("*")
        .range(offset, offset + limit - 1)
        .execute()
    )
    return res.data


def get_product_by_id(product_id: str):
    res = supabase.table("products").select("*").eq("id", product_id).single().execute()
    return res.data


def insert_product(data: dict):
    res = supabase.table("products").insert(data).execute()
    return res.data[0]


def update_product(product_id: str, data: dict):
    res = supabase.table("products").update(data).eq("id", product_id).execute()
    return res.data[0]


def insert_embedding(product_id: str, visual: list, text: list, combined: list):
    res = supabase.table("product_embeddings").insert({
        "product_id": product_id,
        "visual_embedding": visual,
        "text_embedding": text,
        "combined_embedding": combined,
    }).execute()
    return res.data[0]


def vector_search(query_embedding: list, limit: int = 10):
    """
    Run cosine similarity search via pgvector RPC.
    Requires a Supabase SQL function: match_products
    """
    res = supabase.rpc(
        "match_products",
        {
            "query_embedding": query_embedding,
            "match_count": limit,
        },
    ).execute()
    return res.data


def get_orders_by_customer(customer_name: str = "Demo Customer"):
    res = (
        supabase.table("orders")
        .select("*, products(title, image_url)")
        .eq("customer_name", customer_name)
        .execute()
    )
    return res.data


def upload_image_to_storage(file_bytes: bytes, filename: str) -> str:
    """Upload image bytes to Supabase Storage and return public URL."""
    path = f"products/{filename}"
    supabase.storage.from_(settings.supabase_bucket).upload(
        path,
        file_bytes,
        file_options={"content-type": "image/jpeg"},
    )
    url = supabase.storage.from_(settings.supabase_bucket).get_public_url(path)
    return url
