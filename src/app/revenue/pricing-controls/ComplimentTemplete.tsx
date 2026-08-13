"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePricingController } from "../../../context/Pricingcontrollercontext";

/* ================= Icons ================= */

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 11.5C21 16.1944 16.9706 20 12 20C10.7345 20 9.53125 19.7548 8.4375 19.3125L3.75 20.25L4.875 16.5C3.70156 15.1211 3 13.3839 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8.5" cy="11.5" r="1" fill="currentColor" />
    <circle cx="12" cy="11.5" r="1" fill="currentColor" />
    <circle cx="15.5" cy="11.5" r="1" fill="currentColor" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

/* ================= Component ================= */

function ComplimentTemplete() {
  const {
    complimentCategories,
    libLoading,
    libBusy,
    libError,
    createComplimentCategory,
    renameComplimentCategory,
    deleteComplimentCategory,
    createComplimentIdea,
    deleteComplimentIdea,
  } = usePricingController();

  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  // Add category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Rename category
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Add template
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplateText, setNewTemplateText] = useState("");

  // Auto-select first category once data loads (or if active one got deleted)
  useEffect(() => {
    if (complimentCategories.length === 0) {
      setActiveCategoryId("");
      return;
    }
    const stillExists = complimentCategories.some(
      (c) => c.id === activeCategoryId,
    );
    if (!stillExists) {
      setActiveCategoryId(complimentCategories[0].id);
    }
  }, [complimentCategories, activeCategoryId]);

  const activeCategory = useMemo(
    () =>
      complimentCategories.find((c) => c.id === activeCategoryId) ??
      complimentCategories[0],
    [complimentCategories, activeCategoryId],
  );

  const totalTemplates = useMemo(
    () =>
      complimentCategories.reduce((sum, c) => sum + c.templates.length, 0),
    [complimentCategories],
  );

  /* ---------- Category actions ---------- */

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name || libBusy) return;
    const newId = await createComplimentCategory(name);
    if (newId) setActiveCategoryId(newId);
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  const handleRenameCategory = async () => {
    const name = renameValue.trim();
    if (!name || !activeCategory || libBusy) return;
    const ok = await renameComplimentCategory(activeCategory.id, name);
    if (ok) {
      setRenameValue("");
      setIsRenaming(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!activeCategory || libBusy) return;
    if (complimentCategories.length <= 1) {
      alert("At least one category is required.");
      return;
    }
    const ok = window.confirm(
      `Delete "${activeCategory.name}" and its ${activeCategory.templates.length} templates?`,
    );
    if (!ok) return;
    await deleteComplimentCategory(activeCategory.id);
  };

  /* ---------- Template actions ---------- */

  const handleAddTemplate = async () => {
    const text = newTemplateText.trim();
    if (!text || !activeCategory || libBusy) return;
    const ok = await createComplimentIdea(activeCategory.id, text);
    if (ok) {
      setNewTemplateText("");
      setIsAddingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (ideaId: string) => {
    if (libBusy) return;
    await deleteComplimentIdea(ideaId);
  };

  /* ================= Render ================= */

  return (
    <div className="mx-auto max-w-8xl px-6 py-4">
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* ---------- Header ---------- */}
      <div className="flex items-start gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-200">
          <ChatIcon />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Compliment Templates
          </h3>
          <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
            Library shown in the app · edit, add &amp; delete templates and categories
          </p>
        </div>
      </div>

      {/* ---------- Error banner ---------- */}
      {libError && (
        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {libError}
        </div>
      )}

      <div
        className={`px-6 py-5 ${
          libLoading || libBusy ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {/* ---------- Category Chips ---------- */}
        <div className="flex flex-wrap items-center gap-2.5">
          {complimentCategories.map((cat) => {
            const isActive = cat.id === activeCategory?.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  setIsRenaming(false);
                  setIsAddingTemplate(false);
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                {cat.name}
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-gray-900/10 dark:text-gray-900"
                      : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                  }`}
                >
                  {cat.templates.length}
                </span>
              </button>
            );
          })}

          {/* + Category */}
          {isAddingCategory ? (
            <div className="inline-flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                  if (e.key === "Escape") {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                  }
                }}
                placeholder="Category name"
                className="h-9 w-40 rounded-full border border-gray-300 px-4 text-sm text-gray-800 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-transparent dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName("");
                }}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:border-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
            >
              + Category
            </button>
          )}
        </div>

        {/* ---------- Loading / empty states ---------- */}
        {libLoading && complimentCategories.length === 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 px-4 py-6 text-center text-sm text-gray-400 dark:border-gray-800 dark:text-gray-500">
            Loading template library...
          </div>
        )}

        {!libLoading && complimentCategories.length === 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 px-4 py-6 text-center text-sm text-gray-400 dark:border-gray-800 dark:text-gray-500">
            No categories yet — add one above to get started.
          </div>
        )}

        {activeCategory && (
          <>
            {/* ---------- Section Header ---------- */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {activeCategory.name} · {activeCategory.templates.length} Templates
              </p>

              <div className="flex items-center gap-2">
                {isRenaming ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameCategory();
                        if (e.key === "Escape") {
                          setIsRenaming(false);
                          setRenameValue("");
                        }
                      }}
                      placeholder="New name"
                      className="h-9 w-40 rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-transparent dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleRenameCategory}
                      className="rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenaming(false);
                        setRenameValue("");
                      }}
                      className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRenaming(true);
                      setRenameValue(activeCategory.name);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Rename
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  className="rounded-lg border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-500 shadow-sm hover:bg-red-50 dark:border-red-500/20 dark:bg-transparent dark:hover:bg-red-500/10"
                >
                  Delete category
                </button>
              </div>
            </div>

            {/* ---------- Template List ---------- */}
            <div className="mt-4 space-y-3">
              {activeCategory.templates.map((template, index) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-50 text-xs font-semibold text-purple-500 dark:bg-purple-500/10 dark:text-purple-400">
                      {index + 1}
                    </span>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {template.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(template.id)}
                    aria-label="Delete template"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/20"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}

              {activeCategory.templates.length === 0 && (
                <div className="rounded-xl border border-gray-200 px-4 py-6 text-center text-sm text-gray-400 dark:border-gray-800 dark:text-gray-500">
                  No templates in this category yet.
                </div>
              )}

              {/* ---------- Add Template ---------- */}
              {isAddingTemplate ? (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 dark:border-gray-700">
                  <input
                    autoFocus
                    type="text"
                    value={newTemplateText}
                    onChange={(e) => setNewTemplateText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTemplate();
                      if (e.key === "Escape") {
                        setIsAddingTemplate(false);
                        setNewTemplateText("");
                      }
                    }}
                    placeholder="Type a new compliment template..."
                    className="h-9 flex-1 rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-transparent dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTemplate}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTemplate(false);
                      setNewTemplateText("");
                    }}
                    className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTemplate(true)}
                  className="w-full rounded-xl border border-dashed border-gray-300 py-3.5 text-sm font-semibold text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600 dark:border-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  + Add template
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ---------- Footer ---------- */}
      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-800">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {totalTemplates} templates · {complimentCategories.length} categories
        </p>
      </div>
    </div>
    </div>
  );
}

export default ComplimentTemplete;