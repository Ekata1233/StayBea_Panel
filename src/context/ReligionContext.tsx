// context/ReligionContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useFlowType } from "@/utils/flowType";

// Types
interface ReligionItem {
  name: string;
  communities: string[];
}

interface Religion {
  _id: string;
  title: string;
  flowType: string;
  religions: ReligionItem[];
  createdAt?: string;
  updatedAt?: string;
}

interface ReligionContextType {
  data: Religion[];
  loading: boolean;
  error: string | null;
  createData: (payload: any) => Promise<void>;
  deleteData: (flowType: string) => Promise<void>;
  refreshData: (flowType: string) => Promise<void>;
}

const ReligionContext = createContext<ReligionContextType | undefined>(undefined);

const API_URL = "https://dating-app-backend-plum.vercel.app/api/religion";

export const ReligionProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Religion[]>([]);
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
    <ReligionContext.Provider
      value={{ data, loading, error, createData, deleteData, refreshData }}
    >
      {children}
    </ReligionContext.Provider>
  );
};

export const useReligion = () => {
  const context = useContext(ReligionContext);
  if (!context) {
    throw new Error("useReligion must be used within ReligionProvider");
  }
  return context;
};
