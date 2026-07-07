'use client'

import React, { useState } from 'react'
import { FiX, FiPlus, FiChevronDown, FiBookmark } from 'react-icons/fi'

type Visibility = 'Everyone' | 'VIP members only' | 'VIP & Elite only'

type PromptCategory = {
  id: string
  emoji: string
  label: string
  prompts: string[]
  visibility: Visibility
}

const VISIBILITY_CYCLE: Visibility[] = ['Everyone', 'VIP members only', 'VIP & Elite only']

const getVisibilityStyle = (v: Visibility) => {
  switch (v) {
    case 'Everyone':
      return 'bg-green-100 text-green-700'
    case 'VIP members only':
      return 'bg-amber-100 text-amber-800'
    case 'VIP & Elite only':
      return 'bg-rose-100 text-rose-700'
  }
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Tab({
  category,
  active,
  onClick,
}: {
  category: PromptCategory
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? 'border-rose-500 bg-rose-500 text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
      }`}
    >
      {active && <FiBookmark size={13} className="text-white" />}
      <span>{category.label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
          active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {category.prompts.length}
      </span>
    </button>
  )
}

function AddInput({
  placeholder,
  onAdd,
}: {
  placeholder: string
  onAdd: (v: string) => void
}) {
  const [value, setValue] = useState('')
  const submit = () => {
    const v = value.trim()
    if (!v) return
    onAdd(v)
    setValue('')
  }
  return (
    <div className="flex items-center gap-2 py-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-200"
      />
      <button
        onClick={submit}
        className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
      >
        Add
      </button>
    </div>
  )
}

function PromptChip({
  label,
  onRemove,
  onEdit,
}: {
  label: string
  onRemove: () => void
  onEdit: (newValue: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)

  const startEdit = () => {
    setDraft(label)
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    const v = draft.trim()
    if (!v || v === label) {
      setDraft(label)
      return
    }
    onEdit(v)
  }

  const cancel = () => {
    setDraft(label)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center justify-between py-3">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') cancel()
          }}
          className="flex-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-3">
      <button
        onClick={startEdit}
        className="text-sm font-medium text-gray-800 hover:text-rose-600 transition-colors focus:outline-none text-left"
        title="Click to edit"
      >
        {label}
      </button>
      <button
        onClick={onRemove}
        className="text-sm text-gray-400 transition hover:text-gray-700"
      >
        Remove
      </button>
    </div>
  )
}

export default function PromptLibrary() {
  const [categories, setCategories] = useState<PromptCategory[]>([
    {
      id: 'about_me',
      emoji: '👤',
      label: 'About me',
      visibility: 'Everyone',
      prompts: [
        'My ideal Sunday looks like…',
        'The city that made me who I am…',
        'A cause I genuinely care about…',
        'One thing my bio won’t tell you…',
        'I’m currently obsessed with…',
        'Green flags I look for…',
        'My signature dish is…',
        'What people misunderstand about me…',
      ],
    },
    {
      id: 'personality',
      emoji: '🧠',
      label: 'Personality & quirks',
      visibility: 'VIP members only',
      prompts: [
        'My love language is…',
        'My friends would describe me as…',
        'I take way too long to decide on…',
        'My toxic trait is…',
        'The quickest way to my heart…',
        'I’m the type of person who…',
        'My comfort re-watch is…',
      ],
    },
    {
      id: 'dating_love',
      emoji: '❤️',
      label: 'Dating & love',
      visibility: 'Everyone',
      prompts: [
        'I’m looking for someone who…',
        'My ideal first date…',
        'I fall for people who…',
        'A relationship dealbreaker for me…',
        'We’ll get along if…',
        'My last relationship taught me…',
        'I show I care by…',
        'The way to win me over…',
      ],
    },
    {
      id: 'goals_values',
      emoji: '🎯',
      label: 'Goals & values',
      visibility: 'Everyone',
      prompts: [
        'In five years I see myself…',
        'Something I’m working toward…',
        'A value I won’t compromise on…',
        'Career vs. family, my take…',
        'What "settling down" means to me…',
        'My definition of a partnership…',
      ],
    },
    {
      id: 'lifestyle',
      emoji: '🌟',
      label: 'Lifestyle & interests',
      visibility: 'Everyone',
      prompts: [
        'My weekends usually involve…',
        'A hobby I could talk about for hours…',
        'My go-to comfort food…',
        'The last book or show that hooked me…',
        'My fitness routine (or lack of it)…',
        'A trip I’ll never forget…',
        'On my travel bucket list…',
      ],
    },
    {
      id: 'just_for_fun',
      emoji: '🎉',
      label: 'Just for fun',
      visibility: 'Everyone',
      prompts: [
        'Two truths and a lie…',
        'My most controversial food opinion…',
        'I’ll judge you (lovingly) if…',
        'My karaoke go-to…',
        'Pineapple on pizza: yes or no…',
        'The dumbest way I’ve been injured…',
      ],
    },
    {
      id: 'gen_z',
      emoji: '📱',
      label: 'Gen-Z corner',
      visibility: 'VIP & Elite only',
      prompts: [
        'My Roman Empire is…',
        'Rating my red flags…',
        'The trend I refuse to follow…',
        'My screen time is criminally…',
        'Beige flag I’m guilty of…',
        'If my life had a soundtrack…',
        'POV: our first date…',
        'The ick I can’t get over…',
      ],
    },
    {
      id: 'marriage_minder',
      emoji: '💍',
      label: 'Marriage-minder',
      visibility: 'VIP & Elite only',
      prompts: [
        'My family’s involvement in my dating life…',
        'On timelines for marriage…',
        'Non-negotiables in a life partner…',
        'Joint vs. nuclear family, my view…',
      ],
    },
  ])

  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? '')

  const active = categories.find((c) => c.id === activeId) ?? categories[0]

  const mutateCategory = (id: string, fn: (c: PromptCategory) => PromptCategory) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? fn(c) : c)))

  const addPrompt = (id: string, v: string) =>
    mutateCategory(id, (c) => ({ ...c, prompts: [...c.prompts, v] }))

  const removePrompt = (id: string, prompt: string) =>
    mutateCategory(id, (c) => ({ ...c, prompts: c.prompts.filter((p) => p !== prompt) }))

  const editPrompt = (id: string, oldPrompt: string, newPrompt: string) =>
    mutateCategory(id, (c) =>
      c.prompts.includes(newPrompt)
        ? c // block duplicates
        : { ...c, prompts: c.prompts.map((p) => (p === oldPrompt ? newPrompt : p)) }
    )

  const cycleVisibility = (id: string) =>
    mutateCategory(id, (c) => {
      const next = VISIBILITY_CYCLE[(VISIBILITY_CYCLE.indexOf(c.visibility) + 1) % VISIBILITY_CYCLE.length]
      return { ...c, visibility: next }
    })

  const addCategory = () => {
    const id = `category_${Date.now()}`
    setCategories((prev) => [
      ...prev,
      { id, emoji: '🏷️', label: 'New category', prompts: [], visibility: 'Everyone' },
    ])
    setActiveId(id)
  }

  const removeCategory = (id: string) =>
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (id === activeId && next.length) setActiveId(next[0].id)
      return next
    })

  const total = categories.reduce((sum, c) => sum + c.prompts.length, 0)

  return (
    <Section title="Prompt library" subtitle={String(total)}>
      {/* Tab strip */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <Tab
            key={c.id}
            category={c}
            active={c.id === active?.id}
            onClick={() => setActiveId(c.id)}
          />
        ))}
        <button
          onClick={addCategory}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-400 transition hover:border-rose-300 hover:text-rose-600"
          aria-label="Add a new category"
        >
          <FiPlus size={14} />
        </button>
      </div>

      {/* Active category panel */}
      {active && (
        <div className="rounded-2xl border border-gray-100 bg-[#faf8f6] p-5">
          {/* Panel header */}
          <div className="mb-2 flex items-center gap-2">
            <span className="font-semibold text-gray-800">{active.label}</span>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
              {active.prompts.length}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => cycleVisibility(active.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${getVisibilityStyle(active.visibility)}`}
              >
                <FiBookmark size={11} />
                {active.visibility}
                <FiChevronDown size={12} />
              </button>
              <button
                onClick={() => removeCategory(active.id)}
                className="inline-flex items-center gap-1 text-xs text-gray-400 transition hover:text-gray-600"
              >
                <FiX size={13} />
                category
              </button>
            </div>
          </div>

          {/* Prompt rows */}
          <div className="divide-y divide-gray-200/70">
            {active.prompts.map((prompt) => (
              <PromptChip
                key={prompt}
                label={prompt}
                onRemove={() => removePrompt(active.id, prompt)}
                onEdit={(newValue) => editPrompt(active.id, prompt, newValue)}
              />
            ))}
            <AddInput
              placeholder={`Add a prompt to "${active.label}"`}
              onAdd={(v) => addPrompt(active.id, v)}
            />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-500">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Everyone
        <span className="text-gray-300">→</span>
        <FiBookmark size={12} className="text-amber-500" /> VIP members only{' '}
        <span className="text-gray-400">(Premium / VIP / Elite)</span>
        <span className="text-gray-300">→</span>
        🔥 VIP &amp; Elite only <span className="text-gray-400">(casual-intent)</span>. Click the badge to cycle.
      </div>
    </Section>
  )
}