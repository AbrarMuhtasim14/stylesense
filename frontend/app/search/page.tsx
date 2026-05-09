"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { searchByText } from "@/lib/api"
import { SearchResult } from "@/lib/types"
import ProductCard from "@/components/ProductCard"
import SearchBar from "@/components/SearchBar"
import { useRouter } from "next/navigation"

export default function SearchPage() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const query         = searchParams.get("q") || ""
  const [results, setResults]   = useState<SearchResult[]>([])
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    searchByText(query).then((r) => {
      setResults(r)
      setLoading(false)
    })
  }, [query])

  const handleNewSearch = (q: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar onSearch={handleNewSearch} defaultValue={query} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Results for: <span className="text-brand-600">"{query}"</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Searching…" : `${results.length} products found`}
          </p>
        </div>
        <span className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full font-medium">
          ⚡ Powered by AMD MI300X
        </span>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card aspect-[3/4] animate-pulse bg-gray-100 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((r) => (
            <ProductCard key={r.id} product={r} showScore />
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No results found for "{query}"</p>
          <p className="text-gray-400 text-sm mt-2">Try different words or upload an image</p>
        </div>
      )}
    </div>
  )
}
