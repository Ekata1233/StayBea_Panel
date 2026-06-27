// context/EducationContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useFlowType } from "@/utils/flowType";

// Types
interface Education {
  _id: string;
  title: string;
  subtitle: string;
  flowType: string;
  educations: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface EducationContextType {
  data: Education[];
  loading: boolean;
  error: string | null;
  createData: (payload: any) => Promise<void>;
  deleteData: (flowType: string) => Promise<void>;
  refreshData: (flowType: string) => Promise<void>;
}

const EducationContext = createContext<EducationContextType | undefined>(undefined);

const API_URL = "https://dating-app-backend-plum.vercel.app/api/education";

export const EducationProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Education[]>([]);
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
    <EducationContext.Provider
      value={{ data, loading, error, createData, deleteData, refreshData }}
    >
      {children}
    </EducationContext.Provider>
  );
};

export const useEducation = () => {
  const context = useContext(EducationContext);
  if (!context) {
    throw new Error("useEducation must be used within EducationProvider");
  }
  return context;
};
