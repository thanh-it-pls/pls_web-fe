"use client";

import { Container, EmptyBlock, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { StoreBadge } from "@/components/site/blocks/home/store-badge";
import { SliderArrow, SliderDots, useSlider } from "@/components/site/carousel";
import { AddContents } from "@/components/site/add-content";
import { EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import { ContentType } from "@/lib/api/types";

/**
 * Home app ecosystem slider. Card: img = phone mockups, title = pink kicker, subtitle = bold line, des.
 * Contents: CONTENT ×2 (1st = "other apps" label, 2nd = "download" label; text in `title`), IMAGE = app icons, DOWNLOAD = store badges.
 */
export const HomeEcosystemBlock = ({ section }: BlockProps): React.JSX.Element => {
  const cards = section.cards;
  const { index, prev, next, go } = useSlider(cards.length);
  const card = cards[index];
  const labels = card?.contents.filter((c) => c.type === ContentType.CONTENT) ?? [];
  const apps = card?.contents.filter((c) => c.type === ContentType.IMAGE) ?? [];
  const stores = card?.contents.filter((c) => c.type === ContentType.DOWNLOAD) ?? [];

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
              <ItemControls entity="cards" id={card.id} className="grid items-center gap-8 rounded-xl bg-white p-6 shadow-xl @3xl:grid-cols-[1fr_1.2fr]">
                <EditableImage entity="cards" id={card.id} value={card.img} alt={card.title} className="h-64" imgClassName="h-full w-full object-contain" emptyLabel="Ảnh điện thoại" />
                <div>
                  <EditableText as="h3" entity="cards" id={card.id} field="title" value={card.title} required className="block text-base font-extrabold text-[#d94f6b] uppercase" />
                  <EditableText as="p" entity="cards" id={card.id} field="subtitle" value={card.subtitle} placeholder="Tiêu đề phụ" className="block text-sm font-bold" />
                  <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-2 block text-xs leading-relaxed text-neutral-700" />
                  {labels[0] && (
                    <ItemControls entity="contents" id={labels[0].id} className="mt-4">
                      <EditableText as="p" entity="contents" id={labels[0].id} field="title" value={labels[0].title} required multiline className="block text-sm font-bold text-neutral-800 first-line:text-neutral-800" />
                    </ItemControls>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {apps.map((a) => (
                      <ItemControls key={a.id} entity="contents" id={a.id}>
                        <EditableImage entity="contents" id={a.id} value={a.img} alt={a.title} className="size-11 overflow-hidden rounded-xl bg-neutral-200" emptyLabel="" />
                      </ItemControls>
                    ))}
                  </div>
                  {labels[1] && (
                    <ItemControls entity="contents" id={labels[1].id} className="mt-4">
                      <EditableText as="p" entity="contents" id={labels[1].id} field="title" value={labels[1].title} required className="block text-sm font-bold" />
                    </ItemControls>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {stores.map((s) => (
                      <StoreBadge key={s.id} item={s} />
                    ))}
                  </div>
                  <AddContents
                    cardId={card.id}
                    className="mt-3"
                    items={[
                      { type: 1, label: "App" },
                      { type: 8, label: "Cửa hàng" },
                      ...(labels.length < 2 ? [{ type: 3 as const, label: "Nhãn" }] : []),
                    ]}
                  />
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
