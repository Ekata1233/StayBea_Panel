// app/work-details/page.tsx
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useEffect, useMemo } from "react";
import { useWorkDetails } from "@/context/WorkDetailsContext";
import { useFlowType } from "@/utils/flowType";
import { ToastContainer, toast } from "react-toastify";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GenericTable from "@/components/ui/GenericTable";
import { Plus, X, Loader2 } from "lucide-react";

function Page() {
  const { data, createData, deleteData, loading } = useWorkDetails();
  const flowType = useFlowType();

  /* ================= STATE ================= */
  const [title, setTitle] = useState("");

  const [annualIncome, setAnnualIncome] = useState<string[]>([""]);

  const [workingWith, setWorkingWith] = useState([
    { name: "", workingAs: [""] },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ================= ANNUAL INCOME ================= */
  const addIncome = () => setAnnualIncome([...annualIncome, ""]);

  const removeIncome = (index: number) => {
    setAnnualIncome(annualIncome.filter((_, i) => i !== index));
  };

  const handleIncomeChange = (index: number, value: string) => {
    const updated = [...annualIncome];
    updated[index] = value;
    setAnnualIncome(updated);
  };

  /* ================= WORKING WITH ================= */
  const addWorkingWith = () => {
    setWorkingWith([...workingWith, { name: "", workingAs: [""] }]);
  };

  const removeWorkingWith = (index: number) => {
    setWorkingWith(workingWith.filter((_, i) => i !== index));
  };

  const handleWorkingWithName = (index: number, value: string) => {
    const updated = [...workingWith];
    updated[index].name = value;
    setWorkingWith(updated);
  };

  const addWorkingAs = (index: number) => {
    const updated = [...workingWith];
    updated[index].workingAs.push("");
    setWorkingWith(updated);
  };

  const removeWorkingAs = (wIndex: number, aIndex: number) => {
    const updated = [...workingWith];
    updated[wIndex].workingAs = updated[wIndex].workingAs.filter(
      (_, i) => i !== aIndex
    );
    setWorkingWith(updated);
  };

  const handleWorkingAs = (wIndex: number, aIndex: number, value: string) => {
    const updated = [...workingWith];
    updated[wIndex].workingAs[aIndex] = value;
    setWorkingWith(updated);
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

    const validIncome = annualIncome.filter((i) => i.trim());
    const validWorkingWith = workingWith.filter((w) => w.name.trim());

    if (validIncome.length === 0) {
      toast.error("Add income options");
      return;
    }

    if (validWorkingWith.length === 0) {
      toast.error("Add workingWith data");
      return;
    }

    setIsSubmitting(true);

    try {
      await createData({
        flowType,
        title,
        annualIncome: validIncome,
        workingWith: validWorkingWith,
      });

      toast.success("Saved successfully");

      setTitle("");
      setAnnualIncome([""]);
      setWorkingWith([{ name: "", workingAs: [""] }]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!flowType) return;

    if (!confirm("Delete all work details?")) return;

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
      setAnnualIncome(existing.annualIncome.length ? existing.annualIncome : [""]);
      setWorkingWith(
        existing.workingWith.length
          ? existing.workingWith
          : [{ name: "", workingAs: [""] }]
      );
    }
  }, [data, flowType]);

  /* ================= TABLE ================= */
  const tableData = useMemo(() => {
    const rows: any[] = [];

    data.forEach((doc) => {
      doc.workingWith.forEach((w, i) => {
        rows.push({
          _id: `${doc._id}-${i}`,
          title: i === 0 ? doc.title : "",
          income: i === 0 ? doc.annualIncome.join(", ") : "",
          company: w.name,
          roles: w.workingAs,
        });
      });
    });

    return rows;
  }, [data]);

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Income", accessor: "income" },
    { header: "Company Type", accessor: "company" },
    {
      header: "Working As",
      accessor: "roles",
      render: (row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((r: string, i: number) => (
            <span key={i} className="bg-blue-100 px-2 py-1 text-xs rounded">
              {r}
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
            Work Details - {flowType}
          </h2>

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Annual Income */}
          <h3 className="mt-4 font-semibold">Annual Income</h3>
          {annualIncome.map((inc, i) => (
            <div key={i} className="flex gap-2 mt-2">
              <input
                className="border p-2 w-full"
                value={inc}
                onChange={(e) => handleIncomeChange(i, e.target.value)}
              />
              <button onClick={() => removeIncome(i)}>
                <X size={16} />
              </button>
            </div>
          ))}

          <button type="button" onClick={addIncome} className="text-blue-500 mt-2">
            + Add Income
          </button>

          {/* Working With */}
          <h3 className="mt-6 font-semibold">Working With</h3>

          {workingWith.map((w, wIndex) => (
            <div key={wIndex} className="border p-4 mt-3 rounded">
              <Input
                label="Company Type"
                value={w.name}
                onChange={(e) =>
                  handleWorkingWithName(wIndex, e.target.value)
                }
              />

              {w.workingAs.map((role, rIndex) => (
                <div key={rIndex} className="flex gap-2 mt-2">
                  <input
                    className="border p-2 w-full"
                    value={role}
                    onChange={(e) =>
                      handleWorkingAs(wIndex, rIndex, e.target.value)
                    }
                  />
                  <button onClick={() => removeWorkingAs(wIndex, rIndex)}>
                    <X size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addWorkingAs(wIndex)}
                className="text-blue-500 mt-2"
              >
                + Add Role
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addWorkingWith}
            className="text-blue-600 mt-4"
          >
            + Add Company Type
          </button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>

        <GenericTable
          title="Saved Work Details"
          columns={columns}
          data={tableData}
          showActions={false}
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
