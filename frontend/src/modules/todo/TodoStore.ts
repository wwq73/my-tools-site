import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Todo } from '../types'

interface TodoState {
  todos: Todo[]
  currentList: string
  lists: string[]

  // Actions
  addTodo: (text: string, urgent?: boolean) => void
  toggleTodo: (id: number) => void
  deleteTodo: (id: number) => void
  updateTodo: (id: number, updates: Partial<Todo>) => void
  setCurrentList: (listId: string) => void
  addList: (name: string) => void
  deleteList: (listId: string) => void
  exportData: () => string
  importData: (json: string) => void
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      currentList: 'default',
      lists: ['default'],

      addTodo: (text, urgent = false) => {
        const newTodo: Todo = {
          id: Date.now(),
          text,
          done: false,
          urgent,
          listId: get().currentList,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ todos: [newTodo, ...state.todos] }))
      },

      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        }))
      },

      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        }))
      },

      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      setCurrentList: (listId) => {
        set({ currentList: listId })
      },

      addList: (name) => {
        set((state) => ({
          lists: [...state.lists, name],
          currentList: name,
        }))
      },

      deleteList: (listId) => {
        set((state) => ({
          lists: state.lists.filter((l) => l !== listId),
          todos: state.todos.filter((t) => t.listId !== listId),
          currentList: listId === state.currentList ? 'default' : state.currentList,
        }))
      },

      exportData: () => {
        return JSON.stringify(
          { todos: get().todos, lists: get().lists },
          null,
          2
        )
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json)
          if (data.todos && data.lists) {
            set({ todos: data.todos, lists: data.lists })
          }
        } catch {
          alert('导入失败：无效的 JSON 格式')
        }
      },
    }),
    {
      name: 'todo-storage',
    }
  )
)
