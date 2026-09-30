import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    info: "bg-blue-950/40 border-blue-800/50 text-blue-200",
    success: "bg-lime-950/40 border-lime-800/50 text-lime-200",
    warning: "bg-amber-950/40 border-amber-800/50 text-amber-200",
    error: "bg-red-950/40 border-red-800/50 text-red-200",
  };

  const icons = {
    info: <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-lime-400 mt-0.5 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-3.5 text-xs font-medium leading-relaxed",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5 text-white">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-zinc-800/60 shimmer",
        className
      )}
      {...props}
    />
  );
}
