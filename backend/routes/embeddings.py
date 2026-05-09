from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.queries import get_product_by_id, insert_embedding
from services.clip_service import embed_image, embed_text, embed_combined

router = APIRouter()


class EmbeddingRequest(BaseModel):
    product_id: str


@router.post("/generate")
async def generate_embedding(request: EmbeddingRequest):
    product = get_product_by_id(request.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    image_url = product["image_url"]
    # Use visual_description if available (truth from Qwen-VL), else fallback to title
    visual_text = product.get("visual_description") or product["title"]
    combined_text = f"{visual_text} {product['color']} {product['category']}"

    visual_emb  = await embed_image(image_url)
    text_emb    = await embed_text(combined_text)
    combined    = await embed_combined(image_url, combined_text)

    insert_embedding(request.product_id, visual_emb, text_emb, combined)

    return {"status": "ok", "product_id": request.product_id}
