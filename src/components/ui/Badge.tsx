import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "violet"
    | "lime"
    | "amber"
    | "emerald"
    | "red"
    | "zinc"
    | "outline";
  pulse?: boolean;
}

export function Badge({
  className,
  variant = "violet",
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    violet:
      "bg-violet-950/60 text-violet-300 border-violet-700/40 shadow-sm shadow-violet-900/20",
    lime: "bg-lime-950/60 text-lime-400 border-lime-600/40 shadow-sm shadow-lime-900/20",
    amber: "bg-amber-950/60 text-amber-300 border-amber-600/40",
    emerald: "bg-emerald-950/60 text-emerald-300 border-emerald-600/40",
    red: "bg-red-950/60 text-red-300 border-red-600/40",
    zinc: "bg-zinc-800/80 text-zinc-300 border-zinc-700/50",
    outline: "bg-transparent text-zinc-400 border-zinc-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border uppercase",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
}
