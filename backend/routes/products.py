from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException
from db.queries import get_all_products, get_product_by_id, insert_product, upload_image_to_storage
from services.vision_service import describe_product_image
from services.clip_service import embed_combined
from db.queries import insert_embedding
from config import settings
import uuid
import httpx

router = APIRouter()


@router.get("/")
async def list_products(limit: int = 100, offset: int = 0):
    products = get_all_products(limit, offset)
    return {"products": products, "count": len(products)}


@router.get("/{product_id}")
async def get_product(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/upload")
async def upload_product(
    image: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    color: str = Form(...),
    gender: str = Form(...),
    season: str = Form(default=""),
    usage_type: str = Form(default=""),
    is_corrupted: bool = Form(default=False),
    x_admin_password: str = Header(default=""),
):
    # Auth check
    if x_admin_password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 1. Upload image to Supabase Storage
    image_bytes = await image.read()
    filename = f"{uuid.uuid4().hex}.jpg"
    image_url = upload_image_to_storage(image_bytes, filename)

    # 2. Qwen-VL looks at the image and writes what it actually sees
    visual_description = await describe_product_image(image_url)

    # 3. Insert product into DB
    product = insert_product({
        "title": title,
        "description": description,
        "visual_description": visual_description,
        "price": price,
        "category": category,
        "color": color,
        "gender": gender,
        "season": season,
        "usage_type": usage_type,
        "image_url": image_url,
        "is_corrupted": is_corrupted,
        "original_name": title,
    })

    # 4. Generate embedding using TRUE image + visual description (not the admin-typed text)
    #    This ensures the embedding reflects reality even if title is intentionally wrong
    combined_text = f"{visual_description} {color} {category}"
    combined_emb = await embed_combined(image_url, combined_text)

    from services.clip_service import embed_image, embed_text
    visual_emb = await embed_image(image_url)
    text_emb = await embed_text(combined_text)

    insert_embedding(product["id"], visual_emb, text_emb, combined_emb)

    return {
        "status": "success",
        "product_id": product["id"],
        "image_url": image_url,
        "visual_description": visual_description,
        "embedding": "generated",
    }
