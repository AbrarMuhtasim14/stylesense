export interface Product {
  id: string
  title: string
  description: string | null
  visual_description: string | null
  price: number
  category: string
  sub_category: string | null
  color: string
  gender: string
  season: string | null
  usage_type: string | null
  image_url: string | null
  is_corrupted: boolean
  created_at: string
}

export interface SearchResult extends Product {
  similarity_score: number
  match_type: "text" | "image" | "combined"
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  suggested_products?: Product[]
}
