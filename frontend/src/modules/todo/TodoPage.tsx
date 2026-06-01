import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Download,
  Upload,
  X,
  ChevronDown,
  Calendar,
} from 'lucide-react'
import { useTodoStore } from './TodoStore'

export function TodoPage() {
  const [inputValue, setInputValue] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [showListMenu, setShowListMenu] = useState(false)
  const [newListName, setNewListName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    todos,
    currentList,
    lists,
    addTodo,
    toggleTodo,
    deleteTodo,
    setCurrentList,
    addList,
    deleteList,
    exportData,
    importData,
  } = useTodoStore()

  const filteredTodos = todos.filter((t) => t.listId === currentList)
  const doneCount = filteredTodos.filter((t) => t.done).length
  const totalCount = filteredTodos.length

  const handleAdd = () => {
    if (!inputValue.trim()) return
    addTodo(inputValue.trim(), isUrgent)
    setInputValue('')
    setIsUrgent(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todos-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      importData(event.target?.result as string)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleAddList = () => {
    if (!newListName.trim()) return
    addList(newListName.trim())
    setNewListName('')
    setShowListMenu(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <div className="flex-grow">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            待办管理器
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {doneCount}/{totalCount} 已完成
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            title="导出数据"
          >
            <Download className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            title="导入数据"
          >
            <Upload className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* List Selector */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowListMenu(!showListMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] 
                     border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]
                     hover:bg-[var(--card-hover)] transition-colors"
        >
          <Calendar className="w-4 h-4" />
          {currentList === 'default' ? '默认列表' : currentList}
          <ChevronDown className="w-4 h-4" />
        </button>

        {showListMenu && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--card-bg)] 
                          border border-[var(--border-color)] rounded-xl shadow-lg z-10
                          animate-slide-up">
            <div className="p-2">
              {lists.map((list) => (
                <div
                  key={list}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                    ${currentList === list ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-[var(--bg-secondary)]'}`}
                  onClick={() => {
                    setCurrentList(list)
                    setShowListMenu(false)
                  }}
                >
                  <span className="text-[var(--text-primary)]">
                    {list === 'default' ? '默认列表' : list}
                  </span>
                  {list !== 'default' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`删除列表 "${list}"？`)) {
                          deleteList(list)
                        }
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                <div className="flex gap-2 px-2">
                  <input
                    type="text"
                    placeholder="新列表名称"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
                    className="input text-sm py-1.5"
                  />
                  <button
                    onClick={handleAddList}
                    className="btn-primary px-3 py-1.5"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Todo */}
      <div className="flex gap-2 mb-6">
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="添加新任务..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input pr-24"
          />
          <button
            onClick={() => setIsUrgent(!isUrgent)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md text-xs font-medium
              transition-colors ${
                isUrgent
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-red-500'
              }`}
          >
            <AlertCircle className="w-3 h-3 inline mr-1" />
            紧急
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Todo List */}
      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--text-secondary)] text-lg mb-2">暂无任务</p>
            <p className="text-sm text-[var(--text-secondary)]">
              添加你的第一个待办事项吧
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`group flex items-center gap-3 p-4 rounded-xl border transition-all duration-200
                ${
                  todo.done
                    ? 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]/50'
                    : todo.urgent
                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                    : 'bg-[var(--card-bg)] border-[var(--border-color)] hover:shadow-sm'
                }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200 ${
                    todo.done
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-[var(--border-color)] hover:border-primary-500'
                  }`}
              >
                {todo.done && <Check className="w-4 h-4 text-white" />}
              </button>

              <div className="flex-grow min-w-0">
                <p
                  className={`text-[var(--text-primary)] transition-all ${
                    todo.done ? 'line-through text-[var(--text-secondary)]' : ''
                  }`}
                >
                  {todo.text}
                </p>
                {todo.urgent && !todo.done && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    紧急
                  </span>
                )}
              </div>

              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg 
                           hover:bg-red-100 dark:hover:bg-red-900/30 
                           text-[var(--text-secondary)] hover:text-red-500 
                           transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--text-secondary)]">完成进度</span>
            <span className="text-[var(--text-primary)] font-medium">
              {Math.round((doneCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
