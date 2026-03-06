"use client";

import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = ({ label, ...props }: TextareaProps) => {
  return (
    <div className="mb-6 w-full">
      {label && (
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          {label}
        </label>
      )}

      <textarea
        {...props}
        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
    </div>
  );
};

export default Textarea;
