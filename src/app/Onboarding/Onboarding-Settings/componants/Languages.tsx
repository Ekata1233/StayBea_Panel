"use client";

import React, { useState } from "react";
import { FiX, FiLoader } from "react-icons/fi";
import {
  useLanguage,
  type Language as TLanguage,
} from "../../../../context/Languagecontext";

function Section({
  emoji,
  title,
  count,
  children,
}: {
  emoji: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
          {count}
        </span>
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

function LanguageChip({
  language,
  onRename,
  onToggle,
  onRemove,
}: {
  language: TLanguage;
  onRename: (name: string) => void;
  onToggle: (active: boolean) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(language.name);

  const commit = () => {
    setEditing(false);
    const v = draft.trim();
    if (!v || v === language.name) {
      setDraft(language.name);
      return;
    }
    onRename(v);
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
        language.active
          ? "border-gray-200 bg-white text-gray-800"
          : "border-gray-200 bg-gray-100 text-gray-400"
      }`}
    >
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(language.name);
              setEditing(false);
            }
          }}
          className="bg-transparent font-medium text-gray-800 focus:outline-none"
          style={{ width: `${Math.max(draft.length, 2)}ch` }}
        />
      ) : (
        <button
          onClick={() => {
            setDraft(language.name);
            setEditing(true);
          }}
          className="font-medium focus:outline-none"
          title="Click to edit"
        >
          {language.name}
        </button>
      )}
      <Toggle on={language.active} onChange={onToggle} />
      <button
        onClick={onRemove}
        className="text-gray-400 transition hover:text-gray-700"
        aria-label={`Remove ${language.name}`}
      >
        <FiX size={14} />
      </button>
    </span>
  );
}

function AddChip({
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
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white pl-3 pr-1 py-1">
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
    </span>
  );
}

export default function Languages() {
  const { languages, loading, error, refetch, createLanguage, updateLanguage, deleteLanguage } =
    useLanguage();

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e: any) {
      alert(e.message);
      refetch();
    }
  };

  return (
    <Section emoji="🗣️" title="Languages" count={languages.length}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
          <FiLoader className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {languages.map((language) => (
            <LanguageChip
              key={language.id}
              language={language}
              onRename={(name) => run(() => updateLanguage(language.id, { name }))}
              onToggle={(active) => run(() => updateLanguage(language.id, { active }))}
              onRemove={() => {
                if (confirm(`Delete "${language.name}"? This cannot be undone.`)) {
                  run(() => deleteLanguage(language.id));
                }
              }}
            />
          ))}
          <AddChip
            placeholder="e.g. Bhojpuri"
            onAdd={(name) => run(() => createLanguage(name))}
          />
        </div>
      )}
    </Section>
  );
}