"use client";

import React, { useEffect, useState } from "react";
import {
  useDatePlan,
  type InfoItem,
  type DatePlanPackage,
} from "@/context/DatePlanContext";

/* ================= Icons ================= */

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.5 9.5H20.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 3V6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M16 3V6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <text x="12" y="17.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">
      31
    </text>
  </svg>
);

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
  >
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ================= Small UI Pieces ================= */

const Toggle = ({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    aria-pressed={enabled}
    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
      enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
        enabled ? "left-[22px]" : "left-0.5"
      }`}
    />
  </button>
);

const SaveButton = ({
  onClick,
  loading,
  disabled,
  label = "Save",
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading || disabled}
    className="h-10 shrink-0 rounded-lg bg-pink-500 px-5 text-sm font-bold text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
  >
    {loading ? "Saving…" : label}
  </button>
);

/** Compact labelled field used inside pack cards + info editor. */
const Field = ({
  label,
  prefix,
  ...props
}: {
  label: string;
  prefix?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block min-w-0">
    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
      {label}
    </span>
    <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-200 focus-within:border-pink-400 dark:border-gray-700">
      {prefix && (
        <span className="flex items-center bg-gray-50 px-2.5 text-xs font-medium text-gray-400 dark:bg-white/5 dark:text-gray-500">
          {prefix}
        </span>
      )}
      <input
        {...props}
        className={`h-9 w-full min-w-0 bg-white px-2.5 text-sm font-semibold text-gray-900 outline-none dark:bg-transparent dark:text-white ${
          prefix ? "border-l border-gray-200 dark:border-gray-700" : ""
        } ${props.className ?? ""}`}
      />
    </div>
  </label>
);

/* ================= Pack Card (edit-only, 2-col fields) ================= */

const emptyDraft = (p: DatePlanPackage) => ({
  title: p.title,
  description: p.description,
  planCount: p.planCount,
  pricePerPlan: p.pricePerPlan,
  discount: p.discount,
  sortOrder: p.sortOrder,
});

function PackCard({ pack, badge }: { pack: DatePlanPackage; badge?: string }) {
  const { updatePackage, setPopularPackage, saving } = useDatePlan();
  const [draft, setDraft] = useState(() => emptyDraft(pack));

  useEffect(() => setDraft(emptyDraft(pack)), [pack]);

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  /* ---------- Auto price calculation ---------- */
  const count = Math.max(0, draft.planCount || 0);
  const perPlan = Math.max(0, draft.pricePerPlan || 0);
  const discountPct = Math.min(100, Math.max(0, draft.discount || 0));

  const baseTotal = Number((count * perPlan).toFixed(2));
  const discountAmount = Number(((baseTotal * discountPct) / 100).toFixed(2));
  const finalTotal = Number((baseTotal - discountAmount).toFixed(2));

  const dirty = JSON.stringify(draft) !== JSON.stringify(emptyDraft(pack));
  const busy = saving === pack.id;
  const popularBusy = saving === "popular";
  const formatINR = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const save = () =>
    void updatePackage(pack.id, {
      title: draft.title,
      description: draft.description,
      planCount: count,
      pricePerPlan: perPlan, // list price (pre-discount)
      discount: discountPct,
      price: finalTotal, // always derived — never hand-edited
      sortOrder: draft.sortOrder,
    });

  return (
    <div
      className={`relative rounded-2xl border bg-white p-4 dark:bg-white/[0.02] ${
        pack.isActive
          ? "border-gray-200 dark:border-gray-800"
          : "border-gray-200 opacity-60 dark:border-gray-800"
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-pink-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}

      <p className="text-gray-900 dark:text-white">
        <span className="text-xl font-bold">{count}</span>{" "}
        <span className="text-sm text-gray-400 dark:text-gray-500">plans</span>
      </p>

      {/* ---------- Fields · 2 per row ---------- */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Field
          label="Title"
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <Field
          label="Description"
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
        />

        <Field
          label="1 · Plan count"
          type="number"
          min={1}
          value={draft.planCount}
          onChange={(e) => set("planCount", Number(e.target.value))}
        />
        <Field
          label="2 · Price / plan"
          prefix="₹"
          type="number"
          step="0.01"
          min={0}
          value={draft.pricePerPlan}
          onChange={(e) => set("pricePerPlan", Number(e.target.value))}
        />

        <Field
          label="3 · Discount"
          prefix="%"
          type="number"
          min={0}
          max={100}
          value={draft.discount}
          onChange={(e) => set("discount", Number(e.target.value))}
        />
        <Field
          label="Sort order"
          type="number"
          min={0}
          value={draft.sortOrder}
          onChange={(e) => set("sortOrder", Number(e.target.value))}
        />
      </div>

      {/* ---------- Auto-calculated summary ---------- */}
      <div className="mt-3 space-y-1.5 rounded-xl bg-gray-50 p-3 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {count} × {formatINR(perPlan)}
          </span>
          <span
            className={`text-xs font-medium ${
              discountPct > 0
                ? "text-gray-400 line-through dark:text-gray-500"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {formatINR(baseTotal)}
          </span>
        </div>

        {discountPct > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">
              Discount {discountPct}%
            </span>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              −{formatINR(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 pt-1.5 dark:border-gray-700">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Total pack</span>
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {formatINR(finalTotal)}
          </span>
        </div>
      </div>

      {/* ---------- Status controls · 2 per row ---------- */}
      <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {pack.isActive ? "Active" : "Hidden"}
          </span>
          <Toggle
            enabled={pack.isActive}
            disabled={busy}
            onChange={() => void updatePackage(pack.id, { isActive: !pack.isActive })}
          />
        </div>

        <button
          type="button"
          disabled={pack.isPopular || popularBusy}
          onClick={() => void setPopularPackage(pack.id)}
          className={`h-9 rounded-lg border px-2 text-[11px] font-bold transition-colors disabled:cursor-not-allowed ${
            pack.isPopular
              ? "border-pink-200 bg-pink-50 text-pink-500 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-400"
              : "border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
          }`}
        >
          {pack.isPopular ? "Popular ✓" : "Set popular"}
        </button>
      </div>

      <button
        type="button"
        disabled={!dirty || busy}
        onClick={save}
        className="mt-3 w-full rounded-lg bg-pink-500 py-2.5 text-xs font-bold text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Saving…" : dirty ? "Save changes" : "Saved"}
      </button>
    </div>
  );
}

/* ================= Compact Info Group ================= */

function InfoGroup({
  label,
  items,
  onChange,
}: {
  label: string;
  items: InfoItem[];
  onChange: (next: InfoItem[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const update = (i: number, patch: Partial<InfoItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200">
          {label}
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-white/5 dark:text-gray-400">
            {items.length}
          </span>
        </span>
        <span className="text-gray-400">
          <Chevron open={open} />
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-gray-100 px-3 py-2.5 dark:border-gray-800">
          {items.length === 0 && (
            <p className="py-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
              No items
            </p>
          )}

          {items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]"
            >
              <input
                value={item.title}
                placeholder="Title"
                onChange={(e) => update(i, { title: e.target.value })}
                className="h-8 w-full min-w-0 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 dark:border-gray-700 dark:bg-transparent dark:text-white"
              />
              <input
                value={item.description}
                placeholder="Description"
                onChange={(e) => update(i, { description: e.target.value })}
                className="h-8 w-full min-w-0 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400 dark:border-gray-700 dark:bg-transparent dark:text-white"
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="h-8 rounded-md border border-gray-200 px-2 text-[11px] font-semibold text-gray-400 transition-colors hover:border-red-300 hover:text-red-500 dark:border-gray-700"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => onChange([...items, { title: "", description: "" }])}
            className="w-full rounded-md border border-dashed border-gray-300 py-1.5 text-[11px] font-semibold text-gray-500 transition-colors hover:border-pink-300 hover:text-pink-500 dark:border-gray-700 dark:text-gray-400"
          >
            + Add row
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= Main Component ================= */

function DatePlans() {
  const {
    packages,
    info,
    features,
    loading,
    saving,
    error,
    clearError,
    bestValueId,
    saveFeatures,
    saveInfo,
  } = useDatePlan();

  /* --- 1. features draft --- */
  const [postCost, setPostCost] = useState<number>(0);
  const [postCostEnabled, setPostCostEnabled] = useState<boolean>(false);
  const [postPaidOnly, setPostPaidOnly] = useState<boolean>(false);
  const [boostCost, setBoostCost] = useState<number>(0);
  const [boostEnabled, setBoostEnabled] = useState<boolean>(false);
  const [boostPaidOnly, setBoostPaidOnly] = useState<boolean>(false);

  useEffect(() => {
    setPostCost(features.costToPostPlan);
    setPostCostEnabled(features.costToPostPlanActive);
    setPostPaidOnly(features.costToPostPlanPaidOnly);
    setBoostCost(features.planBoostPrice);
    setBoostEnabled(features.planBoostActive);
    setBoostPaidOnly(features.planBoostPaidOnly);
  }, [features]);

  /* --- 3. info draft --- */
  const [howWorks, setHowWorks] = useState<InfoItem[]>([]);
  const [whyBuy, setWhyBuy] = useState<InfoItem[]>([]);
  const [goodToKnow, setGoodToKnow] = useState<InfoItem[]>([]);

  useEffect(() => {
    setHowWorks(info.howOnePlanWorks);
    setWhyBuy(info.whyPeopleBuyPlans);
    setGoodToKnow(info.goodToKnow);
  }, [info]);

  // NOT persisted — backend field missing
  const [freePlansVipElite, setFreePlansVipElite] = useState<boolean>(true);

  const handleSavePricing = () =>
    void saveFeatures({
      costToPostPlan: postCost,
      costToPostPlanActive: postCostEnabled,
      costToPostPlanPaidOnly: postPaidOnly,
      planBoostPrice: boostCost,
      planBoostActive: boostEnabled,
      planBoostPaidOnly: boostPaidOnly,
    });

  const handleSaveInfo = () =>
    void saveInfo({
      howOnePlanWorks: howWorks.filter((i) => i.title.trim()),
      whyPeopleBuyPlans: whyBuy.filter((i) => i.title.trim()),
      goodToKnow: goodToKnow.filter((i) => i.title.trim()),
    });

  if (loading) {
    return (
      <div className="mx-auto max-w-8xl px-6 py-4">
        <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl px-6 py-4">
      {error && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={clearError}
            className="text-xs font-bold text-red-500 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* ---------- Header ---------- */}
        <div className="flex items-start gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-500 dark:bg-pink-500/10 dark:text-pink-400">
            <CalendarIcon />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Date plans</h3>
              <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pink-500 dark:bg-pink-500/10 dark:text-pink-400">
                Paid Users Only
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
              Post–a–plan in Date Now · available to Premium, VIP &amp; Elite members
            </p>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* ========== 1. FEATURES ========== */}

          {/* Cost to post a plan */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 py-5 dark:border-gray-800">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Cost to post a plan</p>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                Charged per published date plan
              </p>
              <label className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <input
                  type="checkbox"
                  checked={postPaidOnly}
                  onChange={() => setPostPaidOnly((v) => !v)}
                  className="h-3.5 w-3.5 accent-pink-500"
                />
                Paid users only
              </label>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="flex items-center bg-gray-50 px-3 text-xs font-medium text-gray-400 dark:bg-white/5 dark:text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  value={postCost}
                  onChange={(e) => setPostCost(Number(e.target.value))}
                  className="h-10 w-20 border-l border-gray-200 bg-white px-3 text-right text-sm font-bold text-gray-900 outline-none dark:border-gray-700 dark:bg-transparent dark:text-white"
                />
              </div>
              <Toggle enabled={postCostEnabled} onChange={() => setPostCostEnabled((v) => !v)} />
            </div>
          </div>

          {/* Plan boost */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 py-5 dark:border-gray-800">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Plan boost (top of feed)
              </p>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                Optional · pin a plan higher
              </p>
              <label className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <input
                  type="checkbox"
                  checked={boostPaidOnly}
                  onChange={() => setBoostPaidOnly((v) => !v)}
                  className="h-3.5 w-3.5 accent-pink-500"
                />
                Paid users only
              </label>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="flex items-center bg-gray-50 px-3 text-xs font-medium text-gray-400 dark:bg-white/5 dark:text-gray-500">
                  🪙
                </span>
                <input
                  type="number"
                  value={boostCost}
                  onChange={(e) => setBoostCost(Number(e.target.value))}
                  className="h-10 w-20 border-l border-gray-200 bg-white px-3 text-right text-sm font-bold text-gray-900 outline-none dark:border-gray-700 dark:bg-transparent dark:text-white"
                />
              </div>
              <Toggle enabled={boostEnabled} onChange={() => setBoostEnabled((v) => !v)} />
            </div>
          </div>

          {/* Free plans for VIP / Elite */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 py-5 dark:border-gray-800">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Free plans for VIP / Elite
                </p>
                <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  Not saved
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                VIP members post without charge · needs a backend field
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {freePlansVipElite && (
                <span className="text-xs font-semibold text-green-500">On</span>
              )}
              <Toggle
                enabled={freePlansVipElite}
                onChange={() => setFreePlansVipElite((v) => !v)}
              />
            </div>
          </div>

          <div className="flex justify-end border-b border-gray-100 py-4 dark:border-gray-800">
            <SaveButton
              onClick={handleSavePricing}
              loading={saving === "features"}
              label="Save pricing"
            />
          </div>

          {/* ========== 2. PACKS ========== */}
          <div className="border-b border-gray-100 py-5 dark:border-gray-800">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Plan Packs · Edit Only
            </p>

            {packages.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-6 text-center text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                No packs found. Seed them via POST /date-plan-packages before this page is usable.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                {packages.map((pack) => (
                  <PackCard
                    key={pack.id}
                    pack={pack}
                    badge={
                      pack.isPopular
                        ? "POPULAR"
                        : pack.id === bestValueId
                          ? "BEST VALUE"
                          : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* ========== 3. INFO (compact, same card) ========== */}
          <div className="pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Purchase Screen Content
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  Text shown on the buy-plans sheet in the app
                </p>
              </div>
              <SaveButton
                onClick={handleSaveInfo}
                loading={saving === "info"}
                label="Save content"
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5 lg:grid-cols-3">
              <InfoGroup label="How one plan works" items={howWorks} onChange={setHowWorks} />
              <InfoGroup label="Why people buy plans" items={whyBuy} onChange={setWhyBuy} />
              <InfoGroup label="Good to know" items={goodToKnow} onChange={setGoodToKnow} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatePlans;