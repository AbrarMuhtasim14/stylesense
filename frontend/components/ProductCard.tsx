import Link from "next/link"
import Image from "next/image"
import { Product, SearchResult } from "@/lib/types"
import AIMatchBadge from "./AIMatchBadge"

interface Props {
  product: Product | SearchResult
  showScore?: boolean
}

function isSearchResult(p: Product | SearchResult): p is SearchResult {
  return "similarity_score" in p
}

export default function ProductCard({ product, showScore }: Props) {
  const sr = isSearchResult(product) ? product : null

  return (
    <Link href={`/products/${product.id}`}
      className="card group hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">
            👕
          </div>
        )}

        {/* Badge overlay */}
        {sr && showScore && (
          <div className="absolute top-2 left-2">
            <AIMatchBadge type={sr.match_type} score={sr.similarity_score} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{product.category}</p>
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
          {product.title}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-semibold text-gray-900">
            ৳{product.price.toLocaleString()}
          </p>
          <span className="text-xs text-gray-400">{product.color}</span>
        </div>
      </div>
    </Link>
  )
}
