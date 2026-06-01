/**
 * API 工具 - 统一处理前后端 API 调用
 * 开发环境：通过 Vite proxy 转发 /api -> localhost:8000
 * 生产环境：通过 VITE_API_URL 指向 Render 后端地址
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error(`API GET ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API POST ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}
