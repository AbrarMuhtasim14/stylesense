from db.queries import vector_search
from services.clip_service import embed_text, embed_image, embed_combined


async def text_search(query: str, limit: int = 10) -> list[dict]:
    """Encode query text → vector → pgvector nearest neighbor search."""
    query_embedding = await embed_text(query)
    results = vector_search(query_embedding, limit)
    for r in results:
        r["match_type"] = "text"
    return results


async def image_search(
    image_url: str,
    text_constraint: str = "",
    limit: int = 10,
) -> list[dict]:
    """
    Encode uploaded image → vector.
    If text constraint provided, combine image + text embeddings.
    """
    if text_constraint:
        query_embedding = await embed_combined(image_url, text_constraint)
        match_type = "combined"
    else:
        query_embedding = await embed_image(image_url)
        match_type = "image"

    results = vector_search(query_embedding, limit)
    for r in results:
        r["match_type"] = match_type
    return results
