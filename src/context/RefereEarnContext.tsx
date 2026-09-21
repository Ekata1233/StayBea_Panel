'use client'


import { API_BASE_URL } from '@/utils/api'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

/* ------------------------------- API types -------------------------------- */
export type ReferEarnDescription = {
  sortOrder: number
  description: string
}

export type ReferEarnConfig = {
  id: string
  signupReward: string
  packageReward: string
  waitlistReward: string
  title: string
  descriptions: ReferEarnDescription[]
  createdAt: string
  updatedAt: string
}

export type ReferEarnPayload = {
  id?: string
  title: string
  signupReward: number
  packageReward: number
  waitlistReward: number
  descriptions: ReferEarnDescription[]
}

type ApiResponse<T> = { success: boolean; data: T; message?: string }

/* ------------------------------ API endpoints ----------------------------- */
const API_URL = `${API_BASE_URL}/api/admin/referEarn`
const GET_URL = `${API_URL}/get`
const CREATE_URL = `${API_URL}/create`

// TODO: match this to how the rest of your admin panel sends auth.
// If your other contexts use an axios instance with an interceptor, swap
// `request()` below for that instance instead of duplicating token logic here.
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  let body: ApiResponse<T> | null = null
  try {
    body = (await res.json()) as ApiResponse<T>
  } catch {
    /* non-JSON error body */
  }

  if (!res.ok || !body?.success) {
    throw new Error(body?.message || `Request failed (${res.status})`)
  }
  return body.data
}

/* -------------------------------- context --------------------------------- */
type ReferEarnContextValue = {
  config: ReferEarnConfig | null
  loading: boolean
  saving: boolean
  error: string | null
  fetchConfig: () => Promise<void>
  saveConfig: (payload: ReferEarnPayload) => Promise<ReferEarnConfig>
  clearError: () => void
}

const ReferEarnContext = createContext<ReferEarnContextValue | undefined>(undefined)

export function ReferEarnProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ReferEarnConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await request<ReferEarnConfig>(GET_URL, { method: 'GET' })
      // Keep descriptions in sortOrder regardless of what the API returns.
      setConfig({
        ...data,
        descriptions: [...(data.descriptions || [])].sort((a, b) => a.sortOrder - b.sortOrder),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reward rules')
    } finally {
      setLoading(false)
    }
  }, [])

  const saveConfig = useCallback(async (payload: ReferEarnPayload) => {
    setSaving(true)
    setError(null)
    try {
      const data = await request<ReferEarnConfig>(CREATE_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setConfig({
        ...data,
        descriptions: [...(data.descriptions || [])].sort((a, b) => a.sortOrder - b.sortOrder),
      })
      return data
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save reward rules'
      setError(msg)
      throw e
    } finally {
      setSaving(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const value = useMemo(
    () => ({
      config,
      loading,
      saving,
      error,
      fetchConfig,
      saveConfig,
      clearError: () => setError(null),
    }),
    [config, loading, saving, error, fetchConfig, saveConfig],
  )

  return <ReferEarnContext.Provider value={value}>{children}</ReferEarnContext.Provider>
}

export function useReferEarn() {
  const ctx = useContext(ReferEarnContext)
  if (!ctx) throw new Error('useReferEarn must be used inside <ReferEarnProvider>')
  return ctx
}