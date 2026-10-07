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
      "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-700/40 shadow-sm",
    lime: "bg-lime-100 text-lime-900 border-lime-300 dark:bg-lime-950/60 dark:text-lime-400 dark:border-lime-600/40 shadow-sm",
    amber: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-600/40 shadow-sm",
    emerald: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-600/40 shadow-sm",
    red: "bg-red-100 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-600/40 shadow-sm",
    zinc: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/50",
    outline: "bg-transparent text-slate-600 border-slate-300 dark:text-zinc-400 dark:border-zinc-700",
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
