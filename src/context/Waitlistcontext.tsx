'use client'

import { API_BASE_URL } from '@/utils/api'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Perk = {
  title: string
  subtitle: string
  value: number // rupee value of the perk; 0 = free / no cash value
}

export type LaunchConfig = {
  waitlistEnabled: boolean
  appLaunched: boolean
  launchDate: string // ISO string in UTC, e.g. "2026-09-01T10:00:00.000Z"
  originalPrice: number // ₹ before discount
  discountAmount: number // ₹ off
  finalPrice: number // ₹ paid = originalPrice - discountAmount (derived on save)
  welcomeCoins: number // coins granted on join
  totalBenefitsValue: number // ₹ = sum of perk values (derived on save)
  description: string
  perks: Perk[]
}

/* ------------------------------------------------------------------ */
/*  Config + helpers                                                   */
/* ------------------------------------------------------------------ */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  `${API_BASE_URL}/api/admin`

// Empty starting config. Real values come from the API on mount; if the database
// has no row yet, every field stays blank/zero — no static placeholder values.
const DEFAULT_LAUNCH_CONFIG: LaunchConfig = {
  waitlistEnabled: false,
  appLaunched: false,
  launchDate: '',
  originalPrice: 0,
  discountAmount: 0,
  finalPrice: 0,
  welcomeCoins: 0,
  totalBenefitsValue: 0,
  description: '',
  perks: [],
}

// Compute derived money fields so they can never drift from their inputs.
// discountAmount is a PERCENTAGE (e.g. 50 = 50% off), not a rupee amount.
export const computeFinalPrice = (c: Pick<LaunchConfig, 'originalPrice' | 'discountAmount'>) => {
  const original = Number(c.originalPrice) || 0
  const percent = Number(c.discountAmount) || 0
  return Math.max(0, Math.round(original - (original * percent) / 100))
}

export const computeTotalBenefits = (perks: Perk[]) =>
  (perks || []).reduce((sum, p) => sum + (Number(p?.value) || 0), 0)

// Map a raw API launch-config object into our LaunchConfig shape.
// Money/number fields may arrive as strings (Prisma Decimal) — coerce to number.
function mapLaunchConfig(d: any): LaunchConfig {
  const perks: Perk[] = Array.isArray(d?.perks)
    ? d.perks.map((p: any) => ({
        title: String(p?.title ?? ''),
        subtitle: String(p?.subtitle ?? ''),
        value: Number(p?.value) || 0,
      }))
    : []
  return {
    waitlistEnabled: Boolean(d?.waitlistEnabled),
    appLaunched: Boolean(d?.appLaunched),
    launchDate: d?.launchDate ?? '',
    originalPrice: Number(d?.originalPrice) || 0,
    discountAmount: Number(d?.discountAmount) || 0,
    finalPrice: Number(d?.finalPrice) || 0,
    welcomeCoins: Number(d?.welcomeCoins) || 0,
    totalBenefitsValue: Number(d?.totalBenefitsValue) || 0,
    description: d?.description ?? '',
    perks,
  }
}

// Turn whatever the API / a thrown Error gives us into one readable line.
// Handles: plain string, { message }, and Zod-style { errors|issues: [{ message }] }.
export function humanizeError(err: unknown): string {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object') {
    const e = err as any
    const issues = e.errors ?? e.issues
    if (Array.isArray(issues) && issues.length) {
      const msg = issues
        .map((i: any) => i?.message)
        .filter(Boolean)
        .join(', ')
      if (msg) return msg
    }
    if (typeof e.message === 'string' && e.message) return e.message
  }
  return 'Something went wrong. Please try again.'
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

type WaitlistContextValue = {
  launchConfig: LaunchConfig
  setLaunchConfig: React.Dispatch<React.SetStateAction<LaunchConfig>>
  updateLaunchConfig: (patch: Partial<LaunchConfig>) => void
  addPerk: () => void
  updatePerk: (index: number, patch: Partial<Perk>) => void
  removePerk: (index: number) => void
  loading: boolean
  saving: boolean
  error: string | null
  setError: (e: string | null) => void
  fetchLaunchConfig: () => Promise<void>
  saveLaunchConfig: () => Promise<boolean>
}

const WaitlistContext = createContext<WaitlistContextValue | undefined>(undefined)

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>(DEFAULT_LAUNCH_CONFIG)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateLaunchConfig = useCallback((patch: Partial<LaunchConfig>) => {
    setLaunchConfig((c) => ({ ...c, ...patch }))
  }, [])

  const addPerk = useCallback(() => {
    setLaunchConfig((c) => ({
      ...c,
      perks: [...c.perks, { title: '', subtitle: '', value: 0 }],
    }))
  }, [])

  const updatePerk = useCallback((index: number, patch: Partial<Perk>) => {
    setLaunchConfig((c) => ({
      ...c,
      perks: c.perks.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }))
  }, [])

  const removePerk = useCallback((index: number) => {
    setLaunchConfig((c) => ({
      ...c,
      perks: c.perks.filter((_, i) => i !== index),
    }))
  }, [])

  const fetchLaunchConfig = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE}/waitlist/get`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(humanizeError(json))
      // data can be null if no config row exists yet — keep defaults in that case.
      if (json.data) setLaunchConfig(mapLaunchConfig(json.data))
    } catch (err) {
      setError(humanizeError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const saveLaunchConfig = useCallback(async (): Promise<boolean> => {
    setError(null)

    // launchDate is required by the backend (Prisma DateTime) — block empty saves.
    if (!launchConfig.launchDate) {
      setError('Please set a launch date & time before saving.')
      return false
    }

    // Recompute derived fields at save time so they always match their inputs.
    const finalPrice = computeFinalPrice(launchConfig)
    const totalBenefitsValue = computeTotalBenefits(launchConfig.perks)

    try {
      setSaving(true)
      const res = await fetch(`${API_BASE}/waitlist/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waitlistEnabled: launchConfig.waitlistEnabled,
          appLaunched: launchConfig.appLaunched,
          launchDate: launchConfig.launchDate,
          originalPrice: launchConfig.originalPrice,
          discountAmount: launchConfig.discountAmount,
          finalPrice,
          welcomeCoins: launchConfig.welcomeCoins,
          totalBenefitsValue,
          description: launchConfig.description,
          perks: launchConfig.perks,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(humanizeError(json))
      // Re-sync with what the server stored (it may normalize perk subtitles, etc.).
      if (json.data) setLaunchConfig(mapLaunchConfig(json.data))
      return true
    } catch (err) {
      setError(humanizeError(err))
      return false
    } finally {
      setSaving(false)
    }
  }, [launchConfig])

  // Load once on mount.
  useEffect(() => {
    fetchLaunchConfig()
  }, [fetchLaunchConfig])

  const value: WaitlistContextValue = {
    launchConfig,
    setLaunchConfig,
    updateLaunchConfig,
    addPerk,
    updatePerk,
    removePerk,
    loading,
    saving,
    error,
    setError,
    fetchLaunchConfig,
    saveLaunchConfig,
  }

  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext)
  if (!ctx) {
    throw new Error('useWaitlist must be used within a <WaitlistProvider>')
  }
  return ctx
}