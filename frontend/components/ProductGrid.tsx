"use client"
import { useEffect, useState } from "react"
import { getProducts } from "@/lib/api"
import { Product } from "@/lib/types"
import ProductCard from "./ProductCard"

interface Filters {
  category?: string
  color?: string
  gender?: string
  minPrice?: number
  maxPrice?: number
}

interface Props {
  limit?: number
  filters?: Filters
}

export default function ProductGrid({ limit = 100, filters = {} }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    getProducts(limit).then((all) => {
      let filtered = all

      if (filters.category)
        filtered = filtered.filter((p) =>
          p.category.toLowerCase() === filters.category!.toLowerCase())

      if (filters.color)
        filtered = filtered.filter((p) =>
          p.color.toLowerCase().includes(filters.color!.toLowerCase()))

      if (filters.gender && filters.gender !== "All")
        filtered = filtered.filter((p) =>
          p.gender.toLowerCase() === filters.gender!.toLowerCase())

      if (filters.minPrice !== undefined)
        filtered = filtered.filter((p) => p.price >= filters.minPrice!)

      if (filters.maxPrice !== undefined)
        filtered = filtered.filter((p) => p.price <= filters.maxPrice!)

      setProducts(filtered)
      setLoading(false)
    })
  }, [limit, filters.category, filters.color, filters.gender, filters.minPrice, filters.maxPrice])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl bg-gray-100 animate-pulse aspect-[3/4]" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        No products found. Try adjusting your filters.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
