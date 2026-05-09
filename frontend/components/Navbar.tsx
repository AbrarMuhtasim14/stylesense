"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ShoppingBag, Search, Camera } from "lucide-react"
import ImageUploadModal from "./ImageUploadModal"

export default function Navbar() {
  const router = useRouter()
  const [query, setQuery]         = useState("")
  const [showModal, setShowModal] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="font-bold text-xl text-brand-600 flex-shrink-0">
            StyleSense
          </Link>

          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you're looking for…"
                className="input pl-9 pr-4 py-2 text-sm"
              />
            </div>
            <button type="button" onClick={() => setShowModal(true)}
              className="btn-secondary p-2" title="Search by image">
              <Camera size={18} />
            </button>
          </form>

          <div className="flex items-center gap-4 ml-auto">
            <Link href="/products" className="text-sm text-gray-600 hover:text-brand-600">Products</Link>
            <Link href="/admin" className="text-sm text-gray-600 hover:text-brand-600">Admin</Link>
            <button className="relative p-2 text-gray-600">
              <ShoppingBag size={20} />
            </button>
          </div>
        </div>
      </nav>

      <ImageUploadModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
