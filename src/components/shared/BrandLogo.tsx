import React from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import { cn } from "@/lib/utils";

import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  showTagline?: boolean;
  useImage?: boolean;
}

export function BrandLogo({
  size = "md",
  href = "/",
  showTagline = false,
  useImage = true,
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const imageDimensions = {
    sm: 32,
    md: 40,
    lg: 52,
    xl: 68,
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10",
  };

  const content = (
    <div className="flex items-center gap-2.5 sm:gap-3 select-none group">
      {useImage ? (
        <div className="relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden border border-lime-500/40 shadow-lg shadow-lime-950/40 group-hover:border-lime-400 group-hover:scale-105 transition-all duration-300">
          <Image
            src="/logo-icon.png"
            alt="BATTLEXA"
            width={imageDimensions[size]}
            height={imageDimensions[size]}
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-lime-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : (
        <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-800 text-white shadow-lg shadow-violet-900/40 border border-violet-400/30 group-hover:scale-105 transition-transform duration-300">
          <Swords className={cn(iconSizes[size], "text-lime-400 transform -rotate-12")} />
          <div className="absolute inset-0 rounded-xl bg-lime-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight font-black leading-none">
          <span className={cn(sizeClasses[size], "text-white")}>BATTLE</span>
          <span className={cn(sizeClasses[size], "text-lime-400")}>XA</span>
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 mt-0.5">
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
