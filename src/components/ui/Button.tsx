"use client";

import React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = ({ children, className = "", ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`flex w-full justify-center rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out 
      bg-graydark dark:bg-meta-4 
      hover:bg-graydark dark:hover:bg-meta-4 
      ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
