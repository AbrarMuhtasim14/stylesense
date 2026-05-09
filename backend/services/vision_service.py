from openai import AsyncOpenAI
from config import settings


client = AsyncOpenAI(
    base_url=settings.amd_vision_url,
    api_key=settings.amd_vllm_api_key,
)


async def describe_product_image(image_url: str) -> str:
    """
    Call Qwen-VL on AMD to get an accurate visual description of a product image.
    This is the truth layer — ignores whatever admin typed as title/description.
    """
    response = await client.chat.completions.create(
        model=settings.model_vision,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url},
                    },
                    {
                        "type": "text",
                        "text": (
                            "You are a product cataloguing assistant. "
                            "Look at this product image carefully and describe it in 2-3 sentences. "
                            "Include: exact color, clothing type, fabric/texture, neckline/style, "
                            "fit, and any notable design features. "
                            "Be precise and factual. Do not guess brand names."
                        ),
                    },
                ],
            }
        ],
        max_tokens=200,
        temperature=0.1,
    )
    return response.choices[0].message.content.strip()
