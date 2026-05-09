"use client"
import { useState } from "react"
import { Lock } from "lucide-react"

interface Props { onAuth: (password: string) => void }

export default function AdminGate({ onAuth }: Props) {
  const [pw, setPw]       = useState("")
  const [error, setError] = useState(false)

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.trim()) {
      onAuth(pw.trim())
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 w-full max-w-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl mb-5 mx-auto">
          <Lock className="text-brand-600" size={22} />
        </div>
        <h1 className="text-xl font-bold text-center text-gray-900 mb-1">Admin Portal</h1>
        <p className="text-sm text-gray-500 text-center mb-6">StyleSense product management</p>

        <form onSubmit={handle} className="flex flex-col gap-3">
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false) }}
            placeholder="Enter admin password"
            className={`input ${error ? "border-red-400 focus:ring-red-400" : ""}`}
          />
          {error && <p className="text-xs text-red-500">Please enter the password</p>}
          <button type="submit" className="btn-primary py-2.5">
            Enter Admin
          </button>
        </form>
      </div>
    </div>
  )
}
