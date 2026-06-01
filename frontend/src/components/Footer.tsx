import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} My Tools Site. 实用工具集合
          </p>
          <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
            用 <Heart className="w-4 h-4 text-red-500 fill-red-500" /> 构建
          </p>
        </div>
      </div>
    </footer>
  )
}
