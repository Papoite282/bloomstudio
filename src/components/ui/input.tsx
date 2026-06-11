import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-bloom-olive/22 bg-white/70 px-3 text-sm text-bloom-ink outline-none transition placeholder:text-bloom-ink/38 focus:border-bloom-olive focus:ring-2 focus:ring-bloom-olive/20",
        className,
      )}
      {...props}
    />
  );
}
