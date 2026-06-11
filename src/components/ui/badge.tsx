import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "olive" | "cream" | "dark" | "blush";

const variants: Record<BadgeVariant, string> = {
  olive: "border-bloom-olive/25 bg-bloom-sage/55 text-bloom-ink",
  cream: "border-bloom-clay/22 bg-bloom-cream text-bloom-ink/72",
  dark: "border-bloom-ink bg-bloom-ink text-bloom-cream",
  blush: "border-bloom-blush/35 bg-bloom-blush/20 text-bloom-ink",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "cream", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
