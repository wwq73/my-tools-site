import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Sparkles,
  Loader2,
  BookOpen,
  History,
  Trash2,
  Wand2,
  Scroll,
  Baby
} from 'lucide-react'
import { useDreamStore, type DreamRecord } from './DreamStore'
import { DreamResult } from './DreamResult'
import dreamData from '../../data/dream_interpretations_full.json'

// 构建关键词查找表
type DreamInterpretation = { keyword: string; original_summary: string; original_fortune: string; category: string; interpretations: Record<string, string> }
const dreamLookup = new Map<string, DreamInterpretation>()
;(dreamData as DreamInterpretation[]).forEach(item => {
  dreamLookup.set(item.keyword, item)
})

// 同义词归一化：将用户输入的口语/书面语统一映射到数据中的关键词
const SYNONYM_MAP: Record<string, string[]> = {
  "妈妈": ["妈妈", "母亲", "我妈", "娘", "母亲"],
  "爸爸": ["爸爸", "父亲", "我爸", "爹", "父亲"],
  "死人": ["死人", "死者", "过世的人", "亡人", "去世的人"],
  "结婚": ["结婚", "婚礼", "成亲", "嫁娶", "娶媳妇"],
  "怀孕": ["怀孕", "有孕", "怀孩子", "怀娃", "有喜"],
  "老板": ["老板", "上司", "领导", "主管", "上级"],
  "同事": ["同事", "同僚", "工友", "搭档", "同仁"],
  "朋友": ["朋友", "好友", "哥们儿", "闺蜜", "伙伴"],
  "陌生人": ["陌生人", "生人", "不认识的人", "陌生面孔", "素不相识的人"],
  "婴儿": ["婴儿", "宝宝", "小孩", "娃娃", "新生儿"],
  "老人": ["老人", "长者", "老头老太太", "老人家", "长辈"],
  "明星": ["明星", "名人", "演员", "偶像", "歌星"],
  "蛇": ["蛇", "长虫", "蛇类", "蛇缠身", "蟒蛇"],
  "狗": ["狗", "狗狗", "小狗", "犬", "狼狗"],
  "被狗咬": ["被狗咬", "狗咬自己", "狗追咬", "被狗攻击", "狗咬我"],
  "猫": ["猫", "猫咪", "小猫", "猫科", "野猫"],
  "鱼": ["鱼", "鱼儿", "大鱼", "金鱼", "鱼游"],
  "老虎": ["老虎", "虎", "大老虎", "猛虎", "虎啸"],
  "龙": ["龙", "巨龙", "金龙", "神龙", "飞龙"],
  "凤凰": ["凤凰", "凤", "神鸟", "火凤", "彩凤"],
  "老鼠": ["老鼠", "耗子", "小鼠", "老鼠洞", "米老鼠"],
  "鸟": ["鸟", "小鸟", "飞鸟", "鸟类", "雀"],
  "蝴蝶": ["蝴蝶", "花蝴蝶", "蝴蝶飞", "彩蝶", "蝶"],
  "蜘蛛": ["蜘蛛", "蜘蛛网", "大蜘蛛", "蛛蛛", "毒蜘蛛"],
  "蜜蜂": ["蜜蜂", "蜂", "马蜂", "小蜜蜂", "蜂群"],
  "马": ["马", "骏马", "白马", "骑马", "马车"],
  "花": ["花", "花朵", "鲜花", "开花", "花瓣"],
  "树": ["树", "大树", "树木", "树枝", "树林"],
  "草": ["草", "青草", "草地", "草坪", "杂草"],
  "果实": ["果实", "水果", "果子", "野果", "硕果"],
  "竹子": ["竹子", "竹", "竹林", "翠竹", "竹节"],
  "莲花": ["莲花", "荷花", "莲", "荷", "莲叶"],
  "枯萎": ["枯萎", "凋谢", "干枯", "枯死", "衰败"],
  "手机": ["手机", "电话", "智能机", "手机响", "手机丢"],
  "钱": ["钱", "钞票", "人民币", "银子", "钱币"],
  "衣服": ["衣服", "衣裳", "衣物", "服装", "穿新衣"],
  "新房": ["新房", "新房子", "新宅", "搬家", "买新房"],
  "车": ["车", "汽车", "轿车", "车辆", "开车"],
  "钥匙": ["钥匙", "钥匙串", "开门钥匙", "钥匙丢了", "捡钥匙"],
  "镜子": ["镜子", "照镜子", "镜", "铜镜", "镜子里"],
  "书": ["书", "书本", "看书", "读", "书籍"],
  "刀": ["刀", "刀子", "匕首", "砍刀", "刀伤"],
  "戒指": ["戒指", "指环", "金戒指", "钻戒", "结婚戒指"],
  "棺材": ["棺材", "棺木", "寿材", "灵柩", "棺材板"],
  "考试": ["考试", "测验", "考卷", "考试题", "高考"],
  "考试失败": ["考试失败", "不及格", "考砸", "落榜", "考试没过"],
  "飞行": ["飞行", "飞翔", "飞", "飞起来", "上天"],
  "开车": ["开车", "驾驶", "驾车", "开车兜风", "赛车"],
  "游泳": ["游泳", "游水", "浮水", "下河", "洗澡"],
  "跑步": ["跑步", "奔跑", "快跑", "追逐", "操场上跑"],
  "跳舞": ["跳舞", "舞蹈", "舞", "蹦迪", "跳交谊舞"],
  "唱歌": ["唱歌", "唱K", "哼曲", "歌唱", "演唱会"],
  "打架": ["打架", "打斗", "互殴", "斗殴", "打仗"],
  "逃跑": ["逃跑", "逃走", "躲避", "逃命", "跑路"],
  "爬山": ["爬山", "登山", "攀山", "上山", "登高"],
  "坠落": ["坠落", "掉下来", "坠崖", "跌落", "摔下"],
  "吃饭": ["吃饭", "用餐", "进食", "聚餐", "美食"],
  "睡觉": ["睡觉", "睡眠", "打瞌睡", "床上躺", "休息"],
  "搬家": ["搬家", "迁居", "换房", "搬新家", "乔迁"],
  "旅行": ["旅行", "旅游", "出游", "远行", "度假"],
  "购物": ["购物", "逛街", "买东西", "超市", "血拼"],
  "做饭": ["做饭", "下厨", "炒菜", "煮饭", "烧菜"],
  "洗澡": ["洗澡", "淋浴", "泡澡", "冲凉", "沐浴"],
  "迟到": ["迟到", "晚到", "赶不上", "误点", "延误"],
  "水": ["水", "河", "湖水", "大海", "小溪"],
  "火": ["火", "大火", "火灾", "着火", "火焰"],
  "山": ["山", "大山", "山峰", "山崖", "山脉"],
  "地震": ["地震", "地动", "房屋摇晃", "地面裂开", "震感"],
  "下雨": ["下雨", "雨水", "暴雨", "细雨", "淋雨"],
  "雪": ["雪", "下雪", "大雪", "雪花", "雪地"],
  "风": ["风", "大风", "狂风", "台风", "刮风"],
  "太阳": ["太阳", "日头", "阳光", "日出", "烈日"],
  "月亮": ["月亮", "月光", "月", "满月", "弯月"],
  "彩虹": ["彩虹", "七彩桥", "雨后彩虹", "虹", "天桥"],
  "大海": ["大海", "海", "海洋", "无边海水", "海滨"],
  "洪水": ["洪水", "大水", "涨水", "水灾", "泛滥"],
  "鬼": ["鬼", "鬼怪", "幽灵", "鬼魂", "鬼影"],
  "鬼压床": ["鬼压床", "梦魇", "睡瘫", "被鬼压", "动弹不得"],
  "神仙": ["神仙", "神", "仙人", "天神", "菩萨"],
  "佛祖": ["佛祖", "佛", "如来", "佛陀", "弥勒"],
  "妖怪": ["妖怪", "妖", "魔", "怪物", "妖物"],
  "祖先": ["祖先", "先人", "祖宗", "已故亲人", "列祖列宗"],
  "房子": ["房子", "房屋", "住宅", "楼房", "别墅"],
  "桥": ["桥", "桥梁", "过桥", "桥塌", "石桥"],
  "坟墓": ["坟墓", "墓", "坟头", "墓地", "陵墓"],
  "学校": ["学校", "校园", "上学", "教室", "母校"],
  "医院": ["医院", "病院", "诊所", "住院", "病房"],
  "寺庙": ["寺庙", "庙宇", "寺院", "庵", "佛寺"],
  "电梯": ["电梯", "升降梯", "电梯故障", "直梯", "扶梯"],
  "楼梯": ["楼梯", "台阶", "楼道", "爬楼", "步梯"],
  "脱发": ["脱发", "掉发", "头发掉", "秃头", "头发稀疏"],
  "牙齿": ["牙齿", "掉牙", "牙掉", "牙齿松动", "缺牙"],
  "流血": ["流血", "出血", "伤口流血", "流了很多血", "血"],
  "分娩": ["分娩", "生孩子", "临产", "生娃", "生产"],
  "生病": ["生病", "得病", "患病", "卧床不起", "病痛"],
  "死亡": ["死亡", "去世", "离世", "死", "过世"],
  "整容": ["整容", "整形", "做脸", "医美", "打针"],
  "变胖": ["变胖", "发胖", "长胖", "体重增加", "臃肿"],
  "变瘦": ["变瘦", "瘦了", "减肥成功", "体态轻盈", "苗条"],
  "眼睛": ["眼睛", "眼", "眼球", "视力", "双目"],
  "耳朵": ["耳朵", "耳", "耳部", "听觉", "耳廓"]
}

/** 将搜索关键词归一化：遍历同义词列表，命中则返回数据中的标准关键词 */
function normalizeKeyword(keyword: string): string {
  for (const [standard, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (synonyms.some(s => keyword.includes(s))) {
      return keyword.replace(keyword, standard)
    }
  }
  return keyword
}

export function DreamPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    records,
    isLoading,
    currentResult,
    setLoading,
    setCurrentResult,
    addRecord,
    clearRecords
  } = useDreamStore()

  const interpretDream = async (keyword: string) => {
    setLoading(true)
    setCurrentResult(null)

    await new Promise(resolve => setTimeout(resolve, 1500))

    // 尝试匹配关键词（精确匹配 → 同义词匹配 → 包含匹配 → 退化为随机）
    const searchKey = `梦见${keyword}`
    let match: DreamInterpretation | undefined = dreamLookup.get(searchKey)
    // 同义词归一化后再试一次
    if (!match) {
      const normalized = normalizeKeyword(keyword)
      if (normalized !== keyword) {
        match = dreamLookup.get(`梦见${normalized}`)
        if (match) keyword = normalized
      }
    }
    // 模糊匹配
    if (!match) {
      match = (dreamData as DreamInterpretation[]).find(d =>
        d.keyword.includes(keyword) || keyword.includes(d.keyword.replace('梦见', ''))
      )
    }

    const result: DreamRecord = {
      id: Date.now().toString(),
      keyword: searchKey,
      description: searchKey,
      timestamp: Date.now(),
      ...(match
        ? {
            fortune: match.original_fortune,
            category: match.category,
            interpretation: `【周公解梦】\n${match.original_summary}`,
            psychology: { ...match.interpretations }
          }
        : (() => {
            const fortunes = ['吉', '凶', '中平'] as const
            const fortune = fortunes[Math.floor(Math.random() * fortunes.length)]
            return {
              fortune,
              category: 'other',
              interpretation: `【周公解梦】\n梦见${keyword}，主近期运势有变。此梦暗示你内心深处对${keyword}有所牵挂，或是现实中相关事物引起了你的注意。\n\n【心理学解析】\n在心理学视角下，梦境是潜意识的表达。梦见${keyword}可能反映了你近期的情绪状态或未解决的心理冲突。建议静心自省，关注内心感受。\n\n【运势指引】\n${fortune === '吉' ? '此梦预示好事将近，宜把握机遇。' : fortune === '凶' ? '此梦提醒需谨慎行事，防微杜渐。' : '此梦平平，无大吉大凶，顺其自然即可。'}`,
            }
          })())
    }

    setCurrentResult(result)
    addRecord(result)
    setLoading(false)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    const keyword = searchQuery.replace(/^梦见/, '').trim()
    interpretDream(keyword)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const getFortuneColor = (fortune: string) => {
    switch (fortune) {
      case '吉': return '#10b981'
      case '凶': return '#ef4444'
      case '中平': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getFortuneBg = (fortune: string) => {
    switch (fortune) {
      case '吉': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
      case '凶': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case '中平': return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
      default: return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header + 导航 */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <Link
          to="/"
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>

        <div className="flex-grow min-w-[200px]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            周公解梦
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            AI 智能解梦，输入梦境关键词即可解析
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/fortune"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/30 dark:to-amber-950/30 border border-red-200 dark:border-red-800/30 hover:shadow-md transition-all text-sm font-medium text-red-700 dark:text-red-300 whitespace-nowrap"
          >
            <Scroll className="w-4 h-4" />
            每日灵签
          </Link>
          <Link
            to="/divination"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/30 hover:shadow-md transition-all text-sm font-medium text-emerald-700 dark:text-emerald-300 whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            易经占卦
          </Link>
          <Link
            to="/naming"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800/30 hover:shadow-md transition-all text-sm font-medium text-violet-700 dark:text-violet-300 whitespace-nowrap"
          >
            <Baby className="w-4 h-4" />
            起名
          </Link>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-colors ${
              showHistory ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <History className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
            <input
              ref={inputRef}
              type="text"
              placeholder="输入梦境关键词，如：蛇、考试、结婚..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input pl-12 py-3"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {isLoading ? '解梦中...' : 'AI 解梦'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          输入梦境关键词，AI 将结合周公解梦传统与现代心理学为您解析
        </p>
      </div>

      {/* History */}
      {showHistory && records.length > 0 && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              解梦历史
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
                onClick={() => setCurrentResult(record)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${getFortuneBg(record.fortune)}`}
                style={{ color: getFortuneColor(record.fortune) }}
              >
                {record.keyword}
                <span className="ml-1 opacity-70">{record.fortune}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {currentResult && (
        <DreamResult 
          result={currentResult} 
          onClose={() => setCurrentResult(null)}
          fortuneColor={getFortuneColor(currentResult.fortune)}
          fortuneBg={getFortuneBg(currentResult.fortune)}
        />
      )}

    </div>
  )
}
