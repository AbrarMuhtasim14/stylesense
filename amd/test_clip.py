"""
Run this on your AMD instance to verify CLIP is working correctly.
Usage: python test_clip.py
"""
import requests

BASE = "http://localhost:8001"

print("Testing CLIP service on AMD...")

# Health check
r = requests.get(f"{BASE}/health")
print(f"Health: {r.json()}")

# Text embedding
r = requests.post(f"{BASE}/embed/text", json={"text": "mint green waffle knit sweater"})
emb = r.json()["embedding"]
print(f"Text embedding: dim={len(emb)}, first 5 values={emb[:5]}")

# Image embedding (using a public test image)
test_image = "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400"
r = requests.post(f"{BASE}/embed/image", json={"image_url": test_image})
emb = r.json()["embedding"]
print(f"Image embedding: dim={len(emb)}, first 5 values={emb[:5]}")

# Similarity test — same concept, different modality
import numpy as np
text_r = requests.post(f"{BASE}/embed/text", json={"text": "a green sweater"}).json()
img_r  = requests.post(f"{BASE}/embed/image", json={"image_url": test_image}).json()

t = np.array(text_r["embedding"])
i = np.array(img_r["embedding"])
similarity = float(np.dot(t, i))
print(f"Text-image cosine similarity: {similarity:.4f} (higher = more similar, expect > 0.2)")
print("CLIP test complete.")
