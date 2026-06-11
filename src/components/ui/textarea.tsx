import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-md border border-bloom-olive/22 bg-white/70 px-3 py-3 text-sm leading-6 text-bloom-ink outline-none transition placeholder:text-bloom-ink/38 focus:border-bloom-olive focus:ring-2 focus:ring-bloom-olive/20",
        className,
      )}
      {...props}
    />
  );
}
