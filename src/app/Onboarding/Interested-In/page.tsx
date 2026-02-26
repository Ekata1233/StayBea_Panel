"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useMemo } from "react";
import { useInterestedIn } from "@/context/InterestedInContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FileInput from "@/components/ui/FileInput";
import { Loader2 } from "lucide-react";

function Page() {
  const { createData, data, deleteData } = useInterestedIn();

  /* ================= FORM STATE ================= */
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState([
    { gender: "", image: null as File | null },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const hasValidRows = rows.some(
      (row) => row.gender.trim() && row.image
    );

    if (!hasValidRows) {
      toast.error("Please add at least one gender with image");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);

      rows.forEach((row) => {
        if (row.gender.trim()) {
          formData.append("gender", row.gender);
        }
        if (row.image) {
          formData.append("images", row.image);
        }
      });

      await createData(formData);

      toast.success("Data saved successfully!");

      setTitle("");
      setRows([{ gender: "", image: null }]);
    } catch (error: any) {
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setIsDeleting(id);

    try {
      await deleteData(id);
      toast.success("Item deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsDeleting(null);
    }
  };

  /* ================= CUSTOM TABLE COMPONENT ================= */
  const InterestedInTable = () => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No interested in data available
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            {/* Table Header */}
            <thead className="bg-gray-2 text-sm font-semibold dark:bg-meta-4">
              <tr>
                <th className="p-3 text-left min-w-[200px]">Title</th>
                <th className="p-3 text-left min-w-[150px]">Gender</th>
                <th className="p-3 text-left min-w-[200px]">Image</th>
                <th className="p-3 text-center min-w-[100px]">Actions</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {data.map((item: any) => (
                // For each item (title group), render all its genderImages
                item.genderImages?.map((gi: any, index: number) => (
                  <tr 
                    key={`${item._id}-${index}`}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-3 transition"
                  >
                    {/* Title Column - only for first row of this group */}
                    {index === 0 ? (
                      <td 
                        className="p-3 align-top font-semibold text-black dark:text-white"
                        rowSpan={item.genderImages.length}
                      >
                        {item.title}
                      </td>
                    ) : null}
                    
                    {/* Gender Column */}
                    <td className="p-3">
                      <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                        {gi.gender}
                      </span>
                    </td>
                    
                    {/* Image Column */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={gi.image}
                          alt={gi.gender}
                          className="w-[50px] h-[50px] rounded-md object-cover border border-gray-200 dark:border-gray-700"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {gi.image.split('/').pop()?.substring(0, 20)}...
                        </span>
                      </div>
                    </td>
                    
                    {/* Actions Column - only for first row of this group */}
                    {index === 0 ? (
                      <td 
                        className="p-3 text-center align-middle"
                        rowSpan={item.genderImages.length}
                      >
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={isDeleting === item._id}
                          className={`p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition ${
                            isDeleting === item._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Delete all items"
                        >
                          {isDeleting === item._id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 4V3c0-1 1-2 2-2h4c1 0 2 1 2 2v1"></path>
                            </svg>
                          )}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              ))}
            </tbody>
          </table>
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
          className="bg-white dark:bg-boxdark p-4 md:p-6 rounded-xl shadow-md mb-6"
        >
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-black dark:text-white">
            Create Interested In
          </h2>

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

          {rows.map((row, index) => (
            <div
              key={index}
              className="border border-stroke dark:border-strokedark p-4 rounded-lg mb-3 bg-gray-50 dark:bg-gray-800 relative"
            >
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              )}

              <div className="mb-3">
                <Input
                  label="Gender"
                  placeholder="Enter gender"
                  value={row.gender}
                  onChange={(e) =>
                    handleRowChange(index, "gender", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>

              <FileInput
                label="Upload Image"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleRowChange(
                    index,
                    "image",
                    e.target.files ? e.target.files[0] : null
                  )
                }
                disabled={isSubmitting}
              />

              {row.image && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(row.image)}
                    alt="Preview"
                    className="w-16 h-16 rounded-md object-cover border"
                  />
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="bg-green-600 text-white px-4 py-2 rounded-md mb-4 hover:bg-green-700 text-sm"
            disabled={isSubmitting}
          >
            + Add More
          </button>

          <div>
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
          </div>
        </form>

        {/* ================= TABLE ================= */}
        <div className="mt-6 md:mt-8">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-black dark:text-white">
            Saved Interested In Data
          </h2>
          
          <InterestedInTable />
        </div>

      </div>
    </DefaultLayout>
  );
}

export default Page;