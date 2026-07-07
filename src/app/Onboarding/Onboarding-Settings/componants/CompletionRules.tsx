'use client'

import React, { useState } from 'react'
import { FaCheck, FaMinus, FaPlus } from 'react-icons/fa'

type Rule = { 
  id: string; 
  title: string; 
  desc: string; 
  checked: boolean 
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

export default function CompletionRules() {
  const [rules, setRules] = useState<Rule[]>([
    { id: 'photo', title: 'Require a main photo', desc: 'Block continue until one is added', checked: true },
    { id: 'bio', title: 'Require a bio', desc: 'Members must write a short intro', checked: true },
    { id: 'institution', title: 'Require an institution', desc: 'School / college is mandatory', checked: true },
  ])
  const [minPrompts, setMinPrompts] = useState(1)

  return (
    <Section title="Completion rules" subtitle="What every new profile must include">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rules.map((rule) => (
          <button
            key={rule.id}
            onClick={() =>
              setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, checked: !r.checked } : r)))
            }
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
              rule.checked
                ? 'border-rose-100 bg-gradient-to-r from-rose-50 to-white'
                : 'border-gray-200 bg-white'
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-white transition ${
                rule.checked ? 'border-rose-600 bg-rose-600' : 'border-gray-300 bg-white'
              }`}
            >
              {rule.checked && <FaCheck size={12} />}
            </span>
            <span>
              <span className="block font-semibold text-gray-800">{rule.title}</span>
              <span className="block text-sm text-gray-500">{rule.desc}</span>
            </span>
          </button>
        ))}

        {/* Minimum prompts stepper */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <span className="block font-semibold text-gray-800">Minimum prompts answered</span>
            <span className="block text-sm text-gray-500">Prompt answers required</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMinPrompts((n) => Math.max(0, n - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
            >
              <FaMinus size={12} />
            </button>
            <span className="w-4 text-center font-semibold text-gray-800">{minPrompts}</span>
            <button
              onClick={() => setMinPrompts((n) => n + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
            >
              <FaPlus size={12} />
            </button>
          </div>
        </div>
      </div>
    </Section>
  )
}