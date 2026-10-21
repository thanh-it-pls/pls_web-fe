"use client";

import { Container, EmptyBlock, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { SliderArrow, SliderDots, useSlider } from "@/components/site/carousel";
import { EditableImage, ItemControls } from "@/components/site/editor";
import type { CardTree } from "@/lib/site/types";
import { cn } from "@/lib/utils";

const Slide = ({ card, active }: { card: CardTree; active: boolean }): React.JSX.Element => (
  <div className={cn("w-full overflow-hidden rounded-xl bg-[#c0272d] shadow-lg transition-all", active ? "aspect-[16/9]" : "aspect-[16/9] scale-90 opacity-50")}>
    {active ? (
      <ItemControls entity="cards" id={card.id} className="h-full">
        <EditableImage entity="cards" id={card.id} value={card.img} alt={card.title} className="h-full" emptyLabel="Thêm ảnh trải nghiệm" />
      </ItemControls>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      card.img && <img src={card.img} alt="" className="h-full w-full object-cover" />
    )}
  </div>
);

/** Slider of card images: current slide centered and editable, neighbours dimmed. */
export const GalleryBlock = ({ section }: BlockProps): React.JSX.Element => {
  const cards = section.cards;
  const { index, prev, next, go } = useSlider(cards.length);
  const at = (i: number): CardTree | undefined => (cards.length > 1 ? cards[(i + cards.length) % cards.length] : undefined);

  return (
    <section className="py-14">
      <Container>
        <SectionHeading section={section} />
        {cards.length === 0 ? (
          <EmptyBlock label="Chưa có ảnh — dùng nút “Thêm ảnh”." />
        ) : (
          <>
            <div className="relative grid grid-cols-[1fr_2.2fr_1fr] items-center gap-4">
              <div className="hidden @3xl:block">{at(index - 1) && <Slide card={at(index - 1)!} active={false} />}</div>
              <div className="col-span-3 @3xl:col-span-1">
                <Slide card={cards[index]} active />
              </div>
              <div className="hidden @3xl:block">{at(index + 1) && <Slide card={at(index + 1)!} active={false} />}</div>
              {cards.length > 1 && (
                <>
                  <SliderArrow dir="prev" onClick={prev} className="absolute top-1/2 left-0 z-10 -translate-y-1/2" />
                  <SliderArrow dir="next" onClick={next} className="absolute top-1/2 right-0 z-10 -translate-y-1/2" />
                </>
              )}
            </div>
            <SliderDots count={cards.length} index={index} onGo={go} />
          </>
        )}
      </Container>
    </section>
  );
};
