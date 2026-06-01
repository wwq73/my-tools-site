import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function StickDetail() {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const [stick, setStick] = useState<StickData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchStick();
    checkBookmark();
  }, [number]);

  const fetchStick = async () => {
    try {
      const res = await fetch(`/api/fortune/${number}`);
      if (!res.ok) throw new Error('获取签文失败');
      const data = await res.json();
      setStick(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('stick_bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(Number(number)));
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('stick_bookmarks') || '[]');
    const num = Number(number);

    if (isBookmarked) {
      const filtered = bookmarks.filter((n: number) => n !== num);
      localStorage.setItem('stick_bookmarks', JSON.stringify(filtered));
    } else {
      bookmarks.push(num);
      localStorage.setItem('stick_bookmarks', JSON.stringify(bookmarks));
    }

    setIsBookmarked(!isBookmarked);
  };

  const shareStick = async () => {
    if (navigator.share && stick) {
      try {
        await navigator.share({
          title: `观音灵签第${stick.number}签 - ${stick.level}`,
          text: stick.poem,
          url: window.location.href
        });
      } catch (err) {
        console.log('分享取消');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stick) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        签文不存在
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
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <div className="flex gap-2">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={shareStick}
              className="p-2 rounded-full bg-gray-100 text-gray-600"
            >
              <Share2 className="w-5 h-5" />
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
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow text-gray-600 dark:text-gray-300 hover:bg-red-50"
            >
              ← 第 {stick.number - 1} 签
            </button>
          )}
          {stick.number < 100 && (
            <button
              onClick={() => navigate(`/fortune/stick/${stick.number + 1}`)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow text-gray-600 dark:text-gray-300 hover:bg-red-50 ml-auto"
            >
              第 {stick.number + 1} 签 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
