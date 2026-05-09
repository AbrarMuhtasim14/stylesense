"use client"
import { useEffect, useState } from "react"
import { getProducts } from "@/lib/api"
import { Product } from "@/lib/types"
import Image from "next/image"
import { AlertTriangle } from "lucide-react"

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getProducts(100).then((p) => { setProducts(p); setLoading(false) })
  }, [])

  if (loading) return <p className="text-sm text-gray-400">Loading products…</p>

  const corrupted = products.filter((p) => p.is_corrupted).length

  return (
    <div>
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-gray-600">Total: <strong>{products.length}</strong></span>
        <span className="text-amber-600">Corrupted: <strong>{corrupted}</strong></span>
        <span className="text-green-600">Clean: <strong>{products.length - corrupted}</strong></span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-3 py-3 text-left">Image</th>
              <th className="px-3 py-3 text-left">Title (displayed)</th>
              <th className="px-3 py-3 text-left">Category</th>
              <th className="px-3 py-3 text-left">Color</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.id}
                className={p.is_corrupted ? "bg-amber-50/50" : "hover:bg-gray-50"}>
                <td className="px-3 py-2">
                  {p.image_url ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">👕</div>
                  )}
                </td>
                <td className="px-3 py-2 max-w-xs">
                  <p className="line-clamp-2 text-gray-800">{p.title}</p>
                  {p.is_corrupted && (
                    <p className="text-xs text-amber-600 mt-0.5">Real: {p.original_name}</p>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-600">{p.category}</td>
                <td className="px-3 py-2 text-gray-600">{p.color}</td>
                <td className="px-3 py-2 text-right text-gray-800">৳{p.price.toLocaleString()}</td>
                <td className="px-3 py-2 text-center">
                  {p.is_corrupted ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <AlertTriangle size={10} /> Corrupted
                    </span>
                  ) : (
                    <span className="inline-flex text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      Clean
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
