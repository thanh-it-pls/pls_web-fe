import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-700",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

/** Small status / type pill. */
const Badge = ({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>): React.JSX.Element => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge };
