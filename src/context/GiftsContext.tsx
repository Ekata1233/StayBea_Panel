"use client";

import { API_BASE_URL } from "@/utils/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/* ---------- Config ---------- */


const CATEGORY_LIST_URL = `${API_BASE_URL}/api/admin/gift-category/list`;
const CATEGORY_CREATE_URL = `${API_BASE_URL}/api/admin/gift-category/create`;
const CATEGORY_UPDATE_URL = (id: string) =>
  `${API_BASE_URL}/api/admin/gift-category/update/${id}`;
const CATEGORY_DELETE_URL = (id: string) =>
  `${API_BASE_URL}/api/admin/gift-category/delete/${id}`;

const GIFT_LIST_URL = `${API_BASE_URL}/api/admin/gift/list`;
const GIFT_CREATE_URL = `${API_BASE_URL}/api/admin/gift/create`;
const GIFT_DETAILS_URL = (id: string) =>
  `${API_BASE_URL}/api/admin/gift/details/${id}`;
const GIFT_UPDATE_URL = (id: string) =>
  `${API_BASE_URL}/api/admin/gift/update/${id}`;
const GIFT_DELETE_URL = (id: string) =>
  `${API_BASE_URL}/api/admin/gift/delete/${id}`;

/** Adjust the localStorage key if your auth token is stored differently. */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/** JSON requests */
function jsonHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/** FormData requests — NO Content-Type (browser sets multipart boundary) */
function authOnlyHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/* ---------- Types ---------- */

export type GiftCategory = {
  id: string;
  name: string;
};

export type GiftItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  image: string;
  name: string;
  coinCost: number;
  triggerLine: string;
  receiverLine: string;
  isLive: boolean;
};

export type GiftFormInput = {
  categoryId: string;
  name: string;
  coinCost: number;
  triggerLine: string;
  receiverLine: string;
  isLive: boolean;
  /** Required on create; optional on update (keeps existing image if omitted) */
  imageFile?: File | null;
};

type GiftsContextValue = {
  /* categories */
  categories: GiftCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  creatingCategory: boolean;
  createCategoryError: string | null;
  savingCategory: boolean;
  deletingCategory: boolean;
  editCategoryError: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<boolean>;
  updateCategory: (id: string, name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  clearCreateCategoryError: () => void;
  clearEditCategoryError: () => void;
  /* gifts */
  gifts: GiftItem[];
  giftsLoading: boolean;
  giftsError: string | null;
  savingGift: boolean;
  giftFormError: string | null;
  deletingGiftId: string | null;
  togglingGiftId: string | null;
  fetchGifts: () => Promise<void>;
  createGift: (input: GiftFormInput) => Promise<boolean>;
  updateGift: (id: string, input: GiftFormInput) => Promise<boolean>;
  deleteGift: (id: string) => Promise<boolean>;
  toggleGiftLive: (gift: GiftItem) => Promise<boolean>;
  getGiftById: (id: string) => Promise<GiftItem | null>;
  clearGiftFormError: () => void;
};

/* ---------- Response mapping (matches your API responses) ---------- */

function mapCategory(item: any): GiftCategory {
  return {
    id: String(item.id ?? item._id ?? ""),
    name: String(item.name ?? ""),
  };
}

function mapGift(item: any): GiftItem {
  return {
    id: String(item.id ?? ""),
    categoryId: String(item.categoryId ?? item.category?.id ?? ""),
    categoryName: String(item.category?.name ?? ""),
    image: String(item.image ?? ""),
    name: String(item.name ?? ""),
    coinCost: Number(item.coinCost ?? 0),
    triggerLine: String(item.triggerLine ?? ""),
    receiverLine: String(item.receiverLine ?? ""),
    isLive: Boolean(item.isLive),
  };
}

function extractList(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

function buildGiftFormData(input: GiftFormInput): FormData {
  const fd = new FormData();
  fd.append("categoryId", input.categoryId);
  fd.append("name", input.name.trim());
  fd.append("coinCost", String(input.coinCost));
  fd.append("triggerLine", input.triggerLine.trim());
  fd.append("receiverLine", input.receiverLine.trim());
  fd.append("isLive", String(input.isLive));
  if (input.imageFile) {
    fd.append("image", input.imageFile);
  }
  return fd;
}

/* ---------- Context ---------- */

const GiftsContext = createContext<GiftsContextValue | null>(null);

export function GiftsProvider({ children }: { children: React.ReactNode }) {
  /* ================= Categories ================= */

  const [categories, setCategories] = useState<GiftCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [creatingCategory, setCreatingCategory] = useState(false);
  const [createCategoryError, setCreateCategoryError] = useState<string | null>(
    null,
  );
  const [savingCategory, setSavingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [editCategoryError, setEditCategoryError] = useState<string | null>(
    null,
  );

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const res = await fetch(CATEGORY_LIST_URL, {
        method: "GET",
        headers: jsonHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to load categories (${res.status})`);
      const json = await res.json();
      setCategories(extractList(json).map(mapCategory).filter((c) => c.id));
    } catch (err) {
      setCategoriesError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const addCategory = useCallback(
    async (name: string): Promise<boolean> => {
      const trimmed = name.trim();
      if (!trimmed) return false;
      if (
        categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
      ) {
        setCreateCategoryError("Category already exists");
        return false;
      }
      setCreatingCategory(true);
      setCreateCategoryError(null);
      try {
        const res = await fetch(CATEGORY_CREATE_URL, {
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify({ name: trimmed }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.success === false) {
          throw new Error(
            json?.message ?? `Failed to create category (${res.status})`,
          );
        }
        await fetchCategories();
        return true;
      } catch (err) {
        setCreateCategoryError(
          err instanceof Error ? err.message : "Failed to create category",
        );
        return false;
      } finally {
        setCreatingCategory(false);
      }
    },
    [categories, fetchCategories],
  );

  const updateCategory = useCallback(
    async (id: string, name: string): Promise<boolean> => {
      const trimmed = name.trim();
      if (!trimmed) return false;
      if (
        categories.some(
          (c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase(),
        )
      ) {
        setEditCategoryError("A category with this name already exists");
        return false;
      }
      setSavingCategory(true);
      setEditCategoryError(null);
      try {
        const res = await fetch(CATEGORY_UPDATE_URL(id), {
          method: "PUT",
          headers: jsonHeaders(),
          body: JSON.stringify({ name: trimmed }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.success === false) {
          throw new Error(
            json?.message ?? `Failed to update category (${res.status})`,
          );
        }
        await fetchCategories();
        return true;
      } catch (err) {
        setEditCategoryError(
          err instanceof Error ? err.message : "Failed to update category",
        );
        return false;
      } finally {
        setSavingCategory(false);
      }
    },
    [categories, fetchCategories],
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      setDeletingCategory(true);
      setEditCategoryError(null);
      try {
        const res = await fetch(CATEGORY_DELETE_URL(id), {
          method: "DELETE",
          headers: jsonHeaders(),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.success === false) {
          throw new Error(
            json?.message ?? `Failed to delete category (${res.status})`,
          );
        }
        await fetchCategories();
        return true;
      } catch (err) {
        setEditCategoryError(
          err instanceof Error ? err.message : "Failed to delete category",
        );
        return false;
      } finally {
        setDeletingCategory(false);
      }
    },
    [fetchCategories],
  );

  const clearCreateCategoryError = useCallback(
    () => setCreateCategoryError(null),
    [],
  );
  const clearEditCategoryError = useCallback(
    () => setEditCategoryError(null),
    [],
  );

  /* ================= Gifts ================= */

  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [giftsLoading, setGiftsLoading] = useState(true);
  const [giftsError, setGiftsError] = useState<string | null>(null);

  const [savingGift, setSavingGift] = useState(false);
  const [giftFormError, setGiftFormError] = useState<string | null>(null);
  const [deletingGiftId, setDeletingGiftId] = useState<string | null>(null);
  const [togglingGiftId, setTogglingGiftId] = useState<string | null>(null);

  const fetchGifts = useCallback(async () => {
    setGiftsLoading(true);
    setGiftsError(null);
    try {
      const res = await fetch(GIFT_LIST_URL, {
        method: "GET",
        headers: jsonHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to load gifts (${res.status})`);
      const json = await res.json();
      setGifts(extractList(json).map(mapGift).filter((g) => g.id));
    } catch (err) {
      setGiftsError(
        err instanceof Error ? err.message : "Failed to load gifts",
      );
    } finally {
      setGiftsLoading(false);
    }
  }, []);

  const createGift = useCallback(
    async (input: GiftFormInput): Promise<boolean> => {
      setSavingGift(true);
      setGiftFormError(null);
      try {
        const res = await fetch(GIFT_CREATE_URL, {
          method: "POST",
          headers: authOnlyHeaders(), // FormData: browser sets Content-Type
          body: buildGiftFormData(input),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.success === false) {
          throw new Error(
            json?.message ?? `Failed to create gift (${res.status})`,
          );
        }
        await fetchGifts();
        return true;
      } catch (err) {
        setGiftFormError(
          err instanceof Error ? err.message : "Failed to create gift",
        );
        return false;
      } finally {
        setSavingGift(false);
      }
    },
    [fetchGifts],
  );

  const updateGift = useCallback(
    async (id: string, input: GiftFormInput): Promise<boolean> => {
      setSavingGift(true);
      setGiftFormError(null);
      try {
        const res = await fetch(GIFT_UPDATE_URL(id), {
          method: "PUT",
          headers: authOnlyHeaders(),
          body: buildGiftFormData(input),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.success === false) {
          throw new Error(
            json?.message ?? `Failed to update gift (${res.status})`,
          );
        }
        await fetchGifts();
        return true;
      } catch (err) {
        setGiftFormError(
          err instanceof Error ? err.message : "Failed to update gift",
        );
        return false;
      } finally {
        setSavingGift(false);
      }
    },
    [fetchGifts],
  );

  const deleteGift = useCallback(
    async (id: string): Promise<boolean> => {
      setDeletingGiftId(id);
      try {
        const res = await fetch(GIFT_DELETE_URL(id), {
          method: "DELETE",
          headers: jsonHeaders(),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.success === false) {
          throw new Error(
            json?.message ?? `Failed to delete gift (${res.status})`,
          );
        }
        await fetchGifts();
        return true;
      } catch (err) {
        setGiftsError(
          err instanceof Error ? err.message : "Failed to delete gift",
        );
        return false;
      } finally {
        setDeletingGiftId(null);
      }
    },
    [fetchGifts],
  );

  /** Optimistic live/off toggle: flips locally, reverts on failure. */
  const toggleGiftLive = useCallback(
    async (gift: GiftItem): Promise<boolean> => {
      setTogglingGiftId(gift.id);
      const nextLive = !gift.isLive;
      setGifts((prev) =>
        prev.map((g) => (g.id === gift.id ? { ...g, isLive: nextLive } : g)),
      );
      try {
        const res = await fetch(GIFT_UPDATE_URL(gift.id), {
          method: "PUT",
          headers: authOnlyHeaders(),
          body: buildGiftFormData({
            categoryId: gift.categoryId,
            name: gift.name,
            coinCost: gift.coinCost,
            triggerLine: gift.triggerLine,
            receiverLine: gift.receiverLine,
            isLive: nextLive,
            // no imageFile → backend should keep existing image
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.success === false) {
          throw new Error(json?.message ?? `Failed (${res.status})`);
        }
        return true;
      } catch {
        // revert
        setGifts((prev) =>
          prev.map((g) =>
            g.id === gift.id ? { ...g, isLive: gift.isLive } : g,
          ),
        );
        return false;
      } finally {
        setTogglingGiftId(null);
      }
    },
    [],
  );

  const getGiftById = useCallback(
    async (id: string): Promise<GiftItem | null> => {
      try {
        const res = await fetch(GIFT_DETAILS_URL(id), {
          method: "GET",
          headers: jsonHeaders(),
          cache: "no-store",
        });
        if (!res.ok) return null;
        const json = await res.json().catch(() => null);
        const raw = json?.data ?? json;
        if (!raw) return null;
        const mapped = mapGift(raw);
        return mapped.id ? mapped : null;
      } catch {
        return null;
      }
    },
    [],
  );

  const clearGiftFormError = useCallback(() => setGiftFormError(null), []);

  /* ================= Init ================= */

  useEffect(() => {
    fetchCategories();
    fetchGifts();
  }, [fetchCategories, fetchGifts]);

  return (
    <GiftsContext.Provider
      value={{
        categories,
        categoriesLoading,
        categoriesError,
        creatingCategory,
        createCategoryError,
        savingCategory,
        deletingCategory,
        editCategoryError,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        clearCreateCategoryError,
        clearEditCategoryError,
        gifts,
        giftsLoading,
        giftsError,
        savingGift,
        giftFormError,
        deletingGiftId,
        togglingGiftId,
        fetchGifts,
        createGift,
        updateGift,
        deleteGift,
        toggleGiftLive,
        getGiftById,
        clearGiftFormError,
      }}
    >
      {children}
    </GiftsContext.Provider>
  );
}

export function useGifts() {
  const ctx = useContext(GiftsContext);
  if (!ctx) {
    throw new Error("useGifts must be used inside <GiftsProvider>");
  }
  return ctx;
}