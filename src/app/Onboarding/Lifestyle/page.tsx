// app/Lifestyle/page.tsx
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useMemo } from "react";
import { useLifestyle } from "@/context/LifestyleContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Loader2, X, Plus, ChevronDown, ChevronUp } from "lucide-react";

function Page() {
  const { createData, data, deleteData, loading } = useLifestyle();

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
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

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

      toast.success("Lifestyle saved successfully!", {
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
      setExpandedSections([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (lifestyleId: string) => {
    if (!window.confirm("Are you sure you want to delete this lifestyle data?")) {
      return;
    }

    setIsDeleting(lifestyleId);

    try {
      await deleteData();
      toast.success("Lifestyle data deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setIsDeleting(null);
    }
  };

  /* ================= CUSTOM TABLE COMPONENT ================= */
  const LifestyleTable = () => {
    if (!data) return null;

    return (
      <div className="rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            {/* Table Header */}
            <thead className="bg-gray-2 text-sm font-semibold dark:bg-meta-4">
              <tr>
                <th className="p-3 text-left min-w-[120px]">Title</th>
                <th className="p-3 text-left min-w-[150px]">Description</th>
                <th className="p-3 text-left min-w-[120px]">Subtitle</th>
                <th className="p-3 text-left min-w-[350px]">Points</th>
                <th className="p-3 text-center min-w-[80px]">Actions</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {data.sections?.map((section: any, sectionIndex: number) => {
                // Group points in chunks of 3 for display
                const pointChunks = [];
                for (let i = 0; i < section.points.length; i += 3) {
                  pointChunks.push(section.points.slice(i, i + 3));
                }

                return (
                  <tr 
                    key={`${data._id}-${sectionIndex}`}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-3 transition"
                  >
                    {/* Title Column - only for first section */}
                    {sectionIndex === 0 ? (
                      <td 
                        className="p-3 align-top font-semibold text-black dark:text-white"
                        rowSpan={data.sections.length}
                      >
                        {data.title}
                      </td>
                    ) : null}
                    
                    {/* Description Column - only for first section */}
                    {sectionIndex === 0 ? (
                      <td 
                        className="p-3 align-top text-sm text-gray-600 dark:text-gray-400"
                        rowSpan={data.sections.length}
                      >
                        <span className="line-clamp-2">{data.description}</span>
                      </td>
                    ) : null}
                    
                    {/* Subtitle Column */}
                    <td className="p-3">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {section.subtitle}
                      </span>
                    </td>
                    
                    {/* Points Column */}
                    <td className="p-3">
                      <div className="flex flex-col gap-1.5">
                        {pointChunks.map((chunk: any[], chunkIndex: number) => (
                          <div key={chunkIndex} className="flex flex-wrap gap-1">
                            {chunk.map((point: any, pointIndex: number) => (
                              <span
                                key={pointIndex}
                                className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full text-xs"
                              >
                                {point.label}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </td>
                    
                    {/* Actions Column - only for first section */}
                    {sectionIndex === 0 ? (
                      <td 
                        className="p-3 text-center align-middle"
                        rowSpan={data.sections.length}
                      >
                        <button
                          onClick={() => handleDelete(data._id)}
                          disabled={isDeleting === data._id}
                          className={`p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition ${
                            isDeleting === data._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Delete lifestyle data"
                        >
                          {isDeleting === data._id ? (
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
                );
              })}
            </tbody>
          </table>
          
          {/* Empty State */}
          {!data && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No lifestyle data available
            </div>
          )}
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
            Create Lifestyle
          </h2>

          {/* TITLE */}
          <div className="mb-3 md:mb-4">
            <Input
              label="Title"
              placeholder="Enter title (e.g., Healthy Lifestyle)"
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
              placeholder="Enter description"
              required
              disabled={isSubmitting}
              rows={3}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
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
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1 text-sm"
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
                        <div className="flex flex-wrap gap-1.5">
                          {section.points.map((point, pointIndex) => (
                            <span
                              key={pointIndex}
                              className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full text-xs"
                            >
                              {point}
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
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
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
          <h2 className="text-lg md:text-xl font-bold mb-4 text-black dark:text-white">
            Saved Lifestyle Data
          </h2>
          
          <LifestyleTable />

          {loading && !data && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}
        </div>

      </div>
    </DefaultLayout>
  );
}

export default Page;