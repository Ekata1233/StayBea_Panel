import React from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const alertStyles: Record<AlertType, string> = {
  success: "border-green-500 bg-green-50 text-green-700",
  error: "border-red-500 bg-red-50 text-red-700",
  warning: "border-yellow-500 bg-yellow-50 text-yellow-700",
  info: "border-blue-500 bg-blue-50 text-blue-700",
};

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  return (
    <div
      className={`sticky top-0 z-50 mb-6 flex items-center justify-between 
      rounded border px-4 py-3 text-sm font-medium ${alertStyles[type]}`}
    >
      <span>{message}</span>

      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-lg font-bold leading-none hover:opacity-70"
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
