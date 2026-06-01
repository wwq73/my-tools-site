import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Search,
  History,
  Trash2,
  RotateCcw,
  Star,
  BookOpen,
  Info,
  Calendar,
  Baby,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Dna,
  Flame,
  Droplets,
  Mountain,
  Wind,
  CircleDot
} from 'lucide-react'
import { SEO } from '../../components/SEO'
import {
  useNameStore,
  calculateFiveGrid,
  analyzeWuxing,
  generateNameInterpretation,
  analyzeBazi,
  TIAN_GAN_WUXING,
  DI_ZHI_WUXING,
  type BaziAnalysis
} from './NameStore'

type TabMode = 'test' | 'bazi'

export function NamePage() {
  const [surname, setSurname] = useState('')
  const [name, setName] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [mode, setMode] = useState<TabMode>('test')

  // 八字输入
  const [birthYear, setBirthYear] = useState(2024)
  const [birthMonth, setBirthMonth] = useState(1)
  const [birthDay, setBirthDay] = useState(1)
  const [birthHour, setBirthHour] = useState(12)
  const [baziResult, setBaziResult] = useState<BaziAnalysis | null>(null)
  const [showBaziDetail, setShowBaziDetail] = useState(false)
  const [copied, setCopied] = useState(false)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [nameOptions, setNameOptions] = useState<{ name: string; fullName: string; score: number; fortune: string }[]>([])

  const {
    records,
    isLoading,
    currentResult,
    addRecord,
    setLoading,
    setCurrentResult,
    clearRecords
  } = useNameStore()

  const handleTest = async () => {
    if (!surname.trim() || !name.trim()) return
    setLoading(true)
    setCurrentResult(null)
    await new Promise(resolve => setTimeout(resolve, 1500))
    const scores = calculateFiveGrid(surname, name)
    const wuxing = analyzeWuxing(surname, name)
    const interpretation = generateNameInterpretation(surname, name, scores, wuxing)
    const result = {
      id: Date.now().toString(),
      surname,
      name,
      fullName: surname + name,
      scores,
      wuxing,
      fortune: scores.total >= 80 ? '吉' : scores.total >= 60 ? '中平' : '凶',
      summary: interpretation,
      timestamp: Date.now()
    }
    setCurrentResult(result)
    addRecord(result)
    setLoading(false)
  }

  // 性别偏好的常用起名用字（按五行分组）
  const GENDER_CHARS: Record<string, Record<string, string[]>> = {
    male: {
      '金': ['铭', '锐', '锦', '钧', '铮', '铄', '钰', '铠', '瑞', '鑫'],
      '木': ['梓', '林', '柏', '松', '枫', '楠', '栋', '杰', '荣', '棋'],
      '水': ['浩', '海', '涛', '源', '鸿', '瀚', '泽', '涵', '博', '澜'],
      '火': ['煜', '炜', '炫', '炯', '炳', '焕', '烨', '煊', '煌', '炎'],
      '土': ['坤', '培', '基', '城', '圣', '伟', '硕', '峰', '磊', '安']
    },
    female: {
      '金': ['鑫', '钰', '瑞', '瑜', '琪', '瑶', '琳', '璇', '瑛', '琦'],
      '木': ['梓', '欣', '萱', '蓉', '薇', '芷', '若', '艺', '芊', '菲'],
      '水': ['涵', '淑', '清', '澜', '洁', '涓', '沁', '汐', '洛', '溪'],
      '火': ['彤', '婷', '晶', '玲', '妮', '炫', '灵', '灿', '暖', '旻'],
      '土': ['婉', '安', '韵', '懿', '恩', '悠', '悦', '怡', '婉', '育']
    }
  }

  // 根据性别+喜用神生成3个名字建议
  const generateNameSuggestions = (surname: string, bazi: BaziAnalysis, gender: 'male' | 'female') => {
    const pool = GENDER_CHARS[gender]
    const preferredWuxing = bazi.xiyongshen

    // 从喜用神五行中收集可用字
    const availableChars: string[] = []
    for (const wx of preferredWuxing) {
      if (pool[wx]) {
        availableChars.push(...pool[wx])
      }
    }
    // 如果喜用神字不够，从所有五行补充
    if (availableChars.length < 6) {
      for (const [, chars] of Object.entries(pool)) {
        availableChars.push(...chars)
      }
    }

    const unique = [...new Set(availableChars)]
    const shuffled = [...unique].sort(() => Math.random() - 0.5)

    const options: { name: string; fullName: string; score: number; fortune: string }[] = []

    for (let i = 0; i < shuffled.length && options.length < 20; i++) {
      for (let j = i + 1; j < shuffled.length && options.length < 20; j++) {
        const givenName = shuffled[i] + shuffled[j]
        const scores = calculateFiveGrid(surname, givenName)
        const totalScore = scores.total
        const fortune = totalScore >= 80 ? '吉' : totalScore >= 60 ? '中平' : '凶'
        options.push({ name: givenName, fullName: surname + givenName, score: totalScore, fortune })
      }
    }

    // 按分数从高到低排序取前3
    options.sort((a, b) => b.score - a.score)
    return options.slice(0, 3)
  }

  const handleBaziTest = async () => {
    if (!surname.trim()) return
    setLoading(true)
    setBaziResult(null)
    setNameOptions([])
    await new Promise(resolve => setTimeout(resolve, 1500))
    const bazi = analyzeBazi({
      year: birthYear,
      month: birthMonth,
      day: birthDay,
      hour: birthHour
    })
    setBaziResult(bazi)
    // 根据性别+八字生成3个名字建议
    const suggestions = generateNameSuggestions(surname, bazi, gender)
    setNameOptions(suggestions)
    setLoading(false)
  }

  const handleReset = () => {
    setSurname('')
    setName('')
    setCurrentResult(null)
    setBaziResult(null)
  }

  const handleCopyBazi = () => {
    if (!baziResult) return
    navigator.clipboard.writeText(baziResult.baziText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500'
    if (score >= 80) return 'text-blue-500'
    if (score >= 70) return 'text-yellow-500'
    if (score >= 60) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200'
    if (score >= 80) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200'
    if (score >= 70) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200'
    if (score >= 60) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200'
    return 'bg-red-50 dark:bg-red-900/20 border-red-200'
  }

  const getWuxingColor = (wx: string) => {
    const map: Record<string, string> = {
      '金': 'text-amber-600 bg-amber-50 border-amber-200',
      '木': 'text-emerald-600 bg-emerald-50 border-emerald-200',
      '水': 'text-blue-600 bg-blue-50 border-blue-200',
      '火': 'text-red-600 bg-red-50 border-red-200',
      '土': 'text-yellow-700 bg-yellow-50 border-yellow-200'
    }
    return map[wx] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getWuxingIcon = (wx: string) => {
    if (wx === '金') return <CircleDot className="w-4 h-4" />
    if (wx === '木') return <Wind className="w-4 h-4" />
    if (wx === '水') return <Droplets className="w-4 h-4" />
    if (wx === '火') return <Flame className="w-4 h-4" />
    if (wx === '土') return <Mountain className="w-4 h-4" />
    return <CircleDot className="w-4 h-4" />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <SEO
        title="姓名测试打分 - 五格姓名学 · 生辰八字起名"
        description="免费在线姓名测试打分，根据五格姓名学和周易五行分析名字吉凶。支持生辰八字输入，结合八字喜用神智能推荐起名用字。"
        keywords="姓名测试,名字打分,五格姓名学,起名,周易五行,生辰八字,八字起名,免费测名"
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
            姓名测试打分
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            五格姓名学 · 周易五行 · 生辰八字起名
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
              测试历史
            </h3>
            <button
              onClick={clearRecords}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              清空
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {records.map((record) => (
              <button
                key={record.id}
                onClick={() => {
                  setMode('test')
                  setCurrentResult(record)
                  setSurname(record.surname)
                  setName(record.name)
                  setBaziResult(null)
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${getScoreBg(record.scores.total)}`}
              >
                <span className={getScoreColor(record.scores.total)}>
                  {record.fullName} {record.scores.total}分
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 模式切换 */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-1 mb-6 flex">
        <button
          onClick={() => { setMode('test'); handleReset() }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'test'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Search className="w-4 h-4 inline mr-1.5" />
          姓名测试
        </button>
        <button
          onClick={() => { setMode('bazi'); handleReset() }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'bazi'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Dna className="w-4 h-4 inline mr-1.5" />
          八字起名
        </button>
      </div>

      {/* ========== 姓名测试模式 ========== */}
      {mode === 'test' && !currentResult && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary-500" />
            输入姓名
          </h2>
          <div className="flex gap-4 mb-4">
            <div className="w-24">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">姓氏</label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="如：李"
                className="input text-center text-lg py-3"
              />
            </div>
            <div className="flex-grow">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">名字</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：子轩"
                className="input text-lg py-3"
              />
            </div>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-1">
              <Info className="w-4 h-4" />
              测试说明
            </h3>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 根据五格姓名学（天格、人格、地格、外格、总格）进行测算</li>
              <li>• 结合周易五行之数分析吉凶</li>
              <li>• 笔画数按《康熙字典》计算</li>
              <li>• 目前仅支持简体字测试</li>
              <li>• 测试结果仅供参考，切勿过度迷信</li>
            </ul>
          </div>
          <button
            onClick={handleTest}
            disabled={isLoading || !surname.trim() || !name.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isLoading ? '测算中...' : '开始测试'}
          </button>
        </div>
      )}

      {/* ========== 八字起名模式 ========== */}
      {mode === 'bazi' && !baziResult && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            输入生辰八字
          </h2>

          <div className="mb-4">
            <label className="block text-sm text-[var(--text-secondary)] mb-1">姓氏（必填）</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="如：李"
              className="input text-lg py-3"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">年</label>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(Math.max(1900, Math.min(2100, parseInt(e.target.value) || 2024)))}
                min={1900}
                max={2100}
                className="input text-center"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">月</label>
              <input
                type="number"
                value={birthMonth}
                onChange={(e) => setBirthMonth(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                min={1}
                max={12}
                className="input text-center"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">日</label>
              <input
                type="number"
                value={birthDay}
                onChange={(e) => setBirthDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                min={1}
                max={31}
                className="input text-center"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">时（0-23）</label>
              <input
                type="number"
                value={birthHour}
                onChange={(e) => setBirthHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                min={0}
                max={23}
                className="input text-center"
              />
            </div>
          </div>

          {/* 性别选择 */}
          <div className="mb-4">
            <label className="block text-sm text-[var(--text-secondary)] mb-2">性别</label>
            <div className="flex gap-4">
              <label
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  gender === 'male'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-700 dark:text-blue-300'
                    : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="sr-only"
                />
                <span className="text-lg">♂</span>
                <span className="font-medium">男</span>
              </label>
              <label
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  gender === 'female'
                    ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-400 text-pink-700 dark:text-pink-300'
                    : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-pink-300'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="sr-only"
                />
                <span className="text-lg">♀</span>
                <span className="font-medium">女</span>
              </label>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-1">
              <Info className="w-4 h-4" />
              八字起名说明
            </h3>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 输入出生年月日时（公历），系统自动排八字</li>
              <li>• 分析八字五行强弱，找出喜用神</li>
              <li>• 根据喜用神推荐适合的起名用字</li>
              <li>• 结合五格姓名学，给出综合评分</li>
              <li>• 结果仅供参考，切勿过度迷信</li>
            </ul>
          </div>

          <button
            onClick={handleBaziTest}
            disabled={isLoading || !surname.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Dna className="w-5 h-5" />}
            {isLoading ? '排盘中...' : '八字排盘'}
          </button>
        </div>
      )}

      {/* ========== 八字结果展示 ========== */}
      {mode === 'bazi' && baziResult && (
        <div className="space-y-6 animate-fade-in">
          {/* 八字盘 */}
          <div className="bg-[var(--card-bg)] border-2 border-primary-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Dna className="w-6 h-6 text-primary-500" />
                八字命盘
              </h2>
              <button
                onClick={handleReset}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                重新输入
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-2xl font-mono font-bold text-[var(--text-primary)] tracking-wider">
                {baziResult.baziText}
              </p>
              <button
                onClick={handleCopyBazi}
                className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                title="复制八字"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {['年柱', '月柱', '日柱', '时柱'].map((label, i) => {
                const pillars = [baziResult.bazi.year, baziResult.bazi.month, baziResult.bazi.day, baziResult.bazi.hour]
                const p = pillars[i]
                return (
                  <div key={label} className="text-center">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
                    <div className="bg-[var(--bg-secondary)] rounded-lg p-2">
                      <p className="text-lg font-bold text-[var(--text-primary)]">{p.gan}</p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">{p.zhi}</p>
                    </div>
                    <div className="flex justify-center gap-1 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${getWuxingColor(TIAN_GAN_WUXING[p.gan])}`}>
                        {TIAN_GAN_WUXING[p.gan]}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${getWuxingColor(DI_ZHI_WUXING[p.zhi])}`}>
                        {DI_ZHI_WUXING[p.zhi]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Baby className="w-4 h-4" />
              <span>日主：<strong className="text-[var(--text-primary)]">{baziResult.dayMaster}</strong>（{baziResult.dayMasterWuxing}）</span>
            </div>
          </div>

          {/* 五行统计 */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary-500" />
              五行统计
            </h3>
            <div className="grid grid-cols-5 gap-3 mb-4">
              {(['金', '木', '水', '火', '土'] as const).map((wx) => (
                <div key={wx} className="text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full border mb-2 ${getWuxingColor(wx)}`}>
                    {getWuxingIcon(wx)}
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{wx}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{baziResult.wuxingCount[wx]}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-lg p-3">
              {baziResult.wuxingSummary}
            </p>
          </div>

          {/* 喜用神分析 */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              喜用神分析
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">✅ 喜用神（宜用）</p>
                <div className="flex flex-wrap gap-2">
                  {baziResult.xiyongshen.map((wx) => (
                    <span key={wx} className={`px-3 py-1 rounded-full text-sm font-medium border ${getWuxingColor(wx)}`}>
                      {wx}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">❌ 忌神（忌用）</p>
                <div className="flex flex-wrap gap-2">
                  {baziResult.jishen.map((wx) => (
                    <span key={wx} className={`px-3 py-1 rounded-full text-sm font-medium border ${getWuxingColor(wx)}`}>
                      {wx}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-lg p-3 leading-relaxed">
              {baziResult.nameAdvice}
            </p>
          </div>

          {/* 推荐用字 */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              推荐起名用字
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              以下汉字五行属{baziResult.recommendedWuxing.join('、')}，适合作为名字用字：
            </p>
            <div className="flex flex-wrap gap-2">
              {baziResult.recommendedChars.map((char) => (
                <button
                  key={char}
                  onClick={() => {
                    setName(char)
                    setMode('test')
                  }}
                  className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-primary-100 dark:hover:bg-primary-900/30 
                    border border-[var(--border-color)] hover:border-primary-300 transition-all text-lg font-medium
                    text-[var(--text-primary)]"
                  title={`点击使用「${char}」进行姓名测试`}
                >
                  {char}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-3">
              💡 点击任意汉字可直接填入名字进行五格测试
            </p>
          </div>

          {/* 名字建议 */}
          {nameOptions.length > 0 && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                推荐名字（{gender === 'male' ? '♂ 男' : '♀ 女'}）
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {nameOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setName(opt.name)
                      setMode('test')
                    }}
                    className={`group p-4 rounded-xl border-2 text-center transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 ${
                      opt.score >= 80
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                        : opt.score >= 60
                        ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30'
                    }`}
                  >
                    <p className="text-lg font-bold text-[var(--text-primary)] mb-1">
                      {opt.fullName}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-bold ${
                        opt.score >= 80 ? 'text-emerald-600' : opt.score >= 60 ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        {opt.score}分
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        opt.fortune === '吉' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : opt.fortune === '凶' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {opt.fortune}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 group-hover:text-primary-500 transition-colors">
                      点击查看详细测评 →
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-3 text-center">
                💡 以上名字已结合八字喜用神和性别偏好推荐，点击即可查看五格评分详情
              </p>
            </div>
          )}

          {/* 八字详情（可展开） */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowBaziDetail(!showBaziDetail)}
              className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Info className="w-5 h-5 text-primary-500" />
                八字详细解析
              </h3>
              {showBaziDetail ? <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />}
            </button>
            {showBaziDetail && (
              <div className="p-4 pt-0 border-t border-[var(--border-color)]">
                <div className="prose max-w-none text-sm text-[var(--text-primary)] leading-relaxed space-y-2">
                  <p><strong>年柱</strong>：{baziResult.bazi.year.gan}{baziResult.bazi.year.zhi} — 代表祖上、父母、童年运势</p>
                  <p><strong>月柱</strong>：{baziResult.bazi.month.gan}{baziResult.bazi.month.zhi} — 代表兄弟姐妹、青年运势</p>
                  <p><strong>日柱</strong>：{baziResult.bazi.day.gan}{baziResult.bazi.day.zhi} — 代表自己、配偶、中年运势（日主为{baziResult.dayMaster}）</p>
                  <p><strong>时柱</strong>：{baziResult.bazi.hour.gan}{baziResult.bazi.hour.zhi} — 代表子女、晚年运势</p>
                  <p className="mt-4 text-[var(--text-secondary)]">
                    根据八字五行分析，您的命局{baziResult.wuxingSummary}。
                    喜用神为{baziResult.xiyongshen.join('、')}，起名时应优先选用这些五行属性的汉字，
                    以补足命局不足，增强运势。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 提示 */}
          <div className="text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              💡 八字起名仅供参考，切勿过度迷信。好名字需要兼顾音韵、寓意和文化内涵。
            </p>
          </div>
        </div>
      )}

      {/* ========== 姓名测试结果展示 ========== */}
      {mode === 'test' && currentResult && (
        <div className="space-y-6 animate-fade-in">
          {/* 综合评分 */}
          <div className={`bg-[var(--card-bg)] border-2 rounded-xl p-6 ${getScoreBg(currentResult.scores.total)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {currentResult.fullName}
              </h2>
              <button
                onClick={handleReset}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                再测一个
              </button>
            </div>

            <div className="text-center mb-4">
              <div className={`text-6xl font-bold ${getScoreColor(currentResult.scores.total)}`}>
                {currentResult.scores.total}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">综合评分</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(currentResult.scores.total / 20)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: '天格', ...currentResult.scores.tiange },
                { label: '人格', ...currentResult.scores.renge },
                { label: '地格', ...currentResult.scores.dige },
                { label: '外格', ...currentResult.scores.waige },
                { label: '总格', ...currentResult.scores.zongge }
              ].map((grid, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <p className="text-xs text-[var(--text-secondary)]">{grid.label}</p>
                  <p className={`text-lg font-bold ${getScoreColor(grid.score)}`}>{grid.score}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{grid.wuxing} · {grid.fortune}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 五行分析 */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              五行分析
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 rounded-lg bg-[var(--bg-secondary)]">
                <p className="text-sm text-[var(--text-secondary)]">姓氏五行</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{currentResult.wuxing.surnameWuxing}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--bg-secondary)]">
                <p className="text-sm text-[var(--text-secondary)]">名字五行</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{currentResult.wuxing.nameWuxing}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--bg-secondary)]">
                <p className="text-sm text-[var(--text-secondary)]">五行关系</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{currentResult.wuxing.balance}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-lg p-3">
              {currentResult.wuxing.advice}
            </p>
          </div>

          {/* 详细解析 */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              详细解析
            </h3>
            <div className="prose max-w-none">
              {currentResult.summary.split('\n').map((paragraph, index) => (
                <p
                  key={index}
                  className={`text-[var(--text-primary)] leading-relaxed mb-2
                    ${paragraph.startsWith('【') ? 'font-bold mt-4 first:mt-0' : ''}
                  `}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* 提示 */}
          <div className="text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              💡 姓名测试仅供参考，切勿过度迷信。真正的人生掌握在自己手中。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
