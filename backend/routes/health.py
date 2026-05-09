from fastapi import APIRouter
import httpx
from config import settings

router = APIRouter()


@router.get("/health")
async def health():
    services = {}

    # Check CLIP
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.amd_clip_url}/health")
            services["clip"] = "ok" if r.status_code == 200 else "error"
    except Exception:
        services["clip"] = "unreachable"

    # Check Vision (Qwen-VL)
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.amd_vision_url}/models")
            services["vision_model"] = "ok" if r.status_code == 200 else "error"
    except Exception:
        services["vision_model"] = "unreachable"

    # Check Agent (Qwen2.5)
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.amd_agent_url}/models")
            services["agent_model"] = "ok" if r.status_code == 200 else "error"
    except Exception:
        services["agent_model"] = "unreachable"

    return {"status": "ok", "amd_services": services}
