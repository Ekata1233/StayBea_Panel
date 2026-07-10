'use client'

import DefaultLayout from '@/components/Layouts/DefaultLayout'
import React, { useState } from 'react'

/* ---------------------------------- icons --------------------------------- */
type IconProps = { className?: string }

const LinkIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
)

const DiamondIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l3 6-9 12L3 9z" />
    <path d="M3 9h18M9 3l-1 6 4 12 4-12-1-6" />
  </svg>
)

const FlameIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.6a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
    <path d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" fill="#fff" />
  </svg>
)

const TrendUpIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.52l2.74-1.219m0 0-5.94-2.28m5.94 2.28-2.28 5.94" />
  </svg>
)

const DownloadIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
)

const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)

const SearchIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
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

// --- icons for the waitlist reward row + editable description points ---
const ClockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
)

const GiftIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
)

const PlusIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const TrashIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

/* ---------------------------------- data ---------------------------------- */
const topReferrers = [
  { name: 'Kabir Singh', meta: 'Delhi · 28 joins · 15 plans', amount: '₹10,300' },
  { name: 'Aanya Mehta', meta: 'Pune · 34 joins · 12 plans', amount: '₹9,400' },
  { name: 'Tanya Joshi', meta: 'Jaipur · 26 joins · 9 plans', amount: '₹7,100' },
  { name: 'Dev Sharma', meta: 'Mumbai · 22 joins · 7 plans', amount: '₹5,700' },
  { name: 'Arjun Kapoor', meta: 'Hyderabad · 19 joins · 6 plans', amount: '₹4,900' },
]

const recentRewards = [
  { name: 'Aanya Mehta', action: 'invited', target: 'Simran K.', tail: '— they joined', time: '6 min ago', amount: '+₹100' },
  { name: 'Kabir Singh', action: 'referral bought', target: 'VIP Elite', tail: '', time: '22 min ago', amount: '+₹500' },
  { name: 'Tanya Joshi', action: 'invited', target: 'Nikita R.', tail: '— they joined', time: '1 h ago', amount: '+₹100' },
  { name: 'Dev Sharma', action: 'referral bought', target: 'Premium+', tail: '', time: '2 h ago', amount: '+₹500' },
  { name: 'Elena Dsouza', action: 'invited', target: 'Pooja V.', tail: '— they joined', time: '3 h ago', amount: '+₹100' },
  { name: 'Arjun Kapoor', action: 'referral bought', target: 'VIP', tail: '', time: '4 h ago', amount: '+₹500' },
]

/* ------------------------------- avatar utils ----------------------------- */
const AVATAR_COLORS = [
  'bg-rose-100 text-rose-600',
  'bg-blue-100 text-blue-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-violet-100 text-violet-600',
  'bg-cyan-100 text-cyan-600',
]

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

const colorFor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const Avatar = ({ name, size = 'h-10 w-10 text-sm' }: { name: string; size?: string }) => (
  <div className={`flex ${size} shrink-0 items-center justify-center rounded-full font-semibold ${colorFor(name)}`}>
    {initials(name)}
  </div>
)

/* --------------------------------- page ----------------------------------- */
export default function Page() {
  // Reward amounts (signup / package / waitlist).
  const [joinReward, setJoinReward] = useState('100')       // signupReward
  const [planReward, setPlanReward] = useState('500')       // packageReward
  const [waitlistReward, setWaitlistReward] = useState('300')

  // "How Rewards Work" title + member-facing description points.
  const [rewardTitle, setRewardTitle] = useState('How Rewards Work')
  const [descriptions, setDescriptions] = useState<string[]>([
    '₹100 is credited once your friend joins (signs up & logs in) with your code.',
    '₹500 is credited when that friend activates any paid package (Premium+, VIP or Elite).',
    'Rewards land in your Welvors wallet and can be withdrawn to UPI / bank.',
    'Self-referrals or fake accounts are not eligible and may lead to a ban.',
  ])

  const updateDescription = (i: number, val: string) =>
    setDescriptions((d) => d.map((x, idx) => (idx === i ? val : x)))
  const addDescription = () => setDescriptions((d) => [...d, ''])
  const removeDescription = (i: number) =>
    setDescriptions((d) => d.filter((_, idx) => idx !== i))

  const handleSaveRules = () => {
    // Payload shaped to match your API response.
    const payload = {
      title: rewardTitle.trim(),
      signupReward: Number(joinReward) || 0,
      packageReward: Number(planReward) || 0,
      waitlistReward: Number(waitlistReward) || 0,
      descriptions: descriptions
        .map((d) => d.trim())
        .filter(Boolean)
        .map((description, i) => ({ description, sortOrder: i + 1 })),
    }
    // TODO: POST `payload` to your rewards-config endpoint.
    console.log('Save reward rules', payload)
  }

  const resetRules = () => {
    setJoinReward('100')
    setPlanReward('500')
    setWaitlistReward('300')
  }

  return (
    <DefaultLayout>
      {/* Page top bar --------------------------------------------------- */}
      <div className=" flex flex-col gap-3 border-b border-gray-200 bg-[#f7f6f5] px-4 py-4 sm:flex-row sm:items-center sm:justify-between  ">
        <div>
          <h1 className="text-lg font-bold text-black">Refer &amp; Earn</h1>
          <p className="mt-0.5 text-sm text-gray-400">Reward rules, referral performance &amp; burn</p>
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
          <button className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <QuestionIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-8xl px-6 py-4">
        {/* Header ---------------------------------------------------------- */}
        <div className="mb-6  flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-title-md2 text-xl font-bold text-black dark:text-white">Refer &amp; Earn</h2>
            <p className="mt-1 text-sm text-gray-500">
              Reward rules, referral performance &amp; total burn — paid to member wallets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600">
              <CheckIcon className="h-3.5 w-3.5" />
              Burn feeds Wallet rewards
            </span>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <DownloadIcon className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* KPI cards ------------------------------------------------------- */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<LinkIcon className="h-5 w-5" />}
            iconClass="bg-indigo-50 text-indigo-500"
            value="16,800"
            label="Friends joined"
            badge="▲ +39% of invites"
            badgeClass="bg-emerald-50 text-emerald-600"
          />
          <KpiCard
            icon={<DiamondIcon className="h-5 w-5" />}
            iconClass="bg-blue-50 text-blue-500"
            value="5,880"
            label="Converted to a plan"
            badge="▲ +35% of joins"
            badgeClass="bg-emerald-50 text-emerald-600"
          />
          <KpiCard
            icon={<FlameIcon className="h-5 w-5" />}
            iconClass="bg-orange-50 text-orange-500"
            value="₹46.2L"
            label="Total referral burn"
            badge="▼ brand-funded"
            badgeClass="bg-rose-50 text-rose-600"
          />
          <KpiCard
            icon={<TrendUpIcon className="h-5 w-5" />}
            iconClass="bg-rose-50 text-rose-500"
            value="2.5×"
            label="Return on burn"
            badge="▲ ₹117.5L plan rev"
            badgeClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Middle row ------------------------------------------------------ */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* Reward rules */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Reward rules</h3>
              <span className="text-xs text-gray-400">Paid to referrer&apos;s wallet</span>
            </div>

            <div className="space-y-3">
              <RuleRow
                icon={<LinkIcon className="h-4 w-4" />}
                iconClass="bg-indigo-50 text-indigo-500"
                title="Friend joins with your code"
                sub="Signs up & logs in to Welvors"
                value={joinReward}
                onChange={setJoinReward}
              />
              <RuleRow
                icon={<DiamondIcon className="h-4 w-4" />}
                iconClass="bg-blue-50 text-blue-500"
                title="Friend buys any plan"
                sub="Premium+, VIP or Elite — any package counts"
                value={planReward}
                onChange={setPlanReward}
              />
              <RuleRow
                icon={<ClockIcon className="h-4 w-4" />}
                iconClass="bg-amber-50 text-amber-500"
                title="Friend joins the waitlist"
                sub="Reserves early access before launch"
                value={waitlistReward}
                onChange={setWaitlistReward}
              />
            </div>

            {/* <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
              Projected burn at current volume:{' '}
              <span className="font-semibold text-gray-700">₹46.2L</span>
            </div> */}

            {/* How Rewards Work — editable title + description points */}
            <div className=" border-t border-gray-100 pt-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <GiftIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="Section title"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-black outline-none focus:border-rose-300"
                />
              </div>

              <div className="max-h-32 space-y-2 overflow-y-auto pr-1">
                {descriptions.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-gray-100 p-2.5">
                    <span className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                      {i + 1}
                    </span>
                    <textarea
                      rows={2}
                      value={d}
                      onChange={(e) => updateDescription(i, e.target.value)}
                      placeholder="Describe this reward rule…"
                      className="min-w-0 flex-1 resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeDescription(i)}
                      className="mt-1 shrink-0 rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Remove point"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {descriptions.length === 0 && (
                  <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-400">
                    No points yet. Add one below.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={addDescription}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:border-rose-300 hover:text-rose-600"
              >
                <PlusIcon className="h-4 w-4" />
                Add point
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleSaveRules}
                className="rounded-lg bg-rose-500 px-5 py-2 text-sm font-medium text-white hover:bg-rose-600"
              >
                Save rules
              </button>
              <button
                onClick={resetRules}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Reset amounts
              </button>
            </div>
          </div>

          {/* Referral burn breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Referral burn breakdown</h3>
              <span className="text-xs text-gray-400">Lifetime</span>
            </div>

            <BurnBar
              icon={<LinkIcon className="h-4 w-4" />}
              iconClass="bg-indigo-50 text-indigo-500"
              title="Join rewards"
              sub="16,800 × ₹100"
              amount="₹16.8L"
              width="57%"
              barClass="bg-blue-500"
            />
            <BurnBar
              icon={<DiamondIcon className="h-4 w-4" />}
              iconClass="bg-blue-50 text-blue-500"
              title="Plan rewards"
              sub="5,880 × ₹500"
              amount="₹29.4L"
              width="100%"
              barClass="bg-violet-500"
            />

            <div className="mt-5 space-y-4 border-t border-dashed border-gray-200 pt-4">
              <SummaryRow
                title="Total burn"
                sub="All credited to member wallets · reconciles into Wallet rewards"
                amount="₹46.2L"
                amountClass="text-rose-500"
              />
              <SummaryRow
                title="Revenue driven"
                sub="5,880 referred plans × ₹1,999 avg first plan"
                amount="₹1.18Cr"
                amountClass="text-emerald-600"
              />
              <SummaryRow
                title="Net contribution"
                sub="Revenue driven − total burn · 2.5× return on burn"
                amount="₹71.3L"
                amountClass="text-emerald-600"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
                ○ 312 fake / self-referrals auto-blocked
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                ⇄ Paid as wallet coins, not cash
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row ------------------------------------------------------ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top referrers */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Top referrers</h3>
              <span className="text-xs text-gray-400">By wallet earned</span>
            </div>
            <div>
              {topReferrers.map((r, i) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Avatar name={r.name} />
                    <div>
                      <p className="text-sm font-medium text-black">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.meta}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-black">{r.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent referral rewards */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Recent referral rewards</h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <div>
              {recentRewards.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} size="h-9 w-9 text-xs" />
                    <div>
                      <p className="text-sm text-black">
                        <span className="font-semibold">{r.name}</span>{' '}
                        <span className="text-gray-400">{r.action}</span>{' '}
                        <span className="font-semibold">{r.target}</span>{' '}
                        {r.tail && <span className="text-gray-400">{r.tail}</span>}
                      </p>
                      <p className="text-xs text-gray-400">{r.time}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{r.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

/* ------------------------------ subcomponents ------------------------------ */
function KpiCard({
  icon,
  iconClass,
  value,
  label,
  badge,
  badgeClass,
}: {
  icon: React.ReactNode
  iconClass: string
  value: string
  label: string
  badge: string
  badgeClass: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconClass}`}>
          {icon}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>{badge}</span>
      </div>
      <p className="mt-4 text-3xl font-bold text-black">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function RuleRow({
  icon,
  iconClass,
  title,
  sub,
  value,
  onChange,
}: {
  icon: React.ReactNode
  iconClass: string
  title: string
  sub: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconClass}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-black">{title}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
        <span className="mr-1 text-gray-400">₹</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          className="w-12 bg-transparent text-right text-sm font-semibold text-black outline-none"
        />
      </div>
    </div>
  )
}

function BurnBar({
  icon,
  iconClass,
  title,
  sub,
  amount,
  width,
  barClass,
}: {
  icon: React.ReactNode
  iconClass: string
  title: string
  sub: string
  amount: string
  width: string
  barClass: string
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconClass}`}>{icon}</div>
          <div>
            <p className="text-sm font-medium text-black">{title}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-black">{amount}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div className={`h-1.5 rounded-full ${barClass}`} style={{ width }} />
      </div>
    </div>
  )
}

function SummaryRow({
  title,
  sub,
  amount,
  amountClass,
}: {
  title: string
  sub: string
  amount: string
  amountClass: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-black">{title}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <span className={`shrink-0 text-lg font-bold ${amountClass}`}>{amount}</span>
    </div>
  )
}