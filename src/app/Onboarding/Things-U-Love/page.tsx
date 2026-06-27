"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useMemo } from "react";
import { useThingsYouLove } from "@/context/ThingsYouLoveContext";
import { useFlowType } from "@/utils/flowType";
import { ToastContainer, toast } from "react-toastify";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GenericTable from "@/components/ui/GenericTable";
import { X, Loader2 } from "lucide-react";
import { useQuestionDelete } from "@/context/questionDeleteContext";

function Page() {
  const { data, createData, deleteData, loading } = useThingsYouLove();
  const flowType = useFlowType();

  const screen = "THINGS_U_LOVE";
const { deleteQuestion } = useQuestionDelete();

  /* 🔥 SAME MAPPING */
  const getCategory = (flow: string) => {
    switch (flow) {
      case "dating":
        return "DATING";
      case "mature":
        return "MATURE_CONNECTION";
      case "marriage":
        return "DATE_TO_MARRY";
      default:
        return "";
    }
  };

  const category = flowType ? getCategory(flowType) : "";

  /* ================= STATE ================= */
  const [title, setTitle] = useState("");
  const [key, setKey] = useState("");
  const [isMulti, setIsMulti] = useState(false);

  const [options, setOptions] = useState([
    { value: "", label: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ================= OPTIONS ================= */
  const addOption = () => {
    setOptions([...options, { value: "", label: "" }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    index: number,
    field: "value" | "label",
    value: string
  ) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast.error("Invalid flowType");
      return;
    }

    const validOptions = options.filter((o) => o.label.trim());

    if (!title || !key || validOptions.length === 0) {
      toast.error("Fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await createData({
        key,
        title,
        category,
        screen,
        isMulti,
        options: validOptions,
      });

      toast.success("Saved successfully");

      setTitle("");
      setKey("");
      setOptions([{ value: "", label: "" }]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (row: any) => {
  const id = row?._id;

  if (!id || typeof id !== "string") {
    toast.error("Invalid ID");
    return;
  }

  if (!confirm("Delete this question?")) return;

  setIsDeleting(true);

  try {
    const success = await deleteQuestion(id);

    if (success) {
      toast.success("Deleted successfully");

      // ✅ REMOVE FROM UI (NO REFRESH)
      const updated = data.filter((q) => q.id !== id);

      // 🔥 IMPORTANT: update UI manually
      // since data is coming from context, we force re-render like this:
      tableData.splice(0, tableData.length, ...updated.map((q) => ({
        _id: q.id,
        title: q.title,
        options: q.options.map((o) => o.label),
      })));

    } else {
      toast.error("Delete failed");
    }
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setIsDeleting(false);
  }
};

  /* ================= TABLE ================= */
  const tableData = useMemo(() => {
    return data.map((q) => ({
      _id: q.id,
      title: q.title,
      options: q.options.map((o) => o.label),
    }));
  }, [data]);

  const columns = [
    { header: "Title", accessor: "title" },
    {
      header: "Options",
      accessor: "options",
      render: (row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.options.map((opt: string, i: number) => (
            <span key={i} className="bg-blue-100 px-2 py-1 text-xs rounded">
              {opt}
            </span>
          ))}
        </div>
      ),
    },
  ];

  /* ================= UI ================= */
  return (
    <DefaultLayout>
      <ToastContainer />

      <div className="p-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">
            Things You Love - {flowType?.toUpperCase()}
          </h2>

          <Input
            label="Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="mt-3">
            <label>Multi Select?</label>
            <input
              type="checkbox"
              checked={isMulti}
              onChange={(e) => setIsMulti(e.target.checked)}
              className="ml-2"
            />
          </div>

          {/* OPTIONS */}
          {options.map((opt, index) => (
            <div key={index} className="flex gap-2 mt-3">
              <input
                placeholder="Value"
                className="border p-2 w-full"
                value={opt.value}
                onChange={(e) =>
                  handleOptionChange(index, "value", e.target.value)
                }
              />
              <input
                placeholder="Label"
                className="border p-2 w-full"
                value={opt.label}
                onChange={(e) =>
                  handleOptionChange(index, "label", e.target.value)
                }
              />
              <button onClick={() => removeOption(index)}>
                <X size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="text-blue-500 mt-3"
          >
            + Add Option
          </button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>

        <GenericTable
          title={`Things You Love - ${flowType}`}
          columns={columns}
          data={tableData}
          onDelete={handleDelete}
          showDelete
          isDeleting={isDeleting}
        />

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}

export default Page;
