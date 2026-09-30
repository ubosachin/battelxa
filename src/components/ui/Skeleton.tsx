import React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-md bg-zinc-800/60 shimmer", className)}
      {...props}
    />
  );
}
