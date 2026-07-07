'use client'

import React, { useState } from 'react'
import { FiX, FiPlus } from 'react-icons/fi'
// adjust path if needed:
import {
  useProfession,
  Profession,
  useEmploymentType,
  EmploymentType,
  useExperience,
  Experience,
  useAmbition,
  Ambition,
  useSalaryRange,
  SalaryRange,
} from '@/context/Educationcarrercontext'

type Field = {
  id: string
  emoji: string
  label: string
  tags: string[]
  placeholder: string
}

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

/* ─────────────── Static chip (unchanged behaviour) ─────────────── */
function Chip({
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
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
      <button onClick={startEdit} className="focus:outline-none" title="Click to edit">
        {label}
      </button>
      <button
        onClick={onRemove}
        className="text-gray-400 transition hover:text-gray-700"
        aria-label={`Remove ${label}`}
      >
        <FiX size={14} />
      </button>
    </span>
  )
}

function AddInput({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
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
      <button
        onClick={submit}
        className="rounded-full px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
      >
        Add
      </button>
    </div>
  )
}

function FieldRow({
  field,
  onRemoveTag,
  onAddTag,
  onEditTag,
  onRemoveField,
}: {
  field: Field
  onRemoveTag: (tag: string) => void
  onAddTag: (v: string) => void
  onEditTag: (oldTag: string, newTag: string) => void
  onRemoveField: () => void
}) {
  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">{field.emoji}</span>
        <span className="font-semibold text-gray-800">{field.label}</span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {field.tags.length}
        </span>
        <button
          onClick={onRemoveField}
          className="ml-auto text-gray-300 transition hover:text-gray-500"
          aria-label={`Remove ${field.label} field`}
        >
          <FiX size={14} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {field.tags.map((tag) => (
          <Chip key={tag} label={tag} onRemove={() => onRemoveTag(tag)} onEdit={(v) => onEditTag(tag, v)} />
        ))}
        <AddInput placeholder={field.placeholder} onAdd={onAddTag} />
      </div>
    </div>
  )
}

/* ─────────────── Shared API-backed chip (id + name + isActive) ─────────────── */
function ApiChip({
  name,
  isActive,
  onEditName,
  onToggle,
  onRemove,
  validate,
}: {
  name: string
  isActive: boolean
  onEditName: (name: string) => void
  onToggle: () => void
  onRemove: () => void
  validate?: (value: string) => string | null
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [err, setErr] = useState<string | null>(null)

  const commit = () => {
    const v = draft.trim()
    if (!v || v === name) {
      setDraft(name)
      setErr(null)
      setEditing(false)
      return
    }
    const message = validate ? validate(v) : null
    if (message) {
      setErr(message) // keep editing so the user can fix it
      return
    }
    setErr(null)
    setEditing(false)
    onEditName(v)
  }
  const cancel = () => {
    setDraft(name)
    setErr(null)
    setEditing(false)
  }

  if (editing) {
    return (
      <span className="inline-flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400 bg-rose-50 px-3 py-1.5 text-sm text-gray-700 ring-1 ring-rose-200">
          <input
            autoFocus
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              if (err) setErr(null)
            }}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') cancel()
            }}
            className="bg-transparent text-gray-800 focus:outline-none"
            style={{ width: `${Math.max(draft.length, 2)}ch` }}
          />
        </span>
        {err && <span className="px-2 text-xs text-rose-600">{err}</span>}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
        isActive
          ? 'border-gray-200 bg-gray-50 text-gray-700'
          : 'border-gray-200 bg-gray-100 text-gray-400 line-through'
      }`}
    >
      <button
        onClick={onToggle}
        title={isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'}
        className={`h-3.5 w-3.5 shrink-0 rounded-full ring-1 transition ${
          isActive ? 'bg-rose-500 ring-rose-500' : 'bg-transparent ring-gray-300'
        }`}
      />
      <button onClick={() => setEditing(true)} className="focus:outline-none" title="Click to edit">
        {name}
      </button>
      <button
        onClick={onRemove}
        className="text-gray-400 transition hover:text-gray-700"
        aria-label={`Remove ${name}`}
      >
        <FiX size={14} />
      </button>
    </span>
  )
}

// Add control with an isActive toggle at the start.
function AddWithToggle({
  placeholder,
  onAdd,
  validate,
}: {
  placeholder: string
  onAdd: (name: string, isActive: boolean) => void
  validate?: (value: string) => string | null
}) {
  const [value, setValue] = useState('')
  const [active, setActive] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const submit = () => {
    const v = value.trim()
    if (!v) return
    const message = validate ? validate(v) : null
    if (message) {
      setErr(message)
      return
    }
    setErr(null)
    onAdd(v, active)
    setValue('')
    setActive(true)
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <div
        className={`inline-flex items-center rounded-full border bg-white pl-1.5 pr-1 py-0.5 ${
          err ? 'border-rose-400 ring-1 ring-rose-200' : 'border-gray-200'
        }`}
      >
        <button
          type="button"
          onClick={() => setActive((a) => !a)}
          title={active ? 'Will be created Active' : 'Will be created Inactive'}
          className={`mr-1.5 flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition ${
            active ? 'justify-end bg-rose-500' : 'justify-start bg-gray-300'
          }`}
        >
          <span className="h-4 w-4 rounded-full bg-white shadow" />
        </button>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (err) setErr(null)
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={placeholder}
          className="w-40 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
        <button
          onClick={submit}
          className="rounded-full px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        >
          Add
        </button>
      </div>
      {err && <span className="px-2 text-xs text-rose-600">{err}</span>}
    </div>
  )
}

/* ─────────────── Professions (API) ─────────────── */
function ProfessionRow() {
  const { data, loading, createData, updateData, deleteData } = useProfession()

  const add = async (name: string, isActive: boolean) => {
    if (data.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert(`"${name}" already exists.`)
      return
    }
    try {
      await createData({ name, isActive })
    } catch {
      alert('Could not add profession.')
    }
  }
  const rename = async (item: Profession, name: string) => {
    try {
      await updateData(item.id, { name, isActive: item.isActive })
    } catch {
      alert('Could not update profession.')
    }
  }
  const toggle = async (item: Profession) => {
    try {
      await updateData(item.id, { name: item.name, isActive: !item.isActive })
    } catch {
      alert('Could not update profession.')
    }
  }
  const remove = async (id: number) => {
    try {
      await deleteData(id)
    } catch {
      alert('Could not delete profession.')
    }
  }

  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">💼</span>
        <span className="font-semibold text-gray-800">Professions</span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {data.length}
        </span>
        {loading && <span className="text-xs text-gray-400">Syncing…</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {data.map((item) => (
          <ApiChip
            key={item.id}
            name={item.name}
            isActive={item.isActive}
            onEditName={(name) => rename(item, name)}
            onToggle={() => toggle(item)}
            onRemove={() => remove(item.id)}
          />
        ))}
        <AddWithToggle placeholder="e.g. Pilot" onAdd={add} />
      </div>
    </div>
  )
}

/* ─────────────── Employment type (API) ─────────────── */
function EmploymentTypeRow() {
  const { data, loading, createData, updateData, deleteData } = useEmploymentType()

  const add = async (name: string, isActive: boolean) => {
    if (data.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert(`"${name}" already exists.`)
      return
    }
    try {
      await createData({ name, isActive })
    } catch {
      alert('Could not add employment type.')
    }
  }
  const rename = async (item: EmploymentType, name: string) => {
    try {
      await updateData(item.id, { name, isActive: item.isActive })
    } catch {
      alert('Could not update employment type.')
    }
  }
  const toggle = async (item: EmploymentType) => {
    try {
      await updateData(item.id, { name: item.name, isActive: !item.isActive })
    } catch {
      alert('Could not update employment type.')
    }
  }
  const remove = async (id: number) => {
    try {
      await deleteData(id)
    } catch {
      alert('Could not delete employment type.')
    }
  }

  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">📋</span>
        <span className="font-semibold text-gray-800">Employment type</span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {data.length}
        </span>
        {loading && <span className="text-xs text-gray-400">Syncing…</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {data.map((item) => (
          <ApiChip
            key={item.id}
            name={item.name}
            isActive={item.isActive}
            onEditName={(name) => rename(item, name)}
            onToggle={() => toggle(item)}
            onRemove={() => remove(item.id)}
          />
        ))}
        <AddWithToggle placeholder="e.g. Part Time" onAdd={add} />
      </div>
    </div>
  )
}

/* ─────────────── Experience (API) ─────────────── */
function ExperienceRow() {
  const { data, loading, createData, updateData, deleteData } = useExperience()

  const add = async (name: string, isActive: boolean) => {
    if (data.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert(`"${name}" already exists.`)
      return
    }
    try {
      await createData({ name, isActive })
    } catch {
      alert('Could not add experience.')
    }
  }
  const rename = async (item: Experience, name: string) => {
    try {
      await updateData(item.id, { name, isActive: item.isActive })
    } catch {
      alert('Could not update experience.')
    }
  }
  const toggle = async (item: Experience) => {
    try {
      await updateData(item.id, { name: item.name, isActive: !item.isActive })
    } catch {
      alert('Could not update experience.')
    }
  }
  const remove = async (id: number) => {
    try {
      await deleteData(id)
    } catch {
      alert('Could not delete experience.')
    }
  }

  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">⏳</span>
        <span className="font-semibold text-gray-800">Experience</span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {data.length}
        </span>
        {loading && <span className="text-xs text-gray-400">Syncing…</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {data.map((item) => (
          <ApiChip
            key={item.id}
            name={item.name}
            isActive={item.isActive}
            onEditName={(name) => rename(item, name)}
            onToggle={() => toggle(item)}
            onRemove={() => remove(item.id)}
          />
        ))}
        <AddWithToggle placeholder="e.g. 5 yrs" onAdd={add} />
      </div>
    </div>
  )
}


/* ─────────────── Ambition (API) ─────────────── */
function AmbitionRow() {
  const { data, loading, createData, updateData, deleteData } = useAmbition()

  const add = async (name: string, isActive: boolean) => {
    if (data.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert(`"${name}" already exists.`)
      return
    }
    try {
      await createData({ name, isActive })
    } catch {
      alert('Could not add ambition.')
    }
  }
  const rename = async (item: Ambition, name: string) => {
    try {
      await updateData(item.id, { name, isActive: item.isActive })
    } catch {
      alert('Could not update ambition.')
    }
  }
  const toggle = async (item: Ambition) => {
    try {
      await updateData(item.id, { name: item.name, isActive: !item.isActive })
    } catch {
      alert('Could not update ambition.')
    }
  }
  const remove = async (id: number) => {
    try {
      await deleteData(id)
    } catch {
      alert('Could not delete ambition.')
    }
  }

  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">🚀</span>
        <span className="font-semibold text-gray-800">Ambition</span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {data.length}
        </span>
        {loading && <span className="text-xs text-gray-400">Syncing…</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {data.map((item) => (
          <ApiChip
            key={item.id}
            name={item.name}
            isActive={item.isActive}
            onEditName={(name) => rename(item, name)}
            onToggle={() => toggle(item)}
            onRemove={() => remove(item.id)}
          />
        ))}
        <AddWithToggle placeholder="e.g. Visionary" onAdd={add} />
      </div>
    </div>
  )
}



// Strict salary label validator: only "₹11–24 LPA" style ranges pass.
// Requires ₹, two numbers separated by an en-dash, and the LPA unit.
// (This intentionally rejects open-ended "₹60 LPA+" and text labels.)
function validateSalaryLabel(value: string): string | null {
  const ok = /^₹\s*\d+\s*–\s*\d+\s*LPA$/.test(value.trim())
  if (!ok) {
    return 'Use format: ₹11–24 LPA (₹, min–max with en-dash "–", then LPA)'
  }
  const nums = (value.match(/\d+/g) || []).map(Number)
  if (nums.length === 2 && nums[1] <= nums[0]) {
    return 'Max must be greater than min (e.g. ₹11–24 LPA)'
  }
  return null
}

/* ─────────────── Salary range (API) ─────────────── */
function SalaryRangeRow() {
  const { data, loading, createData, updateData, deleteData } = useSalaryRange()

  const add = async (name: string, isActive: boolean) => {
    if (data.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert(`"${name}" already exists.`)
      return
    }
    try {
      await createData({ name, isActive }) // min/max derived in context
    } catch {
      alert('Could not add salary range.')
    }
  }
  const rename = async (item: SalaryRange, name: string) => {
    try {
      await updateData(item.id, { name, isActive: item.isActive })
    } catch {
      alert('Could not update salary range.')
    }
  }
  const toggle = async (item: SalaryRange) => {
    try {
      await updateData(item.id, { name: item.name, isActive: !item.isActive })
    } catch {
      alert('Could not update salary range.')
    }
  }
  const remove = async (id: number) => {
    try {
      await deleteData(id)
    } catch {
      alert('Could not delete salary range.')
    }
  }

  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">💰</span>
        <span className="font-semibold text-gray-800">Salary ranges</span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {data.length}
        </span>
        {loading && <span className="text-xs text-gray-400">Syncing…</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {data.map((item) => (
          <ApiChip
            key={item.id}
            name={item.name}
            isActive={item.isActive}
            onEditName={(name) => rename(item, name)}
            onToggle={() => toggle(item)}
            onRemove={() => remove(item.id)}
            validate={validateSalaryLabel}
          />
        ))}
        <AddWithToggle placeholder="e.g. ₹11–24 LPA" onAdd={add} validate={validateSalaryLabel} />
      </div>
    </div>
  )
}

export default function EducationCarrer() {
  // No static sections remain — all are API-backed. `fields` kept empty
  // so the "Add a new field" scaffolding still works if you use it.
  const [fields, setFields] = useState<Field[]>([
  ])

  const mutateField = (id: string, fn: (f: Field) => Field) =>
    setFields((prev) => prev.map((f) => (f.id === id ? fn(f) : f)))

  const addTag = (id: string, v: string) =>
    mutateField(id, (f) => (f.tags.includes(v) ? f : { ...f, tags: [...f.tags, v] }))

  const removeTag = (id: string, v: string) =>
    mutateField(id, (f) => ({ ...f, tags: f.tags.filter((t) => t !== v) }))

  const editTag = (id: string, oldTag: string, newTag: string) =>
    mutateField(id, (f) =>
      f.tags.includes(newTag) ? f : { ...f, tags: f.tags.map((t) => (t === oldTag ? newTag : t)) }
    )

  const addField = () =>
    setFields((prev) => [
      ...prev,
      { id: `field_${Date.now()}`, emoji: '🏷️', label: 'New field', tags: [], placeholder: 'e.g. Option' },
    ])

  const removeField = (id: string) => setFields((prev) => prev.filter((f) => f.id !== id))

  return (
    <Section title="Education & career">
      <div className="divide-y divide-gray-100">
        {/* Professions (API-backed) */}
        <ProfessionRow />

        {/* Employment type (API-backed) */}
        <EmploymentTypeRow />

        {/* Experience (API-backed) */}
        <ExperienceRow />

        {/* Ambition (API-backed) */}
        <AmbitionRow />

        {/* Salary range (API-backed) */}
        <SalaryRangeRow />

        {/* (any locally-added fields) */}
        {fields.map((field) => (
          <FieldRow
            key={field.id}
            field={field}
            onAddTag={(v) => addTag(field.id, v)}
            onRemoveTag={(t) => removeTag(field.id, t)}
            onEditTag={(oldTag, newTag) => editTag(field.id, oldTag, newTag)}
            onRemoveField={() => removeField(field.id)}
          />
        ))}
      </div>

      
    </Section>
  )
}