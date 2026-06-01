import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DreamRecord {
  id: string
  keyword: string
  description: string
  interpretation: string
  fortune: '吉' | '凶' | '中平' | string
  category: string
  timestamp: number
  /** 各心理学流派解析 */
  psychology?: {
    freud?: string
    jung?: string
    adler?: string
    cognitive?: string
    existential?: string
  }
}

export interface DreamCategory {
  id: string
  name: string
  icon: string
  examples: string[]
}

export const DREAM_CATEGORIES: DreamCategory[] = [
  {
    id: 'people',
    name: '人物类',
    icon: '👤',
    examples: ['梦见妈妈', '梦见死人', '梦见结婚', '梦见怀孕', '梦见老板']
  },
  {
    id: 'animals',
    name: '动物类',
    icon: '🐍',
    examples: ['梦见蛇', '梦见狗', '梦见猫', '梦见鱼', '梦见老虎']
  },
  {
    id: 'plants',
    name: '植物类',
    icon: '🌸',
    examples: ['梦见花', '梦见树', '梦见草', '梦见果实']
  },
  {
    id: 'items',
    name: '物品类',
    icon: '📿',
    examples: ['梦见手机', '梦见钱', '梦见衣服', '梦见房子']
  },
  {
    id: 'activities',
    name: '活动类',
    icon: '🏃',
    examples: ['梦见考试', '梦见飞行', '梦见开车', '梦见游泳']
  },
  {
    id: 'life',
    name: '生活类',
    icon: '🏠',
    examples: ['梦见吃饭', '梦见睡觉', '梦见搬家', '梦见旅行']
  },
  {
    id: 'nature',
    name: '自然类',
    icon: '🌊',
    examples: ['梦见水', '梦见火', '梦见山', '梦见地震', '梦见下雨']
  },
  {
    id: 'ghost',
    name: '鬼神类',
    icon: '👻',
    examples: ['梦见鬼', '鬼压床', '梦见神仙', '梦见佛祖']
  },
  {
    id: 'buildings',
    name: '建筑类',
    icon: '🏛️',
    examples: ['梦见房子', '梦见桥', '梦见坟墓', '梦见学校']
  },
  {
    id: 'body',
    name: '身体类',
    icon: '💇',
    examples: ['梦见脱发', '梦见牙齿', '梦见流血', '梦见怀孕']
  }
]

// ==================== 扩展梦境数据库（100+条）====================
export const HOT_DREAMS = [
  // ========== 人物类 ==========
  {
    keyword: '梦见妈妈',
    summary: '母者，生我之人。梦之主思念、依靠，或指近期有贵人相助，家宅安宁。',
    fortune: '吉',
    category: 'people'
  },
  {
    keyword: '梦见爸爸',
    summary: '父者，家之栋梁。梦之主事业有靠，或指需承担更多责任，宜稳重行事。',
    fortune: '吉',
    category: 'people'
  },
  {
    keyword: '梦见死人',
    summary: '亡者，隔世之人。梦之主阴司消息、先人福祸，死人言吉则吉，死人索命则凶。',
    fortune: '中平',
    category: 'people'
  },
  {
    keyword: '梦见结婚',
    summary: '梦结婚者，主喜事临门，姻缘和合，或指人生新阶，责任担当。',
    fortune: '吉',
    category: 'people'
  },
  {
    keyword: '梦见怀孕',
    summary: '孕者，新生之象。梦之主创意萌发、计划孕育，或指财运将至，宜把握机遇。',
    fortune: '吉',
    category: 'people'
  },
  {
    keyword: '梦见老板',
    summary: '老板者，掌权之人。梦之主职场变动，或指上级关注，宜表现才能。',
    fortune: '中平',
    category: 'people'
  },
  {
    keyword: '梦见同事',
    summary: '同事者，共事之人。梦之主人际关系，或指合作机遇，宜和睦相处。',
    fortune: '中平',
    category: 'people'
  },
  {
    keyword: '梦见朋友',
    summary: '朋友者，同道之人。梦之主社交运势，或指旧友重逢，宜广结善缘。',
    fortune: '吉',
    category: 'people'
  },
  {
    keyword: '梦见陌生人',
    summary: '陌生人者，未知之象。梦之主新机遇将至，或指潜在风险，宜谨慎观察。',
    fortune: '中平',
    category: 'people'
  },
  {
    keyword: '梦见婴儿',
    summary: '婴儿者，纯真之象。梦之主新的开始，或指内心渴望被呵护，宜保持初心。',
    fortune: '吉',
    category: 'people'
  },
  {
    keyword: '梦见老人',
    summary: '老人者，智慧之象。梦之主经验传承，或指需听取长者建议，宜虚心求教。',
    fortune: '吉',
    category: 'people'
  },
  {
    keyword: '梦见明星',
    summary: '明星者，众人瞩目之象。梦之主渴望被关注，或指虚荣心作祟，宜脚踏实地。',
    fortune: '中平',
    category: 'people'
  },

  // ========== 动物类 ==========
  {
    keyword: '梦见蛇',
    summary: '蛇乃小龙，阴柔毒辣。梦之主犯小人、遇险情，亦主性欲与智慧，需防暗算。',
    fortune: '中平',
    category: 'animals'
  },
  {
    keyword: '梦见狗',
    summary: '狗乃忠犬，守宅护主。梦之主贵人相助，或指友情深厚，宜珍惜身边人。',
    fortune: '吉',
    category: 'animals'
  },
  {
    keyword: '梦见被狗咬',
    summary: '狗咬者，忠而反噬。梦之主有小人暗算，或指朋友反目，需防身边不忠之人。',
    fortune: '凶',
    category: 'animals'
  },
  {
    keyword: '梦见猫',
    summary: '猫乃阴柔之兽，独立神秘。梦之主女性缘分，或指隐秘之事，宜细心观察。',
    fortune: '中平',
    category: 'animals'
  },
  {
    keyword: '梦见鱼',
    summary: '鱼者，余也，富余之象。梦之主财运亨通，年年有余，宜把握投资机遇。',
    fortune: '吉',
    category: 'animals'
  },
  {
    keyword: '梦见老虎',
    summary: '虎乃百兽之王，威猛霸气。梦之主权力斗争，或指强敌当前，宜谨慎应对。',
    fortune: '凶',
    category: 'animals'
  },
  {
    keyword: '梦见龙',
    summary: '龙乃祥瑞之兽，帝王之象。梦之主飞黄腾达，贵人提携，大吉之兆。',
    fortune: '吉',
    category: 'animals'
  },
  {
    keyword: '梦见凤凰',
    summary: '凤凰者，百鸟之王，涅槃重生。梦之主浴火重生，否极泰来，大吉之兆。',
    fortune: '吉',
    category: 'animals'
  },
  {
    keyword: '梦见老鼠',
    summary: '鼠乃小人，偷食之辈。梦之主有窃贼之患，或指小人作祟，宜防财物损失。',
    fortune: '凶',
    category: 'animals'
  },
  {
    keyword: '梦见鸟',
    summary: '鸟者，自由之象。梦之主心愿达成，或指消息传来，宜保持乐观心态。',
    fortune: '吉',
    category: 'animals'
  },
  {
    keyword: '梦见蝴蝶',
    summary: '蝴蝶者，蜕变之象。梦之主生活将有转变，或指爱情降临，宜拥抱变化。',
    fortune: '吉',
    category: 'animals'
  },
  {
    keyword: '梦见蜘蛛',
    summary: '蜘蛛者，织网之虫。梦之主纠缠不清，或指陷入困境，宜果断处理。',
    fortune: '凶',
    category: 'animals'
  },
  {
    keyword: '梦见蜜蜂',
    summary: '蜜蜂者，勤劳之象。梦之主辛勤付出将有回报，或指团队合作，宜继续努力。',
    fortune: '吉',
    category: 'animals'
  },
  {
    keyword: '梦见马',
    summary: '马者，奔腾之象。梦之主事业腾飞，马到成功，宜把握机遇勇往直前。',
    fortune: '吉',
    category: 'animals'
  },

  // ========== 植物类 ==========
  {
    keyword: '梦见花',
    summary: '花者，美好之象。梦之主桃花运至，或指生活美好，宜珍惜眼前人。',
    fortune: '吉',
    category: 'plants'
  },
  {
    keyword: '梦见树',
    summary: '树者，根基之象。梦之主事业稳固，根深叶茂，宜稳扎稳打。',
    fortune: '吉',
    category: 'plants'
  },
  {
    keyword: '梦见草',
    summary: '草者，生命力之象。梦之主顽强不屈，野火烧不尽，宜保持坚韧。',
    fortune: '中平',
    category: 'plants'
  },
  {
    keyword: '梦见果实',
    summary: '果实者，收获之象。梦之主努力将有回报，硕果累累，宜继续耕耘。',
    fortune: '吉',
    category: 'plants'
  },
  {
    keyword: '梦见竹子',
    summary: '竹者，节节高升。梦之主事业步步高升，虚心有节，宜保持谦逊。',
    fortune: '吉',
    category: 'plants'
  },
  {
    keyword: '梦见莲花',
    summary: '莲者，出淤泥而不染。梦之主心灵净化，或指佛缘深厚，宜修身养性。',
    fortune: '吉',
    category: 'plants'
  },
  {
    keyword: '梦见枯萎',
    summary: '枯萎者，衰败之象。梦之主运势下滑，或指健康堪忧，宜注意调养。',
    fortune: '凶',
    category: 'plants'
  },

  // ========== 物品类 ==========
  {
    keyword: '梦见手机',
    summary: '手机者，联系之象。梦之主渴望沟通，或指信息重要，宜注意消息。',
    fortune: '中平',
    category: 'items'
  },
  {
    keyword: '梦见钱',
    summary: '钱者，财之象。梦之主财运波动，或指物质欲望，宜理性消费。',
    fortune: '中平',
    category: 'items'
  },
  {
    keyword: '梦见衣服',
    summary: '衣者，面子之象。梦之主形象改变，或指身份转换，宜注意仪表。',
    fortune: '中平',
    category: 'items'
  },
  {
    keyword: '梦见新房',
    summary: '房者，家宅之象。梦见新房主家庭变动，或指事业根基，宜稳固后方。',
    fortune: '中平',
    category: 'items'
  },
  {
    keyword: '梦见车',
    summary: '车者，前进之象。梦之主事业推进，或指人生方向，宜把握方向。',
    fortune: '吉',
    category: 'items'
  },
  {
    keyword: '梦见钥匙',
    summary: '钥匙者，开启之象。梦之主机遇将至，或指解决问题，宜把握关键。',
    fortune: '吉',
    category: 'items'
  },
  {
    keyword: '梦见镜子',
    summary: '镜者，映照之象。梦之主自我反思，或指真相浮现，宜正视自己。',
    fortune: '中平',
    category: 'items'
  },
  {
    keyword: '梦见书',
    summary: '书者，知识之象。梦之主学习进步，或指智慧增长，宜勤奋学习。',
    fortune: '吉',
    category: 'items'
  },
  {
    keyword: '梦见刀',
    summary: '刀者，决断之象。梦之主需要果断，或指冲突将至，宜谨慎处理。',
    fortune: '凶',
    category: 'items'
  },
  {
    keyword: '梦见戒指',
    summary: '戒指者，承诺之象。梦之主感情稳定，或指契约成立，宜信守承诺。',
    fortune: '吉',
    category: 'items'
  },
  {
    keyword: '梦见棺材',
    summary: '棺者，官也，升官发财。梦之主事业高升，财运亨通，大吉之兆。',
    fortune: '吉',
    category: 'items'
  },

  // ========== 活动类 ==========
  {
    keyword: '梦见考试',
    summary: '考试者，检验之象。梦之主面临考验，或指压力巨大，宜沉着应对。',
    fortune: '中平',
    category: 'activities'
  },
  {
    keyword: '梦见考试失败',
    summary: '考试失败者，压力之象。梦之主焦虑过度，或指准备不足，宜调整心态。',
    fortune: '中平',
    category: 'activities'
  },
  {
    keyword: '梦见飞行',
    summary: '飞行者，自由之象。梦之主志得意满，翱翔天际则自由，坠落则防乐极生悲。',
    fortune: '吉',
    category: 'activities'
  },
  {
    keyword: '梦见开车',
    summary: '驾车者，掌控之象。梦之主事业驶入快车道，前程远大，宜把握方向。',
    fortune: '吉',
    category: 'activities'
  },
  {
    keyword: '梦见游泳',
    summary: '游泳者，拼搏之象。梦之主在困境中挣扎，或指努力前行，宜坚持不懈。',
    fortune: '中平',
    category: 'activities'
  },
  {
    keyword: '梦见跑步',
    summary: '跑步者，追赶之象。梦之主竞争激烈，或指急于求成，宜稳扎稳打。',
    fortune: '中平',
    category: 'activities'
  },
  {
    keyword: '梦见跳舞',
    summary: '跳舞者，欢乐之象。梦之主心情愉悦，或指社交活跃，宜享受生活。',
    fortune: '吉',
    category: 'activities'
  },
  {
    keyword: '梦见唱歌',
    summary: '唱歌者，表达之象。梦之主渴望表达，或指情绪释放，宜倾诉心声。',
    fortune: '吉',
    category: 'activities'
  },
  {
    keyword: '梦见打架',
    summary: '打架者，冲突之象。梦之主内心矛盾，或指人际关系紧张，宜冷静处理。',
    fortune: '凶',
    category: 'activities'
  },
  {
    keyword: '梦见逃跑',
    summary: '逃跑者，逃避之象。梦之主不愿面对，或指压力过大，宜正视问题。',
    fortune: '凶',
    category: 'activities'
  },
  {
    keyword: '梦见爬山',
    summary: '爬山者，攀登之象。梦之主事业上升，克服困难，宜坚持不懈。',
    fortune: '吉',
    category: 'activities'
  },
  {
    keyword: '梦见坠落',
    summary: '坠落者，失控之象。梦之主恐惧失败，或指地位动摇，宜稳固根基。',
    fortune: '凶',
    category: 'activities'
  },

  // ========== 生活类 ==========
  {
    keyword: '梦见吃饭',
    summary: '吃饭者，生存之象。梦之主生活安稳，或指营养需求，宜注意饮食。',
    fortune: '吉',
    category: 'life'
  },
  {
    keyword: '梦见睡觉',
    summary: '睡觉者，休息之象。梦之主身心疲惫，或指逃避现实，宜适当放松。',
    fortune: '中平',
    category: 'life'
  },
  {
    keyword: '梦见搬家',
    summary: '搬家者，变动之象。梦之主生活将有转变，或指环境改变，宜适应变化。',
    fortune: '中平',
    category: 'life'
  },
  {
    keyword: '梦见旅行',
    summary: '旅行者，探索之象。梦之主渴望新鲜，或指机遇在外，宜出去走走。',
    fortune: '吉',
    category: 'life'
  },
  {
    keyword: '梦见购物',
    summary: '购物者，欲望之象。梦之主消费冲动，或指物质需求，宜理性消费。',
    fortune: '中平',
    category: 'life'
  },
  {
    keyword: '梦见做饭',
    summary: '做饭者，创造之象。梦之主亲手创造，或指家庭温暖，宜享受过程。',
    fortune: '吉',
    category: 'life'
  },
  {
    keyword: '梦见洗澡',
    summary: '洗澡者，净化之象。梦之主洗去烦恼，或指焕然一新，宜放下过去。',
    fortune: '吉',
    category: 'life'
  },
  {
    keyword: '梦见迟到',
    summary: '迟到者，焦虑之象。梦之主担心错过，或指时间管理，宜提前准备。',
    fortune: '凶',
    category: 'life'
  },

  // ========== 自然类 ==========
  {
    keyword: '梦见水',
    summary: '水者，财之象。梦之主财运流动，清水则吉，浊水则凶，宜辨明真伪。',
    fortune: '中平',
    category: 'nature'
  },
  {
    keyword: '梦见火',
    summary: '火者，热情之象。梦之主心急如焚，或指事态失控，损失惨重，需防患于未然。',
    fortune: '凶',
    category: 'nature'
  },
  {
    keyword: '梦见山',
    summary: '山者，阻碍之象。梦之主面临困难，或指目标高远，宜脚踏实地。',
    fortune: '中平',
    category: 'nature'
  },
  {
    keyword: '梦见地震',
    summary: '地震者，巨变之象。梦之主根基动摇，或指突发变故，宜稳固后方。',
    fortune: '凶',
    category: 'nature'
  },
  {
    keyword: '梦见下雨',
    summary: '雨者，滋润之象。梦之主财运降临，春雨则吉，暴雨则凶，宜把握时机。',
    fortune: '中平',
    category: 'nature'
  },
  {
    keyword: '梦见雪',
    summary: '雪者，纯洁之象。梦之主心灵净化，或指新的开始，宜保持纯真。',
    fortune: '吉',
    category: 'nature'
  },
  {
    keyword: '梦见风',
    summary: '风者，变化之象。梦之主运势变动，顺风则吉，逆风则凶，宜顺势而为。',
    fortune: '中平',
    category: 'nature'
  },
  {
    keyword: '梦见太阳',
    summary: '太阳者，光明之象。梦之主前途光明，阳气旺盛，大吉之兆。',
    fortune: '吉',
    category: 'nature'
  },
  {
    keyword: '梦见月亮',
    summary: '月亮者，阴柔之象。梦之主女性缘分，或指情感波动，宜保持冷静。',
    fortune: '中平',
    category: 'nature'
  },
  {
    keyword: '梦见彩虹',
    summary: '彩虹者，希望之象。梦之主雨过天晴，否极泰来，大吉之兆。',
    fortune: '吉',
    category: 'nature'
  },
  {
    keyword: '梦见大海',
    summary: '大海者，广阔之象。梦之主心胸开阔，或指机遇无限，宜大胆前行。',
    fortune: '吉',
    category: 'nature'
  },
  {
    keyword: '梦见洪水',
    summary: '洪水者，泛滥之象。梦之主情绪失控，或指灾难临头，宜冷静应对。',
    fortune: '凶',
    category: 'nature'
  },

  // ========== 鬼神类 ==========
  {
    keyword: '梦见鬼',
    summary: '鬼者，人死之灵。梦之主有隐忧，或遇小人，需防口舌是非。',
    fortune: '凶',
    category: 'ghost'
  },
  {
    keyword: '鬼压床',
    summary: '鬼压床者，睡眠瘫痪。梦之主压力过大，或指身体疲惫，宜注意休息。',
    fortune: '凶',
    category: 'ghost'
  },
  {
    keyword: '梦见神仙',
    summary: '神仙者，超凡之象。梦之主福缘深厚，或指贵人相助，大吉之兆。',
    fortune: '吉',
    category: 'ghost'
  },
  {
    keyword: '梦见佛祖',
    summary: '佛祖者，慈悲之象。梦之主心灵净化，或指佛缘深厚，宜修身养性。',
    fortune: '吉',
    category: 'ghost'
  },
  {
    keyword: '梦见妖怪',
    summary: '妖怪者，异类之象。梦之主遇到怪事，或指内心恐惧，宜保持镇定。',
    fortune: '凶',
    category: 'ghost'
  },
  {
    keyword: '梦见祖先',
    summary: '祖先者，根源之象。梦之主家族庇佑，或指传承责任，宜敬祖尊宗。',
    fortune: '吉',
    category: 'ghost'
  },

  // ========== 建筑类 ==========
  {
    keyword: '梦见房子',
    summary: '房者，家宅之象。梦之主家庭变动，或指事业根基，宜稳固后方。',
    fortune: '中平',
    category: 'buildings'
  },
  {
    keyword: '梦见桥',
    summary: '桥者，过渡之象。梦之主人生转折，或指连接两岸，宜把握机遇。',
    fortune: '吉',
    category: 'buildings'
  },
  {
    keyword: '梦见坟墓',
    summary: '坟墓者，终结之象。梦之主旧事物结束，或指新生开始，宜放下过去。',
    fortune: '中平',
    category: 'buildings'
  },
  {
    keyword: '梦见学校',
    summary: '学校者，学习之象。梦之主渴望知识，或指回忆青春，宜终身学习。',
    fortune: '吉',
    category: 'buildings'
  },
  {
    keyword: '梦见医院',
    summary: '医院者，健康之象。梦之主身体预警，或指需要调养，宜注意健康。',
    fortune: '凶',
    category: 'buildings'
  },
  {
    keyword: '梦见寺庙',
    summary: '寺庙者，信仰之象。梦之主心灵寻求，或指需要宁静，宜修身养性。',
    fortune: '吉',
    category: 'buildings'
  },
  {
    keyword: '梦见电梯',
    summary: '电梯者，升降之象。梦之主地位变动，上升则吉，下降则凶，宜把握机遇。',
    fortune: '中平',
    category: 'buildings'
  },
  {
    keyword: '梦见楼梯',
    summary: '楼梯者，步步高升。梦之主事业上升，或指努力攀登，宜坚持不懈。',
    fortune: '吉',
    category: 'buildings'
  },

  // ========== 身体类 ==========
  {
    keyword: '梦见脱发',
    summary: '发者，血之余、烦恼丝。梦之主运势长短、思绪繁简，落发多主破财损寿。',
    fortune: '凶',
    category: 'body'
  },
  {
    keyword: '梦见牙齿',
    summary: '齿者，骨之余。梦之主口舌是非、亲人健康，齿落尤主血光之灾或长辈有忧。',
    fortune: '凶',
    category: 'body'
  },
  {
    keyword: '梦见流血',
    summary: '血者，生命之源。梦之主损耗之象，或指健康预警，宜注意身体。',
    fortune: '凶',
    category: 'body'
  },
  {
    keyword: '梦见分娩',
    summary: '孕者，新生之象。梦之主新生命降临，或指项目即将落地，宜做好准备。',
    fortune: '吉',
    category: 'body'
  },
  {
    keyword: '梦见生病',
    summary: '病者，虚弱之象。梦之主身体预警，或指事业受阻，宜注意调养。',
    fortune: '凶',
    category: 'body'
  },
  {
    keyword: '梦见死亡',
    summary: '死者，终结之象。梦之主旧我死去，新我诞生，或指重大转变，宜坦然面对。',
    fortune: '中平',
    category: 'body'
  },
  {
    keyword: '梦见整容',
    summary: '整容者，改变之象。梦之主渴望改变，或指不自信，宜接纳自我。',
    fortune: '中平',
    category: 'body'
  },
  {
    keyword: '梦见变胖',
    summary: '胖者，富足之象。梦之主生活安逸，或指压力导致，宜注意饮食健康。',
    fortune: '中平',
    category: 'body'
  },
  {
    keyword: '梦见变瘦',
    summary: '瘦者，消耗之象。梦之主精力透支，或指压力巨大，宜注意休息。',
    fortune: '凶',
    category: 'body'
  },
  {
    keyword: '梦见眼睛',
    summary: '眼者，心灵之窗。梦之主观察力增强，或指看清真相，宜保持敏锐。',
    fortune: '吉',
    category: 'body'
  },
  {
    keyword: '梦见耳朵',
    summary: '耳者，聆听之象。梦之主需要倾听，或指消息传来，宜注意听闻。',
    fortune: '中平',
    category: 'body'
  }
]

// ==================== 状态管理 ====================
interface DreamState {
  records: DreamRecord[]
  isLoading: boolean
  currentResult: DreamRecord | null

  addRecord: (record: DreamRecord) => void
  setLoading: (loading: boolean) => void
  setCurrentResult: (result: DreamRecord | null) => void
  clearRecords: () => void
}

export const useDreamStore = create<DreamState>()(
  persist(
    (set) => ({
      records: [],
      isLoading: false,
      currentResult: null,

      addRecord: (record) => {
        set((state) => ({
          records: [record, ...state.records].slice(0, 50)
        }))
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setCurrentResult: (result) => set({ currentResult: result }),
      clearRecords: () => set({ records: [] })
    }),
    {
      name: 'dream-storage',
      // 只持久化 records，不保存 currentResult（避免刷新后还显示着上次的结果）
      partialize: (state) => ({ records: state.records })
    }
  )
)
