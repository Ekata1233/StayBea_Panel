"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { GiftItem, GiftsProvider, useGifts } from "@/context/GiftsContext";
import React, { useEffect, useRef, useState } from "react";
import GiftsData from "./GiftsData";

/* ---------- Small pieces ---------- */

function StatCard({
  icon,
  iconBg,
  value,
  label,
  delta,
}: {
  icon: string;
  iconBg: string;
  value: string;
  label: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EBE7E0] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${iconBg}`}
        >
          {icon}
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[#E7F6ED] px-2.5 py-1 text-xs font-semibold text-[#1FA05A]">
          ▲ {delta}
        </span>
      </div>
      <h3 className="mt-5 text-[32px] font-bold leading-none text-[#1C1B1A]">
        {value}
      </h3>
      <p className="mt-2 text-sm text-[#8A857D]">{label}</p>
    </div>
  );
}

function Toggle({
  on,
  busy,
  onChange,
}: {
  on: boolean;
  busy?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={busy}
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full transition-colors duration-200 disabled:opacity-60 ${
        on ? "bg-[#2FBE6B]" : "bg-[#D8D4CC]"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
          on ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function GiftRow({
  gift,
  toggling,
  deleting,
  onToggle,
  onEdit,
  onDelete,
}: {
  gift: GiftItem;
  toggling: boolean;
  deleting: boolean;
  onToggle: (gift: GiftItem) => void;
  onEdit: (gift: GiftItem) => void;
  onDelete: (gift: GiftItem) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#EBE7E0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: image + info */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#F0EDE7] bg-[#FAF8F5] text-2xl">
          {gift.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gift.image}
              alt={gift.name}
              className="h-full w-full object-cover"
            />
          ) : (
            "🎁"
          )}
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h4 className="text-base font-bold text-[#1C1B1A]">{gift.name}</h4>
            <span className="rounded-md bg-[#F1EEE9] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#8A857D]">
              {gift.categoryName || "—"}
            </span>
          </div>
          <p className="mt-1.5 text-sm italic text-[#6F6A63]">
            &ldquo;{gift.triggerLine}&rdquo;
          </p>
          {gift.receiverLine && (
            <p className="mt-1 text-xs text-[#A39E96]">
              Receiver sees: &ldquo;{gift.receiverLine}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Right: price + toggle + actions */}
      <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end sm:gap-3">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 rounded-lg bg-[#F1EEE9] px-3 py-1 text-sm font-bold text-[#1C1B1A]">
            🪙 {gift.coinCost}
          </span>
          <Toggle
            on={gift.isLive}
            busy={toggling}
            onChange={() => onToggle(gift)}
          />
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onEdit(gift)}
            className="rounded-lg border border-[#E5E1DA] bg-white px-4 py-1.5 text-sm font-semibold text-[#1C1B1A] transition-colors hover:bg-[#FAF8F5]"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(gift)}
            disabled={deleting}
            className="rounded-lg border border-[#F5DAD7] bg-white px-4 py-1.5 text-sm font-semibold text-[#E5484D] transition-colors hover:bg-[#FDF3F2] disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page content (inside GiftsProvider) ---------- */

const TRIGGER_MAX = 90;
const RECEIVER_MAX = 90;

const EMPTY_GIFT_FORM = {
  name: "",
  categoryId: "",
  coins: 50,
  triggerLine: "",
  receiverLine: "",
  live: true,
};

function GiftsPageContent() {
  const {
    categories,
    categoriesLoading,
    categoriesError,
    creatingCategory,
    createCategoryError,
    savingCategory,
    deletingCategory,
    editCategoryError,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    clearCreateCategoryError,
    clearEditCategoryError,
    gifts,
    giftsLoading,
    giftsError,
    savingGift,
    giftFormError,
    deletingGiftId,
    togglingGiftId,
    fetchGifts,
    createGift,
    updateGift,
    deleteGift,
    toggleGiftLive,
    clearGiftFormError,
  } = useGifts();

  const [activeCategory, setActiveCategory] = useState<string>("");

  // Select the first category once the list loads
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const activeCat = categories.find((c) => c.id === activeCategory);
  const giftCountFor = (categoryId: string) =>
    gifts.filter((g) => g.categoryId === categoryId).length;
  const visibleGifts = gifts.filter((g) => g.categoryId === activeCategory);
  const liveCount = visibleGifts.filter((g) => g.isLive).length;

  /* ---- Add category modal ---- */
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const closeAddCategory = () => {
    setShowAddCategory(false);
    setNewCategoryName("");
    clearCreateCategoryError();
  };

  const handleAddCategory = async () => {
    const ok = await addCategory(newCategoryName);
    if (ok) closeAddCategory();
  };

  /* ---- Edit category modal ---- */
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(false);

  const openEditCategory = (cat: { id: string; name: string }) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
    setConfirmDeleteCategory(false);
    clearEditCategoryError();
  };

  const closeEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setConfirmDeleteCategory(false);
    clearEditCategoryError();
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    const ok = await updateCategory(editingCategory.id, editCategoryName);
    if (ok) closeEditCategory();
  };

  const handleDeleteCategory = async () => {
    if (!editingCategory) return;
    const ok = await deleteCategory(editingCategory.id);
    if (ok) {
      if (activeCategory === editingCategory.id) setActiveCategory("");
      closeEditCategory();
    }
  };

  /* ---- Delete category via pill cross (×) ---- */
//   const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);

//   const handleConfirmDeleteCategoryFromPill = async () => {
//     if (!deleteCategoryTarget) return;
//     const ok = await deleteCategory(deleteCategoryTarget.id);
//     if (ok) {
//       if (activeCategory === deleteCategoryTarget.id) setActiveCategory("");
//       setDeleteCategoryTarget(null);
//     }
//   };

  /* ---- Delete category via ✕ on pill ---- */
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleConfirmDeleteCategoryFromPill = async () => {
    if (!deleteCategoryTarget) return;
    const ok = await deleteCategory(deleteCategoryTarget.id);
    if (ok) {
      if (activeCategory === deleteCategoryTarget.id) setActiveCategory("");
      setDeleteCategoryTarget(null);
      clearEditCategoryError();
    }
  };

  /* ---- Add / edit gift modal ---- */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const [giftForm, setGiftForm] = useState({ ...EMPTY_GIFT_FORM });
  const [giftImageFile, setGiftImageFile] = useState<File | null>(null);
  const [giftImagePreview, setGiftImagePreview] = useState<string>("");

  const openAddGift = () => {
    setEditingGiftId(null);
    setGiftForm({
      ...EMPTY_GIFT_FORM,
      categoryId: activeCategory || categories[0]?.id || "",
    });
    setGiftImageFile(null);
    setGiftImagePreview("");
    clearGiftFormError();
    setShowGiftModal(true);
  };

  const openEditGift = (gift: GiftItem) => {
    setEditingGiftId(gift.id);
    setGiftForm({
      name: gift.name,
      categoryId: gift.categoryId,
      coins: gift.coinCost,
      triggerLine: gift.triggerLine,
      receiverLine: gift.receiverLine,
      live: gift.isLive,
    });
    setGiftImageFile(null);
    setGiftImagePreview(gift.image); // existing image shown; upload replaces it
    clearGiftFormError();
    setShowGiftModal(true);
  };

  const closeGiftModal = () => {
    setShowGiftModal(false);
    setEditingGiftId(null);
    setGiftForm({ ...EMPTY_GIFT_FORM });
    setGiftImageFile(null);
    setGiftImagePreview("");
    clearGiftFormError();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGiftImageFile(file);
    setGiftImagePreview(URL.createObjectURL(file));
  };

  const isEditingGift = editingGiftId !== null;
  const giftFormValid =
    giftForm.name.trim() !== "" &&
    giftForm.triggerLine.trim() !== "" &&
    giftForm.categoryId !== "" &&
    giftForm.coins > 0 &&
    // image required only on create
    (isEditingGift || giftImageFile !== null);

  const handleSubmitGift = async () => {
    if (!giftFormValid) return;
    const input = {
      categoryId: giftForm.categoryId,
      name: giftForm.name,
      coinCost: giftForm.coins,
      triggerLine: giftForm.triggerLine,
      receiverLine: giftForm.receiverLine,
      isLive: giftForm.live,
      imageFile: giftImageFile, // null on edit = keep existing image
    };
    const ok = isEditingGift
      ? await updateGift(editingGiftId, input)
      : await createGift(input);
    if (ok) closeGiftModal();
  };

  /* ---- Delete gift confirm ---- */
  const [deleteGiftTarget, setDeleteGiftTarget] = useState<GiftItem | null>(
    null,
  );

  const handleConfirmDeleteGift = async () => {
    if (!deleteGiftTarget) return;
    const ok = await deleteGift(deleteGiftTarget.id);
    if (ok) setDeleteGiftTarget(null);
  };

  return (
    <>
      <div className="min-h-screen bg-[#F7F5F1] px-7 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-[#1C1B1A]">
            Gifts &amp; coins
          </h1>
          <p className="mt-1 text-sm text-[#8A857D]">
            Manage the in-app gift catalog, categories &amp; see what members
            send
          </p>
        </div>

        {/* Stat cards (analytics API not available yet) */}
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <StatCard
            icon="🎁"
            iconBg="bg-[#FBE3EA]"
            value="—"
            label="Total sent · coins"
            delta="0%"
          />
          <StatCard
            icon="🎁"
            iconBg="bg-[#DCF1EA]"
            value="—"
            label="Total received · credited"
            delta="0%"
          />
        </div>

        {/* Gift catalog */}
        <div className="rounded-2xl border border-[#EBE7E0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-[#F0EDE7] px-6 py-4">
            <h2 className="text-base font-bold text-[#1C1B1A]">Gift catalog</h2>
            <span className="text-sm text-[#A39E96]">
              {visibleGifts.length} of {gifts.length} items ·{" "}
              <span className="text-[#1FA05A]">{liveCount} live</span>
            </span>
          </div>

          <div className="px-6 py-5">
            {/* Category pills */}
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              {categoriesLoading && (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="h-10 w-28 animate-pulse rounded-full bg-[#F1EEE9]"
                    />
                  ))}
                </>
              )}

              {!categoriesLoading && categoriesError && (
                <div className="flex items-center gap-3 text-sm text-[#E5484D]">
                  <span>{categoriesError}</span>
                  <button
                    onClick={fetchCategories}
                    className="rounded-lg border border-[#E5E1DA] bg-white px-3 py-1 font-semibold text-[#1C1B1A] hover:bg-[#FAF8F5]"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!categoriesLoading &&
                !categoriesError &&
                categories.map((cat) => {
                  const active = cat.id === activeCategory;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2 rounded-full py-2 pl-4 pr-2 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-[#7C5CFA] text-white shadow-[0_2px_8px_rgba(124,92,250,0.35)]"
                          : "border border-[#E5E1DA] bg-white text-[#4A463F] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      {cat.name}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs ${
                          active
                            ? "bg-white/25 text-white"
                            : "bg-[#F1EEE9] text-[#8A857D]"
                        }`}
                      >
                        {giftCountFor(cat.id)}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCategory({ id: cat.id, name: cat.name });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            openEditCategory({ id: cat.id, name: cat.name });
                          }
                        }}
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-colors ${
                          active
                            ? "bg-[#6A4BE0] hover:bg-[#5B3DD0]"
                            : "bg-[#F1EEE9] hover:bg-[#E5E1DA]"
                        }`}
                      >
                        ✏️
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Delete ${cat.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCategoryTarget({
                            id: cat.id,
                            name: cat.name,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            setDeleteCategoryTarget({
                              id: cat.id,
                              name: cat.name,
                            });
                          }
                        }}
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold leading-none transition-colors ${
                          active
                            ? "bg-[#6A4BE0] text-white hover:bg-[#E5484D]"
                            : "bg-[#F1EEE9] text-[#8A857D] hover:bg-[#FDE3E2] hover:text-[#E5484D]"
                        }`}
                      >
                        ×
                      </span>
                    </button>
                  );
                })}

              {!categoriesLoading && !categoriesError && (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="rounded-full bg-[#EFEAFE] px-4 py-2 text-sm font-bold text-[#7C5CFA] transition-colors hover:bg-[#E4DCFD]"
                >
                  + Add
                </button>
              )}
            </div>

            {/* Trigger line banner */}
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#F0DFB4] bg-[#FBF3DD] px-4 py-2.5 text-sm text-[#5C4E27]">
              <span>⚡</span>
              <p>
                <span className="font-bold">Trigger line</span> — the nudge a
                member sees on a profile that prompts them to send this gift.
              </p>
            </div>

            {/* Gift rows */}
            {giftsLoading && (
              <div className="flex flex-col gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl bg-[#F1EEE9]"
                  />
                ))}
              </div>
            )}

            {!giftsLoading && giftsError && (
              <div className="flex items-center gap-3 rounded-xl border border-[#F5DAD7] bg-[#FDF3F2] px-4 py-3 text-sm text-[#8A3B38]">
                <span>{giftsError}</span>
                <button
                  onClick={fetchGifts}
                  className="rounded-lg border border-[#E5E1DA] bg-white px-3 py-1 font-semibold text-[#1C1B1A] hover:bg-[#FAF8F5]"
                >
                  Retry
                </button>
              </div>
            )}

            {!giftsLoading && !giftsError && visibleGifts.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#D8D4CC] bg-[#FAF8F5] px-4 py-8 text-center text-sm text-[#8A857D]">
                No gifts in {activeCat?.name ?? "this category"} yet. Add the
                first one below.
              </div>
            )}

            {!giftsLoading && !giftsError && visibleGifts.length > 0 && (
              <div className="flex flex-col gap-4">
                {visibleGifts.map((gift) => (
                  <GiftRow
                    key={gift.id}
                    gift={gift}
                    toggling={togglingGiftId === gift.id}
                    deleting={deletingGiftId === gift.id}
                    onToggle={toggleGiftLive}
                    onEdit={openEditGift}
                    onDelete={setDeleteGiftTarget}
                  />
                ))}
              </div>
            )}

            {/* Add new gift */}
            <button
              onClick={openAddGift}
              disabled={categories.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#F1EEE9] py-4 text-sm font-semibold text-[#4A463F] transition-colors hover:bg-[#ECE8E1] disabled:opacity-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D8D4CC] bg-white text-xs">
                +
              </span>
              Add new gift to {activeCat?.name ?? "..."}
            </button>
          </div>
        </div>
        <div className="mt-6">
          <GiftsData />
        </div>
      

      </div>

      {/* Add category modal */}
      {showAddCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4"
          onClick={closeAddCategory}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1C1B1A]">Add category</h3>

            <label className="mt-5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A857D]">
              Category name
            </label>
            <input
              type="text"
              autoFocus
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (createCategoryError) clearCreateCategoryError();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !creatingCategory) handleAddCategory();
                if (e.key === "Escape") closeAddCategory();
              }}
              placeholder="e.g. Seasonal"
              className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1C1B1A] placeholder:text-[#A39E96] outline-none transition-colors focus:border-[#7C5CFA] ${
                createCategoryError ? "border-[#E5484D]" : "border-[#E5E1DA]"
              }`}
            />
            {createCategoryError && (
              <p className="mt-1.5 text-xs font-semibold text-[#E5484D]">
                {createCategoryError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={closeAddCategory}
                disabled={creatingCategory}
                className="rounded-xl border border-[#E5E1DA] bg-white px-5 py-2.5 text-sm font-bold text-[#1C1B1A] transition-colors hover:bg-[#FAF8F5] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || creatingCategory}
                className="rounded-xl bg-[#EE5477] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E4436A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingCategory ? "Adding..." : "Add category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit category modal */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4"
          onClick={closeEditCategory}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1C1B1A]">Edit category</h3>

            <label className="mt-5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A857D]">
              Category name
            </label>
            <input
              type="text"
              autoFocus
              value={editCategoryName}
              onChange={(e) => {
                setEditCategoryName(e.target.value);
                if (editCategoryError) clearEditCategoryError();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !savingCategory)
                  handleUpdateCategory();
                if (e.key === "Escape") closeEditCategory();
              }}
              className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1C1B1A] outline-none transition-colors focus:border-[#7C5CFA] ${
                editCategoryError ? "border-[#E5484D]" : "border-[#E5E1DA]"
              }`}
            />
            {editCategoryError && (
              <p className="mt-1.5 text-xs font-semibold text-[#E5484D]">
                {editCategoryError}
              </p>
            )}

            {confirmDeleteCategory && (
              <div className="mt-4 rounded-xl border border-[#F5DAD7] bg-[#FDF3F2] px-4 py-3 text-sm text-[#8A3B38]">
                Delete{" "}
                <span className="font-bold">{editingCategory.name}</span>? Gifts
                in this category may be removed too. This can&apos;t be undone.
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              {!confirmDeleteCategory ? (
                <button
                  onClick={() => setConfirmDeleteCategory(true)}
                  disabled={savingCategory || deletingCategory}
                  className="rounded-xl border border-[#F5DAD7] bg-white px-4 py-2.5 text-sm font-bold text-[#E5484D] transition-colors hover:bg-[#FDF3F2] disabled:opacity-50"
                >
                  Delete
                </button>
              ) : (
                <button
                  onClick={handleDeleteCategory}
                  disabled={deletingCategory}
                  className="rounded-xl bg-[#E5484D] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#D63A40] disabled:opacity-50"
                >
                  {deletingCategory ? "Deleting..." : "Yes, delete"}
                </button>
              )}

              <div className="flex items-center gap-2.5">
                <button
                  onClick={closeEditCategory}
                  disabled={savingCategory || deletingCategory}
                  className="rounded-xl border border-[#E5E1DA] bg-white px-5 py-2.5 text-sm font-bold text-[#1C1B1A] transition-colors hover:bg-[#FAF8F5] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={
                    !editCategoryName.trim() ||
                    editCategoryName.trim() === editingCategory.name ||
                    savingCategory ||
                    deletingCategory
                  }
                  className="rounded-xl bg-[#EE5477] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E4436A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingCategory ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / edit gift modal */}
      {showGiftModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4"
          onClick={closeGiftModal}
        >
          <div
            className="max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1C1B1A]">
              {isEditingGift ? "Edit gift" : "Add new gift"}
            </h3>

            {/* Image row: preview + upload inline */}
            <div className="mt-4 flex items-end gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#F0EDE7] bg-[#FAF8F5] text-2xl">
                {giftImagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={giftImagePreview}
                    alt="Gift preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "🎁"
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A857D]">
                  Gift image{" "}
                  {!isEditingGift && <span className="text-[#E5484D]">*</span>}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 flex items-center gap-2 rounded-xl border border-dashed border-[#D8D4CC] bg-white px-4 py-2 text-sm font-semibold text-[#1C1B1A] transition-colors hover:bg-[#FAF8F5]"
                >
                  <span className="text-base">⬆️</span>
                  {isEditingGift ? "Replace image" : "Upload image"}
                </button>
              </div>
            </div>

            {/* Name + category + coin cost in one row */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1.4fr_1fr]">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A857D]">
                  Gift name
                </label>
                <input
                  type="text"
                  value={giftForm.name}
                  onChange={(e) =>
                    setGiftForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Bouquet"
                  className="mt-1.5 w-full rounded-xl border border-[#E5E1DA] bg-white px-4 py-2.5 text-sm text-[#1C1B1A] placeholder:text-[#A39E96] outline-none transition-colors focus:border-[#7C5CFA]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A857D]">
                  Category
                </label>
                <select
                  value={giftForm.categoryId}
                  onChange={(e) =>
                    setGiftForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#E5E1DA] bg-white px-4 py-2.5 text-sm text-[#1C1B1A] outline-none transition-colors focus:border-[#7C5CFA]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A857D]">
                  Coin cost
                </label>
                <input
                  type="number"
                  min={1}
                  value={giftForm.coins}
                  onChange={(e) =>
                    setGiftForm((f) => ({
                      ...f,
                      coins: Number(e.target.value) || 0,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#E5E1DA] bg-white px-4 py-2.5 text-sm text-[#1C1B1A] outline-none transition-colors focus:border-[#7C5CFA]"
                />
              </div>
            </div>

            {/* Trigger + receiver lines side by side */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A857D]">
                  Trigger line
                </label>
                <p className="mt-0.5 text-xs text-[#A39E96]">
                  Nudge shown on a profile to prompt sending this gift
                </p>
                <textarea
                  rows={2}
                  maxLength={TRIGGER_MAX}
                  value={giftForm.triggerLine}
                  onChange={(e) =>
                    setGiftForm((f) => ({ ...f, triggerLine: e.target.value }))
                  }
                  placeholder="e.g. Caught your eye? Send a rose to break the ice 🌹"
                  className="mt-1.5 w-full resize-none rounded-xl border border-[#E5E1DA] bg-white px-4 py-2.5 text-sm text-[#1C1B1A] placeholder:text-[#A39E96] outline-none transition-colors focus:border-[#7C5CFA]"
                />
                <p className="mt-0.5 text-right text-xs text-[#A39E96]">
                  {giftForm.triggerLine.length}/{TRIGGER_MAX}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A857D]">
                  Receiver line
                </label>
                <p className="mt-0.5 text-xs text-[#A39E96]">
                  Romantic note the person sees when they receive this gift
                </p>
                <textarea
                  rows={2}
                  maxLength={RECEIVER_MAX}
                  value={giftForm.receiverLine}
                  onChange={(e) =>
                    setGiftForm((f) => ({
                      ...f,
                      receiverLine: e.target.value,
                    }))
                  }
                  placeholder="e.g. Someone thinks you're worth a rose 🌹"
                  className="mt-1.5 w-full resize-none rounded-xl border border-[#E5E1DA] bg-white px-4 py-2.5 text-sm text-[#1C1B1A] placeholder:text-[#A39E96] outline-none transition-colors focus:border-[#7C5CFA]"
                />
                <p className="mt-0.5 text-right text-xs text-[#A39E96]">
                  {giftForm.receiverLine.length}/{RECEIVER_MAX}
                </p>
              </div>
            </div>

            {giftFormError && (
              <p className="mt-3 rounded-xl border border-[#F5DAD7] bg-[#FDF3F2] px-4 py-2.5 text-sm font-semibold text-[#8A3B38]">
                {giftFormError}
              </p>
            )}

            {/* Checkbox + actions in one row */}
            <div className="mt-4 flex items-center justify-between border-t border-[#F0EDE7] pt-4">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={giftForm.live}
                  onChange={(e) =>
                    setGiftForm((f) => ({ ...f, live: e.target.checked }))
                  }
                  className="h-5 w-5 cursor-pointer appearance-none rounded-md border border-[#E5E1DA] bg-white transition-colors checked:border-[#EE5477] checked:bg-[#EE5477] checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat"
                />
                <span className="text-sm font-bold text-[#1C1B1A]">
                  Live in the app
                </span>
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={closeGiftModal}
                  disabled={savingGift}
                  className="rounded-xl border border-[#E5E1DA] bg-white px-5 py-2.5 text-sm font-bold text-[#1C1B1A] transition-colors hover:bg-[#FAF8F5] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitGift}
                  disabled={!giftFormValid || savingGift}
                  className="rounded-xl bg-[#EE5477] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E4436A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingGift
                    ? "Saving..."
                    : isEditingGift
                      ? "Save changes"
                      : "Add gift"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete gift confirm modal */}
      {deleteGiftTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4"
          onClick={() => setDeleteGiftTarget(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1C1B1A]">Delete gift</h3>
            <p className="mt-3 text-sm text-[#6F6A63]">
              Delete{" "}
              <span className="font-bold text-[#1C1B1A]">
                {deleteGiftTarget.name}
              </span>
              ? Members will no longer be able to send it. This can&apos;t be
              undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteGiftTarget(null)}
                disabled={deletingGiftId === deleteGiftTarget.id}
                className="rounded-xl border border-[#E5E1DA] bg-white px-5 py-2.5 text-sm font-bold text-[#1C1B1A] transition-colors hover:bg-[#FAF8F5] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteGift}
                disabled={deletingGiftId === deleteGiftTarget.id}
                className="rounded-xl bg-[#E5484D] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#D63A40] disabled:opacity-50"
              >
                {deletingGiftId === deleteGiftTarget.id
                  ? "Deleting..."
                  : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete category confirm modal (from pill ×) */}
      {deleteCategoryTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4"
          onClick={() => setDeleteCategoryTarget(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1C1B1A]">
              Delete category
            </h3>
            <p className="mt-3 text-sm text-[#6F6A63]">
              Delete{" "}
              <span className="font-bold text-[#1C1B1A]">
                {deleteCategoryTarget.name}
              </span>
              ?{" "}
              {giftCountFor(deleteCategoryTarget.id) > 0 && (
                <span>
                  It has{" "}
                  <span className="font-bold text-[#1C1B1A]">
                    {giftCountFor(deleteCategoryTarget.id)} gift
                    {giftCountFor(deleteCategoryTarget.id) > 1 ? "s" : ""}
                  </span>{" "}
                  in it.{" "}
                </span>
              )}
              This can&apos;t be undone.
            </p>
            {editCategoryError && (
              <p className="mt-3 rounded-xl border border-[#F5DAD7] bg-[#FDF3F2] px-4 py-2.5 text-sm font-semibold text-[#8A3B38]">
                {editCategoryError}
              </p>
            )}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteCategoryTarget(null)}
                disabled={deletingCategory}
                className="rounded-xl border border-[#E5E1DA] bg-white px-5 py-2.5 text-sm font-bold text-[#1C1B1A] transition-colors hover:bg-[#FAF8F5] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCategoryFromPill}
                disabled={deletingCategory}
                className="rounded-xl bg-[#E5484D] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#D63A40] disabled:opacity-50"
              >
                {deletingCategory ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Page (wraps content with provider) ---------- */

export default function Page() {
  return (
    <DefaultLayout>
      <GiftsProvider>
        <GiftsPageContent />
      </GiftsProvider>
    </DefaultLayout>
  );
}