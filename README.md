# StyleSense — Multimodal AI E-Commerce

> AMD Developer Hackathon × LabLab.ai | Track 3: Vision & Multimodal AI

A real-looking fashion e-commerce store where the AI search **sees** products — not just reads their labels. 25 out of 100 products have intentionally wrong titles and descriptions. The AI finds them correctly anyway because it uses the product image as truth.

---

## The Core Demo

1. Admin uploads a mint green sweater → types "Black Formal Blazer" as title
2. Customer searches "mint green waffle knit sweater"
3. The product surfaces correctly despite the wrong label
4. **The AI saw the image. Not the label.**

---

## Architecture

```
AMD MI300X (3 services)
├── Port 8000 — Qwen2.5-VL-72B    (vision understanding)
├── Port 8001 — CLIP ViT-B/32     (search embeddings)
└── Port 8002 — Qwen2.5-72B       (shopping agent + descriptions)

Supabase
├── PostgreSQL + pgvector          (products + embeddings)
└── Storage                        (product images)

Backend: FastAPI → Render
Frontend: Next.js → Vercel
```

---

## Setup

### 1. Supabase
- Create project at supabase.com
- Run `supabase_schema.sql` in SQL Editor
- Create storage bucket: `product-images` (public)

### 2. AMD Instance
```bash
scp -r amd/ ubuntu@YOUR_AMD_IP:~/
ssh ubuntu@YOUR_AMD_IP
pip install -r amd/requirements_amd.txt --index-url https://download.pytorch.org/whl/rocm6.0
bash amd/start_all.sh
```

### 3. Environment
```bash
cp .env.example .env
# Fill in all values in .env
cp frontend/.env.local frontend/.env.local
# Fill in NEXT_PUBLIC_ values
```

### 4. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 5. Seed Database (run in order)
```bash
cd scripts
python seed_database.py        # Step 1: pull HuggingFace data, upload images
python generate_descriptions.py # Step 2: Qwen writes descriptions
python generate_embeddings.py   # Step 3: CLIP generates vectors
python corrupt_products.py      # Step 4: corrupt 25 products
python verify_search.py         # Step 5: confirm system works
```

### 6. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 7. Deploy
- Backend → Render (uses `backend/render.yaml`)
- Frontend → Vercel (connect GitHub repo)

---

## Tech Stack

| Layer | Tool |
|---|---|
| Vision model | Qwen2.5-VL-72B-Instruct-AWQ |
| Agent model | Qwen2.5-72B-Instruct-AWQ |
| Embeddings | CLIP ViT-B/32 |
| GPU | AMD Instinct MI300X (192GB HBM3) |
| Framework | ROCm + vLLM |
| Database | Supabase PostgreSQL + pgvector |
| Storage | Supabase Storage |
| Backend | FastAPI |
| Frontend | Next.js + Tailwind |
| Deploy | Vercel + Render |

---

## Project Structure

```
stylesense/
├── amd/           → scripts running ON AMD instance
├── backend/       → FastAPI backend
├── frontend/      → Next.js frontend
├── scripts/       → one-time seeding scripts
└── supabase_schema.sql
```

---

Built by a solo developer from Chattogram, Bangladesh 🇧🇩
