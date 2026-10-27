"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import {
  ApiPlanDetail,
  PackageProvider,
  usePackages,
} from "@/context/PackageContext";

/* ---------------------------------- icons --------------------------------- */
type IconProps = { className?: string };

const SearchIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const BellIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.857 17.082a24 24 0 0 0 5.454-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.312 6.022 24 24 0 0 0 5.455 1.31m5.714 0a3 3 0 1 1-5.714 0m5.714 0a24 24 0 0 1-5.714 0" />
  </svg>
);

const QuestionIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9.75" />
    <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75" />
    <path d="M12 17.25h.008v.008H12z" />
  </svg>
);

const ChevronLeftIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const LockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const TagIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

const ChartIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 16v-5M12 16V8m4 8v-3" />
  </svg>
);

const BanIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m5.7 5.7 12.6 12.6" />
  </svg>
);

const CardIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const StarIcon = ({ className, filled }: IconProps & { filled?: boolean }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

/* ------------------------- static UI config ------------------------- */
type Accent = {
  toggleOn: string;
  groupBtn: string;
  headerBtn: string;
  headerPill: string;
  unlimitedActive: string;
};

const ROSE_ACCENT: Accent = {
  toggleOn: "bg-rose-500",
  groupBtn: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  headerBtn: "bg-rose-500 hover:bg-rose-600",
  headerPill: "bg-rose-50 text-rose-600",
  unlimitedActive: "border-rose-200 bg-rose-50 text-rose-600",
};

const AMBER_ACCENT: Accent = {
  toggleOn: "bg-amber-500",
  groupBtn: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  headerBtn: "bg-amber-500 hover:bg-amber-600",
  headerPill: "bg-amber-50 text-amber-700",
  unlimitedActive: "border-amber-200 bg-amber-50 text-amber-700",
};

const DARK_ACCENT: Accent = {
  toggleOn: "bg-gray-900",
  groupBtn: "border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200",
  headerBtn: "bg-gray-900 hover:bg-black",
  headerPill: "bg-gray-100 text-gray-800",
  unlimitedActive: "border-gray-300 bg-gray-100 text-gray-800",
};

const STATIC_CONFIG: Record<
  string,
  {
    heroGradient: string;
    accent: Accent;
    poolLocked?: boolean;
    displayName: string;
  }
> = {
  PREMIUM: {
    displayName: "Premium+",
    heroGradient: "bg-gradient-to-br from-[#ec5c80] via-[#e04a6f] to-[#c62a55]",
    accent: ROSE_ACCENT,
  },
  VIP: {
    displayName: "VIP",
    heroGradient: "bg-gradient-to-r from-[#c99a55] via-[#a97b33] to-[#8a611f]",
    accent: AMBER_ACCENT,
  },
  VIP_ELITE: {
    displayName: "VIP Elite",
    heroGradient: "bg-gradient-to-br from-[#2a1216] via-[#141414] to-[#050505]",
    accent: DARK_ACCENT,
    poolLocked: true,
  },
};

const WALL_RULE =
  "pools never mix — Free & Premium members never see VIP / Elite, and chat & events never cross tracks.";

const QUOTA_EMOJI: Record<string, string> = {
  UNLIMITED_LIKES: "❤️",
  WEEKLY_BOOSTS: "🚀",
  ROSES: "⭐",
  WEEKLY_COMPLIMENTS: "💝",
  WEEKLY_DATE_PLANS: "📅",
  REWINDS: "↩️",
  WELCOME_COINS: "🪙",
};
const QUOTA_CODES = [
  "UNLIMITED_LIKES",
  "WEEKLY_BOOSTS",
  "ROSES",
  "WEEKLY_COMPLIMENTS",
  "WEEKLY_DATE_PLANS",
  "REWINDS",
  "WELCOME_COINS",
] as const;

const isQuotaCode = (code: string) =>
  (QUOTA_CODES as readonly string[]).includes(code);

const PERIOD_UNIT: Record<string, string> = {
  DAILY: "/day",
  WEEKLY: "/wk",
  MONTHLY: "/mo",
  NONE: "one-time",
};

const CATEGORY_DISPLAY: Record<string, { emoji: string; title: string }> = {
  MATCH_DISCOVERY: { emoji: "❤️", title: "Match & discovery" },
  CHAT_MESSAGING: { emoji: "💬", title: "Chat & messaging" },
  STATUS_PRIVACY: { emoji: "👑", title: "Status & privacy" },
  TRUST_VERIFICATION: { emoji: "🛡️", title: "Trust & verification" },
  PREMIUM_EXPERIENCES: { emoji: "✨", title: "Premium experiences" },
  NETWORKING: { emoji: "🤝", title: "Networking & growth" },
  PERKS: { emoji: "🎁", title: "Perks & rewards" },
};

/* ------------------------------ helpers ------------------------------ */
const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const monthsLabel = (m: number | "") =>
  m === "" || m <= 0 ? "— months" : m === 1 ? "1 month" : `${m} months`;

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/* ------------------------------ form types ------------------------------ */
type NumField = number | "";

type PriceRow = {
  id: string;
  billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY";
  months: NumField;
  price: NumField; // TOTAL price for the whole period (what user pays)
  isHighlighted: boolean;
  active: boolean;
};

type PriceCalc = {
  months: number;
  total: number; // → PackagePrice.originalPrice
  perMonth: number; // total / months → PackagePrice.price
  original: number | null; // 1-mo price × months (display only, not saved)
  discount: number; // → PackagePrice.discountPercent
  saveAmount: number;
  error: string | null;
};

/**
 * App formula:
 *   original  = 1-month price × months      (699 × 3 = 2,097)
 *   discount  = 1 − total / original        (1 − 1799/2097 = 14%)
 *   per month = total / months              (1799 / 3 ≈ 600)
 */
const calcPrice = (t: PriceRow, base: number | undefined): PriceCalc => {
  const months = typeof t.months === "number" ? t.months : 0;
  const total = typeof t.price === "number" ? t.price : 0;
  const isBase = months === 1;

  const original =
    isBase ? total : base && base > 0 && months > 0 ? base * months : null;

  const discount =
    !isBase && original && total > 0 && total < original
      ? Math.round((1 - total / original) * 100)
      : 0;

  const perMonth = months > 0 ? Math.round(total / months) : 0;

  let error: string | null = null;
  if (months < 1) error = "Months must be at least 1.";
  else if (total <= 0) error = "Total price is required.";
  else if (!isBase && !base) error = "Set the 1-month price first.";
  else if (!isBase && original !== null && total > original)
    error = `Total is higher than ${months} × 1-month price (${inr(original)}) — no saving.`;

  return {
    months,
    total,
    perMonth,
    original,
    discount,
    saveAmount: original ? Math.max(0, original - total) : 0,
    error,
  };
};

type LimitRow = {
  id: string;
  code: string;
  resetPeriodRaw: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
  title: string;
  category: string;
  description: string | null;
  emoji: string;
  unit: string;
  enabled: boolean;
  unlimited: boolean;
  limit: number | null;
};

/* --------------------------------- page ----------------------------------- */
function EditPageInner() {
  const { id: slugParam } = useParams<{ id: string }>();
  const router = useRouter();
  const { fetchPlanBySlug, updatePackage } = usePackages();

  const [detail, setDetail] = React.useState<ApiPlanDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // form state
  const [name, setName] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [badge, setBadge] = React.useState("");
  const [visibility, setVisibility] = React.useState("");
  const [prices, setPrices] = React.useState<PriceRow[]>([]);
  const [limits, setLimits] = React.useState<LimitRow[]>([]);

  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set(),
  );

  const toggleGroupExpand = (category: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchPlanBySlug(slugParam)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setName(d.name);
        setTagline(d.tagline);
        setBadge(d.badgeLabel ?? "");
        setVisibility(d.visibilityRule);
        setPrices(
          [...d.prices]
            .sort((a, b) => (a.months ?? 0) - (b.months ?? 0))
            .map((p) => {
              // DB: price = per month, originalPrice = total for the period
              const raw = p as typeof p & {
                originalPrice?: string | number | null;
              };
              const months =
                p.months ?? (p.billingCycle === "MONTHLY" ? 1 : 0);
              const perMonth = toNum(p.price) ?? 0;
              const total =
                toNum(raw.originalPrice) ?? Math.round(perMonth * months);
              return {
                id: p.id,
                billingCycle: p.billingCycle,
                months: months || "",
                price: total, // form field = TOTAL entered by admin
                isHighlighted: p.isHighlighted,
                active: p.active,
              };
            })
        );
        setLimits(
          d.limits.map((l) => ({
            id: l.id,
            code: l.feature.code,
            resetPeriodRaw: l.resetPeriod,
            title: l.feature.title,
            category: l.feature.category,
            description: l.feature.description,
            emoji: QUOTA_EMOJI[l.feature.code] ?? "⚙️",
            unit: PERIOD_UNIT[l.resetPeriod] ?? "",
            enabled: l.enabled,
            unlimited: l.unlimited,
            limit: l.limit,
          })),
        );
      })
      .catch((e) => {
        if (!cancelled)
          setLoadError(e instanceof Error ? e.message : "Load failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugParam]);

  /* ------ limit (quota) helpers ------ */
  const stepLimit = (id: string, delta: number) =>
    setLimits((prev) =>
      prev.map((l) =>
        l.id === id && !l.unlimited
          ? { ...l, limit: Math.max(0, (l.limit ?? 0) + delta) }
          : l,
      ),
    );

  const toggleUnlimited = (id: string) =>
    setLimits((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, unlimited: !l.unlimited, limit: l.unlimited ? 0 : null }
          : l,
      ),
    );

  /* ------ entitlement helpers ------ */
  const toggleFeatureEnabled = (id: string) =>
    setLimits((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)),
    );

  const setGroupEnabled = (category: string, on: boolean) =>
    setLimits((prev) =>
      prev.map((l) => (l.category === category ? { ...l, enabled: on } : l)),
    );

  const enableAllFeatures = () =>
    setLimits((prev) => prev.map((l) => ({ ...l, enabled: true })));

  /* ------ price helpers ------ */
  const setPriceField = (
    id: string,
    field: "months" | "price",
    raw: string,
  ) =>
    setPrices((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (raw === "") return { ...p, [field]: "" };
        let n = Math.max(0, Number(raw) || 0);
        if (field === "months") n = Math.floor(n);
        return { ...p, [field]: n };
      }),
    );

  const toggleActive = (id: string) =>
    setPrices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );

  // only one tier can be highlighted; clicking the highlighted one clears it
  const setHighlighted = (id: string) =>
    setPrices((prev) =>
      prev.map((p) => ({
        ...p,
        isHighlighted: p.id === id ? !p.isHighlighted : false,
      })),
    );

  const baseRow = prices.find((p) => p.months === 1);
  const baseMonthly =
    baseRow && typeof baseRow.price === "number" ? baseRow.price : undefined;

  const priceCalcs = React.useMemo(
    () => new Map(prices.map((p) => [p.id, calcPrice(p, baseMonthly)])),
    [prices, baseMonthly],
  );
  const pricingErrors = prices.filter(
    (p) => p.active && priceCalcs.get(p.id)?.error,
  );

  /* ------ derived lists ------ */
  const quotaRows = QUOTA_CODES.map((code) =>
    limits.find((l) => l.code === code),
  ).filter((l): l is LimitRow => Boolean(l));

  const entitlementGroups = React.useMemo(() => {
    const map = new Map<string, LimitRow[]>();
    limits.forEach((l) => {
      const arr = map.get(l.category) ?? [];
      arr.push(l);
      map.set(l.category, arr);
    });
    return Array.from(map.entries());
  }, [limits]);

  const enabledCount = limits.filter((l) => l.enabled).length;

  /* ------ save ------ */
  const handleSave = async () => {
    if (!detail) return;
    if (pricingErrors.length > 0) {
      alert("Fix the pricing errors before saving.");
      return;
    }
    setSaving(true);
    try {
      await updatePackage(detail.id, {
        name: detail.name,
        tagline,
        badgeLabel: badge,
        visibilityRule: visibility,
        prices: prices.map((p) => {
          const c = calcPrice(p, baseMonthly);
          return {
            billingCycle: p.billingCycle,
            months: c.months,
            price: c.perMonth, // per month  (1799 / 3 → 600)
            originalPrice: c.total, // total for the period (1799)
            discountPercent: c.discount, // vs 1-month price × months (14)
            isHighlighted: p.isHighlighted,
            active: p.active,
          };
        }),
        limits: limits.map((l) => ({
          featureCode: l.code,
          enabled: l.enabled,
          unlimited: l.unlimited,
          limit: l.unlimited ? null : l.limit,
          resetPeriod: l.resetPeriodRaw,
        })),
      });
      router.push("/revenue/subscriptions");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ------ loading / error states ------ */
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">Loading plan…</div>
    );
  }

  if (loadError || !detail) {
    return (
      <div className="p-8 text-sm text-gray-500">
        Plan not found{loadError ? ` (${loadError})` : ""}.{" "}
        <button
          onClick={() => router.push("/revenue/subscriptions")}
          className="font-semibold text-rose-500 hover:underline"
        >
          Back to all plans
        </button>
      </div>
    );
  }

  const cfg = STATIC_CONFIG[detail.name] ?? STATIC_CONFIG.PREMIUM;
  const offeredCount = prices.filter((p) => p.active).length;

  return (
    <>
      {/* Page top bar ------------------------------------------------------ */}
      <div className="sticky top-0 z-30 flex flex-col gap-3 border-b border-gray-200 bg-[#f7f6f5] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-black">
            Edit {cfg.displayName}
          </h1>
          <p className="mt-0.5 text-sm">
            <button
              onClick={() => router.push("/revenue/subscriptions")}
              className="text-rose-500 hover:underline"
            >
              Membership plans
            </button>
            <span className="text-gray-400"> › </span>
            <span className="text-gray-600">Edit plan</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, IDs, transactions..."
              className="w-full rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-black outline-none placeholder:text-gray-400 focus:border-gray-300 sm:w-72"
            />
          </div>
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <BellIcon className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <QuestionIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-6 py-6 pb-28">
        {/* Hero banner ---------------------------------------------------- */}
        <div className={`rounded-3xl ${cfg.heroGradient} p-8 text-white`}>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/revenue/subscriptions")}
              className="flex items-center gap-1 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition hover:bg-white/25"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              All plans
            </button>
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  detail.active ? "bg-emerald-400" : "bg-gray-300"
                }`}
              />
              {detail.active ? "Live" : "Off"}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold">{cfg.displayName}</h2>
            {badge && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-white/85">{tagline}</p>

          <div className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
            <HeroStat
              label="FROM"
              value={
                typeof baseMonthly === "number"
                  ? `${inr(baseMonthly)}/mo`
                  : "—"
              }
            />
            <HeroStat
              label="POOL"
              value={detail.discoveryPool}
              icon={
                cfg.poolLocked ? (
                  <LockIcon className="h-4 w-4 text-amber-400" />
                ) : undefined
              }
            />
            <HeroStat label="FEATURES" value={`${enabledCount} live`} />
          </div>
        </div>

        {/* Cards grid ------------------------------------------------------ */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {/* left column */}
          <div className="space-y-6">
            {/* ---------- Plan identity & discovery ---------- */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50">
                  <TagIcon className="h-5 w-5 text-rose-500" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Plan identity &amp; discovery
                  </h3>
                  <p className="text-xs text-gray-400">
                    Name, tagline, badge and the pool members join
                  </p>
                </div>
              </div>

              <div className="space-y-5 px-6 py-5">
                <Field label="PLAN NAME">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-rose-300"
                  />
                </Field>

                <Field label="TAGLINE">
                  <textarea
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    rows={2}
                    className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-rose-300"
                  />
                </Field>

                <Field
                  label="BADGE LABEL"
                  hint="shown on the card — leave blank for none"
                >
                  <input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Most popular"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-300"
                  />
                </Field>

                <Field label="DISCOVERY POOL" hint="fixed for this plan">
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-[#f7f5f2] px-4 py-2.5 text-sm text-gray-600">
                    <LockIcon className="h-3.5 w-3.5 text-amber-500" />
                    {detail.discoveryPool}
                  </div>
                </Field>

                <Field
                  label="VISIBILITY RULE"
                  hint="how this plan appears to others"
                >
                  <textarea
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    rows={2}
                    className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-rose-300"
                  />
                </Field>

                <div className="flex items-start gap-2 rounded-xl bg-[#f3efe9] px-4 py-3 text-sm text-gray-600">
                  <BanIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p>
                    <span className="font-bold text-gray-800">Wall rule:</span>{" "}
                    {WALL_RULE}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* right column */}
          <div className="space-y-6">
            {/* ---------- Limits & quotas ---------- */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                  <ChartIcon className="h-5 w-5 text-emerald-600" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Limits &amp; quotas
                  </h3>
                  <p className="text-xs text-gray-400">
                    Set a number or switch to unlimited
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100 px-6">
                {quotaRows.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-base">
                        {l.emoji}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {l.title}
                        </p>
                        <p className="text-xs text-gray-400">{l.unit}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <div
                        className={`flex items-center overflow-hidden rounded-xl border border-gray-200 ${
                          l.unlimited ? "opacity-40" : ""
                        }`}
                      >
                        <button
                          onClick={() => stepLimit(l.id, -1)}
                          disabled={l.unlimited}
                          className="flex h-9 w-9 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="flex h-9 w-12 items-center justify-center bg-white text-sm font-semibold text-gray-900">
                          {l.unlimited ? "∞" : (l.limit ?? 0)}
                        </span>
                        <button
                          onClick={() => stepLimit(l.id, 1)}
                          disabled={l.unlimited}
                          className="flex h-9 w-9 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => toggleUnlimited(l.id)}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          l.unlimited
                            ? cfg.accent.unlimitedActive
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        ∞ Unlimited
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Pricing — full width, 4 cards per row ---------- */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                <CardIcon className="h-5 w-5 text-amber-500" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Pricing</h3>
                <p className="text-xs text-gray-400">
                  Enter months &amp; total price · original, discount &amp;
                  per-month auto-calculated from the 1-month price
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[#f3efe9] px-3 py-1.5 text-xs font-bold text-amber-700">
              {offeredCount}/{prices.length} offered
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
            {prices.map((t) => {
              const c = priceCalcs.get(t.id) ?? calcPrice(t, baseMonthly);
              const isBase = t.billingCycle === "MONTHLY";

              return (
                <div
                  key={t.id}
                  className={`relative flex flex-col rounded-2xl border-2 p-4 pt-5 transition ${
                    t.isHighlighted
                      ? "border-rose-400 bg-rose-50/50"
                      : "border-gray-200 bg-white"
                  } ${t.active ? "" : "opacity-60"}`}
                >
                  {/* SAVE badge — same as app */}
                  {c.discount > 0 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-500 px-3 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      SAVE {c.discount}%
                    </span>
                  )}

                  {/* header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setHighlighted(t.id)}
                        title={
                          t.isHighlighted
                            ? "Remove highlight"
                            : "Highlight this tier in the app"
                        }
                        className="shrink-0 rounded-full p-0.5 transition hover:bg-amber-100"
                      >
                        <StarIcon
                          filled={t.isHighlighted}
                          className="h-5 w-5 text-amber-500"
                        />
                      </button>
                      <p className="truncate text-sm font-bold text-gray-900">
                        {monthsLabel(t.months)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleActive(t.id)}
                      className={`shrink-0 rounded-lg px-3 py-1 text-[11px] font-bold transition ${
                        t.active
                          ? "bg-[#f3efe9] text-amber-700"
                          : "border border-gray-200 bg-white text-gray-400"
                      }`}
                    >
                      {t.active ? "Offered" : "Off"}
                    </button>
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold tracking-widest text-gray-500">
                      {t.billingCycle}
                    </span>
                    {t.isHighlighted && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold tracking-widest text-amber-700">
                        HIGHLIGHTED
                      </span>
                    )}
                  </div>

                  {/* price summary — mirrors the app card */}
                  <div className="mt-4 rounded-xl bg-[#f7f5f2] px-3 py-3 text-center">
                    <p className="text-[10px] font-bold tracking-widest text-gray-500">
                      {c.months || "—"} MO
                    </p>
                    <p className="mt-0.5 text-xl font-bold text-gray-900">
                      {inr(c.total)}
                    </p>
                    {c.original !== null && c.original > c.total && (
                      <p className="text-xs text-gray-400 line-through">
                        {inr(c.original)}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-500">
                      {inr(c.perMonth)}/mo
                    </p>
                  </div>

                  {/* inputs — only months + total */}
                  <div className="mt-4 space-y-3">
                    <PriceInput
                      label="MONTHS"
                      hint={isBase ? "base tier" : undefined}
                      value={t.months}
                      min={1}
                      disabled={isBase}
                      onChange={(v) => setPriceField(t.id, "months", v)}
                      suffix="mo"
                    />
                    <PriceInput
                      label={isBase ? "PRICE (1 MONTH)" : "TOTAL PRICE"}
                      hint={isBase ? "base for all discounts" : undefined}
                      value={t.price}
                      onChange={(v) => setPriceField(t.id, "price", v)}
                      prefix="₹"
                      strong
                    />
                  </div>

                  {/* auto-calculated */}
                  <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3 border-t border-gray-100 pt-3">
                    <CalcStat
                      label="Original"
                      value={c.original !== null ? inr(c.original) : "—"}
                    />
                    <CalcStat label="Per month" value={`${inr(c.perMonth)}/mo`} />
                    <CalcStat
                      label="Discount"
                      value={isBase ? "Base" : `${c.discount}%`}
                      tone={c.discount > 0 ? "good" : undefined}
                    />
                    <CalcStat
                      label="User saves"
                      value={c.saveAmount > 0 ? inr(c.saveAmount) : "—"}
                      tone={c.saveAmount > 0 ? "good" : undefined}
                    />
                  </div>

                  {c.error && t.active && (
                    <p className="mt-2 text-xs font-semibold text-red-500">
                      {c.error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- Feature entitlements ---------- */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-base">
                🏆
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Feature entitlements
                </h3>
                <p className="text-xs text-gray-400">
                  {enabledCount} of {limits.length} app features enabled ·
                  toggle what this plan includes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={enableAllFeatures}
                className={`rounded-full px-4 py-1.5 text-xs font-bold text-white transition ${cfg.accent.headerBtn}`}
              >
                Enable all
              </button>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${cfg.accent.headerPill}`}
              >
                {enabledCount}/{limits.length} on
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
            {entitlementGroups.map(([category, rows]) => {
              const display = CATEGORY_DISPLAY[category] ?? {
                emoji: "⚙️",
                title: category.replace(/_/g, " ").toLowerCase(),
              };
              const onCount = rows.filter((r) => r.enabled).length;
              const allOn = onCount === rows.length;

              const isExpanded = expandedGroups.has(category);
              const alwaysVisible = rows.filter((r) => !isQuotaCode(r.code));
              const hiddenRows = rows.filter((r) => isQuotaCode(r.code));
              const visibleRows = isExpanded
                ? [...alwaysVisible, ...hiddenRows]
                : alwaysVisible;

              return (
                <div
                  key={category}
                  className="rounded-xl border border-gray-200 bg-white"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{display.emoji}</span>
                      <h4 className="text-sm font-bold capitalize text-gray-900">
                        {display.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGroupEnabled(category, !allOn)}
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold transition ${cfg.accent.groupBtn}`}
                      >
                        {allOn ? "Clear all" : "Enable all"}
                      </button>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {onCount}/{rows.length}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {visibleRows.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleFeatureEnabled(item.id)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                          item.enabled ? "bg-white" : "bg-[#faf9f7]"
                        }`}
                      >
                        <FeatureToggle
                          on={item.enabled}
                          onClass={cfg.accent.toggleOn}
                        />
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              item.enabled ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {item.title}
                          </p>
                          {item.description && (
                            <p
                              className={`text-[11px] ${
                                item.enabled ? "text-gray-400" : "text-gray-300"
                              }`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}

                    {hiddenRows.length > 0 && (
                      <button
                        onClick={() => toggleGroupExpand(category)}
                        className="flex w-full items-center justify-center gap-1 px-4 py-2.5 text-xs font-bold text-rose-500 transition hover:bg-rose-50/50"
                      >
                        {isExpanded
                          ? "See less"
                          : `See more (${hiddenRows.length})`}
                        <ChevronLeftIcon
                          className={`h-3.5 w-3.5 transition-transform ${
                            isExpanded ? "rotate-90" : "-rotate-90"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom save bar ------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-3 lg:left-[290px]">
        <div className="max-w-8xl mx-auto flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
          <p className="flex-1 text-sm text-gray-500">
            <span className="font-bold text-gray-900">{cfg.displayName}</span> ·{" "}
            {pricingErrors.length > 0 ? (
              <span className="font-semibold text-red-500">
                {pricingErrors.length} pricing issue
                {pricingErrors.length > 1 ? "s" : ""} to fix
              </span>
            ) : (
              "changes apply the moment you save"
            )}
          </p>
          <button
            onClick={() => router.push("/revenue/subscriptions")}
            className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || pricingErrors.length > 0}
            className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:from-rose-500 hover:to-rose-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <DefaultLayout>
      <PackageProvider>
        <EditPageInner />
      </PackageProvider>
    </DefaultLayout>
  );
}

/* ------------------------------ subcomponents ------------------------------ */
function HeroStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-white/70">
        {label}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-lg font-bold">
        {icon}
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold tracking-wide text-gray-700">
        {label}
        {hint && (
          <span className="ml-2 font-normal normal-case text-rose-400">
            {hint}
          </span>
        )}
      </p>
      {children}
    </div>
  );
}

function PriceInput({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  min = 0,
  disabled,
  strong,
}: {
  label: string;
  hint?: string;
  value: number | "";
  onChange: (raw: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  disabled?: boolean;
  strong?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500">
        {label}
        {hint && (
          <span className="ml-1.5 font-normal normal-case tracking-normal text-gray-400">
            · {hint}
          </span>
        )}
      </span>
      <div
        className={`flex items-center overflow-hidden rounded-xl border bg-white ${
          strong ? "border-amber-300" : "border-gray-200"
        } ${disabled ? "bg-gray-50 opacity-70" : "focus-within:border-rose-300"}`}
      >
        {prefix && (
          <span className="flex h-10 w-8 shrink-0 items-center justify-center bg-gray-50 text-sm text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-full min-w-0 border-0 bg-transparent px-2 text-sm text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-300 disabled:cursor-not-allowed ${
            strong ? "font-bold" : "font-semibold"
          }`}
        />
        {suffix && (
          <span className="flex h-10 shrink-0 items-center pr-3 text-xs text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function CalcStat({
  label,
  value,
  strike,
  tone,
}: {
  label: string;
  value: string;
  strike?: string;
  tone?: "good";
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400">{label}</p>
      <p
        className={`text-sm font-bold ${
          tone === "good" ? "text-emerald-600" : "text-gray-900"
        }`}
      >
        {value}
        {strike && (
          <span className="ml-1.5 text-[11px] font-normal text-gray-400 line-through">
            {strike}
          </span>
        )}
      </p>
    </div>
  );
}

function FeatureToggle({ on, onClass }: { on: boolean; onClass: string }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
        on ? onClass : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}