"use client";

import React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "secondary";
}

const Button = ({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) => {
  const variantClasses = {
    primary:
      "bg-graydark dark:bg-meta-4 text-bodydark1 hover:bg-graydark dark:hover:bg-meta-4",

    outline:
      "border border-stroke bg-white text-black hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4",

    secondary:
      "bg-gray-200 text-black hover:bg-gray-300 dark:bg-meta-3 dark:text-white dark:hover:bg-meta-4",
  };

  return (
    <button
      {...props}
      className={`flex w-full justify-center rounded-sm px-4 py-2 font-medium duration-300 ease-in-out ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;