"use client";

import React, { useState } from "react";
import { FiX, FiPlus, FiLoader } from "react-icons/fi";
import {
  useFamilyProfile,
  type CategoryGroup,
  type MasterValue,
  type FamilyIncome,
} from "../../../../context/Familyprofilecontext";

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
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      title="Active"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
        on ? "bg-rose-500" : "bg-gray-200"
      }`}
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
  bold = false,
}: {
  value: string;
  onSave: (v: string) => void;
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
        }`}
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
      className={`text-gray-800 hover:text-rose-600 ${bold ? "font-semibold" : ""}`}
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
        className="w-32 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
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

function ValueChip({
  mv,
  onRename,
  onToggle,
  onRemove,
}: {
  mv: MasterValue;
  onRename: (value: string) => void;
  onToggle: (active: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
        mv.active
          ? "border-gray-200 bg-gray-50 text-gray-700"
          : "border-gray-200 bg-gray-100 text-gray-400"
      }`}
    >
      <EditableText value={mv.value} onSave={onRename} />
      <Toggle on={mv.active} onChange={onToggle} />
      <button
        onClick={onRemove}
        className="text-gray-400 transition hover:text-gray-700"
        aria-label={`Remove ${mv.value}`}
      >
        <FiX size={14} />
      </button>
    </span>
  );
}

function CategoryRow({
  group,
  onRun,
}: {
  group: CategoryGroup;
  onRun: (fn: () => Promise<void>) => Promise<void>;
}) {
  const { updateCategory, deleteCategory, addValue, updateValue, deleteValue } =
    useFamilyProfile();

  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        <EditableText
          value={group.title}
          bold
          onSave={(title) => onRun(() => updateCategory(group.id, { title }))}
        />
        <span className="font-mono text-[11px] text-gray-400">{group.code}</span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {group.values.length}
        </span>
        <button
          onClick={() => {
            if (confirm(`Delete category "${group.title}"?`)) {
              onRun(() => deleteCategory(group.id));
            }
          }}
          className="ml-auto text-gray-300 transition hover:text-gray-500"
          aria-label={`Remove ${group.title}`}
        >
          <FiX size={14} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {group.values.map((mv) => (
          <ValueChip
            key={mv.id}
            mv={mv}
            onRename={(value) => onRun(() => updateValue(group.id, mv.id, { value }))}
            onToggle={(active) => onRun(() => updateValue(group.id, mv.id, { active }))}
            onRemove={() => onRun(() => deleteValue(group.id, mv.id))}
          />
        ))}
        <AddInput
          placeholder="e.g. Nuclear"
          onAdd={(value) => onRun(() => addValue(group.id, value))}
        />
      </div>
    </div>
  );
}

function NewCategoryDraft({
  onRun,
}: {
  onRun: (fn: () => Promise<void>) => Promise<void>;
}) {
  const { addCategory } = useFamilyProfile();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");

  const reset = () => {
    setTitle("");
    setCode("");
    setOpen(false);
  };


  
}

// Formats a min/max amount pair into a readable range for display.
function formatRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max == null) return `${min}+`;
  if (min == null && max != null) return `up to ${max}`;
  return `${min}–${max}`;
}

// Strict salary label validator: only "₹11–24 LPA" style ranges pass.
// Requires ₹, two numbers separated by an en-dash, and the LPA unit.
function validateSalaryLabel(value: string): string | null {
  const ok = /^₹\s*\d+\s*–\s*\d+\s*LPA$/.test(value.trim());
  if (!ok) {
    return 'Use format: ₹11–24 LPA (₹, min–max with en-dash "–", then LPA)';
  }
  const nums = (value.match(/\d+/g) || []).map(Number);
  if (nums.length === 2 && nums[1] <= nums[0]) {
    return "Max must be greater than min (e.g. ₹11–24 LPA)";
  }
  return null;
}

function IncomeChip({
  income,
  onRename,
  onToggle,
  onRemove,
}: {
  income: FamilyIncome;
  onRename: (title: string) => void;
  onToggle: (active: boolean) => void;
  onRemove: () => void;
}) {
  const range = formatRange(income.minAmount, income.maxAmount);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
        income.active
          ? "border-gray-200 bg-gray-50 text-gray-700"
          : "border-gray-200 bg-gray-100 text-gray-400"
      }`}
    >
      <EditableText value={income.title} onSave={onRename} />
      {/* {range && (
        <span className="font-mono text-[11px] text-gray-400">{range}</span>
      )} */}
      <Toggle on={income.active} onChange={onToggle} />
      <button
        onClick={onRemove}
        className="text-gray-400 transition hover:text-gray-700"
        aria-label={`Remove ${income.title}`}
      >
        <FiX size={14} />
      </button>
    </span>
  );
}

function IncomeRow({
  onRun,
}: {
  onRun: (fn: () => Promise<void>) => Promise<void>;
}) {
  const { incomes, addIncome, updateIncome, deleteIncome } = useFamilyProfile();
  const [title, setTitle] = useState("");

  const submit = () => {
    const err = validateSalaryLabel(title);
    if (err) {
      alert(err);
      return;
    }
    if (incomes.some((i) => i.title.toLowerCase() === title.trim().toLowerCase())) {
      alert(`"${title.trim()}" already exists.`);
      return;
    }
    onRun(async () => {
      await addIncome(title);
      setTitle("");
    });
  };

  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">💰</span>
        <span className="font-semibold text-gray-800">Family income</span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {incomes.length}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {incomes.map((inc) => (
          <IncomeChip
            key={inc.id}
            income={inc}
            onRename={(t) => {
              const err = validateSalaryLabel(t);
              if (err) {
                alert(err);
                return;
              }
              onRun(() => updateIncome(inc.id, { title: t }));
            }}
            onToggle={(active) => onRun(() => updateIncome(inc.id, { active }))}
            onRemove={() => onRun(() => deleteIncome(inc.id))}
          />
        ))}

        <div className="inline-flex items-center rounded-full border border-gray-200 bg-white pl-3 pr-1 py-0.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. ₹11–24 LPA"
            className="w-40 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            onClick={submit}
            className="rounded-full px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section grouping (design sequence) — display only                  */
/* ------------------------------------------------------------------ */

// Maps each flat category into one of the sections from the design, in order.
// Match is by title prefix so it's robust to the "—" dash character.
const SECTION_DEFS: {
  title: string;
  icon: string;
  belongs: (t: string) => boolean;
}[] = [
  {
    title: "Family type",
    icon: "👨‍👩‍👧",
    belongs: (t) => t.startsWith("family status") || t.startsWith("family type"),
  },
  { title: "Father", icon: "👴", belongs: (t) => t.startsWith("father") },
  { title: "Mother", icon: "👩", belongs: (t) => t.startsWith("mother") },
  { title: "Siblings", icon: "👫", belongs: (t) => t.startsWith("sibling") },
  {
    title: "Family home",
    icon: "🏠",
    belongs: (t) => t.startsWith("family home") || t.startsWith("native"),
  },
];

function SectionCard({
  icon,
  title,
  count,
  children,
}: {
  icon: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-base font-bold text-gray-900">{title}</span>
        <span className="text-xs font-medium text-rose-500">
          {count} {count === 1 ? "part" : "parts"}
        </span>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

export default function Family() {
  const { groups, loading, error, refetch } = useFamilyProfile();

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e: any) {
      alert(e.message);
      refetch();
    }
  };

  // Group the flat category list into the design's sections, in order.
  const norm = (s: string) => s.trim().toLowerCase();
  const sections = SECTION_DEFS.map((def) => ({
    ...def,
    groups: groups.filter((g) => def.belongs(norm(g.title))),
  }));
  const matched = new Set(sections.flatMap((s) => s.groups.map((g) => g.id)));
  const others = groups.filter((g) => !matched.has(g.id));

  return (
    <Section title="Family">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
          <FiLoader className="animate-spin" /> Loading…
        </div>
      ) : groups.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          No categories yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map(
            (s) =>
              s.groups.length > 0 && (
                <SectionCard
                  key={s.title}
                  icon={s.icon}
                  title={s.title}
                  count={s.groups.length}
                >
                  {s.groups.map((g) => (
                    <CategoryRow key={g.id} group={g} onRun={run} />
                  ))}
                </SectionCard>
              )
          )}

          {/* Any categories that didn't match a known section */}
          {others.length > 0 && (
            <SectionCard icon="📁" title="Other" count={others.length}>
              {others.map((g) => (
                <CategoryRow key={g.id} group={g} onRun={run} />
              ))}
            </SectionCard>
          )}

          {/* Family income — its own card (IncomeRow renders its own header) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <IncomeRow onRun={run} />
          </div>
        </div>
      )}
    </Section>
  );
}    