"use client";

import { API_BASE_URL } from "@/utils/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* ================= Config ================= */

const BASE = `${API_BASE_URL}/api/admin/date-now`;

/* ================= Types ================= */

export interface InfoItem {
  title: string;
  description: string;
}

export interface DatePlanPackage {
  id: string;
  title: string;
  description: string;
  planCount: number;
  price: number;
  pricePerPlan: number;
  discount: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export type PackagePayload = {
  title: string;
  description: string;
  planCount: number;
  price: number;
  pricePerPlan: number;
  discount: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
};

export interface DatePlanInfo {
  id?: string;
  howOnePlanWorks: InfoItem[];
  whyPeopleBuyPlans: InfoItem[];
  goodToKnow: InfoItem[];
}

export interface DatePlanFeatures {
  id?: string;
  costToPostPlan: number;
  costToPostPlanActive: boolean;
  costToPostPlanPaidOnly: boolean;
  planBoostPrice: number;
  planBoostActive: boolean;
  planBoostPaidOnly: boolean;
}

interface DatePlanContextValue {
  packages: DatePlanPackage[];
  info: DatePlanInfo;
  features: DatePlanFeatures;

  loading: boolean;
  /** null | "features" | "info" | "new-pack" | "popular" | <packageId> */
  saving: string | null;
  error: string | null;
  clearError: () => void;

  bestValueId: string | null;

  refresh: () => Promise<void>;
  saveFeatures: (payload: Omit<DatePlanFeatures, "id">) => Promise<boolean>;
  saveInfo: (payload: Omit<DatePlanInfo, "id">) => Promise<boolean>;
  updatePackage: (id: string, payload: Partial<PackagePayload>) => Promise<boolean>;
  /** Sets one pack popular and clears the rest. */
  setPopularPackage: (id: string) => Promise<boolean>;
  /** Not wired to any button — kept for seeding from console if needed. */
  createPackage: (payload: PackagePayload) => Promise<boolean>;
}

/* ================= Helpers ================= */

/** Prisma Decimal JSON me string aata hai — always coerce. */
const num = (v: unknown, fb = 0): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : fb;
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fb;
};

const bool = (v: unknown, fb = false): boolean =>
  typeof v === "boolean" ? v : fb;

const toItems = (v: unknown): InfoItem[] =>
  Array.isArray(v)
    ? v.map((r) => ({
        title: String((r as InfoItem)?.title ?? ""),
        description: String((r as InfoItem)?.description ?? ""),
      }))
    : [];

const authHeaders = (): Record<string, string> => {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const t = localStorage.getItem("adminToken") ?? localStorage.getItem("token");
    if (t) h.Authorization = `Bearer ${t}`;
  }
  return h;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
    cache: "no-store",
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  const body = json as
    | { success?: boolean; data?: T; message?: string; error?: string }
    | null;

  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || body?.error || `Request failed (${res.status})`);
  }
  return (body?.data ?? (body as unknown)) as T;
}

/* ================= Defaults ================= */

const EMPTY_INFO: DatePlanInfo = {
  howOnePlanWorks: [],
  whyPeopleBuyPlans: [],
  goodToKnow: [],
};

const EMPTY_FEATURES: DatePlanFeatures = {
  costToPostPlan: 0,
  costToPostPlanActive: false,
  costToPostPlanPaidOnly: false,
  planBoostPrice: 0,
  planBoostActive: false,
  planBoostPaidOnly: false,
};

/* ================= Context ================= */

const DatePlanContext = createContext<DatePlanContextValue | undefined>(undefined);

export function DatePlanProvider({ children }: { children: React.ReactNode }) {
  const [packages, setPackages] = useState<DatePlanPackage[]>([]);
  const [info, setInfo] = useState<DatePlanInfo>(EMPTY_INFO);
  const [features, setFeatures] = useState<DatePlanFeatures>(EMPTY_FEATURES);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /* ---------- Fetch (single call — /all) ---------- */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request<{
        packages?: unknown[];
        info?: unknown;
        features?: unknown;
      }>("/date-plan-packages/all");

      const rawPacks = Array.isArray(data?.packages) ? data.packages : [];
      setPackages(
        rawPacks
          .map((p) => {
            const r = p as Record<string, unknown>;
            return {
              id: String(r.id),
              title: String(r.title ?? ""),
              description: String(r.description ?? ""),
              planCount: num(r.planCount),
              price: num(r.price),
              pricePerPlan: num(r.pricePerPlan),
              discount: num(r.discount),
              isPopular: bool(r.isPopular),
              isActive: bool(r.isActive, true),
              sortOrder: num(r.sortOrder),
              createdAt: r.createdAt as string | undefined,
              updatedAt: r.updatedAt as string | undefined,
            } satisfies DatePlanPackage;
          })
          .sort((a, b) => a.sortOrder - b.sortOrder || a.planCount - b.planCount)
      );

      const i = data?.info as Record<string, unknown> | null;
      setInfo(
        i
          ? {
              id: i.id as string | undefined,
              howOnePlanWorks: toItems(i.howOnePlanWorks),
              whyPeopleBuyPlans: toItems(i.whyPeopleBuyPlans),
              goodToKnow: toItems(i.goodToKnow),
            }
          : EMPTY_INFO
      );

      const f = data?.features as Record<string, unknown> | null;
      setFeatures(
        f
          ? {
              id: f.id as string | undefined,
              costToPostPlan: num(f.costToPostPlan),
              costToPostPlanActive: bool(f.costToPostPlanActive),
              costToPostPlanPaidOnly: bool(f.costToPostPlanPaidOnly),
              planBoostPrice: num(f.planBoostPrice),
              planBoostActive: bool(f.planBoostActive),
              planBoostPaidOnly: bool(f.planBoostPaidOnly),
            }
          : EMPTY_FEATURES
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load date plan settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /* ---------- Mutations ---------- */

  const saveFeatures = useCallback(
    async (payload: Omit<DatePlanFeatures, "id">) => {
      setSaving("features");
      setError(null);
      try {
        // NOTE: backend POST must be an UPSERT (singleton row).
        await request("/date-plan-package-features", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save pricing");
        return false;
      } finally {
        setSaving(null);
      }
    },
    [refresh]
  );

  const saveInfo = useCallback(
    async (payload: Omit<DatePlanInfo, "id">) => {
      setSaving("info");
      setError(null);
      try {
        // NOTE: backend POST must be an UPSERT (singleton row).
        await request("/date-plan-package-info", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save content");
        return false;
      } finally {
        setSaving(null);
      }
    },
    [refresh]
  );

  const updatePackage = useCallback(
    async (id: string, payload: Partial<PackagePayload>) => {
      setSaving(id);
      setError(null);
      try {
        await request(`/date-plan-packages/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update pack");
        return false;
      } finally {
        setSaving(null);
      }
    },
    [refresh]
  );

  const setPopularPackage = useCallback(
    async (id: string) => {
      setSaving("popular");
      setError(null);
      try {
        const others = packages.filter((p) => p.id !== id && p.isPopular);
        await Promise.all([
          request(`/date-plan-packages/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ isPopular: true }),
          }),
          ...others.map((p) =>
            request(`/date-plan-packages/${p.id}`, {
              method: "PATCH",
              body: JSON.stringify({ isPopular: false }),
            })
          ),
        ]);
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to set popular pack");
        return false;
      } finally {
        setSaving(null);
      }
    },
    [packages, refresh]
  );

  const createPackage = useCallback(
    async (payload: PackagePayload) => {
      setSaving("new-pack");
      setError(null);
      try {
        await request("/date-plan-packages", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create pack");
        return false;
      } finally {
        setSaving(null);
      }
    },
    [refresh]
  );

  /* ---------- Derived ---------- */

  const bestValueId = useMemo(() => {
    const active = packages.filter((p) => p.isActive && p.pricePerPlan > 0);
    if (active.length < 2) return null;
    return active.reduce((min, p) => (p.pricePerPlan < min.pricePerPlan ? p : min)).id;
  }, [packages]);

  const value = useMemo<DatePlanContextValue>(
    () => ({
      packages,
      info,
      features,
      loading,
      saving,
      error,
      clearError,
      bestValueId,
      refresh,
      saveFeatures,
      saveInfo,
      updatePackage,
      setPopularPackage,
      createPackage,
    }),
    [
      packages,
      info,
      features,
      loading,
      saving,
      error,
      clearError,
      bestValueId,
      refresh,
      saveFeatures,
      saveInfo,
      updatePackage,
      setPopularPackage,
      createPackage,
    ]
  );

  return <DatePlanContext.Provider value={value}>{children}</DatePlanContext.Provider>;
}

export function useDatePlan() {
  const ctx = useContext(DatePlanContext);
  if (!ctx) throw new Error("useDatePlan must be used inside <DatePlanProvider>");
  return ctx;
}