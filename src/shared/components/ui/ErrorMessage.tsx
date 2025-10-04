"use client";

interface ErrorMessageProps {
  message: string | null | undefined;
  className?: string;
}

const ErrorMessage = ({ message, className = "" }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <div className={`text-red-500 text-sm mt-1 ${className}`}>{message}</div>
  );
};

export default ErrorMessage;
