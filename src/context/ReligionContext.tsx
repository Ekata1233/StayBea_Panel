"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE_URL } from "@/utils/api";

export type Community = {
  id: number;
  name: string;
  priority: number;
  active: boolean;
};

export type Religion = {
  id: number;
  name: string;
  priority: number;
  active: boolean;
  communities: Community[];
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

const mapReligion = (r: any): Religion => ({
  id: r.id,
  name: r.name,
  priority: r.priority,
  active: !!r.active,
  communities: sortByPriority(
    (r.communities ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      priority: c.priority,
      active: !!c.active,
    }))
  ),
});

type ReligionPatch = { name?: string; priority?: number; active?: boolean };
type CommunityPatch = { name?: string; priority?: number; active?: boolean };

export type CommunityDraft = { name: string; priority: number; active: boolean };
export type ReligionDraft = {
  name: string;
  priority: number;
  active: boolean;
  communities: CommunityDraft[];
};

type Ctx = {
  religions: Religion[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  // NON-destructive ops. create is a name-upsert (add one), edits/deletes are granular by id.
  addReligion: (draft: ReligionDraft) => Promise<void>;
  updateReligion: (id: number, patch: ReligionPatch) => Promise<void>;
  deleteReligion: (id: number) => Promise<void>;

  addCommunity: (religionId: number, name: string) => Promise<void>;
  updateCommunity: (
    religionId: number,
    communityId: number,
    patch: CommunityPatch
  ) => Promise<void>;
  deleteCommunity: (religionId: number, communityId: number) => Promise<void>;
};

const ReligionContext = createContext<Ctx | null>(null);

export function ReligionProvider({ children }: { children: React.ReactNode }) {
  const [religions, setReligions] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await api("/api/religion/get-all");
      setReligions(sortByPriority((json.data ?? []).map(mapReligion)));
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

  // ADD RELIGION — POST /api/religion/create (name-upsert). Sends ONE new religion
  // (with its communities); the endpoint no longer wipes others. It returns the FULL
  // list, so we replace state with its response.
  const addReligion: Ctx["addReligion"] = async (draft) => {
    const clean = draft.name.trim();

    // Guard: create upserts by name, so a duplicate would silently overwrite priority/active.
    if (religions.some((r) => r.name.trim().toLowerCase() === clean.toLowerCase())) {
      throw new Error(`"${clean}" already exists.`);
    }

    const body = {
      religions: [
        {
          name: clean,
          priority: draft.priority,
          active: draft.active,
          communities: draft.communities
            .filter((c) => c.name.trim())
            .map((c) => ({
              name: c.name.trim(),
              priority: c.priority,
              active: c.active,
            })),
        },
      ],
    };

    const json = await api("/api/religion/create", {
      method: "POST",
      body: JSON.stringify(body),
    });

    setReligions(sortByPriority((json.data ?? []).map(mapReligion)));
  };

  // UPDATE RELIGION (partial) — PATCH /:id -> updateReligionOnly. Communities untouched.
  const updateReligion: Ctx["updateReligion"] = async (id, patch) => {
    const body: ReligionPatch = {};
    if (patch.name !== undefined) body.name = patch.name.trim();
    if (patch.priority !== undefined) body.priority = patch.priority;
    if (patch.active !== undefined) body.active = patch.active;

    const json = await api(`/api/religion/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setReligions((prev) =>
      sortByPriority(prev.map((r) => (r.id === id ? mapReligion(json.data) : r)))
    );
  };

  // DELETE RELIGION (+ communities) — DELETE /:id.
  const deleteReligion: Ctx["deleteReligion"] = async (id) => {
    await api(`/api/religion/${id}`, { method: "DELETE" });
    setReligions((prev) => prev.filter((r) => r.id !== id));
  };

  // ADD COMMUNITY — POST /:religionId/community.
  const addCommunity: Ctx["addCommunity"] = async (religionId, name) => {
    const religion = religions.find((r) => r.id === religionId);
    const body = {
      name: name.trim(),
      priority: nextPriority(religion?.communities ?? []),
      active: true,
    };
    const json = await api(`/api/religion/${religionId}/community`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const c = json.data;
    setReligions((prev) =>
      prev.map((r) =>
        r.id === religionId
          ? {
              ...r,
              communities: sortByPriority([
                ...r.communities,
                { id: c.id, name: c.name, priority: c.priority, active: !!c.active },
              ]),
            }
          : r
      )
    );
  };

  // UPDATE COMMUNITY (partial) — PATCH /community/:communityId.
  const updateCommunity: Ctx["updateCommunity"] = async (
    religionId,
    communityId,
    patch
  ) => {
    const body: CommunityPatch = {};
    if (patch.name !== undefined) body.name = patch.name.trim();
    if (patch.priority !== undefined) body.priority = patch.priority;
    if (patch.active !== undefined) body.active = patch.active;

    const json = await api(`/api/religion/community/${communityId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const c = json.data;
    setReligions((prev) =>
      prev.map((r) =>
        r.id === religionId
          ? {
              ...r,
              communities: sortByPriority(
                r.communities.map((x) =>
                  x.id === communityId
                    ? { id: c.id, name: c.name, priority: c.priority, active: !!c.active }
                    : x
                )
              ),
            }
          : r
      )
    );
  };

  // DELETE COMMUNITY — DELETE /community/:communityId.
  const deleteCommunity: Ctx["deleteCommunity"] = async (
    religionId,
    communityId
  ) => {
    await api(`/api/religion/community/${communityId}`, { method: "DELETE" });
    setReligions((prev) =>
      prev.map((r) =>
        r.id === religionId
          ? { ...r, communities: r.communities.filter((c) => c.id !== communityId) }
          : r
      )
    );
  };

  return (
    <ReligionContext.Provider
      value={{
        religions,
        loading,
        error,
        refetch,
        addReligion,
        updateReligion,
        deleteReligion,
        addCommunity,
        updateCommunity,
        deleteCommunity,
      }}
    >
      {children}
    </ReligionContext.Provider>
  );
}

export function useReligion() {
  const ctx = useContext(ReligionContext);
  if (!ctx) throw new Error("useReligion must be used within ReligionProvider");
  return ctx;
}