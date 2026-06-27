"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useMemo, useEffect } from "react";
import { useInterestedIn } from "@/context/InterestedInContext";
import { ToastContainer, toast } from "react-toastify";


import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FileInput from "@/components/ui/FileInput";
import GenericTable from "@/components/ui/GenericTable";
import { Loader2, X, Plus, Eye } from "lucide-react";
import { useFlowType } from "@/utils/flowType";
import Image from "next/image";

function Page() {
  const { createData, data, deleteData, loading } = useInterestedIn();
  const flowType = useFlowType();

  /* ================= FORM STATE ================= */
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState([
    { 
      gender: "", 
      image: null as File | null, 
      preview: null as string | null,
      existingImage: null as string | null,
      isExistingImage: false // Track if this is an existing image
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [existingDataId, setExistingDataId] = useState<string | null>(null);

  /* ================= ROW HANDLERS ================= */
  const addRow = () => {
    setRows([...rows, { 
      gender: "", 
      image: null, 
      preview: null, 
      existingImage: null,
      isExistingImage: false 
    }]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      // Revoke preview URL to avoid memory leaks
      if (rows[index].preview) {
        URL.revokeObjectURL(rows[index].preview);
      }
      const updated = rows.filter((_, i) => i !== index);
      setRows(updated);
    } else {
      toast.warning("At least one gender is required");
    }
  };

  const handleRowChange = (index: number, field: string, value: any) => {
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setRows(updated);
  };

  const handleImageChange = (index: number, file: File | null) => {
    const updated = [...rows];

    // Revoke previous preview URL to avoid memory leaks
    if (updated[index].preview) {
      URL.revokeObjectURL(updated[index].preview);
    }

    updated[index].image = file;
    updated[index].preview = file ? URL.createObjectURL(file) : null;
    updated[index].isExistingImage = false;
    // Clear existing image when new file is uploaded
    if (file) {
      updated[index].existingImage = null;
    }
    setRows(updated);
  };

  /* ================= DOWNLOAD EXISTING IMAGE AS FILE ================= */
  const downloadImageAsFile = async (imageUrl: string): Promise<File | null> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filename = imageUrl.split('/').pop() || 'image.jpg';
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flowType) {
      toast.error("FlowType not found");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    // Check if at least one row has gender AND (image OR existingImage)
    const hasValidRows = rows.some(
      (row) => row.gender.trim() && (row.image || row.existingImage)
    );

    if (!hasValidRows) {
      toast.error("Please add at least one gender with image");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("flowType", flowType);

      // If editing existing data, send the ID
      if (isEditing && existingDataId) {
        formData.append("id", existingDataId);
      }

      // Process each row
      for (const row of rows) {
        if (!row.gender.trim()) continue;

        formData.append("gender", row.gender);
        
        // If there's a new image file, use it
        if (row.image) {
          formData.append("images", row.image);
        } 
        // If there's an existing image URL, download and send it as a file
        else if (row.existingImage && row.isExistingImage) {
          const imageFile = await downloadImageAsFile(row.existingImage);
          if (imageFile) {
            formData.append("images", imageFile);
          } else {
            toast.error(`Failed to load existing image for ${row.gender}`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      await createData(formData);

      toast.success("Interested In data saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset form
      setTitle("");
      setIsEditing(false);
      setExistingDataId(null);
      
      // Clean up preview URLs
      rows.forEach((row) => {
        if (row.preview) {
          URL.revokeObjectURL(row.preview);
        }
      });
      
      setRows([{ 
        gender: "", 
        image: null, 
        preview: null, 
        existingImage: null,
        isExistingImage: false 
      }]);
    } catch (error: any) {
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  // const handleDelete = async () => {
  //   if (!window.confirm("Are you sure you want to delete all Interested In data for this flow type?")) {
  //     return;
  //   }

  //   setIsDeleting("all");

  //   try {
  //     await deleteData();
  //     toast.success(`Interested In data for ${flowType} deleted successfully!`);
      
  //     // Reset form after delete
  //     setTitle("");
  //     setIsEditing(false);
  //     setExistingDataId(null);
  //     setRows([{ 
  //       gender: "", 
  //       image: null, 
  //       preview: null, 
  //       existingImage: null,
  //       isExistingImage: false 
  //     }]);
  //   } catch (error: any) {
  //     toast.error(error.message || "Failed to delete");
  //   } finally {
  //     setIsDeleting(null);
  //   }
  // };

  /* ================= LOAD EXISTING DATA ================= */
  useEffect(() => {
    if (!data || !flowType) return;

    const existing = data.find((item: any) => item.flowType === flowType);

    if (existing) {
      setIsEditing(true);
      setExistingDataId(existing._id ?? null);
      setTitle(existing.title || "");
      
      setRows(
        existing.genderImages?.length
          ? existing.genderImages.map((item: any) => ({
              gender: item.gender || "",
              image: null, // No new file
              preview: item.image || null, // Show existing image as preview
              existingImage: item.image || null, // Store existing image URL
              isExistingImage: true, // Mark as existing image
            }))
          : [{ 
              gender: "", 
              image: null, 
              preview: null, 
              existingImage: null,
              isExistingImage: false 
            }]
      );
    } else {
      setIsEditing(false);
      setExistingDataId(null);
      setTitle("");
      setRows([{ 
        gender: "", 
        image: null, 
        preview: null, 
        existingImage: null,
        isExistingImage: false 
      }]);
    }
  }, [data, flowType]);

  /* ================= FORMAT DATA FOR TABLE ================= */
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const rows: any[] = [];

    data.forEach((item: any, docIndex: number) => {
      item.genderImages?.forEach((subItem: any, itemIndex: number) => {
        rows.push({
          _id: `${item._id}-${itemIndex}`,
          title: itemIndex === 0 ? item.title : "",
          gender: subItem.gender,
          image: subItem.image,
          parentId: item._id,
          isFirstInGroup: itemIndex === 0,
          groupSize: item.genderImages.length,
          flowType: item.flowType,
        });
      });
    });

    return rows;
  }, [data]);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      header: "Title",
      accessor: "title",
      width: "150px",
      align: "left" as const,
      render: (row: any) => (
        <span className="font-semibold text-black dark:text-white">
          {row.title}
        </span>
      ),
    },
    {
      header: "Gender",
      accessor: "gender",
      width: "150px",
      align: "left" as const,
      render: (row: any) => (
        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900 dark:text-purple-300">
          {row.gender}
        </span>
      ),
    },
    {
      header: "Image",
      accessor: "image",
      width: "120px",
      align: "center" as const,
      render: (row: any) => (
        <div className="flex justify-center">
          <div className="group relative">
            <Image
              src={row.image}
              alt={row.gender}
              width={200}
              height={200}
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
            {isEditing ? "Edit" : "Create"} Interested In - {flowType?.toUpperCase() || "Loading..."}
          </h2>

          {/* TITLE */}
          <div className="mb-4 md:mb-6">
            <Input
              label="Title"
              placeholder="Enter title (e.g., Who I'm Interested In)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* ================= GENDER ROWS ================= */}
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Gender & Images
            </label>

            {rows.map((row, index) => (
              <div
                key={index}
                className="relative mb-4 rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800"
              >
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </button>
                )}

                <div className="mb-4">
                  <Input
                    label={`Gender ${index + 1}`}
                    placeholder="Enter gender (e.g., Male, Female, etc.)"
                    value={row.gender}
                    onChange={(e) =>
                      handleRowChange(index, "gender", e.target.value)
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <FileInput
                    label={`Image ${index + 1} ${row.existingImage && row.isExistingImage ? "(Current image preserved, upload new to replace)" : ""}`}
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleImageChange(
                        index,
                        e.target.files ? e.target.files[0] : null,
                      )
                    }
                    disabled={isSubmitting}
                    required={!row.existingImage} // Only required if no existing image
                  />
                </div>

                {/* Image Preview */}
                {(row.preview || row.existingImage) && (
                  <div className="mt-3">
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      {row.preview ? "New Image Preview:" : "Current Image:"}
                    </p>
                    <div className="relative h-24 w-24">
                      <Image
                        src={row.preview || row.existingImage!}
                        width={200}
                        height={200}
                        alt="Preview"
                        className="h-full w-full rounded-lg border border-gray-300 object-cover"
                      />
                    </div>
                    {row.existingImage && row.isExistingImage && !row.preview && (
                      <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                        ✓ Existing image will be preserved
                      </p>
                    )}
                    {row.preview && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        New image will replace existing one
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* ADD MORE BUTTON */}
            <button
              type="button"
              onClick={addRow}
              className="mt-2 flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              disabled={isSubmitting}
            >
              <Plus size={18} />
              <span>Add Another Gender</span>
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
              isEditing ? "Update" : "Save"
            )}
          </Button>
        </form>

        {/* ================= TABLE ================= */}
        <div className="mt-6 md:mt-8">
          <GenericTable
            title={`Saved Interested In Data - ${flowType?.toUpperCase() || "Loading..."}`}
            columns={columns}
            data={formattedData}
            
            showActions={false}
            showView={false}
            showEdit={false}
            showDelete={true}
            isDeleting={isDeleting}
          />

          {loading && !data.length && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          )}

          {!loading && formattedData.length === 0 && data && data.length > 0 && (
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