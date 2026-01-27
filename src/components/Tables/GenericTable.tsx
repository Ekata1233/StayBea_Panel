// // components/table/GenericTable.tsx
// "use client";

// import { Column } from "@/types/table";
// import React, { useState } from "react";

// type GenericTableProps<T> = {
//   data?: T[];   // 👈 make optional
//   columns: Column<T>[];
//   pageSize?: number;
// };

// function GenericTable<T>({
//   data = [],     // 👈 default fallback
//   columns,
//   pageSize = 5,
// }: GenericTableProps<T>) {
//   const [currentPage, setCurrentPage] = useState(1);

//   const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

//   const startIndex = (currentPage - 1) * pageSize;
//   const paginatedData = data.slice(startIndex, startIndex + pageSize);

//   return (
//     <div>
//       {/* EMPTY STATE */}
//       {data.length === 0 ? (
//         <div className="py-10 text-center text-gray-500">
//           No data available
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <div className="min-w-[1000px]">
//               {/* HEADER */}
//               <div className="grid grid-cols-11 bg-gray-100 font-semibold rounded-md">
//                 {columns.map((col, i) => (
//                   <div key={i} className={`p-3 ${col.className ?? ""}`}>
//                     {col.header}
//                   </div>
//                 ))}
//               </div>

//               {/* BODY */}
//               {paginatedData.map((row, rowIndex) => (
//                 <div
//                   key={rowIndex}
//                   className="grid grid-cols-11 border-b hover:bg-gray-50"
//                 >
//                   {columns.map((col, colIndex) => (
//                     <div key={colIndex} className={`p-3 ${col.className ?? ""}`}>
//                       {col.render
//                         ? col.render(row, rowIndex)
//                         : (row as any)[col.accessor]}
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* PAGINATION */}
//           <div className="mt-4 flex justify-between items-center">
//             <button
//               disabled={currentPage === 1}
//               onClick={() => setCurrentPage((p) => p - 1)}
//               className="px-3 py-1 border rounded disabled:opacity-40"
//             >
//               Prev
//             </button>

//             <span className="text-sm">
//               Page {currentPage} of {totalPages}
//             </span>

//             <button
//               disabled={currentPage === totalPages}
//               onClick={() => setCurrentPage((p) => p + 1)}
//               className="px-3 py-1 border rounded disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default GenericTable;

import React, { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  pageSize?: number;
  showPagination?: boolean;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  showActions?: boolean;
  actionsColumnTitle?: string;
  className?: string;
}

const GenericTable = <T extends Record<string, any>>({
  data,
  columns,
  title = "Data Table",
  pageSize = 5,
  showPagination = true,
  onView,
  onEdit,
  onDelete,
  showActions = false,
  actionsColumnTitle = "Actions",
  className = "",
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };
  
  const renderCellContent = (column: TableColumn<T>, row: T) => {
    if (column.render) {
      return column.render(row[column.key as keyof T], row);
    }
    
    const value = row[column.key as keyof T];
    
    // Default rendering for common types
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    
    return value?.toString() || "-";
  };
  
  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "";
    }
  };

  return (
    <div className={`rounded-lg border border-stroke bg-white px-5 pb-4 pt-6 shadow-md dark:border-strokedark dark:bg-boxdark sm:px-7.5 ${className}`}>
      {title && (
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          {title}
        </h4>
      )}

      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* ================= TABLE HEADER ================= */}
          <div className={`grid ${showActions ? "grid-cols-12" : `grid-cols-${columns.length}`} rounded-md bg-gray-2 text-sm font-semibold dark:bg-meta-4`}>
            {columns.map((column, index) => (
              <div
                key={column.key as string}
                className={`p-3 ${getAlignmentClass(column.align)} ${column.width ? `w-[${column.width}]` : ""} ${column.className || ""}`}
              >
                {column.header}
              </div>
            ))}
            
            {showActions && (
              <div className="p-3 text-center">
                {actionsColumnTitle}
              </div>
            )}
          </div>

          {/* ================= TABLE BODY ================= */}
          {currentData.length === 0 ? (
            <div className="py-10 text-center text-gray-500 dark:text-gray-400">
              No data available
            </div>
          ) : (
            currentData.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`${showActions ? "grid-cols-12" : `grid-cols-${columns.length}`} grid items-center hover:bg-gray-50 dark:hover:bg-meta-3 transition ${
                  rowIndex === currentData.length - 1
                    ? ""
                    : "border-b border-stroke dark:border-strokedark"
                }`}
              >
                {columns.map((column, colIndex) => (
                  <div
                    key={colIndex}
                    className={`p-3 ${getAlignmentClass(column.align)} ${column.width ? `w-[${column.width}]` : ""} ${column.className || ""}`}
                  >
                    {renderCellContent(column, row)}
                  </div>
                ))}
                
                {showActions && (
                  <div className="flex justify-center gap-3 p-3">
                    {onView && (
                      <button
                        onClick={() => onView(row)}
                        className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 transition"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      {showPagination && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => handlePageClick(pageNum)}
                    className={`w-10 h-10 rounded-md text-sm font-medium transition ${
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-3"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    onClick={() => handlePageClick(totalPages)}
                    className="w-10 h-10 rounded-md border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-3"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Show:</span>
            <select
              className="rounded-md border border-stroke bg-white px-3 py-2 text-sm focus:outline-none dark:border-strokedark dark:bg-boxdark"
              value={pageSize}
              onChange={(e) => {
                setCurrentPage(1);
                // You might want to pass this up to parent component
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-600 dark:text-gray-400">per page</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericTable;