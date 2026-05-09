interface Props {
  type: "text" | "image" | "combined"
  score?: number
}

const labels = {
  text:     { text: "Text Match",   color: "bg-blue-50 text-blue-700 border-blue-100" },
  image:    { text: "Vision Match", color: "bg-purple-50 text-purple-700 border-purple-100" },
  combined: { text: "AI Match",     color: "bg-green-50 text-green-700 border-green-100" },
}

export default function AIMatchBadge({ type, score }: Props) {
  const { text, color } = labels[type] || labels.text
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${color}`}>
      ⚡ {text}
      {score !== undefined && <span className="opacity-70">{(score * 100).toFixed(0)}%</span>}
    </span>
  )
}
