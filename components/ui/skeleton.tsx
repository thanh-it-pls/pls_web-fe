import * as React from "react";

import { cn } from "@/lib/utils";

/** Loading placeholder block. */
const Skeleton = ({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element => (
  <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
);

export { Skeleton };
