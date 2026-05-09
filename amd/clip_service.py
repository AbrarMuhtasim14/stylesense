"""
CLIP Embedding Service — runs permanently on AMD MI300X (port 8001)
Provides image and text embeddings via HTTP API.
"""

import torch
from transformers import CLIPProcessor, CLIPModel
from fastapi import FastAPI
from pydantic import BaseModel
from PIL import Image
import requests
from io import BytesIO
import numpy as np

app = FastAPI(title="CLIP Embedding Service")

print("Loading CLIP model on AMD GPU...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to("cuda")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model.eval()
print("CLIP ready.")


class ImageRequest(BaseModel):
    image_url: str


class TextRequest(BaseModel):
    text: str


def fetch_image(url: str) -> Image.Image:
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    return Image.open(BytesIO(response.content)).convert("RGB")


def normalize(vec: np.ndarray) -> list[float]:
    norm = np.linalg.norm(vec)
    return (vec / (norm + 1e-8)).tolist()


@app.get("/health")
def health():
    return {"status": "ok", "device": str(next(model.parameters()).device)}


@app.post("/embed/image")
def embed_image(request: ImageRequest):
    image = fetch_image(request.image_url)
    inputs = processor(images=image, return_tensors="pt").to("cuda")
    with torch.no_grad():
        embedding = model.get_image_features(**inputs)
    vec = embedding.cpu().numpy().flatten()
    return {"embedding": normalize(vec)}


@app.post("/embed/text")
def embed_text(request: TextRequest):
    inputs = processor(
        text=[request.text],
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=77,
    ).to("cuda")
    with torch.no_grad():
        embedding = model.get_text_features(**inputs)
    vec = embedding.cpu().numpy().flatten()
    return {"embedding": normalize(vec)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
