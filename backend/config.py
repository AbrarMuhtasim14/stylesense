from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ✅ This makes backend ignore extra env vars like NEXT_PUBLIC_*, PORT, etc.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        # Optional: removes the "model_" protected namespace warnings
        protected_namespaces=(),
    )

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_bucket: str = "product-images"

    # AMD services
    amd_vision_url: str
    amd_agent_url: str
    amd_clip_url: str
    amd_vllm_api_key: str = "token-amd-hackathon"
    model_vision: str = "Qwen/Qwen2.5-VL-72B-Instruct-AWQ"
    model_agent: str = "Qwen/Qwen2.5-72B-Instruct-AWQ"

    # App
    admin_password: str = "hackathon2025"
    embedding_dim: int = 512
    image_weight: float = 0.6
    text_weight: float = 0.4
    corrupt_count: int = 25
    products_total: int = 100
    environment: str = "development"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()