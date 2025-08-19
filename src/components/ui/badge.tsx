import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    default: "bg-foreground text-background",
    secondary: "bg-muted text-foreground",
    success: "bg-emerald-600 text-white dark:bg-emerald-500",
    warning: "bg-amber-600 text-white dark:bg-amber-500",
    destructive: "bg-red-600 text-white dark:bg-red-500",
    outline: "border border-foreground/20 text-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}


