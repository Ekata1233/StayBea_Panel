'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FiX, FiPlus } from 'react-icons/fi'
// Adjust these two paths to wherever they live in your project:
import { useInterestedIn } from '@/context/InterestedInContext'
import { useFlowType } from '@/utils/flowType'

type Field = {
  id: string
  emoji: string
  label: string
  tags: string[]
  placeholder: string
  hasImages?: boolean
  tagImages?: Record<string, string> // tag label -> image URL / object URL
}

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3C/svg%3E"

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
  image,
  imageEditable = false,
  onRemove,
  onEdit,
  onPickFile,
}: {
  label: string
  image?: string
  imageEditable?: boolean
  onRemove: () => void
  onEdit: (newValue: string) => void
  onPickFile?: (file: File) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    onEdit(v) // parent auto-saves
  }

  const cancel = () => {
    setDraft(label)
    setEditing(false)
  }

  const pickImage = () => fileInputRef.current?.click()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB.')
      return
    }
    onPickFile?.(file) // parent builds preview + auto-saves
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
      {imageEditable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={pickImage}
            title="Click to choose an image"
            className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200 focus:outline-none"
          >
            {image ? (
              <img
                src={image}
                alt={label}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = FALLBACK_IMG
                }}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] font-semibold text-gray-500">
                {label.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </>
      )}
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

// Add control. When withImage is true a "+" opens a file picker (shows a
// thumbnail once chosen); you type the name and press Enter / click Add to
// commit name + image together.
function AddInput({
  placeholder,
  withImage = false,
  onAdd,
}: {
  placeholder: string
  withImage?: boolean
  onAdd: (v: string, file?: File) => void
}) {
  const [value, setValue] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) {
      alert('Please choose an image file.')
      return
    }
    if (f.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB.')
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const submit = () => {
    const v = value.trim()
    if (!v) return
    if (withImage && !file) {
      alert('Choose an image first (click the + on the left).')
      return
    }
    onAdd(v, file ?? undefined)
    setValue('')
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview('')
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-gray-200 bg-white pr-1 py-0.5 ${
        withImage ? 'pl-1' : 'pl-3'
      }`}
    >
      {withImage && (
        <>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Choose image"
            className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-400 transition hover:bg-rose-50 hover:text-rose-500"
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <FiPlus size={14} />
            )}
          </button>
        </>
      )}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        className={`w-32 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none ${
          withImage ? 'pl-1' : ''
        }`}
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
  titleValue,
  onTitleChange,
  onTitleCommit,
  onRemoveTag,
  onAddTag,
  onEditTag,
  onPickFile,
  onRemoveField,
}: {
  field: Field
  titleValue?: string
  onTitleChange?: (v: string) => void
  onTitleCommit?: () => void
  onRemoveTag: (tag: string) => void
  onAddTag: (v: string, file?: File) => void
  onEditTag: (oldTag: string, newTag: string) => void
  onPickFile: (tag: string, file: File) => void
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

      {/* Editable API title (only rendered for the section that passes a handler). */}
      {onTitleChange && (
        <input
          value={titleValue ?? ''}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={() => onTitleCommit?.()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur()
          }}
          placeholder="Section title — e.g. Who are you interested in seeing for a Date?"
          className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-300 focus:outline-none"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {field.tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            image={field.tagImages?.[tag]}
            imageEditable={!!field.hasImages}
            onRemove={() => onRemoveTag(tag)}
            onEdit={(newValue) => onEditTag(tag, newValue)}
            onPickFile={(file) => onPickFile(tag, file)}
          />
        ))}
        <AddInput placeholder={field.placeholder} withImage={!!field.hasImages} onAdd={onAddTag} />
      </div>
    </div>
  )
}

export default function IdentityAccess() {
  const { data, createData, loading } = useInterestedIn()
  const flowType = useFlowType()

  const [fields, setFields] = useState<Field[]>([
    // Gender stays static / local — untouched by the API.
    { id: 'gender', emoji: '⚧', label: 'Gender options', tags: ['Woman', 'Man', 'Non-binary'], placeholder: 'e.g. Genderfluid' },
    // Interested is populated from the API in the effect below.
    { id: 'interested', emoji: '❤️', label: 'Interested in', tags: [], placeholder: 'e.g. Non-binary', hasImages: true, tagImages: {} },
  ])

  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({})
  const [title, setTitle] = useState('')

  // Auto-save plumbing: refs mirror latest state so debounced save reads fresh data.
  const fieldsRef = useRef(fields)
  const pendingRef = useRef(pendingFiles)
  const titleRef = useRef(title)
  const lastSavedTitleRef = useRef('') // avoids re-saving when title didn't change
  useEffect(() => { fieldsRef.current = fields }, [fields])
  useEffect(() => { pendingRef.current = pendingFiles }, [pendingFiles])
  useEffect(() => { titleRef.current = title }, [title])

  const [dirty, setDirty] = useState(0)
  const markDirty = () => setDirty((d) => d + 1)

  const savingRef = useRef(false)
  const rerunRef = useRef(false)
  const [savingUi, setSavingUi] = useState(false)

  // Hydrate the Interested in field from the API response (does NOT mark dirty).
  useEffect(() => {
    const rec = data?.[0]
    if (!rec) return
    setTitle(rec.title || '')
    lastSavedTitleRef.current = rec.title || ''
    setFields((prev) =>
      prev.map((f) =>
        f.id === 'interested'
          ? {
              ...f,
              tags: rec.genderImages.map((g) => g.gender),
              tagImages: Object.fromEntries(rec.genderImages.map((g) => [g.gender, g.image])),
            }
          : f
      )
    )
    setPendingFiles({})
  }, [data])

  const mutateField = (id: string, fn: (f: Field) => Field) =>
    setFields((prev) => prev.map((f) => (f.id === id ? fn(f) : f)))

  // Commit title on blur/Enter — only if it actually changed.
  const commitTitle = () => {
    if (titleRef.current !== lastSavedTitleRef.current) markDirty()
  }

  // Add option (interested carries an image + auto-saves; gender is local text-only).
  const addTag = (id: string, v: string, file?: File) => {
    let added = false
    mutateField(id, (f) => {
      if (f.tags.includes(v)) {
        alert(`"${v}" already exists.`)
        return f
      }
      added = true
      const preview = file ? URL.createObjectURL(file) : undefined
      return {
        ...f,
        tags: [...f.tags, v],
        tagImages: preview ? { ...(f.tagImages ?? {}), [v]: preview } : f.tagImages,
      }
    })
    if (added && id === 'interested') {
      if (file) setPendingFiles((p) => ({ ...p, [v]: file }))
      markDirty()
    }
  }

  const removeTag = (id: string, v: string) => {
    mutateField(id, (f) => {
      const nextImages = f.tagImages ? { ...f.tagImages } : undefined
      if (nextImages) delete nextImages[v]
      return { ...f, tags: f.tags.filter((t) => t !== v), tagImages: nextImages }
    })
    if (id === 'interested') {
      setPendingFiles((p) => {
        if (!(v in p)) return p
        const n = { ...p }
        delete n[v]
        return n
      })
      markDirty()
    }
  }

  const editTag = (id: string, oldTag: string, newTag: string) => {
    let changed = false
    mutateField(id, (f) => {
      if (f.tags.includes(newTag)) return f
      changed = true
      const nextImages = f.tagImages ? { ...f.tagImages } : undefined
      if (nextImages && oldTag in nextImages) {
        nextImages[newTag] = nextImages[oldTag]
        delete nextImages[oldTag]
      }
      return { ...f, tags: f.tags.map((t) => (t === oldTag ? newTag : t)), tagImages: nextImages }
    })
    if (changed && id === 'interested') {
      setPendingFiles((p) => {
        if (!(oldTag in p)) return p
        const n = { ...p }
        n[newTag] = n[oldTag]
        delete n[oldTag]
        return n
      })
      markDirty()
    }
  }

  const pickFile = (id: string, tag: string, file: File) => {
    const previewUrl = URL.createObjectURL(file)
    mutateField(id, (f) => ({ ...f, tagImages: { ...(f.tagImages ?? {}), [tag]: previewUrl } }))
    if (id === 'interested') {
      setPendingFiles((p) => ({ ...p, [tag]: file }))
      markDirty()
    }
  }

  const addField = () =>
    setFields((prev) => [
      ...prev,
      { id: `field_${Date.now()}`, emoji: '🏷️', label: 'New field', tags: [], placeholder: 'e.g. Option' },
    ])

  const removeField = (id: string) => setFields((prev) => prev.filter((f) => f.id !== id))

  // Build multipart from current refs and POST (createData refetches).
  const buildAndSave = async () => {
    const field = fieldsRef.current.find((f) => f.id === 'interested')
    if (!field || field.tags.length === 0) return // backend needs ≥1 image; title alone can't save
    if (!flowType) return

    const fd = new FormData()
    fd.append('flowType', flowType)
    fd.append('title', titleRef.current)

    for (const tag of field.tags) {
      const file = pendingRef.current[tag]
      if (file) {
        fd.append('gender', tag)
        fd.append('images', file)
        continue
      }
      // Unchanged option → current backend needs a File, so re-wrap the existing URL.
      // (Apply the backend existingImages patch to remove this re-download + CORS need.)
      const url = field.tagImages?.[tag]
      if (!url || !/^https?:/i.test(url)) return // option without an image yet: skip this save
      const res = await fetch(url)
      const blob = await res.blob()
      const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg')
      fd.append('gender', tag)
      fd.append('images', new File([blob], `${tag}.${ext}`, { type: blob.type }))
    }

    await createData(fd)
    lastSavedTitleRef.current = titleRef.current
    setPendingFiles({})
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
      alert('Auto-save failed. If an existing image could not be reloaded (CORS), re-pick that image.')
    } finally {
      savingRef.current = false
      setSavingUi(false)
    }
  }

  // Debounced auto-save: coalesces rapid edits into one POST.
  useEffect(() => {
    if (dirty === 0) return
    const t = setTimeout(() => {
      void persist()
    }, 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty])

  const pendingCount = Object.keys(pendingFiles).length

  return (
    <Section title="Identity & access">
      <div className="divide-y divide-gray-100">
        {fields.map((field) => (
          <FieldRow
            key={field.id}
            field={field}
            titleValue={field.id === 'interested' ? title : undefined}
            onTitleChange={field.id === 'interested' ? setTitle : undefined}
            onTitleCommit={field.id === 'interested' ? commitTitle : undefined}
            onAddTag={(v, file) => addTag(field.id, v, file)}
            onRemoveTag={(t) => removeTag(field.id, t)}
            onEditTag={(oldTag, newTag) => editTag(field.id, oldTag, newTag)}
            onPickFile={(tag, file) => pickFile(field.id, tag, file)}
            onRemoveField={() => removeField(field.id)}
          />
        ))}
      </div>

      {/* Auto-save status (button removed). */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        <span>
          {savingUi || loading ? 'Saving…' : dirty > 0 ? 'Pending changes…' : 'All changes saved'}
        </span>
        {pendingCount > 0 && <span>{pendingCount} new image(s) pending</span>}
      </div>

      {/* <button
        onClick={addField}
        className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-400 transition hover:border-rose-200 hover:text-rose-600"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
          <FiPlus size={14} />
        </span>
        Add a new field…
        <span className="font-medium text-rose-600">+ Add field</span>
      </button> */}
    </Section>
  )
}