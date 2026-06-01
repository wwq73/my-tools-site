import { X, Share2, Copy, Check, Brain, BookOpen, Eye, User, Compass, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { DreamRecord } from './DreamStore'

interface DreamResultProps {
  result: DreamRecord
  onClose: () => void
  fortuneColor: string
  fortuneBg: string
}

const SCHOOL_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  freud: {
    label: '弗洛伊德 · 精神分析',
    icon: <Brain className="w-4 h-4" />,
    color: 'text-purple-600 dark:text-purple-400'
  },
  jung: {
    label: '荣格 · 分析心理学',
    icon: <Eye className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400'
  },
  adler: {
    label: '阿德勒 · 个体心理学',
    icon: <User className="w-4 h-4" />,
    color: 'text-emerald-600 dark:text-emerald-400'
  },
  cognitive: {
    label: '认知心理学',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-amber-600 dark:text-amber-400'
  },
  existential: {
    label: '存在主义心理学',
    icon: <Compass className="w-4 h-4" />,
    color: 'text-rose-600 dark:text-rose-400'
  }
}

export function DreamResult({ result, onClose, fortuneColor, fortuneBg }: DreamResultProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = `【${result.keyword}】\n吉凶：${result.fortune}\n\n${result.interpretation}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `周公解梦 - ${result.keyword}`,
        text: result.interpretation.slice(0, 100) + '...',
        url: window.location.href
      })
    } else {
      handleCopy()
    }
  }

  return (
    <div className="animate-fade-in mb-8">
      <div className={`relative rounded-xl border-2 p-6 ${fortuneBg} shadow-sm`}>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{result.keyword}</h2>
          <div className="flex items-center justify-center gap-3">
            <span 
              className="px-4 py-1 rounded-full text-sm font-bold"
              style={{ color: fortuneColor, backgroundColor: fortuneColor + '25', border: `2px solid ${fortuneColor}40` }}
            >
              {result.fortune === '吉' && '✨ 大吉'}
              {result.fortune === '凶' && '⚠️ 凶兆'}
              {result.fortune === '中平' && '☯️ 中平'}
              {!['吉', '凶', '中平'].includes(result.fortune) && result.fortune}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {new Date(result.timestamp).toLocaleString('zh-CN')}
            </span>
          </div>
        </div>

        <div className="bg-[var(--bg-primary)]/60 rounded-xl p-5 border border-[var(--border-color)] mb-4">
          <div className="prose max-w-none">
            {result.interpretation.split('\n').map((paragraph, index) => (
              <p
                key={index}
                className={`text-[var(--text-primary)] leading-relaxed mb-3
                  ${paragraph.startsWith('【') ? 'font-bold text-lg mt-4 first:mt-0' : ''}
                `}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* 心理学多流派解析 */}
        {result.psychology && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              心理学深度解析
            </h3>
            <div className="space-y-2">
              {Object.entries(SCHOOL_CONFIG).map(([key, config]) => {
                const text = result.psychology?.[key as keyof typeof result.psychology]
                if (!text) return null
                return (
                  <details key={key} className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/40 overflow-hidden">
                    <summary className="flex items-center gap-2 p-3 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors text-sm font-medium text-[var(--text-primary)]">
                      <span className={config.color}>{config.icon}</span>
                      <span className={config.color}>{config.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto text-[var(--text-secondary)] transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-3 pb-3 text-sm text-[var(--text-primary)] leading-relaxed border-t border-[var(--border-color)] pt-2">
                      {text}
                    </div>
                  </details>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] 
                     border border-[var(--border-color)] text-[var(--text-primary)]
                     hover:bg-[var(--card-hover)] transition-colors text-sm font-medium"
          >
            {copied ? <><Check className="w-4 h-4" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制结果</>}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-sm"
          >
            <Share2 className="w-4 h-4" />
            分享
          </button>
        </div>
      </div>
    </div>
  )
}
