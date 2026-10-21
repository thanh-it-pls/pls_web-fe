"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const Tabs = (props: React.ComponentProps<typeof TabsPrimitive.Root>): React.JSX.Element => (
  <TabsPrimitive.Root {...props} />
);

const TabsList = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>): React.JSX.Element => (
  <TabsPrimitive.List
    className={cn("inline-flex h-9 w-fit items-center rounded-lg bg-muted p-[3px] text-muted-foreground", className)}
    {...props}
  />
);

const TabsTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>): React.JSX.Element => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
);

const TabsContent = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>): React.JSX.Element => (
  <TabsPrimitive.Content className={cn("outline-none", className)} {...props} />
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
