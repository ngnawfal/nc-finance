// NC Finance Code Note: Komponen kartu/kontainer reusable.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

const paddings = { sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({ children, className, padding = "md", style }: CardProps) {
  return <div style={style} className={cn("bg-white border border-[#eaeaea] rounded-xl card-hover", paddings[padding], className)}>{children}</div>;
}

export default Card;
