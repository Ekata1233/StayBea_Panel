"use client";

import Image from "next/image";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Column {
  header: string;
  accessor: string;
  width?: string;
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
}

const GenericTable = ({
  title,
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}: GenericTableProps) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <div className="rounded-lg border border-stroke bg-white px-5 pb-4 pt-6 shadow-md dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      {title && (
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          {title}
        </h4>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          
          {/* ================= HEADER ================= */}
          <div className="grid grid-cols-12 bg-gray-2 text-sm font-semibold dark:bg-meta-4">
            {columns.map((col, index) => (
              <div
                key={index}
                className="p-3"
                style={{ width: col.width }}
              >
                {col.header}
              </div>
            ))}

            {showActions && (
              <div className="p-3 text-center">Actions</div>
            )}
          </div>

          {/* ================= BODY ================= */}
          {data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-12 items-center border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-3 transition"
            >
              {columns.map((col, colIndex) => (
                <div key={colIndex} className="p-3">
                  {col.render
                    ? col.render(row)
                    : row[col.accessor]}
                </div>
              ))}

              {/* ================= ACTIONS ================= */}
              {showActions && (
                <div className="flex justify-center gap-3 p-3">
                  
                  {/* VIEW */}
                  <button
                    onClick={() => onView?.(row)}
                    className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 transition"
                  >
                    <Eye size={18} />
                  </button>

                  {/* EDIT */}
                  {user?.manageAccess?.Update && (
                    <button
                      onClick={() => onEdit?.(row)}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition"
                    >
                      <Pencil size={18} />
                    </button>
                  )}

                  {/* DELETE */}
                  <button
                    onClick={() => onDelete?.(row)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenericTable;
