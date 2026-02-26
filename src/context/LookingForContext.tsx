// context/LookingForContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Types
interface LookingForItem {
  image: string;
  description: string;
}

interface LookingFor {
  _id: string;
  title: string;
  items: LookingForItem[];
  createdAt?: string;
  updatedAt?: string;
}

interface LookingForContextType {
  data: LookingFor[];
  loading: boolean;
  error: string | null;
  createData: (formData: FormData) => Promise<void>;
  deleteData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const LookingForContext = createContext<LookingForContextType | undefined>(undefined);

const API_URL = "https://dating-app-backend-plum.vercel.app/api/lookingFor";

export const LookingForProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<LookingFor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
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

  // Create data
  const createData = async (formData: FormData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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

  // Delete data
  const deleteData = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/delete`);
      if (response.data.success) {
        setData([]); // Clear data
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
    <LookingForContext.Provider
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
    </LookingForContext.Provider>
  );
};

export const useLookingFor = () => {
  const context = useContext(LookingForContext);
  if (context === undefined) {
    throw new Error("useLookingFor must be used within a LookingForProvider");
  }
  return context;
};