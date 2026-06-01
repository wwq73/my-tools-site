import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Tool } from '../types'

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link to={tool.path} className="group">
      <div className="card p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: tool.color + '20', color: tool.color }}
          >
            {tool.icon}
          </div>
          {tool.isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 
                             dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 
                             text-xs font-medium rounded-full">
              <Sparkles className="w-3 h-3" />
              新
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 
                       group-hover:text-primary-600 transition-colors">
          {tool.name}
        </h3>

        <p className="text-sm text-[var(--text-secondary)] flex-grow">
          {tool.description}
        </p>

        <div className="mt-4 flex items-center text-sm font-medium text-primary-600 
                        opacity-0 group-hover:opacity-100 transition-opacity">
          开始使用
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
