"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useFlowType } from "@/utils/flowType";

interface Option {
  label: string;
}

interface SexualOrientation {
  _id?: string;
  title: string;
  options: Option[];
  flowType?: string; // ✅ added
}

interface ContextType {
  data: SexualOrientation[];
  loading: boolean;
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
  const flowType = useFlowType(); 
  const [loading, setLoading] = useState(false);
  const API_BASE =
    "https://dating-app-backend-plum.vercel.app/api/sexual-orientation";

  /* ================= FETCH ================= */
const fetchData = async () => {
  if (!flowType) return;

  setLoading(true); // ✅ START

  try {
    const res = await fetch(`${API_BASE}/get-all?flowType=${flowType}`);
    const json = await res.json();

    const filtered = (json.data || []).filter(
      (item: SexualOrientation) => item.flowType === flowType
    );

    setData(filtered);
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setLoading(false); // ✅ END
  }
};

  /* ================= CREATE ================= */
  const createData = async (payload: SexualOrientation) => {
    if (!flowType) {
      throw new Error("Flow type missing");
    }

    const res = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        flowType, // ✅ attach flowType
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create");
    }

    await fetchData();
  };

  /* ================= DELETE ================= */
  const deleteData = async () => {
    if (!flowType) {
      throw new Error("Flow type missing");
    }

    const res = await fetch(`${API_BASE}/delete?flowType=${flowType}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete");
    }

    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [flowType]); // ✅ refetch when flow changes

  return (
    <SexualOrientationContext.Provider
      value={{ data,loading, createData, deleteData, fetchData }}
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