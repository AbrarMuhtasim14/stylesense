export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <p className="font-bold text-xl text-brand-600">StyleSense</p>
          <p className="text-sm text-gray-500 mt-1">
            Multimodal AI fashion search — AMD Developer Hackathon 2026
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Powered by AMD MI300X · Qwen2.5-VL · CLIP · ROCm
          </p>
        </div>
        <div className="flex gap-10 text-sm text-gray-500">
          <div className="flex flex-col gap-2">
            <p className="font-medium text-gray-700">Shop</p>
            <a href="/products" className="hover:text-brand-600">All Products</a>
            <a href="/products?category=Sweaters" className="hover:text-brand-600">Sweaters</a>
            <a href="/products?category=Jeans" className="hover:text-brand-600">Jeans</a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium text-gray-700">Tech</p>
            <a href="https://www.amd.com/en/products/accelerators/instinct/mi300/mi300x.html"
              target="_blank" className="hover:text-brand-600">AMD MI300X</a>
            <a href="https://lablab.ai" target="_blank" className="hover:text-brand-600">LabLab.ai</a>
            <a href="/admin" className="hover:text-brand-600">Admin Portal</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 text-center py-4 text-xs text-gray-400">
        © 2026 StyleSense · Built for AMD Developer Hackathon
      </div>
    </footer>
  )
}
