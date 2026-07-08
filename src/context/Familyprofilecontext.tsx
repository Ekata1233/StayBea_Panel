"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE_URL } from "@/utils/api";

// A category = a row on the screen (Family Type, Father Occupation, ...).
export type Category = {
  id: number;
  code: string;
  title: string;
  valueCount: number;
};

// A master value = a chip under a category (Joint Family, Farmer, ...).
export type MasterValue = {
  id: number;
  categoryId: number;
  value: string;
  priority: number;
  active: boolean;
};

// A category with its values attached, for rendering.
export type CategoryGroup = Category & { values: MasterValue[] };

// Family income bracket. Note: has title + min/max amounts, unlike master values.
export type FamilyIncome = {
  id: number;
  title: string;
  minAmount: number | null;
  maxAmount: number | null;
  priority: number;
  active: boolean;
};

function humanizeError(message?: string): string {
  if (!message) return "Something went wrong";
  try {
    const parsed = JSON.parse(message);
    if (Array.isArray(parsed)) {
      return parsed
        .map((issue: any) => {
          const field = Array.isArray(issue?.path) ? issue.path.join(".") : "";
          return field ? `${field}: ${issue?.message}` : issue?.message;
        })
        .filter(Boolean)
        .join("\n");
    }
  } catch {
    // not JSON — return as-is
  }
  return message;
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(humanizeError(json?.message) || `Request failed (${res.status})`);
  }
  return json;
}

const sortByPriority = <T extends { priority: number }>(arr: T[]) =>
  [...arr].sort((a, b) => a.priority - b.priority);

// Parses a strict "₹11–24 LPA" label into rupee amounts.
// 1 LPA = 1,00,000 rupees, so 11 LPA -> 1_100_000. Throws on bad format.
const LPA_TO_RUPEES = 100000;
function parseLpaLabel(label: string): { minAmount: number; maxAmount: number } {
  const clean = label.trim();
  if (!/^₹\s*\d+\s*–\s*\d+\s*LPA$/.test(clean)) {
    throw new Error('Use format: ₹11–24 LPA (₹, min–max with en-dash "–", then LPA)');
  }
  const nums = (clean.match(/\d+/g) || []).map(Number);
  if (nums.length !== 2 || nums[1] <= nums[0]) {
    throw new Error("Max must be greater than min (e.g. ₹11–24 LPA)");
  }
  return {
    minAmount: nums[0] * LPA_TO_RUPEES,
    maxAmount: nums[1] * LPA_TO_RUPEES,
  };
}

type CategoryPatch = { code?: string; title?: string };
type ValuePatch = { value?: string; priority?: number; active?: boolean };
type IncomePatch = {
  title?: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  priority?: number;
  active?: boolean;
};

type Ctx = {
  groups: CategoryGroup[];
  incomes: FamilyIncome[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  addCategory: (title: string, code: string) => Promise<void>;
  updateCategory: (id: number, patch: CategoryPatch) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  addIncome: (title: string) => Promise<void>;
  updateIncome: (
    id: number,
    patch: { title?: string; priority?: number; active?: boolean }
  ) => Promise<void>;
  deleteIncome: (id: number) => Promise<void>;

  addValue: (categoryId: number, value: string) => Promise<void>;
  updateValue: (
    categoryId: number,
    valueId: number,
    patch: ValuePatch
  ) => Promise<void>;
  deleteValue: (categoryId: number, valueId: number) => Promise<void>;
};

const FamilyProfileContext = createContext<Ctx | null>(null);

export function FamilyProfileProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [incomes, setIncomes] = useState<FamilyIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Two calls: categories (rows) and values (chips), then stitch by categoryId.
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catJson, valJson, incJson] = await Promise.all([
        api("/api/admin/family-categories/get-all"),
        api("/api/admin/family-values/get-all"),
        api("/api/admin/family-incomes/get-all"),
      ]);

      const categories: any[] = catJson.data ?? [];
      const values: any[] = valJson.data ?? [];
      const incomeList: any[] = incJson.data ?? [];

      const byCategory = new Map<number, MasterValue[]>();
      for (const v of values) {
        const mv: MasterValue = {
          id: v.id,
          categoryId: v.categoryId,
          value: v.value,
          priority: v.priority,
          active: !!v.active,
        };
        const list = byCategory.get(v.categoryId) ?? [];
        list.push(mv);
        byCategory.set(v.categoryId, list);
      }

      const merged: CategoryGroup[] = categories.map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        valueCount: c._count?.values ?? 0,
        values: sortByPriority(byCategory.get(c.id) ?? []),
      }));

      setGroups(merged);

      setIncomes(
        sortByPriority(
          incomeList.map((i) => ({
            id: i.id,
            title: i.title,
            minAmount: i.minAmount ?? null,
            maxAmount: i.maxAmount ?? null,
            priority: i.priority,
            active: !!i.active,
          }))
        )
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const nextPriority = (arr: { priority: number }[]) =>
    arr.length ? Math.max(...arr.map((x) => x.priority)) + 1 : 1;

  // ADD CATEGORY — POST /family-categories/create. code must be unique.
  const addCategory: Ctx["addCategory"] = async (title, code) => {
    const json = await api("/api/admin/family-categories/create", {
      method: "POST",
      body: JSON.stringify({ title: title.trim(), code: code.trim() }),
    });
    const c = json.data;
    setGroups((prev) => [
      ...prev,
      { id: c.id, code: c.code, title: c.title, valueCount: 0, values: [] },
    ]);
  };

  // UPDATE CATEGORY — PATCH /family-categories/:id
  const updateCategory: Ctx["updateCategory"] = async (id, patch) => {
    const body: CategoryPatch = {};
    if (patch.title !== undefined) body.title = patch.title.trim();
    if (patch.code !== undefined) body.code = patch.code.trim();

    const json = await api(`/api/admin/family-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const c = json.data;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, code: c.code, title: c.title } : g
      )
    );
  };

  // DELETE CATEGORY — DELETE /family-categories/:id. Backend blocks if it has values.
  const deleteCategory: Ctx["deleteCategory"] = async (id) => {
    await api(`/api/admin/family-categories/${id}`, { method: "DELETE" });
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  // ADD VALUE — POST /family-values/create
  const addValue: Ctx["addValue"] = async (categoryId, value) => {
    const group = groups.find((g) => g.id === categoryId);
    const json = await api("/api/admin/family-values/create", {
      method: "POST",
      body: JSON.stringify({
        categoryId,
        value: value.trim(),
        priority: nextPriority(group?.values ?? []),
        active: true,
      }),
    });
    const v = json.data;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === categoryId
          ? {
              ...g,
              valueCount: g.valueCount + 1,
              values: sortByPriority([
                ...g.values,
                {
                  id: v.id,
                  categoryId: v.categoryId,
                  value: v.value,
                  priority: v.priority,
                  active: !!v.active,
                },
              ]),
            }
          : g
      )
    );
  };

  // UPDATE VALUE — PATCH /family-values/:id (rename / reprioritise / toggle active)
  const updateValue: Ctx["updateValue"] = async (categoryId, valueId, patch) => {
    const body: ValuePatch = {};
    if (patch.value !== undefined) body.value = patch.value.trim();
    if (patch.priority !== undefined) body.priority = patch.priority;
    if (patch.active !== undefined) body.active = patch.active;

    const json = await api(`/api/admin/family-values/${valueId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const v = json.data;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === categoryId
          ? {
              ...g,
              values: sortByPriority(
                g.values.map((x) =>
                  x.id === valueId
                    ? {
                        id: v.id,
                        categoryId: v.categoryId,
                        value: v.value,
                        priority: v.priority,
                        active: !!v.active,
                      }
                    : x
                )
              ),
            }
          : g
      )
    );
  };

  // DELETE VALUE — DELETE /family-values/:id. Backend blocks if used by any profile.
  const deleteValue: Ctx["deleteValue"] = async (categoryId, valueId) => {
    await api(`/api/admin/family-values/${valueId}`, { method: "DELETE" });
    setGroups((prev) =>
      prev.map((g) =>
        g.id === categoryId
          ? {
              ...g,
              valueCount: Math.max(0, g.valueCount - 1),
              values: g.values.filter((x) => x.id !== valueId),
            }
          : g
      )
    );
  };

  // ADD INCOME — POST /family-incomes/create. Amounts derived from the "₹11–24 LPA" label.
  const addIncome: Ctx["addIncome"] = async (title) => {
    const { minAmount, maxAmount } = parseLpaLabel(title);
    const json = await api("/api/admin/family-incomes/create", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        minAmount,
        maxAmount,
        priority: nextPriority(incomes),
        active: true,
      }),
    });
    const i = json.data;
    setIncomes((prev) =>
      sortByPriority([
        ...prev,
        {
          id: i.id,
          title: i.title,
          minAmount: i.minAmount ?? null,
          maxAmount: i.maxAmount ?? null,
          priority: i.priority,
          active: !!i.active,
        },
      ])
    );
  };

  // UPDATE INCOME — PATCH /family-incomes/:id. If title changes, amounts are re-derived.
  const updateIncome: Ctx["updateIncome"] = async (id, patch) => {
    const body: IncomePatch = {};
    if (patch.title !== undefined) {
      const { minAmount, maxAmount } = parseLpaLabel(patch.title);
      body.title = patch.title.trim();
      body.minAmount = minAmount;
      body.maxAmount = maxAmount;
    }
    if (patch.priority !== undefined) body.priority = patch.priority;
    if (patch.active !== undefined) body.active = patch.active;

    const json = await api(`/api/admin/family-incomes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const i = json.data;
    setIncomes((prev) =>
      sortByPriority(
        prev.map((x) =>
          x.id === id
            ? {
                id: i.id,
                title: i.title,
                minAmount: i.minAmount ?? null,
                maxAmount: i.maxAmount ?? null,
                priority: i.priority,
                active: !!i.active,
              }
            : x
        )
      )
    );
  };

  // DELETE INCOME — DELETE /family-incomes/:id. Backend blocks if assigned to users.
  const deleteIncome: Ctx["deleteIncome"] = async (id) => {
    await api(`/api/admin/family-incomes/${id}`, { method: "DELETE" });
    setIncomes((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <FamilyProfileContext.Provider
      value={{
        groups,
        incomes,
        loading,
        error,
        refetch,
        addCategory,
        updateCategory,
        deleteCategory,
        addValue,
        updateValue,
        deleteValue,
        addIncome,
        updateIncome,
        deleteIncome,
      }}
    >
      {children}
    </FamilyProfileContext.Provider>
  );
}

export function useFamilyProfile() {
  const ctx = useContext(FamilyProfileContext);
  if (!ctx)
    throw new Error("useFamilyProfile must be used within FamilyProfileProvider");
  return ctx;
}