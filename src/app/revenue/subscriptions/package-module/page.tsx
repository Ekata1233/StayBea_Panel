'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

/* ---------------------------------- icons --------------------------------- */
type IconProps = { className?: string }

const LockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
  </svg>
)

const HeartIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
  </svg>
)

const BoostIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
)

const StarIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const CoinIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 8h8M8 12h8m-6 4h4" />
  </svg>
)

/* ---------------------------------- data ---------------------------------- */
type PlanId = 'premium-plus' | 'vip' | 'vip-elite'

type PlanCard = {
  id: PlanId
  name: string
  badge?: string
  badgeClass?: string
  poolLine: string
  poolLocked?: boolean
  price: string
  priceMeta: string
  chips: { icon: React.ReactNode; label: string }[]
  featuresLine: string
  topGradient: string
}

const moduleA: PlanCard[] = [
  {
    id: 'premium-plus',
    name: 'Premium+',
    badge: 'MOST POPULAR',
    badgeClass: 'bg-rose-50 text-rose-500',
    poolLine: 'Free & Premium pool',
    price: '₹433',
    priceMeta: 'from ₹499 · 8,420 active',
    chips: [
      { icon: <HeartIcon className="h-3.5 w-3.5 text-rose-500" />, label: '∞ likes/day' },
      { icon: <BoostIcon className="h-3.5 w-3.5 text-gray-700" />, label: '1 boosts/wk' },
      { icon: <StarIcon className="h-3.5 w-3.5 text-amber-500" />, label: '5 roses/wk' },
      { icon: <CoinIcon className="h-3.5 w-3.5 text-gray-500" />, label: 'No bonus coins' },
    ],
    featuresLine: '16 features across 5 groups',
    topGradient: 'from-rose-400 via-rose-500 to-rose-700',
  },
]

const moduleB: PlanCard[] = [
  {
    id: 'vip',
    name: 'VIP',
    poolLine: 'VIP & VIP Elite pool',
    price: '₹1,667',
    priceMeta: 'from ₹1,999 · 2,980 active',
    chips: [
      { icon: <HeartIcon className="h-3.5 w-3.5 text-rose-500" />, label: '∞ likes/day' },
      { icon: <BoostIcon className="h-3.5 w-3.5 text-gray-700" />, label: '3 boosts/wk' },
      { icon: <StarIcon className="h-3.5 w-3.5 text-amber-500" />, label: '15 roses/wk' },
      { icon: <CoinIcon className="h-3.5 w-3.5 text-gray-500" />, label: '₹500 coins' },
    ],
    featuresLine: '19 features across 6 groups',
    topGradient: 'from-amber-400 via-amber-600 to-amber-800',
  },
  {
    id: 'vip-elite',
    name: 'VIP Elite',
    badge: 'INVITE ONLY',
    badgeClass: 'bg-gray-100 text-gray-700',
    poolLine: 'VIP & VIP Elite pool · 100/city',
    poolLocked: true,
    price: '₹6,999',
    priceMeta: 'from ₹6,999 · 1,490 active',
    chips: [
      { icon: <HeartIcon className="h-3.5 w-3.5 text-rose-500" />, label: '∞ likes/day' },
      { icon: <BoostIcon className="h-3.5 w-3.5 text-gray-700" />, label: '∞ boosts/wk' },
      { icon: <StarIcon className="h-3.5 w-3.5 text-amber-500" />, label: '∞ roses/wk' },
      { icon: <CoinIcon className="h-3.5 w-3.5 text-gray-500" />, label: '₹2,000 coins' },
    ],
    featuresLine: '22 features across 7 groups',
    topGradient: 'from-rose-900 via-gray-900 to-black',
  },
]

/* --------------------------------- page ----------------------------------- */
export default function PackageModule() {
  return (
    <div className="mx-auto max-w-8xl px-6 py-6">
      {/* ------------------------------ MODULE A ----------------------------- */}
      <ModuleHeader
        badge="MODULE A"
        badgeClass="bg-rose-500 text-white"
        title="Free & Premium"
        subtitle="Free and Premium users connected in one shared pool"
      />
      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {moduleA.map((p) => (
          <PlanCardView key={p.id} plan={p} />
        ))}
      </div>

      {/* separator strip */}
      <div className="my-6 flex items-center gap-2 rounded-xl border border-gray-100 bg-[#f7f5f2] px-4 py-3 text-sm text-gray-600">
        <LockIcon className="h-4 w-4 text-amber-500" />
        <span>
          Separate world — these members never see or interact with VIP / VIP Elite.
        </span>
      </div>

      {/* ------------------------------ MODULE B ----------------------------- */}
      <ModuleHeader
        badge="MODULE B"
        badgeClass="bg-amber-600 text-white"
        title="VIP & VIP Elite"
        subtitle="VIP and VIP Elite users connected in their own pool"
      />
      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {moduleB.map((p) => (
          <PlanCardView key={p.id} plan={p} />
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ subcomponents ------------------------------ */
function ModuleHeader({
  badge,
  badgeClass,
  title,
  subtitle,
}: {
  badge: string
  badgeClass: string
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 shrink-0 rounded-full px-3.5 py-1 text-xs font-bold tracking-wide ${badgeClass}`}
      >
        {badge}
      </span>
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="mt-0.5 text-sm text-rose-400">{subtitle}</p>
      </div>
    </div>
  )
}

function PlanCardView({ plan: p }: { plan: PlanCard }) {
  const router = useRouter()

  return (
    <div>
    <div className="mx-auto mt-6 max-w-8xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* top gradient strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${p.topGradient}`} />

      <div className="p-6">
        {/* header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
            {p.badge && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${p.badgeClass}`}
              >
                {p.badge}
              </span>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        {/* pool line */}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
          {p.poolLocked && <LockIcon className="h-3.5 w-3.5 text-amber-500" />}
          {p.poolLine}
        </p>

        {/* price */}
        <p className="mt-4">
          <span className="text-3xl font-bold text-gray-900">{p.price}</span>
          <span className="text-sm text-gray-400">/mo</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">{p.priceMeta}</p>

        {/* chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {p.chips.map((c) => (
            <span
              key={c.label}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
            >
              {c.icon}
              {c.label}
            </span>
          ))}
        </div>

        {/* features line */}
        <p className="mt-4 text-xs text-gray-500">{p.featuresLine}</p>

        {/* CTA */}
        <button
          onClick={() => router.push(`/revenue/subscriptions/package-module/${p.id}`)}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 py-3 text-sm font-bold text-white shadow-sm transition hover:from-rose-500 hover:to-rose-600"
        >
          Edit full plan
        </button>
      </div>
      
    </div>
    {/* Module B separator strip */}
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-gray-100 bg-[#f7f5f2] px-4 py-3 text-sm text-gray-600">
        <LockIcon className="h-4 w-4 text-amber-500" />
        <span>Separate world — fully isolated from the Free &amp; Premium module.</span>
      </div>
    </div>
  )
}