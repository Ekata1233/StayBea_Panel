// context/WorkDetailsContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useFlowType } from "@/utils/flowType";

// Types
interface WorkingWith {
  name: string;
  workingAs: string[];
}

interface WorkDetails {
  _id: string;
  title: string;
  flowType: string;
  annualIncome: string[];
  workingWith: WorkingWith[];
  createdAt?: string;
  updatedAt?: string;
}

interface WorkDetailsContextType {
  data: WorkDetails[];
  loading: boolean;
  error: string | null;
  createData: (payload: any) => Promise<void>;
  deleteData: (flowType: string) => Promise<void>;
  refreshData: (flowType: string) => Promise<void>;
}

const WorkDetailsContext = createContext<WorkDetailsContextType | undefined>(undefined);

const API_URL = "https://dating-app-backend-plum.vercel.app/api/workDetails";

export const WorkDetailsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<WorkDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const flowType = useFlowType();

  /* ================= FETCH ================= */
  const refreshData = async (flowType: string) => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/get-all?flowType=${flowType}`);

      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE ================= */
  const createData = async (payload: any) => {
    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/create`, payload);

      if (res.data.success) {
        await refreshData(payload.flowType);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteData = async (flowType: string) => {
    try {
      setLoading(true);

      const res = await axios.delete(`${API_URL}/delete?flowType=${flowType}`);

      if (res.data.success) {
        setData([]);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flowType) {
      refreshData(flowType);
    }
  }, [flowType]);

  return (
    <WorkDetailsContext.Provider
      value={{ data, loading, error, createData, deleteData, refreshData }}
    >
      {children}
    </WorkDetailsContext.Provider>
  );
};

export const useWorkDetails = () => {
  const context = useContext(WorkDetailsContext);
  if (!context) {
    throw new Error("useWorkDetails must be used within WorkDetailsProvider");
  }
  return context;
};
