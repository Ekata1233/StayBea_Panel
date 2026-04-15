// app/religion/page.tsx
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useEffect, useMemo } from "react";
import { useReligion } from "@/context/ReligionContext";
import { useFlowType } from "@/utils/flowType";
import { ToastContainer, toast } from "react-toastify";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GenericTable from "@/components/ui/GenericTable";
import { Plus, X, Loader2 } from "lucide-react";

function Page() {
  const { data, createData, deleteData, loading } = useReligion();
  const flowType = useFlowType();

  /* ================= STATE ================= */
  const [title, setTitle] = useState("");
  const [religions, setReligions] = useState([
    { name: "", communities: [""] },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ================= HANDLERS ================= */
  const addReligion = () => {
    setReligions([...religions, { name: "", communities: [""] }]);
  };

  const removeReligion = (index: number) => {
    const updated = religions.filter((_, i) => i !== index);
    setReligions(updated);
  };

  const handleReligionName = (index: number, value: string) => {
    const updated = [...religions];
    updated[index].name = value;
    setReligions(updated);
  };

  const addCommunity = (rIndex: number) => {
    const updated = [...religions];
    updated[rIndex].communities.push("");
    setReligions(updated);
  };

  const removeCommunity = (rIndex: number, cIndex: number) => {
    const updated = [...religions];
    updated[rIndex].communities = updated[rIndex].communities.filter(
      (_, i) => i !== cIndex
    );
    setReligions(updated);
  };

  const handleCommunity = (rIndex: number, cIndex: number, value: string) => {
    const updated = [...religions];
    updated[rIndex].communities[cIndex] = value;
    setReligions(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flowType) {
      toast.error("FlowType missing");
      return;
    }

    if (!title.trim()) {
      toast.error("Enter title");
      return;
    }

    const valid = religions.filter((r) => r.name.trim());

    if (valid.length === 0) {
      toast.error("Add at least one religion");
      return;
    }

    setIsSubmitting(true);

    try {
      await createData({
        flowType,
        title,
        religions: valid,
      });

      toast.success("Saved successfully");

      setTitle("");
      setReligions([{ name: "", communities: [""] }]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!flowType) return;

    if (!confirm("Delete all data?")) return;

    setIsDeleting(true);

    try {
      await deleteData(flowType);
      toast.success("Deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  /* ================= AUTO FILL ================= */
  useEffect(() => {
    if (!data || !flowType) return;

    const existing = data.find((d) => d.flowType === flowType);

    if (existing) {
      setTitle(existing.title || "");
      setReligions(
        existing.religions.length
          ? existing.religions
          : [{ name: "", communities: [""] }]
      );
    }
  }, [data, flowType]);

  /* ================= TABLE ================= */
  const tableData = useMemo(() => {
    const rows: any[] = [];

    data.forEach((doc) => {
      doc.religions.forEach((r, i) => {
        rows.push({
          _id: `${doc._id}-${i}`,
          title: i === 0 ? doc.title : "",
          name: r.name,
          communities: r.communities,
        });
      });
    });

    return rows;
  }, [data]);

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Religion",
      accessor: "name",
    },
    {
      header: "Communities",
      accessor: "communities",
      render: (row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.communities.map((c: string, i: number) => (
            <span key={i} className="bg-blue-100 px-2 py-1 text-xs rounded">
              {c}
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
            Religion - {flowType}
          </h2>

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {religions.map((r, rIndex) => (
            <div key={rIndex} className="border p-4 mt-4 rounded">
              <Input
                label="Religion Name"
                value={r.name}
                onChange={(e) =>
                  handleReligionName(rIndex, e.target.value)
                }
              />

              {r.communities.map((c, cIndex) => (
                <div key={cIndex} className="flex gap-2 mt-2">
                  <input
                    className="border p-2 w-full"
                    value={c}
                    onChange={(e) =>
                      handleCommunity(rIndex, cIndex, e.target.value)
                    }
                  />
                  <button onClick={() => removeCommunity(rIndex, cIndex)}>
                    <X size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addCommunity(rIndex)}
                className="text-blue-500 mt-2"
              >
                + Add Community
              </button>
            </div>
          ))}

          <button type="button" onClick={addReligion} className="mt-4 text-blue-600">
            + Add Religion
          </button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>

        <GenericTable
          title="Saved Religion Data"
          columns={columns}
          data={tableData}
          showActions={false}
          onDelete={handleDelete}
          showDelete
          isDeleting={isDeleting}
        />
      </div>
    </DefaultLayout>
  );
}

export default Page;
