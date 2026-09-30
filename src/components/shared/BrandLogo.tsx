import React from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  showTagline?: boolean;
}

export function BrandLogo({
  size = "md",
  href = "/",
  showTagline = false,
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const content = (
    <div className="flex items-center gap-2.5 select-none group">
      <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-800 text-white shadow-lg shadow-violet-900/40 border border-violet-400/30 group-hover:scale-105 transition-transform duration-300">
        <Swords className={cn(iconSizes[size], "text-lime-400 transform -rotate-12")} />
        <div className="absolute inset-0 rounded-xl bg-lime-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center tracking-tighter font-black">
          <span className={cn(sizeClasses[size], "text-white")}>BATTLE</span>
          <span className={cn(sizeClasses[size], "text-lime-400")}>XA</span>
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 -mt-1">
            Free Fire MAX & BGMI Arena
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
