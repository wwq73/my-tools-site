import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PoemRecord {
  id: number
  title: string
  author: string
  rhythmic?: string
  source: string
  dynasty: string
  paragraphs: string[]
  match_line?: number | null
  match_snippet?: string | null
}

export interface SearchHistory {
  id: string
  query: string
  mode: 'fuzzy' | 'position' | 'feihualing'
  timestamp: number
  resultCount: number
}

interface PoetryState {
  // 搜索状态
  isLoading: boolean
  searchResults: PoemRecord[]
  totalResults: number
  currentPage: number
  totalPages: number
  currentQuery: string
  currentMode: 'fuzzy' | 'position' | 'feihualing'

  // 导航状态
  activeTab: 'fuzzy' | 'position' | 'feihualing'

  // 收藏
  bookmarks: number[]

  // 搜索历史
  searchHistory: SearchHistory[]

  // Actions
  setLoading: (loading: boolean) => void
  setResults: (poems: PoemRecord[], total: number, page: number, totalPages: number) => void
  setQuery: (query: string) => void
  setMode: (mode: 'fuzzy' | 'position' | 'feihualing') => void
  setActiveTab: (tab: 'fuzzy' | 'position' | 'feihualing') => void
  addSearchHistory: (entry: SearchHistory) => void
  clearHistory: () => void
  toggleBookmark: (poemId: number) => void
  isBookmarked: (poemId: number) => boolean
  clearResults: () => void
}

export const usePoetryStore = create<PoetryState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      searchResults: [],
      totalResults: 0,
      currentPage: 1,
      totalPages: 0,
      currentQuery: '',
      currentMode: 'fuzzy',
      activeTab: 'fuzzy',
      bookmarks: [],
      searchHistory: [],

      setLoading: (loading) => set({ isLoading: loading }),
      setResults: (poems, total, page, totalPages) =>
        set({ searchResults: poems, totalResults: total, currentPage: page, totalPages }),
      setQuery: (query) => set({ currentQuery: query }),
      setMode: (mode) => set({ currentMode: mode }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      addSearchHistory: (entry) =>
        set((state) => ({
          searchHistory: [entry, ...state.searchHistory].slice(0, 50),
        })),

      clearHistory: () => set({ searchHistory: [] }),

      toggleBookmark: (poemId) =>
        set((state) => {
          const bookmarks = state.bookmarks.includes(poemId)
            ? state.bookmarks.filter((id) => id !== poemId)
            : [...state.bookmarks, poemId]
          return { bookmarks }
        }),

      isBookmarked: (poemId) => get().bookmarks.includes(poemId),

      clearResults: () =>
        set({ searchResults: [], totalResults: 0, currentPage: 1, totalPages: 0 }),
    }),
    {
      name: 'poetry-store',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        searchHistory: state.searchHistory,
      }),
    }
  )
)
