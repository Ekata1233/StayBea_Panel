'use client'

import { useIntention } from '@/context/DatingGoalsContext';
import React, { useEffect, useRef, useState } from 'react'
import { FiX } from 'react-icons/fi'

type Option = { option: string; optDescription: string }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// One editable value with inline-edit behaviour; commits on Enter / blur.
function InlineEdit({
  value,
  onCommit,
  className,
  placeholder,
  emptyLabel,
}: {
  value: string
  onCommit: (v: string) => void
  className?: string
  placeholder?: string
  emptyLabel?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const start = () => {
    setDraft(value)
    setEditing(true)
  }
  const commit = () => {
    setEditing(false)
    const v = draft.trim()
    if (v === value) return
    onCommit(v) // parent auto-saves
  }
  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  if (editing) {
    return (
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
        placeholder={placeholder}
        className={`bg-transparent focus:outline-none ${className ?? ''}`}
        style={{ width: `${Math.max(draft.length, 4)}ch` }}
      />
    )
  }

  return (
    <button onClick={start} className={`text-left focus:outline-none ${className ?? ''}`} title="Click to edit">
      {value || <span className="text-gray-400">{emptyLabel}</span>}
    </button>
  )
}

// Chip shows the option label + its description (two-line pill).
function OptionChip({
  option,
  optDescription,
  onEditOption,
  onEditDescription,
  onRemove,
}: {
  option: string
  optDescription: string
  onEditOption: (v: string) => void
  onEditDescription: (v: string) => void
  onRemove: () => void
}) {
  return (
    <span className="inline-flex flex-col gap-0.5 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
      <span className="flex items-center gap-1.5">
        <InlineEdit
          value={option}
          onCommit={onEditOption}
          className="font-medium text-gray-800"
          placeholder="Option"
          emptyLabel="Option"
        />
        <button
          onClick={onRemove}
          className="text-gray-400 transition hover:text-gray-700"
          aria-label={`Remove ${option}`}
        >
          <FiX size={14} />
        </button>
      </span>
      <InlineEdit
        value={optDescription}
        onCommit={onEditDescription}
        className="text-xs text-gray-500"
        placeholder="Description"
        emptyLabel="+ add description"
      />
    </span>
  )
}

// Two-field add control (option + description). Add commits + auto-saves.
function AddOption({ onAdd }: { onAdd: (o: Option) => void }) {
  const [option, setOption] = useState('')
  const [desc, setDesc] = useState('')

  const submit = () => {
    const o = option.trim()
    if (!o) return
    onAdd({ option: o, optDescription: desc.trim() })
    setOption('')
    setDesc('')
  }

  return (
    <div className="inline-flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-2">
      <input
        value={option}
        onChange={(e) => setOption(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="e.g. Long Term"
        className="w-44 bg-transparent px-1 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none"
      />
      <div className="flex items-center gap-1">
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Description (optional)"
          className="w-44 bg-transparent px-1 text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none"
        />
        <button
          onClick={submit}
          className="rounded-full px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        >
          Add
        </button>
      </div>
    </div>
  )
}

export default function DatingGoal() {
  const { data, createData, loading } = useIntention()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState<Option[]>([])
  const [sortOrder] = useState(1)
  const [isActive] = useState(true)

  // Auto-save plumbing: refs mirror latest state for the debounced save.
  const titleRef = useRef(title)
  const descRef = useRef(description)
  const optionsRef = useRef(options)
  const lastSavedRef = useRef('') // snapshot of last persisted payload; skips no-op saves
  useEffect(() => { titleRef.current = title }, [title])
  useEffect(() => { descRef.current = description }, [description])
  useEffect(() => { optionsRef.current = options }, [options])

  const [dirty, setDirty] = useState(0)
  const markDirty = () => setDirty((d) => d + 1)

  const savingRef = useRef(false)
  const rerunRef = useRef(false)
  const [savingUi, setSavingUi] = useState(false)

  // Hydrate from the API (first / only intention). Does NOT mark dirty.
  useEffect(() => {
    const rec = data?.[0]
    if (!rec) return
    const opts = (rec.options || []).map((o) => ({
      option: o.option,
      optDescription: o.optDescription ?? '',
    }))
    setTitle(rec.title || '')
    setDescription(rec.description || '')
    setOptions(opts)
    lastSavedRef.current = JSON.stringify({
      title: rec.title || '',
      description: rec.description || '',
      options: opts,
    })
  }, [data])

  const addOption = (o: Option) => {
    setOptions((prev) => (prev.some((p) => p.option === o.option) ? prev : [...prev, o]))
    markDirty()
  }

  const removeOption = (label: string) => {
    setOptions((prev) => prev.filter((p) => p.option !== label))
    markDirty()
  }

  const editOptionLabel = (oldLabel: string, newLabel: string) => {
    let changed = false
    setOptions((prev) => {
      if (prev.some((p) => p.option === newLabel)) return prev // block duplicate
      changed = true
      return prev.map((p) => (p.option === oldLabel ? { ...p, option: newLabel } : p))
    })
    if (changed) markDirty()
  }

  const editOptionDescription = (label: string, newDesc: string) => {
    setOptions((prev) => prev.map((p) => (p.option === label ? { ...p, optDescription: newDesc } : p)))
    markDirty()
  }

  // Meta (title / description) commit on Enter or blur.
  const commitMeta = () => markDirty()

  const buildAndSave = async () => {
    const t = titleRef.current.trim()
    const d = descRef.current.trim()
    const opts = optionsRef.current.map((o) => ({ option: o.option, optDescription: o.optDescription }))

    // Nothing meaningful to save yet.
    if (!t && !d && opts.length === 0) return

    const snapshot = JSON.stringify({ title: t, description: d, options: opts })
    if (snapshot === lastSavedRef.current) return // no change → skip

    await createData({ title: t, description: d, sortOrder, isActive, options: opts })
    lastSavedRef.current = snapshot
  }

  const persist = async () => {
    if (savingRef.current) {
      rerunRef.current = true
      return
    }
    savingRef.current = true
    setSavingUi(true)
    try {
      do {
        rerunRef.current = false
        await buildAndSave()
      } while (rerunRef.current)
    } catch {
      alert('Auto-save failed. Check the API/network and try again.')
    } finally {
      savingRef.current = false
      setSavingUi(false)
    }
  }

  // Debounced auto-save: coalesces rapid edits into one POST.
  useEffect(() => {
    if (dirty === 0) return
    const timer = setTimeout(() => {
      void persist()
    }, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty])

  return (
    <Section title="Dating goal">
      <div className="py-4">
        {/* Intention-level fields — commit on Enter / blur */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitMeta}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
          placeholder="Title — e.g. Relationship Goals"
          className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-rose-300 focus:outline-none"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={commitMeta}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
          placeholder="Description — e.g. Choose one"
          className="mb-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-rose-300 focus:outline-none"
        />

        {/* Header row */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">❤️</span>
          <span className="font-semibold text-gray-800">Looking for</span>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
            {options.length}
          </span>
        </div>

        {/* Options as chips */}
        <div className="flex flex-wrap items-start gap-2">
          {options.map((o) => (
            <OptionChip
              key={o.option}
              option={o.option}
              optDescription={o.optDescription}
              onEditOption={(v) => editOptionLabel(o.option, v)}
              onEditDescription={(v) => editOptionDescription(o.option, v)}
              onRemove={() => removeOption(o.option)}
            />
          ))}
          <AddOption onAdd={addOption} />
        </div>
      </div>

      {/* Auto-save status (Save button removed) */}
      <div className="mt-3 text-xs text-gray-400">
        {savingUi || loading ? 'Saving…' : dirty > 0 ? 'Pending changes…' : 'All changes saved'}
      </div>
    </Section>
  )
}