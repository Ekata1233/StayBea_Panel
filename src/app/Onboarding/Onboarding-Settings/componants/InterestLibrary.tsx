'use client'

import React, { useState } from 'react'
import { FiX, FiPlus, FiLoader } from 'react-icons/fi'
import {
  useInterest,
  slugify,
  type Field,
  type Option,
} from '../../../../context/InterestContext'

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

function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      disabled={disabled}
      title="Multi-select (isMulti)"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
        on ? 'bg-rose-500' : 'bg-gray-200'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function Chip({
  option,
  onEdit,
  onRemove,
}: {
  option: Option
  onEdit: (label: string) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(option.label)

  const start = () => {
    setDraft(option.label)
    setEditing(true)
  }
  const commit = () => {
    setEditing(false)
    const v = draft.trim()
    if (!v || v === option.label) {
      setDraft(option.label)
      return
    }
    onEdit(v)
  }
  const cancel = () => {
    setDraft(option.label)
    setEditing(false)
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400 bg-rose-50 px-3 py-1.5 text-sm text-gray-700 ring-1 ring-rose-200">
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
          className="bg-transparent text-gray-800 focus:outline-none"
          style={{ width: `${Math.max(draft.length, 2)}ch` }}
        />
        {draft.trim() && (
          <span className="font-mono text-[11px] text-rose-400">
            {slugify(draft)}
          </span>
        )}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
      <button onClick={start} className="focus:outline-none" title="Click to edit">
        {option.label}
      </button>
      <span
        className="font-mono text-[11px] text-gray-400"
        title="auto-generated value"
      >
        {option.value}
      </span>
      <button
        onClick={onRemove}
        className="text-gray-400 transition hover:text-gray-700"
        aria-label={`Remove ${option.label}`}
      >
        <FiX size={14} />
      </button>
    </span>
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
    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white pl-3 pr-1 py-0.5">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        className="w-32 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
      />
      {value.trim() && (
        <span className="mr-1 font-mono text-[11px] text-gray-400">
          {slugify(value)}
        </span>
      )}
      <button
        onClick={submit}
        className="rounded-full px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
      >
        Add
      </button>
    </div>
  )
}

function EditableTitle({
  title,
  onSave,
}: {
  title: string
  onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)

  const commit = () => {
    setEditing(false)
    const v = draft.trim()
    if (!v || v === title) {
      setDraft(title)
      return
    }
    onSave(v)
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
          if (e.key === 'Escape') {
            setDraft(title)
            setEditing(false)
          }
        }}
        className="border-b border-rose-300 bg-transparent font-semibold text-gray-800 focus:outline-none"
        style={{ width: `${Math.max(draft.length, 4)}ch` }}
      />
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(title)
        setEditing(true)
      }}
      className="font-semibold text-gray-800 hover:text-rose-600"
      title="Click to rename"
    >
      {title}
    </button>
  )
}

function FieldRow({
  field,
  onRun,
}: {
  field: Field
  onRun: (fn: () => Promise<void>) => Promise<void>
}) {
  const { updateField, deleteField, addOption, updateOption, deleteOption } =
    useInterest()

  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">{field.emoji}</span>
        <EditableTitle
          title={field.title}
          onSave={(title) => onRun(() => updateField(field.id, { title }))}
        />
        <span className="font-mono text-[11px] text-gray-400">{field.key}</span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {field.options.length}
        </span>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-500">
            Multi
            <Toggle
              on={field.isMulti}
              onChange={(isMulti) =>
                onRun(() => updateField(field.id, { isMulti }))
              }
            />
          </label>
          <button
            onClick={() => onRun(() => deleteField(field.id))}
            className="text-gray-300 transition hover:text-gray-500"
            aria-label={`Remove ${field.title} field`}
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {field.options.map((option) => (
          <Chip
            key={option.id}
            option={option}
            onEdit={(label) =>
              onRun(() => updateOption(field.id, option.id, label))
            }
            onRemove={() => onRun(() => deleteOption(field.id, option.id))}
          />
        ))}
        <AddInput
          placeholder="e.g. Pescetarian"
          onAdd={(label) => onRun(() => addOption(field.id, label))}
        />
      </div>
    </div>
  )
}

function NewFieldDraft({
  onRun,
}: {
  onRun: (fn: () => Promise<void>) => Promise<void>
}) {
  const { createField } = useInterest()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [key, setKey] = useState('')
  const [isMulti, setIsMulti] = useState(false)
  const [labels, setLabels] = useState<string[]>([])

  const reset = () => {
    setTitle('')
    setKey('')
    setIsMulti(false)
    setLabels([])
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-400 transition hover:border-rose-200 hover:text-rose-600"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
          <FiPlus size={14} />
        </span>
        Add a new field
      </button>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/40 p-4">
      <div className="mb-3 flex items-center gap-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Field title, e.g. Diet Abc"
          className="w-48 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-rose-300 focus:outline-none"
        />
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Key, e.g. diet_abc"
          className="w-40 rounded-lg border border-gray-200 px-3 py-1.5 font-mono text-sm focus:border-rose-300 focus:outline-none"
        />
        <label className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
          Multi
          <Toggle on={isMulti} onChange={setIsMulti} />
        </label>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {labels.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
          >
            {label}
            <span className="font-mono text-[11px] text-gray-400">
              {slugify(label)}
            </span>
            <button
              onClick={() => setLabels((prev) => prev.filter((_, j) => j !== i))}
              className="text-gray-400 hover:text-gray-700"
              aria-label={`Remove ${label}`}
            >
              <FiX size={14} />
            </button>
          </span>
        ))}
        <AddInput
          placeholder="Add an option"
          onAdd={(label) =>
            setLabels((prev) =>
              prev.includes(label) ? prev : [...prev, label]
            )
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={!title.trim() || !key.trim()}
          onClick={() =>
            onRun(async () => {
              await createField(title, key, isMulti, labels)
              reset()
            })
          }
          className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-40"
        >
          Create field
        </button>
        <button
          onClick={reset}
          className="rounded-lg px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function Interest() {
  const { fields, loading, error, refetch } = useInterest()

  // Runs an API action; on failure surface the message and resync from server.
  const run = async (fn: () => Promise<void>) => {
    try {
      await fn()
    } catch (e: any) {
      alert(e.message)
      refetch()
    }
  }

  return (
    <Section title="Interest">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
          <FiLoader className="animate-spin" /> Loading…
        </div>
      ) : fields.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          No lifestyle fields yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {fields.map((field) => (
            <FieldRow key={field.id} field={field} onRun={run} />
          ))}
        </div>
      )}

      <NewFieldDraft onRun={run} />
    </Section>
  )
}