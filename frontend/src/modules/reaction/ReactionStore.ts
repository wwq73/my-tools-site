import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TestMode = 'visual' | 'audio' | 'mixed'
export type TestState = 'idle' | 'waiting' | 'ready' | 'result' | 'too_early'

export interface TestRecord {
  id: string
  mode: TestMode
  reactionTime: number  // ms
  timestamp: number
  isValid: boolean
}

export interface SessionStats {
  count: number
  best: number
  worst: number
  average: number
  validCount: number
}

interface ReactionState {
  // 当前测试状态
  testState: TestState
  currentMode: TestMode
  reactionTime: number

  // 历史记录
  records: TestRecord[]

  // 设置
  soundEnabled: boolean
  difficulty: 'easy' | 'normal' | 'hard'  // 影响等待时间范围

  // Actions
  setTestState: (state: TestState) => void
  setCurrentMode: (mode: TestMode) => void
  setReactionTime: (time: number) => void
  addRecord: (record: TestRecord) => void
  clearRecords: () => void
  setSoundEnabled: (enabled: boolean) => void
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void

  // Computed
  getStats: (mode?: TestMode) => SessionStats
  getRecentRecords: (count: number) => TestRecord[]
}

const DIFFICULTY_CONFIG = {
  easy: { minWait: 1500, maxWait: 4000 },
  normal: { minWait: 1000, maxWait: 3000 },
  hard: { minWait: 500, maxWait: 2500 },
}

export function getRandomWaitTime(difficulty: 'easy' | 'normal' | 'hard'): number {
  const config = DIFFICULTY_CONFIG[difficulty]
  return Math.floor(Math.random() * (config.maxWait - config.minWait) + config.minWait)
}

export function getGrade(reactionTime: number): { label: string; color: string } {
  if (reactionTime < 150) return { label: '神级', color: '#ef4444' }
  if (reactionTime < 200) return { label: '职业级', color: '#f97316' }
  if (reactionTime < 250) return { label: '优秀', color: '#eab308' }
  if (reactionTime < 300) return { label: '良好', color: '#22c55e' }
  if (reactionTime < 400) return { label: '一般', color: '#3b82f6' }
  return { label: '需练习', color: '#6b7280' }
}

export const useReactionStore = create<ReactionState>()(
  persist(
    (set, get) => ({
      testState: 'idle',
      currentMode: 'visual',
      reactionTime: 0,
      records: [],
      soundEnabled: true,
      difficulty: 'normal',

      setTestState: (state) => set({ testState: state }),
      setCurrentMode: (mode) => set({ currentMode: mode }),
      setReactionTime: (time) => set({ reactionTime: time }),

      addRecord: (record) => {
        set((state) => ({
          records: [record, ...state.records].slice(0, 1000), // 最多保留1000条
        }))
      },

      clearRecords: () => set({ records: [] }),

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setDifficulty: (difficulty) => set({ difficulty }),

      getStats: (mode) => {
        const records = mode 
          ? get().records.filter((r) => r.mode === mode && r.isValid)
          : get().records.filter((r) => r.isValid)

        if (records.length === 0) {
          return { count: 0, best: 0, worst: 0, average: 0, validCount: 0 }
        }

        const times = records.map((r) => r.reactionTime)
        return {
          count: records.length,
          best: Math.min(...times),
          worst: Math.max(...times),
          average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
          validCount: records.length,
        }
      },

      getRecentRecords: (count) => {
        return get().records.slice(0, count)
      },
    }),
    {
      name: 'reaction-storage',
      partialize: (state) => ({ records: state.records, soundEnabled: state.soundEnabled, difficulty: state.difficulty }),
    }
  )
)
