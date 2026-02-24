"use client";

import React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
    >
      {children}
    </button>
  );
};

export default Button;
