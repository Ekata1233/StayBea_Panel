'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'

/* ══════════════════════════════════════════════════════════════════
   Shared shape + generic CRUD provider factory (name + isActive).
   resource paths already include "/api/...", so API_BASE_URL must be
   the ORIGIN only (e.g. http://localhost:4000), NOT ".../api".
   ══════════════════════════════════════════════════════════════════ */

export interface CrudItem {
  id: number
  name: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CrudContextType {
  data: CrudItem[]
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
  createData: (payload: { name: string; isActive: boolean }) => Promise<CrudItem | null>
  updateData: (id: number, payload: { name: string; isActive: boolean }) => Promise<CrudItem | null>
  deleteData: (id: number) => Promise<void>
}

export type Profession = CrudItem
export type EmploymentType = CrudItem
export type Experience = CrudItem
export type Ambition = CrudItem
export type SalaryRange = CrudItem

function createCrudContext(resourcePath: string) {
  const Ctx = createContext<CrudContextType | undefined>(undefined)

  const Provider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<CrudItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const API_URL = `${API_BASE_URL}${resourcePath}`

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

    const createData = async (payload: { name: string; isActive: boolean }) => {
      try {
        const res = await axios.post(`${API_URL}/create`, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        const created: CrudItem = res.data.data
        setData((prev) => [...prev, created])
        return created
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    }

    const updateData = async (id: number, payload: { name: string; isActive: boolean }) => {
      try {
        const res = await axios.put(`${API_URL}/update/${id}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        const updated: CrudItem = res.data.data
        setData((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)))
        return updated
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    }

    const deleteData = async (id: number) => {
      try {
        await axios.delete(`${API_URL}/remove/${id}`)
        setData((prev) => prev.filter((p) => p.id !== id))
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    }

    useEffect(() => {
      fetchData()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <Ctx.Provider
        value={{ data, loading, error, fetchData, createData, updateData, deleteData }}
      >
        {children}
      </Ctx.Provider>
    )
  }

  const useCtx = (hookName: string) => {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error(`${hookName} must be used inside its provider`)
    return ctx
  }

  return { Provider, useCtx }
}

/* ── Profession: {API_BASE_URL}/api/profession ─────────────────────── */
const profession = createCrudContext('/api/profession')
export const ProfessionProvider = profession.Provider
export const useProfession = () => profession.useCtx('useProfession')

/* ── Employment type: {API_BASE_URL}/api/admin/employment-type ─────── */
const employmentType = createCrudContext('/api/admin/employment-type')
export const EmploymentTypeProvider = employmentType.Provider
export const useEmploymentType = () => employmentType.useCtx('useEmploymentType')

/* ══════════════════════════════════════════════════════════════════
   EXPERIENCE  —  {API_BASE_URL}/api/admin/experiences
   Backend field is `title` (not `name`) and has `sortOrder`.
   This provider adapts title <-> name and manages sortOrder, but
   exposes the SAME CrudContextType so <ApiChip>/<AddWithToggle> work
   with zero UI changes.
   ══════════════════════════════════════════════════════════════════ */

interface ExperienceApi {
  id: number
  title: string
  sortOrder: number | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

const ExperienceContext = createContext<CrudContextType | undefined>(undefined)

const toItem = (r: ExperienceApi): CrudItem => ({
  id: r.id,
  name: r.title, // title -> name for the shared UI
  isActive: r.isActive,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
})

export const ExperienceProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<CrudItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // raw rows (with sortOrder) kept in a ref so create/update can reason about order
  const rawRef = useRef<ExperienceApi[]>([])

  const API_URL = `${API_BASE_URL}/api/admin/experiences`

  const syncRaw = (rows: ExperienceApi[]) => {
    rawRef.current = rows
    setData(rows.map(toItem))
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/get-all`)
      syncRaw(res.data.data ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const nextSortOrder = () =>
    rawRef.current.reduce((m, r) => Math.max(m, r.sortOrder ?? 0), 0) + 1

  const createData = async (payload: { name: string; isActive: boolean }) => {
    try {
      const body = { title: payload.name, isActive: payload.isActive, sortOrder: nextSortOrder() }
      const res = await axios.post(`${API_URL}/create`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      const created: ExperienceApi = res.data.data
      syncRaw([...rawRef.current, created])
      return toItem(created)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateData = async (id: number, payload: { name: string; isActive: boolean }) => {
    try {
      const existing = rawRef.current.find((r) => r.id === id)
      const body = {
        title: payload.name,
        isActive: payload.isActive,
        sortOrder: existing?.sortOrder ?? nextSortOrder(), // preserve order on edit
      }
      const res = await axios.put(`${API_URL}/update/${id}`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      const updated: ExperienceApi = res.data.data
      syncRaw(rawRef.current.map((r) => (r.id === id ? updated : r)))
      return toItem(updated)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteData = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/remove/${id}`)
      syncRaw(rawRef.current.filter((r) => r.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ExperienceContext.Provider
      value={{ data, loading, error, fetchData, createData, updateData, deleteData }}
    >
      {children}
    </ExperienceContext.Provider>
  )
}

export const useExperience = () => {
  const ctx = useContext(ExperienceContext)
  if (!ctx) throw new Error('useExperience must be used inside ExperienceProvider')
  return ctx
}


/* ══════════════════════════════════════════════════════════════════
   AMBITION  —  {API_BASE_URL}/api/admin/ambitions
   Backend field is `title` (not `name`), no sortOrder. Exposes the
   shared CrudContextType so <ApiChip>/<AddWithToggle> work unchanged.
   ══════════════════════════════════════════════════════════════════ */

interface AmbitionApi {
  id: number
  title: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

const AmbitionContext = createContext<CrudContextType | undefined>(undefined)

const ambitionToItem = (r: AmbitionApi): CrudItem => ({
  id: r.id,
  name: r.title, // title -> name for the shared UI
  isActive: r.isActive,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
})

export const AmbitionProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<CrudItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = `${API_BASE_URL}/api/admin/ambitions`

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/get-all`)
      const rows: AmbitionApi[] = res.data.data ?? []
      setData(rows.map(ambitionToItem))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createData = async (payload: { name: string; isActive: boolean }) => {
    try {
      const body = { title: payload.name, isActive: payload.isActive }
      const res = await axios.post(`${API_URL}/create`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      const created: AmbitionApi = res.data.data
      const item = ambitionToItem(created)
      setData((prev) => [...prev, item])
      return item
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateData = async (id: number, payload: { name: string; isActive: boolean }) => {
    try {
      const body = { title: payload.name, isActive: payload.isActive }
      const res = await axios.put(`${API_URL}/update/${id}`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      const updated: AmbitionApi = res.data.data
      const item = ambitionToItem(updated)
      setData((prev) => prev.map((p) => (p.id === id ? item : p)))
      return item
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteData = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/remove/${id}`)
      setData((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AmbitionContext.Provider
      value={{ data, loading, error, fetchData, createData, updateData, deleteData }}
    >
      {children}
    </AmbitionContext.Provider>
  )
}

export const useAmbition = () => {
  const ctx = useContext(AmbitionContext)
  if (!ctx) throw new Error('useAmbition must be used inside AmbitionProvider')
  return ctx
}


/* ══════════════════════════════════════════════════════════════════
   SALARY RANGE  —  {API_BASE_URL}/api/admin/salary-ranges
   Backend has `title` + numeric `minSalary`/`maxSalary`. The admin UI
   only edits the label (e.g. "₹10–20 LPA"); we DERIVE min/max from it
   on write. Exposes the shared CrudContextType (name = title).

   Parsing rules:
     "₹10–20 LPA" -> min 1000000, max 2000000   (LPA = x100000)
     "₹60 LPA+"   -> min 6000000, max null       (open-ended)
     "₹20 LPA"    -> min 2000000, max 2000000    (single value)
     "Prefer not to say" -> min null, max null   (no numbers)
   Handles en-dash (–), em-dash (—), hyphen (-) and the word "to".
   NOTE: if minSalary/maxSalary are NON-NULL in your Prisma schema,
   sending null will 500 — make them nullable or default them.
   ══════════════════════════════════════════════════════════════════ */

interface SalaryRangeApi {
  id: number
  title: string
  minSalary: number | null
  maxSalary: number | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

const SalaryRangeContext = createContext<CrudContextType | undefined>(undefined)

const salaryToItem = (r: SalaryRangeApi): CrudItem => ({
  id: r.id,
  name: r.title, // title -> name for the shared UI
  isActive: r.isActive,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
})

// Extract all numbers from a label, applying LPA (x100000) / L / K / Cr scaling.
export function parseSalaryLabel(
  label: string
): { minSalary: number | null; maxSalary: number | null } {
  const text = label.trim()
  const openEnded = /\+\s*$/.test(text) || /plus/i.test(text)

  // unit multiplier from the label (default LPA when "LPA"/"L" present)
  const lower = text.toLowerCase()
  let unit = 1
  if (/\bcr\b|crore/.test(lower)) unit = 10000000
  else if (/\blpa\b|\blakh\b|\bl\b/.test(lower)) unit = 100000
  else if (/\bk\b|thousand/.test(lower)) unit = 1000

  // pull numeric tokens (supports decimals like 2.5)
  const nums = (text.match(/\d+(?:\.\d+)?/g) || []).map((n) => Math.round(parseFloat(n) * unit))

  if (nums.length === 0) return { minSalary: null, maxSalary: null }
  if (nums.length === 1) {
    return openEnded
      ? { minSalary: nums[0], maxSalary: null }
      : { minSalary: nums[0], maxSalary: nums[0] }
  }
  // 2+ numbers: first is min, second is max
  return { minSalary: nums[0], maxSalary: nums[1] }
}

export const SalaryRangeProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<CrudItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = `${API_BASE_URL}/api/admin/salary-ranges`

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/get-all`)
      const rows: SalaryRangeApi[] = res.data.data ?? []
      setData(rows.map(salaryToItem))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createData = async (payload: { name: string; isActive: boolean }) => {
    try {
      const { minSalary, maxSalary } = parseSalaryLabel(payload.name)
      const body = { title: payload.name, minSalary, maxSalary, isActive: payload.isActive }
      const res = await axios.post(`${API_URL}/create`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      const created: SalaryRangeApi = res.data.data
      const item = salaryToItem(created)
      setData((prev) => [...prev, item])
      return item
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateData = async (id: number, payload: { name: string; isActive: boolean }) => {
    try {
      const { minSalary, maxSalary } = parseSalaryLabel(payload.name)
      const body = { title: payload.name, minSalary, maxSalary, isActive: payload.isActive }
      const res = await axios.put(`${API_URL}/update/${id}`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      const updated: SalaryRangeApi = res.data.data
      const item = salaryToItem(updated)
      setData((prev) => prev.map((p) => (p.id === id ? item : p)))
      return item
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteData = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/remove/${id}`)
      setData((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SalaryRangeContext.Provider
      value={{ data, loading, error, fetchData, createData, updateData, deleteData }}
    >
      {children}
    </SalaryRangeContext.Provider>
  )
}

export const useSalaryRange = () => {
  const ctx = useContext(SalaryRangeContext)
  if (!ctx) throw new Error('useSalaryRange must be used inside SalaryRangeProvider')
  return ctx
}

/* ── Combined wrapper (co-locates providers; does NOT merge state) ── */
export const EducationCareerProvider = ({ children }: { children: ReactNode }) => (
  <ProfessionProvider>
    <EmploymentTypeProvider>
      <ExperienceProvider>
        <AmbitionProvider>
          <SalaryRangeProvider>{children}</SalaryRangeProvider>
        </AmbitionProvider>
      </ExperienceProvider>
    </EmploymentTypeProvider>
  </ProfessionProvider>
)