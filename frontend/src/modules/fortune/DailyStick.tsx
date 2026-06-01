import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Scroll, 
  RotateCcw, 
  History, 
  ChevronRight,
  Flame,
  Wind,
  Droplets,
  Mountain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost } from '../../api';

interface DrawResponse {
  stick_number: number;
  level: string;
  palace: string;
  poem: string;
  interpretation: string;
  meaning: string;
  story: string;
  drawn_at: string;
  can_redraw: boolean;
  message: string;
}

const levelConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; desc: string }> = {
  '上上': {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: <Flame className="w-6 h-6" />,
    desc: '大吉大利，诸事顺遂'
  },
  '中平': {
    color: 'text-teal-500',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    icon: <Wind className="w-6 h-6" />,
    desc: '平稳安顺，守旧待时'
  },
  '下下': {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/50',
    icon: <Droplets className="w-6 h-6" />,
    desc: '暂遇阻滞，谨慎守旧'
  }
};

const palaceConfig: Record<string, { element: string; direction: string }> = {
  '子宫': { element: '水', direction: '北' },
  '丑宫': { element: '土', direction: '东北' },
  '寅宫': { element: '木', direction: '东北' },
  '卯宫': { element: '木', direction: '东' },
  '辰宫': { element: '土', direction: '东南' },
  '巳宫': { element: '火', direction: '东南' },
  '午宫': { element: '火', direction: '南' },
  '未宫': { element: '土', direction: '西南' },
  '申宫': { element: '金', direction: '西南' },
  '酉宫': { element: '金', direction: '西' },
  '戌宫': { element: '土', direction: '西北' },
  '亥宫': { element: '水', direction: '西北' }
};

// 预设摇签动画值，避免使用 Math.random() 导致重渲染
const SHAKE_Y_VALUES = [12, 18, 25, 15, 22, 30, 10];
const SHAKE_ROTATE_VALUES = [10, -15, 20, -12, 18, -25, 8];

export default function DailyStick() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<DrawResponse | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');

  // 生成用户ID（使用本地存储或随机生成）
  const getUserId = () => {
    let userId = localStorage.getItem('fortune_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('fortune_user_id', userId);
    }
    return userId;
  };

  // 检查今日是否已抽签
  useEffect(() => {
    checkTodayStick();
  }, []);

  const checkTodayStick = async () => {
    try {
      const userId = getUserId();
      const data = await apiGet(`/api/fortune/today/${userId}`);
      if (data.has_drawn && data.stick) {
        setHasDrawn(true);
        // 后端返回的 stick 数据映射到 DrawResponse 格式
        const mappedResult: DrawResponse = {
          stick_number: data.stick.number,
          level: data.stick.level,
          palace: data.stick.palace,
          poem: data.stick.poem,
          interpretation: data.stick.interpretation,
          meaning: data.stick.meaning,
          story: data.stick.story,
          drawn_at: data.drawn_at,
          can_redraw: false,
          message: '今日已抽过灵签，每日一签，心诚则灵'
        };
        setResult(mappedResult);
      }
    } catch (err) {
      console.error('检查今日签文失败:', err);
    }
  };

  const handleDraw = async () => {
    if (hasDrawn) return;

    setIsDrawing(true);
    setError('');

    try {
      const userId = getUserId();
      const data = await apiPost('/api/fortune/draw', { user_id: userId });

      // 模拟摇签动画延迟
      setTimeout(() => {
        setResult(data);
        setHasDrawn(true);
        setIsDrawing(false);
      }, 2000);

    } catch (err) {
      setError('抽签失败，请稍后重试');
      setIsDrawing(false);
    }
  };

  const loadHistory = async () => {
    try {
      const userId = getUserId();
      const data = await apiGet(`/api/fortune/history/${userId}?limit=30`);
      setHistory(data.items || []);
      setShowHistory(true);
    } catch (err) {
      console.error('加载历史失败:', err);
    }
  };

  const levelInfo = result ? levelConfig[result.level] : null;
  const palaceInfo = result ? palaceConfig[result.palace] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部装饰 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 w-20 h-20 rounded-full bg-yellow-300 blur-xl" />
          <div className="absolute top-8 right-20 w-16 h-16 rounded-full bg-yellow-300 blur-lg" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">每日灵签</h1>
          <p className="text-red-100">观音灵签 · 诚心祈愿 · 指点迷津</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 操作区 */}
        {!result && !isDrawing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            {/* 签筒动画 */}
            <div className="relative w-48 h-64 mx-auto mb-8">
              <motion.div
                animate={isDrawing ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-32 h-48 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-3xl rounded-t-lg shadow-2xl relative overflow-hidden">
                  {/* 签筒纹理 */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="h-full w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
                  </div>
                  {/* 签筒口 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-amber-600 rounded-full" />
                  {/* 签子露出部分 */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                        className="w-3 h-16 bg-gradient-to-b from-red-700 to-red-900 rounded-t-sm"
                      />
                    ))}
                  </div>
                  {/* 签筒装饰 */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-amber-200 text-xs font-bold">
                    观音灵签
                  </div>
                </div>
              </motion.div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              每日一签，心诚则灵。闭目静心，默念所求，点击抽签。
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDraw}
              className="px-12 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              诚心求签
            </motion.button>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={loadHistory}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors"
              >
                <History className="w-4 h-4" />
                历史记录
              </button>
            </div>
          </motion.div>
        )}

        {/* 摇签动画 */}
        {isDrawing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ 
                rotate: [0, -15, 15, -15, 15, 0],
                y: [0, -20, 0]
              }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-32 h-48 mx-auto mb-8 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-3xl rounded-t-lg shadow-2xl relative"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -SHAKE_Y_VALUES[i], 0],
                      rotate: [0, SHAKE_ROTATE_VALUES[i], 0]
                    }}
                    transition={{ duration: 0.4, delay: i * 0.1, repeat: Infinity }}
                    className="w-3 h-20 bg-gradient-to-b from-red-600 to-red-800 rounded-t-sm"
                  />
                ))}
              </div>
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl text-red-600 dark:text-red-400 font-medium"
            >
              签筒摇晃中...
            </motion.p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">诚心默念，静待签落</p>
          </motion.div>
        )}

        {/* 签文结果 */}
        <AnimatePresence>
          {result && levelInfo && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              {/* 签头 */}
              <div className={`rounded-2xl p-6 mb-6 ${levelInfo.bgColor} border border-opacity-20`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${levelInfo.color}`}>
                      {levelInfo.icon}
                    </div>
                    <div>
                      <span className={`text-2xl font-bold ${levelInfo.color}`}>
                        第 {result.stick_number} 签
                      </span>
                      <span className={`ml-3 px-3 py-1 rounded-full text-sm font-bold ${levelInfo.color} bg-white dark:bg-gray-800`}>
                        {result.level}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{result.palace}</span>
                    {palaceInfo && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({palaceInfo.element}·{palaceInfo.direction})
                      </span>
                    )}
                  </div>
                </div>

                {/* 签诗 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-4">
                  <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
                    <Scroll className="w-4 h-4" />
                    <span className="text-sm font-medium">签诗</span>
                  </div>
                  <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-100 font-medium text-center">
                    {result.poem}
                  </p>
                </div>

                {/* 诗意解释 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-4">
                  <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
                    <Mountain className="w-4 h-4" />
                    <span className="text-sm font-medium">诗意</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {result.meaning}
                  </p>
                </div>

                {/* 解签 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-4">
                  <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">解签</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {result.interpretation}
                  </p>
                </div>

                {/* 典故 */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    典故：{result.story}
                  </span>
                </div>
              </div>

              {/* 底部操作 */}
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setResult(null);
                    setHasDrawn(false);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow hover:shadow-md transition-shadow"
                >
                  <RotateCcw className="w-4 h-4" />
                  再抽一签
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadHistory}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow hover:shadow-md transition-shadow"
                >
                  <History className="w-4 h-4" />
                  历史记录
                </motion.button>
              </div>

              <p className="text-center text-sm text-gray-400 mt-4">
                {result.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        {/* 历史记录弹窗 */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <History className="w-5 h-5" />
                      抽签历史
                    </h3>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {history.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">暂无抽签记录</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            item.level === '上上' ? 'bg-orange-100 text-orange-600' :
                            item.level === '中平' ? 'bg-teal-100 text-teal-600' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {item.stick_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.level}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(item.drawn_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {item.poem?.substring(0, 20)}...
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 签文浏览区（底部） */}
      </div>
    </div>
  );
}
