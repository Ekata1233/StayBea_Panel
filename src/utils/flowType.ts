// utils/flowType.ts
import { useEffect, useState } from "react";

export const useFlowType = () => {
  const [flowType, setFlowType] = useState<string | null>(null);

  // Function to get flow type from localStorage
  const getFlowTypeFromStorage = () => {
    try {
      const stored = localStorage.getItem("selectedModule");
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const name = parsed?.name;

      const flowMap: Record<string, string> = {
        Dating: "dating",
        "Date to Marry": "marriage",
        "Mature Connection": "mature",
      };

      return flowMap[name] || null;
    } catch (err) {
      return null;
    }
  };

  // Function to update flow type state
  const updateFlowType = () => {
    const newFlowType = getFlowTypeFromStorage();
    setFlowType(newFlowType);
  };

  useEffect(() => {
    // Initial load
    updateFlowType();

    // Listen for storage events (when localStorage changes in other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedModule") {
        updateFlowType();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event listener for changes within the same window
    const handleCustomStorageChange = () => {
      updateFlowType();
    };

    window.addEventListener("selectedModuleChange", handleCustomStorageChange);

    // Polling fallback for older browsers or edge cases (optional)
    // This checks every 500ms for changes (you can adjust the interval)
    let intervalId: NodeJS.Timeout | null = null;
    
    // Only use polling if needed (you can comment this out if not necessary)
    // Some browsers might not fire storage events for changes in the same tab
    intervalId = setInterval(() => {
      const currentFlowType = getFlowTypeFromStorage();
      if (currentFlowType !== flowType) {
        updateFlowType();
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("selectedModuleChange", handleCustomStorageChange);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Empty dependency array since we're using refs

  return flowType;
};

// Helper function to update flow type and notify listeners
// This should be called whenever you change the selected module in localStorage
export const updateFlowTypeAndNotify = (selectedModule: any) => {
  localStorage.setItem("selectedModule", JSON.stringify(selectedModule));
  // Dispatch custom event for same-window listeners
  window.dispatchEvent(new Event("selectedModuleChange"));
};