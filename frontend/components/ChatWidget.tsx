"use client"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { chatWithAgent } from "@/lib/api"
import ChatMessage from "./ChatMessage"
import { v4 as uuidv4 } from "uuid"

interface Message { role: "user" | "assistant"; content: string }

const SESSION_ID = uuidv4()

const SUGGESTIONS = [
  "What's trending?",
  "Help me find a gift",
  "Where is my order?",
  "I want to return something",
]

export default function ChatWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your StyleSense AI assistant. I can help you find products, suggest outfits, or handle your orders. What can I do for you?" }
  ])
  const [input, setInput]   = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: "user", content: text }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await chatWithAgent(text, SESSION_ID)
      setMessages((m) => [...m, { role: "assistant", content: res.reply }])
    } catch {
      setMessages((m) => [...m, {
        role: "assistant",
        content: "Sorry, I couldn't connect to the AI. Please try again."
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-colors flex items-center justify-center">
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col" style={{ height: "520px" }}>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-brand-600 rounded-t-2xl text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="font-semibold text-sm">StyleSense AI</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-70">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} />
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-500">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-brand-300 hover:text-brand-600 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask me anything…"
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="bg-brand-600 text-white p-2 rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
