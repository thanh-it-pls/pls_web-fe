"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** Form field label. */
const Label = ({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>): React.JSX.Element => (
  <LabelPrimitive.Root className={cn("text-sm leading-none font-medium select-none", className)} {...props} />
);

export { Label };
