import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  RotateCcw,
  ChevronRight,
  History,
  Trash2,
  BookOpen,
  HelpCircle
} from 'lucide-react'
import { SEO } from '../../components/SEO'
import { useDivinationStore, generateYaoWithSteps, assembleResult, generateDivinationInterpretation, type Yao, type DivinationRecord } from './DivinationStore'

export function DivinationPage() {
  const [question, setQuestion] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const {
    records,
    currentStep,
    currentYao,
    currentDetail,
    currentQuestion,
    currentResult,
    addRecord,
    setCurrentStep,
    addYao,
    setCurrentDetail,
    resetYao,
    setCurrentQuestion,
    setCurrentResult,
    clearRecords
  } = useDivinationStore()

  const handleStartDivination = () => {
    if (!question.trim()) return
    setCurrentQuestion(question)
    resetYao()
    setCurrentStep(1)
    setCurrentResult(null)
  }

  const handleShake = async () => {
    if (currentStep > 6) return

    setIsShaking(true)
    setCurrentDetail(null)

    // 模拟摇卦过程
    await new Promise(resolve => setTimeout(resolve, 1600))

    const { yao, detail } = generateYaoWithSteps()
    yao.position = currentStep
    addYao(yao)
    setCurrentDetail(detail)

    // 短暂展示三变过程后翻篇
    await new Promise(resolve => setTimeout(resolve, 800))

    if (currentStep >= 6) {
      const yaoList = [...currentYao, yao]
      const guaResult = assembleResult(yaoList)
      const interpretation = generateDivinationInterpretation(currentQuestion, guaResult)

      const result: DivinationRecord = {
        id: Date.now().toString(),
        question: currentQuestion,
        yaoList,
        guaResult,
        timestamp: Date.now(),
        interpretation
      }

      setCurrentResult(result)
      addRecord(result)
    }

    setCurrentStep(currentStep + 1)
    setIsShaking(false)
  }

  const handleReset = () => {
    resetYao()
    setQuestion('')
    setCurrentQuestion('')
    setCurrentResult(null)
  }

  const getYaoSymbol = (yao: Yao) => {
    if (yao.isChanging) {
      return yao.value === 6 ? '⚋ ⚋' : '⚊ ⚊'  // 老阴/老阳显示变爻
    }
    return yao.symbol
  }

  const getYaoClass = (yao: Yao) => {
    if (yao.isChanging) {
      return 'text-red-500 font-bold'
    }
    return yao.value % 2 === 1 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <SEO 
        title="大衍筮法 - 易经占卜"
        description="免费在线易经占卜，使用大衍筮法（蓍草占卜）进行六爻占卦。心诚则灵，知天命。"
        keywords="易经占卜,大衍筮法,六爻,占卦,免费占卜,在线算卦,周易"
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <div className="flex-grow">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            大衍筮法
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            易经占卜 · 知天命 · 心诚则灵
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-2 rounded-lg transition-colors ${
            showHistory ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-[var(--bg-secondary)]'
          }`}
        >
          <History className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* 历史记录 */}
      {showHistory && records.length > 0 && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              占卦历史
            </h3>
            <button
              onClick={clearRecords}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              清空
            </button>
          </div>
          <div className="space-y-2">
            {records.map((record) => (
              <button
                key={record.id}
                onClick={() => setCurrentResult(record)}
                className="w-full text-left p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:shadow-sm transition-all"
              >
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{record.question}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {record.guaResult.primary.name}卦 {record.guaResult.changed ? `→ ${record.guaResult.changed.name}卦` : ''}
                  <span className="ml-2">{new Date(record.timestamp).toLocaleDateString()}</span>
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 占卦流程 */}
      {!currentResult && (
        <div className="space-y-6">
          {/* 步骤1：输入问题 */}
          {currentStep === 0 && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-500" />
                静心凝神
              </h2>

              <p className="text-sm text-[var(--text-secondary)] mb-4">
                大衍之数五十，其用四十有九。请在下方输入您想要占卜的问题，心诚则灵。
              </p>

              <div className="mb-4">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="请输入您想要占卜的问题..."
                  maxLength={100}
                  className="input w-full h-24 resize-none"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1 text-right">
                  {question.length}/100
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">📝 问题示例</h3>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>• 我是否应该接受这份新工作？</li>
                  <li>• 这段感情未来如何发展？</li>
                  <li>• 近期创业时机是否成熟？</li>
                  <li>• 是否适合在本年换城市发展？</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">💡 写作指引</h3>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  <li>• 问题要具体明确，避免模糊笼统</li>
                  <li>• 一次只问一件事，不要多问</li>
                  <li>• 用疑问句表达，如"是否"、"如何"</li>
                  <li>• 带着诚心和敬意，不要轻慢</li>
                  <li>• 同一问题不要反复占卜</li>
                </ul>
              </div>

              <button
                onClick={handleStartDivination}
                disabled={!question.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                开始占卦
              </button>
            </div>
          )}

          {/* 步骤2-7：摇卦 */}
          {currentStep > 0 && currentStep <= 6 && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  第 {currentStep} 爻 / 共 6 爻
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {currentQuestion}
                </p>
              </div>

              {/* 已摇出的爻 */}
              {currentYao.length > 0 && (
                <div className="flex justify-center gap-4 mb-6">
                  {currentYao.map((yao, index) => (
                    <div key={index} className={`text-2xl ${getYaoClass(yao)}`}>
                      {getYaoSymbol(yao)}
                    </div>
                  ))}
                </div>
              )}

              {/* 三变过程展示 */}
              {currentDetail && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6 animate-fade-in">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3 text-center">
                    第 {currentStep} 爻 · 大衍筮法三变
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {currentDetail.steps.map((s, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-amber-200 dark:border-amber-800">
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
                          第{s.step}变
                        </p>
                        <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                          <p>总策 <span className="font-mono text-[var(--text-primary)]">{s.totalBefore}</span></p>
                          <p>分二 <span className="font-mono text-[var(--text-primary)]">{s.left}</span> | <span className="font-mono text-[var(--text-primary)]">{s.right}</span></p>
                          <p>揲四 余<span className="font-mono text-[var(--text-primary)]">{s.leftRemainder}</span> | 余<span className="font-mono text-[var(--text-primary)]">{s.rightRemainder}</span></p>
                          <p>归奇 <span className="font-mono text-[var(--text-primary)]">{s.guiQi}</span> 策</p>
                          <p className="text-amber-600 dark:text-amber-400 font-bold">
                            → 余 <span className="font-mono">{s.totalAfter}</span> 策
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      三变余策 <span className="font-bold font-mono">{currentDetail.finalRemainder}</span>
                      {' '}→ <span className="font-bold">{currentDetail.value}</span>
                      （{currentDetail.value === 6 ? '老阴 ⚋⚋' : currentDetail.value === 7 ? '少阳 ⚊' : currentDetail.value === 8 ? '少阴 ⚋' : '老阳 ⚊⚊'}）
                    </p>
                  </div>
                </div>
              )}

              {/* 摇卦按钮 */}
              <div className="text-center">
                <button
                  onClick={handleShake}
                  disabled={isShaking}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 
                           hover:from-amber-500 hover:to-orange-600
                           disabled:opacity-70
                           text-white font-bold text-lg
                           shadow-lg shadow-amber-500/30
                           transition-all active:scale-95
                           flex items-center justify-center"
                >
                  {isShaking ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <span>摇卦</span>
                  )}
                </button>
                <p className="text-xs text-[var(--text-secondary)] mt-4">
                  点击按钮，模拟大衍筮法（蓍草占卜）
                </p>
              </div>

              {/* 重置按钮 */}
              <button
                onClick={handleReset}
                className="mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] 
                         flex items-center justify-center gap-1 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重新开始
              </button>
            </div>
          )}
        </div>
      )}

      {/* 占卦结果 */}
      {currentResult && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">占卦结果</h2>
            <button
              onClick={handleReset}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] 
                       flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              再占一卦
            </button>
          </div>

          {/* 问题 */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-4">
            <p className="text-sm text-[var(--text-secondary)]">占问</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{currentResult.question}</p>
          </div>

          {/* 卦象 */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1">本卦</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{currentResult.guaResult.primary.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{currentResult.guaResult.primary.fortune}</p>
            </div>
            {currentResult.guaResult.changed && (
              <>
                <div className="flex items-center text-2xl text-[var(--text-secondary)]">
                  <ChevronRight className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">变卦</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)]">{currentResult.guaResult.changed.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{currentResult.guaResult.changed.fortune}</p>
                </div>
              </>
            )}
          </div>

          {/* 六爻 */}
          <div className="flex justify-center gap-3 mb-6">
            {[...currentResult.yaoList].sort((a, b) => a.position - b.position).map((yao, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl mb-1 ${getYaoClass(yao)}`}>
                  {getYaoSymbol(yao)}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {['初', '二', '三', '四', '五', '上'][index]}爻
                </p>
                {yao.isChanging && (
                  <p className="text-xs text-red-500 font-medium">{yao.type}</p>
                )}
              </div>
            ))}
          </div>

          {/* 解析 */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">详细解析</h3>
            <div className="prose max-w-none">
              {currentResult.interpretation.split('\n').map((paragraph, index) => (
                <p key={index} className="text-[var(--text-primary)] leading-relaxed mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* 提示 */}
          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              💭 心诚则灵，占卦结果仅供参考。真正的命运掌握在自己手中。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
