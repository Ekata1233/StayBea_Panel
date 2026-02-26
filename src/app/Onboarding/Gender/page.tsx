// app/Gender/page.tsx
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useMemo } from "react";
import { useGender } from "@/context/GenderContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Loader2, X, Plus, Trash2 } from "lucide-react";

function Page() {
  const { createData, data, deleteData, loading } = useGender();

  /* ================= FORM STATE ================= */
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ================= OPTIONS HANDLERS ================= */
  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
    } else {
      toast.warning("At least one option is required");
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      if (index === options.length - 1) {
        addOption();
      }
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length === 0) {
      toast.error("Please add at least one option");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        options: validOptions.map(opt => ({ label: opt.trim() })),
      };

      await createData(payload);

      toast.success("Gender saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTitle("");
      setOptions([""]);
    } catch (error: any) {
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (data.length === 0) {
      toast.info("No data to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to delete all gender data?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteData();
      toast.success("All gender data deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <DefaultLayout>
      <ToastContainer theme="colored" />

      <div className="p-4 md:p-6">

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-boxdark p-4 md:p-6 rounded-xl shadow-md mb-6"
        >
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-black dark:text-white">
            Create Gender
          </h2>

          {/* TITLE */}
          <div className="mb-4 md:mb-6">
            <Input
              label="Title"
              placeholder="Enter title (e.g., Gender Identity)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* ================= OPTIONS ================= */}
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Options
            </label>
            
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${index + 1} (e.g., Male, Female, Non-binary)`}
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={isSubmitting}
                  />
                </div>
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition"
                    disabled={isSubmitting}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
              disabled={isSubmitting}
            >
              <Plus size={18} />
              <span>Add Option</span>
            </button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to quickly add multiple options
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Saved Gender Data
            </h2>
          </div>

          {/* Custom Table */}
          <div className="rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                {/* Table Header */}
                <thead className="bg-gray-2 text-sm font-semibold dark:bg-meta-4">
                  <tr>
                    <th className="p-3 text-left min-w-[200px]">Title</th>
                    <th className="p-3 text-left min-w-[500px]">Options</th>
                    <th className="p-3 text-center min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                
                {/* Table Body */}
                <tbody>
                  {data && data.length > 0 ? (
                    data.map((item: any) => (
                      <tr 
                        key={item._id}
                        className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-3 transition"
                      >
                        {/* Title */}
                        <td className="p-3">
                          <span className="font-semibold text-black dark:text-white">
                            {item.title}
                          </span>
                        </td>
                        
                        {/* Options */}
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {item.options.map((opt: any, index: number) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium"
                              >
                                {opt.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td className="p-3 text-center">
                          <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition mx-auto ${
                              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Delete All"
                          >
                            {isDeleting ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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