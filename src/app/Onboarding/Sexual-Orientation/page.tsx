// app/Sexual-Orientation/page.tsx
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useMemo } from "react";
import { useSexualOrientation } from "@/context/SexualOrientationContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GenericTable from "@/components/ui/GenericTable";
import { Loader2, X, Plus } from "lucide-react";

function Page() {
  const { createData, data, deleteData, loading } = useSexualOrientation();

  /* ================= FORM STATE ================= */
  const [title, setTitle] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  /* ================= OPTIONS HANDLERS ================= */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && optionInput.trim()) {
      e.preventDefault();
      
      if (options.includes(optionInput.trim())) {
        toast.warning("This option already exists");
        return;
      }
      
      setOptions([...options, optionInput.trim()]);
      setOptionInput("");
    }
  };

  const removeOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const addOptionFromButton = () => {
    if (optionInput.trim()) {
      if (options.includes(optionInput.trim())) {
        toast.warning("This option already exists");
        return;
      }
      setOptions([...options, optionInput.trim()]);
      setOptionInput("");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (options.length === 0) {
      toast.error("Please add at least one option");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        options: options.map(opt => ({ label: opt })),
      };

      await createData(payload);

      toast.success("Sexual orientation saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTitle("");
      setOptions([]);
      setOptionInput("");
    } catch (error: any) {
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (row: any) => {
    if (!window.confirm("Are you sure you want to delete all sexual orientations?")) {
      return;
    }

    setIsDeleting("all");

    try {
      await deleteData("all");
      toast.success("All sexual orientations deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setIsDeleting(null);
    }
  };

  /* ================= FORMAT DATA FOR TABLE ================= */
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item: any) => {
      const optionChunks = [];
      for (let i = 0; i < item.options.length; i += 3) { // Changed to 3 per row for better fit
        optionChunks.push(item.options.slice(i, i + 3));
      }

      return {
        _id: item._id,
        title: item.title,
        optionChunks: optionChunks,
        allOptions: item.options,
      };
    });
  }, [data]);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      header: "Title",
      accessor: "title",
      width: "150px", // Reduced width
      align: "left" as const,
      render: (row: any) => (
        <span className="font-semibold text-black dark:text-white">
          {row.title}
        </span>
      ),
    },
    {
      header: "Options",
      accessor: "options",
      width: "500px", // Reduced width
      align: "left" as const,
      render: (row: any) => (
        <div className="flex flex-col gap-2">
          {row.optionChunks.map((chunk: any[], chunkIndex: number) => (
            <div key={chunkIndex} className="flex flex-wrap gap-1.5">
              {chunk.map((opt: any, optIndex: number) => (
                <span
                  key={optIndex}
                  className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                >
                  {opt.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      ),
    },
  ];

  /* ================= UI ================= */
  return (
    <DefaultLayout>
      <ToastContainer theme="colored" />

      <div className="p-4 md:p-6"> {/* Reduced padding on mobile */}

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-boxdark p-4 md:p-6 rounded-xl shadow-md mb-6"
        >
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-black dark:text-white">
            Create Sexual Orientation
          </h2>

          {/* TITLE */}
          <div className="mb-3 md:mb-4">
            <Input
              label="Title"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* ================= OPTIONS INPUT ================= */}
          <div className="mb-3 md:mb-4">
            <label className="mb-1.5 md:mb-2.5 block text-sm font-medium text-black dark:text-white">
              Add Options
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Type and press Enter"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="button"
                onClick={addOptionFromButton}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1 text-sm disabled:opacity-50"
                disabled={isSubmitting || !optionInput.trim()}
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Press Enter to add multiple options
            </p>
          </div>

          {/* ================= DISPLAY ADDED OPTIONS ================= */}
          {options.length > 0 && (
            <div className="mb-4 md:mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Added Options ({options.length})
              </label>
              <div className="flex flex-wrap gap-1.5">
                {options.map((opt, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full text-xs"
                  >
                    {opt.length > 15 ? opt.substring(0, 15) + "..." : opt}
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="hover:text-red-600 transition"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <Button type="submit" disabled={isSubmitting || options.length === 0}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </form>

        {/* ================= TABLE ================= */}
        <div className="mt-6 md:mt-8">
          <GenericTable
            title="Saved Sexual Orientations"
            columns={columns}
            data={formattedData}
            onDelete={handleDelete}
            showActions={true}
            showView={false}
            showEdit={false}
            showDelete={true}
            minWidth="800px" // Reduced minWidth
            isDeleting={isDeleting}
          />

          {loading && !data.length && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}
        </div>

      </div>
    </DefaultLayout>
  );
}

export default Page;