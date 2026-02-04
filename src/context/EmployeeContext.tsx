"use client";

import { IEmployee } from "@/types/employee";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface EmployeeContextType {
  employees: IEmployee[];
  employeeLoading: boolean;
  employeeError: string | null;

  refreshEmployees: () => Promise<void>;

  registerEmployee: (
    employee: Omit<IEmployee, "_id" | "createdAt" | "updatedAt">
  ) => Promise<IEmployee>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState<boolean>(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  // ============================
  // Fetch Employees
  // ============================
  const fetchEmployees = async () => {
    setEmployeeLoading(true);
    setEmployeeError(null);

    try {
      const res = await fetch("/api/employee");
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        setEmployees(data.data);
      } else {
        setEmployees([]);
        setEmployeeError(data.message || "No employees found");
      }
    } catch (error: any) {
      setEmployeeError(error.message || "Failed to fetch employees");
    } finally {
      setEmployeeLoading(false);
    }
  };

  // ============================
  // Register Employee (RETURN DATA ✅)
  // ============================
  const registerEmployee = async (
    employee: Omit<IEmployee, "_id" | "createdAt" | "updatedAt">
  ): Promise<IEmployee> => {
    try {
      setEmployeeLoading(true);
      setEmployeeError(null);

      const res = await fetch("/api/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to register employee");
      }

      // Update state optimistically
      setEmployees((prev) => [data.data, ...prev]);

      return data.data; // 🔥 RETURN DATA
    } catch (error: any) {
      setEmployeeError(error.message || "Failed to register employee");
      throw error; // 🔥 THROW for UI handling
    } finally {
      setEmployeeLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        employeeLoading,
        employeeError,
        refreshEmployees: fetchEmployees,
        registerEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

// ============================
// Hook
// ============================
export const useEmployeeContext = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error(
      "useEmployeeContext must be used within an EmployeeProvider"
    );
  }
  return context;
};
