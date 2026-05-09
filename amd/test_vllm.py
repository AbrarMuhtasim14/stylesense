"""
Run this on your AMD instance to verify both vLLM models are responding.
Usage: python test_vllm.py
"""
from openai import OpenAI

API_KEY = "token-amd-hackathon"

# Test Agent model (Qwen2.5-72B on port 8002)
print("Testing Agent model (port 8002)...")
client = OpenAI(base_url="http://localhost:8002/v1", api_key=API_KEY)
r = client.chat.completions.create(
    model="Qwen/Qwen2.5-72B-Instruct-AWQ",
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
    max_tokens=50,
)
print(f"Agent reply: {r.choices[0].message.content}")

# Test Vision model (Qwen-VL on port 8000)
print("\nTesting Vision model (port 8000)...")
client_vision = OpenAI(base_url="http://localhost:8000/v1", api_key=API_KEY)
r2 = client_vision.chat.completions.create(
    model="Qwen/Qwen2.5-VL-72B-Instruct-AWQ",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {
                "url": "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400"
            }},
            {"type": "text", "text": "What color is this clothing item?"},
        ],
    }],
    max_tokens=100,
)
print(f"Vision reply: {r2.choices[0].message.content}")
print("\nAll AMD services working correctly!")
