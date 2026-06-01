import { useState } from 'react'
import { Search, Zap, Shield } from 'lucide-react'
import { ToolCard } from '../components/ToolCard'
import type { Tool } from '../types'

const tools: Tool[] = [
  {
    id: 'todo',
    name: '待办管理器',
    description: '简洁高效的任务管理工具，支持多列表、优先级标记，数据本地存储安全私密。',
    icon: '✅',
    path: '/todo',
    color: '#10b981',
    isNew: false,
  },
  {
    id: 'reaction',
    name: '反应速度训练',
    description: '测试并提升你的视觉和听觉反应速度，支持多种难度和训练模式。',
    icon: '⚡',
    path: '/reaction',
    color: '#f59e0b',
    isNew: false,
  },
  {
    id: 'dream',
    name: '周公解梦',
    description: 'AI 智能解梦，结合传统周公解梦与现代心理学，输入梦境关键词即可解析吉凶。',
    icon: '🌙',
    path: '/dream',
    color: '#d97706',
    isNew: true,
  },
  {
    id: 'fortune',
    name: '每日灵签',
    description: '观音灵签每日一签，基于用户ID和日期生成专属签文，心诚则灵。',
    icon: '🏮',
    path: '/fortune',
    color: '#dc2626',
    isNew: true,
  },
  {
    id: 'poetry',
    name: '诗词求解器',
    description: '只记得半句诗？输入片段或位置约束，快速找到完整诗句。',
    icon: '📜',
    path: '/poetry',
    color: '#8b5cf6',
  },
  {
    id: 'rhyme',
    name: '押韵助手',
    description: '中文诗词押韵查询，支持严格押韵、邻韵通押等多种模式。',
    icon: '🎵',
    path: '/rhyme',
    color: '#ec4899',
  },
  {
    id: 'guitar',
    name: '吉他和弦转调',
    description: '快速将吉他和弦升降调，附带指法图，适合弹唱爱好者。',
    icon: '🎸',
    path: '/guitar',
    color: '#ef4444',
  },
  {
    id: 'anagram',
    name: '汉字组合器',
    description: '从给定汉字中组合出所有可能的词语，文字游戏好帮手。',
    icon: '🧩',
    path: '/anagram',
    color: '#06b6d4',
  },
  {
    id: 'chess',
    name: '国际象棋',
    description: '与 Stockfish 引擎对弈，支持自定义局面和难度调节。',
    icon: '♟️',
    path: '/chess',
    color: '#6366f1',
  },
]

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      {/* ===== Hero Section：移除搜索栏 ===== */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent 
                        dark:from-primary-900/10 dark:to-transparent" />

        {/* 右上角搜索栏 */}
        <div className="absolute top-8 right-4 sm:right-8 lg:right-12 z-30 w-56 sm:w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-full border border-[var(--border-color)] 
                         bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                         text-sm text-[var(--text-primary)]
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         shadow-sm"
            />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-6">
            实用工具
            <span className="text-primary-600"> 集合站</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            一个简洁、高效、免费的在线工具平台。从诗词查询到反应训练，
            每个工具都为你精心打造。
          </p>
        </div>
      </section>

      {/* ===== Tools Grid：工具卡片 ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              全部工具
              <span className="ml-2 text-sm font-normal text-[var(--text-secondary)]">
                ({filteredTools.length})
              </span>
            </h2>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[var(--text-secondary)]">没有找到匹配的工具</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== Features：移到工具卡片下方 ===== */}
      <section className="py-12 border-y border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 
                              flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">极速响应</h3>
                <p className="text-sm text-[var(--text-secondary)]">优化的算法和架构</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 
                              flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">隐私优先</h3>
                <p className="text-sm text-[var(--text-secondary)]">数据本地存储，不上传</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 
                              flex items-center justify-center">
                <span className="text-lg">🆓</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">完全免费</h3>
                <p className="text-sm text-[var(--text-secondary)]">所有工具永久免费使用</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}