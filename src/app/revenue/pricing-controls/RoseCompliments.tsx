"use client";

import React, { useState } from "react";
import {
  FEATURE_KEYS,
  ItemType,
  StoreFeature,
  StoreInfo,
  StorePack,
  usePricingController,
} from "../../../context/Pricingcontrollercontext";

/* ================= SMALL BUILDING BLOCKS ================= */

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200 ${
        enabled ? "bg-[#16a34a]" : "bg-gray-300"
      }`}
      aria-pressed={enabled}
    >
      <span
        className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
          enabled ? "left-[23px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function CoinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" fill="#FACC15" stroke="#EAB308" />
      <circle cx="7" cy="7" r="4" fill="#FDE047" stroke="#EAB308" strokeWidth="0.8" />
    </svg>
  );
}

/* Coin input — commits on Enter or blur */
function CoinInput({
  value,
  onChange,
  onCommit,
}: {
  value: number;
  onChange: (v: number) => void;
  onCommit: () => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
      <span className="flex h-9 w-8 items-center justify-center border-r border-gray-200 bg-gray-50">
        <CoinIcon />
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="h-9 w-[64px] border-none bg-transparent pl-2 pr-1 text-sm font-bold text-gray-900 outline-none focus:ring-0"
      />
    </div>
  );
}

/* Rupee input — commits on Enter or blur */
function RupeeInput({
  value,
  onChange,
  onCommit,
}: {
  value: number;
  onChange: (v: number) => void;
  onCommit: () => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
      <span className="flex h-10 w-[30px] shrink-0 items-center justify-center border-r border-gray-200 bg-gray-50">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-yellow-300 text-[9px] font-bold text-yellow-800">
          ₹
        </span>
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="h-10 w-full min-w-0 border-none bg-transparent pl-2.5 pr-1 text-sm font-bold text-gray-900 outline-none focus:ring-0"
      />
    </div>
  );
}

/* ================= REUSABLE ROWS ================= */

function CostRow({
  title,
  note,
  noteHighlight = false,
  value,
  onValueChange,
  onValueCommit,
  enabled,
  onToggle,
}: {
  title: string;
  note: string;
  noteHighlight?: boolean;
  value: number;
  onValueChange: (v: number) => void;
  onValueCommit: () => void;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-[18px]">
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-gray-900">{title}</p>
        {noteHighlight ? (
          <p className="mt-1 inline-block rounded bg-amber-50 px-1 py-px text-[12px] font-semibold text-amber-600">
            {note}
          </p>
        ) : (
          <p className="mt-1 text-[12px] text-gray-400">{note}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <CoinInput
          value={value}
          onChange={onValueChange}
          onCommit={onValueCommit}
        />
        <Toggle enabled={enabled} onChange={onToggle} />
      </div>
    </div>
  );
}

function RevealCostsHeader({ note }: { note: string }) {
  return (
    <div className="pt-4 pb-1">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600">
          Reveal costs
        </p>
        <span className="rounded-full bg-green-50 px-2 py-[2px] text-[10px] font-bold text-green-600">
          Free users only
        </span>
      </div>
      <p className="mt-1 text-[12px] text-amber-500/90">{note}</p>
    </div>
  );
}

/* ================= STORE INFO (why roses/compliments work) ================= */

function InfoRow({
  info,
  isEditing,
  busy,
  onStartEdit,
  onApply,
  onDelete,
  onCancel,
}: {
  info: StoreInfo;
  isEditing: boolean;
  busy: boolean;
  onStartEdit: () => void;
  onApply: (patch: Partial<StoreInfo>) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(info.title);
  const [description, setDescription] = useState(info.description);
  const [tag, setTag] = useState(info.tag);
  const [sortOrder, setSortOrder] = useState(info.sortOrder);
  const [isActive, setIsActive] = useState(info.isActive);

  React.useEffect(() => {
    if (isEditing) {
      setTitle(info.title);
      setDescription(info.description);
      setTag(info.tag);
      setSortOrder(info.sortOrder);
      setIsActive(info.isActive);
    }
  }, [isEditing, info]);

  const inputClass =
    "h-8 w-full rounded-lg border border-gray-200 bg-white px-2 text-[13px] font-semibold text-gray-900 outline-none focus:border-gray-400 focus:ring-0";
  const labelClass = "mb-0.5 block text-[10px] font-semibold text-gray-500";

  /* ---------- EDIT MODE ---------- */
  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-gray-900 bg-white p-3">
        <div className="space-y-2.5">
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[13px] font-medium text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Tag</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. PRIORITY"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-2.5 py-1.5">
            <p className="text-[11px] font-bold text-gray-900">Active</p>
            <Toggle enabled={isActive} onChange={setIsActive} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onApply({
                  title: title.trim(),
                  description: description.trim(),
                  tag: tag.trim(),
                  sortOrder: Number(sortOrder) || 0,
                  isActive,
                })
              }
              className="flex-1 rounded-lg bg-gray-900 py-1.5 text-[12px] font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {busy ? "Saving..." : "Apply"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-200 bg-white py-1.5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {info.id && (
              <button
                type="button"
                disabled={busy}
                onClick={onDelete}
                className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- DISPLAY MODE ---------- */
  return (
    <div
      onClick={onStartEdit}
      className={`group relative cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-gray-300 ${
        info.isActive ? "" : "opacity-50"
      }`}
    >
      <span className="absolute right-3 top-3 hidden rounded-md bg-gray-100 px-2 py-[3px] text-[10px] font-semibold text-gray-500 group-hover:inline-block">
        Edit ✎
      </span>
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-bold text-gray-900">{info.title}</p>
        {info.tag && (
          <span className="rounded-full bg-purple-50 px-2 py-[2px] text-[9px] font-bold tracking-wide text-purple-600">
            {info.tag}
          </span>
        )}
      </div>
      <p className="mt-1 text-[12px] text-gray-400">{info.description}</p>
    </div>
  );
}

function InfoSection({
  itemType,
  label,
  infos,
}: {
  itemType: ItemType;
  label: string;
  infos: StoreInfo[];
}) {
  const { infoBusy, createStoreInfo, updateStoreInfo, deleteStoreInfo } =
    usePricingController();

  // Which info row is in edit mode: id string, or "new" for the add form
  const [editingId, setEditingId] = useState<string | null>(null);

  const blankInfo: StoreInfo = {
    itemType,
    title: "",
    description: "",
    tag: "",
    sortOrder:
      infos.reduce((max, x) => Math.max(max, x.sortOrder), 0) + 1,
    isActive: true,
  };

  return (
    <div className="pt-4">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600">
        {label}
      </p>
      <div className="space-y-2.5">
        {infos.map((info) => (
          <InfoRow
            key={info.id}
            info={info}
            isEditing={editingId === info.id}
            busy={infoBusy}
            onStartEdit={() => setEditingId(info.id ?? null)}
            onApply={async (patch) => {
              if (!info.id) return;
              const ok = await updateStoreInfo(info.id, patch);
              if (ok) setEditingId(null);
            }}
            onDelete={async () => {
              if (!info.id) return;
              const ok = window.confirm(`Delete "${info.title}"?`);
              if (!ok) return;
              const done = await deleteStoreInfo(info.id);
              if (done) setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ))}

        {infos.length === 0 && editingId !== "new" && (
          <p className="text-[12px] text-gray-400">
            No info cards yet — add one below.
          </p>
        )}

        {/* Add new info */}
        {editingId === "new" ? (
          <InfoRow
            info={blankInfo}
            isEditing
            busy={infoBusy}
            onStartEdit={() => {}}
            onApply={async (patch) => {
              const ok = await createStoreInfo({
                ...blankInfo,
                ...patch,
              });
              if (ok) setEditingId(null);
            }}
            onDelete={() => {}}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingId("new")}
            className="w-full rounded-xl border border-dashed border-gray-300 py-2.5 text-[12px] font-semibold text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600"
          >
            + Add info
          </button>
        )}
      </div>
    </div>
  );
}

/* ================= PACK CARD ================= */

function PackCard({
  pack,
  unit,
  isEditing,
  busy,
  onStartEdit,
  onApply,
  onDelete,
  onCancel,
  onPriceChange,
  onPriceCommit,
}: {
  pack: StorePack;
  unit: string;
  isEditing: boolean;
  busy: boolean;
  onStartEdit: () => void;
  onApply: (patch: Partial<StorePack>) => void;
  onDelete: () => void;
  onCancel: () => void;
  onPriceChange: (v: number) => void;
  onPriceCommit: () => void;
}) {
  const [title, setTitle] = useState(pack.title);
  const [quantity, setQuantity] = useState(pack.quantity);
  const [pricePerUnit, setPricePerUnit] = useState(pack.pricePerUnit);
  const [badge, setBadge] = useState<StorePack["badge"]>(pack.badge);
  const [sortOrder, setSortOrder] = useState(pack.sortOrder);
  const [isActive, setIsActive] = useState(pack.isActive);

  // Sync local edit fields whenever edit mode opens or pack data changes
  React.useEffect(() => {
    if (isEditing) {
      setTitle(pack.title);
      setQuantity(pack.quantity);
      setPricePerUnit(pack.pricePerUnit);
      setBadge(pack.badge);
      setSortOrder(pack.sortOrder);
      setIsActive(pack.isActive);
    }
  }, [isEditing, pack]);

  const badgeLabel =
    pack.badge === "BEST_VALUE"
      ? "BEST VALUE"
      : pack.badge === "POPULAR"
        ? "POPULAR"
        : null;

  const handleApply = () => {
    onApply({
      title: title.trim() || pack.title,
      quantity: Number(quantity) || 0,
      pricePerUnit: Number(pricePerUnit) || 0,
      badge,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    });
  };

  const inputClass =
    "h-8 w-full rounded-lg border border-gray-200 bg-white px-2 text-[13px] font-semibold text-gray-900 outline-none focus:border-gray-400 focus:ring-0";
  const labelClass = "mb-0.5 block text-[10px] font-semibold text-gray-500";

  /* ---------- EDIT MODE (inline, inside the card) ---------- */
  if (isEditing) {
    return (
      <div className="relative rounded-xl border-2 border-gray-900 bg-white p-3">
        <div className="space-y-2.5">
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Price/unit (₹)</label>
              <input
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Badge</label>
              <select
                value={badge ?? ""}
                onChange={(e) =>
                  setBadge(
                    e.target.value === ""
                      ? null
                      : (e.target.value as StorePack["badge"]),
                  )
                }
                className={inputClass}
              >
                <option value="">None</option>
                <option value="POPULAR">POPULAR</option>
                <option value="BEST_VALUE">BEST VALUE</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-2.5 py-1.5">
            <p className="text-[11px] font-bold text-gray-900">Active</p>
            <Toggle enabled={isActive} onChange={setIsActive} />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5">
            <p className="text-[11px] text-gray-500">Total pack</p>
            <p className="text-[13px] font-extrabold text-gray-900">
              ₹{(Number(quantity) || 0) * (Number(pricePerUnit) || 0)}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={handleApply}
              className="flex-1 rounded-lg bg-gray-900 py-1.5 text-[12px] font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {busy ? "Saving..." : "Apply"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-200 bg-white py-1.5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {pack.id && (
              <button
                type="button"
                disabled={busy}
                onClick={onDelete}
                className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- DISPLAY MODE ---------- */
  return (
    <div
      onClick={onStartEdit}
      className={`group relative cursor-pointer rounded-xl border bg-white p-4 transition-colors hover:border-gray-300 ${
        pack.isActive ? "border-gray-200" : "border-gray-200 opacity-50"
      }`}
    >
      {badgeLabel && (
        <span
          className={`absolute -top-[10px] right-3 rounded-md px-2 py-[3px] text-[9px] font-bold tracking-wide text-white ${
            pack.badge === "POPULAR" ? "bg-[#f43f5e]" : "bg-[#f59e0b]"
          }`}
        >
          {badgeLabel}
        </span>
      )}
      {/* Edit hint on hover */}
      <span className="absolute right-3 top-3 hidden rounded-md bg-gray-100 px-2 py-[3px] text-[10px] font-semibold text-gray-500 group-hover:inline-block">
        Edit ✎
      </span>
      <p className="text-[22px] font-extrabold leading-none text-gray-900">
        {pack.quantity}{" "}
        <span className="text-[13px] font-medium text-gray-400">{unit}</span>
      </p>
      <p className="mt-4 text-[12px] text-gray-500">
        Price per {unit.replace(/s$/, "")}
      </p>
      <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
        <RupeeInput
          value={pack.pricePerUnit}
          onChange={onPriceChange}
          onCommit={onPriceCommit}
        />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <p className="text-[12px] text-gray-400">Total pack</p>
        <p className="text-[14px] font-extrabold text-gray-900">
          ₹{pack.quantity * pack.pricePerUnit}
        </p>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function RoseCompliments() {
  const {
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
    updateRoseFeature,
    updateCompFeature,
    updateRosePackPrice,
    updateCompPackPrice,
    saveFeature,
    savePack,
    deleteStorePack,
  } = usePricingController();

  /* Pack edit state — which pack card is in inline edit mode */
  const [editingPack, setEditingPack] = useState<{
    type: "ROSE" | "COMPLIMENT";
    index: number;
  } | null>(null);

  const roseCost = getRoseFeature(FEATURE_KEYS.ROSE_SEND_COST);
  const likedYou = getRoseFeature(FEATURE_KEYS.WHO_LIKED_YOU_REVEAL_COST);
  const compCost = getCompFeature(FEATURE_KEYS.COMPLIMENT_SEND_COST);

  /* Feature: toggle = save immediately; number input = save on Enter/blur */
  const commitFeatureToggle = (feature: StoreFeature, enabled: boolean) => {
    saveFeature({ ...feature, enabled });
  };
  const commitFeatureValue = (feature: StoreFeature) => {
    saveFeature({ ...feature });
  };

  /* Pack: Apply = PATCH immediately; quick price input = PATCH on Enter/blur */
  const applyPack = async (pack: StorePack, patch: Partial<StorePack>) => {
    const merged: StorePack = { ...pack, ...patch };
    merged.totalPrice = merged.quantity * merged.pricePerUnit;
    const ok = await savePack(merged);
    if (ok) setEditingPack(null);
  };

  const commitPackPrice = (pack: StorePack) => {
    savePack({ ...pack, totalPrice: pack.quantity * pack.pricePerUnit });
  };

  const handleDeletePack = async (pack: StorePack) => {
    if (!pack.id) return;
    const ok = window.confirm(`Delete "${pack.title}"?`);
    if (!ok) return;
    const done = await deleteStorePack(pack.id, pack.itemType);
    if (done) setEditingPack(null);
  };

  return (
    <div className="mx-auto max-w-8xl px-6 py-4">
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900">
            Pricing &amp; controls
          </h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Set prices, packs &amp; availability for every paid feature
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
          >
            History
          </button>
          {(saving || infoBusy) && (
            <span className="rounded-lg bg-gray-100 px-4 py-2 text-[13px] font-semibold text-gray-500">
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Cards grid */}
      <div
        className={`grid grid-cols-1 gap-5 xl:grid-cols-2 ${
          loading ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {/* ---------------- Roses ---------------- */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-[20px]">
              🌹
            </span>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Roses</p>
              <p className="text-[12px] text-gray-400">
                Premium attention signal
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 px-5 pb-5">
            <CostRow
              title="Cost per rose"
              note="Deducted from the coin wallet — charged only when balance hits 0"
              noteHighlight
              value={roseCost.intValue}
              onValueChange={(v) =>
                updateRoseFeature(FEATURE_KEYS.ROSE_SEND_COST, { intValue: v })
              }
              onValueCommit={() => commitFeatureValue(roseCost)}
              enabled={roseCost.enabled}
              onToggle={(v) => {
                updateRoseFeature(FEATURE_KEYS.ROSE_SEND_COST, { enabled: v });
                commitFeatureToggle(roseCost, v);
              }}
            />

            <RevealCostsHeader note="Premium & VIP members see these for free — coins charged to free users only" />

            <CostRow
              title="See who liked you"
              note="Unlock one admirer in Sparks · Admirers"
              value={likedYou.intValue}
              onValueChange={(v) =>
                updateRoseFeature(FEATURE_KEYS.WHO_LIKED_YOU_REVEAL_COST, {
                  intValue: v,
                })
              }
              onValueCommit={() => commitFeatureValue(likedYou)}
              enabled={likedYou.enabled}
              onToggle={(v) => {
                updateRoseFeature(FEATURE_KEYS.WHO_LIKED_YOU_REVEAL_COST, {
                  enabled: v,
                });
                commitFeatureToggle(likedYou, v);
              }}
            />

            {/* Why roses work — info cards */}
            <InfoSection
              itemType="ROSE"
              label="Why roses work · Info"
              infos={roseInfo}
            />

            <div className="pt-4">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600">
                Rose packs · Set price per rose
              </p>
              {rosePacks.length === 0 && !loading ? (
                <p className="text-[12px] text-gray-400">
                  No rose packs yet — create from backend.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {rosePacks.map((pack, i) => (
                    <PackCard
                      key={pack.id ?? `rose-${i}`}
                      pack={pack}
                      unit="roses"
                      busy={saving}
                      isEditing={
                        editingPack?.type === "ROSE" &&
                        editingPack?.index === i
                      }
                      onStartEdit={() =>
                        setEditingPack({ type: "ROSE", index: i })
                      }
                      onApply={(patch) => applyPack(pack, patch)}
                      onDelete={() => handleDeletePack(pack)}
                      onCancel={() => setEditingPack(null)}
                      onPriceChange={(v) => updateRosePackPrice(i, v)}
                      onPriceCommit={() => commitPackPrice(rosePacks[i])}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- Compliments ---------------- */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-[20px]">
              ❤️
            </span>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Compliments</p>
              <p className="text-[12px] text-gray-400">
                Message-with-like attention
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 px-5 pb-5">
            <CostRow
              title="Cost per compliment"
              note="Deducted from the coin wallet — charged only when balance hits 0"
              noteHighlight
              value={compCost.intValue}
              onValueChange={(v) =>
                updateCompFeature(FEATURE_KEYS.COMPLIMENT_SEND_COST, {
                  intValue: v,
                })
              }
              onValueCommit={() => commitFeatureValue(compCost)}
              enabled={compCost.enabled}
              onToggle={(v) => {
                updateCompFeature(FEATURE_KEYS.COMPLIMENT_SEND_COST, {
                  enabled: v,
                });
                commitFeatureToggle(compCost, v);
              }}
            />

            {/* Compliment templates row */}
            <div className="flex items-center justify-between gap-4 py-[18px]">
              <div>
                <p className="text-[14px] font-bold text-gray-900">
                  Compliment templates
                </p>
                <p className="mt-1 text-[12px] text-gray-400">
                  Edit the in-app library — categories &amp; messages
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg bg-purple-100 px-4 py-2 text-[13px] font-semibold text-purple-600 hover:bg-purple-200"
              >
                Manage →
              </button>
            </div>

            {/* Why compliments work — info cards */}
            <InfoSection
              itemType="COMPLIMENT"
              label="Why compliments work · Info"
              infos={compInfo}
            />

            <div className="pt-4">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600">
                Compliment packs · Set price per compliment
              </p>
              {compPacks.length === 0 && !loading ? (
                <p className="text-[12px] text-gray-400">
                  No compliment packs yet — create from backend.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {compPacks.map((pack, i) => (
                    <PackCard
                      key={pack.id ?? `comp-${i}`}
                      pack={pack}
                      unit="compliments"
                      busy={saving}
                      isEditing={
                        editingPack?.type === "COMPLIMENT" &&
                        editingPack?.index === i
                      }
                      onStartEdit={() =>
                        setEditingPack({ type: "COMPLIMENT", index: i })
                      }
                      onApply={(patch) => applyPack(pack, patch)}
                      onDelete={() => handleDeletePack(pack)}
                      onCancel={() => setEditingPack(null)}
                      onPriceChange={(v) => updateCompPackPrice(i, v)}
                      onPriceCommit={() => commitPackPrice(compPacks[i])}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}