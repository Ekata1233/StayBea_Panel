// context/LifestyleContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Types
interface Point {
  label: string;
}

interface Section {
  subtitle: string;
  points: Point[];
}

interface Lifestyle {
  _id: string;
  title: string;
  description: string;
  sections: Section[];
  createdAt?: string;
  updatedAt?: string;
}

interface LifestyleContextType {
  data: Lifestyle | null;
  loading: boolean;
  error: string | null;
  createData: (payload: any) => Promise<void>;
  deleteData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const LifestyleContext = createContext<LifestyleContextType | undefined>(undefined);

const API_URL = "https://dating-app-backend-plum.vercel.app/api/lifestyle";

export const LifestyleProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Lifestyle | null>(null);
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
    } finally {
      setLoading(false);
    }
  };

  // Create data
  const createData = async (payload: {
    title: string;
    description: string;
    sections: { subtitle: string; points: { label: string }[] }[];
  }) => {
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

  // Delete data
  const deleteData = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/delete`);
      if (response.data.success) {
        setData(null); // Clear data
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
    <LifestyleContext.Provider
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
    </LifestyleContext.Provider>
  );
};

export const useLifestyle = () => {
  const context = useContext(LifestyleContext);
  if (context === undefined) {
    throw new Error("useLifestyle must be used within a LifestyleProvider");
  }
  return context;
};