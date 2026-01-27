// components/table/types.ts
import React from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T | string;
  className?: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
};
