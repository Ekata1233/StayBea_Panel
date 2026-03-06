"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Option {
  label: string;
}

interface SexualOrientation {
  _id?: string;
  title: string;
  options: Option[];
}

interface ContextType {
  data: SexualOrientation[];
  createData: (payload: SexualOrientation) => Promise<void>;
  deleteData: () => Promise<void>;
  fetchData: () => Promise<void>;
}

const SexualOrientationContext = createContext<ContextType | null>(null);

export const SexualOrientationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<SexualOrientation[]>([]);

  const API_BASE =
    "https://dating-app-backend-plum.vercel.app/api/sexual-orientation";

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-all`);
      const json = await res.json();
      setData(json.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  /* ================= CREATE ================= */
  const createData = async (payload: SexualOrientation) => {
    const res = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to create");
    }

    await fetchData();
  };

  /* ================= DELETE ================= */
  const deleteData = async () => {
    const res = await fetch(`${API_BASE}/delete`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete");
    }

    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SexualOrientationContext.Provider
      value={{ data, createData, deleteData, fetchData }}
    >
      {children}
    </SexualOrientationContext.Provider>
  );
};

export const useSexualOrientation = () => {
  const context = useContext(SexualOrientationContext);
  if (!context) {
    throw new Error("useSexualOrientation must be used within provider");
  }
  return context;
};
