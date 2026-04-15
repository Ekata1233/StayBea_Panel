// app/education/page.tsx
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useEffect, useMemo } from "react";
import { useEducation } from "@/context/EducationContext";
import { useFlowType } from "@/utils/flowType";
import { ToastContainer, toast } from "react-toastify";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GenericTable from "@/components/ui/GenericTable";
import { Plus, X, Loader2 } from "lucide-react";

function Page() {
  const { data, createData, deleteData, loading } = useEducation();
  const flowType = useFlowType();

  /* ================= STATE ================= */
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [educations, setEducations] = useState<string[]>([""]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ================= HANDLERS ================= */
  const addEducation = () => {
    setEducations([...educations, ""]);
  };

  const removeEducation = (index: number) => {
    const updated = educations.filter((_, i) => i !== index);
    setEducations(updated);
  };

  const handleEducationChange = (index: number, value: string) => {
    const updated = [...educations];
    updated[index] = value;
    setEducations(updated);
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

    const valid = educations.filter((e) => e.trim());

    if (valid.length === 0) {
      toast.error("Add at least one education");
      return;
    }

    setIsSubmitting(true);

    try {
      await createData({
        flowType,
        title,
        subtitle,
        educations: valid,
      });

      toast.success("Saved successfully");

      setTitle("");
      setSubtitle("");
      setEducations([""]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!flowType) return;

    if (!confirm("Delete all education data?")) return;

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
      setSubtitle(existing.subtitle || "");
      setEducations(
        existing.educations.length ? existing.educations : [""]
      );
    }
  }, [data, flowType]);

  /* ================= TABLE ================= */
  const tableData = useMemo(() => {
    const rows: any[] = [];

    data.forEach((doc) => {
      doc.educations.forEach((edu, i) => {
        rows.push({
          _id: `${doc._id}-${i}`,
          title: i === 0 ? doc.title : "",
          subtitle: i === 0 ? doc.subtitle : "",
          education: edu,
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
      header: "Subtitle",
      accessor: "subtitle",
    },
    {
      header: "Education",
      accessor: "education",
    },
  ];

  /* ================= UI ================= */
  return (
    <DefaultLayout>
      <ToastContainer />

      <div className="p-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">
            Education - {flowType}
          </h2>

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />

          {educations.map((edu, index) => (
            <div key={index} className="flex gap-2 mt-3">
              <input
                className="border p-2 w-full"
                value={edu}
                onChange={(e) =>
                  handleEducationChange(index, e.target.value)
                }
              />
              <button onClick={() => removeEducation(index)}>
                <X size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addEducation}
            className="text-blue-500 mt-3"
          >
            + Add Education
          </button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </form>

        <GenericTable
          title="Saved Education Data"
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
