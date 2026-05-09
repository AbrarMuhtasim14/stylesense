"use client"
import { useState } from "react"
import { Search, Camera } from "lucide-react"
import ImageUploadModal from "./ImageUploadModal"

interface Props {
  onSearch: (query: string) => void
  defaultValue?: string
  large?: boolean
}

export default function SearchBar({ onSearch, defaultValue = "", large = false }: Props) {
  const [query, setQuery]         = useState(defaultValue)
  const [showModal, setShowModal] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <>
      <form onSubmit={handleSubmit}
        className={`flex items-center gap-2 ${large ? "max-w-2xl mx-auto" : ""}`}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="mint green waffle knit sweater…"
            className={`input pl-11 pr-4 ${large ? "py-4 text-lg" : "py-2.5 text-sm"}`}
          />
        </div>
        <button type="submit" className="btn-primary px-6 py-3">
          Search
        </button>
        <button type="button" onClick={() => setShowModal(true)}
          className="btn-secondary p-3" title="Upload image">
          <Camera size={20} />
        </button>
      </form>

      <ImageUploadModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
