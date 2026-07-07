'use client'

import React, { useState } from 'react'
import { FiX, FiPlus } from 'react-icons/fi'

type Field = { 
  id: string; 
  emoji: string; 
  label: string; 
  tags: string[]; 
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
      <button
        onClick={startEdit}
        className="focus:outline-none"
        title="Click to edit"
      >
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
          <Chip
            key={tag}
            label={tag}
            onRemove={() => onRemoveTag(tag)}
            onEdit={(newValue) => onEditTag(tag, newValue)}
          />
        ))}
        <AddInput placeholder={field.placeholder} onAdd={onAddTag} />
      </div>
    </div>
  )
}

export default function Family() {
  const [fields, setFields] = useState<Field[]>([
    // Family type section
    { 
      id: 'family_status', 
      emoji: '👨‍👩‍👧‍👦', 
      label: 'Family status', 
      tags: ['Middle class', 'Upper middle class', 'Affluent', 'Self-made', 'Prefer not to say'], 
      placeholder: 'e.g. Upper middle class' 
    },
    { 
      id: 'family_type', 
      emoji: '🏠', 
      label: 'Family type', 
      tags: ['Nuclear', 'Joint family', 'Extended', 'Independent'], 
      placeholder: 'e.g. Nuclear' 
    },
    // Father section
    { 
      id: 'father_occupation', 
      emoji: '👨', 
      label: 'Father – occupation', 
      tags: ['Business owner', 'Government service', 'Private sector', 'Retired', 'Doctor', 'Engineer', 'Farmer', 'Not disclosed'], 
      placeholder: 'e.g. Retired banker' 
    },
    { 
      id: 'father_organisation', 
      emoji: '🏢', 
      label: 'Father – organisation', 
      tags: ['Government', 'Private company', 'Own business', 'Self-employed', 'Retired', 'Not disclosed'], 
      placeholder: 'e.g. Bank of Mahara' 
    },
    // Mother section
    { 
      id: 'mother_occupation', 
      emoji: '👩', 
      label: 'Mother – occupation', 
      tags: ['Homemaker', 'Working professional', 'Business owner', 'Government service', 'Teacher', 'Retired', 'Not disclosed'], 
      placeholder: 'e.g. Homemaker' 
    },
    { 
      id: 'mother_organisation', 
      emoji: '🏢', 
      label: 'Mother – organisation', 
      tags: ['Not applicable', 'Private company', 'Government', 'Own business', 'Self-employed', 'Not disclosed'], 
      placeholder: 'e.g. Former school' 
    },
    // Siblings section
    { 
      id: 'sibling_relation', 
      emoji: '👫', 
      label: 'Sibling – relation', 
      tags: ['Only child', '1 younger sister', '1 younger brother', '1 older sister', '1 older brother', '2 or more siblings'], 
      placeholder: 'e.g. 1 younger sister' 
    },
    { 
      id: 'sibling_marital', 
      emoji: '💍', 
      label: 'Sibling – marital status', 
      tags: ['Not applicable', 'Unmarried', 'Married', 'Engaged'], 
      placeholder: 'e.g. Unmarried' 
    },
    { 
      id: 'sibling_occupation', 
      emoji: '💼', 
      label: 'Sibling – occupation', 
      tags: ['Not applicable', 'Studying', 'Working', 'Business', 'Homemaker'], 
      placeholder: 'e.g. Studying' 
    },
    // Family home section
    { 
      id: 'family_home_city', 
      emoji: '🏡', 
      label: 'Family home – city', 
      tags: ['Same city', 'Different city', 'Native town', 'Abroad'], 
      placeholder: 'e.g. Pune' 
    },
    { 
      id: 'native_place', 
      emoji: '📍', 
      label: 'Native place', 
      tags: ['Same as current', 'Naashik', 'Nagpur', 'Kolhapur', 'Other city', 'Village / town'], 
      placeholder: 'e.g. Naashik' 
    },
    // Family income
    { 
      id: 'family_income', 
      emoji: '💰', 
      label: 'Family income', 
      tags: ['Under ₹10 L/year', '₹10–25 L/year', '₹25–40 L/year', '₹40 L–1 Cr/year', '₹1 Cr+/year', 'Prefer not to say'], 
      placeholder: 'e.g. ₹25–40 L/year' 
    },
  ])

  const mutateField = (id: string, fn: (f: Field) => Field) =>
    setFields((prev) => prev.map((f) => (f.id === id ? fn(f) : f)))

  const addTag = (id: string, v: string) =>
    mutateField(id, (f) => (f.tags.includes(v) ? f : { ...f, tags: [...f.tags, v] }))
  
  const removeTag = (id: string, v: string) =>
    mutateField(id, (f) => ({ ...f, tags: f.tags.filter((t) => t !== v) }))

  const editTag = (id: string, oldTag: string, newTag: string) =>
    mutateField(id, (f) =>
      f.tags.includes(newTag)
        ? f // block duplicates
        : { ...f, tags: f.tags.map((t) => (t === oldTag ? newTag : t)) }
    )

  const addField = () =>
    setFields((prev) => [
      ...prev,
      { id: `field_${Date.now()}`, emoji: '🏷️', label: 'New field', tags: [], placeholder: 'e.g. Option' },
    ])

  const removeField = (id: string) =>
    setFields((prev) => prev.filter((f) => f.id !== id))

  return (
    <Section title="Family">
      <div className="divide-y divide-gray-100">
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
      <button
        onClick={addField}
        className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-400 transition hover:border-rose-200 hover:text-rose-600"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
          <FiPlus size={14} />
        </span>
        Add a new field…
        <span className="font-medium text-rose-600">+ Add field</span>
      </button>
    </Section>
  )
}