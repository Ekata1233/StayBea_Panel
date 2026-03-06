// context/GenderContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Types
interface GenderOption {
  label: string;
}

interface Gender {
  _id: string;
  title: string;
  options: GenderOption[];
  createdAt?: string;
  updatedAt?: string;
}

interface GenderContextType {
  data: Gender[];
  loading: boolean;
  error: string | null;
  createData: (payload: { title: string; options: { label: string }[] }) => Promise<void>;
  deleteData: () => Promise<void>; // Changed: no id parameter - deletes all
  refreshData: () => Promise<void>;
}

const GenderContext = createContext<GenderContextType | undefined>(undefined);

const API_URL = "https://dating-app-backend-plum.vercel.app/api/gender";

export const GenderProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Gender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all genders
  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/get-all`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create gender (replaces existing)
  const createData = async (payload: { title: string; options: { label: string }[] }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/create`, payload);
      if (response.data.success) {
        await refreshData(); // Refresh after creating
        return response.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete ALL genders (matches your backend /delete endpoint)
  const deleteData = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/delete`);
      if (response.data.success) {
        setData([]); // Clear local data immediately
        return response.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <GenderContext.Provider
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
    </GenderContext.Provider>
  );
};

export const useGender = () => {
  const context = useContext(GenderContext);
  if (context === undefined) {
    throw new Error("useGender must be used within a GenderProvider");
  }
  return context;
};