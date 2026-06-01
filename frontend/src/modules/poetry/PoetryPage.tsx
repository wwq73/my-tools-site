import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Sparkles,
  Loader2,
  BookOpen,
  History,
  Bookmark,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Clock,
  Hash,
  Star,
  Quote,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePoetryStore, type PoemRecord } from './PoetryStore'
import { apiGet } from '../../api'

type SearchMode = 'fuzzy' | 'position' | 'feihualing'

const MODE_CONFIG: Record<SearchMode, { label: string; desc: string; icon: React.ReactNode; placeholder: string }> = {
  fuzzy: {
    label: '模糊匹配',
    desc: '只记得半句诗？输入任意片段，快速定位完整诗句',
    icon: <Search className="w-5 h-5" />,
    placeholder: '例如：床前明月光、海上生明月...',
  },
  position: {
    label: '位置约束',
    desc: '指定关键词在诗句中的位置精确查找',
    icon: <Hash className="w-5 h-5" />,
    placeholder: '输入关键词...',
  },
  feihualing: {
    label: '飞花令',
    desc: '按关键字查找所有含该字的诗词佳句',
    icon: <Sparkles className="w-5 h-5" />,
    placeholder: '输入一个汉字，如：月、花、风、雪...',
  },
}

interface ApiResponse {
  poems: PoemRecord[]
  total: number
  page: number
  total_pages: number
  query: string
  mode: string
}

export function PoetryPage() {
  const {
    isLoading, setLoading,
    searchResults, setResults,
    totalResults, currentPage, totalPages,
    currentQuery, currentMode,
    activeTab, setActiveTab,
    searchHistory, addSearchHistory, clearHistory,
    bookmarks, toggleBookmark,
    clearResults,
  } = usePoetryStore()

  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // 位置约束额外参数
  const [positionType, setPositionType] = useState('any')
  const [lineNum, setLineNum] = useState(1)

  const mode = activeTab

  const handleSearch = useCallback(async (pageNum = 1) => {
    const searchQuery = query.trim()
    if (!searchQuery) return

    // 飞花令模式只取第一个汉字
    let effectiveQuery = searchQuery
    if (mode === 'feihualing') {
      const ch = searchQuery.match(/[一-鿿㐀-䶿]/)?.[0]
      if (!ch) {
        setError('请输入一个汉字')
        return
      }
      effectiveQuery = ch
      setQuery(ch)
    }

    setLoading(true)
    setError('')
    clearResults()

    try {
      const params = new URLSearchParams()
      params.set('q', effectiveQuery)
      params.set('mode', mode)
      params.set('page', String(pageNum))
      params.set('limit', '20')

      if (mode === 'position') {
        params.set('position', positionType)
        if (positionType === 'line_n') {
          params.set('line_num', String(lineNum))
        }
      }

      const data: ApiResponse = await apiGet(`/api/poetry/search?${params}`)
      setResults(data.poems || [], data.total, data.page, data.total_pages)

      addSearchHistory({
        id: Date.now().toString(),
        query: effectiveQuery,
        mode,
        timestamp: Date.now(),
        resultCount: data.total,
      })
    } catch (err: any) {
      setError(err.message || '搜索失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [query, mode, positionType, lineNum, setLoading, setResults, clearResults, addSearchHistory])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    handleSearch(page)
  }

  const handleHistoryClick = (item: typeof searchHistory[0]) => {
    setQuery(item.query)
    setActiveTab(item.mode as SearchMode)
    setShowHistory(false)
    setTimeout(() => handleSearch(1), 100)
  }

  const copyPoem = async (poem: PoemRecord) => {
    const text = [poem.title, poem.author, ...poem.paragraphs].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(poem.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="animate-fade-in">
      {/* 页面头部 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 w-24 h-24 rounded-full bg-purple-300 blur-xl" />
          <div className="absolute top-8 right-20 w-16 h-16 rounded-full bg-indigo-300 blur-lg" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                诗词求解器
              </h1>
              <p className="text-purple-200 text-sm">
                模糊匹配 · 位置约束 · 飞花令
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 模式切换标签 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(Object.entries(MODE_CONFIG) as [SearchMode, typeof MODE_CONFIG[SearchMode]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); clearResults(); setError('') }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === key
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              {cfg.icon}
              <span>{cfg.label}</span>
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => { setShowBookmarks(!showBookmarks); setShowHistory(false) }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
              showBookmarks
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
            title="收藏"
          >
            <Bookmark className={`w-4 h-4 ${showBookmarks ? 'fill-current' : ''}`} />
            {bookmarks.length > 0 && (
              <span className="text-xs">{bookmarks.length}</span>
            )}
          </button>

          <button
            onClick={() => { setShowHistory(!showHistory); setShowBookmarks(false) }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
              showHistory
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
            title="搜索历史"
          >
            <History className="w-4 h-4" />
          </button>
        </div>

        {/* 模式说明 */}
        <p className="text-sm text-[var(--text-secondary)] mb-4">{MODE_CONFIG[mode].desc}</p>

        {/* 搜索表单 */}
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={MODE_CONFIG[mode].placeholder}
                maxLength={mode === 'feihualing' ? 1 : 100}
                className="input pl-10 w-full"
              />
            </div>

            {/* 位置约束模式额外选项 */}
            {mode === 'position' && (
              <div className="flex gap-2 flex-wrap">
                <select
                  value={positionType}
                  onChange={(e) => setPositionType(e.target.value)}
                  className="input px-3 py-2 text-sm min-w-[100px]"
                >
                  <option value="any">句中任意位置</option>
                  <option value="line_start">句首</option>
                  <option value="line_end">句尾</option>
                  <option value="line_n">指定行</option>
                </select>
                {positionType === 'line_n' && (
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={lineNum}
                    onChange={(e) => setLineNum(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input px-3 py-2 text-sm w-20"
                  />
                )}
              </div>
            )}

            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              搜索
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* 搜索结果 */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-purple-500" />
              <p className="text-[var(--text-secondary)]">正在搜索诗词库...</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">数据库包含 40 万首诗词</p>
            </motion.div>
          ) : searchResults.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* 结果统计 */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  找到 <span className="font-semibold text-purple-600">{totalResults}</span> 首匹配诗词
                  {currentQuery && (
                    <span className="ml-1">
                      — "<span className="text-[var(--text-primary)]">{currentQuery}</span>"
                    </span>
                  )}
                </p>
              </div>

              {/* 诗词列表 */}
              <div className="space-y-4">
                {searchResults.map((poem, index) => (
                  <PoemCard
                    key={`${poem.id}-${index}`}
                    poem={poem}
                    isBookmarked={bookmarks.includes(poem.id)}
                    onToggleBookmark={() => toggleBookmark(poem.id)}
                    onCopy={() => copyPoem(poem)}
                    copied={copiedId === poem.id}
                    index={index}
                    query={currentQuery}
                  />
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 7) {
                      pageNum = i + 1
                    } else if (currentPage <= 4) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i
                    } else {
                      pageNum = currentPage - 3 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === currentPage
                            ? 'bg-purple-600 text-white'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          ) : currentQuery && !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-30" />
              <p className="text-lg text-[var(--text-secondary)]">未找到匹配的诗词</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">试试换个关键词</p>
            </motion.div>
          ) : (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <Quote className="w-16 h-16 mx-auto mb-4 text-purple-300 dark:text-purple-600/50" />
              <p className="text-[var(--text-secondary)]">
                {mode === 'fuzzy' && '输入诗句片段，如"床前明月光"'}
                {mode === 'position' && '输入关键词并选择位置约束'}
                {mode === 'feihualing' && '输入一个汉字，如"月"'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 收藏侧栏 */}
        <AnimatePresence>
          {showBookmarks && (
            <SidePanel
              title="收藏的诗词"
              icon={<Bookmark className="w-4 h-4" />}
              onClose={() => setShowBookmarks(false)}
            >
              {bookmarks.length === 0 ? (
                <p className="text-center text-[var(--text-secondary)] py-8 text-sm">暂无收藏</p>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((id) => (
                    <p key={id} className="text-sm text-[var(--text-secondary)]">诗词 #{id}</p>
                  ))}
                </div>
              )}
            </SidePanel>
          )}
        </AnimatePresence>

        {/* 历史侧栏 */}
        <AnimatePresence>
          {showHistory && (
            <SidePanel
              title="搜索历史"
              icon={<History className="w-4 h-4" />}
              onClose={() => setShowHistory(false)}
              extraAction={
                searchHistory.length > 0 ? (
                  <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> 清空
                  </button>
                ) : undefined
              }
            >
              {searchHistory.length === 0 ? (
                <p className="text-center text-[var(--text-secondary)] py-8 text-sm">暂无搜索记录</p>
              ) : (
                <div className="space-y-1">
                  {searchHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleHistoryClick(item)}
                      className="w-full text-left p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                        <span className="text-sm font-medium truncate">{item.query}</span>
                        <span className="text-xs text-[var(--text-secondary)] ml-auto shrink-0">
                          {MODE_CONFIG[item.mode]?.label || item.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[var(--text-secondary)]">
                          {new Date(item.timestamp).toLocaleString('zh-CN')}
                        </span>
                        <span className="text-xs text-purple-500">{item.resultCount} 条结果</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </SidePanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── 诗词卡片组件 ──
function PoemCard({
  poem,
  isBookmarked,
  onToggleBookmark,
  onCopy,
  copied,
  index,
  query,
}: {
  poem: PoemRecord
  isBookmarked: boolean
  onToggleBookmark: () => void
  onCopy: () => void
  copied: boolean
  index: number
  query?: string
}) {
  const dynastyLabel = poem.dynasty ? `[${poem.dynasty}]` : ''
  const sourceLabel = poem.source ? poem.source : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className="card p-5 hover:shadow-md transition-shadow"
    >
      {/* 标题行 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            《{poem.title || '无题'}》
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {poem.author && (
              <span className="text-sm text-[var(--text-secondary)]">{poem.author}</span>
            )}
            {dynastyLabel && (
              <span className="text-xs px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded">
                {dynastyLabel}
              </span>
            )}
            {poem.rhythmic && (
              <span className="text-xs text-[var(--text-secondary)]">{poem.rhythmic}</span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onToggleBookmark}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : 'text-[var(--text-secondary)] hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            }`}
            title={isBookmarked ? '取消收藏' : '收藏'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={onCopy}
            className={`p-1.5 rounded-lg transition-colors ${
              copied
                ? 'text-green-500 bg-green-50 dark:bg-green-900/20'
                : 'text-[var(--text-secondary)] hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
            title={copied ? '已复制' : '复制'}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 匹配位置提示 */}
      {poem.match_line && (
        <div className="text-xs text-purple-500 mb-2 flex items-center gap-1">
          <Hash className="w-3 h-3" />
          第 {poem.match_line} 行匹配
        </div>
      )}

      {/* 诗词正文 */}
      <div className="space-y-1">
        {poem.paragraphs.map((line, li) => (
          <p
            key={li}
            className={`text-[var(--text-primary)] leading-relaxed ${
              poem.match_line === li + 1 ? 'bg-purple-50 dark:bg-purple-900/10 -mx-2 px-2 rounded' : ''
            }`}
          >
            {line}
          </p>
        ))}
      </div>

      {/* 匹配片段 */}
      {poem.match_snippet && (
        <div className="mt-3 text-xs text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-2">
          <span className="opacity-60">匹配位置: </span>
          <span
            dangerouslySetInnerHTML={{
              __html: poem.match_snippet
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(query || '', (match) => `<mark class="bg-purple-200 dark:bg-purple-800 px-0.5 rounded">${match}</mark>`),
            }}
          />
        </div>
      )}
    </motion.div>
  )
}

// ── 侧栏面板组件 ──
function SidePanel({
  title,
  icon,
  children,
  onClose,
  extraAction,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  onClose: () => void
  extraAction?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30" />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl h-full overflow-hidden"
      >
        {/* 面板头部 */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="font-bold flex items-center gap-2 text-[var(--text-primary)]">
            {icon}
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {extraAction}
            <button onClick={onClose} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              ✕
            </button>
          </div>
        </div>
        {/* 面板内容 */}
        <div className="overflow-y-auto h-full pb-20 p-4">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}
