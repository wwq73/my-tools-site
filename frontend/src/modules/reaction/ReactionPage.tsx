import { useState, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  Ear,
  Shuffle,
  Volume2,
  VolumeX,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Zap,
  ChevronRight,
  BarChart3,
  Trash2,
} from 'lucide-react'
import { useReactionStore, getRandomWaitTime, getGrade, type TestMode, type TestState } from './ReactionStore'
import { audioEngine } from './AudioEngine'
import { StatsChart } from './StatsChart'

export function ReactionPage() {
  const [activeTab, setActiveTab] = useState<'test' | 'stats'>('test')
  const [showSettings, setShowSettings] = useState(false)

  const {
    testState,
    currentMode,
    reactionTime,
    records,
    soundEnabled,
    difficulty,
    setTestState,
    setCurrentMode,
    setReactionTime,
    addRecord,
    clearRecords,
    setSoundEnabled,
    setDifficulty,
    getStats,
  } = useReactionStore()

  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // 开始测试
  const startTest = useCallback(() => {
    audioEngine.resume()
    setTestState('waiting')
    setReactionTime(0)

    const waitTime = getRandomWaitTime(difficulty)

    timerRef.current = window.setTimeout(() => {
      if (currentMode === 'visual') {
        setTestState('ready')
        startTimeRef.current = performance.now()
      } else if (currentMode === 'audio') {
        if (soundEnabled) {
          audioEngine.playBeep()
        }
        setTestState('ready')
        startTimeRef.current = performance.now()
      } else {
        // mixed 模式：随机选择视觉或听觉
        const isVisual = Math.random() > 0.5
        if (isVisual) {
          setTestState('ready')
        } else {
          if (soundEnabled) {
            audioEngine.playBeep(1100, 0.2) // 不同频率区分
          }
          setTestState('ready')
        }
        startTimeRef.current = performance.now()
      }
    }, waitTime)
  }, [currentMode, difficulty, soundEnabled, setTestState, setReactionTime])

  // 处理点击
  const handleClick = useCallback(() => {
    if (testState === 'idle' || testState === 'result' || testState === 'too_early') {
      startTest()
      return
    }

    if (testState === 'waiting') {
      // 点击过早！
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (soundEnabled) {
        audioEngine.playError()
      }
      setTestState('too_early')

      const record = {
        id: Date.now().toString(),
        mode: currentMode,
        reactionTime: 0,
        timestamp: Date.now(),
        isValid: false,
      }
      addRecord(record)
      return
    }

    if (testState === 'ready') {
      const endTime = performance.now()
      const time = Math.round(endTime - startTimeRef.current)

      setReactionTime(time)
      setTestState('result')

      if (soundEnabled) {
        audioEngine.playSuccess()
      }

      const record = {
        id: Date.now().toString(),
        mode: currentMode,
        reactionTime: time,
        timestamp: Date.now(),
        isValid: true,
      }
      addRecord(record)
    }
  }, [testState, currentMode, soundEnabled, startTest, setTestState, setReactionTime, addRecord])

  // 键盘支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleClick()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClick])

  const stats = getStats(currentMode)
  const grade = reactionTime > 0 ? getGrade(reactionTime) : null
  const recentRecords = records.slice(0, 10)

  // 测试区域背景色
  const getTestAreaStyle = () => {
    switch (testState) {
      case 'idle':
        return 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
      case 'waiting':
        return 'bg-red-500/10 border-red-300 dark:border-red-700'
      case 'ready':
        return 'bg-green-500 border-green-600'
      case 'too_early':
        return 'bg-yellow-500/20 border-yellow-400'
      case 'result':
        return reactionTime < 250 
          ? 'bg-green-500/10 border-green-400' 
          : reactionTime < 350 
          ? 'bg-blue-500/10 border-blue-400'
          : 'bg-orange-500/10 border-orange-400'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
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
            <Zap className="w-6 h-6 text-yellow-500" />
            反应速度训练
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            测试并提升你的视觉和听觉反应速度
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            title={soundEnabled ? '关闭声音' : '开启声音'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-[var(--text-secondary)]" />
            ) : (
              <VolumeX className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Target className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'test'
              ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-1" />
          测试
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'stats'
              ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-1" />
          统计
          {records.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 
                             text-primary-700 dark:text-primary-300 text-xs rounded-full">
              {records.filter(r => r.isValid).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'test' ? (
        <div className="space-y-6">
          {/* 模式选择 */}
          <div className="flex flex-wrap gap-2">
            {([
              { mode: 'visual' as TestMode, label: '视觉测试', icon: Eye, desc: '屏幕变色' },
              { mode: 'audio' as TestMode, label: '听觉测试', icon: Ear, desc: '声音提示' },
              { mode: 'mixed' as TestMode, label: '混合模式', icon: Shuffle, desc: '随机视觉/听觉' },
            ]).map(({ mode, label, icon: Icon, desc }) => (
              <button
                key={mode}
                onClick={() => {
                  setCurrentMode(mode)
                  setTestState('idle')
                  if (timerRef.current) clearTimeout(timerRef.current)
                }}
                className={`flex-1 min-w-[120px] p-4 rounded-xl border-2 transition-all ${
                  currentMode === mode
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--text-secondary)]'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${
                  currentMode === mode ? 'text-primary-600' : 'text-[var(--text-secondary)]'
                }`} />
                <div className={`font-semibold text-sm ${
                  currentMode === mode ? 'text-primary-700 dark:text-primary-300' : 'text-[var(--text-primary)]'
                }`}>
                  {label}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{desc}</div>
              </button>
            ))}
          </div>

          {/* 设置面板 */}
          {showSettings && (
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] animate-fade-in">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">难度设置</h3>
              <div className="flex gap-2">
                {(['easy', 'normal', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      difficulty === d
                        ? 'bg-primary-600 text-white'
                        : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {d === 'easy' && '简单 (1.5-4s)'}
                    {d === 'normal' && '普通 (1-3s)'}
                    {d === 'hard' && '困难 (0.5-2.5s)'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                等待时间越短，对注意力的要求越高
              </p>
            </div>
          )}

          {/* 测试主区域 */}
          <div
            ref={containerRef}
            onClick={handleClick}
            className={`relative h-80 rounded-2xl border-2 cursor-pointer select-none
                       flex flex-col items-center justify-center transition-all duration-200
                       ${getTestAreaStyle()}`}
          >
            {testState === 'idle' && (
              <div className="text-center animate-fade-in">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full 
                                flex items-center justify-center mx-auto mb-4">
                  {currentMode === 'visual' && <Eye className="w-10 h-10 text-primary-600" />}
                  {currentMode === 'audio' && <Ear className="w-10 h-10 text-primary-600" />}
                  {currentMode === 'mixed' && <Shuffle className="w-10 h-10 text-primary-600" />}
                </div>
                <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  点击开始测试
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  或按空格键 / 回车键
                </p>
                <div className="mt-4 text-xs text-[var(--text-secondary)] space-y-1">
                  <p>• 屏幕变色{currentMode !== 'visual' && '或听到声音'}时立即点击</p>
                  <p>• 不要提前点击！</p>
                </div>
              </div>
            )}

            {testState === 'waiting' && (
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 border-4 border-red-400 border-t-transparent 
                                rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xl font-semibold text-red-500">
                  等待信号...
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  集中注意力！
                </p>
              </div>
            )}

            {testState === 'ready' && (
              <div className="text-center animate-fade-in">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center 
                                mx-auto mb-4 shadow-lg animate-pulse">
                  <Zap className="w-12 h-12 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-white">
                  立即点击！
                </p>
              </div>
            )}

            {testState === 'too_early' && (
              <div className="text-center animate-fade-in">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                  点击过早！
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  请等待信号出现后再点击
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startTest()
                  }}
                  className="mt-4 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 
                           text-yellow-700 dark:text-yellow-300 rounded-lg text-sm font-medium
                           hover:bg-yellow-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  重试
                </button>
              </div>
            )}

            {testState === 'result' && (
              <div className="text-center animate-fade-in">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: grade?.color + '20' }}
                >
                  <span className="text-3xl font-bold" style={{ color: grade?.color }}>
                    {reactionTime}
                  </span>
                  <span className="text-sm ml-1" style={{ color: grade?.color }}>ms</span>
                </div>

                <div 
                  className="inline-block px-4 py-1 rounded-full text-white font-bold text-lg mb-3"
                  style={{ backgroundColor: grade?.color }}
                >
                  {grade?.label}
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {reactionTime < 200 && '惊人的速度！你是天生的反应高手'}
                  {reactionTime >= 200 && reactionTime < 300 && '不错的成绩，继续训练可以更快'}
                  {reactionTime >= 300 && '还有提升空间，多加练习'}
                </p>

                <div className="flex items-center justify-center gap-4 text-sm text-[var(--text-secondary)]">
                  {stats.count > 0 && (
                    <>
                      <span>最佳: {stats.best}ms</span>
                      <span>平均: {stats.average}ms</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-[var(--text-secondary)] mt-4">
                  点击任意处开始下一次测试
                </p>
              </div>
            )}
          </div>

          {/* 快速统计 */}
          {stats.count > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard 
                icon={Trophy} 
                label="最佳成绩" 
                value={`${stats.best}ms`} 
                color="text-yellow-500" 
              />
              <StatCard 
                icon={TrendingUp} 
                label="平均成绩" 
                value={`${stats.average}ms`} 
                color="text-blue-500" 
              />
              <StatCard 
                icon={Clock} 
                label="测试次数" 
                value={`${stats.count}次`} 
                color="text-green-500" 
              />
              <StatCard 
                icon={Target} 
                label="当前模式" 
                value={currentMode === 'visual' ? '视觉' : currentMode === 'audio' ? '听觉' : '混合'} 
                color="text-purple-500" 
              />
            </div>
          )}

          {/* 最近记录 */}
          {recentRecords.length > 0 && (
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">最近记录</h3>
              <div className="space-y-2">
                {recentRecords.map((record) => {
                  const g = record.isValid ? getGrade(record.reactionTime) : null
                  return (
                    <div 
                      key={record.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        record.isValid ? 'bg-[var(--card-bg)]' : 'bg-yellow-50 dark:bg-yellow-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--text-secondary)] w-16">
                          {new Date(record.timestamp).toLocaleTimeString('zh-CN', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                        <span className="text-sm text-[var(--text-primary)]">
                          {record.mode === 'visual' && <Eye className="w-4 h-4 inline mr-1" />}
                          {record.mode === 'audio' && <Ear className="w-4 h-4 inline mr-1" />}
                          {record.mode === 'mixed' && <Shuffle className="w-4 h-4 inline mr-1" />}
                          {record.isValid ? (
                            <span className="font-mono font-bold">{record.reactionTime}ms</span>
                          ) : (
                            <span className="text-yellow-600">点击过早</span>
                          )}
                        </span>
                      </div>
                      {g && (
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: g.color + '20', color: g.color }}
                        >
                          {g.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 统计页面 */
        <div className="space-y-6 animate-fade-in">
          {/* 总体统计 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(['visual', 'audio', 'mixed'] as TestMode[]).map((mode) => {
              const s = getStats(mode)
              const labels = { visual: '视觉', audio: '听觉', mixed: '混合' }
              return (
                <div key={mode} className="bg-[var(--bg-secondary)] rounded-xl p-4">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">{labels[mode]}模式</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {s.count > 0 ? `${s.average}ms` : '-'}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    {s.count > 0 ? `${s.count}次测试` : '暂无数据'}
                  </div>
                </div>
              )
            })}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
              <div className="text-xs text-primary-600 dark:text-primary-400 mb-1">综合最佳</div>
              <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                {(() => {
                  const allStats = getStats()
                  return allStats.count > 0 ? `${allStats.best}ms` : '-'
                })()}
              </div>
              <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                {(() => {
                  const allStats = getStats()
                  return allStats.count > 0 ? `${allStats.count}次总测试` : '暂无数据'
                })()}
              </div>
            </div>
          </div>

          {/* 趋势图 */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">反应时间趋势</h3>
            <StatsChart records={records.filter(r => r.mode === currentMode)} />
          </div>

          {/* 分布统计 */}
          {records.filter(r => r.isValid).length > 5 && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">成绩分布</h3>
              <GradeDistribution records={records.filter(r => r.isValid)} />
            </div>
          )}

          {/* 清空数据 */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
                  clearRecords()
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 
                       dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              清空历史记录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 子组件：统计卡片
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType
  label: string
  value: string
  color: string 
}) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      </div>
      <div className="text-xl font-bold text-[var(--text-primary)]">{value}</div>
    </div>
  )
}

// 子组件：成绩分布
function GradeDistribution({ records }: { records: TestRecord[] }) {
  const grades = records.map(r => getGrade(r.reactionTime))
  const distribution = grades.reduce((acc, g) => {
    acc[g.label] = (acc[g.label] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = records.length
  const gradeOrder = ['神级', '职业级', '优秀', '良好', '一般', '需练习']

  return (
    <div className="space-y-3">
      {gradeOrder.map((label) => {
        const count = distribution[label] || 0
        const percentage = total > 0 ? (count / total) * 100 : 0
        const gradeInfo = getGrade(label === '神级' ? 100 : label === '职业级' ? 180 : 
                          label === '优秀' ? 220 : label === '良好' ? 270 : 
                          label === '一般' ? 350 : 400)

        if (count === 0) return null

        return (
          <div key={label} className="flex items-center gap-3">
            <span 
              className="w-16 text-sm font-medium text-right"
              style={{ color: gradeInfo.color }}
            >
              {label}
            </span>
            <div className="flex-grow h-6 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: gradeInfo.color,
                  opacity: 0.8
                }}
              >
                {percentage > 15 && (
                  <span className="text-xs text-white font-medium">{count}次</span>
                )}
              </div>
            </div>
            <span className="w-12 text-sm text-[var(--text-secondary)]">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
