"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

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
  fetchData: () => Promise<void>;
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

  const API_URL =
    "https://dating-app-backend-plum.vercel.app/api/interested-in";

  // ✅ GET ALL
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/get-all`);
      setData(res.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREATE
  const createData = async (formData: FormData) => {
    try {
      setLoading(true);

      await axios.post(`${API_URL}/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchData(); // refresh after create
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // ✅ DELETE
  const deleteData = async (id: string) => {
    try {
      setLoading(true);

      await axios.delete(`${API_URL}/delete/${id}`);

      // remove from state instantly (optional optimization)
      setData((prev) => prev.filter((item) => item._id !== id));

      // OR refresh from backend
      // await fetchData();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <InterestedInContext.Provider
      value={{ data, loading, error, fetchData, createData,deleteData }}
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
