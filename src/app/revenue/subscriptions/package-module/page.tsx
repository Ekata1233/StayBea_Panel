'use client'

import { useRouter } from 'next/navigation'
import React from 'react'
import { ApiCardFeature, ApiPlanCard, usePackages } from '@/context/PackageContext'

/* ---------------------------------- icons --------------------------------- */
type IconProps = { className?: string }

const LockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
  </svg>
)

const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 13 4 4L19 7" />
  </svg>
)

/* ------------------------- name → display mapping -------------------------- */
const DISPLAY_NAMES: Record<string, string> = {
  PREMIUM: 'Premium',
  VIP: 'VIP',
  VIP_ELITE: 'VIP Elite',
}

const GRADIENTS: Record<string, string> = {
  PREMIUM: 'from-rose-400 via-rose-500 to-rose-700',
  VIP: 'from-amber-400 via-amber-600 to-amber-800',
  VIP_ELITE: 'from-rose-900 via-gray-900 to-black',
}

const BADGE_CLASSES: Record<string, string> = {
  PREMIUM: 'bg-rose-50 text-rose-500',
  VIP: 'bg-amber-50 text-amber-700',
  VIP_ELITE: 'bg-gray-100 text-gray-700',
}

const MODULE_A_NAMES = ['PREMIUM']
const MODULE_B_NAMES = ['VIP', 'VIP_ELITE']
const PERIOD_SUFFIX: Record<string, string> = {
  DAILY: '/day',
  WEEKLY: '/wk',
  MONTHLY: '/mo',
  NONE: '',
}
function formatFeatureChip(f: ApiCardFeature): string {
  const period = PERIOD_SUFFIX[f.resetPeriod] ?? ''

  // Welcome Coins → ₹ format
  if (f.title === 'Welcome Coins') {
    return f.limit ? `₹${f.limit.toLocaleString('en-IN')} coins` : 'No bonus coins'
  }

  // "Unlimited X" titles → ∞ + noun
  if (f.title.toLowerCase().startsWith('unlimited')) {
    const noun = f.title.replace(/unlimited\s*/i, '').toLowerCase()
    return `∞ ${noun}/day`
  }

  const noun = f.title.toLowerCase()

  // limit null but not "Unlimited"-titled → ∞
  if (f.limit === null) return `∞ ${noun}${period}`

  return `${f.limit} ${noun}${period}`
}
/* --------------------------------- page ----------------------------------- */
export default function PackageModule() {
  const { plans, loading, error, refetch } = usePackages()

  if (loading) {
    return (
      <div className="mx-auto max-w-8xl px-6 py-16 text-center text-sm text-gray-400">
        Loading plans…
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-8xl px-6 py-16 text-center text-sm text-gray-500">
        Failed to load plans: {error}{' '}
        <button onClick={refetch} className="font-semibold text-rose-500 hover:underline">
          Retry
        </button>
      </div>
    )
  }

  const moduleA = plans.filter((p) => MODULE_A_NAMES.includes(p.name))
  const moduleB = plans.filter((p) => MODULE_B_NAMES.includes(p.name))

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

      {/* Module A separator strip */}
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

      {/* Module B separator strip — page level */}
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-gray-100 bg-[#f7f5f2] px-4 py-3 text-sm text-gray-600">
        <LockIcon className="h-4 w-4 text-amber-500" />
        <span>Separate world — fully isolated from the Free &amp; Premium module.</span>
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

function PlanCardView({ plan: p }: { plan: ApiPlanCard }) {
  const router = useRouter()
console.log("p",p);

  const displayName = DISPLAY_NAMES[p.name] ?? p.name
  const gradient = GRADIENTS[p.name] ?? 'from-gray-400 to-gray-600'
  const badgeClass = BADGE_CLASSES[p.name] ?? 'bg-gray-100 text-gray-700'
  const isElite = p.name === 'VIP_ELITE'
  const discount =
    p.originalPrice > p.price
      ? Math.round((1 - p.price / p.originalPrice) * 100)
      : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* top gradient strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-6">
        {/* header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
            {p.badgeLabel && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}
              >
                {p.badgeLabel}
              </span>
            )}
          </div>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              p.active
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-gray-50 text-gray-500'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                p.active ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
            {p.active ? 'Live' : 'Off'}
          </span>
        </div>

        {/* pool line */}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
          {isElite && <LockIcon className="h-3.5 w-3.5 text-amber-500" />}
          {p.discoveryPool}
        </p>

        {/* price */}
        <p className="mt-4">
          <span className="text-3xl font-bold text-gray-900">
            ₹{p.price.toLocaleString('en-IN')}
          </span>
          <span className="text-sm text-gray-400">/mo</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {p.originalPrice > p.price && (
            <>
              <span className="line-through">₹{p.originalPrice.toLocaleString('en-IN')}</span>
              {discount > 0 && (
                <span className="ml-2 font-semibold text-emerald-600">{discount}% off</span>
              )}
            </>
          )}
        </p>

        {/* feature chips — API features se */}
       {/* feature chips — "3 boosts/wk" format */}
<div className="mt-4 flex flex-wrap gap-2">
  {p.features.map((f) => (
    <span
      key={f.title}
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
    >
      <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
      {formatFeatureChip(f)}
    </span>
  ))}
</div>

        {/* features line — API se direct */}
        <p className="mt-4 text-xs text-gray-500">{p.featureSummary}</p>

        {/* CTA */}
        <button
          onClick={() =>
            router.push(`/revenue/subscriptions/package-module/${p.slug}`)
          }
          className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 py-3 text-sm font-bold text-white shadow-sm transition hover:from-rose-500 hover:to-rose-600"
        >
          Edit full plan
        </button>
      </div>
    </div>
  )
}