'use client'

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-inverse placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition ${className}`}
      {...props}
    />
  );
};

export default Input;


