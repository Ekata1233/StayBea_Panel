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
  onRowClick?: (row: any) => void;
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
  onRowClick,
  minWidth = "100%", // ✅ changed for responsiveness
}: GenericTableProps) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  const hasVisibleActions = showActions && (showView || showEdit || showDelete);
  const totalColumns = hasVisibleActions ? columns.length + 1 : columns.length;

  return (
    <div className="w-full rounded-lg border border-stroke bg-white px-3 pb-4 pt-4 shadow-md dark:border-strokedark dark:bg-boxdark sm:px-5 sm:pt-6">
      {title && (
        <h4 className="mb-4 text-lg font-semibold text-black dark:text-white sm:mb-6 sm:text-xl">
          {title}
        </h4>
      )}

      {/* ✅ Responsive wrapper */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] sm:min-w-[800px] lg:min-w-full">
          {/* ================= HEADER ================= */}
          <div
            className="grid rounded-md bg-gray-2 text-xs font-semibold dark:bg-meta-4 sm:text-sm"
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
              <div className="p-2 text-center sm:p-3">Actions</div>
            )}
          </div>

          {/* ================= BODY ================= */}
          {data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`grid items-center border-b border-stroke transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-3 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
              style={{
                gridTemplateColumns: `repeat(${totalColumns}, minmax(120px, 1fr))`, // ✅ responsive columns
              }}
            >
              {columns.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className={`p-2 text-xs sm:p-3 sm:text-sm ${
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
                <div className="flex justify-center gap-2 p-2 sm:gap-3 sm:p-3">
                  {showView && (
                    <button
                      onClick={() => onView?.(row)}
                      className="rounded-full bg-purple-100 p-1.5 text-purple-600 transition hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 sm:p-2"
                      title="View"
                    >
                      <Eye size={16} className="sm:h-[18px] sm:w-[18px]" />
                    </button>
                  )}

                  {showEdit && (
                    <button
                      onClick={() => onEdit?.(row)}
                      className="rounded-full bg-blue-100 p-1.5 text-blue-600 transition hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 sm:p-2"
                      title="Edit"
                    >
                      <Pencil size={16} className="sm:h-[18px] sm:w-[18px]" />
                    </button>
                  )}

                  {showDelete && (
                    <button
                      onClick={() => onDelete?.(row)}
                      className="rounded-full bg-red-100 p-1.5 text-red-600 transition hover:bg-red-200 dark:bg-red-900 dark:text-red-300 sm:p-2"
                      title="Delete"
                    >
                      <Trash2 size={16} className="sm:h-[18px] sm:w-[18px]" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* ================= EMPTY ================= */}
          {data.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 sm:py-8">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenericTable;
