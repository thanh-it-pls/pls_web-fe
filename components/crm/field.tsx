import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

/** Label + control wrapper used by all forms. */
export const Field = ({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}): React.JSX.Element => (
  <div className="grid gap-1.5">
    <Label>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);
