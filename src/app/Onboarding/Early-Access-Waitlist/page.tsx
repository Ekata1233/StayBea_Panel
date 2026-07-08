'use client'

import DefaultLayout from '@/components/Layouts/DefaultLayout'
import GenericTable from '@/components/ui/GenericTable'
import React, { useState, useEffect } from 'react'

/* ------------------------------------------------------------------ */
/*  Types + data                                                       */
/* ------------------------------------------------------------------ */

type Method = 'UPI' | 'Card' | 'Wallet'
type Gender = 'Woman' | 'Man'

type Member = {
  id: number
  name: string
  age: number
  gender: Gender
  wlId: string
  city: string
  phone: string
  email: string
  paid: number
  method: Method
  txnId: string
  joinedAgo: string
  joinedAt: string
  source: string
  avatarUrl?: string // optional real photo; falls back to default image
}

// Row = Member plus a display serial (GenericTable render() only gets `row`,
// not an index, so the serial has to live on the data).
type Row = Member & { sr: number }

// Shape of the launch configuration edited in the popup.
type LaunchConfig = {
  description: string
  waitlistEnabled: boolean
  appLaunched: boolean
  launchDate: string // ISO string in UTC, e.g. "2026-08-01T10:00:00.000Z"
  waitlistPrice: number // in rupees (matches your JSON; convert to paise at the API boundary)
}

// Replace this with data from your API. Stats below are derived, not hardcoded.
const members: Member[] = [
  { id: 1, name: 'Aanya Mehta', age: 24, gender: 'Woman', wlId: 'WL-2041', city: 'Pune', phone: '+91 98220 41007', email: 'aanya.m••@gmail.com', paid: 300, method: 'UPI', txnId: 'PAY-8841207', joinedAgo: '2 days ago', joinedAt: '6 Jul 2026, 21:14', source: 'INSTA' },
  { id: 2, name: 'Dev Sharma', age: 27, gender: 'Man', wlId: 'WL-2040', city: 'Mumbai', phone: '+91 98200 33218', email: 'dev.sharma••@gmail.com', paid: 300, method: 'Card', txnId: 'PAY-8840115', joinedAgo: '2 days ago', joinedAt: '6 Jul 2026, 18:02', source: 'Referral' },
  { id: 3, name: 'Meher Kapoor', age: 26, gender: 'Woman', wlId: 'WL-2039', city: 'Delhi', phone: '+91 98110 55621', email: 'meher.k••@gmail.com', paid: 300, method: 'UPI', txnId: 'PAY-8838904', joinedAgo: '3 days ago', joinedAt: '5 Jul 2026, 20:47', source: 'INSTA' },
  { id: 4, name: 'Karan Malhotra', age: 29, gender: 'Man', wlId: 'WL-2038', city: 'Bengaluru', phone: '+91 98450 21190', email: 'karan.m••@gmail.com', paid: 300, method: 'UPI', txnId: 'PAY-8837770', joinedAgo: '3 days ago', joinedAt: '5 Jul 2026, 14:20', source: 'Google' },
  { id: 5, name: 'Riya Nair', age: 25, gender: 'Woman', wlId: 'WL-2037', city: 'Mumbai', phone: '+91 98201 88342', email: 'riya.n••@gmail.com', paid: 300, method: 'Wallet', txnId: 'PAY-8836201', joinedAgo: '4 days ago', joinedAt: '4 Jul 2026, 12:10', source: 'Referral' },
  { id: 6, name: 'Ishaan Verma', age: 28, gender: 'Man', wlId: 'WL-2036', city: 'Pune', phone: '+91 98223 77120', email: 'ishaan.v••@gmail.com', paid: 300, method: 'Card', txnId: 'PAY-8835912', joinedAgo: '4 days ago', joinedAt: '4 Jul 2026, 09:30', source: 'INSTA' },
  { id: 7, name: 'Sara Khan', age: 26, gender: 'Woman', wlId: 'WL-2035', city: 'Hyderabad', phone: '+91 98850 11234', email: 'sara.k••@gmail.com', paid: 300, method: 'UPI', txnId: 'PAY-8834781', joinedAgo: '5 days ago', joinedAt: '3 Jul 2026, 19:05', source: 'INSTA' },
  { id: 8, name: 'Arjun Reddy', age: 30, gender: 'Man', wlId: 'WL-2034', city: 'Bengaluru', phone: '+91 98860 44551', email: 'arjun.r••@gmail.com', paid: 300, method: 'Card', txnId: 'PAY-8833520', joinedAgo: '5 days ago', joinedAt: '3 Jul 2026, 11:42', source: 'Google' },
  { id: 9, name: 'Neha Joshi', age: 27, gender: 'Woman', wlId: 'WL-2033', city: 'Pune', phone: '+91 98230 99870', email: 'neha.j••@gmail.com', paid: 300, method: 'Wallet', txnId: 'PAY-8832199', joinedAgo: '6 days ago', joinedAt: '2 Jul 2026, 16:20', source: 'Referral' },
  { id: 10, name: 'Rohan Mehta', age: 28, gender: 'Man', wlId: 'WL-2032', city: 'Delhi', phone: '+91 98115 22030', email: 'rohan.m••@gmail.com', paid: 300, method: 'UPI', txnId: 'PAY-8831044', joinedAgo: '6 days ago', joinedAt: '2 Jul 2026, 10:08', source: 'INSTA' },
]

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

const rupee = (n: number) => `₹${n.toLocaleString('en-IN')}`

// Fallback avatar shown when a member has no photo of their own.
const DEFAULT_AVATAR =
  'https://ik.imagekit.io/hzyuadmua/user-photos/Gemini_Generated_Image_r5ru8mr5ru8mr5ru_m5i2XLai_.png'

function Avatar({ member }: { member: Member }) {
  // Use the member's own photo, else fall back to the shared default image.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={member.avatarUrl || DEFAULT_AVATAR}
      alt={member.name}
      className="h-9 w-9 rounded-full object-cover"
    />
  )
}

const METHOD_STYLES: Record<Method, string> = {
  UPI: 'bg-emerald-50 text-emerald-600',
  Card: 'bg-blue-50 text-blue-600',
  Wallet: 'bg-amber-50 text-amber-600',
}

function MethodBadge({ method }: { method: Method }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${METHOD_STYLES[method]}`}
    >
      {method}
    </span>
  )
}

/* ---------- Launch-config helpers ---------- */

// Format remaining milliseconds as "23d 14h 22m 05s".
function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Launched'
  const total = Math.floor(ms / 1000)
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
}

// UTC ISO -> value for <input type="datetime-local"> (admin's LOCAL time).
function isoToLocalInput(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// datetime-local value (LOCAL time) -> UTC ISO string.
function localInputToIso(local: string): string {
  if (!local) return ''
  const d = new Date(local) // parsed as local time
  return isNaN(d.getTime()) ? '' : d.toISOString()
}

// Small reusable toggle switch.
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition ${
        checked ? 'bg-rose-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Inline icons (no external icon dep required)                       */
/* ------------------------------------------------------------------ */

const Icon = {
  Search: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Bell: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Help: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  ),
  Bolt: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  ),
  Download: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
    </svg>
  ),
  Clock: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  Close: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function Page() {
  // Derived stats — stay in sync with `members` automatically.
  const totalJoined = members.length
  const women = members.filter((m) => m.gender === 'Woman').length
  const men = members.filter((m) => m.gender === 'Man').length
  const collected = members.reduce((sum, m) => sum + m.paid, 0)
  const [isDeleting, setIsDeleting] = useState<string | boolean | null>(null);

  // ----- Launch-config popup state -----
  const [showLaunchModal, setShowLaunchModal] = useState(false)
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>({
    description:
      'Launch configuration for the application. Controls waitlist availability, app launch status, launch date, and waitlist registration fee.',
    waitlistEnabled: true,
    appLaunched: false,
    launchDate: '2026-08-01T10:00:00.000Z',
    waitlistPrice: 300,
  })

  // `now` stays null until mount to avoid an SSR/hydration mismatch on the countdown.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Close modal on Esc + lock background scroll while open.
  useEffect(() => {
    if (!showLaunchModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLaunchModal(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [showLaunchModal])

  const msLeft = now === null ? null : new Date(launchConfig.launchDate).getTime() - now
  const launchLabel = launchConfig.appLaunched
    ? 'App is live'
    : msLeft === null
      ? 'Launching soon'
      : msLeft <= 0
        ? 'Launch time reached'
        : `Launching in ${formatCountdown(msLeft)}`

  const handleSaveLaunch = () => {
    // TODO: PATCH your launch-config endpoint with `launchConfig`.
    // Remember: if waitlistPrice feeds the Razorpay/subscription pipeline, convert rupees -> paise (x100).
    console.log('Save launch config', launchConfig)
    setShowLaunchModal(false)
  }

  // Attach a display serial for the "#" column.
  const tableData: Row[] = members.map((m, i) => ({ ...m, sr: i + 1 }))

  const handleNotify = (m: Member) => {
    // TODO: call your notify API
    console.log('Notify', m.wlId)
  }

  const handleRefund = (m: Member) => {
    // Guard against accidental clicks on a money-out action.
    const ok = window.confirm(
      `Refund ${rupee(m.paid)} to ${m.name} (${m.wlId})?\nThis cannot be undone.`,
    )
    if (!ok) return
    // TODO: call your refund API
    console.log('Refund', m.wlId)
  }

  const handleActivateAll = () => {
    const ok = window.confirm(
      `Grant 1-month Premium + send launch notification to all ${totalJoined} waitlist members?`,
    )
    if (!ok) return
    // TODO: call your bulk-activation API
    console.log('Activate all')
  }

  const exportCsv = () => {
    const headers = ['#', 'Name', 'Age', 'Gender', 'WL ID', 'City', 'Phone', 'Email', 'Paid', 'Method', 'TXN ID', 'Joined', 'Source']
    const rows = members.map((m, i) => [
      i + 1, m.name, m.age, m.gender, m.wlId, m.city, m.phone, m.email, m.paid, m.method, m.txnId, m.joinedAt, m.source,
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'early-access-waitlist.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ---------- TABLE COLUMNS (GenericTable shape) ---------- */
  const columns = [
    {
      header: '#',
      accessor: 'sr',
      width: '56px',
      align: 'left' as const,
      render: (row: Row) => <span className="text-gray-400">{row.sr}</span>,
    },
    {
      header: 'MEMBER',
      accessor: 'name',
      width: '220px',
      align: 'left' as const,
      render: (row: Row) => (
        <div className="flex items-center gap-3">
          <Avatar member={row} />
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-400">
              {row.age} · {row.gender} · {row.wlId}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'CITY',
      accessor: 'city',
      width: '120px',
      align: 'left' as const,
      render: (row: Row) => <span className="text-gray-700">{row.city}</span>,
    },
    {
      header: 'CONTACT',
      accessor: 'phone',
      width: '200px',
      align: 'left' as const,
      render: (row: Row) => (
        <div>
          <div className="text-gray-700">{row.phone}</div>
          <div className="text-xs text-gray-400">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'PAID',
      accessor: 'paid',
      width: '90px',
      align: 'left' as const,
      render: (row: Row) => (
        <span className="font-medium text-gray-900">{rupee(row.paid)}</span>
      ),
    },
    {
      header: 'METHOD',
      accessor: 'method',
      width: '110px',
      align: 'left' as const,
      render: (row: Row) => <MethodBadge method={row.method} />,
    },
    {
      header: 'TXN ID',
      accessor: 'txnId',
      width: '130px',
      align: 'left' as const,
      render: (row: Row) => (
        <span className="font-mono text-xs text-gray-400">{row.txnId}</span>
      ),
    },
    {
      header: 'JOINED',
      accessor: 'joinedAgo',
      width: '150px',
      align: 'left' as const,
      render: (row: Row) => (
        <div>
          <div className="text-gray-700">{row.joinedAgo}</div>
          <div className="text-xs text-gray-400">{row.joinedAt}</div>
        </div>
      ),
    },
    {
      header: 'SOURCE',
      accessor: 'source',
      width: '100px',
      align: 'left' as const,
      render: (row: Row) => <span className="text-gray-600">{row.source}</span>,
    },
    {
      header: 'ACTIONS',
      accessor: 'actions',
      width: '150px',
      align: 'center' as const,
      render: (row: Row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNotify(row)
            }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Notify
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRefund(row)
            }}
            className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
          >
            Refund
          </button>
        </div>
      ),
    },
  ]

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-8xl px-6 py-4">
        {/* Page header — remove the bell/help if DefaultLayout already has a top bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Early-access waitlist</h1>
            <p className="text-sm text-gray-500">Pre-launch members who paid ₹300</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Launch-config countdown button — opens the popup */}
            <button
              onClick={() => setShowLaunchModal(true)}
              className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100"
            >
              <Icon.Clock className="h-4 w-4" />
              <span className="tabular-nums">{launchLabel}</span>
            </button>

            <div className="relative">
              <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, IDs, transactions…"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 outline-none focus:border-gray-300 sm:w-80"
              />
            </div>
            <button className="relative rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50">
              <Icon.Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <button className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50">
              <Icon.Help className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hero banner */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#fdeaea] via-[#fdeeea] to-[#fdf1ea] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                Pre-launch · Early access
              </span>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Early-access waitlist</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                App abhi build ho raha hai. Members ₹300 pe waitlist join karte hain — launch pe pehle mahine ka{' '}
                <span className="font-semibold text-gray-800">Premium sirf ₹300 me (₹700 off)</span>. Ye sirf waitlist
                members hain jinhone ₹300 pay kiya hai.
              </p>
            </div>

            {/* Pricing card */}
            <div className="w-full shrink-0 rounded-xl bg-white p-5 text-center shadow-sm lg:w-64">
              <div className="text-3xl font-bold text-rose-600">₹300</div>
              <div className="mt-1 text-xs text-gray-500">per join · ₹700 launch discount</div>
              <button
                onClick={handleActivateAll}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                <Icon.Bolt className="h-4 w-4" />
                Launch · activate all
              </button>
              <p className="mt-3 text-[11px] leading-snug text-gray-400">
                App live hone pe sabko 1-month Premium + notification
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard value={String(totalJoined)} label="Total joined" />
          <StatCard value={String(women)} label="Women" />
          <StatCard value={String(men)} label="Men" />
          <StatCard value={rupee(collected)} label="Collected" accent="text-emerald-600" />
        </div>

        {/* Table header — Export CSV lives here because GenericTable has no header-action slot */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Waitlist members</h3>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Icon.Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* GenericTable — flags mirror your existing PlansTab usage */}
        <GenericTable
          title=""
          columns={columns}
          data={tableData}
          showActions={true}
          showView={false}
          showEdit={false}
          showDelete={false}
        isDeleting={isDeleting}
        />
      </div>

      {/* -------------------- Launch configuration popup -------------------- */}
      {showLaunchModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLaunchModal(false)}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* dialog */}
          <div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                  <Icon.Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Launch configuration</h3>
                  <p className="text-xs text-gray-500">Waitlist, launch date &amp; registration fee</p>
                </div>
              </div>
              <button
                onClick={() => setShowLaunchModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <Icon.Close className="h-5 w-5" />
              </button>
            </div>

            {/* body */}
            <div className="space-y-5 px-6 py-5">
              {/* Live status line */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-500">Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    launchConfig.appLaunched
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      launchConfig.appLaunched ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {launchLabel}
                </span>
              </div>

              {/* Waitlist enabled toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">Waitlist enabled</div>
                  <div className="text-xs text-gray-400">Allow new members to join the waitlist</div>
                </div>
                <Toggle
                  checked={launchConfig.waitlistEnabled}
                  onChange={(v) => setLaunchConfig((c) => ({ ...c, waitlistEnabled: v }))}
                />
              </div>

              {/* App launched toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">App launched</div>
                  <div className="text-xs text-gray-400">Mark the app as live to end the countdown</div>
                </div>
                <Toggle
                  checked={launchConfig.appLaunched}
                  onChange={(v) => setLaunchConfig((c) => ({ ...c, appLaunched: v }))}
                />
              </div>

              {/* Launch date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Launch date &amp; time
                </label>
                <input
                  type="datetime-local"
                  value={isoToLocalInput(launchConfig.launchDate)}
                  onChange={(e) =>
                    setLaunchConfig((c) => ({ ...c, launchDate: localInputToIso(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-300"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Shown in your local time. Stored as UTC ({launchConfig.launchDate || '—'}).
                </p>
              </div>

              {/* Waitlist price */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Waitlist price (₹)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={launchConfig.waitlistPrice}
                    onChange={(e) =>
                      setLaunchConfig((c) => ({
                        ...c,
                        waitlistPrice: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-7 pr-3 text-sm text-gray-700 outline-none focus:border-rose-300"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">Description</label>
                <textarea
                  rows={3}
                  value={launchConfig.description}
                  onChange={(e) => setLaunchConfig((c) => ({ ...c, description: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-300"
                />
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowLaunchModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLaunch}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}

function StatCard({
  value,
  label,
  accent = 'text-gray-900',
}: {
  value: string
  label: string
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  )
}

export default Page