"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import SearchBar from "@/components/SearchBar"
import ProductGrid from "@/components/ProductGrid"

const CATEGORIES = [
  { name: "Sweaters", emoji: "🧶" },
  { name: "Jeans",    emoji: "👖" },
  { name: "Sneakers", emoji: "👟" },
  { name: "Dresses",  emoji: "👗" },
  { name: "Bags",     emoji: "👜" },
  { name: "Watches",  emoji: "⌚" },
]

export default function HomePage() {
  const router = useRouter()

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find exactly what you're looking for
          </h1>
          <p className="text-brand-100 text-lg mb-8">
            Describe it in your own words — or upload a photo. Our AI understands you.
          </p>
          <SearchBar onSearch={handleSearch} large />
          <p className="mt-4 text-brand-200 text-sm">
            Try: "cozy mint green knit sweater" or "casual sneakers for summer"
          </p>
        </div>
      </section>

      {/* Category tiles */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Browse by category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => router.push(`/products?category=${cat.name}`)}
              className="card p-4 text-center hover:border-brand-300 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <div className="text-sm font-medium text-gray-700">{cat.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Featured products</h2>
        <ProductGrid limit={8} />
      </section>
    </div>
  )
}
