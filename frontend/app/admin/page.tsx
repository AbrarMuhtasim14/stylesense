"use client"
import { useState } from "react"
import AdminGate from "@/components/admin/AdminGate"
import ProductUploadForm from "@/components/admin/ProductUploadForm"
import ProductsTable from "@/components/admin/ProductsTable"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed]     = useState(false)

  if (!authed) {
    return <AdminGate onAuth={(p) => { setPassword(p); setAuthed(true) }} />
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">StyleSense Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Manage products and embeddings</p>
        </div>
        <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
          ✓ Authenticated
        </span>
      </div>

      <section className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Product</h2>
        <ProductUploadForm adminPassword={password} />
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">All Products</h2>
        <ProductsTable />
      </section>
    </div>
  )
}
