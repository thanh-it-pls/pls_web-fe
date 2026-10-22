"use client";

import { AddButton } from "@/components/site/chrome-parts";
import { useEditor, type ContentAddType } from "@/components/site/editor";
import { cn } from "@/lib/utils";

export interface ContentAddItem {
  type: ContentAddType;
  label: string;
  title?: string;
  subtitle?: string;
  link?: string | null;
}

/** Edit-mode row of always-visible "+" chips that add contents (button, social, bullet…) to a card. */
export const AddContents = ({
  cardId,
  items,
  className,
}: {
  cardId: string;
  items: ContentAddItem[];
  className?: string;
}): React.JSX.Element | null => {
  const editor = useEditor();
  if (!editor || items.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((i) => (
        <AddButton
          key={`${i.type}-${i.label}`}
          label={i.label}
          onClick={() =>
            void editor.add({ kind: "content", cardId, contentType: i.type, title: i.title, subtitle: i.subtitle, link: i.link })
          }
        />
      ))}
    </div>
  );
};
