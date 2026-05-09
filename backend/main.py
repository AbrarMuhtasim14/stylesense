from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import health, search, products, agent, embeddings

app = FastAPI(
    title="StyleSense API",
    description="Multimodal AI E-Commerce Backend — AMD Developer Hackathon",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(agent.router, prefix="/agent", tags=["Agent"])
app.include_router(embeddings.router, prefix="/embeddings", tags=["Embeddings"])


@app.get("/")
async def root():
    return {
        "project": "StyleSense",
        "hackathon": "AMD Developer × LabLab.ai",
        "track": "Vision & Multimodal AI",
        "status": "running",
    }
