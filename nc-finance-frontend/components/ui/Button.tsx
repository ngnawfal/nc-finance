"use client";
// NC Finance Code Note: Komponen tombol reusable.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-[#111111] text-white hover:bg-[#333333] active:scale-[0.98]",
  ghost: "bg-transparent text-[#111111] hover:bg-[#f7f6f3] active:scale-[0.98]",
  outline: "bg-white border border-[#eaeaea] text-[#111111] hover:bg-[#f9f9f8] active:scale-[0.98]",
  danger: "bg-[#fdebec] text-[#9f2f2d] hover:bg-[#f9d5d6] active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[5px] font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
