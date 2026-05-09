"use client"

const CATEGORIES = ["Shirts","Tshirts","Sweaters","Jeans","Casual Shoes",
  "Sneakers","Bags","Dresses","Jackets","Watches","Sunglasses","Kurtas"]

const COLORS = ["Red","Blue","Green","Black","White","Navy Blue",
  "Grey","Khaki","Mint Green","Pink","Yellow","Beige","Brown"]

const GENDERS = ["All","Men","Women","Boys","Girls","Unisex"]

interface Filters {
  category: string
  color: string
  gender: string
  minPrice: number
  maxPrice: number
}

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
}

export default function FilterSidebar({ filters, onChange }: Props) {
  const set = (key: keyof Filters, val: string | number) =>
    onChange({ ...filters, [key]: val })

  return (
    <div className="flex flex-col gap-6">

      {/* Category */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Category</p>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-brand-600">
            <input type="radio" name="cat" value=""
              checked={filters.category === ""}
              onChange={() => set("category", "")}
              className="accent-brand-600" />
            All
          </label>
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-brand-600">
              <input type="radio" name="cat" value={c}
                checked={filters.category === c}
                onChange={() => set("category", c)}
                className="accent-brand-600" />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Gender</p>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button key={g}
              onClick={() => set("gender", g === "All" ? "" : g)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                ${filters.gender === (g === "All" ? "" : g)
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-gray-200 text-gray-600 hover:border-brand-300"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Color</p>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand-600">
            <input type="radio" name="color" value=""
              checked={filters.color === ""}
              onChange={() => set("color", "")}
              className="accent-brand-600" />
            All colors
          </label>
          {COLORS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand-600">
              <input type="radio" name="color" value={c}
                checked={filters.color === c}
                onChange={() => set("color", c)}
                className="accent-brand-600" />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Price: ৳{filters.minPrice} – ৳{filters.maxPrice}
        </p>
        <input type="range" min={0} max={9999} step={100}
          value={filters.maxPrice}
          onChange={(e) => set("maxPrice", Number(e.target.value))}
          className="w-full accent-brand-600" />
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange({ category:"", color:"", gender:"", minPrice:0, maxPrice:9999 })}
        className="text-sm text-gray-500 hover:text-brand-600 underline text-left">
        Reset filters
      </button>
    </div>
  )
}
