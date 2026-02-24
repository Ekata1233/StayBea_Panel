"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState } from "react";
import { useInterestedIn } from "@/context/InterestedInContext";

// ✅ UI Components
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FileInput from "@/components/ui/FileInput";
import GenericTable from "@/components/ui/GenericTable";

function Page() {
  const { createData, data } = useInterestedIn();

  /* ================= FORM STATE ================= */

  const [title, setTitle] = useState("");

  const [rows, setRows] = useState([
    {
      gender: "",
      image: null as File | null,
    },
  ]);

  /* ================= ROW HANDLERS ================= */

  const addRow = () => {
    setRows([...rows, { gender: "", image: null }]);
  };

  const removeRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const handleRowChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setRows(updated);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    // ✅ Title Only Once
    formData.append("title", title);

    // ✅ Loop Rows
    rows.forEach((row) => {
      formData.append("gender", row.gender);
      if (row.image) {
        formData.append("images", row.image);
      }
    });

    await createData(formData);

    // ✅ Reset Form
    setTitle("");
    setRows([{ gender: "", image: null }]);
  };

  /* ================= TABLE COLUMNS ================= */

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Gender",
      accessor: "genderImages",
      render: (row: any) => (
        <div className="flex flex-wrap gap-2">
          {row.genderImages?.map(
            (g: any, index: number) => (
              <span
                key={index}
                className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs"
              >
                {g.gender}
              </span>
            )
          )}
        </div>
      ),
    },
    {
      header: "Images",
      accessor: "genderImages",
      render: (row: any) => (
        <div className="flex gap-3">
          {row.genderImages?.map(
            (g: any, index: number) => (
              <img
                key={index}
                src={g.image}
                alt="image"
                className="w-[50px] h-[50px] rounded-md object-cover"
              />
            )
          )}
        </div>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <DefaultLayout>
      <div className="p-6">

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-md"
        >
          <h2 className="text-xl font-bold mb-6">
            Create Interested In
          </h2>

          {/* TITLE */}
          <Input
            label="Title"
            placeholder="Enter title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />

          {/* ================= ROWS ================= */}
          {rows.map((row, index) => (
            <div
              key={index}
              className="border p-4 rounded-lg mb-5 relative"
            >
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeRow(index)
                  }
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-xs"
                >
                  Remove
                </button>
              )}

              {/* GENDER */}
              <Input
                label="Gender"
                placeholder="Enter gender"
                value={row.gender}
                onChange={(e) =>
                  handleRowChange(
                    index,
                    "gender",
                    e.target.value
                  )
                }
              />

              {/* IMAGE */}
              <FileInput
                label="Upload Image"
                accept="image/*"
                onChange={(e: any) =>
                  handleRowChange(
                    index,
                    "image",
                    e.target.files
                      ? e.target.files[0]
                      : null
                  )
                }
              />
            </div>
          ))}

          {/* ADD MORE */}
          <button
            type="button"
            onClick={addRow}
            className="bg-green-600 text-white px-5 py-2 rounded-md mb-5"
          >
            + Add More
          </button>

          {/* SUBMIT */}
          <Button type="submit">
            Save
          </Button>
        </form>

        {/* ================= TABLE ================= */}
        <div className="mt-10">
          <GenericTable
            title="Saved Interested In Data"
            columns={columns}
            data={data || []}
            showActions={false}
          />
        </div>

      </div>
    </DefaultLayout>
  );
}

export default Page;
