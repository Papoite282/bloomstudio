import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-bloom-olive/16 bg-bloom-porcelain/82 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
