import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "violet" | "lime" | "none";
  hoverEffect?: boolean;
}

export function Card({
  className,
  glow = "none",
  hoverEffect = false,
  children,
  ...props
}: CardProps) {
  const glowStyles = {
    none: "",
    violet: "border-violet-500/30 shadow-lg shadow-violet-950/10 dark:shadow-violet-950/30",
    lime: "border-lime-500/30 shadow-lg shadow-lime-950/10 dark:shadow-lime-950/20",
  };

  return (
    <div
      className={cn(
        "rounded-xl bg-white dark:bg-[#0e111a]/80 backdrop-blur-md border border-slate-200 dark:border-white/[0.07] p-5 text-slate-800 dark:text-zinc-100 shadow-sm dark:shadow-none",
        glowStyles[glow],
        hoverEffect &&
          "transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-950/10 dark:hover:shadow-violet-950/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-slate-500 dark:text-zinc-400 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-0", className)} {...props}>{children}</div>;
}
