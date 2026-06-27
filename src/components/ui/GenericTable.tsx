// components/ui/GenericTable.tsx
"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Column {
  header: string;
  accessor: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: any) => React.ReactNode;
}

interface GenericTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  showActions?: boolean;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  minWidth?: string;
   isDeleting: string | boolean | null;
}

const GenericTable = ({
  title,
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  showView = false,
  showEdit = false,
  showDelete = true,
  minWidth = "100%", // ✅ changed for responsiveness
}: GenericTableProps) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  const hasVisibleActions = showActions && (showView || showEdit || showDelete);
  const totalColumns = hasVisibleActions ? columns.length + 1 : columns.length;

  return (
    <div className="w-full rounded-lg border border-stroke bg-white px-3 sm:px-5 pb-4 pt-4 sm:pt-6 shadow-md dark:border-strokedark dark:bg-boxdark">
      {title && (
        <h4 className="mb-4 sm:mb-6 text-lg sm:text-xl font-semibold text-black dark:text-white">
          {title}
        </h4>
      )}

      {/* ✅ Responsive wrapper */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] sm:min-w-[800px] lg:min-w-full">
          
          {/* ================= HEADER ================= */}
          <div
            className="grid bg-gray-2 text-xs sm:text-sm font-semibold dark:bg-meta-4 rounded-md"
            style={{
              gridTemplateColumns: `repeat(${totalColumns}, minmax(120px, 1fr))`, // ✅ responsive columns
            }}
          >
            {columns.map((col, index) => (
              <div
                key={index}
                className={`p-2 sm:p-3 ${
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left"
                }`}
                style={{ width: col.width }}
              >
                {col.header}
              </div>
            ))}

            {hasVisibleActions && (
              <div className="p-2 sm:p-3 text-center">Actions</div>
            )}
          </div>

          {/* ================= BODY ================= */}
          {data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid items-center border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-3 transition"
              style={{
                gridTemplateColumns: `repeat(${totalColumns}, minmax(120px, 1fr))`, // ✅ responsive columns
              }}
            >
              {columns.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className={`p-2 sm:p-3 text-xs sm:text-sm ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                  style={{ width: col.width }}
                >
                  {col.render ? col.render(row) : row[col.accessor]}
                </div>
              ))}

              {/* ================= ACTIONS ================= */}
              {hasVisibleActions && (
                <div className="flex justify-center gap-2 sm:gap-3 p-2 sm:p-3">
                  {showView && (
                    <button
                      onClick={() => onView?.(row)}
                      className="p-1.5 sm:p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 transition"
                      title="View"
                    >
                      <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  )}

                  {showEdit && (
                    <button
                      onClick={() => onEdit?.(row)}
                      className="p-1.5 sm:p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition"
                      title="Edit"
                    >
                      <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  )}

                  {showDelete && (
                    <button
                      onClick={() => onDelete?.(row)}
                      className="p-1.5 sm:p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* ================= EMPTY ================= */}
          {data.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenericTable;