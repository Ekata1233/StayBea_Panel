"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useFlowType } from "@/utils/flowType";

/* ================= TYPES ================= */
interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  key: string;
  title: string;
  category: string;
  screen: string;
  isMulti: boolean;
  options: Option[];
}

interface ContextType {
  data: Question[];
  loading: boolean;
  error: string | null;
  createData: (payload: any) => Promise<void>;
  deleteData: (category: string, screen: string) => Promise<void>;
  refreshData: (category: string, screen: string) => Promise<void>;
}

const ThingsYouLoveContext = createContext<ContextType | undefined>(undefined);

const API_URL = "https://dating-app-backend-plum.vercel.app/api/question";

export const ThingsYouLoveProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const flowType = useFlowType();

  const screen = "THINGS_U_LOVE";

  /* 🔥 SAME MAPPING */
  const getCategory = (flow: string) => {
    switch (flow) {
      case "dating":
        return "DATING";
      case "mature":
        return "MATURE_CONNECTION";
      case "marriage":
        return "DATE_TO_MARRY";
      default:
        return "";
    }
  };

  /* ================= FETCH ================= */
  const refreshData = async (category: string, screen: string) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/fetch?category=${category}&screen=${screen}`
      );

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
        await refreshData(payload.category, payload.screen);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteData = async (category: string, screen: string) => {
    try {
      setLoading(true);

      await axios.delete(
        `${API_URL}/delete?category=${category}&screen=${screen}`
      );

      setData([]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* 🔥 AUTO FETCH */
  useEffect(() => {
    if (!flowType) return;

    const category = getCategory(flowType);
    if (!category) return;

    refreshData(category, screen);
  }, [flowType]);

  return (
    <ThingsYouLoveContext.Provider
      value={{
        data,
        loading,
        error,
        createData,
        deleteData,
        refreshData,
      }}
    >
      {children}
    </ThingsYouLoveContext.Provider>
  );
};

export const useThingsYouLove = () => {
  const context = useContext(ThingsYouLoveContext);
  if (!context) {
    throw new Error("useThingsYouLove must be used within Provider");
  }
  return context;
};
