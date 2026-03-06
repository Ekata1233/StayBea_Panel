"use client";

import { IUser } from "@/types/user";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";


interface UserContextType {
  user: IUser[];
  userLoading: boolean;
  userError: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser[]>([]);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [userError, setUserError] = useState<string | null>(null);

  const fetchUser = async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await fetch(`https://dating-app-backend-plum.vercel.app/api/user/get-all`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setUser(data.data);
      } else {
        setUser([]);
        setUserError("No user   found.");
      }
    } catch (error: any) {
      setUserError(error.message || "Failed to fetch user  .");
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        userLoading,
        userError,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUserContext must be used within an UserProvider"
    );
  }
  return context;
};
