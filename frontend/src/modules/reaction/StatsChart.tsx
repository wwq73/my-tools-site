import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TestRecord } from './ReactionStore'

interface StatsChartProps {
  records: TestRecord[]
  maxDisplay?: number
}

export function StatsChart({ records, maxDisplay = 20 }: StatsChartProps) {
  const validRecords = useMemo(() => 
    records.filter((r) => r.isValid).slice(0, maxDisplay).reverse(),
    [records, maxDisplay]
  )

  if (validRecords.length < 2) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
        至少完成 2 次有效测试后显示趋势图
      </div>
    )
  }

  const times = validRecords.map((r) => r.reactionTime)
  const min = Math.min(...times)
  const max = Math.max(...times)
  const range = max - min || 1

  // 计算平均值线
  const avg = times.reduce((a, b) => a + b, 0) / times.length

  // SVG 尺寸
  const width = 600
  const height = 200
  const padding = { top: 20, right: 10, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // 坐标转换
  const getX = (index: number) => padding.left + (index / (times.length - 1)) * chartWidth
  const getY = (time: number) => padding.top + chartHeight - ((time - min) / range) * chartHeight

  // 生成路径
  const linePath = times.map((time, i) => 
    `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(time)}`
  ).join(' ')

  // 区域路径（用于填充渐变）
  const areaPath = `${linePath} L ${getX(times.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`

  // 趋势
  const firstHalf = times.slice(0, Math.floor(times.length / 2))
  const secondHalf = times.slice(Math.floor(times.length / 2))
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  const trend = secondAvg < firstAvg ? 'improving' : secondAvg > firstAvg ? 'worsening' : 'stable'

  return (
    <div className="space-y-4">
      {/* 趋势指示 */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-secondary)]">近期趋势:</span>
        {trend === 'improving' && (
          <span className="flex items-center gap-1 text-green-500 font-medium">
            <TrendingUp className="w-4 h-4" />
            提升中
          </span>
        )}
        {trend === 'worsening' && (
          <span className="flex items-center gap-1 text-red-500 font-medium">
            <TrendingDown className="w-4 h-4" />
            下滑中
          </span>
        )}
        {trend === 'stable' && (
          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
            <Minus className="w-4 h-4" />
            稳定
          </span>
        )}
      </div>

      {/* SVG 图表 */}
      <div className="w-full overflow-x-auto">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full max-w-2xl mx-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Y轴网格线 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * (1 - ratio)
            const value = Math.round(min + range * ratio)
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-[var(--text-secondary)]"
                  style={{ fontSize: '10px' }}
                >
                  {value}ms
                </text>
              </g>
            )
          })}

          {/* 平均线 */}
          <line
            x1={padding.left}
            y1={getY(avg)}
            x2={width - padding.right}
            y2={getY(avg)}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          <text
            x={width - padding.right}
            y={getY(avg) - 6}
            textAnchor="end"
            className="text-xs fill-amber-500"
            style={{ fontSize: '10px' }}
          >
            平均 {Math.round(avg)}ms
          </text>

          {/* 区域填充 */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* 折线 */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 数据点 */}
          {times.map((time, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(time)}
              r="4"
              fill={time === min ? '#22c55e' : time === max ? '#ef4444' : '#3b82f6'}
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* X轴标签 */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="text-xs fill-[var(--text-secondary)]"
            style={{ fontSize: '11px' }}
          >
            最近 {times.length} 次测试
          </text>
        </svg>
      </div>
    </div>
  )
}
