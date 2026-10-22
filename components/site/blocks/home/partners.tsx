"use client";

import { EmptyBlock, type BlockProps } from "@/components/site/blocks/common";
import { EditableImage, ItemControls, useEditor } from "@/components/site/editor";
import { ContentType, type Content } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const Logo = ({ item }: { item: Content }): React.JSX.Element => (
  <ItemControls entity="contents" id={item.id} className="flex shrink-0 items-center gap-8">
    <EditableImage entity="contents" id={item.id} value={item.img} alt={item.title} className="h-9 w-28" imgClassName="h-full w-full object-contain" emptyLabel={item.title} />
    <span aria-hidden className="text-sm text-amber-400">✦</span>
  </ItemControls>
);

/** Home logo strip: IMAGE contents of the first card, separated by yellow sparkles; marquee on the public site. */
export const HomePartnersBlock = ({ section, bare }: BlockProps): React.JSX.Element => {
  const editor = useEditor();
  const logos = (section.cards[0]?.contents ?? []).filter((c) => c.type === ContentType.IMAGE);
  if (logos.length === 0) return editor ? <EmptyBlock label="Chưa có logo — dùng nút “Thêm logo”." /> : <></>;
  return (
    <section className={cn("overflow-hidden py-3 shadow-sm", !bare && "bg-white")}>
      <div className={cn("flex items-center gap-8", editor ? "flex-wrap justify-center px-6" : "w-max animate-marquee")}>
        {logos.map((l) => (
          <Logo key={l.id} item={l} />
        ))}
        {!editor && logos.map((l) => <Logo key={`d-${l.id}`} item={l} />)}
      </div>
    </section>
  );
};
