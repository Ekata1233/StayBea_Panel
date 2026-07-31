'use client'

import { API_BASE_URL } from '@/utils/api'
import React, { createContext, useContext, useEffect, useState } from 'react'

/* ------------------------------ cards API types ------------------------------ */
export type ApiCardFeature = {
  title: string
  description: string | null
  limit: number | null
  resetPeriod: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
}

export type ApiPlanCard = {
  id: string
  name: string
  slug?: string
  badgeLabel: string | null
  discoveryPool: string
  active: boolean
  price: number
  originalPrice: number
  features: ApiCardFeature[]
  categoryCount: Record<string, number>
  featureSummary: string
}

/* ------------------------------ detail API types ------------------------------ */
export type ApiDetailPrice = {
  id: string
  packageId: string
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  months: number
  price: string | number
  originalPrice: string | number
  discountPercent: number
  isHighlighted: boolean
  active: boolean
}

export type ApiDetailLimit = {
  id: string
  packageId: string
  featureId: string
  enabled: boolean
  unlimited: boolean
  limit: number | null
  resetPeriod: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  feature: {
    id: string
    code: string
    title: string
    category: string
    description: string | null
  }
}

export type ApiPlanDetail = {
  id: string
  name: string
  slug: string
  tagline: string
  badgeLabel: string | null
  discoveryPool: string
  visibilityRule: string
  description: string
  isPopular: boolean
  active: boolean
  sortOrder: number
  prices: ApiDetailPrice[]
  limits: ApiDetailLimit[]
}

/* --------------------------- feature (entitlement) API --------------------------- */
// VERIFY: field names apne actual /api/package/feature/:slug response se match karo
export type ApiEntitlementFeature = {
  id: string
  title: string
  code: string
  category: string
  description: string | null
  active: boolean
}

/* ------------------------------ update payload ------------------------------ */
export type UpdatePackagePayload = {
  name?: string
  slug?: string
  tagline?: string
  badgeLabel?: string
  discoveryPool?: string
  visibilityRule?: string
  description?: string
  isPopular?: boolean
  active?: boolean
  sortOrder?: number
  prices?: {
    billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    months?: number
    price: number
    originalPrice?: number
    discountPercent?: number
    isHighlighted?: boolean
    active?: boolean
  }[]
  limits?: {
    featureCode: string
    enabled: boolean
    unlimited: boolean
    limit?: number | null
    resetPeriod: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  }[]
}

type ApiListResponse = {
  success: boolean
  data: ApiPlanCard[]
}

/* ------------------------------ context ------------------------------ */
type PackageContextType = {
  plans: ApiPlanCard[]
  loading: boolean
  error: string | null
  refetch: () => void
  getPlanById: (id: string) => ApiPlanCard | undefined
  fetchPlanBySlug: (slug: string) => Promise<ApiPlanDetail>
  fetchFeaturesBySlug: (slug: string) => Promise<ApiEntitlementFeature[]>
  updatePackage: (id: string, payload: UpdatePackagePayload) => Promise<ApiPlanDetail>
}

const PackageContext = createContext<PackageContextType | undefined>(undefined)


export function PackageProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<ApiPlanCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/package/get/cards`)
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const json: ApiListResponse = await res.json()
      if (!json.success) throw new Error('API returned success: false')
      setPlans(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const getPlanById = (id: string) => plans.find((p) => p.id === id)

  const fetchPlanBySlug = async (slug: string): Promise<ApiPlanDetail> => {
    const res = await fetch(`${API_BASE_URL}/api/package/get/slug/${slug}`)
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    const json = await res.json()
    if (!json.success) throw new Error('API returned success: false')
    return json.data as ApiPlanDetail
  }

  const fetchFeaturesBySlug = async (slug: string): Promise<ApiEntitlementFeature[]> => {
    const res = await fetch(`${API_BASE_URL}/api/package/feature/${slug}`)
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    const json = await res.json()
    if (!json.success) throw new Error('API returned success: false')
    return json.data as ApiEntitlementFeature[]
  }

  const updatePackage = async (
    id: string,
    payload: UpdatePackagePayload,
  ): Promise<ApiPlanDetail> => {
    const res = await fetch(`${API_BASE_URL}/api/package/update/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Update failed: ${res.status}`)
    const json = await res.json()
    if (!json.success) throw new Error(json.message ?? 'Update failed')
    await fetchPlans()
    return json.data as ApiPlanDetail
  }

  return (
    <PackageContext.Provider
      value={{
        plans,
        loading,
        error,
        refetch: fetchPlans,
        getPlanById,
        fetchPlanBySlug,
        fetchFeaturesBySlug,
        updatePackage,
      }}
    >
      {children}
    </PackageContext.Provider>
  )
}

export function usePackages() {
  const ctx = useContext(PackageContext)
  if (!ctx) throw new Error('usePackages must be used inside <PackageProvider>')
  return ctx
}