import { SearchResult, Product, ChatMessage } from "./types"

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function searchByText(query: string, limit = 10): Promise<SearchResult[]> {
  const res = await fetch(`${BASE}/search/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit }),
  })
  const data = await res.json()
  return data.results
}

export async function searchByImage(
  imageFile: File,
  textConstraint = "",
  limit = 10
): Promise<{ results: SearchResult[]; query_image_url: string }> {
  const form = new FormData()
  form.append("image", imageFile)
  form.append("text_constraint", textConstraint)
  form.append("limit", limit.toString())

  const res = await fetch(`${BASE}/search/image`, { method: "POST", body: form })
  const data = await res.json()
  return { results: data.results, query_image_url: data.query_image_url }
}

export async function getProducts(limit = 100, offset = 0): Promise<Product[]> {
  const res = await fetch(`${BASE}/products/?limit=${limit}&offset=${offset}`)
  const data = await res.json()
  return data.products
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${id}`)
  return res.json()
}

export async function chatWithAgent(
  message: string,
  sessionId: string,
  productId?: string
): Promise<{ reply: string; session_id: string }> {
  const res = await fetch(`${BASE}/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId, product_id: productId }),
  })
  return res.json()
}

export async function uploadProduct(formData: FormData, adminPassword: string) {
  const res = await fetch(`${BASE}/products/upload`, {
    method: "POST",
    headers: { "x-admin-password": adminPassword },
    body: formData,
  })
  return res.json()
}
