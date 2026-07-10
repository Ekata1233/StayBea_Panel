'use client'

import DefaultLayout from '@/components/Layouts/DefaultLayout'
import React from 'react'

/* ---------------------------------- icons --------------------------------- */
type IconProps = { className?: string }

const SearchIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
)

const BellIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.857 17.082a24 24 0 0 0 5.454-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.312 6.022 24 24 0 0 0 5.455 1.31m5.714 0a3 3 0 1 1-5.714 0m5.714 0a24 24 0 0 1-5.714 0" />
  </svg>
)

const QuestionIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.75" />
    <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75" />
    <path d="M12 17.25h.008v.008H12z" />
  </svg>
)

const PeopleIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const GemIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l3 6-9 12L3 9z" />
    <path d="M3 9h18M9 3 7 9l5 12 5-12-2-6" />
  </svg>
)

const FlameIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.6a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
  </svg>
)

const PencilSquareIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const GridIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

/* ---------------------------------- data ---------------------------------- */
const plans = [
  {
    name: 'Premium+',
    nameColor: 'text-rose-500',
    meta: '8,420 subs · ₹446/mo ARPU · ₹38/mo burn',
    net: '+₹34.33 L',
    barWidth: '39%',
    barGradient: 'from-rose-400 to-rose-700',
    revenue: '₹37.54 L',
    perkBurn: '₹3.21 L',
    perkBreak: '(₹3.21 L perks + ₹0 coins)',
    margin: '91%',
  },
  {
    name: 'VIP',
    nameColor: 'text-amber-600',
    meta: '2,980 subs · ₹1,847/mo ARPU · ₹205/mo burn',
    net: '+₹48.93 L',
    barWidth: '57%',
    barGradient: 'from-amber-400 to-amber-800',
    revenue: '₹55.03 L',
    perkBurn: '₹6.10 L',
    perkBreak: '(₹3.62 L perks + ₹2.48 L coins)',
    margin: '89%',
  },
  {
    name: 'VIP Elite',
    nameColor: 'text-gray-900',
    meta: '1,490 subs · ₹6,428/mo ARPU · ₹541/mo burn',
    net: '+₹87.72 L',
    barWidth: '100%',
    barGradient: 'from-rose-800 to-black',
    revenue: '₹95.78 L',
    perkBurn: '₹8.07 L',
    perkBreak: '(₹3.10 L perks + ₹4.97 L coins)',
    margin: '92%',
  },
]

const assumptions: [string, string][] = [
  ['Weeks/mo', '4.33'],
  ['Redemption', '40%'],
  ['Boost', '₹10'],
  ['Compliment', '₹4'],
  ['Coin', '₹1'],
  ['Term mix', '1m 45·3m 30·6m 18·Fv 7'],
  ['Coins over', '6mo'],
  ['Forever over', '36mo'],
]

/* --------------------------------- page ----------------------------------- */
export default function Page() {
  return (
    <DefaultLayout>
      {/* Page top bar --------------------------------------------------- */}
      <div className="flex flex-col gap-3 border-b border-gray-200 bg-[#f7f6f5] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-black">Subscriptions</h1>
          <p className="mt-0.5 text-sm text-gray-400">Plans, tiers &amp; pricing</p>
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

      <div className="mx-auto max-w-8xl px-6 py-4">
        {/* Membership plans header ---------------------------------------- */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-black">Membership plans</h2>
          <p className="mt-1 text-sm text-rose-400">
            Two separate worlds · pricing, pool, quotas &amp; features — controlled here
          </p>
        </div>

        {/* Top stats card ------------------------------------------------- */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white">
          <div className="grid grid-cols-2 divide-gray-100 lg:grid-cols-4 lg:divide-x">
            <StatCell value="12,890" label="Active subscribers" />
            <StatCell value="₹1,88,35,328" label="Est. monthly revenue" />
            <StatCell value="3/3" label="Plans live" />
            <StatCell value="100" label="Invite-only seats / city" />
          </div>
        </div>

        {/* Plan economics card -------------------------------------------- */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="p-6">
            {/* header */}
            <div className="mb-5 flex flex-col gap-1 lg:flex-row lg:items-start lg:justify-between">
              <h3 className="text-lg font-bold text-black">Plan economics · profit &amp; loss</h3>
              <p className="text-xs text-rose-400 lg:max-w-md lg:text-right">
                Monthly run-rate · weekly perks converted to a full month · packages priced at their
                true per-month rate
              </p>
            </div>

            {/* 5 econ stats */}
            <div className="grid grid-cols-2 divide-gray-100 border-b border-gray-100 pb-4 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
              <EconStat
                icon={<PeopleIcon className="h-5 w-5" />}
                iconClass="text-gray-700"
                value="12,890"
                valueClass="text-black"
                label="Paying subscribers"
                sub="across all live plans"
              />
              <EconStat
                icon={<GemIcon className="h-5 w-5" />}
                iconClass="text-amber-500"
                value="₹1.88 Cr"
                valueClass="text-emerald-600"
                label="Gross revenue / mo"
                sub="blended subscription MRR"
              />
              <EconStat
                icon={<FlameIcon className="h-5 w-5" />}
                iconClass="text-rose-500"
                value="₹17.38 L"
                valueClass="text-rose-500"
                label="Free-perk burn / mo"
                sub="boosts·compliments·coins"
              />
              <EconStat
                icon={<PencilSquareIcon className="h-5 w-5" />}
                iconClass="text-gray-700"
                value="₹1.71 Cr"
                valueClass="text-emerald-600"
                label="Net profit / mo"
                sub="revenue - burn"
              />
              <EconStat
                icon={<GridIcon className="h-5 w-5" />}
                iconClass="text-gray-700"
                value="91%"
                valueClass="text-emerald-600"
                label="Blended margin"
                sub="after perk subsidy"
              />
            </div>

            {/* plan rows */}
            <div className="mt-6 space-y-4">
              {plans.map((p) => (
                <div key={p.name} className="rounded-2xl border border-gray-200 bg-white p-4">
                  {/* top line */}
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className={`text-base font-bold ${p.nameColor}`}>{p.name}</span>
                      <span className="text-xs text-gray-400">{p.meta}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-600">{p.net}</div>
                        <div className="text-[11px] text-gray-400">net / mo</div>
                      </div>
                      <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                        Calculation
                      </button>
                    </div>
                  </div>

                  {/* revenue bar */}
                  <div className="h-8 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`flex h-8 items-center rounded-full bg-gradient-to-r ${p.barGradient} pl-3`}
                      style={{ width: p.barWidth }}
                    >
                      <span className="truncate text-xs font-medium text-white">
                        Revenue {p.revenue}
                      </span>
                    </div>
                  </div>

                  {/* legend */}
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                        <span className="text-gray-600">
                          Revenue <span className="font-semibold text-gray-800">{p.revenue}</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FlameIcon className="h-3.5 w-3.5 text-rose-500" />
                        <span className="text-gray-600">
                          Perk burn <span className="font-semibold text-gray-800">{p.perkBurn}</span>{' '}
                          <span className="text-gray-400">{p.perkBreak}</span>
                        </span>
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-emerald-600">
                      {p.margin} margin
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* model assumptions footer */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 bg-[#f7f5f2] px-6 py-3 text-[11px] text-gray-500">
            <span className="font-semibold uppercase tracking-wide text-gray-500">
              Model assumptions
            </span>
            {assumptions.map(([k, v]) => (
              <span key={k}>
                {k} <span className="font-semibold text-gray-700">{v}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

/* ------------------------------ subcomponents ------------------------------ */
function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-6 py-5">
      <p className="text-2xl font-bold text-black">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </div>
  )
}

function EconStat({
  icon,
  iconClass,
  value,
  valueClass,
  label,
  sub,
}: {
  icon: React.ReactNode
  iconClass: string
  value: string
  valueClass: string
  label: string
  sub: string
}) {
  return (
    <div className="px-5 py-4">
      <div className={`mb-2 ${iconClass}`}>{icon}</div>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-sm font-semibold text-gray-800">{label}</p>
      <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
    </div>
  )
}