"use client"
import { useSearchParams } from "next/navigation"
import ProductGrid from "@/components/ProductGrid"
import FilterSidebar from "@/components/FilterSidebar"
import { useState } from "react"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    color:    "",
    gender:   "",
    minPrice: 0,
    maxPrice: 9999,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      <aside className="w-56 flex-shrink-0">
        <FilterSidebar filters={filters} onChange={setFilters} />
      </aside>
      <main className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Products</h1>
        <ProductGrid filters={filters} />
      </main>
    </div>
  )
}
