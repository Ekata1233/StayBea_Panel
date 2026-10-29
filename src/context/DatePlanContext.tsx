"use client";

import { API_BASE_URL } from "@/utils/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  isBestValue: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

/** price yahan nahi hai — backend planCount × pricePerPlan × discount se khud derive karta hai */
export type PackagePayload = {
  title: string;
  description: string;
  planCount: number;
  pricePerPlan: number;
  discount: number;
  isPopular: boolean;
  isBestValue: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type PackageFlag = "isPopular" | "isBestValue";

export interface DatePlanInfo {
  id?: string;
  howOnePlanWorks: InfoItem[];
  whyPeopleBuyPlans: InfoItem[];
  goodToKnow: InfoItem[];
  updatedAt?: string;
}

export interface DatePlanFeatures {
  id?: string;
  costToPostPlan: number;
  costToPostPlanActive: boolean;
  costToPostPlanPaidOnly: boolean;
  planBoostPrice: number;
  planBoostActive: boolean;
  planBoostPaidOnly: boolean;
  updatedAt?: string;
}

interface DatePlanContextValue {
  packages: DatePlanPackage[];
  info: DatePlanInfo;
  features: DatePlanFeatures;

  /** Sirf pehli load ke liye — skeleton dikhane ke liye */
  loading: boolean;
  /** Background refetch (save ke baad) — page unmount nahi hota */
  refreshing: boolean;
  /**
   * false = features server se confirm nahi hue (fetch fail / galat endpoint).
   * Is case mein Save pricing disable rakho, warna defaults (0/off) live values overwrite kar denge.
   */
  featuresLoaded: boolean;

  /** null | "features" | "info" | "new-pack" | <packageId> | "isPopular:<id>" | "isBestValue:<id>" */
  saving: string | null;
  error: string | null;
  clearError: () => void;

  /** Active packs mein effective per-plan (price / planCount) sabse sasta — Best Value label check ke liye */
  cheapestPackId: string | null;

  refresh: (opts?: { silent?: boolean }) => Promise<void>;
  saveFeatures: (payload: Omit<DatePlanFeatures, "id" | "updatedAt">) => Promise<boolean>;
  saveInfo: (payload: Omit<DatePlanInfo, "id" | "updatedAt">) => Promise<boolean>;
  updatePackage: (id: string, payload: Partial<PackagePayload>) => Promise<boolean>;
  /** Backend exclusivity enforce karta hai — ek hi Popular, ek hi Best Value */
  setPackageFlag: (id: string, flag: PackageFlag, value: boolean) => Promise<boolean>;
  /** Not wired to any button — kept for seeding if needed. */
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

const str = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;

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

const normalizePackage = (p: unknown): DatePlanPackage => {
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
    isBestValue: bool(r.isBestValue),
    isActive: bool(r.isActive, true),
    sortOrder: num(r.sortOrder),
    createdAt: str(r.createdAt),
    updatedAt: str(r.updatedAt),
  };
};

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
  const [featuresLoaded, setFeaturesLoaded] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadedOnce = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  /* ---------- Fetch (single call — /all) ---------- */
  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? loadedOnce.current;
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await request<{
        packages?: unknown[];
        info?: unknown;
        features?: unknown;
      }>("/date-plan-packages/all");

      setPackages(
        (Array.isArray(data?.packages) ? data.packages : [])
          .map(normalizePackage)
          .sort((a, b) => a.sortOrder - b.sortOrder || a.planCount - b.planCount),
      );

      const i = data?.info as Record<string, unknown> | null | undefined;
      setInfo(
        i
          ? {
              id: str(i.id),
              howOnePlanWorks: toItems(i.howOnePlanWorks),
              whyPeopleBuyPlans: toItems(i.whyPeopleBuyPlans),
              goodToKnow: toItems(i.goodToKnow),
              updatedAt: str(i.updatedAt),
            }
          : EMPTY_INFO,
      );

      // "features" key hi nahi aayi = galat endpoint / user wala response → save block karo
      const hasFeaturesKey = !!data && typeof data === "object" && "features" in data;
      const f = data?.features as Record<string, unknown> | null | undefined;
      setFeatures(
        f
          ? {
              id: str(f.id),
              costToPostPlan: num(f.costToPostPlan),
              costToPostPlanActive: bool(f.costToPostPlanActive),
              costToPostPlanPaidOnly: bool(f.costToPostPlanPaidOnly),
              planBoostPrice: num(f.planBoostPrice),
              planBoostActive: bool(f.planBoostActive),
              planBoostPaidOnly: bool(f.planBoostPaidOnly),
              updatedAt: str(f.updatedAt),
            }
          : EMPTY_FEATURES,
      );
      setFeaturesLoaded(hasFeaturesKey);

      loadedOnce.current = true;
    } catch (e) {
      // Silent refetch fail ho to purana data rehne do, sirf error dikhao
      if (!silent) setFeaturesLoaded(false);
      setError(e instanceof Error ? e.message : "Failed to load date plan settings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh({ silent: false });
  }, [refresh]);

  /* ---------- Mutation helper ---------- */

  const mutate = useCallback(
    async (key: string, fn: () => Promise<unknown>, fallbackMsg: string) => {
      setSaving(key);
      setError(null);
      try {
        await fn();
        // Server pe doosre records bhi badal sakte hain (flag exclusivity, hide → flags clear)
        await refresh({ silent: true });
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : fallbackMsg);
        return false;
      } finally {
        setSaving(null);
      }
    },
    [refresh],
  );

  /* ---------- Mutations ---------- */

  const saveFeatures = useCallback(
    async (payload: Omit<DatePlanFeatures, "id" | "updatedAt">) => {
      if (!featuresLoaded) {
        setError("Pricing server se load nahi hui — overwrite se bachne ke liye save block hai. Page refresh karo.");
        return false;
      }
      return mutate(
        "features",
        () =>
          request("/date-plan-package-features", {
            method: "POST",
            body: JSON.stringify(payload),
          }),
        "Failed to save pricing",
      );
    },
    [featuresLoaded, mutate],
  );

  const saveInfo = useCallback(
    (payload: Omit<DatePlanInfo, "id" | "updatedAt">) =>
      mutate(
        "info",
        () =>
          request("/date-plan-package-info", {
            method: "POST",
            body: JSON.stringify(payload),
          }),
        "Failed to save content",
      ),
    [mutate],
  );

  const updatePackage = useCallback(
    (id: string, payload: Partial<PackagePayload>) =>
      mutate(
        id,
        () =>
          request(`/date-plan-packages/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          }),
        "Failed to update pack",
      ),
    [mutate],
  );

  const setPackageFlag = useCallback(
    (id: string, flag: PackageFlag, value: boolean) =>
      mutate(
        `${flag}:${id}`,
        () =>
          request(`/date-plan-packages/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ [flag]: value }),
          }),
        flag === "isPopular" ? "Failed to update Popular" : "Failed to update Best Value",
      ),
    [mutate],
  );

  const createPackage = useCallback(
    (payload: PackagePayload) =>
      mutate(
        "new-pack",
        () =>
          request("/date-plan-packages", {
            method: "POST",
            body: JSON.stringify(payload),
          }),
        "Failed to create pack",
      ),
    [mutate],
  );

  /* ---------- Derived ---------- */

  const cheapestPackId = useMemo(() => {
    const active = packages.filter((p) => p.isActive && p.planCount > 0 && p.price > 0);
    if (active.length < 2) return null;
    return active.reduce((min, p) =>
      p.price / p.planCount < min.price / min.planCount ? p : min,
    ).id;
  }, [packages]);

  const value = useMemo<DatePlanContextValue>(
    () => ({
      packages,
      info,
      features,
      loading,
      refreshing,
      featuresLoaded,
      saving,
      error,
      clearError,
      cheapestPackId,
      refresh,
      saveFeatures,
      saveInfo,
      updatePackage,
      setPackageFlag,
      createPackage,
    }),
    [
      packages,
      info,
      features,
      loading,
      refreshing,
      featuresLoaded,
      saving,
      error,
      clearError,
      cheapestPackId,
      refresh,
      saveFeatures,
      saveInfo,
      updatePackage,
      setPackageFlag,
      createPackage,
    ],
  );

  return <DatePlanContext.Provider value={value}>{children}</DatePlanContext.Provider>;
}

export function useDatePlan() {
  const ctx = useContext(DatePlanContext);
  if (!ctx) throw new Error("useDatePlan must be used inside <DatePlanProvider>");
  return ctx;
}