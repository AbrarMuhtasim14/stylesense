import httpx
import numpy as np
from config import settings


async def embed_image(image_url: str) -> list[float]:
    """Send image URL to CLIP service on AMD, get 512-dim visual embedding."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(
            f"{settings.amd_clip_url}/embed/image",
            json={"image_url": image_url},
        )
        res.raise_for_status()
        return res.json()["embedding"]


async def embed_text(text: str) -> list[float]:
    """Send text to CLIP service on AMD, get 512-dim text embedding."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(
            f"{settings.amd_clip_url}/embed/text",
            json={"text": text},
        )
        res.raise_for_status()
        return res.json()["embedding"]


async def embed_combined(image_url: str, text: str) -> list[float]:
    """
    Weighted average: 60% image + 40% text.
    Image dominates so corrupted text doesn't hide correct products.
    """
    img_emb = np.array(await embed_image(image_url))
    txt_emb = np.array(await embed_text(text))

    alpha = settings.image_weight   # 0.6
    beta  = settings.text_weight    # 0.4

    combined = alpha * img_emb + beta * txt_emb
    # Normalize to unit vector for cosine similarity
    combined = combined / (np.linalg.norm(combined) + 1e-8)
    return combined.tolist()
