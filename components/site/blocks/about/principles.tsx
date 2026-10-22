import { Container, EmptyBlock, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import { ContentType, type Content } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const Item = ({ item, n, side }: { item: Content; n: number; side: "left" | "right" }): React.JSX.Element => (
  <ItemControls
    entity="contents"
    id={item.id}
    className={cn("flex items-start gap-3", side === "left" ? "@3xl:flex-row-reverse @3xl:text-right" : "")}
  >
    <span className="text-3xl font-extrabold text-[#c0272d]">{String(n).padStart(2, "0")}</span>
    <div className="min-w-0 flex-1 border-b border-[#c0272d]/30 pb-3">
      <EditableText as="h3" entity="contents" id={item.id} field="title" value={item.title} required className="block text-sm font-bold text-[#c0272d]" />
      <EditableText as="p" entity="contents" id={item.id} field="des" value={item.des} multiline placeholder="Mô tả" className="mt-1 block text-xs leading-relaxed text-neutral-700" />
    </div>
  </ItemControls>
);

/** One card (img = centre logo) with ITEM contents numbered 01…; odd numbers left, even right. */
export const AboutPrinciplesBlock = ({ section }: BlockProps): React.JSX.Element => {
  const card = section.cards[0];
  const items = (card?.contents ?? []).filter((c) => c.type === ContentType.ITEM);
  return (
    <section className="py-14">
      <Container>
        <SectionHeading section={section} />
        {!card ? (
          <EmptyBlock label="Chưa có card." />
        ) : (
          <div className="grid items-center gap-6 @3xl:grid-cols-[1fr_9rem_1fr]">
            <div className="grid gap-6">
              {items.map((it, i) => i % 2 === 0 && <Item key={it.id} item={it} n={i + 1} side="left" />)}
            </div>
            <EditableImage
              entity="cards"
              id={card.id}
              value={card.img}
              alt="Logo"
              className="mx-auto order-first h-32 w-32 overflow-hidden rounded-xl bg-white p-3 shadow-lg @3xl:order-none"
              imgClassName="h-full w-full object-contain"
              emptyLabel="Logo"
            />
            <div className="grid gap-6">
              {items.map((it, i) => i % 2 === 1 && <Item key={it.id} item={it} n={i + 1} side="right" />)}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
};
