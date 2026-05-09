"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { searchByImage } from "@/lib/api"
import { X, Upload, Camera } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
}

export default function ImageUploadModal({ open, onClose }: Props) {
  const router              = useRouter()
  const inputRef            = useRef<HTMLInputElement>(null)
  const [file, setFile]     = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [constraint, setConstraint] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

  if (!open) return null

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith("image/")) handleFile(f)
  }

  const handleSearch = async () => {
    if (!file) return
    setLoading(true)
    try {
      const { results } = await searchByImage(file, constraint)
      // Store results in sessionStorage and navigate
      sessionStorage.setItem("image_search_results", JSON.stringify(results))
      sessionStorage.setItem("image_search_constraint", constraint)
      router.push("/search?mode=image")
      onClose()
    } catch (e) {
      alert("Search failed. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setFile(null); setPreview(null); setConstraint("") }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Camera size={20} className="text-brand-600" />
            <h2 className="font-semibold text-gray-900">Search by Image</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">

          {/* Drop zone */}
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                ${dragging ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-brand-300"}`}>
              <Upload className="mx-auto mb-3 text-gray-300" size={36} />
              <p className="text-sm font-medium text-gray-600">
                Drop an image here or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP supported</p>
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview"
                className="w-full h-52 object-contain rounded-xl bg-gray-50 border border-gray-100" />
              <button onClick={reset}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-500 hover:text-red-500">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Optional text constraint */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Optional: add a text constraint
            </label>
            <input
              value={constraint}
              onChange={(e) => setConstraint(e.target.value)}
              placeholder="e.g. same style but in khaki"
              className="input text-sm"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!file || loading}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Searching…" : "Find Similar Products"}
          </button>
        </div>
      </div>
    </div>
  )
}
