from fastapi import APIRouter, UploadFile, File, Form
from models.search import TextSearchRequest
from services.search_service import text_search, image_search
from db.queries import upload_image_to_storage
import uuid

router = APIRouter()


@router.post("/text")
async def search_by_text(request: TextSearchRequest):
    results = await text_search(request.query, request.limit)
    return {"query": request.query, "results": results, "count": len(results)}


@router.post("/image")
async def search_by_image(
    image: UploadFile = File(...),
    text_constraint: str = Form(default=""),
    limit: int = Form(default=10),
):
    # Upload the query image temporarily to Supabase Storage for AMD to access
    image_bytes = await image.read()
    temp_filename = f"query_{uuid.uuid4().hex}.jpg"
    temp_url = upload_image_to_storage(image_bytes, f"temp/{temp_filename}")

    results = await image_search(temp_url, text_constraint, limit)
    return {
        "query_image_url": temp_url,
        "text_constraint": text_constraint,
        "results": results,
        "count": len(results),
    }
