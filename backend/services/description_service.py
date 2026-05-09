from openai import AsyncOpenAI
from config import settings


client = AsyncOpenAI(
    base_url=settings.amd_agent_url,
    api_key=settings.amd_vllm_api_key,
)


async def generate_product_description(
    name: str,
    color: str,
    category: str,
    season: str = "",
    usage: str = "",
) -> str:
    """
    Generate a natural 3-sentence e-commerce product description
    using Qwen2.5-72B on AMD.
    """
    prompt = (
        f"Write a 3-sentence e-commerce product description for the following item:\n"
        f"Name: {name}\n"
        f"Color: {color}\n"
        f"Category: {category}\n"
        f"Season: {season}\n"
        f"Usage: {usage}\n\n"
        f"Write in a friendly, helpful tone. Focus on style, comfort, and versatility. "
        f"Do not mention the brand. Only return the description, nothing else."
    )

    response = await client.chat.completions.create(
        model=settings.model_agent,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()
