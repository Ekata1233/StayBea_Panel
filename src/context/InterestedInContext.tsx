"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { useFlowType } from "@/utils/flowType"; // ✅ ADDED

interface GenderImage {
  gender: string;
  image: string;
}

interface InterestedIn {
  _id?: string;
  title: string;
  genderImages: GenderImage[];
}

interface InterestedInContextType {
  data: InterestedIn[];
  loading: boolean;
  error: string | null;
  fetchData: (flowType: string) => Promise<void>; // ✅ UPDATED
  createData: (formData: FormData) => Promise<void>;
  deleteData: (id: string) => Promise<void>;
}

const InterestedInContext = createContext<
  InterestedInContextType | undefined
>(undefined);

export const InterestedInProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [data, setData] = useState<InterestedIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flowType = useFlowType(); // ✅ ADDED

  const API_URL =
    "https://dating-app-backend-plum.vercel.app/api/interested-in";

  // ✅ GET ALL (WITH FLOWTYPE)
  const fetchData = async (flowType: string) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/get-all?flowType=${flowType}` // ✅ UPDATED
      );
      setData(res.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREATE (WITH FLOWTYPE REFRESH)
  const createData = async (formData: FormData) => {
    try {
      setLoading(true);

      const flowType = formData.get("flowType") as string; // ✅ ADDED

      await axios.post(`${API_URL}/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchData(flowType); // ✅ UPDATED
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE (NO CHANGE)
  const deleteData = async (id: string) => {
    try {
      setLoading(true);

      await axios.delete(`${API_URL}/delete/${id}`);

      setData((prev) => prev.filter((item) => item._id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ AUTO FETCH BASED ON FLOWTYPE
  useEffect(() => {
    if (flowType) {
      fetchData(flowType); // ✅ UPDATED
    }
  }, [flowType]);

  return (
    <InterestedInContext.Provider
      value={{ data, loading, error, fetchData, createData, deleteData }}
    >
      {children}
    </InterestedInContext.Provider>
  );
};

export const useInterestedIn = () => {
  const context = useContext(InterestedInContext);

  if (!context) {
    throw new Error(
      "useInterestedIn must be used inside InterestedInProvider"
    );
  }

  return context;
};
