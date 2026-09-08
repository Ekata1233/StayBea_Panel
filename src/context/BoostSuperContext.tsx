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




/* ============================================================
   TYPES
   ============================================================ */

export type TierKey = "BOOST" | "SUPER_BOOST";

export interface BoostOption {
  id?: string;
  boost_id?: string;
  label: string;
  boostCount: number;
  timePerBoost: number;
  pricePerBoost: number;
  totalPrice: number;
  discounted_price: number;
  discount_percent: number;
  is_best_value: boolean;
  is_popular: boolean;
  is_active: boolean;
}

export interface WhyBoostWorksItem {
  icon: string;
  title: string;
  description: string;
  tag?: string;
}

export interface ComparisonRow {
  feature: string;
  boost: string;
  super: string;
}

export interface BoostVsSuperBoost {
  title: string;
  features: ComparisonRow[];
}

export interface BoostTier {
  id?: string;
  name: TierKey;
  title: string;
  description: string;
  is_active: boolean;
  boostDuration: number;
  singleBoostWalletPrice: number;
  visibilityMultiplier: number;
  options: BoostOption[];
  whyBoostWorks: WhyBoostWorksItem[];
  boostVsSuperBoost: BoostVsSuperBoost;
  /** true when this tier does not exist on the server yet */
  isNew: boolean;
}

interface BoostContextValue {
  tiers: Record<TierKey, BoostTier>;
  loading: boolean;
  saving: TierKey | null;
  error: string | null;
  dirty: Record<TierKey, boolean>;

  refresh: () => Promise<void>;
  saveTier: (name: TierKey) => Promise<boolean>;

  updateTier: (name: TierKey, patch: Partial<BoostTier>) => void;

  updateOption: (name: TierKey, index: number, patch: Partial<BoostOption>) => void;
  addOption: (name: TierKey) => void;
  removeOption: (name: TierKey, index: number) => void;
  setOptionBadge: (
    name: TierKey,
    index: number,
    badge: "is_popular" | "is_best_value"
  ) => void;

  updateWhy: (name: TierKey, index: number, patch: Partial<WhyBoostWorksItem>) => void;
  addWhy: (name: TierKey) => void;
  removeWhy: (name: TierKey, index: number) => void;

  updateComparisonTitle: (name: TierKey, title: string) => void;
  updateComparisonRow: (name: TierKey, index: number, patch: Partial<ComparisonRow>) => void;
  addComparisonRow: (name: TierKey) => void;
  removeComparisonRow: (name: TierKey, index: number) => void;
}

/* ============================================================
   HELPERS
   ============================================================ */

/** API returns Decimal columns as strings ("60", "20"). Coerce safely. */
const num = (v: unknown, fallback = 0): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

/**
 * totalPrice and discount_percent are derived, never hand-entered.
 * Source of truth = boostCount, pricePerBoost, discounted_price.
 * This stops the server data drifting (e.g. 10×18=180 vs stored 17%).
 */
const recalc = (o: BoostOption): BoostOption => {
  const totalPrice = Math.max(0, Math.round(o.boostCount * o.pricePerBoost));
  const discounted = Math.min(Math.max(0, o.discounted_price), totalPrice || 0);
  const discount_percent =
    totalPrice > 0 ? Math.round(((totalPrice - discounted) / totalPrice) * 100) : 0;
  return { ...o, totalPrice, discounted_price: discounted, discount_percent };
};

const emptyComparison = (): BoostVsSuperBoost => ({
  title: "What's the difference?",
  features: [],
});

const blankTier = (name: TierKey): BoostTier => ({
  name,
  title: name === "BOOST" ? "Boost Package" : "Super Boost Package",
  description:
    name === "BOOST"
      ? "Increase your profile visibility"
      : "Maximum visibility during peak hours",
  is_active: true,
  boostDuration: name === "BOOST" ? 30 : 180,
  singleBoostWalletPrice: name === "BOOST" ? 60 : 180,
  visibilityMultiplier: name === "BOOST" ? 5 : 10,
  options: [],
  whyBoostWorks: [],
  boostVsSuperBoost: emptyComparison(),
  isNew: true,
});

const normalizeTier = (raw: Record<string, unknown>, name: TierKey): BoostTier => {
  const rawOptions = Array.isArray(raw.options) ? raw.options : [];
  const rawWhy = Array.isArray(raw.whyBoostWorks) ? raw.whyBoostWorks : [];
  const rawCmp = (raw.boostVsSuperBoost ?? null) as Record<string, unknown> | null;

  return {
    id: str(raw.id) || undefined,
    name,
    title: str(raw.title, blankTier(name).title),
    description: str(raw.description),
    is_active: raw.is_active !== false,
    boostDuration: num(raw.boostDuration, blankTier(name).boostDuration),
    singleBoostWalletPrice: num(
      raw.singleBoostWalletPrice,
      blankTier(name).singleBoostWalletPrice
    ),
    visibilityMultiplier: num(
      raw.visibilityMultiplier,
      blankTier(name).visibilityMultiplier
    ),
    options: rawOptions.map((o: Record<string, unknown>) =>
      recalc({
        id: str(o.id) || undefined,
        boost_id: str(o.boost_id) || undefined,
        label: str(o.label, `${num(o.boostCount, 0)} Boosts`),
        boostCount: num(o.boostCount, 0),
        timePerBoost: num(o.timePerBoost, num(raw.boostDuration, 30)),
        pricePerBoost: num(o.pricePerBoost, 0),
        totalPrice: num(o.totalPrice, 0),
        discounted_price: num(o.discounted_price, num(o.totalPrice, 0)),
        discount_percent: num(o.discount_percent, 0),
        is_best_value: o.is_best_value === true,
        is_popular: o.is_popular === true,
        is_active: o.is_active !== false,
      })
    ),
    whyBoostWorks: rawWhy.map((w: Record<string, unknown>) => ({
      icon: str(w.icon, "zap"),
      title: str(w.title),
      description: str(w.description),
      tag: str(w.tag) || undefined,
    })),
    boostVsSuperBoost: rawCmp
      ? {
          title: str(rawCmp.title, "What's the difference?"),
          features: (Array.isArray(rawCmp.features) ? rawCmp.features : []).map(
            (f: Record<string, unknown>) => ({
              feature: str(f.feature),
              boost: str(f.boost),
              super: str(f.super),
            })
          ),
        }
      : emptyComparison(),
    isNew: false,
  };
};

/** Accepts "BOOST", "Boost", "super_boost", "SUPERBOOST" → canonical key. */
const canonicalName = (raw: unknown): TierKey | null => {
  const k = str(raw).trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (k === "BOOST") return "BOOST";
  if (k === "SUPER_BOOST" || k === "SUPERBOOST") return "SUPER_BOOST";
  return null;
};

const postJSON = async (path: string, body: unknown) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `${path} failed (${res.status})`);
  }
  return json;
};

/* ============================================================
   CONTEXT
   ============================================================ */

const BoostSuperContext = createContext<BoostContextValue | null>(null);

export function BoostSuperProvider({ children }: { children: React.ReactNode }) {
  const [tiers, setTiers] = useState<Record<TierKey, BoostTier>>({
    BOOST: blankTier("BOOST"),
    SUPER_BOOST: blankTier("SUPER_BOOST"),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<TierKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Record<TierKey, boolean>>({
    BOOST: false,
    SUPER_BOOST: false,
  });

  const markDirty = (name: TierKey) =>
    setDirty((d) => (d[name] ? d : { ...d, [name]: true }));

  const patchTier = useCallback(
    (name: TierKey, fn: (t: BoostTier) => BoostTier) => {
      setTiers((prev) => ({ ...prev, [name]: fn(prev[name]) }));
      markDirty(name);
    },
    []
  );

  /* ---------------- load ---------------- */

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/boost/get-all`, {
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Could not load boosts (${res.status})`);
      }

      const next: Record<TierKey, BoostTier> = {
        BOOST: blankTier("BOOST"),
        SUPER_BOOST: blankTier("SUPER_BOOST"),
      };

      const list: Record<string, unknown>[] = Array.isArray(json?.data) ? json.data : [];
      for (const row of list) {
        const key = canonicalName(row.name);
        if (!key) continue; // unrecognised name — ignore rather than render an orphan tab
        next[key] = normalizeTier(row, key);
      }

      setTiers(next);
      setDirty({ BOOST: false, SUPER_BOOST: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load boosts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /* ---------------- save ---------------- */

  const saveTier = useCallback(
    async (name: TierKey): Promise<boolean> => {
      const t = tiers[name];
      setSaving(name);
      setError(null);
      try {
        // 1. pack + options. Must run first so the record exists for 2 and 3.
        await postJSON("/api/boost/create", {
          name: t.name,
          title: t.title,
          description: t.description,
          is_active: t.is_active, // backend must accept this — not in current schema
          options: t.options.map((o) => ({
            ...(o.id ? { id: o.id } : {}), // send id so backend can upsert instead of replace
            label: o.label,
            boostCount: o.boostCount,
            timePerBoost: o.timePerBoost,
            pricePerBoost: o.pricePerBoost,
            totalPrice: o.totalPrice,
            discounted_price: o.discounted_price,
            discount_percent: o.discount_percent,
            is_best_value: o.is_best_value,
            is_popular: o.is_popular,
            is_active: o.is_active,
          })),
        });

        // 2. numeric features
        await postJSON("/api/boost/features", {
          name: t.name,
          boostDuration: t.boostDuration,
          singleBoostWalletPrice: t.singleBoostWalletPrice,
          visibilityMultiplier: t.visibilityMultiplier,
        });

        // 3. marketing info
        await postJSON("/api/boost/info", {
          name: t.name,
          whyBoostWorks: t.whyBoostWorks.map((w) => ({
            icon: w.icon,
            title: w.title,
            description: w.description,
            ...(w.tag ? { tag: w.tag } : {}),
          })),
          boostVsSuperBoost: t.boostVsSuperBoost,
        });

        await refresh();
        return true;
      } catch (e) {
        // NOTE: no transaction across the three calls. A failure here can leave
        // the record half-written. Backend needs a single upsert endpoint.
        setError(e instanceof Error ? e.message : "Save failed");
        return false;
      } finally {
        setSaving(null);
      }
    },
    [tiers, refresh]
  );

  /* ---------------- mutations ---------------- */

  const updateTier = useCallback(
    (name: TierKey, patch: Partial<BoostTier>) =>
      patchTier(name, (t) => ({ ...t, ...patch })),
    [patchTier]
  );

  const updateOption = useCallback(
    (name: TierKey, index: number, patch: Partial<BoostOption>) =>
      patchTier(name, (t) => ({
        ...t,
        options: t.options.map((o, i) => (i === index ? recalc({ ...o, ...patch }) : o)),
      })),
    [patchTier]
  );

  const addOption = useCallback(
    (name: TierKey) =>
      patchTier(name, (t) => {
        const count = (t.options.at(-1)?.boostCount ?? 0) * 2 || 5;
        return {
          ...t,
          options: [
            ...t.options,
            recalc({
              label: `${count} Boosts`,
              boostCount: count,
              timePerBoost: t.boostDuration,
              pricePerBoost: t.singleBoostWalletPrice || 0,
              totalPrice: 0,
              discounted_price: 0,
              discount_percent: 0,
              is_best_value: false,
              is_popular: false,
              is_active: true,
            }),
          ],
        };
      }),
    [patchTier]
  );

  const removeOption = useCallback(
    (name: TierKey, index: number) =>
      patchTier(name, (t) => ({
        ...t,
        options: t.options.filter((_, i) => i !== index),
      })),
    [patchTier]
  );

  /** Only one pack can carry each badge. */
  const setOptionBadge = useCallback(
    (name: TierKey, index: number, badge: "is_popular" | "is_best_value") =>
      patchTier(name, (t) => ({
        ...t,
        options: t.options.map((o, i) => ({
          ...o,
          [badge]: i === index ? !o[badge] : false,
        })),
      })),
    [patchTier]
  );

  const updateWhy = useCallback(
    (name: TierKey, index: number, patch: Partial<WhyBoostWorksItem>) =>
      patchTier(name, (t) => ({
        ...t,
        whyBoostWorks: t.whyBoostWorks.map((w, i) =>
          i === index ? { ...w, ...patch } : w
        ),
      })),
    [patchTier]
  );

  const addWhy = useCallback(
    (name: TierKey) =>
      patchTier(name, (t) => ({
        ...t,
        whyBoostWorks: [
          ...t.whyBoostWorks,
          { icon: "zap", title: "", description: "", tag: "" },
        ],
      })),
    [patchTier]
  );

  const removeWhy = useCallback(
    (name: TierKey, index: number) =>
      patchTier(name, (t) => ({
        ...t,
        whyBoostWorks: t.whyBoostWorks.filter((_, i) => i !== index),
      })),
    [patchTier]
  );

  const updateComparisonTitle = useCallback(
    (name: TierKey, title: string) =>
      patchTier(name, (t) => ({
        ...t,
        boostVsSuperBoost: { ...t.boostVsSuperBoost, title },
      })),
    [patchTier]
  );

  const updateComparisonRow = useCallback(
    (name: TierKey, index: number, patch: Partial<ComparisonRow>) =>
      patchTier(name, (t) => ({
        ...t,
        boostVsSuperBoost: {
          ...t.boostVsSuperBoost,
          features: t.boostVsSuperBoost.features.map((f, i) =>
            i === index ? { ...f, ...patch } : f
          ),
        },
      })),
    [patchTier]
  );

  const addComparisonRow = useCallback(
    (name: TierKey) =>
      patchTier(name, (t) => ({
        ...t,
        boostVsSuperBoost: {
          ...t.boostVsSuperBoost,
          features: [
            ...t.boostVsSuperBoost.features,
            { feature: "", boost: "", super: "" },
          ],
        },
      })),
    [patchTier]
  );

  const removeComparisonRow = useCallback(
    (name: TierKey, index: number) =>
      patchTier(name, (t) => ({
        ...t,
        boostVsSuperBoost: {
          ...t.boostVsSuperBoost,
          features: t.boostVsSuperBoost.features.filter((_, i) => i !== index),
        },
      })),
    [patchTier]
  );

  const value = useMemo<BoostContextValue>(
    () => ({
      tiers,
      loading,
      saving,
      error,
      dirty,
      refresh,
      saveTier,
      updateTier,
      updateOption,
      addOption,
      removeOption,
      setOptionBadge,
      updateWhy,
      addWhy,
      removeWhy,
      updateComparisonTitle,
      updateComparisonRow,
      addComparisonRow,
      removeComparisonRow,
    }),
    [
      tiers,
      loading,
      saving,
      error,
      dirty,
      refresh,
      saveTier,
      updateTier,
      updateOption,
      addOption,
      removeOption,
      setOptionBadge,
      updateWhy,
      addWhy,
      removeWhy,
      updateComparisonTitle,
      updateComparisonRow,
      addComparisonRow,
      removeComparisonRow,
    ]
  );

  return (
    <BoostSuperContext.Provider value={value}>{children}</BoostSuperContext.Provider>
  );
}

export function useBoostSuper() {
  const ctx = useContext(BoostSuperContext);
  if (!ctx) {
    throw new Error("useBoostSuper must be used inside <BoostSuperProvider>");
  }
  return ctx;
}