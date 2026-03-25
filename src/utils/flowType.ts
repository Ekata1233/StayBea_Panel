import { useEffect, useState } from "react";

export const useFlowType = () => {
  const [flowType, setFlowType] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("selectedModule");
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const name = parsed?.name;

      const flowMap: Record<string, string> = {
        Dating: "dating",
        "Date to Marry": "marriage",
        "Mature Connection": "mature",
      };

      setFlowType(flowMap[name] || null);
    } catch (err) {
      setFlowType(null);
    }
  }, []);

  return flowType;
};