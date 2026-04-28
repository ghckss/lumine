import { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({ children, className = "", ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(98,76,187,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
