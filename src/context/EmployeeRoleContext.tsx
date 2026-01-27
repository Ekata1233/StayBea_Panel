"use client";

import { IEmployeeRole } from "@/types/employeeRole";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";


interface EmployeeRoleContextType {
  employeeRoles: IEmployeeRole[];
  employeeRoleLoading: boolean;
  employeeRoleError: string | null;
  refreshEmployeeRoles: () => Promise<void>;
  addEmployeeRole: (role: Omit<IEmployeeRole, "_id">) => Promise<void>;
}

const EmployeeRoleContext = createContext<EmployeeRoleContextType | undefined>(
  undefined
);

export const EmployeeRoleProvider = ({ children }: { children: ReactNode }) => {
  const [employeeRoles, setEmployeeRoles] = useState<IEmployeeRole[]>([]);
  const [employeeRoleLoading, setEmployeeRoleLoading] = useState<boolean>(false);
  const [employeeRoleError, setEmployeeRoleError] = useState<string | null>(null);

  const fetchEmployeeRoles = async () => {
    setEmployeeRoleLoading(true);
    setEmployeeRoleError(null);
    try {
      const res = await fetch(`/api/employee/employee-roles`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setEmployeeRoles(data.data);
      } else {
        setEmployeeRoles([]);
        setEmployeeRoleError("No employee roles found.");
      }
    } catch (error: any) {
      setEmployeeRoleError(error.message || "Failed to fetch employee roles.");
    } finally {
      setEmployeeRoleLoading(false);
    }
  };

   const addEmployeeRole = async (role: Omit<IEmployeeRole, "_id">) => {
    try {
      setEmployeeRoleLoading(true);
      setEmployeeRoleError(null);

      const res = await fetch("/api/employee/employee-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(role),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
      throw new Error(data.message || "Failed to add employee role");
    }
    await fetchEmployeeRoles();
    return;
    } catch (error: any) {
      setEmployeeRoleError(error.message || "Failed to add employee role.");
      throw error;
    } finally {
      setEmployeeRoleLoading(false);
    }
  };


  useEffect(() => {
    fetchEmployeeRoles();
  }, []);

  return (
    <EmployeeRoleContext.Provider
      value={{
        employeeRoles,
        employeeRoleLoading,
        employeeRoleError,
        refreshEmployeeRoles: fetchEmployeeRoles,
         addEmployeeRole,
      }}
    >
      {children}
    </EmployeeRoleContext.Provider>
  );
};

export const useEmployeeRoleContext = () => {
  const context = useContext(EmployeeRoleContext);
  if (!context) {
    throw new Error(
      "useEmployeeRoleContext must be used within an EmployeeRoleProvider"
    );
  }
  return context;
};
