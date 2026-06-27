"use client";

import React, { createContext, useContext, useState } from "react";

/* ================= TYPES ================= */
type QuestionDeleteContextType = {
  deleteQuestion: (id: string) => Promise<boolean>;
  loading: boolean;
};

/* ================= CONTEXT ================= */
const QuestionDeleteContext = createContext<
  QuestionDeleteContextType | undefined
>(undefined);

/* ================= PROVIDER ================= */
export const QuestionDeleteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);

  /* ================= DELETE FUNCTION ================= */
  const deleteQuestion = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://dating-app-backend-plum.vercel.app/api/question/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete question");
      }

      return true;
    } catch (error: any) {
      console.error("Delete Question Error:", error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* ================= PROVIDER VALUE ================= */
  return (
    <QuestionDeleteContext.Provider value={{ deleteQuestion, loading }}>
      {children}
    </QuestionDeleteContext.Provider>
  );
};

/* ================= CUSTOM HOOK ================= */
export const useQuestionDelete = () => {
  const context = useContext(QuestionDeleteContext);

  if (!context) {
    throw new Error(
      "useQuestionDelete must be used within QuestionDeleteProvider"
    );
  }

  return context;
};
