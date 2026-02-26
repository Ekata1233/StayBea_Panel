// app/Things-You-Love/page.tsx
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useMemo } from "react";
import { useThingsYouLove } from "@/context/ThingsYouLoveContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GenericTable from "@/components/ui/GenericTable";
import { Loader2, X, Plus, ChevronDown, ChevronUp } from "lucide-react";

function Page() {
  const { createData, data, deleteData, loading } = useThingsYouLove();

  /* ================= FORM STATE ================= */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Sections state
  const [sections, setSections] = useState([
    {
      subtitle: "",
      pointInput: "",
      points: [] as string[],
    },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  /* ================= SECTION HANDLERS ================= */
  const addSection = () => {
    setSections([
      ...sections,
      {
        subtitle: "",
        pointInput: "",
        points: [],
      },
    ]);
    setExpandedSections([...expandedSections, sections.length]);
  };

  const removeSection = (sectionIndex: number) => {
    if (sections.length > 1) {
      const updated = sections.filter((_, i) => i !== sectionIndex);
      setSections(updated);
      setExpandedSections(expandedSections.filter(i => i !== sectionIndex));
    } else {
      toast.warning("At least one section is required");
    }
  };

  const toggleSection = (sectionIndex: number) => {
    if (expandedSections.includes(sectionIndex)) {
      setExpandedSections(expandedSections.filter(i => i !== sectionIndex));
    } else {
      setExpandedSections([...expandedSections, sectionIndex]);
    }
  };

  const handleSubtitleChange = (sectionIndex: number, value: string) => {
    const updated = [...sections];
    updated[sectionIndex].subtitle = value;
    setSections(updated);
  };

  /* ================= POINT HANDLERS ================= */
  const handlePointKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, sectionIndex: number) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      
      const value = e.currentTarget.value.trim();
      const currentPoints = sections[sectionIndex].points;
      
      if (currentPoints.includes(value)) {
        toast.warning("This point already exists");
        return;
      }
      
      const updated = [...sections];
      updated[sectionIndex].points.push(value);
      updated[sectionIndex].pointInput = "";
      setSections(updated);
    }
  };

  const addPointFromButton = (sectionIndex: number) => {
    const value = sections[sectionIndex].pointInput.trim();
    if (value) {
      const currentPoints = sections[sectionIndex].points;
      
      if (currentPoints.includes(value)) {
        toast.warning("This point already exists");
        return;
      }
      
      const updated = [...sections];
      updated[sectionIndex].points.push(value);
      updated[sectionIndex].pointInput = "";
      setSections(updated);
    }
  };

  const removePoint = (sectionIndex: number, pointIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].points = updated[sectionIndex].points.filter((_, i) => i !== pointIndex);
    setSections(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    // Validate sections
    const validSections = sections.filter(
      section => section.subtitle.trim() && section.points.length > 0
    );

    if (validSections.length === 0) {
      toast.error("Please add at least one section with subtitle and points");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        sections: validSections.map(section => ({
          subtitle: section.subtitle.trim(),
          points: section.points.map(point => ({ label: point })),
        })),
      };

      await createData(payload);

      toast.success("Things You Love saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSections([{
        subtitle: "",
        pointInput: "",
        points: [],
      }]);
      setExpandedSections([0]);
    } catch (error: any) {
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete Things You Love data?")) {
      return;
    }

    setIsDeleting("all");

    try {
      await deleteData();
      toast.success("Things You Love deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setIsDeleting(null);
    }
  };

  /* ================= FORMAT DATA FOR TABLE ================= */
  const formattedData = useMemo(() => {
    if (!data) return [];

    // Flatten sections and points for display
    const rows: any[] = [];
    
    data.sections?.forEach((section: any, sectionIndex: number) => {
      // Group points in chunks of 3 for display
      const pointChunks = [];
      for (let i = 0; i < section.points.length; i += 3) {
        pointChunks.push(section.points.slice(i, i + 3));
      }

      rows.push({
        _id: `${data._id}-${sectionIndex}`,
        title: sectionIndex === 0 ? data.title : "",
        description: sectionIndex === 0 ? data.description : "",
        subtitle: section.subtitle,
        pointChunks: pointChunks,
        allPoints: section.points,
        parentId: data._id,
      });
    });

    return rows;
  }, [data]);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      header: "Title",
      accessor: "title",
      width: "120px",
      align: "left" as const,
      render: (row: any) => (
        <span className="font-semibold text-black dark:text-white">
          {row.title}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      width: "250px",
      align: "left" as const,
      render: (row: any) => {
        if (!row.description) return null;
        
        return (
          <div className="group relative">
            <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-normal">
              {row.description.length > 100 
                ? row.description.substring(0, 100) + "..." 
                : row.description}
            </p>
            {row.description.length > 100 && (
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg p-2 max-w-xs whitespace-normal">
                  {row.description}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Subtitle",
      accessor: "subtitle",
      width: "120px",
      align: "left" as const,
      render: (row: any) => (
        <span className="font-medium text-purple-600 dark:text-purple-400">
          {row.subtitle}
        </span>
      ),
    },
    {
      header: "Points",
      accessor: "points",
      width: "300px",
      align: "left" as const,
      render: (row: any) => (
        <div className="flex flex-col gap-1.5">
          {row.pointChunks.map((chunk: any[], chunkIndex: number) => (
            <div key={chunkIndex} className="flex flex-wrap gap-1">
              {chunk.map((point: any, pointIndex: number) => (
                <span
                  key={pointIndex}
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                  title={point.label}
                >
                  {point.label.length > 20 ? point.label.substring(0, 20) + "..." : point.label}
                </span>
              ))}
            </div>
          ))}
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
          className="bg-white dark:bg-boxdark p-4 md:p-6 rounded-xl shadow-md mb-6"
        >
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-black dark:text-white">
            Create Things You Love
          </h2>

          {/* TITLE */}
          <div className="mb-3 md:mb-4">
            <Input
              label="Title"
              placeholder="Enter title (e.g., Things I Love)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-3 md:mb-4">
            <label className="mb-1.5 md:mb-2.5 block text-sm font-medium text-black dark:text-white">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed description"
              required
              disabled={isSubmitting}
              rows={4}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length} characters
            </p>
          </div>

          {/* ================= SECTIONS ================= */}
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Sections
            </label>
            
            {sections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="border border-stroke dark:border-strokedark rounded-lg mb-3 overflow-hidden"
              >
                {/* Section Header */}
                <div
                  className="bg-gray-50 dark:bg-gray-800 p-3 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection(sectionIndex)}
                >
                  <div className="flex items-center gap-2">
                    {expandedSections.includes(sectionIndex) ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                    <span className="font-medium">
                      Section {sectionIndex + 1}: {section.subtitle || "New Section"}
                    </span>
                  </div>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(sectionIndex);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Section Content */}
                {expandedSections.includes(sectionIndex) && (
                  <div className="p-3 border-t border-stroke dark:border-strokedark">
                    {/* Subtitle */}
                    <div className="mb-3">
                      <Input
                        label="Subtitle"
                        placeholder="Enter subtitle"
                        value={section.subtitle}
                        onChange={(e) => handleSubtitleChange(sectionIndex, e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Points Input */}
                    <div className="mb-3">
                      <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                        Add Points
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Type and press Enter"
                            value={section.pointInput}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[sectionIndex].pointInput = e.target.value;
                              setSections(updated);
                            }}
                            onKeyDown={(e) => handlePointKeyDown(e, sectionIndex)}
                            disabled={isSubmitting}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => addPointFromButton(sectionIndex)}
                           className="h-[47px] px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-1 text-sm disabled:opacity-50"
                          disabled={isSubmitting || !section.pointInput.trim()}
                        >
                          <Plus size={16} />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Display Points */}
                    {section.points.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                          Added Points ({section.points.length})
                        </label>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                          {section.points.map((point, pointIndex) => (
                            <span
                              key={pointIndex}
                              className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs"
                              title={point}
                            >
                              {point.length > 25 ? point.substring(0, 25) + "..." : point}
                              <button
                                type="button"
                                onClick={() => removePoint(sectionIndex, pointIndex)}
                                className="hover:text-red-600 transition"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* ADD SECTION BUTTON */}
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mt-2"
              disabled={isSubmitting}
            >
              <Plus size={18} />
              <span>Add Section</span>
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
            title="Saved Things You Love Data"
            columns={columns}
            data={formattedData}
            onDelete={handleDelete}
            showActions={true}
            showView={false}
            showEdit={false}
            showDelete={true}
            minWidth="1000px"
            isDeleting={isDeleting}
          />

          {loading && !data && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          )}
        </div>

      </div>
    </DefaultLayout>
  );
}

export default Page;