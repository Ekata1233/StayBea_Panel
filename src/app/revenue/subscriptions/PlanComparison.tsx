'use client'

import React from 'react'

/* ---------------------------------- types ---------------------------------- */
type CellValue = string | true | null // string = text, true = ✓, null = —

type ComparisonRow = {
  key: string
  capability: string
  premium: CellValue
  vip: CellValue
  elite: CellValue
  bold?: boolean // Total features row
}

/* ---------------------------------- data ----------------------------------- */
const rows: ComparisonRow[] = [
  { key: 'pool', capability: 'Discovery pool', premium: 'Free & Premium', vip: 'VIP & VIP Elite', elite: 'VIP & VIP Elite' },
  { key: 'likes', capability: 'Daily likes', premium: '∞', vip: '∞', elite: '∞' },
  { key: 'boosts', capability: 'Weekly boosts', premium: '1', vip: '3', elite: '∞' },
  { key: 'roses', capability: 'Roses / wk', premium: '5', vip: '15', elite: '∞' },
  { key: 'coins', capability: 'Welcome coins', premium: null, vip: '₹500', elite: '₹2,000' },
  { key: 'who-liked', capability: 'See who liked you', premium: true, vip: null, elite: null },
  { key: 'priority-visibility', capability: 'Priority visibility', premium: null, vip: true, elite: null },
  { key: 'hidden-mode', capability: 'Private / hidden mode', premium: null, vip: true, elite: true },
  { key: 'events', capability: 'VIP / premium events', premium: true, vip: true, elite: null },
  { key: 'concierge', capability: 'Personal concierge', premium: null, vip: null, elite: true },
  { key: 'screenshot-alerts', capability: 'Screenshot alerts', premium: null, vip: null, elite: true },
  { key: 'total', capability: 'Total features', premium: '16', vip: '19', elite: '22', bold: true },
]

/* -------------------------------- component -------------------------------- */
function Cell({ value, bold }: { value: CellValue; bold?: boolean }) {
  if (value === true) {
    return (
      <svg className="mx-auto h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 13 4 4L19 7" />
      </svg>
    )
  }
  if (value === null) {
    return <span className="text-gray-300">—</span>
  }
  return (
    <span className={bold ? 'font-bold text-gray-900' : 'text-gray-800'}>{value}</span>
  )
}

export default function PlanComparison() {
  return (
    <div className="mx-auto mt-6 max-w-8xl px-6 mb-4">
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-6 py-4">
        <h3 className="text-base font-bold text-gray-900">Plan comparison</h3>
        <p className="text-sm text-gray-400">
          What each tier unlocks · tap a plan above to edit
        </p>
      </div>

      {/* table */}
      <div className="overflow-x-auto ">
        <table className="w-full min-w-6xl text-sm">
          <thead>
            <tr className="bg-[#f7f5f2]">
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Capability
              </th>
              <th className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold tracking-wide text-rose-500">
                  💎 PREMIUM+
                </span>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold tracking-wide text-amber-700">
                  👑 VIP
                </span>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold tracking-wide text-gray-800">
                  ✦ VIP ELITE
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.key}>
                <td
                  className={`px-6 py-3.5 text-left ${
                    r.bold ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                  }`}
                >
                  {r.capability}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Cell value={r.premium} bold={r.bold} />
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Cell value={r.vip} bold={r.bold} />
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Cell value={r.elite} bold={r.bold} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  )
}