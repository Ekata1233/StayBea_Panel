"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE_URL } from "@/utils/api";

const CATEGORY = "DATING";
const SCREEN = "THINGS_U_LOVE";

// Minimum options required to create a field. MUST match your backend zod .min().
export const MIN_OPTIONS = 2;

export type Option = {
  id: string;
  value: string;
  label: string;
};

export type Field = {
  id: string;
  key: string;
  title: string;
  isMulti: boolean;
  emoji: string;
  options: Option[];
};

// "Diet Abc" -> "diet_abc"
export const slugify = (input: string) =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const EMOJI_BY_KEY: Record<string, string> = {
  diet: "🥗",
  drinking: "🍷",
  smoking: "🚬",
  fitness: "💪",
  pets: "🐾",
  sleep: "😴",
};

const emojiFor = (key: string) => EMOJI_BY_KEY[key] ?? "🏷️";

// Turns a raw zod error string (a JSON array of issues) into a readable message.
function humanizeError(message?: string): string {
  if (!message) return "Something went wrong";
  try {
    const parsed = JSON.parse(message);
    if (Array.isArray(parsed)) {
      return parsed
        .map((issue: any) => {
          const field = Array.isArray(issue?.path) ? issue.path.join(".") : "";
          if (issue?.code === "too_small" && issue?.origin === "array") {
            const n = issue.minimum;
            return `Please add at least ${n} ${field || "item"}${
              n > 1 ? "s" : ""
            }.`;
          }
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
    throw new Error(humanizeError(json?.message) || `Request failed (${res.status})`);
  }

  return json;
}

const mapQuestion = (q: any): Field => ({
  id: q.id,
  key: q.key,
  title: q.title,
  isMulti: !!q.isMulti,
  emoji: emojiFor(q.key),
  options: (q.options ?? []).map((o: any) => ({
    id: o.id,
    value: o.value,
    label: o.label,
  })),
});

type Ctx = {
  fields: Field[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createField: (
    title: string,
    key: string,
    isMulti: boolean,
    optionLabels: string[]
  ) => Promise<void>;
  updateField: (
    questionId: string,
    patch: {
      title?: string;
      isMulti?: boolean;
    }
  ) => Promise<void>;
  deleteField: (questionId: string) => Promise<void>;
  addOption: (questionId: string, label: string) => Promise<void>;
  updateOption: (
    questionId: string,
    optionId: string,
    label: string
  ) => Promise<void>;
  deleteOption: (
    questionId: string,
    optionId: string
  ) => Promise<void>;
};

const InterestContext = createContext<Ctx | null>(null);

export function InterestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const json = await api(
        `/api/question/fetch?category=${CATEGORY}&screen=${SCREEN}`
      );

      setFields((json.data ?? []).map(mapQuestion));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // CREATE QUESTION
  const createField: Ctx["createField"] = async (
    title,
    key,
    isMulti,
    optionLabels
  ) => {
    const cleaned = optionLabels.map((l) => l.trim()).filter(Boolean);

    // Fail fast, before the network call, with a readable message.
    if (cleaned.length < MIN_OPTIONS) {
      throw new Error(
        `Please add at least ${MIN_OPTIONS} options before creating this field.`
      );
    }

    const body = {
      key: key.trim(),
      title: title.trim(),
      category: CATEGORY,
      screen: SCREEN,
      isMulti,
      options: cleaned.map((label) => ({
        value: slugify(label),
        label,
      })),
    };

    const json = await api("/api/question/create", {
      method: "POST",
      body: JSON.stringify(body),
    });

    setFields((prev) => [...prev, mapQuestion(json.data)]);
  };

  // UPDATE QUESTION
  const updateField: Ctx["updateField"] = async (
    questionId,
    patch
  ) => {
    const body: Record<string, unknown> = {};

    if (patch.title !== undefined) {
      body.title = patch.title.trim();
    }

    if (patch.isMulti !== undefined) {
      body.isMulti = patch.isMulti;
    }

    const json = await api(`/api/question/update/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    setFields((prev) =>
      prev.map((field) =>
        field.id === questionId ? mapQuestion(json.data) : field
      )
    );
  };

  // DELETE QUESTION (+ its options) — delete-question/:questionId
  const deleteField: Ctx["deleteField"] = async (
    questionId
  ) => {
    await api(`/api/question/delete-question/${questionId}`, {
      method: "DELETE",
    });

    setFields((prev) =>
      prev.filter((field) => field.id !== questionId)
    );
  };

  // ADD OPTION
  const addOption: Ctx["addOption"] = async (
    questionId,
    label
  ) => {
    const body = {
      value: slugify(label),
      label: label.trim(),
    };

    const json = await api(`/api/question/${questionId}/options`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const option = json.data;

    setFields((prev) =>
      prev.map((field) =>
        field.id === questionId
          ? {
              ...field,
              options: [
                ...field.options,
                {
                  id: option.id,
                  value: option.value,
                  label: option.label,
                },
              ],
            }
          : field
      )
    );
  };

  // UPDATE OPTION
  const updateOption: Ctx["updateOption"] = async (
    questionId,
    optionId,
    label
  ) => {
    const body = {
      value: slugify(label),
      label: label.trim(),
    };

    const json = await api(`/api/question/options/${optionId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    const option = json.data;

    setFields((prev) =>
      prev.map((field) =>
        field.id === questionId
          ? {
              ...field,
              options: field.options.map((o) =>
                o.id === optionId
                  ? {
                      id: option.id,
                      value: option.value,
                      label: option.label,
                    }
                  : o
              ),
            }
          : field
      )
    );
  };

  // DELETE OPTION
  const deleteOption: Ctx["deleteOption"] = async (
    questionId,
    optionId
  ) => {
    await api(`/api/question/options/${optionId}`, {
      method: "DELETE",
    });

    setFields((prev) =>
      prev.map((field) =>
        field.id === questionId
          ? {
              ...field,
              options: field.options.filter(
                (option) => option.id !== optionId
              ),
            }
          : field
      )
    );
  };

  return (
    <InterestContext.Provider
      value={{
        fields,
        loading,
        error,
        refetch,
        createField,
        updateField,
        deleteField,
        addOption,
        updateOption,
        deleteOption,
      }}
    >
      {children}
    </InterestContext.Provider>
  );
}

export function useInterest() {
  const ctx = useContext(InterestContext);

  if (!ctx) {
    throw new Error(
      "useInterest must be used within InterestProvider"
    );
  }

  return ctx;
}