"use client";

import { API_BASE_URL } from "@/utils/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

/* ============================================================
   LegalPoliciesContext.tsx
   Base: ${API_BASE_URL}/api/legal   (backend me: app.use("/api/legal", legalRoutes))

   Teen APIs:
   1. GET  /legal-pages            → fetchPages()      (sab pages)
   2. GET  /legal-pages/:pageType  → fetchPageByType() (ek page)
   3. POST /legal-pages            → savePage()        (upsert)

   File location: src/context/LegalPoliciesContext.tsx
   .env.local:
   NEXT_PUBLIC_API_BASE_URL=https://dating-app-backend-plum.vercel.app
   ============================================================ */





/* ------------------------- Types ------------------------- */

export type LegalPageType =
  | "TERMS_OF_SERVICE"
  | "PRIVACY_POLICY"
  | "COMMUNITY_GUIDELINES"
  | "DATING_SAFETY_TIPS"
  | "CHILD_SAFETY_STANDARDS"
  | "AGE_POLICY_18_PLUS"
  | "CONTENT_MODERATION_LAW_ENFORCEMENT"
  | "REFUND_CANCELLATION_POLICY"
  | "WALLET_COINS_TERMS"
  | "FOREVER_LOVE_PROGRAMME_TERMS"
  | "COOKIE_POLICY"
  | "DATA_YOUR_RIGHTS"
  | "VERIFICATION_ID_POLICY"
  | "DELETE_ACCOUNT_DATA"
  | "LICENSES_ACKNOWLEDGEMENTS"
  | "GRIEVANCE_OFFICER_REDRESSAL";

export type LegalTextMark = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string;
  link?: string;
};

/* API block — backend shape, _id nahi hota (wo sirf editor-local hai) */
export type ApiLegalBlock = {
  type:
    | "heading"
    | "paragraph"
    | "bulletList"
    | "numberedList"
    | "quote"
    | "divider"
    | "table";
  level?: 1 | 2 | 3 | 4;
  content?: LegalTextMark[];
  items?: { content: LegalTextMark[] }[];
  headers?: { content: LegalTextMark[] }[];
  rows?: { cells: { content: LegalTextMark[] }[] }[];
};

export interface LegalPageRecord {
  id: string;
  pageType: LegalPageType;
  title: string;
  version: string;
  schemaVersion: number;
  content: {
    schemaVersion: number;
    blocks: ApiLegalBlock[];
    html?: string;
  };
  effectiveFrom?: string | null;
  publishedAt?: string | null;
  createdBy?: string | null;
  publishedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveResult {
  success: boolean;
  message: string;
  /* zod validation fail hone par backend ka errors object */
  errors?: unknown;
}

interface LegalPoliciesContextValue {
  /* pageType → saved record (DB me jo hai) */
  pages: Partial<Record<LegalPageType, LegalPageRecord>>;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  /* kaunsa page abhi save ho raha hai (button spinner ke liye) */
  savingType: LegalPageType | null;

  /* API 1: GET /legal-pages */
  fetchPages: () => Promise<void>;
  /* API 2: GET /legal-pages/:pageType */
  fetchPageByType: (
    pageType: LegalPageType,
  ) => Promise<LegalPageRecord | null>;
  /* API 3: POST /legal-pages */
  savePage: (
    pageType: LegalPageType,
    title: string,
    blocks: ApiLegalBlock[],
  ) => Promise<SaveResult>;
}

const LegalPoliciesContext =
  createContext<LegalPoliciesContextValue | null>(null);

/* ------------------------- Provider ------------------------- */

export function LegalPoliciesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pages, setPages] = useState<
    Partial<Record<LegalPageType, LegalPageRecord>>
  >({});
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingType, setSavingType] = useState<LegalPageType | null>(null);

  /* ---------- API 1: GET /api/legal/legal-pages — sab pages ---------- */
  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/legal/legal-pages`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          // TODO: admin auth aane par yahan Authorization header lagega
        },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json?.message || `Failed to load legal pages (${res.status})`,
        );
      }

      const map: Partial<Record<LegalPageType, LegalPageRecord>> = {};
      for (const page of json.data as LegalPageRecord[]) {
        map[page.pageType] = page;
      }
      setPages(map);
      setLoaded(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load legal pages",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- API 2: GET /api/legal/legal-pages/:pageType — ek page ---------- */
  const fetchPageByType = useCallback(
    async (pageType: LegalPageType): Promise<LegalPageRecord | null> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/legal/legal-pages/${pageType}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        /* 404 = page abhi save nahi hua — error nahi, null return */
        if (res.status === 404) return null;

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(
            json?.message || `Failed to load page (${res.status})`,
          );
        }

        const page = json.data as LegalPageRecord;

        /* Local cache bhi fresh rakho */
        setPages((prev) => ({ ...prev, [pageType]: page }));

        return page;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load legal page",
        );
        return null;
      }
    },
    [],
  );

  /* ---------- API 3: POST /api/legal/legal-pages — upsert ---------- */
  const savePage = useCallback(
    async (
      pageType: LegalPageType,
      title: string,
      blocks: ApiLegalBlock[],
    ): Promise<SaveResult> => {
      setSavingType(pageType);
      try {
        const res = await fetch(`${API_BASE_URL}/api/legal/legal-pages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // TODO: admin auth aane par yahan Authorization header lagega
          },
          body: JSON.stringify({
            pageType,
            title,
            content: {
              schemaVersion: 1,
              blocks,
            },
          }),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          return {
            success: false,
            message: json?.message || `Save failed (${res.status})`,
            errors: json?.errors,
          };
        }

        /* Saved record se local state update — GET dobara nahi karna padta */
        setPages((prev) => ({
          ...prev,
          [pageType]: json.data as LegalPageRecord,
        }));

        return {
          success: true,
          message: json.message || "Saved",
        };
      } catch (e) {
        return {
          success: false,
          message:
            e instanceof Error ? e.message : "Network error — save failed",
        };
      } finally {
        setSavingType(null);
      }
    },
    [],
  );

  return (
    <LegalPoliciesContext.Provider
      value={{
        pages,
        loading,
        loaded,
        error,
        savingType,
        fetchPages,
        fetchPageByType,
        savePage,
      }}
    >
      {children}
    </LegalPoliciesContext.Provider>
  );
}

/* ------------------------- Hook ------------------------- */

export function useLegalPolicies() {
  const ctx = useContext(LegalPoliciesContext);
  if (!ctx) {
    throw new Error(
      "useLegalPolicies must be used inside <LegalPoliciesProvider>",
    );
  }
  return ctx;
}