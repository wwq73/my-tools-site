import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Bookmark, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiGet } from '../../api';

interface StickData {
  number: number;
  level: string;
  palace: string;
  poem: string;
  interpretation: string;
  meaning: string;
  story: string;
}

const levelColors: Record<string, string> = {
  '上上': 'from-orange-500 to-red-500',
  '中平': 'from-teal-500 to-cyan-500',
  '下下': 'from-gray-500 to-gray-600'
};

// localStorage key 加前缀避免冲突
const BOOKMARK_KEY = 'mytools_stick_bookmarks';

export default function StickDetail() {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const [stick, setStick] = useState<StickData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (number) {
      fetchStick();
      checkBookmark();
    }
  }, [number]);

  const fetchStick = async () => {
    setLoading(true);
    setError('');
    try {
      // 显式转换为数字
      const stickNum = Number(number);
      if (isNaN(stickNum) || stickNum < 1 || stickNum > 100) {
        throw new Error('无效的签号');
      }

      const data = await apiGet(`/api/fortune/${stickNum}`);
      if (!data || data.number === undefined) {
        throw new Error('签文不存在');
      }
      setStick(data);
    } catch (err: any) {
      setError(err.message || '加载签文失败，请稍后重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = () => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
      setIsBookmarked(bookmarks.includes(Number(number)));
    } catch {
      setIsBookmarked(false);
    }
  };

  const toggleBookmark = () => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
      const num = Number(number);

      if (isBookmarked) {
        const filtered = bookmarks.filter((n: number) => n !== num);
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(filtered));
      } else {
        bookmarks.push(num);
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
      }

      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('书签操作失败:', err);
    }
  };

  const shareStick = async () => {
    if (!stick) return;

    const shareText = `观音灵签第${stick.number}签 - ${stick.level}\n${stick.poem}\n\n${stick.meaning}`;

    // 优先使用 Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: `观音灵签第${stick.number}签 - ${stick.level}`,
          text: shareText,
          url: window.location.href
        });
        return;
      } catch (err) {
        console.log('分享取消或失败，尝试降级方案');
      }
    }

    // 降级：复制到剪贴板
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      // 最终降级：显示文本供用户手动复制
      alert('请手动复制签文\n\n' + shareText);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">加载签文中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchStick}
            className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            重试
          </button>
          <button
            onClick={() => navigate('/fortune')}
            className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (!stick) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <p className="text-gray-500">签文不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/fortune')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <div className="flex gap-2">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
              title={isBookmarked ? '取消收藏' : '收藏签文'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={shareStick}
              className={`p-2 rounded-full transition-colors ${
                copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
              title={copied ? '已复制' : '分享签文'}
            >
              {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
        >
          {/* 签头横幅 */}
          <div className={`bg-gradient-to-r ${levelColors[stick.level] || 'from-gray-500 to-gray-600'} p-8 text-white text-center`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <span className="text-6xl font-bold">{stick.number}</span>
            </motion.div>
            <div className="mt-2 text-lg opacity-90">
              第 {stick.number} 签 · {stick.level}
            </div>
            <div className="mt-1 text-sm opacity-75">
              {stick.palace}
            </div>
          </div>

          {/* 签诗 */}
          <div className="p-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                签诗
              </h3>
              <p className="text-xl leading-loose text-gray-800 dark:text-gray-100 font-medium text-center">
                {stick.poem}
              </p>
            </div>

            {/* 诗意 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                诗意
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {stick.meaning}
              </p>
            </div>

            {/* 解签 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                解签
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {stick.interpretation}
              </p>
            </div>

            {/* 典故 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                典故：{stick.story}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 相邻签导航 */}
        <div className="flex justify-between mt-6">
          {stick.number > 1 && (
            <button
              onClick={() => navigate(`/fortune/stick/${stick.number - 1}`)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              ← 第 {stick.number - 1} 签
            </button>
          )}
          {stick.number < 100 && (
            <button
              onClick={() => navigate(`/fortune/stick/${stick.number + 1}`)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
            >
              第 {stick.number + 1} 签 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
