import { EditableText } from "@/components/site/editor";
import type { SectionTree } from "@/lib/site/types";
import { cn } from "@/lib/utils";

export interface BlockProps {
  section: SectionTree;
}

/** Centered content column shared by all blocks. */
export const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element => <div className={cn("mx-auto w-full max-w-[1200px] px-6", className)}>{children}</div>;

/** Section heading (red, uppercase) + subtitle, both editable from the section record. */
export const SectionHeading = ({
  section,
  className,
}: {
  section: SectionTree;
  className?: string;
}): React.JSX.Element => (
  <div className={cn("mb-10 text-center", className)}>
    <EditableText
      as="h2"
      entity="sections"
      id={section.id}
      field="title"
      value={section.title}
      placeholder="Tiêu đề"
      className="block text-2xl font-extrabold text-[#c0272d] uppercase @3xl:text-3xl"
    />
    <EditableText
      as="p"
      entity="sections"
      id={section.id}
      field="des"
      value={section.des}
      placeholder="Phụ đề"
      className="mx-auto mt-2 block max-w-2xl text-sm text-neutral-700"
    />
  </div>
);

/** Shown in the editor when a template's required card is missing. */
export const EmptyBlock = ({ label }: { label: string }): React.JSX.Element => (
  <div className="mx-auto my-6 max-w-[1200px] rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
    {label}
  </div>
);
