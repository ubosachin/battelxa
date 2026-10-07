import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "lime" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/20 hover:from-violet-500 hover:to-indigo-500 border border-violet-400/20",
      lime: "bg-lime-500 text-black font-bold shadow-md shadow-lime-900/20 hover:bg-lime-400 hover:shadow-lime-500/20 border border-lime-300/30",
      secondary:
        "bg-slate-100 dark:bg-zinc-800/90 text-slate-800 dark:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-700/90 border border-slate-300 dark:border-zinc-700/60 shadow-sm dark:shadow-none",
      outline:
        "bg-white dark:bg-transparent text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:border-violet-500 hover:text-violet-600 dark:hover:text-white hover:bg-violet-50 dark:hover:bg-violet-950/20 shadow-sm dark:shadow-none",
      danger:
        "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-900/20 border border-red-400/20",
      ghost:
        "bg-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
