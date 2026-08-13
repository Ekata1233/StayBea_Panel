"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE_URL } from "@/utils/api";

export type Language = {
  id: number;
  name: string;
  priority: number;
  active: boolean;
};

// Turns a raw zod error string (a JSON array of issues) into a readable message.
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
    // not JSON — fall through and return the original string
  }
  return message;
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json?.success === false) {
    throw new Error(
      humanizeError(json?.message) || `Request failed (${res.status})`
    );
  }

  return json;
}

const mapLanguage = (l: any): Language => ({
  id: l.id,
  name: l.name,
  priority: l.priority,
  active: !!l.active,
});

const sortByPriority = (list: Language[]) =>
  [...list].sort((a, b) => a.priority - b.priority);

type Ctx = {
  languages: Language[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createLanguage: (name: string) => Promise<void>;
  updateLanguage: (
    id: number,
    patch: {
      name?: string;
      priority?: number;
      active?: boolean;
    }
  ) => Promise<void>;
  deleteLanguage: (id: number) => Promise<void>;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const json = await api(`/api/admin/languages/get-all`);
      setLanguages(sortByPriority((json.data ?? []).map(mapLanguage)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // CREATE — priority auto = last + 1, active = true by default
  const createLanguage: Ctx["createLanguage"] = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Language name is required.");
    }

    const nextPriority =
      languages.length > 0
        ? Math.max(...languages.map((l) => l.priority)) + 1
        : 1;

    const body = {
      name: trimmed,
      priority: nextPriority,
      active: true,
    };

    const json = await api(`/api/admin/languages/create`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    setLanguages((prev) =>
      sortByPriority([...prev, mapLanguage(json.data)])
    );
  };

  // UPDATE — partial patch: name / priority / active
  const updateLanguage: Ctx["updateLanguage"] = async (id, patch) => {
    const body: Record<string, unknown> = {};

    if (patch.name !== undefined) body.name = patch.name.trim();
    if (patch.priority !== undefined) body.priority = patch.priority;
    if (patch.active !== undefined) body.active = patch.active;

    const json = await api(`/api/admin/languages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    setLanguages((prev) =>
      sortByPriority(
        prev.map((l) => (l.id === id ? mapLanguage(json.data) : l))
      )
    );
  };

  // DELETE
  const deleteLanguage: Ctx["deleteLanguage"] = async (id) => {
    await api(`/api/admin/languages/${id}`, {
      method: "DELETE",
    });

    setLanguages((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <LanguageContext.Provider
      value={{
        languages,
        loading,
        error,
        refetch,
        createLanguage,
        updateLanguage,
        deleteLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return ctx;
}