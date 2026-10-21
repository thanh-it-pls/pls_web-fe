import * as React from "react";

import { cn } from "@/lib/utils";

/** Multi-line text input. */
const Textarea = ({ className, ...props }: React.ComponentProps<"textarea">): React.JSX.Element => (
  <textarea
    className={cn(
      "flex min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50 aria-invalid:border-destructive",
      className,
    )}
    {...props}
  />
);

export { Textarea };
