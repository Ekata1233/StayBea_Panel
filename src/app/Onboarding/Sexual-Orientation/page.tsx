// app/Sexual-Orientation/page.tsx
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useMemo, useEffect } from "react";
import { useSexualOrientation } from "@/context/SexualOrientationContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GenericTable from "@/components/ui/GenericTable";
import { Loader2, X, Plus, Eye } from "lucide-react";
import { useFlowType } from "@/utils/flowType";

function Page() {
  const { createData, data, deleteData, loading } = useSexualOrientation();
  const flowType = useFlowType();

  /* ================= FORM STATE ================= */
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<
    Array<{ label: string; description: string }>
  >([{ label: "", description: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  console.log("flow type : ", flowType);

  /* ================= OPTIONS HANDLERS ================= */
  const addOption = () => {
    setOptions([...options, { label: "", description: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
    } else {
      toast.warning("At least one option is required");
    }
  };

  const handleLabelChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index].label = value;
    setOptions(updated);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index].description = value;
    setOptions(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    // Check if at least one option has label and description
    const validOptions = options.filter(
      (opt) => opt.label.trim() && opt.description.trim(),
    );

    if (validOptions.length === 0) {
      toast.error("Please add at least one option with label and description");
      return;
    }

    if (!flowType) {
      toast.error("Invalid or missing flow type");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        options: validOptions.map((opt) => ({
          label: opt.label.trim(),
          description: opt.description.trim(),
        })),
        flowType: flowType,
      };

      await createData(payload);

      toast.success("Sexual orientation saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset form
      // setTitle("");
      // setOptions([{ label: "", description: "" }]);
    } catch (error: any) {
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all Sexual Orientation data for this flow type?",
      )
    ) {
      return;
    }

    setIsDeleting("all");

    try {
      await deleteData();
      toast.success(
        `Sexual Orientation data for ${flowType} deleted successfully!`,
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setIsDeleting(null);
    }
  };

useEffect(() => {
  if (!flowType) return;

  const existing = data?.find(
    (item: any) => item.flowType === flowType
  );

  if (existing) {
    setTitle(existing.title || "");

    setOptions(
      existing.options?.length
        ? existing.options.map((opt: any) => ({
            label: opt.label || "",
            description: opt.description || "",
          }))
        : [{ label: "", description: "" }]
    );
  } else {
    // 🔥 CRITICAL: reset when no data for this flowType
    setTitle("");
    setOptions([{ label: "", description: "" }]);
  }
}, [data, flowType]);
  /* ================= FORMAT DATA FOR TABLE ================= */
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const rows: any[] = [];

    data.forEach((item: any, docIndex: number) => {
      item.options?.forEach((option: any, optionIndex: number) => {
        rows.push({
          _id: `${item._id}-${optionIndex}`,
          title: optionIndex === 0 ? item.title : "",
          label: option.label,
          description: option.description,
          parentId: item._id,
          isFirstInGroup: optionIndex === 0,
          groupSize: item.options.length,
          flowType: item.flowType,
        });
      });
    });

    return rows;
  }, [data]);

  console.log("formatted data: ", formattedData);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      header: "Title",
      accessor: "title",
      width: "150px",
      align: "left" as const,
      render: (row: any) => {
        console.log("row: ", row);
        return (
          <span className="font-semibold text-black dark:text-white">
            {row.title}
          </span>
        );
      },
    },
    {
      header: "Label",
      accessor: "label",
      width: "150px",
      align: "left" as const,
      render: (row: any) => (
        <div className="group relative">
          <p className="break-words text-sm font-medium text-gray-900 dark:text-gray-100">
            {row.label.length > 40
              ? row.label.substring(0, 40) + "..."
              : row.label}
          </p>
          {row.label.length > 40 && (
            <div className="absolute bottom-full left-0 z-10 mb-2 hidden group-hover:block">
              <div className="max-w-xs rounded-lg bg-gray-900 p-2 text-xs text-white">
                {row.label}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      width: "350px",
      align: "left" as const,
      render: (row: any) => (
        <div className="group relative">
          <p className="break-words text-sm text-gray-700 dark:text-gray-300">
            {row.description.length > 100
              ? row.description.substring(0, 100) + "..."
              : row.description}
          </p>
          {row.description.length > 100 && (
            <div className="absolute bottom-full left-0 z-10 mb-2 hidden group-hover:block">
              <div className="max-w-xs rounded-lg bg-gray-900 p-2 text-xs text-white">
                {row.description}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];
  

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
            Create Sexual Orientation -{" "}
            {flowType?.toUpperCase() || "Loading..."}
          </h2>

          {/* TITLE */}
          <div className="mb-4 md:mb-6">
            <Input
              label="Title"
              placeholder="Enter title (e.g., Sexual Orientation)"
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

            {options.map((option, index) => (
              <div
                key={index}
                className="relative mb-4 rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800"
              >
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </button>
                )}

                <div className="mb-4">
                  <Input
                    label={`Label ${index + 1}`}
                    placeholder="Enter option label (e.g., Straight, Gay, etc.)"
                    value={option.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <Input
                    label={`Description ${index + 1}`}
                    placeholder="Enter description for this option"
                    value={option.description}
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            ))}

            {/* ADD OPTION BUTTON */}
            <button
              type="button"
              onClick={addOption}
              className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              disabled={isSubmitting}
            >
              <Plus size={18} />
              <span>Add Another Option</span>
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
          <GenericTable
            title={`Saved Sexual Orientation Data - ${flowType?.toUpperCase() || "Loading..."}`}
            columns={columns}
            data={formattedData}
            onDelete={handleDelete}
            showActions={true}
            showView={false}
            showEdit={false}
            showDelete={true}
            isDeleting={isDeleting}
          />

          {loading && !data.length && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}

          {!loading &&
            formattedData.length === 0 &&
            data &&
            data.length > 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No data found for flow type: {flowType}
              </div>
            )}
        </div>
      </div>
    </DefaultLayout>
  );
}

export default Page;
