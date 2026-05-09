"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { getProduct } from "@/lib/api"
import { Product } from "@/lib/types"
import { ShoppingBag, Search, Eye } from "lucide-react"

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [product, setProduct]       = useState<Product | null>(null)
  const [selectedSize, setSize]     = useState("M")
  const [added, setAdded]           = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    getProduct(id).then((p) => { setProduct(p); setLoading(false) })
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-96 text-gray-400">Loading…</div>
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>

  const handleFindSimilar = () => {
    // Navigate to search with product image as context
    router.push(`/search?similar_to=${product.id}`)
  }

  const handleAddToCart = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">👕</div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-sm text-brand-600 font-medium">{product.category}</span>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.title}</h1>
            <p className="text-2xl font-semibold text-gray-800 mt-2">
              ৳{product.price.toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{product.color}</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{product.gender}</span>
            {product.season && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{product.season}</span>}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* AI sees section — the demo moment */}
          {product.visual_description && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Eye className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  AI sees this as
                </p>
                <p className="text-sm text-blue-800">{product.visual_description}</p>
              </div>
            </div>
          )}

          {/* Size selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Select size</p>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors
                    ${selectedSize === s
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-gray-200 text-gray-700 hover:border-brand-300"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
              <ShoppingBag size={18} />
              {added ? "Added!" : "Add to Cart"}
            </button>
            <button onClick={handleFindSimilar} className="btn-secondary flex items-center gap-2 px-4 py-3">
              <Search size={18} />
              Find Similar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
