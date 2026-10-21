"use client";

import { EmptyBlock, type BlockProps } from "@/components/site/blocks/common";
import { EditableImage, EditableText, ItemControls, useEditor } from "@/components/site/editor";
import { ContentType, type Content } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const Logo = ({ content }: { content: Content }): React.JSX.Element => (
  <ItemControls entity="contents" id={content.id} className="shrink-0">
    <EditableImage
      entity="contents"
      id={content.id}
      value={content.img}
      alt={content.title}
      className="h-10 w-32"
      imgClassName="h-full w-full object-contain"
      emptyLabel={content.title}
    />
    <EditableText
      entity="contents"
      id={content.id}
      field="title"
      value={content.title}
      required
      className="sr-only"
    />
  </ItemControls>
);

/** One card whose IMAGE contents are logos. Scrolls as a marquee on the public site, static wrap while editing. */
export const PartnersBlock = ({ section }: BlockProps): React.JSX.Element => {
  const editor = useEditor();
  const logos = (section.cards[0]?.contents ?? []).filter((c) => c.type === ContentType.IMAGE);
  if (logos.length === 0 && !editor) return <></>;
  if (logos.length === 0) return <EmptyBlock label="Chưa có logo — dùng nút “Thêm logo”." />;

  return (
    <section className="overflow-hidden border-y bg-white py-4">
      <div className={cn("flex items-center gap-10", editor ? "flex-wrap justify-center px-6" : "w-max animate-marquee")}>
        {logos.map((l) => (
          <Logo key={l.id} content={l} />
        ))}
        {!editor && logos.map((l) => <Logo key={`dup-${l.id}`} content={l} />)}
      </div>
    </section>
  );
};
