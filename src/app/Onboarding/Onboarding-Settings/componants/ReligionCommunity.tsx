"use client";

import React, { useState } from "react";
import { FiX, FiPlus, FiLoader } from "react-icons/fi";
import {
  useReligion,
  type Religion as TReligion,
  type Community,
  type CommunityDraft,
} from "../../../../context/ReligionContext";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      disabled={disabled}
      title="Active"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
        on ? "bg-rose-500" : "bg-gray-200"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          on ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function EditableText({
  value,
  onSave,
  className = "",
  bold = false,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  bold?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    const v = draft.trim();
    if (!v || v === value) {
      setDraft(value);
      return;
    }
    onSave(v);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`border-b border-rose-300 bg-transparent text-gray-800 focus:outline-none ${
          bold ? "font-semibold" : ""
        } ${className}`}
        style={{ width: `${Math.max(draft.length, 4)}ch` }}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`text-gray-800 hover:text-rose-600 ${bold ? "font-semibold" : ""} ${className}`}
      title="Click to edit"
    >
      {value}
    </button>
  );
}

function AddInput({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (v: string) => void;
}) {
  const [value, setValue] = useState("");
  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onAdd(v);
    setValue("");
  };
  return (
    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white pl-3 pr-1 py-0.5">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={placeholder}
        className="w-36 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
      />
      <button
        onClick={submit}
        className="rounded-full px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
      >
        Add
      </button>
    </div>
  );
}

function CommunityChip({
  community,
  onRename,
  onToggle,
  onRemove,
}: {
  community: Community;
  onRename: (name: string) => void;
  onToggle: (active: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
        community.active
          ? "border-gray-200 bg-gray-50 text-gray-700"
          : "border-gray-200 bg-gray-100 text-gray-400"
      }`}
    >
      <EditableText value={community.name} onSave={onRename} />
      <Toggle on={community.active} onChange={onToggle} />
      <button
        onClick={onRemove}
        className="text-gray-400 transition hover:text-gray-700"
        aria-label={`Remove ${community.name}`}
      >
        <FiX size={14} />
      </button>
    </span>
  );
}

function ReligionRow({
  religion,
  onRun,
}: {
  religion: TReligion;
  onRun: (fn: () => Promise<void>) => Promise<void>;
}) {
  const {
    updateReligion,
    deleteReligion,
    addCommunity,
    updateCommunity,
    deleteCommunity,
  } = useReligion();

  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-3">
        <Toggle
          on={religion.active}
          onChange={(active) => onRun(() => updateReligion(religion.id, { active }))}
        />
        <EditableText
          value={religion.name}
          bold
          onSave={(name) => onRun(() => updateReligion(religion.id, { name }))}
        />
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {religion.communities.length}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">priority</span>
          <input
            type="number"
            defaultValue={religion.priority}
            onBlur={(e) => {
              const p = Number(e.target.value);
              if (!Number.isNaN(p) && p !== religion.priority) {
                onRun(() => updateReligion(religion.id, { priority: p }));
              }
            }}
            className="w-14 rounded border border-gray-200 px-2 py-0.5 text-sm focus:border-rose-300 focus:outline-none"
          />
          <button
            onClick={() => {
              if (confirm(`Delete "${religion.name}" and all its communities?`)) {
                onRun(() => deleteReligion(religion.id));
              }
            }}
            className="text-gray-300 transition hover:text-gray-500"
            aria-label={`Delete ${religion.name}`}
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-12">
        {religion.communities.map((c) => (
          <CommunityChip
            key={c.id}
            community={c}
            onRename={(name) => onRun(() => updateCommunity(religion.id, c.id, { name }))}
            onToggle={(active) => onRun(() => updateCommunity(religion.id, c.id, { active }))}
            onRemove={() => onRun(() => deleteCommunity(religion.id, c.id))}
          />
        ))}
        <AddInput
          placeholder="Add community"
          onAdd={(name) => onRun(() => addCommunity(religion.id, name))}
        />
      </div>
    </div>
  );
}

function NewReligionDraft({
  onRun,
}: {
  onRun: (fn: () => Promise<void>) => Promise<void>;
}) {
  const { addReligion, religions } = useReligion();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<number>(religions.length + 1);
  const [active, setActive] = useState(true);
  const [communities, setCommunities] = useState<CommunityDraft[]>([]);
  const [pendingCommunity, setPendingCommunity] = useState("");

  const reset = () => {
    setName("");
    setPriority(religions.length + 1);
    setActive(true);
    setCommunities([]);
    setPendingCommunity("");
    setOpen(false);
  };

  // Fold any text still sitting in the community input into the list, and return
  // the resulting array synchronously (state updates are async, so we can't rely
  // on `communities` right after calling the setter).
  const flushCommunities = (): CommunityDraft[] => {
    const v = pendingCommunity.trim();
    if (
      !v ||
      communities.some((c) => c.name.trim().toLowerCase() === v.toLowerCase())
    ) {
      return communities;
    }
    const next = [
      ...communities,
      { name: v, priority: communities.length + 1, active: true },
    ];
    setCommunities(next);
    setPendingCommunity("");
    return next;
  };

  const mutateCommunity = (i: number, patch: Partial<CommunityDraft>) =>
    setCommunities((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const removeCommunity = (i: number) =>
    setCommunities((prev) => prev.filter((_, j) => j !== i));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-400 transition hover:border-rose-200 hover:text-rose-600"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
          <FiPlus size={14} />
        </span>
        Add a new religion
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/40 p-4">
      {/* Religion header: name, priority, active */}
      <div className="mb-4 flex items-center gap-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Religion name, e.g. Hindu"
          className="w-56 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-rose-300 focus:outline-none"
        />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">priority</span>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="w-14 rounded border border-gray-200 px-2 py-1 text-sm focus:border-rose-300 focus:outline-none"
          />
        </div>
        <label className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
          Active
          <Toggle on={active} onChange={setActive} />
        </label>
      </div>

      {/* Communities builder */}
      <div className="mb-4 pl-4">
        <div className="mb-2 text-xs font-medium text-gray-500">Communities</div>
        <div className="flex flex-wrap items-center gap-2">
          {communities.map((c, i) => (
            <span
              key={`${c.name}-${i}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                c.active
                  ? "border-gray-200 bg-white text-gray-700"
                  : "border-gray-200 bg-gray-100 text-gray-400"
              }`}
            >
              <span>{c.name}</span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                p
                <input
                  type="number"
                  value={c.priority}
                  onChange={(e) => mutateCommunity(i, { priority: Number(e.target.value) })}
                  className="w-10 rounded border border-gray-200 px-1 py-0.5 text-[11px] focus:border-rose-300 focus:outline-none"
                />
              </span>
              <Toggle on={c.active} onChange={(v) => mutateCommunity(i, { active: v })} />
              <button
                onClick={() => removeCommunity(i)}
                className="text-gray-400 transition hover:text-gray-700"
                aria-label={`Remove ${c.name}`}
              >
                <FiX size={14} />
              </button>
            </span>
          ))}
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white pl-3 pr-1 py-0.5">
            <input
              value={pendingCommunity}
              onChange={(e) => setPendingCommunity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") flushCommunities();
              }}
              placeholder="Add community"
              className="w-36 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              onClick={() => flushCommunities()}
              className="rounded-full px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={!name.trim()}
          onClick={() =>
            onRun(async () => {
              const finalCommunities = flushCommunities();
              await addReligion({ name, priority, active, communities: finalCommunities });
              reset();
            })
          }
          className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-40"
        >
          Create religion
        </button>
        <button
          onClick={reset}
          className="rounded-lg px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Religion() {
  const { religions, loading, error, refetch } = useReligion();

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e: any) {
      alert(e.message);
      refetch();
    }
  };

  return (
    <Section title="Religion & Community">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
          <FiLoader className="animate-spin" /> Loading…
        </div>
      ) : religions.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          No religions yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {religions.map((r) => (
            <ReligionRow key={r.id} religion={r} onRun={run} />
          ))}
        </div>
      )}

      <NewReligionDraft onRun={run} />
    </Section>
  );
}