'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'

export interface IntentionOption {
  id?: string
  option: string
  optDescription: string
}

export interface Intention {
  id?: string
  title: string
  description: string
  sortOrder: number
  isActive: boolean
  options: IntentionOption[]
}

interface IntentionContextType {
  data: Intention[]
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
  createData: (payload: Intention) => Promise<void>
  deleteData: () => Promise<void>
}

const IntentionContext = createContext<IntentionContextType | undefined>(undefined)

export const IntentionProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Intention[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = `${API_BASE_URL}/api/intention`

  // GET ALL
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/get-all`)
      setData(res.data.data ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // CREATE / UPDATE (single JSON body; backend upserts the one intention)
  const createData = async (payload: Intention) => {
    try {
      setLoading(true)
      await axios.post(`${API_URL}/create`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      await fetchData()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // DELETE (backend deletes the first/only intention — no id needed)
  const deleteData = async () => {
    try {
      setLoading(true)
      await axios.delete(`${API_URL}/delete`)
      setData([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <IntentionContext.Provider
      value={{ data, loading, error, fetchData, createData, deleteData }}
    >
      {children}
    </IntentionContext.Provider>
  )
}

export const useIntention = () => {
  const context = useContext(IntentionContext)
  if (!context) {
    throw new Error('useIntention must be used inside IntentionProvider')
  }
  return context
}