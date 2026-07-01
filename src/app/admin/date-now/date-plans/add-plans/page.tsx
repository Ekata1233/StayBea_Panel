"use client";

import { useState, useEffect, useMemo } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FileInput from "@/components/ui/FileInput";
import GenericTable from "@/components/ui/GenericTable";
import {
  Loader2,
  Eye,
  Edit,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { API_BASE_URL } from "@/utils/api";

interface OptionItem {
  label: string;
  value: string;
  icon: File | string | null;
  iconPreview: string | null;
  sortOrder: number;
  isNew?: boolean;
  id?: string;
  existingIconUrl?: string | null;
  hasIconChanged?: boolean;
}

interface FormData {
  type: string;
  options: OptionItem[];
}

interface OptionData {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GroupedOptionData {
  type: string;
  options: OptionData[];
  isExpanded: boolean;
}

const DatePlanOptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [options, setOptions] = useState<OptionData[]>([]);
  const [isViewing, setIsViewing] = useState<GroupedOptionData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editType, setEditType] = useState<string | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<FormData>({
    type: "",
    options: [
      {
        label: "",
        value: "",
        icon: null,
        iconPreview: null,
        sortOrder: 1,
        isNew: true,
        existingIconUrl: null,
        hasIconChanged: false,
      },
    ],
  });

  console.log("Current formData:", formData);

  // Fetch all options
  const fetchOptions = async () => {
    try {
      setFetching(true);
      const response = await fetch(
        `${API_BASE_URL}/api/admin/date-now/options`,
      );
      const result = await response.json();

      if (result.success) {
        setOptions(result.data || []);
        console.log("Fetched options:", result.data);
      } else {
        toast.error(result.message || "Failed to fetch options");
      }
    } catch (error: any) {
      console.error("Error fetching options:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // Add new option item
  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          label: "",
          value: "",
          icon: null,
          iconPreview: null,
          sortOrder: prev.options.length + 1,
          isNew: true,
          existingIconUrl: null,
          hasIconChanged: false,
        },
      ],
    }));
  };

  // Remove option item
  const removeOption = (index: number) => {
    if (formData.options.length <= 1) {
      toast.warning("At least one option is required");
      return;
    }

    if (
      formData.options[index].iconPreview &&
      typeof formData.options[index].iconPreview === "string" &&
      formData.options[index].iconPreview?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.options[index].iconPreview as string);
    }

    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  // Handle option field change - FIXED
  const handleOptionChange = (
    index: number,
    field: keyof OptionItem,
    value: string | number | File | null,
  ) => {
    setFormData((prev) => {
      const updatedOptions = [...prev.options];
      const currentOption = updatedOptions[index];

      if (field === "label") {
        const labelValue = value as string;
        updatedOptions[index] = {
          ...currentOption,
          label: labelValue,
          value: labelValue.toLowerCase().trim().replace(/\s+/g, "_"),
        };
      } else if (field === "icon") {
        const file = value as File | null;

        if (file) {
          // New file selected
          if (
            currentOption.iconPreview &&
            typeof currentOption.iconPreview === "string" &&
            currentOption.iconPreview.startsWith("blob:")
          ) {
            URL.revokeObjectURL(currentOption.iconPreview as string);
          }

          updatedOptions[index] = {
            ...currentOption,
            icon: file,
            iconPreview: URL.createObjectURL(file),
            hasIconChanged: true,
            // CRITICAL: Keep the existingIconUrl
            existingIconUrl: currentOption.existingIconUrl,
          };
        } else {
          // File removed/cleared
          updatedOptions[index] = {
            ...currentOption,
            icon: null,
            iconPreview: null,
            hasIconChanged: false,
            // CRITICAL: Keep the existingIconUrl
            existingIconUrl: currentOption.existingIconUrl,
          };
        }
      } else {
        updatedOptions[index] = {
          ...currentOption,
          [field]: value,
        };
      }

      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };

  // Handle type change
  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value.toUpperCase(),
    }));
  };

  const resetForm = () => {
    formData.options.forEach((item) => {
      if (
        item.iconPreview &&
        typeof item.iconPreview === "string" &&
        item.iconPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(item.iconPreview);
      }
    });

    setFormData({
      type: "",
      options: [
        {
          label: "",
          value: "",
          icon: null,
          iconPreview: null,
          sortOrder: 1,
          isNew: true,
          existingIconUrl: null,
          hasIconChanged: false,
        },
      ],
    });
    setIsEditMode(false);
    setEditType(null);
  };

  // Handle Edit - Load ALL options of the type into form
  const handleEdit = (row: any) => {
    setIsEditMode(true);
    setEditType(row.type);

    formData.options.forEach((item) => {
      if (
        item.iconPreview &&
        typeof item.iconPreview === "string" &&
        item.iconPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(item.iconPreview);
      }
    });

    const typeOptions = options.filter((opt) => opt.type === row.type);

   const mappedOptions: OptionItem[] = typeOptions.map((opt): OptionItem => ({
  id: opt.id,
  label: opt.label,
  value: opt.value,
  icon: opt.icon,
  iconPreview: opt.icon,
  sortOrder: opt.sortOrder,
  isNew: false,
  existingIconUrl: opt.icon,
  hasIconChanged: false,
}));
    if (mappedOptions.length === 0) {
      mappedOptions.push({
        label: "",
        value: "",
        icon: null,
        iconPreview: null,
        sortOrder: 1,
        isNew: true,
        existingIconUrl: null,
        hasIconChanged: false,
      });
    }

    setFormData({
      type: row.type,
      options: mappedOptions,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle View - Show ALL options of the type in modal
  const handleView = (row: any) => {
    setIsViewing(row);
  };

  // Close view modal
  const closeViewModal = () => {
    setIsViewing(null);
  };

  // Toggle expand/collapse for type
  const toggleExpand = (type: string) => {
    setExpandedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Handle Submit - FIXED
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type.trim()) {
      toast.error("Type is required");
      return;
    }

    const validOptions = formData.options.filter(
      (item) => item.label.trim() && item.value.trim(),
    );

    if (validOptions.length === 0) {
      toast.error("Please add at least one option with label");
      return;
    }

    try {
      setLoading(true);

      // Prepare form data for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type.trim().toUpperCase());

      // Prepare options array with proper icon handling
      const optionsPayload = validOptions.map((item, index) => {
        // Base option object
        const option: any = {
          label: item.label.trim(),
          value: item.value.trim(),
          sortOrder: item.sortOrder,
        };

        // CRITICAL FIX: Check if this is a File object (new upload)
        const isNewFile = item.icon instanceof File;

        // CRITICAL FIX: If there's an existing icon URL and no new file, keep it
        if (item.existingIconUrl && !isNewFile) {
          option.icon = item.existingIconUrl;
          console.log(
            `✅ Option ${index} keeping existing icon: ${item.existingIconUrl}`,
          );
          return option;
        }

        // If it's a new file, don't include icon in JSON
       if (item.icon instanceof File) {
  console.log(`📁 Option ${index} has new file: ${item.icon.name}`);
  return option;
}

        // No icon
        option.icon = null;
        console.log(`❌ Option ${index} has no icon`);
        return option;
      });

      // Add options as JSON string
      formDataToSend.append("options", JSON.stringify(optionsPayload));

      // Append files with their correct index
      validOptions.forEach((item, index) => {
        if (item.icon instanceof File) {
          formDataToSend.append(`icons[${index}]`, item.icon);
          console.log(
            `📁 Appending file for option ${index} (${item.label}) as icons[${index}]`,
          );
        }
      });

      // Log what we're sending (for debugging)
      console.log("📤 Sending form data:");
      console.log("Type:", formData.type.trim().toUpperCase());
      console.log("Options Payload:", JSON.stringify(optionsPayload, null, 2));
      console.log(
        "Files being uploaded:",
        validOptions
          .filter((o) => o.icon instanceof File)
          .map((o, i) => `icons[${i}] -> ${o.label}`),
      );

      const url = `${API_BASE_URL}/api/admin/date-now/create-options`;
      const response = await fetch(url, {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors
            .map((err: any) => `${err.field}: ${err.message}`)
            .join("\n");
          throw new Error(errorMessages || result.message);
        }
        throw new Error(result.message || `Failed to save date plan options`);
      }

      toast.success(result.message || "Options saved successfully");
      resetForm();
      fetchOptions();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Group options by type
  const groupedData = useMemo(() => {
    const grouped: { [key: string]: OptionData[] } = {};

    options.forEach((option) => {
      if (!grouped[option.type]) {
        grouped[option.type] = [];
      }
      grouped[option.type].push(option);
    });

    Object.keys(grouped).forEach((type) => {
      grouped[type].sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return grouped;
  }, [options]);

  // Table columns for grouped view with action column
  const columns = [
    {
      header: "Type",
      accessor: "type",
      width: "150px",
      align: "left" as const,
      render: (row: any) => (
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {row.type}
        </span>
      ),
    },
    {
      header: "Options",
      accessor: "options",
      width: "auto",
      align: "left" as const,
      render: (row: any) => {
        const isExpanded = expandedTypes.has(row.type);
        const displayOptions = isExpanded
          ? row.options
          : row.options.slice(0, 3);
        const hasMore = row.options.length > 3;

        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {displayOptions.map((option: OptionData) => (
                <span
                  key={option.id}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {option.icon && (
                    <Image
                      src={option.icon}
                      alt={option.label}
                      width={16}
                      height={16}
                      className="h-4 w-4 rounded object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  )}
                  {option.label}
                  <span className="text-xs text-gray-400">
                    (#{option.sortOrder})
                  </span>
                </span>
              ))}
            </div>

            {hasMore && (
              <button
                onClick={() => toggleExpand(row.type)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    View More ({row.options.length - 3} more)
                  </>
                )}
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: "Total",
      accessor: "count",
      width: "80px",
      align: "center" as const,
      render: (row: any) => (
        <span className="inline-flex items-center justify-center rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {row.options.length}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      width: "120px",
      align: "center" as const,
      render: (row: any) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20"
            title="View all options of this type"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => handleEdit(row)}
            className="rounded-lg p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/20"
            title="Edit all options of this type"
          >
            <Edit size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Prepare grouped data for table
  const groupedTableData = useMemo(() => {
    return Object.keys(groupedData).map((type) => ({
      type: type,
      options: groupedData[type],
      count: groupedData[type].length,
      isExpanded: expandedTypes.has(type),
    }));
  }, [groupedData, expandedTypes]);

  return (
    <DefaultLayout>
      <ToastContainer theme="colored" />

      <div className="p-4 md:p-6">
        <div className="max-w-8xl mx-auto">
          {/* Create/Update Form */}
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-xl bg-white p-6 shadow-md dark:bg-boxdark"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    {isEditMode ? "Update" : "Create"} Date Plan Options
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {isEditMode
                      ? `Updating all options for type: ${editType}`
                      : "Add new options like Activity, Budget, Vibe, Food, Location etc."}
                  </p>
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <X size={16} />
                    Cancel Edit
                  </button>
                )}
              </div>
              {isEditMode && (
                <div className="mt-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                  <span className="font-semibold">Editing Type:</span>{" "}
                  {editType}
                  <span className="ml-2 text-xs">
                    ({formData.options.length} options loaded)
                  </span>
                </div>
              )}
            </div>

            {/* Type Input */}
            <div className="mb-6">
              <Input
                label="Type *"
                placeholder="ACTIVITY"
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                disabled={isEditMode}
              />
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Type cannot be changed while editing. Cancel to create new
                  type.
                </p>
              )}
            </div>

            {/* Options Section */}
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Options {isEditMode && `(Total: ${formData.options.length})`}
              </label>

              {formData.options.map((item, index) => (
                <div
                  key={index}
                  className="relative mb-4 rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800"
                >
                  {formData.options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                      disabled={loading}
                    >
                      <X size={16} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label={`Label ${index + 1} *`}
                      placeholder="Enter label (e.g., Coffee)"
                      value={item.label}
                      onChange={(e) =>
                        handleOptionChange(index, "label", e.target.value)
                      }
                      disabled={loading}
                      required
                    />

                    <Input
                      label={`Value ${index + 1}`}
                      placeholder="Auto-generated from label"
                      value={item.value}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-700"
                    />

                    <div className="md:col-span-1">
                      <FileInput
                        label={`Icon ${index + 1} (Optional)`}
                        accept="image/*"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleOptionChange(
                            index,
                            "icon",
                            e.target.files ? e.target.files[0] : null,
                          )
                        }
                        disabled={loading}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Images will be uploaded to ImageKit
                      </p>
                      {item.existingIconUrl && !item.hasIconChanged && (
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                          ✓ Current icon will be preserved
                        </p>
                      )}
                      {item.hasIconChanged && item.icon instanceof File && (
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                          🔄 New icon will be uploaded
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        label={`Sort Order ${index + 1}`}
                        type="number"
                        placeholder="1"
                        value={String(item.sortOrder)}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            "sortOrder",
                            Number(e.target.value),
                          )
                        }
                        disabled={loading}
                      />
                    </div>

                    {/* Icon Preview */}
                    {item.iconPreview && (
                      <div className="md:col-span-2">
                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                          Icon Preview:
                        </p>
                        <div className="relative h-16 w-16">
                          <Image
                            src={item.iconPreview}
                            alt="Preview"
                            className="h-full w-full rounded-lg border border-gray-300 object-cover"
                            width={64}
                            height={64}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* ADD OPTION BUTTON */}
              <button
                type="button"
                onClick={addOption}
                className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                disabled={loading}
              >
                <Plus size={18} />
                <span>Add Another Option</span>
              </button>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              {isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Saving..."}
                  </span>
                ) : isEditMode ? (
                  "Update All Options"
                ) : (
                  "Create Options"
                )}
              </Button>
            </div>
          </form>

          {/* Table Section - Grouped by Type with Actions */}
          <div className="mt-8">
            <GenericTable
              title="Date Plan Options (Grouped by Type)"
              columns={columns}
              data={groupedTableData}
              showActions={true}
              showView={false}
              showEdit={false}
              showDelete={false}
            />

            {fetching && !options.length && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}

            {!fetching && groupedTableData.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No options found. Create your first option above!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal - Shows ALL options of the type */}
      {isViewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Options for Type: {isViewing.type}
              </h3>
              <button
                onClick={closeViewModal}
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Total: {isViewing.options.length} options
              </span>
            </div>

            <div className="space-y-6">
              {isViewing.options.map((option, index) => (
                <div
                  key={option.id}
                  className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-black dark:text-white">
                      Option #{index + 1}
                    </h4>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        option.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {option.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Label
                      </label>
                      <p className="text-base font-semibold text-black dark:text-white">
                        {option.label}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Value
                      </label>
                      <p className="text-base font-semibold text-black dark:text-white">
                        {option.value}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Sort Order
                      </label>
                      <p className="text-base font-semibold text-black dark:text-white">
                        {option.sortOrder}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Icon
                      </label>
                      {option.icon ? (
                        <div className="mt-1">
                          <Image
                            src={option.icon}
                            alt={option.label}
                            width={48}
                            height={48}
                            className="rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-base text-gray-400">No icon</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-4 border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
                    <div>
                      <label className="text-gray-500">Created At</label>
                      <p className="text-black dark:text-white">
                        {new Date(option.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500">Updated At</label>
                      <p className="text-black dark:text-white">
                        {new Date(option.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => {
                  closeViewModal();
                  handleEdit(isViewing);
                }}
                variant="outline"
              >
                <Edit size={16} className="mr-2" />
                Edit All Options
              </Button>
              <Button onClick={closeViewModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default DatePlanOptionPage;
