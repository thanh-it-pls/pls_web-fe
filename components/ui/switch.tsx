"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** On/off toggle. */
const Switch = ({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>): React.JSX.Element => (
  <SwitchPrimitive.Root
    className={cn(
      "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input shadow-xs outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50 data-[state=checked]:bg-primary",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block size-4 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-0.5" />
  </SwitchPrimitive.Root>
);

export { Switch };
