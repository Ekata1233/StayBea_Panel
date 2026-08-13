"use client";

import React, { useMemo, useState } from "react";
import {
  useBoostSuper,
  BoostSuperProvider,
  type TierKey,
  type BoostTier,
} from "@/context/BoostSuperContext";

/* ================= Icons ================= */

const RocketIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.5 16.5C3 17.76 3 21 3 21C3 21 6.24 21 7.5 19.5C8.21 18.66 8.2 17.37 7.41 16.59C7.02 16.22 6.51 16.005 5.97 15.985C5.43 15.965 4.9 16.15 4.5 16.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15L9 12C9.53 10.62 10.2 9.3 11 8.05C12.17 6.19 13.8 4.66 15.73 3.6C17.66 2.55 19.83 2 22 2C22 4.17 21.45 6.34 20.4 8.27C19.34 10.2 17.81 11.83 15.95 13C14.7 13.8 13.38 14.47 12 15Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12H4C4 12 4.55 8.97 6 8C7.62 6.93 11 8 11 8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15V20C12 20 15.03 19.45 16 18C17.07 16.38 16 13 16 13"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BoltIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13 2L4.09 12.11C3.74 12.51 3.56 12.71 3.56 12.88C3.55 13.03 3.62 13.17 3.74 13.26C3.88 13.37 4.14 13.37 4.67 13.37H12L11 22L19.91 11.89C20.26 11.49 20.44 11.29 20.44 11.12C20.45 10.97 20.38 10.83 20.26 10.74C20.12 10.63 19.86 10.63 19.33 10.63H12L13 2Z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 6.5L4.5 9L10 3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 001 1h10a1 1 0 001-1l1-13M9 7V4h6v3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ================= Small UI Pieces ================= */

const Toggle = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    aria-pressed={enabled}
    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
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

const UnitInput = ({
  unit,
  value,
  onChange,
  width = "w-20",
  align = "text-right",
}: {
  unit: string;
  value: number;
  onChange: (n: number) => void;
  width?: string;
  align?: string;
}) => (
  <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
    {unit ? (
      <span className="flex items-center bg-gray-50 px-3 text-xs font-medium text-gray-400 dark:bg-white/5 dark:text-gray-500">
        {unit}
      </span>
    ) : null}
    <input
      type="number"
      min={0}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`h-10 ${width} border-l border-gray-200 bg-white px-3 ${align} text-sm font-bold text-gray-900 outline-none dark:border-gray-700 dark:bg-transparent dark:text-white`}
    />
  </div>
);
const NumField = ({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (n: number) => void;
}) => (
  <label className="block min-w-0">
    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
      {label}
    </span>
    <div className="flex h-9 items-stretch overflow-hidden rounded-lg border border-gray-200 focus-within:border-gray-300 dark:border-gray-700">
      <span className="flex items-center bg-gray-50 px-2 text-[11px] font-medium text-gray-400 dark:bg-white/5 dark:text-gray-500">
        {unit}
      </span>
      <input
        type="number"
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full min-w-0 border-l border-gray-200 bg-white px-2 text-sm font-bold text-gray-900 outline-none dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
    </div>
  </label>
);
const TextInput = ({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <input
    type="text"
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className={`h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-300 focus:border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-white ${className}`}
  />
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
    {children}
  </p>
);

/* ================= Inner Component ================= */

function BoostsSuperBoostsInner() {
  const {
    tiers,
    loading,
    saving,
    error,
    dirty,
    refresh,
    saveTier,
    updateTier,
    updateOption,
    addOption,
    removeOption,
    setOptionBadge,
    updateWhy,
    addWhy,
    removeWhy,
    updateComparisonTitle,
    updateComparisonRow,
    addComparisonRow,
    removeComparisonRow,
  } = useBoostSuper();

  const [activeTab, setActiveTab] = useState<TierKey>("BOOST");
  const tier: BoostTier = tiers[activeTab];
  const isBoost = activeTab === "BOOST";

  const formatINR = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

  const tabs = useMemo(
    () =>
      [
        { key: "BOOST" as TierKey, label: "Boost", icon: <RocketIcon /> },
        { key: "SUPER_BOOST" as TierKey, label: "Super Boost", icon: <BoltIcon /> },
      ] as const,
    []
  );

  /* -------- settings rows are now derived from real API fields -------- */
  const settingRows = [
    {
      key: "boostDuration",
      title: isBoost ? "Boost duration" : "Super Boost duration",
      subtitle: `How long one ${isBoost ? "Boost" : "Super Boost"} stays active`,
      unit: "min",
      value: tier.boostDuration,
    },
    {
      key: "singleBoostWalletPrice",
      title: `Single ${isBoost ? "boost" : "super boost"} · wallet price`,
      subtitle: "Deducted from the coin wallet — charged only when balance hits 0",
      subtitleHighlight: true,
      unit: "🪙",
      value: tier.singleBoostWalletPrice,
    },
    {
      key: "visibilityMultiplier",
      title: "Visibility multiplier",
      subtitle: "Profile shown this many × more",
      unit: "×",
      value: tier.visibilityMultiplier,
    },
  ] as const;

  if (loading) {
    return (
      <div className="mx-auto max-w-8xl px-6 py-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-white/[0.03]">
          Loading boost packages…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl px-6 py-4">
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* ---------- Header ---------- */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-200">
              <RocketIcon />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Boosts &amp; Super Boosts
              </h3>
              <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
                Visibility multiplier · set each tier separately
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {tier.is_active ? "Live" : "Hidden"}
            </span>
            <Toggle
              enabled={tier.is_active}
              onChange={() => updateTier(activeTab, { is_active: !tier.is_active })}
            />
          </div>
        </div>

        {error ? (
          <div className="mx-6 mt-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void refresh()}
              className="shrink-0 rounded-md border border-red-300 px-2.5 py-1 text-xs font-semibold dark:border-red-500/40"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="px-6 pb-6 pt-5">
          {/* ---------- Tabs ---------- */}
          <div className="flex rounded-2xl bg-[#f5f1ea] p-1.5 dark:bg-white/5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                      : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  }`}
                >
                  <span className={tab.key === "BOOST" ? "text-orange-500" : "text-amber-500"}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  {dirty[tab.key] ? (
                    <span className="ml-1 h-1.5 w-1.5 rounded-full bg-pink-500" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {tier.isNew ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              This tier does not exist on the server yet. Fill it in and save to create it.
            </p>
          ) : null}

          {/* ---------- Pack identity ---------- */}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <SectionLabel>Package title</SectionLabel>
              <TextInput
                value={tier.title}
                onChange={(v) => updateTier(activeTab, { title: v })}
                placeholder="Boost Package"
                className="mt-2 w-full"
              />
            </div>
            <div>
              <SectionLabel>Description</SectionLabel>
              <TextInput
                value={tier.description}
                onChange={(v) => updateTier(activeTab, { description: v })}
                placeholder="Increase your profile visibility"
                className="mt-2 w-full"
              />
            </div>
          </div>

          {/* ---------- Setting Rows ---------- */}
          <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
            {settingRows.map((row) => (
              <div
                key={row.key}
                className="flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {row.title}
                  </p>
                  {"subtitleHighlight" in row && row.subtitleHighlight ? (
                    <p className="mt-1 inline-block rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      {row.subtitle}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      {row.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <UnitInput
                    unit={row.unit}
                    value={row.value}
                    onChange={(n) => updateTier(activeTab, { [row.key]: n } as Partial<BoostTier>)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ---------- What The Member Gets (whyBoostWorks) ---------- */}
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <SectionLabel>What The Member Gets</SectionLabel>
              <button
                type="button"
                onClick={() => addWhy(activeTab)}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                + Add benefit
              </button>
            </div>

            {tier.whyBoostWorks.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-400 dark:border-gray-700">
                No benefits yet. Add the first one.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {tier.whyBoostWorks.map((w, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-400">
                      <CheckIcon />
                    </span>
                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_110px_90px]">
                      <TextInput
                        value={w.title}
                        onChange={(v) => updateWhy(activeTab, i, { title: v })}
                        placeholder="Headline"
                        className="w-full font-bold"
                      />
                      <TextInput
                        value={w.description}
                        onChange={(v) => updateWhy(activeTab, i, { description: v })}
                        placeholder="Supporting line"
                        className="w-full"
                      />
                      <TextInput
                        value={w.tag ?? ""}
                        onChange={(v) => updateWhy(activeTab, i, { tag: v })}
                        placeholder="Tag"
                        className="w-full"
                      />
                      <div className="flex items-center gap-2">
                        
                        <button
                          type="button"
                          onClick={() => removeWhy(activeTab, i)}
                          aria-label="Remove benefit"
                          className="shrink-0 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        >
                          <TrashIcon />
                        </button> 
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ---------- Packs (options) ---------- */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <SectionLabel>
                {isBoost ? "Boost Packs" : "Super Boost Packs"} · Set price per boost
              </SectionLabel>
              <button
                type="button"
                onClick={() => addOption(activeTab)}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                + Add pack
              </button>
            </div>

            {tier.options.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-400 dark:border-gray-700">
                No packs yet. Add the first pack.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {tier.options.map((pack, index) => {
                  const base = (pack.boostCount || 0) * (pack.pricePerBoost || 0);
                  const pays = pack.discounted_price || 0;
                  const offPct =
                    base > 0 && pays > 0 && pays < base
                      ? Math.round(((base - pays) / base) * 100)
                      : 0;

                  return (
                    <div
                      key={pack.id ?? index}
                      className={`relative rounded-2xl border bg-white p-4 dark:bg-white/[0.02] ${
                        pack.is_active
                          ? "border-gray-200 dark:border-gray-800"
                          : "border-dashed border-gray-300 opacity-60 dark:border-gray-700"
                      }`}
                    >
                      {(pack.is_popular || pack.is_best_value) && (
                        <span className="absolute -top-2.5 right-4 rounded-full bg-pink-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          {pack.is_best_value ? "BEST VALUE" : "POPULAR"}
                        </span>
                      )}

                      {/* header */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-gray-900 dark:text-white">
                          <span className="text-xl font-bold">{pack.boostCount}</span>{" "}
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            boosts
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => removeOption(activeTab, index)}
                          aria-label="Remove pack"
                          className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      {/* fields · 2 per row */}
                      <div className="mt-3 grid grid-cols-2 gap-2.5">
                        <label className="col-span-2 block min-w-0">
                          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                            Pack label
                          </span>
                          <input
                            type="text"
                            value={pack.label}
                            placeholder="5 Boosts"
                            onChange={(e) =>
                              updateOption(activeTab, index, { label: e.target.value })
                            }
                            className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-300 focus:border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-white"
                          />
                        </label>

                        <NumField
                          label="Boost count"
                          unit="#"
                          value={pack.boostCount}
                          onChange={(n) => updateOption(activeTab, index, { boostCount: n })}
                        />
                        <NumField
                          label="Time / boost"
                          unit="min"
                          value={pack.timePerBoost}
                          onChange={(n) => updateOption(activeTab, index, { timePerBoost: n })}
                        />

                        <NumField
                          label="Price / boost"
                          unit="₹"
                          value={pack.pricePerBoost}
                          onChange={(n) =>
                            updateOption(activeTab, index, { pricePerBoost: n })
                          }
                        />
                        <NumField
                          label="Selling price"
                          unit="₹"
                          value={pack.discounted_price}
                          onChange={(n) =>
                            updateOption(activeTab, index, { discounted_price: n })
                          }
                        />
                      </div>

                      {/* totals · single line */}
                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-gray-800">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                          Member pays
                        </span>
                        <span className="flex items-baseline gap-1.5">
                          {offPct > 0 && (
                            <span className="text-[11px] text-gray-400 line-through dark:text-gray-500">
                              {formatINR(base)}
                            </span>
                          )}
                          <span className="text-base font-bold text-green-600 dark:text-green-400">
                            {formatINR(pays)}
                          </span>
                          {offPct > 0 && (
                            <span className="text-[10px] font-semibold text-gray-400">
                              −{offPct}%
                            </span>
                          )}
                        </span>
                      </div>

                      {/* badges + active · one row */}
                      <div className="mt-2.5 flex items-center gap-2 border-t border-gray-100 pt-2.5 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => setOptionBadge(activeTab, index, "is_popular")}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                            pack.is_popular
                              ? "bg-pink-500 text-white"
                              : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500"
                          }`}
                        >
                          Popular
                        </button>
                        <button
                          type="button"
                          onClick={() => setOptionBadge(activeTab, index, "is_best_value")}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                            pack.is_best_value
                              ? "bg-pink-500 text-white"
                              : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500"
                          }`}
                        >
                          Best value
                        </button>
                        <div className="ml-auto">
                          <Toggle
                            enabled={pack.is_active}
                            onChange={() =>
                              updateOption(activeTab, index, { is_active: !pack.is_active })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---------- Boost vs Super Boost ---------- */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <SectionLabel>Comparison table</SectionLabel>
              <button
                type="button"
                onClick={() => addComparisonRow(activeTab)}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                + Add row
              </button>
            </div>

            <TextInput
              value={tier.boostVsSuperBoost.title}
              onChange={(v) => updateComparisonTitle(activeTab, v)}
              placeholder="What's the difference?"
              className="mt-3 w-full font-bold md:max-w-sm"
            />

            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 bg-[#f5f1ea] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-white/5 dark:text-gray-400">
                <span>Feature</span>
                <span>Boost</span>
                <span>Super Boost</span>
                <span />
              </div>
              {tier.boostVsSuperBoost.features.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-gray-400">
                  No comparison rows yet.
                </p>
              ) : (
                tier.boostVsSuperBoost.features.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-2 border-t border-gray-100 px-4 py-2.5 dark:border-gray-800"
                  >
                    <TextInput
                      value={row.feature}
                      onChange={(v) => updateComparisonRow(activeTab, i, { feature: v })}
                      placeholder="Duration"
                      className="w-full"
                    />
                    <TextInput
                      value={row.boost}
                      onChange={(v) => updateComparisonRow(activeTab, i, { boost: v })}
                      placeholder="30 min"
                      className="w-full"
                    />
                    <TextInput
                      value={row.super}
                      onChange={(v) => updateComparisonRow(activeTab, i, { super: v })}
                      placeholder="3 hours"
                      className="w-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeComparisonRow(activeTab, i)}
                      aria-label="Remove row"
                      className="justify-self-center rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ---------- Sticky save bar ---------- */}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-gray-100 bg-white/90 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {dirty[activeTab] ? "Unsaved changes" : "All changes saved"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={saving !== null}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => void saveTier(activeTab)}
              disabled={saving !== null || !dirty[activeTab]}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-gray-900"
            >
              {saving === activeTab ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Export ================= */

export default function BoostsSuperBoosts() {
  return (
    <BoostSuperProvider>
      <BoostsSuperBoostsInner />
    </BoostSuperProvider>
  );
}