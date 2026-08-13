"use client";

import { API_BASE_URL } from "@/utils/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/* ================= API CONFIG ================= */


const ENDPOINTS = {
  // Purchase store
  allData: (itemType: ItemType) =>
    `${API_BASE_URL}/api/admin/purchase-store/all-data/${itemType}`,
  features: `${API_BASE_URL}/api/admin/purchase-store/features`,
  packs: `${API_BASE_URL}/api/admin/purchase-store/packs`,
  packById: (id: string) =>
    `${API_BASE_URL}/api/admin/purchase-store/packs/${id}`,
  info: `${API_BASE_URL}/api/admin/purchase-store/info`,
  infoById: (id: string) =>
    `${API_BASE_URL}/api/admin/purchase-store/info/${id}`,
  // Compliment library — categories
  complimentCategoryCreate: `${API_BASE_URL}/api/admin/compliment-category/create`,
  complimentCategoryGet: `${API_BASE_URL}/api/admin/compliment-category/get`,
  complimentCategoryUpdate: (id: string) =>
    `${API_BASE_URL}/api/admin/compliment-category/update/${id}`,
  complimentCategoryDelete: (id: string) =>
    `${API_BASE_URL}/api/admin/compliment-category/delete/${id}`,
  // Compliment library — ideas (templates)
  complimentIdeaCreate: `${API_BASE_URL}/api/admin/compliment-idea/create`,
  complimentIdeaGet: `${API_BASE_URL}/api/admin/compliment-idea/get`,
  complimentIdeaUpdate: (id: string) =>
    `${API_BASE_URL}/api/admin/compliment-idea/update/${id}`,
  complimentIdeaDelete: (id: string) =>
    `${API_BASE_URL}/api/admin/compliment-idea/delete/${id}`,
};

/* Feature keys — must match backend StoreFeatureType enum */
export const FEATURE_KEYS = {
  // Roses
  ROSE_SEND_COST: "ROSE_SEND_COST",
  WHO_LIKED_YOU_REVEAL_COST: "WHO_LIKED_YOU_REVEAL_COST",
  // Compliments
  COMPLIMENT_SEND_COST: "COMPLIMENT_SEND_COST",
} as const;

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") || localStorage.getItem("token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ================= TYPES ================= */

export type ItemType = "ROSE" | "COMPLIMENT";

export interface StoreFeature {
  id?: string;
  itemType: ItemType;
  feature: string;
  title: string;
  description: string;
  intValue: number;
  unit: string;
  enabled: boolean;
  premiumFree: boolean;
}

export interface StorePack {
  id?: string;
  itemType: ItemType;
  title: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  badge: "POPULAR" | "BEST_VALUE" | null;
  sortOrder: number;
  isActive: boolean;
}

/* Info — "why roses / compliments work" benefit cards */
export interface StoreInfo {
  id?: string;
  itemType: ItemType;
  title: string;
  description: string;
  tag: string;
  sortOrder: number;
  isActive: boolean;
}

export type FeatureMap = Record<string, StoreFeature>;

/* ----- Compliment library types ----- */

export interface ComplimentIdea {
  id: string;
  categoryId: string;
  text: string;
  sortOrder: number;
}

export interface ComplimentCategory {
  id: string;
  name: string;
  sortOrder: number;
  templates: ComplimentIdea[];
}

/* ================= HELPERS ================= */

function parsePack(raw: any): StorePack {
  return {
    id: raw.id,
    itemType: raw.itemType,
    title: raw.title,
    quantity: Number(raw.quantity),
    pricePerUnit: Number(raw.pricePerUnit), // API returns strings ("30")
    totalPrice: Number(raw.totalPrice),
    badge: raw.badge ?? null,
    sortOrder: Number(raw.sortOrder ?? 0),
    isActive: Boolean(raw.isActive),
  };
}

function parseInfo(raw: any): StoreInfo {
  return {
    id: raw.id,
    itemType: raw.itemType,
    title: raw.title ?? "",
    description: raw.description ?? "",
    tag: raw.tag ?? "",
    sortOrder: Number(raw.sortOrder ?? 0),
    isActive: Boolean(raw.isActive),
  };
}

function buildFeatureMap(apiFeatures: any[], itemType: ItemType): FeatureMap {
  const map: FeatureMap = {};
  // Purely backend-driven — only features returned by the API
  (apiFeatures ?? []).forEach((f: any) => {
    map[f.feature] = {
      id: f.id,
      itemType: f.itemType,
      feature: f.feature,
      title: f.title,
      description: f.description,
      intValue: Number(f.intValue ?? 0),
      unit: f.unit ?? "coins",
      enabled: Boolean(f.enabled),
      premiumFree: Boolean(f.premiumFree),
    };
  });
  return map;
}

/* Fallback when a feature key is missing from the backend —
   empty shell so the UI never crashes. Call sites unchanged. */
function getDefaultFeature(key: string): StoreFeature {
  return {
    itemType: key.startsWith("COMPLIMENT") ? "COMPLIMENT" : "ROSE",
    feature: key,
    title: "",
    description: "",
    intValue: 0,
    unit: "coins",
    enabled: false,
    premiumFree: false,
  };
}

/* ================= CONTEXT ================= */

interface PricingControllerContextType {
  /* ----- Purchase store ----- */
  roseFeatures: FeatureMap;
  compFeatures: FeatureMap;
  rosePacks: StorePack[];
  compPacks: StorePack[];
  roseInfo: StoreInfo[];
  compInfo: StoreInfo[];
  loading: boolean;
  saving: boolean;
  infoBusy: boolean;
  error: string | null;
  getRoseFeature: (key: string) => StoreFeature;
  getCompFeature: (key: string) => StoreFeature;
  fetchStore: () => Promise<void>;
  /* Local-only mutators (no API call) */
  updateRoseFeature: (key: string, patch: Partial<StoreFeature>) => void;
  updateCompFeature: (key: string, patch: Partial<StoreFeature>) => void;
  updateRosePackPrice: (index: number, pricePerUnit: number) => void;
  updateCompPackPrice: (index: number, pricePerUnit: number) => void;
  /* Immediate per-item saves */
  saveFeature: (feature: StoreFeature) => Promise<boolean>;
  savePack: (pack: StorePack) => Promise<boolean>;
  deleteStorePack: (id: string, itemType: ItemType) => Promise<boolean>;
  /* Info CRUD — immediate API calls */
  createStoreInfo: (info: Omit<StoreInfo, "id">) => Promise<boolean>;
  updateStoreInfo: (id: string, patch: Partial<StoreInfo>) => Promise<boolean>;
  deleteStoreInfo: (id: string) => Promise<boolean>;

  /* ----- Compliment library ----- */
  complimentCategories: ComplimentCategory[];
  libLoading: boolean;
  libBusy: boolean;
  libError: string | null;
  fetchComplimentLibrary: () => Promise<void>;
  createComplimentCategory: (name: string) => Promise<string | null>;
  renameComplimentCategory: (id: string, name: string) => Promise<boolean>;
  deleteComplimentCategory: (id: string) => Promise<boolean>;
  createComplimentIdea: (categoryId: string, text: string) => Promise<boolean>;
  deleteComplimentIdea: (id: string) => Promise<boolean>;
}

const PricingControllerContext =
  createContext<PricingControllerContextType | null>(null);

export function PricingControllerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /* =========================================================
     PURCHASE STORE
     ========================================================= */

  const [roseFeatures, setRoseFeatures] = useState<FeatureMap>(() =>
    buildFeatureMap([], "ROSE"),
  );
  const [compFeatures, setCompFeatures] = useState<FeatureMap>(() =>
    buildFeatureMap([], "COMPLIMENT"),
  );
  const [rosePacks, setRosePacks] = useState<StorePack[]>([]);
  const [compPacks, setCompPacks] = useState<StorePack[]>([]);
  const [roseInfo, setRoseInfo] = useState<StoreInfo[]>([]);
  const [compInfo, setCompInfo] = useState<StoreInfo[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [infoBusy, setInfoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roseRes, compRes] = await Promise.all([
        fetch(ENDPOINTS.allData("ROSE"), {
          headers: authHeaders(),
          cache: "no-store",
        }),
        fetch(ENDPOINTS.allData("COMPLIMENT"), {
          headers: authHeaders(),
          cache: "no-store",
        }),
      ]);

      if (!roseRes.ok || !compRes.ok) {
        throw new Error("Failed to fetch purchase store");
      }

      const roseJson = await roseRes.json();
      const compJson = await compRes.json();

      const roseData = roseJson?.data ?? {};
      const compData = compJson?.data ?? {};

      setRoseFeatures(buildFeatureMap(roseData.features ?? [], "ROSE"));
      setCompFeatures(buildFeatureMap(compData.features ?? [], "COMPLIMENT"));

      setRosePacks(
        (roseData.packs ?? [])
          .map(parsePack)
          .sort((a: StorePack, b: StorePack) => a.sortOrder - b.sortOrder),
      );
      setCompPacks(
        (compData.packs ?? [])
          .map(parsePack)
          .sort((a: StorePack, b: StorePack) => a.sortOrder - b.sortOrder),
      );

      setRoseInfo(
        (roseData.info ?? [])
          .map(parseInfo)
          .sort((a: StoreInfo, b: StoreInfo) => a.sortOrder - b.sortOrder),
      );
      setCompInfo(
        (compData.info ?? [])
          .map(parseInfo)
          .sort((a: StoreInfo, b: StoreInfo) => a.sortOrder - b.sortOrder),
      );
    } catch (e) {
      console.error("fetchStore error:", e);
      setError("Failed to load store data. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  /* Refreshes ONLY the info lists — does not touch feature/pack state */
  const refreshInfoOnly = useCallback(async () => {
    try {
      const [roseRes, compRes] = await Promise.all([
        fetch(ENDPOINTS.allData("ROSE"), {
          headers: authHeaders(),
          cache: "no-store",
        }),
        fetch(ENDPOINTS.allData("COMPLIMENT"), {
          headers: authHeaders(),
          cache: "no-store",
        }),
      ]);
      if (!roseRes.ok || !compRes.ok) return;
      const roseJson = await roseRes.json();
      const compJson = await compRes.json();
      setRoseInfo(
        (roseJson?.data?.info ?? [])
          .map(parseInfo)
          .sort((a: StoreInfo, b: StoreInfo) => a.sortOrder - b.sortOrder),
      );
      setCompInfo(
        (compJson?.data?.info ?? [])
          .map(parseInfo)
          .sort((a: StoreInfo, b: StoreInfo) => a.sortOrder - b.sortOrder),
      );
    } catch (e) {
      console.error("refreshInfoOnly error:", e);
    }
  }, []);

  /* ---------- Local-only mutators (input typing) ---------- */

  const updateRoseFeature = useCallback(
    (key: string, patch: Partial<StoreFeature>) => {
      setRoseFeatures((prev) => ({
        ...prev,
        [key]: { ...(prev[key] ?? getDefaultFeature(key)), ...patch },
      }));
    },
    [],
  );

  const updateCompFeature = useCallback(
    (key: string, patch: Partial<StoreFeature>) => {
      setCompFeatures((prev) => ({
        ...prev,
        [key]: { ...(prev[key] ?? getDefaultFeature(key)), ...patch },
      }));
    },
    [],
  );

  const updateRosePackPrice = useCallback(
    (index: number, pricePerUnit: number) => {
      setRosePacks((prev) =>
        prev.map((p, i) =>
          i === index
            ? { ...p, pricePerUnit, totalPrice: p.quantity * pricePerUnit }
            : p,
        ),
      );
    },
    [],
  );

  const updateCompPackPrice = useCallback(
    (index: number, pricePerUnit: number) => {
      setCompPacks((prev) =>
        prev.map((p, i) =>
          i === index
            ? { ...p, pricePerUnit, totalPrice: p.quantity * pricePerUnit }
            : p,
        ),
      );
    },
    [],
  );

  /* ---------- Immediate per-item saves ---------- */

  /* Save one feature — POST /features (backend upserts by itemType+feature).
     Updates local state with the saved value on success. */
  const saveFeature = useCallback(
    async (feature: StoreFeature): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(ENDPOINTS.features, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            itemType: feature.itemType,
            feature: feature.feature,
            title: feature.title,
            description: feature.description,
            intValue: feature.intValue,
            unit: feature.unit,
            enabled: feature.enabled,
            premiumFree: feature.premiumFree,
          }),
        });
        if (!res.ok) throw new Error("Save feature failed");
        const setter =
          feature.itemType === "ROSE" ? setRoseFeatures : setCompFeatures;
        setter((prev) => ({ ...prev, [feature.feature]: { ...feature } }));
        return true;
      } catch (e) {
        console.error("saveFeature error:", e);
        setError("Failed to save feature. Please try again.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  /* Save one pack — PATCH /packs/:id for existing, POST /packs for new.
     Updates local list (sorted by sortOrder) on success. */
  const savePack = useCallback(async (pack: StorePack): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const body = JSON.stringify({
        itemType: pack.itemType,
        title: pack.title,
        quantity: pack.quantity,
        pricePerUnit: pack.pricePerUnit,
        totalPrice: pack.quantity * pack.pricePerUnit,
        badge: pack.badge,
        sortOrder: pack.sortOrder,
        isActive: pack.isActive,
      });
      const res = pack.id
        ? await fetch(ENDPOINTS.packById(pack.id), {
            method: "PATCH",
            headers: authHeaders(),
            body,
          })
        : await fetch(ENDPOINTS.packs, {
            method: "POST",
            headers: authHeaders(),
            body,
          });
      if (!res.ok) throw new Error("Save pack failed");

      const saved: StorePack = {
        ...pack,
        totalPrice: pack.quantity * pack.pricePerUnit,
      };
      const setter = pack.itemType === "ROSE" ? setRosePacks : setCompPacks;
      setter((prev) =>
        prev
          .map((p) => (p.id === pack.id ? saved : p))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      return true;
    } catch (e) {
      console.error("savePack error:", e);
      setError("Failed to update pack. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  /* Pack delete — DELETE /packs/:id, then remove locally */
  const deleteStorePack = useCallback(
    async (id: string, itemType: ItemType): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(ENDPOINTS.packById(id), {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Delete pack failed");
        if (itemType === "ROSE") {
          setRosePacks((prev) => prev.filter((p) => p.id !== id));
        } else {
          setCompPacks((prev) => prev.filter((p) => p.id !== id));
        }
        return true;
      } catch (e) {
        console.error("deleteStorePack error:", e);
        setError("Failed to delete pack. Please try again.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const getRoseFeature = useCallback(
    (key: string): StoreFeature => roseFeatures[key] ?? getDefaultFeature(key),
    [roseFeatures],
  );

  const getCompFeature = useCallback(
    (key: string): StoreFeature => compFeatures[key] ?? getDefaultFeature(key),
    [compFeatures],
  );

  /* =========================================================
     STORE INFO ("why roses / compliments work") — CRUD
     ========================================================= */

  const createStoreInfo = useCallback(
    async (info: Omit<StoreInfo, "id">): Promise<boolean> => {
      setInfoBusy(true);
      setError(null);
      try {
        const res = await fetch(ENDPOINTS.info, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            itemType: info.itemType,
            title: info.title,
            description: info.description,
            tag: info.tag,
            sortOrder: info.sortOrder,
          }),
        });
        if (!res.ok) throw new Error("Create info failed");
        await refreshInfoOnly();
        return true;
      } catch (e) {
        console.error("createStoreInfo error:", e);
        setError("Failed to create info. Please try again.");
        return false;
      } finally {
        setInfoBusy(false);
      }
    },
    [refreshInfoOnly],
  );

  const updateStoreInfo = useCallback(
    async (id: string, patch: Partial<StoreInfo>): Promise<boolean> => {
      setInfoBusy(true);
      setError(null);
      try {
        const res = await fetch(ENDPOINTS.infoById(id), {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Update info failed");
        await refreshInfoOnly();
        return true;
      } catch (e) {
        console.error("updateStoreInfo error:", e);
        setError("Failed to update info. Please try again.");
        return false;
      } finally {
        setInfoBusy(false);
      }
    },
    [refreshInfoOnly],
  );

  const deleteStoreInfo = useCallback(
    async (id: string): Promise<boolean> => {
      setInfoBusy(true);
      setError(null);
      try {
        const res = await fetch(ENDPOINTS.infoById(id), {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Delete info failed");
        await refreshInfoOnly();
        return true;
      } catch (e) {
        console.error("deleteStoreInfo error:", e);
        setError("Failed to delete info. Please try again.");
        return false;
      } finally {
        setInfoBusy(false);
      }
    },
    [refreshInfoOnly],
  );

  /* =========================================================
     COMPLIMENT LIBRARY (categories + ideas)
     ========================================================= */

  const [complimentCategories, setComplimentCategories] = useState<
    ComplimentCategory[]
  >([]);
  const [libLoading, setLibLoading] = useState(true);
  const [libBusy, setLibBusy] = useState(false);
  const [libError, setLibError] = useState<string | null>(null);

  const fetchComplimentLibrary = useCallback(async () => {
    setLibLoading(true);
    setLibError(null);
    try {
      const [catRes, ideaRes] = await Promise.all([
        fetch(ENDPOINTS.complimentCategoryGet, {
          headers: authHeaders(),
          cache: "no-store",
        }),
        fetch(ENDPOINTS.complimentIdeaGet, {
          headers: authHeaders(),
          cache: "no-store",
        }),
      ]);

      if (!catRes.ok || !ideaRes.ok) {
        throw new Error("Failed to fetch compliment library");
      }

      const catJson = await catRes.json();
      const ideaJson = await ideaRes.json();

      const rawCategories: any[] = catJson?.data ?? [];
      const rawIdeas: any[] = ideaJson?.data ?? [];

      // Group ideas by categoryId
      const ideasByCategory: Record<string, ComplimentIdea[]> = {};
      rawIdeas.forEach((idea) => {
        const item: ComplimentIdea = {
          id: idea.id,
          categoryId: idea.categoryId,
          text: idea.text,
          sortOrder: Number(idea.sortOrder ?? 0),
        };
        (ideasByCategory[item.categoryId] ??= []).push(item);
      });
      Object.values(ideasByCategory).forEach((list) =>
        list.sort((a, b) => a.sortOrder - b.sortOrder),
      );

      const merged: ComplimentCategory[] = rawCategories
        .map((c) => ({
          id: c.id,
          name: c.name,
          sortOrder: Number(c.sortOrder ?? 0),
          templates: ideasByCategory[c.id] ?? [],
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);

      setComplimentCategories(merged);
    } catch (e) {
      console.error("fetchComplimentLibrary error:", e);
      setLibError("Failed to load template library. Please refresh and try again.");
    } finally {
      setLibLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplimentLibrary();
  }, [fetchComplimentLibrary]);

  /* ----- Category actions ----- */

  const createComplimentCategory = useCallback(
    async (name: string): Promise<string | null> => {
      setLibBusy(true);
      setLibError(null);
      try {
        const sortOrder =
          complimentCategories.reduce(
            (max, c) => Math.max(max, c.sortOrder),
            0,
          ) + 1;
        const res = await fetch(ENDPOINTS.complimentCategoryCreate, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ name, sortOrder }),
        });
        if (!res.ok) throw new Error("Create category failed");
        const json = await res.json().catch(() => null);
        const newId: string | null = json?.data?.id ?? null;
        await fetchComplimentLibrary();
        return newId;
      } catch (e) {
        console.error("createComplimentCategory error:", e);
        setLibError("Failed to create category. Please try again.");
        return null;
      } finally {
        setLibBusy(false);
      }
    },
    [complimentCategories, fetchComplimentLibrary],
  );

  const renameComplimentCategory = useCallback(
    async (id: string, name: string): Promise<boolean> => {
      setLibBusy(true);
      setLibError(null);
      try {
        const existing = complimentCategories.find((c) => c.id === id);
        const res = await fetch(ENDPOINTS.complimentCategoryUpdate(id), {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            name,
            sortOrder: existing?.sortOrder ?? 0,
          }),
        });
        if (!res.ok) throw new Error("Rename category failed");
        await fetchComplimentLibrary();
        return true;
      } catch (e) {
        console.error("renameComplimentCategory error:", e);
        setLibError("Failed to rename category. Please try again.");
        return false;
      } finally {
        setLibBusy(false);
      }
    },
    [complimentCategories, fetchComplimentLibrary],
  );

  const deleteComplimentCategory = useCallback(
    async (id: string): Promise<boolean> => {
      setLibBusy(true);
      setLibError(null);
      try {
        // Delete the category's ideas first (in case backend doesn't cascade)
        const category = complimentCategories.find((c) => c.id === id);
        if (category) {
          await Promise.all(
            category.templates.map((t) =>
              fetch(ENDPOINTS.complimentIdeaDelete(t.id), {
                method: "DELETE",
                headers: authHeaders(),
              }),
            ),
          );
        }
        const res = await fetch(ENDPOINTS.complimentCategoryDelete(id), {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Delete category failed");
        await fetchComplimentLibrary();
        return true;
      } catch (e) {
        console.error("deleteComplimentCategory error:", e);
        setLibError("Failed to delete category. Please try again.");
        await fetchComplimentLibrary();
        return false;
      } finally {
        setLibBusy(false);
      }
    },
    [complimentCategories, fetchComplimentLibrary],
  );

  /* ----- Idea (template) actions ----- */

  const createComplimentIdea = useCallback(
    async (categoryId: string, text: string): Promise<boolean> => {
      setLibBusy(true);
      setLibError(null);
      try {
        const category = complimentCategories.find((c) => c.id === categoryId);
        const sortOrder =
          (category?.templates.reduce(
            (max, t) => Math.max(max, t.sortOrder),
            0,
          ) ?? 0) + 1;
        const res = await fetch(ENDPOINTS.complimentIdeaCreate, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ categoryId, text, sortOrder }),
        });
        if (!res.ok) throw new Error("Create idea failed");
        await fetchComplimentLibrary();
        return true;
      } catch (e) {
        console.error("createComplimentIdea error:", e);
        setLibError("Failed to add template. Please try again.");
        return false;
      } finally {
        setLibBusy(false);
      }
    },
    [complimentCategories, fetchComplimentLibrary],
  );

  const deleteComplimentIdea = useCallback(
    async (id: string): Promise<boolean> => {
      setLibBusy(true);
      setLibError(null);
      try {
        const res = await fetch(ENDPOINTS.complimentIdeaDelete(id), {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Delete idea failed");
        await fetchComplimentLibrary();
        return true;
      } catch (e) {
        console.error("deleteComplimentIdea error:", e);
        setLibError("Failed to delete template. Please try again.");
        return false;
      } finally {
        setLibBusy(false);
      }
    },
    [fetchComplimentLibrary],
  );

  /* ================= PROVIDER ================= */

  return (
    <PricingControllerContext.Provider
      value={{
        // Purchase store
        roseFeatures,
        compFeatures,
        rosePacks,
        compPacks,
        roseInfo,
        compInfo,
        loading,
        saving,
        infoBusy,
        error,
        getRoseFeature,
        getCompFeature,
        fetchStore,
        updateRoseFeature,
        updateCompFeature,
        updateRosePackPrice,
        updateCompPackPrice,
        saveFeature,
        savePack,
        deleteStorePack,
        createStoreInfo,
        updateStoreInfo,
        deleteStoreInfo,
        // Compliment library
        complimentCategories,
        libLoading,
        libBusy,
        libError,
        fetchComplimentLibrary,
        createComplimentCategory,
        renameComplimentCategory,
        deleteComplimentCategory,
        createComplimentIdea,
        deleteComplimentIdea,
      }}
    >
      {children}
    </PricingControllerContext.Provider>
  );
}

export function usePricingController(): PricingControllerContextType {
  const ctx = useContext(PricingControllerContext);
  if (!ctx) {
    throw new Error(
      "usePricingController must be used inside <PricingControllerProvider>",
    );
  }
  return ctx;
}