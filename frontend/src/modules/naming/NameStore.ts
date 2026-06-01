import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NameRecord {
  id: string
  surname: string
  name: string
  fullName: string
  scores: FiveGridScores
  wuxing: WuxingAnalysis
  fortune: string
  summary: string
  timestamp: number
  bazi?: BaziAnalysis
}

export interface FiveGridScores {
  tiange: { score: number; wuxing: string; fortune: string }
  renge: { score: number; wuxing: string; fortune: string }
  dige: { score: number; wuxing: string; fortune: string }
  waige: { score: number; wuxing: string; fortune: string }
  zongge: { score: number; wuxing: string; fortune: string }
  total: number
}

export interface WuxingAnalysis {
  surnameWuxing: string
  nameWuxing: string
  balance: string
  advice: string
}

export interface BaziPillar {
  gan: string
  zhi: string
}

export interface BaziInfo {
  year: BaziPillar
  month: BaziPillar
  day: BaziPillar
  hour: BaziPillar
}

export interface WuxingCount {
  金: number
  木: number
  水: number
  火: number
  土: number
}

export interface BaziAnalysis {
  bazi: BaziInfo
  wuxingCount: WuxingCount
  dayMaster: string
  dayMasterWuxing: string
  xiyongshen: string[]
  jishen: string[]
  nameAdvice: string
  recommendedWuxing: string[]
  recommendedChars: string[]
  baziText: string
  wuxingSummary: string
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export const TIAN_GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
}

export const DI_ZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

const SHI_CHEN = [
  { name: '子', start: 23, end: 1 },
  { name: '丑', start: 1, end: 3 },
  { name: '寅', start: 3, end: 5 },
  { name: '卯', start: 5, end: 7 },
  { name: '辰', start: 7, end: 9 },
  { name: '巳', start: 9, end: 11 },
  { name: '午', start: 11, end: 13 },
  { name: '未', start: 13, end: 15 },
  { name: '申', start: 15, end: 17 },
  { name: '酉', start: 17, end: 19 },
  { name: '戌', start: 19, end: 21 },
  { name: '亥', start: 21, end: 23 },
]

function getYearPillar(year: number, month: number, day: number): BaziPillar {
  const liChunMonth = 2
  const liChunDay = 4
  let effectiveYear = year
  if (month < liChunMonth || (month === liChunMonth && day < liChunDay)) {
    effectiveYear = year - 1
  }
  const ganIdx = (effectiveYear - 4) % 10
  const zhiIdx = (effectiveYear - 4) % 12
  return { gan: TIAN_GAN[ganIdx], zhi: DI_ZHI[zhiIdx] }
}

function getMonthPillar(year: number, month: number, day: number): BaziPillar {
  const yearPillar = getYearPillar(year, month, day)
  const yearGan = yearPillar.gan
  const monthZhiMap = ['丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子']
  const zhi = monthZhiMap[month - 1]
  const monthGanStart: Record<string, string> = {
    '甲': '丙', '己': '丙',
    '乙': '戊', '庚': '戊',
    '丙': '庚', '辛': '庚',
    '丁': '壬', '壬': '壬',
    '戊': '甲', '癸': '甲'
  }
  const startGan = monthGanStart[yearGan]
  const startIdx = TIAN_GAN.indexOf(startGan)
  const gan = TIAN_GAN[(startIdx + month - 1) % 10]
  return { gan, zhi }
}

function getDayPillar(year: number, month: number, day: number): BaziPillar {
  const base = new Date(1900, 2, 1)
  const target = new Date(year, month - 1, day)
  const diff = Math.floor((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24))
  const ganArr = ['癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬']
  const zhiArr = ['酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申']
  return { gan: ganArr[diff % 10], zhi: zhiArr[diff % 12] }
}

function getHourPillar(dayGan: string, hour: number): BaziPillar {
  let zhiIdx = 0
  for (let i = 0; i < SHI_CHEN.length; i++) {
    const sc = SHI_CHEN[i]
    if (sc.start > sc.end) {
      if (hour >= sc.start || hour < sc.end) { zhiIdx = i; break }
    } else {
      if (hour >= sc.start && hour < sc.end) { zhiIdx = i; break }
    }
  }
  const zhi = DI_ZHI[zhiIdx]
  const hourGanStart: Record<string, string> = {
    '甲': '甲', '己': '甲',
    '乙': '丙', '庚': '丙',
    '丙': '戊', '辛': '戊',
    '丁': '庚', '壬': '庚',
    '戊': '壬', '癸': '壬'
  }
  const startGan = hourGanStart[dayGan]
  const startIdx = TIAN_GAN.indexOf(startGan)
  const gan = TIAN_GAN[(startIdx + zhiIdx) % 10]
  return { gan, zhi }
}

export function calculateBazi(birthDate: { year: number; month: number; day: number; hour: number }): BaziInfo {
  return {
    year: getYearPillar(birthDate.year, birthDate.month, birthDate.day),
    month: getMonthPillar(birthDate.year, birthDate.month, birthDate.day),
    day: getDayPillar(birthDate.year, birthDate.month, birthDate.day),
    hour: getHourPillar(getDayPillar(birthDate.year, birthDate.month, birthDate.day).gan, birthDate.hour)
  }
}

function countBaziWuxing(bazi: BaziInfo): WuxingCount {
  const count: WuxingCount = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour]
  for (const p of pillars) {
    count[TIAN_GAN_WUXING[p.gan] as keyof WuxingCount]++
    count[DI_ZHI_WUXING[p.zhi] as keyof WuxingCount]++
  }
  return count
}

function analyzeXiyongshen(bazi: BaziInfo, wuxingCount: WuxingCount) {
  const dayMaster = bazi.day.gan
  const dayMasterWuxing = TIAN_GAN_WUXING[dayMaster]
  const scores: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour]
  for (const p of pillars) {
    scores[TIAN_GAN_WUXING[p.gan]] += 1.0
    scores[DI_ZHI_WUXING[p.zhi]] += 0.8
  }
  scores[dayMasterWuxing] += 0.5
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const strongest = sorted[0][0]
  const weakest = sorted[sorted.length - 1][0]
  const xiyongshen: string[] = []
  const jishen: string[] = []
  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }
  const tonglei: Record<string, string[]> = {
    '木': ['木', '水'], '火': ['火', '木'], '土': ['土', '火'],
    '金': ['金', '土'], '水': ['水', '金']
  }
  const dayMasterScore = scores[dayMasterWuxing]
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 5
  if (dayMasterScore < avgScore * 0.9) {
    xiyongshen.push(...tonglei[dayMasterWuxing])
    jishen.push(ke[dayMasterWuxing])
  } else if (dayMasterScore > avgScore * 1.3) {
    xiyongshen.push(ke[dayMasterWuxing], sheng[dayMasterWuxing])
    jishen.push(...tonglei[dayMasterWuxing])
  } else {
    xiyongshen.push(weakest)
    jishen.push(strongest)
  }
  const uniqueXiyong = [...new Set(xiyongshen)]
  const uniqueJi = [...new Set(jishen)]
  let analysis = `日主为${dayMaster}（${dayMasterWuxing}），`
  if (dayMasterScore < avgScore * 0.9) {
    analysis += `日主偏弱，八字喜${uniqueXiyong.join('、')}，忌${uniqueJi.join('、')}。`
  } else if (dayMasterScore > avgScore * 1.3) {
    analysis += `日主偏强，八字喜${uniqueXiyong.join('、')}，忌${uniqueJi.join('、')}。`
  } else {
    analysis += `日主中和，五行相对平衡，宜补${uniqueXiyong[0]}，忌${uniqueJi[0]}过旺。`
  }
  return { xiyongshen: uniqueXiyong, jishen: uniqueJi, analysis }
}

const WUXING_CHARS: Record<string, string[]> = {
  '金': ['鑫', '铭', '锐', '锦', '钧', '铮', '铄', '钰', '铎', '铠', '琛', '瑞', '璋', '璇', '璨', '瑜', '琳', '琪', '琦', '瑛', '琬', '琰', '琛', '珂', '琼', '瑶', '琅', '璟', '璠', '璎', '璐', '璜', '璧'],
  '木': ['梓', '林', '森', '树', '柏', '松', '梅', '柳', '杨', '枫', '桦', '楠', '榕', '樟', '桐', '杉', '杏', '桃', '李', '桂', '桔', '橙', '栋', '梁', '柱', '柯', '柄', '杰', '杳', '枚', '果', '枝', '柠', '柏', '柒', '染', '柔', '柚', '柯', '柳', '柴', '柿', '标', '栈', '栗', '校', '株', '核', '根', '格', '桂', '桃', '桅', '桌', '桐', '桑', '桔', '梁', '梅', '梓', '梨', '梯', '械', '梵', '检', '棉', '棋', '棒', '棕', '棠', '棣', '森', '棱', '棵', '椅', '椋', '植', '椿', '楚', '楠', '楣', '楫', '榆', '榕', '榛', '榜', '榭', '榴', '槐', '槟', '槟', '潭', '澄', '澎', '澳', '濂', '濮', '濯', '瀚', '瀛', '灏', '沣'],
  '水': ['浩', '海', '洋', '涛', '波', '清', '源', '溪', '流', '江', '河', '湖', '泽', '润', '涵', '沛', '沐', '泳', '津', '洪', '洲', '洋', '洁', '洒', '洗', '洛', '洞', '洪', '洲', '活', '洽', '派', '济', '浏', '浩', '浪', '浮', '浴', '海', '涌', '涓', '涛', '涟', '涣', '润', '涧', '涵', '淇', '淋', '淑', '淘', '淙', '淞', '淡', '深', '淳', '添', '淼', '清', '渊', '渐', '渔', '渝', '渠', '渡', '渤', '渭', '港', '游', '渺', '湃', '湄', '湖', '湘', '湛', '溪', '溯', '溶', '滋', '滔', '滕', '滚', '滢', '滨', '潇', '潍', '潜', '潞', '潭', '潮', '潼', '澄', '澎', '澳', '濂', '濮', '濯', '瀚', '瀛', '灏', '沣'],
  '火': ['炎', '焱', '煜', '炜', '炫', '炯', '炳', '烁', '焕', '烨', '煊', '炅', '炆', '炎', '炜', '炫', '炬', '炮', '炼', '炽', '烁', '烀', '炳', '烈', '烘', '烜', '烟', '烙', '热', '焘', '焜', '焦', '然', '煌', '煜', '照', '煮', '煲', '煸', '煅', '煦', '熙', '熏', '熬', '熳', '熠', '熨', '燃', '焰', '燠', '燥', '燮', '灿', '燧', '烛', '烩', '燕'],
  '土': ['坤', '垚', '培', '基', '城', '垣', '壁', '壤', '域', '堡', '坚', '坤', '垚', '培', '基', '城', '垣', '壁', '壤', '域', '堡', '坚', '坦', '垲', '埼', '堇', '堉', '塇', '墉', '墐', '墨', '均', '圣', '圭', '圻', '圳', '圮', '圯', '圩', '圬', '圭', '圴', '坍', '坎', '坞', '坟', '坠', '坤', '坡', '坦', '坪', '坭', '垅', '型', '垒', '垓', '垠', '垢', '垦', '垫', '垡', '垧', '垮', '城', '埏', '埔', '埕', '埭', '埵', '埴', '埸', '培', '基', '堂', '堆', '堇', '堉', '堕', '堡', '堪', '堰', '堵', '塇', '塈', '塔', '塘', '塞', '填', '墉', '墐', '墨', '墩', '增', '壁', '壤', '壕', '壖', '壛', '壑', '壒', '壤', '壔', '壖', '壛', '壑', '壒']
}

export function analyzeBazi(birthDate: { year: number; month: number; day: number; hour: number }): BaziAnalysis {
  const bazi = calculateBazi(birthDate)
  const wuxingCount = countBaziWuxing(bazi)
  const { xiyongshen, jishen, analysis } = analyzeXiyongshen(bazi, wuxingCount)
  const dayMaster = bazi.day.gan
  const dayMasterWuxing = TIAN_GAN_WUXING[dayMaster]

  const baziText = `${bazi.year.gan}${bazi.year.zhi} ${bazi.month.gan}${bazi.month.zhi} ${bazi.day.gan}${bazi.day.zhi} ${bazi.hour.gan}${bazi.hour.zhi}`
  const wuxingSummary = `金${wuxingCount['金']} 木${wuxingCount['木']} 水${wuxingCount['水']} 火${wuxingCount['火']} 土${wuxingCount['土']}`

  const recommendedChars: string[] = []
  for (const wx of xiyongshen) {
    recommendedChars.push(...(WUXING_CHARS[wx] || []).slice(0, 8))
  }

  let nameAdvice = analysis
  nameAdvice += `\n\n【起名建议】\n`
  nameAdvice += `1. 宜用五行属性为${xiyongshen.join('、')}的汉字。\n`
  nameAdvice += `2. 避免使用五行属性为${jishen.join('、')}的汉字。\n`
  nameAdvice += `3. 名字笔画数宜选择吉数，避开凶数。\n`
  nameAdvice += `4. 名字音韵要和谐，避免生僻字。\n`
  nameAdvice += `5. 建议结合姓氏五行，使整体五行流通。`

  return {
    bazi,
    wuxingCount,
    dayMaster,
    dayMasterWuxing,
    xiyongshen,
    jishen,
    nameAdvice,
    recommendedWuxing: xiyongshen,
    recommendedChars: [...new Set(recommendedChars)].slice(0, 20),
    baziText,
    wuxingSummary
  }
}

export const STROKE_COUNT: Record<string, number> = {
  '王': 4, '李': 7, '张': 11, '刘': 15, '陈': 16, '杨': 13, '黄': 12, '赵': 14, '吴': 7, '周': 8,
  '徐': 10, '孙': 10, '马': 10, '朱': 6, '胡': 11, '郭': 15, '何': 7, '高': 10, '林': 8, '罗': 20,
  '郑': 19, '梁': 11, '谢': 17, '宋': 7, '唐': 10, '许': 11, '韩': 17, '冯': 12, '邓': 19, '曹': 11,
  '彭': 12, '曾': 12, '肖': 9, '田': 5, '董': 15, '袁': 10, '潘': 16, '于': 3, '蒋': 17, '蔡': 17,
  '余': 7, '杜': 7, '叶': 15, '程': 12, '苏': 22, '魏': 18, '吕': 7, '丁': 2, '任': 6, '沈': 7,
  '姚': 9, '卢': 16, '姜': 9, '崔': 11, '钟': 17, '谭': 19, '陆': 16, '汪': 8, '范': 15, '金': 8,
  '石': 5, '廖': 14, '贾': 13, '夏': 10, '韦': 9, '付': 5, '方': 4, '白': 5, '邹': 17, '孟': 8,
  '熊': 14, '秦': 10, '邱': 12, '江': 7, '尹': 4, '薛': 19, '闫': 11, '段': 9, '雷': 13, '侯': 9,
  '龙': 16, '史': 5, '陶': 16, '黎': 15, '贺': 12, '顾': 21, '毛': 4, '郝': 14, '龚': 22, '邵': 12,
  '万': 15, '钱': 16, '严': 20, '覃': 12, '武': 8, '戴': 18, '莫': 13, '孔': 4, '向': 6, '汤': 13,
  '子': 3, '梓': 11, '宇': 6, '雨': 8, '浩': 11, '昊': 8, '轩': 10, '萱': 15, '欣': 8, '鑫': 24,
  '晨': 11, '辰': 7, '博': 12, '文': 4, '静': 16, '晶': 12, '伟': 11, '玮': 14, '娜': 10, '婷': 12,
  '丽': 19, '莉': 13, '敏': 11, '洁': 16, '杰': 12, '强': 11, '军': 9, '洋': 10, '阳': 17, '明': 8,
  '华': 14, '志': 7, '忠': 8, '建': 9, '国': 11, '庆': 15, '瑞': 14, '祥': 11, '慧': 15, '惠': 12,
  '芳': 10, '芬': 10, '秀': 7, '英': 11, '梅': 11, '兰': 23, '竹': 6, '菊': 14, '松': 18, '柏': 9,
  '清': 12, '源': 14, '海': 11, '涛': 18, '波': 9, '鹏': 19, '飞': 9, '凤': 14, '鸣': 14,
  '天': 4, '大': 3, '小': 3, '永': 5, '安': 6, '康': 11, '宁': 14, '平': 5, '和': 8, '顺': 12,
  '德': 15, '仁': 4, '义': 13, '礼': 18, '智': 12, '信': 9, '孝': 7, '诚': 14, '善': 12,
  '美': 9, '乐': 15, '喜': 12, '福': 14, '禄': 13, '寿': 14, '财': 10, '宝': 20, '玉': 5,
  '银': 14, '铜': 14, '铁': 21, '木': 4, '水': 4, '火': 4, '土': 3, '山': 3, '川': 3,
  '春': 9, '秋': 9, '冬': 5, '东': 8, '西': 6, '南': 9, '北': 5, '中': 4, '正': 5,
  '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
  '百': 6, '千': 3, '亿': 15, '兆': 6, '吉': 6, '如': 6, '意': 13, '兴': 16,
  '旺': 8, '盛': 12, '昌': 8, '隆': 17, '发': 15, '达': 16, '通': 14, '利': 7, '胜': 12,
  '凯': 12, '旋': 11, '辉': 15, '煌': 13, '耀': 20, '灿': 17, '烂': 21, '红': 9, '紫': 11, '青': 8,
  '蓝': 20, '绿': 14, '黑': 12, '橙': 16, '粉': 10, '灰': 6, '墨': 15, '彩': 11
}

function getStroke(char: string): number {
  return STROKE_COUNT[char] || Math.max(1, char.charCodeAt(0) % 15 + 1)
}

export function calculateFiveGrid(surname: string, name: string): FiveGridScores {
  const surnameStroke = getStroke(surname)
  const nameChars = name.split('')
  const nameStroke1 = nameChars[0] ? getStroke(nameChars[0]) : 0
  const nameStroke2 = nameChars[1] ? getStroke(nameChars[1]) : 0
  const totalNameStroke = nameChars.reduce((sum, c) => sum + getStroke(c), 0)
  const tiange = surnameStroke + 1
  const renge = surnameStroke + nameStroke1
  const dige = totalNameStroke
  const zongge = tiange + dige
  const waige = zongge - renge + 1
  const grids = [
    { name: 'tiange', value: tiange },
    { name: 'renge', value: renge },
    { name: 'dige', value: dige },
    { name: 'waige', value: waige },
    { name: 'zongge', value: zongge }
  ]
  const scores: any = {}
  let totalScore = 0
  for (const grid of grids) {
    const result = analyzeGrid(grid.value)
    scores[grid.name] = result
    totalScore += result.score
  }
  scores.total = Math.round(totalScore / 5)
  return scores as FiveGridScores
}

function analyzeGrid(value: number) {
  const digit = value % 10 || 10
  const wuxingMap: Record<number, string> = {
    1: '木', 2: '木', 3: '火', 4: '火', 5: '土',
    6: '土', 7: '金', 8: '金', 9: '水', 10: '水'
  }
  const fortuneMap: Record<number, { score: number; fortune: string }> = {
    1: { score: 90, fortune: '大吉' }, 2: { score: 85, fortune: '吉' },
    3: { score: 95, fortune: '大吉' }, 4: { score: 70, fortune: '凶' },
    5: { score: 88, fortune: '吉' }, 6: { score: 80, fortune: '吉' },
    7: { score: 92, fortune: '大吉' }, 8: { score: 75, fortune: '中吉' },
    9: { score: 96, fortune: '大吉' }, 10: { score: 82, fortune: '吉' }
  }
  const result = fortuneMap[digit] || { score: 80, fortune: '中吉' }
  return { score: result.score, wuxing: wuxingMap[digit] || '土', fortune: result.fortune }
}

export function analyzeWuxing(surname: string, name: string): WuxingAnalysis {
  const surnameStroke = getStroke(surname)
  const nameStroke = name.split('').reduce((sum, c) => sum + getStroke(c), 0)
  const surnameWuxing = getWuxingByStroke(surnameStroke)
  const nameWuxing = getWuxingByStroke(nameStroke)
  const balance = judgeBalance(surnameWuxing, nameWuxing)
  return { surnameWuxing, nameWuxing, balance: balance.level, advice: balance.advice }
}

function getWuxingByStroke(stroke: number): string {
  const digit = stroke % 10 || 10
  const map: Record<number, string> = {
    1: '木', 2: '木', 3: '火', 4: '火', 5: '土',
    6: '土', 7: '金', 8: '金', 9: '水', 10: '水'
  }
  return map[digit] || '土'
}

function judgeBalance(surnameWuxing: string, nameWuxing: string) {
  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }
  if (surnameWuxing === nameWuxing) {
    return { level: '平衡', advice: '姓氏与名字五行相同，气场一致，性格稳定，但可能缺乏变化。' }
  } else if (sheng[surnameWuxing] === nameWuxing) {
    return { level: '相生', advice: '姓氏生名字，祖上庇佑，运势顺畅，贵人相助。' }
  } else if (ke[surnameWuxing] === nameWuxing) {
    return { level: '相克', advice: '姓氏克名字，需努力奋斗，虽有波折但终能成功。' }
  } else {
    return { level: '中和', advice: '姓氏与名字五行关系平和，吉凶参半，需靠自身努力。' }
  }
}

export function generateNameInterpretation(surname: string, name: string, scores: FiveGridScores, wuxing: WuxingAnalysis): string {
  let interpretation = `【姓名】${surname}${name}\n\n`
  interpretation += `【五格剖象】\n`
  interpretation += `天格（祖运）：${scores.tiange.score}分 · ${scores.tiange.fortune} · ${scores.tiange.wuxing}\n`
  interpretation += `人格（主运）：${scores.renge.score}分 · ${scores.renge.fortune} · ${scores.renge.wuxing}\n`
  interpretation += `地格（前运）：${scores.dige.score}分 · ${scores.dige.fortune} · ${scores.dige.wuxing}\n`
  interpretation += `外格（副运）：${scores.waige.score}分 · ${scores.waige.fortune} · ${scores.waige.wuxing}\n`
  interpretation += `总格（后运）：${scores.zongge.score}分 · ${scores.zongge.fortune} · ${scores.zongge.wuxing}\n\n`
  interpretation += `【五行分析】\n`
  interpretation += `姓氏五行：${wuxing.surnameWuxing}\n`
  interpretation += `名字五行：${wuxing.nameWuxing}\n`
  interpretation += `五行关系：${wuxing.balance}\n`
  interpretation += `${wuxing.advice}\n\n`
  interpretation += `【综合评分】${scores.total}分\n\n`
  if (scores.total >= 90) {
    interpretation += `【评语】大吉之名！五行相生，五格俱佳，主一生顺遂，贵人相助，事业有成，家庭和睦。此名可助运势，建议采纳。\n`
  } else if (scores.total >= 80) {
    interpretation += `【评语】吉名！整体运势良好，虽有小幅波折，但终能化险为夷。此名可用，若追求更佳可微调。\n`
  } else if (scores.total >= 70) {
    interpretation += `【评语】中吉之名。运势平稳，需靠自身努力争取。建议结合生辰八字进一步分析，或考虑调整名字用字。\n`
  } else if (scores.total >= 60) {
    interpretation += `【评语】平平之名。吉凶参半，有成功之机亦有失败之险。建议慎重考虑，或请专业命理师结合八字分析。\n`
  } else {
    interpretation += `【评语】凶名警示！五格有缺，五行失衡，可能带来不必要的波折。强烈建议更换名字，或请专业命理师化解。\n`
  }
  interpretation += `\n【建议】\n`
  interpretation += `1. 姓名测试仅供参考，真正的人生掌握在自己手中。\n`
  interpretation += `2. 若评分不理想，可考虑调整名字用字，或结合生辰八字综合分析。\n`
  interpretation += `3. 好名字是锦上添花，努力奋斗才是成功的根本。`
  return interpretation
}

interface NameState {
  records: NameRecord[]
  isLoading: boolean
  currentResult: NameRecord | null
  addRecord: (record: NameRecord) => void
  setLoading: (loading: boolean) => void
  setCurrentResult: (result: NameRecord | null) => void
  clearRecords: () => void
}

export const useNameStore = create<NameState>()(
  persist(
    (set) => ({
      records: [],
      isLoading: false,
      currentResult: null,
      addRecord: (record) => {
        set((state) => ({ records: [record, ...state.records].slice(0, 50) }))
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setCurrentResult: (result) => set({ currentResult: result }),
      clearRecords: () => set({ records: [] })
    }),
    { name: 'name-storage' }
  )
)
