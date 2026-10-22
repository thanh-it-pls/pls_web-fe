"use client";

import { AddContents } from "@/components/site/add-content";
import { Container, EmptyBlock, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { SliderArrow, SliderDots, useSlider } from "@/components/site/carousel";
import { EditableButton, EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import { ContentType } from "@/lib/api/types";

/** Slider of cards: img = screenshot, title = product, subtitle = tagline, des = text, BUTTON content = CTA. */
export const AboutTechBlock = ({ section }: BlockProps): React.JSX.Element => {
  const cards = section.cards;
  const { index, prev, next, go } = useSlider(cards.length);
  const card = cards[index];
  const button = card?.contents.find((c) => c.type === ContentType.BUTTON);

  return (
    <section className="py-14">
      <Container>
        <SectionHeading section={section} />
        {!card ? (
          <EmptyBlock label="Chưa có slide — dùng nút “Thêm slide”." />
        ) : (
          <>
            <div className="relative">
              {cards.length > 1 && <SliderArrow dir="prev" onClick={prev} className="absolute top-1/2 -left-3 z-10 -translate-y-1/2" />}
              <ItemControls entity="cards" id={card.id} className="grid items-center gap-6 rounded-xl bg-white p-5 shadow-xl @3xl:grid-cols-[1.2fr_1fr]">
                <EditableImage entity="cards" id={card.id} value={card.img} alt={card.title} className="aspect-[16/10] overflow-hidden rounded-lg bg-neutral-100" imgClassName="h-full w-full object-cover" emptyLabel="Ảnh sản phẩm" />
                <div>
                  <EditableText as="h3" entity="cards" id={card.id} field="title" value={card.title} required className="block text-3xl font-extrabold text-[#c0272d]" />
                  <EditableText as="p" entity="cards" id={card.id} field="subtitle" value={card.subtitle} placeholder="Tiêu đề phụ" className="mt-1 block text-sm font-bold" />
                  <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-3 block text-xs leading-relaxed text-neutral-700" />
                  <div className="mt-4">
                    <EditableButton content={button} className="inline-block rounded-full border border-[#c0272d] px-5 py-1.5 text-xs font-semibold text-[#c0272d]" />
                    {!button && <AddContents cardId={card.id} items={[{ type: 4, label: "Nút" }]} />}
                  </div>
                </div>
              </ItemControls>
              {cards.length > 1 && <SliderArrow dir="next" onClick={next} className="absolute top-1/2 -right-3 z-10 -translate-y-1/2" />}
            </div>
            <SliderDots count={cards.length} index={index} onGo={go} />
          </>
        )}
      </Container>
    </section>
  );
};
