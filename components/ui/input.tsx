import * as React from "react";

import { cn } from "@/lib/utils";

/** Single-line text input. */
const Input = ({ className, type, ...props }: React.ComponentProps<"input">): React.JSX.Element => (
  <input
    type={type}
    className={cn(
      "flex h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
      className,
    )}
    {...props}
  />
);

export { Input };
