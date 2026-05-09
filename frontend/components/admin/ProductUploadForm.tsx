"use client"
import { useState, useRef } from "react"
import { uploadProduct } from "@/lib/api"
import { Upload, CheckCircle } from "lucide-react"

const CATEGORIES = ["Shirts","Tshirts","Sweaters","Jeans","Casual Shoes",
  "Sneakers","Bags","Dresses","Jackets","Watches","Sunglasses","Kurtas"]

interface Props { adminPassword: string }

export default function ProductUploadForm({ adminPassword }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile]       = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "", description: "", price: "",
    category: "Sweaters", color: "", gender: "Unisex",
    season: "Winter", usage_type: "Casual",
    is_corrupted: false,
  })

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return setError("Please select a product image")
    setLoading(true); setError(null); setSuccess(null)

    const fd = new FormData()
    fd.append("image", file)
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))

    try {
      const res = await uploadProduct(fd, adminPassword)
      if (res.product_id) {
        setSuccess(`Product uploaded! ID: ${res.product_id.slice(0, 8)}… Embedding: ${res.embedding}`)
        setFile(null); setPreview(null)
        setForm({ title:"", description:"", price:"", category:"Sweaters",
          color:"", gender:"Unisex", season:"Winter", usage_type:"Casual", is_corrupted:false })
      } else {
        setError(res.detail || "Upload failed")
      }
    } catch {
      setError("Network error. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Image upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-300 transition-colors">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="h-40 object-contain mx-auto rounded-lg" />
        ) : (
          <>
            <Upload className="mx-auto mb-2 text-gray-300" size={32} />
            <p className="text-sm text-gray-500">Click to upload product image</p>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Product Title</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Classic Crew Neck Sweater" className="input text-sm" required />
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="Product description…" rows={3}
            className="input text-sm resize-none" required />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Price (৳)</label>
          <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
            placeholder="999" className="input text-sm" required />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Color</label>
          <input value={form.color} onChange={(e) => set("color", e.target.value)}
            placeholder="e.g. Mint Green" className="input text-sm" required />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)}
            className="input text-sm">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Gender</label>
          <select value={form.gender} onChange={(e) => set("gender", e.target.value)}
            className="input text-sm">
            {["Men","Women","Boys","Girls","Unisex"].map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Season</label>
          <select value={form.season} onChange={(e) => set("season", e.target.value)}
            className="input text-sm">
            {["Summer","Winter","Spring","Fall"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Usage</label>
          <select value={form.usage_type} onChange={(e) => set("usage_type", e.target.value)}
            className="input text-sm">
            {["Casual","Formal","Sports","Ethnic","Smart Casual"].map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Corruption toggle — hackathon demo tool */}
      <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer">
        <input type="checkbox" checked={form.is_corrupted}
          onChange={(e) => set("is_corrupted", e.target.checked)}
          className="w-4 h-4 accent-amber-500" />
        <div>
          <p className="text-sm font-medium text-amber-800">Mark as intentionally corrupted</p>
          <p className="text-xs text-amber-600">Title & description will be wrong. Image truth stays in embedding.</p>
        </div>
      </label>

      {error  && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
      {success && (
        <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
          {success}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="btn-primary py-3 disabled:opacity-50">
        {loading ? "Uploading & generating embedding on AMD…" : "Publish Product"}
      </button>
    </form>
  )
}
