// app/Looking-For/page.tsx
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useMemo } from "react";
import { useLookingFor } from "@/context/LookingForContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FileInput from "@/components/ui/FileInput";
import GenericTable from "@/components/ui/GenericTable";
import { Loader2, X, Plus, Eye } from "lucide-react";
import {  useFlowType } from "@/utils/flowType";

function Page() {
  const { createData, data, deleteData, loading } = useLookingFor();

  /* ================= FORM STATE ================= */
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([
    {
      description: "",
      image: null as File | null,
      preview: null as string | null,
      options: [""],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

const flowType = useFlowType();

console.log("flow type : ", flowType)

  /* ================= ITEMS HANDLERS ================= */
  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        image: null,
        preview: null,
        options: [""],
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
    } else {
      toast.warning("At least one item is required");
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...items];
    updated[index].description = value;
    setItems(updated);
  };

  const handleImageChange = (index: number, file: File | null) => {
    const updated = [...items];

    // Revoke previous preview URL to avoid memory leaks
    if (updated[index].preview) {
      URL.revokeObjectURL(updated[index].preview);
    }

    updated[index].image = file;
    updated[index].preview = file ? URL.createObjectURL(file) : null;
    setItems(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const flowType = getFlowType();



    // Validation
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    // Check if at least one item has description and image
    const validItems = items.filter(
      (item) => item.description.trim() && item.image,
    );

    if (validItems.length === 0) {
      toast.error("Please add at least one item with description and image");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append title
      formData.append("title", title.trim());
if (!flowType) {
  toast.error("Invalid or missing flow type");
  return;
}

formData.append("flowType", flowType);
      // Append descriptions and images
      const optionsArray: string[][] = [];

      validItems.forEach((item) => {
        formData.append("description", item.description.trim());

        if (item.image) {
          formData.append("images", item.image);
        }

        optionsArray.push(item.options.filter((opt) => opt.trim() !== ""));
      });

      // ✅ send options as JSON string
      formData.append("options", JSON.stringify(optionsArray));

      await createData(formData);

      toast.success("Looking For data saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset form
      setTitle("");

      // Clean up preview URLs
      items.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });

      setItems([
        {
          description: "",
          image: null,
          preview: null,
          options: [""],
        },
      ]);
    } catch (error: any) {
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (row: any) => {
    // Since we're deleting all data, we can use the parentId or just call deleteData
    if (
      !window.confirm("Are you sure you want to delete all Looking For data?")
    ) {
      return;
    }

    setIsDeleting(row.parentId || "all");

    try {
      await deleteData();
      toast.success("All Looking For data deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setIsDeleting(null);
    }
  };

  /* ================= FORMAT DATA FOR TABLE ================= */
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Flatten items for display and mark first item in each group
    const rows: any[] = [];

    data.forEach((item: any, docIndex: number) => {
      item.items?.forEach((subItem: any, itemIndex: number) => {
        rows.push({
          _id: `${item._id}-${itemIndex}`,
          title: itemIndex === 0 ? item.title : "", // Show title only for first item
          description: subItem.description,
          image: subItem.image,
          options: subItem.options || [],
          parentId: item._id,
          isFirstInGroup: itemIndex === 0, // Mark first item in group
          groupSize: item.items.length, // Total items in this group
        });
      });
    });

    return rows;
  }, [data]);
  const addOption = (itemIndex: number) => {
    const updated = [...items];
    updated[itemIndex].options.push("");
    setItems(updated);
  };

  const removeOption = (itemIndex: number, optIndex: number) => {
    const updated = [...items];
    updated[itemIndex].options = updated[itemIndex].options.filter(
      (_, i) => i !== optIndex,
    );
    setItems(updated);
  };

  const handleOptionChange = (
    itemIndex: number,
    optIndex: number,
    value: string,
  ) => {
    const updated = [...items];
    updated[itemIndex].options[optIndex] = value;
    setItems(updated);
  };
  /* ================= CUSTOM TABLE COMPONENT ================= */
  const CustomTable = ({ data, onDelete, isDeleting }: any) => {
    return (
      <div className="overflow-hidden rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            {/* Table Header */}
            <thead className="bg-gray-2 text-sm font-semibold dark:bg-meta-4">
              <tr>
                <th className="min-w-[150px] p-3 text-left">Title</th>
                <th className="min-w-[250px] p-3 text-left">Description</th>
                <th className="min-w-[120px] p-3 text-left">Image</th>
                <th className="min-w-[100px] p-3 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {data.map((row: any, index: number) => (
                <tr
                  key={row._id}
                  className="border-b border-stroke transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-3"
                >
                  {/* Title Column with RowSpan */}
                  {row.isFirstInGroup ? (
                    <td
                      className="p-3 align-top font-semibold text-black dark:text-white"
                      rowSpan={row.groupSize}
                    >
                      {row.title}
                    </td>
                  ) : null}

                  {/* Description Column */}
                  <td className="p-3">
                    <div className="group relative">
                      <p className="break-words text-sm text-gray-700 dark:text-gray-300">
                        {row.description.length > 60
                          ? row.description.substring(0, 60) + "..."
                          : row.description}
                      </p>
                      {row.options && row.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {row.options.map((opt: string, i: number) => (
                            <span
                              key={i}
                              className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                      {row.description.length > 60 && (
                        <div className="absolute bottom-full left-0 z-10 mb-2 hidden group-hover:block">
                          <div className="max-w-xs rounded-lg bg-gray-900 p-2 text-xs text-white">
                            {row.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Image Column */}
                  <td className="p-3">
                    <div className="flex justify-start">
                      <div className="group relative">
                        <img
                          src={row.image}
                          alt={row.description}
                          className="h-12 w-12 rounded-md border border-gray-200 object-cover dark:border-gray-700"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Eye
                            size={16}
                            className="cursor-pointer text-white"
                            onClick={() => window.open(row.image, "_blank")}
                          />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Actions Column with RowSpan - Only for first item in group */}
                  {row.isFirstInGroup ? (
                    <td
                      className="p-3 text-center align-middle"
                      rowSpan={row.groupSize}
                    >
                      <button
                        onClick={() => onDelete(row)}
                        disabled={
                          isDeleting === row.parentId || isDeleting === "all"
                        }
                        className={`rounded-full bg-red-100 p-2 text-red-600 transition hover:bg-red-200 dark:bg-red-900 dark:text-red-300 ${
                          isDeleting === row.parentId || isDeleting === "all"
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        title="Delete All"
                      >
                        {isDeleting === row.parentId || isDeleting === "all" ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 4V3c0-1 1-2 2-2h4c1 0 2 1 2 2v1"></path>
                          </svg>
                        )}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {data.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ================= UI ================= */
  return (
    <DefaultLayout>
      <ToastContainer theme="colored" />

      <div className="p-4 md:p-6">
        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-xl bg-white p-4 shadow-md dark:bg-boxdark md:p-6"
        >
          <h2 className="mb-4 text-lg font-bold text-black dark:text-white md:mb-6 md:text-xl">
            Create Looking For
          </h2>

          {/* TITLE */}
          <div className="mb-4 md:mb-6">
            <Input
              label="Title"
              placeholder="Enter title (e.g., What I'm Looking For)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* ================= ITEMS ================= */}
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Items
            </label>

            {items.map((item, index) => (
              <div
                key={index}
                className="relative mb-4 rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800"
              >
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </button>
                )}

                <div className="mb-4">
                  <Input
                    label={`Description ${index + 1}`}
                    placeholder="Enter description"
                    value={item.description}
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <FileInput
                    label={`Image ${index + 1}`}
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleImageChange(
                        index,
                        e.target.files ? e.target.files[0] : null,
                      )
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {flowType !== "marriage" && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">
                    Options
                  </label>

                  {item.options.map((opt, optIndex) => (
                    <div key={optIndex} className="mb-2 flex gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${optIndex + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(index, optIndex, e.target.value)
                        }
                        className="w-full rounded border p-2"
                      />

                      {item.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index, optIndex)}
                          className="text-red-500"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addOption(index)}
                    className="text-sm text-blue-600"
                  >
                    + Add Option
                  </button>
                </div>
                )}
                {/* Image Preview */}
                {item.preview && (
                  <div className="mt-3">
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      Preview:
                    </p>
                    <div className="relative h-24 w-24">
                      <img
                        src={item.preview}
                        alt="Preview"
                        className="h-full w-full rounded-lg border border-gray-300 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* ADD ITEM BUTTON */}
            <button
              type="button"
              onClick={addItem}
              className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              disabled={isSubmitting}
            >
              <Plus size={18} />
              <span>Add Another Item</span>
            </button>
          </div>

          {/* SUBMIT BUTTON */}
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
          <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
            Saved Looking For Data
          </h2>

          <CustomTable
            data={formattedData}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />

          {loading && !data.length && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}

export default Page;
