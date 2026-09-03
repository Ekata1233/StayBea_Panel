"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  LegalPoliciesProvider,
  useLegalPolicies,
  LegalPageType,
  LegalTextMark as Mark,
  ApiLegalBlock,
} from "@/context/LegalPoliciesContext";

/* ============================================================
   Legal & Policies — API integrated
   Route: app/legal-policies/page.tsx
   Context: src/context/LegalPoliciesContext.tsx

   - Page load → GET /legal-pages (context) → editor hydrate
   - Save     → POST /legal-pages (upsert) → success/error UI
   - View     → full document display page
   ============================================================ */

const PINK = "#E91E63";
const SWATCHES = ["#1A1A1A", "#E91E63", "#2196F3", "#4CAF50", "#F44336"];

/* ------------------------- Editor block type (local _id ke saath) ------------------------- */

type Block = ApiLegalBlock & { _id: string };

interface LegalDoc {
  title: string;
  blocks: Block[];
}

interface RowMeta {
  pageType: LegalPageType;
  title: string;
  subtitle: string;
  icon: string;
}

const ROWS: RowMeta[] = [
  { pageType: "TERMS_OF_SERVICE", title: "Terms of Service", subtitle: "The rules for using Welvors", icon: "📄" },
  { pageType: "PRIVACY_POLICY", title: "Privacy Policy", subtitle: "What data we collect & why", icon: "🔒" },
  { pageType: "COMMUNITY_GUIDELINES", title: "Community Guidelines", subtitle: "How to behave on Welvors", icon: "📜" },
  { pageType: "REFUND_CANCELLATION_POLICY", title: "Refund & Cancellation Policy", subtitle: "Plans, events, wallet withdrawals", icon: "💳" },
  { pageType: "WALLET_COINS_TERMS", title: "Wallet & Coins Terms", subtitle: "Earning, spending, 25% withdrawal fee", icon: "🪙" },
  { pageType: "FOREVER_LOVE_PROGRAMME_TERMS", title: "Forever Love Programme Terms", subtitle: "₹5 Lakh honeymoon conditions", icon: "💜" },
  { pageType: "COOKIE_POLICY", title: "Cookie Policy", subtitle: "Trackers & analytics", icon: "🍪" },
  { pageType: "DATA_YOUR_RIGHTS", title: "Data & Your Rights", subtitle: "Access, download, delete", icon: "📁" },
  { pageType: "VERIFICATION_ID_POLICY", title: "Verification & ID Policy", subtitle: "How we handle your documents", icon: "✓" },
  { pageType: "LICENSES_ACKNOWLEDGEMENTS", title: "Licenses & Acknowledgements", subtitle: "Open-source & partners", icon: "⚖️" },
  { pageType: "GRIEVANCE_OFFICER_REDRESSAL", title: "Grievance Officer", subtitle: "IT Rules 2021 contact", icon: "📘" },
  { pageType: "DATING_SAFETY_TIPS", title: "Dating Safety Tips", subtitle: "Meet safely, online & offline", icon: "🛡️" },
  { pageType: "CHILD_SAFETY_STANDARDS", title: "Child Safety Standards", subtitle: "Zero tolerance & reporting", icon: "🚫" },
  { pageType: "AGE_POLICY_18_PLUS", title: "Age Policy (18+)", subtitle: "Adults only, how we check age", icon: "🔞" },
  { pageType: "CONTENT_MODERATION_LAW_ENFORCEMENT", title: "Content Moderation & Law Enforcement", subtitle: "How reports & legal requests work", icon: "🧾" },
  { pageType: "DELETE_ACCOUNT_DATA", title: "Delete Account & Data", subtitle: "What happens when you leave", icon: "🗑️" },
];

/* ------------------------- ids ------------------------- */

let __id = 0;
const nid = () => `b${++__id}`;
const withIds = (blocks: ApiLegalBlock[]): Block[] =>
  blocks.map((b) => ({ ...b, _id: nid() }));
const stripIds = (blocks: Block[]): ApiLegalBlock[] =>
  blocks.map(({ _id, ...b }) => b);

/* ------------------------- marks <-> HTML (editor internals) ------------------------- */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function marksToHtml(content?: Mark[]) {
  if (!content?.length) return "";
  return content
    .map((m) => {
      let h = esc(m.text || "");
      if (m.bold) h = `<b>${h}</b>`;
      if (m.italic) h = `<i>${h}</i>`;
      if (m.underline) h = `<u>${h}</u>`;
      if (m.color) h = `<span style="color:${m.color}">${h}</span>`;
      return h;
    })
    .join("");
}

function rgbToHex(rgb: string) {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return rgb;
  return (
    "#" +
    [m[1], m[2], m[3]]
      .map((v) => (+v).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function htmlToMarks(root: HTMLElement): Mark[] {
  const out: Mark[] = [];
  const walk = (node: Node, ctx: Omit<Mark, "text">) => {
    if (node.nodeType === 3) {
      const text = node.nodeValue;
      if (text) out.push({ text, ...ctx });
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as HTMLElement;
    const tag = el.tagName;
    const next = { ...ctx };
    if (tag === "B" || tag === "STRONG") next.bold = true;
    if (tag === "I" || tag === "EM") next.italic = true;
    if (tag === "U") next.underline = true;
    if (tag === "FONT" && el.getAttribute("color"))
      next.color = el.getAttribute("color") || undefined;
    if (el.style?.color) next.color = rgbToHex(el.style.color);
    if (
      el.style?.fontWeight &&
      (el.style.fontWeight === "bold" || +el.style.fontWeight >= 600)
    )
      next.bold = true;
    if (tag === "BR") {
      out.push({ text: " ", ...ctx });
      return;
    }
    el.childNodes.forEach((c) => walk(c, next));
    if (
      (tag === "DIV" || tag === "P") &&
      out.length &&
      !/\s$/.test(out[out.length - 1].text)
    )
      out.push({ text: " ", ...ctx });
  };
  root.childNodes.forEach((c) => walk(c, {}));

  const merged: Mark[] = [];
  for (const m of out) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.bold === m.bold &&
      last.italic === m.italic &&
      last.underline === m.underline &&
      last.color === m.color
    )
      last.text += m.text;
    else merged.push({ ...m });
  }
  return merged
    .map((m) => {
      const r: Mark = { text: m.text };
      if (m.bold) r.bold = true;
      if (m.italic) r.italic = true;
      if (m.underline) r.underline = true;
      if (m.color && m.color.toLowerCase() !== "#1a1a1a") r.color = m.color;
      return r;
    })
    .filter((m) => m.text.length > 0);
}

/* ------------------------- Editable line ------------------------- */

function EditableLine({
  content,
  onChange,
  className,
  placeholder,
  onEnter,
}: {
  content?: Mark[];
  onChange: (m: Mark[]) => void;
  className?: string;
  placeholder?: string;
  onEnter?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const initial = useRef(marksToHtml(content));

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initial.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = useCallback(() => {
    if (ref.current) onChange(htmlToMarks(ref.current));
  }, [onChange]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder || "Type here…"}
      className={
        "empty-ph -mx-1 min-h-6 rounded px-1 outline-none focus:bg-white " +
        (className || "")
      }
      style={{ wordBreak: "break-word" }}
      onInput={emit}
      onBlur={emit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter?.();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand(
          "insertText",
          false,
          e.clipboardData.getData("text/plain"),
        );
      }}
    />
  );
}

/* ------------------------- Block chrome ------------------------- */

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={
        "flex h-6 w-6 items-center justify-center rounded-md border text-xs " +
        (danger
          ? "border-red-200 text-red-500 hover:bg-red-50"
          : "border-gray-200 text-gray-500 hover:bg-white")
      }
    >
      {children}
    </button>
  );
}

function BlockShell({
  label,
  extra,
  onDelete,
  onUp,
  onDown,
  children,
}: {
  label: string;
  extra?: React.ReactNode;
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-gray-50/60 transition-colors hover:border-pink-200">
      <div className="flex items-center justify-between px-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-400">
            {label}
          </span>
          {extra}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <IconBtn title="Move up" onClick={onUp}>↑</IconBtn>
          <IconBtn title="Move down" onClick={onDown}>↓</IconBtn>
          <IconBtn title="Delete block" onClick={onDelete} danger>✕</IconBtn>
        </div>
      </div>
      <div className="px-3 pb-3 pt-1">{children}</div>
    </div>
  );
}

/* ------------------------- List / Table editors ------------------------- */

function ListEditor({
  block,
  update,
  ordered,
}: {
  block: Block;
  update: (b: Block) => void;
  ordered: boolean;
}) {
  const items = block.items || [];
  const setItem = (i: number, content: Mark[]) =>
    update({
      ...block,
      items: items.map((it, ix) => (ix === i ? { content } : it)),
    });
  const addItem = (i: number) => {
    const copy = [...items];
    copy.splice(i + 1, 0, { content: [{ text: "" }] });
    update({ ...block, items: copy });
  };
  const delItem = (i: number) => {
    if (items.length === 1) return;
    update({ ...block, items: items.filter((_, ix) => ix !== i) });
  };
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-1.5 shrink-0 text-sm" style={{ color: PINK }}>
            {ordered ? `${i + 1}.` : "•"}
          </span>
          <div className="flex-1">
            <EditableLine
              content={it.content}
              onChange={(c) => setItem(i, c)}
              onEnter={() => addItem(i)}
              placeholder="List item…"
              className="text-[15px] text-gray-800"
            />
          </div>
          <button
            onClick={() => delItem(i)}
            className="mt-1 text-xs text-gray-300 hover:text-red-500"
            title="Remove item"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={() => addItem(items.length - 1)}
        className="text-xs font-medium hover:underline"
        style={{ color: PINK }}
      >
        + Add item
      </button>
    </div>
  );
}

function TableEditor({
  block,
  update,
}: {
  block: Block;
  update: (b: Block) => void;
}) {
  const headers = block.headers || [];
  const rows = block.rows || [];
  const cellText = (cell: { content: Mark[] }) =>
    (cell.content || []).map((m) => m.text).join("");
  const setHeader = (i: number, text: string) =>
    update({
      ...block,
      headers: headers.map((h, ix) => (ix === i ? { content: [{ text }] } : h)),
    });
  const setCell = (r: number, c: number, text: string) =>
    update({
      ...block,
      rows: rows.map((row, ri) =>
        ri === r
          ? {
              cells: row.cells.map((cell, ci) =>
                ci === c ? { content: [{ text }] } : cell,
              ),
            }
          : row,
      ),
    });
  const addRow = () =>
    update({
      ...block,
      rows: [...rows, { cells: headers.map(() => ({ content: [{ text: "" }] })) }],
    });
  const addCol = () =>
    update({
      ...block,
      headers: [...headers, { content: [{ text: "" }] }],
      rows: rows.map((r) => ({
        cells: [...r.cells, { content: [{ text: "" }] }],
      })),
    });
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="border border-gray-200 bg-white p-0">
                <input
                  value={cellText(h)}
                  onChange={(e) => setHeader(i, e.target.value)}
                  placeholder="Header"
                  className="w-full bg-transparent px-2 py-1.5 font-semibold text-gray-800 outline-none"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.cells.map((cell, c) => (
                <td key={c} className="border border-gray-200 bg-white p-0">
                  <input
                    value={cellText(cell)}
                    onChange={(e) => setCell(r, c, e.target.value)}
                    className="w-full bg-transparent px-2 py-1.5 text-gray-700 outline-none"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex gap-3">
        <button onClick={addRow} className="text-xs font-medium hover:underline" style={{ color: PINK }}>+ Row</button>
        <button onClick={addCol} className="text-xs font-medium hover:underline" style={{ color: PINK }}>+ Column</button>
      </div>
    </div>
  );
}

/* ------------------------- Rendered marks & document view ------------------------- */

function Marks({ content }: { content?: Mark[] }) {
  return (
    <>
      {(content || []).map((m, i) => {
        const style = m.color ? { color: m.color } : undefined;
        let inner: React.ReactNode = m.text;
        if (m.underline) inner = <u>{inner}</u>;
        if (m.italic) inner = <em>{inner}</em>;
        if (m.bold)
          return (
            <strong key={i} style={style} className="font-semibold text-gray-900">
              {inner}
            </strong>
          );
        return (
          <span key={i} style={style}>
            {inner}
          </span>
        );
      })}
    </>
  );
}

function DocBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b) => {
        if (b.type === "heading") {
          const size =
            (b.level || 2) <= 1
              ? "text-2xl"
              : b.level === 2
                ? "text-xl"
                : "text-base";
          return (
            <h3 key={b._id} className={`${size} mb-2 mt-6 font-bold text-gray-900 first:mt-0`}>
              <Marks content={b.content} />
            </h3>
          );
        }
        if (b.type === "paragraph")
          return (
            <p key={b._id} className="mb-3 leading-relaxed">
              <Marks content={b.content} />
            </p>
          );
        if (b.type === "bulletList" || b.type === "numberedList")
          return (
            <div key={b._id} className="mb-3 space-y-2">
              {(b.items || []).map((it, j) => (
                <div key={j} className="flex gap-2.5">
                  <span className="shrink-0" style={{ color: PINK }}>
                    {b.type === "numberedList" ? `${j + 1}.` : "•"}
                  </span>
                  <span className="leading-relaxed">
                    <Marks content={it.content} />
                  </span>
                </div>
              ))}
            </div>
          );
        if (b.type === "quote")
          return (
            <div
              key={b._id}
              className="mb-3 rounded-xl px-4 py-3 text-sm font-medium leading-relaxed"
              style={{ background: "#FCE4EC", color: "#C2185B" }}
            >
              <Marks content={b.content} />
            </div>
          );
        if (b.type === "divider")
          return <hr key={b._id} className="my-5 border-gray-200" />;
        if (b.type === "table")
          return (
            <table key={b._id} className="mb-3 w-full border-collapse text-sm">
              <thead>
                <tr>
                  {(b.headers || []).map((h, j) => (
                    <th key={j} className="border border-gray-200 bg-gray-50 px-3 py-1.5 text-left font-semibold text-gray-900">
                      <Marks content={h.content} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(b.rows || []).map((r, ri) => (
                  <tr key={ri}>
                    {r.cells.map((c, ci) => (
                      <td key={ci} className="border border-gray-200 bg-white px-3 py-1.5">
                        <Marks content={c.content} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        return null;
      })}
    </>
  );
}

/* ============================================================
   INNER PAGE (context consumer)
   ============================================================ */

const BLOCK_BUTTONS: [Block["type"], string][] = [
  ["heading", "Heading"],
  ["paragraph", "Paragraph"],
  ["bulletList", "Bullets"],
  ["numberedList", "Numbered"],
  ["quote", "Callout"],
  ["divider", "Divider"],
  ["table", "Table"],
];

function LegalPoliciesInner() {
  const {
    pages,
    loading,
    loaded,
    error,
    savingType,
    fetchPages,
    savePage,
  } = useLegalPolicies();

  const [docs, setDocs] = useState<Record<string, LegalDoc>>({});
  const [hydrated, setHydrated] = useState(false);
  const [openType, setOpenType] = useState<LegalPageType | null>(null);
  const [viewType, setViewType] = useState<LegalPageType | null>(null);
  const [savedType, setSavedType] = useState<LegalPageType | null>(null);
  const [saveError, setSaveError] = useState<{
    type: LegalPageType;
    message: string;
  } | null>(null);

  /* Mount pe API se load */
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  /* API data aane par editor state hydrate (sirf pehli baar,
     taaki editing ke beech data clobber na ho) */
  useEffect(() => {
    if (!loaded || hydrated) return;
    const d: Record<string, LegalDoc> = {};
    for (const row of ROWS) {
      const saved = pages[row.pageType];
      d[row.pageType] = saved
        ? {
            title: saved.title,
            blocks: withIds(saved.content?.blocks || []),
          }
        : { title: row.title, blocks: [] };
    }
    setDocs(d);
    setHydrated(true);
  }, [loaded, hydrated, pages]);

  const setDoc = (t: LegalPageType, next: LegalDoc) =>
    setDocs((d) => ({ ...d, [t]: next }));
  const setBlocks = (t: LegalPageType, fn: (b: Block[]) => Block[]) =>
    setDocs((d) => ({ ...d, [t]: { ...d[t], blocks: fn(d[t].blocks) } }));

  const updateBlock = (t: LegalPageType, id: string, next: Block) =>
    setBlocks(t, (bs) => bs.map((b) => (b._id === id ? { ...next, _id: id } : b)));
  const deleteBlock = (t: LegalPageType, id: string) =>
    setBlocks(t, (bs) => bs.filter((b) => b._id !== id));
  const moveBlock = (t: LegalPageType, id: string, dir: number) =>
    setBlocks(t, (bs) => {
      const i = bs.findIndex((b) => b._id === id);
      const j = i + dir;
      if (j < 0 || j >= bs.length) return bs;
      const copy = [...bs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const addBlock = (t: LegalPageType, type: Block["type"]) => {
    const base = { _id: nid(), type } as Block;
    let b: Block;
    if (type === "heading") b = { ...base, level: 2, content: [{ text: "" }] };
    else if (type === "paragraph" || type === "quote")
      b = { ...base, content: [{ text: "" }] };
    else if (type === "bulletList" || type === "numberedList")
      b = { ...base, items: [{ content: [{ text: "" }] }] };
    else if (type === "table")
      b = {
        ...base,
        headers: [{ content: [{ text: "" }] }, { content: [{ text: "" }] }],
        rows: [{ cells: [{ content: [{ text: "" }] }, { content: [{ text: "" }] }] }],
      };
    else b = base; // divider
    setBlocks(t, (bs) => [...bs, b]);
  };

  /* ---------- SAVE → POST /legal-pages ---------- */
  const onSave = async (t: LegalPageType) => {
    const doc = docs[t];
    if (!doc) return;
    setSaveError(null);
    setSavedType(null);

    const result = await savePage(t, doc.title, stripIds(doc.blocks));

    if (result.success) {
      setSavedType(t);
      setTimeout(() => setSavedType(null), 2500);
    } else {
      setSaveError({ type: t, message: result.message });
      if (result.errors) console.error("Validation errors:", result.errors);
    }
  };

  const exec = (cmd: string, val?: string) => {
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(cmd, false, val);
  };

  /* ---------------- VIEW MODE ---------------- */
  if (viewType) {
    const doc = docs[viewType];
    const meta = ROWS.find((r) => r.pageType === viewType)!;
    return (
      <DefaultLayout>
        <div className="min-h-screen" style={{ background: "#F5F4F1" }}>
          <div className="max-w-8xl mx-auto px-4 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-4">
              <button
                onClick={() => setViewType(null)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                <span className="text-lg leading-none">‹</span> Legal &amp; Policies
              </button>
              <button
                onClick={() => {
                  setOpenType(viewType);
                  setViewType(null);
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                style={{ background: PINK }}
              >
                Edit document
              </button>
            </div>

            <div className="w-full pb-12">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg">
                    {meta.icon}
                  </span>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {doc?.title || meta.title}
                    </p>
                    <p className="text-xs text-gray-400">{meta.subtitle}</p>
                  </div>
                </div>
                <div className="px-6 py-6 text-[15px] text-gray-700">
                  {!doc || doc.blocks.length === 0 ? (
                    <p className="py-10 text-center text-sm text-gray-400">
                      No content yet — Edit document se sections add karo
                    </p>
                  ) : (
                    <DocBlocks blocks={doc.blocks} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  /* ---------------- LIST MODE ---------------- */
  return (
    <DefaultLayout>
      <div className="min-h-screen" style={{ background: "#F5F4F1" }}>
        <style>{`.empty-ph:empty:before{content:attr(data-placeholder);color:#B9B4AD}`}</style>

        <div className="max-w-8xl mx-auto px-4 md:px-8">
          {/* Hint + action */}
          <div className="flex flex-wrap items-center gap-4 px-1 py-4">
            <p className="text-sm text-gray-500">
              Documents members see in the app. Tap one to edit its text.
            </p>
           
          </div>

          {/* API error banner */}
          {error && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                Legal pages load nahi hui: {error}
              </p>
              <button
                onClick={fetchPages}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !hydrated && (
            <div className="space-y-1.5 pb-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center gap-4 rounded-lg bg-white px-4 py-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-48 rounded bg-gray-100" />
                    <div className="h-2.5 w-64 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rows */}
          {hydrated && (
            <div className="space-y-1.5 pb-10">
              {ROWS.map((row) => {
                const t = row.pageType;
                const doc = docs[t];
                const open = openType === t;
                const saving = savingType === t;
                const rowError = saveError?.type === t ? saveError.message : null;
                return (
                 <div key={t} className="rounded-lg bg-white">
                    {/* Row header */}
                    <div className="flex w-full items-center gap-4 px-4 py-3">
                      <button
                        onClick={() => setOpenType(open ? null : t)}
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg leading-none">
                          {row.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-bold text-gray-900">
                            {doc?.title || row.title}
                          </span>
                          <span className="block truncate text-xs text-gray-400">
                            {row.subtitle}
                            {doc && doc.blocks.length > 0 && (
                              <span className="ml-2 text-gray-300">
                                · {doc.blocks.length} blocks
                              </span>
                            )}
                            {pages[t]?.updatedAt && (
                              <span className="ml-2 text-gray-300">
                                · saved{" "}
                                {new Date(pages[t]!.updatedAt).toLocaleDateString()}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>

                      <button
                        onClick={() => setViewType(t)}
                        className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-pink-300 hover:text-pink-600"
                      >
                        View
                      </button>

                      <button
                        onClick={() => setOpenType(open ? null : t)}
                        className="shrink-0 p-1"
                      >
                        <svg
                          className={
                            "h-3.5 w-3.5 text-gray-300 transition-transform " +
                            (open ? "rotate-180" : "")
                          }
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Expanded editor */}
                    {open && doc && (
                      <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900">Edit document</p>
                          <span className="text-[11px] text-gray-400">
                            {doc.blocks.length} blocks
                          </span>
                        </div>

                        <label className="text-[11px] font-semibold tracking-wide text-gray-400">TITLE</label>
                        <input
                          value={doc.title}
                          onChange={(e) => setDoc(t, { ...doc, title: e.target.value })}
                          className="mb-4 mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400"
                        />

                        <label className="text-[11px] font-semibold tracking-wide text-gray-400">CONTENT</label>
                        <div className="sticky top-14 z-30 mb-3 mt-1 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                          <button onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-sm font-bold hover:bg-gray-50">B</button>
                          <button onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-sm italic hover:bg-gray-50">I</button>
                          <button onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-sm underline hover:bg-gray-50">U</button>
                          <span className="mx-1 h-6 w-px bg-gray-200" />
                          {SWATCHES.map((c) => (
                            <button key={c} onMouseDown={(e) => { e.preventDefault(); exec("foreColor", c); }} className="h-6 w-6 rounded-full border-2 border-white ring-1 ring-gray-200" style={{ background: c }} title={c} />
                          ))}
                          <span className="mx-1 h-6 w-px bg-gray-200" />
                          <span className="text-[11px] text-gray-400">Add block:</span>
                          {BLOCK_BUTTONS.map(([type, label]) => (
                            <button key={type} onClick={() => addBlock(t, type)} className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-pink-300 hover:text-pink-600">
                              + {label}
                            </button>
                          ))}
                        </div>

                        {doc.blocks.length === 0 ? (
                          <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
                            <p className="text-sm font-medium text-gray-500">This page has no content yet</p>
                            <p className="mb-4 mt-1 text-xs text-gray-400">Upar ke block buttons se pehla section add karo</p>
                            <button
                              onClick={() => { addBlock(t, "heading"); addBlock(t, "paragraph"); }}
                              className="rounded-lg px-4 py-2 text-xs font-medium text-white"
                              style={{ background: PINK }}
                            >
                              Start with heading + paragraph
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {doc.blocks.map((b) => {
                              const common = {
                                onDelete: () => deleteBlock(t, b._id),
                                onUp: () => moveBlock(t, b._id, -1),
                                onDown: () => moveBlock(t, b._id, 1),
                              };
                              if (b.type === "heading")
                                return (
                                  <BlockShell key={b._id} label="Heading" {...common}
                                    extra={
                                      <select
                                        value={b.level || 2}
                                        onChange={(e) => updateBlock(t, b._id, { ...b, level: +e.target.value as 1 | 2 | 3 | 4 })}
                                        className="rounded border border-gray-200 bg-white px-1 py-0.5 text-[11px] text-gray-500"
                                      >
                                        {[1, 2, 3, 4].map((l) => (<option key={l} value={l}>H{l}</option>))}
                                      </select>
                                    }>
                                    <EditableLine
                                      content={b.content}
                                      onChange={(c) => updateBlock(t, b._id, { ...b, content: c })}
                                      placeholder="Heading…"
                                      className={"font-bold text-gray-900 " + ((b.level || 2) <= 1 ? "text-2xl" : b.level === 2 ? "text-xl" : "text-lg")}
                                    />
                                  </BlockShell>
                                );
                              if (b.type === "paragraph")
                                return (
                                  <BlockShell key={b._id} label="Paragraph" {...common}>
                                    <EditableLine
                                      content={b.content}
                                      onChange={(c) => updateBlock(t, b._id, { ...b, content: c })}
                                      placeholder="Write text…"
                                      className="text-[15px] leading-relaxed text-gray-800"
                                    />
                                  </BlockShell>
                                );
                              if (b.type === "quote")
                                return (
                                  <BlockShell key={b._id} label="Callout" {...common}>
                                    <div className="rounded-xl px-4 py-3" style={{ background: "#FCE4EC" }}>
                                      <EditableLine
                                        content={b.content}
                                        onChange={(c) => updateBlock(t, b._id, { ...b, content: c })}
                                        placeholder="Callout text…"
                                        className="text-sm font-medium"
                                      />
                                    </div>
                                  </BlockShell>
                                );
                              if (b.type === "bulletList" || b.type === "numberedList")
                                return (
                                  <BlockShell key={b._id} label={b.type === "bulletList" ? "Bullet list" : "Numbered list"} {...common}>
                                    <ListEditor block={b} ordered={b.type === "numberedList"} update={(nb) => updateBlock(t, b._id, nb)} />
                                  </BlockShell>
                                );
                              if (b.type === "divider")
                                return (
                                  <BlockShell key={b._id} label="Divider" {...common}>
                                    <hr className="border-gray-300" />
                                  </BlockShell>
                                );
                              if (b.type === "table")
                                return (
                                  <BlockShell key={b._id} label="Table" {...common}>
                                    <TableEditor block={b} update={(nb) => updateBlock(t, b._id, nb)} />
                                  </BlockShell>
                                );
                              return null;
                            })}
                          </div>
                        )}

                        {/* Save error */}
                        {rowError && (
                          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm text-red-600">
                              Save failed: {rowError}
                            </p>
                            <p className="mt-1 text-[11px] text-red-400">
                              Validation error hai to console me details print hui hain
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-5 space-y-2">
                          <button
                            onClick={() => onSave(t)}
                            disabled={saving}
                            className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                            style={{ background: PINK }}
                          >
                            {saving
                              ? "Saving…"
                              : savedType === t
                                ? "Saved ✓"
                                : "Save"}
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setViewType(t)}
                              className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600 hover:border-pink-300 hover:text-pink-600"
                            >
                              View
                            </button>
                            <button
                              onClick={() => setOpenType(null)}
                              className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}

/* ============================================================
   PAGE EXPORT — provider wrap
   ============================================================ */

export default function LegalPoliciesPage() {
  return (
    <LegalPoliciesProvider>
      <LegalPoliciesInner />
    </LegalPoliciesProvider>
  );
}