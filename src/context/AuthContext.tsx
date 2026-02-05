"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AuthUser = {
  userId: string;
  role: string;
  permissions: string[];
  manageAccess: {
    Add: boolean;
    Update: boolean;
    Delete: boolean;
    View: boolean;
    Export: boolean;
  };
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔓 Logout = clear cookie on server
  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    window.location.href = "/login";
  };

const fetchUser = async () => {
  try {
    const res = await fetch("/api/employee/auth/details", {
      credentials: "include",
      cache: "no-store", // 🔥 VERY IMPORTANT
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();
    setUser(data.user);
  } catch {
    setUser(null);
  }
};

useEffect(() => {
  fetchUser().finally(() => setLoading(false));
}, []);

const refreshAuth = async () => {
  setLoading(true);
  await fetchUser();
  setLoading(false);
};

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshAuth  }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
