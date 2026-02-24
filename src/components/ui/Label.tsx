"use client";

import React from "react";

interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

const Label = ({ children, required, ...props }: LabelProps) => {
  return (
    <label
      {...props}
      className="mb-3 block text-sm font-medium text-black dark:text-white"
    >
      {children}

      {required && (
        <span className="text-meta-1 ml-1">*</span>
      )}
    </label>
  );
};

export default Label;
