from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from config import settings
from db.queries import get_product_by_id, get_orders_by_customer, vector_search
from services.clip_service import embed_text

# In-memory session store
session_store: dict[str, ChatMessageHistory] = {}


def get_session_history(session_id: str) -> ChatMessageHistory:
    if session_id not in session_store:
        session_store[session_id] = ChatMessageHistory()
    return session_store[session_id]


# ── Tools ────────────────────────────────────────────────────────────────────

@tool
async def search_products(query: str) -> str:
    """Search for products by natural language description. Use when customer asks to find,
    show, or recommend products."""
    embedding = await embed_text(query)
    results = vector_search(embedding, limit=4)
    if not results:
        return "No products found for that query."
    lines = []
    for r in results:
        lines.append(f"- {r['title']} | {r['color']} | ${r['price']} | ID: {r['id']}")
    return "\n".join(lines)


@tool
def get_product_details(product_id: str) -> str:
    """Get full details of a specific product by its ID."""
    product = get_product_by_id(product_id)
    if not product:
        return "Product not found."
    return (
        f"Title: {product['title']}\n"
        f"Color: {product['color']}\n"
        f"Category: {product['category']}\n"
        f"Price: ${product['price']}\n"
        f"Description: {product['description']}\n"
        f"Visual description (AI sees): {product.get('visual_description', 'N/A')}"
    )


@tool
def get_order_status(customer_name: str = "Demo Customer") -> str:
    """Check order status for the customer."""
    orders = get_orders_by_customer(customer_name)
    if not orders:
        return "No orders found."
    lines = []
    for o in orders:
        product_title = o.get("products", {}).get("title", "Unknown product")
        lines.append(f"- Order {o['id'][:8]}... | {product_title} | Status: {o['status']}")
    return "\n".join(lines)


@tool
def process_return(order_id: str, reason: str = "Not specified") -> str:
    """Handle return or cancellation request."""
    return (
        f"Return/cancellation request received for order {order_id[:8]}...\n"
        f"Reason: {reason}\n"
        f"Status: Approved. You will receive a confirmation email within 24 hours.\n"
        f"Refund will be processed in 5-7 business days."
    )


# ── Agent setup ──────────────────────────────────────────────────────────────

llm = ChatOpenAI(
    base_url=settings.amd_agent_url,
    api_key=settings.amd_vllm_api_key,
    model=settings.model_agent,
    temperature=0.7,
)

tools = [search_products, get_product_details, get_order_status, process_return]

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are a friendly and helpful AI shopping assistant for StyleSense, a fashion e-commerce store. "
     "You help customers find products, answer style questions, check orders, and handle returns. "
     "When customers ask to find or see products, always use the search_products tool. "
     "Be concise, warm, and helpful. If you show products, mention their title, color, and price."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False)

agent_with_history = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)


async def chat(message: str, session_id: str, product_id: str = None) -> dict:
    context = message
    if product_id:
        context = f"[Customer is viewing product ID: {product_id}]\n{message}"

    result = await agent_with_history.ainvoke(
        {"input": context},
        config={"configurable": {"session_id": session_id}},
    )
    return {"reply": result["output"], "session_id": session_id}
