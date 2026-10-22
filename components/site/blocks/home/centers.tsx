"use client";

import { CircleCheck } from "lucide-react";

import { Container, EmptyBlock, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { SliderArrow, SliderDots, useSlider } from "@/components/site/carousel";
import { AddContents } from "@/components/site/add-content";
import { Social } from "@/components/site/blocks/home/social";
import { EditableButton, EditableImage, EditableText, ItemControls, useEditor } from "@/components/site/editor";
import { ContentType, type Content } from "@/lib/api/types";

const DEFAULT_BULLET = "#4b8f6b";
const HEX = /^#[0-9a-f]{6}$/i;

/** ITEM content: coloured check bullet + text. Colour comes from `content.color`, editable in the CRM. */
const Bullet = ({ item }: { item: Content }): React.JSX.Element => {
  const editor = useEditor();
  const color = item.color ?? DEFAULT_BULLET;
  return (
    <li>
      <ItemControls entity="contents" id={item.id} inline className="flex items-center gap-2 text-xs text-neutral-700">
        <CircleCheck className="size-4 shrink-0" style={{ color }} />
        {editor && (
          <input
            key={color}
            type="color"
            defaultValue={HEX.test(color) ? color : DEFAULT_BULLET}
            title="Màu bullet"
            onBlur={(e) => e.currentTarget.value !== color && void editor.save("contents", item.id, { color: e.currentTarget.value })}
            className="size-4 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        )}
        <EditableText entity="contents" id={item.id} field="title" value={item.title} required />
      </ItemControls>
    </li>
  );
};

/** Slider of centers. Card: img = main photo, title/des. Contents: IMAGE = logo badge, ITEM = bullets, BUTTON, SOCIAL (9). */
export const HomeCentersBlock = ({ section }: BlockProps): React.JSX.Element => {
  const cards = section.cards;
  const { index, prev, next, go } = useSlider(cards.length);
  const card = cards[index];
  const logo = card?.contents.find((c) => c.type === ContentType.IMAGE);
  const bullets = card?.contents.filter((c) => c.type === ContentType.ITEM) ?? [];
  const socials = card?.contents.filter((c) => c.type === ContentType.SOCIAL) ?? [];
  const button = card?.contents.find((c) => c.type === ContentType.BUTTON);

  return (
    <section className="py-14">
      <Container>
        <SectionHeading section={section} />
        {!card ? (
          <EmptyBlock label="Chưa có trung tâm — dùng nút “Thêm trung tâm”." />
        ) : (
          <>
            <div className="relative">
              {cards.length > 1 && <SliderArrow dir="prev" onClick={prev} className="absolute top-1/2 -left-3 z-10 -translate-y-1/2" />}
              <ItemControls
                entity="cards"
                id={card.id}
                className="grid items-center gap-8 rounded-xl bg-white p-5 shadow-xl @3xl:grid-cols-[1fr_1.15fr]"
              >
                <div className="relative pb-4">
                  <EditableImage
                    entity="cards"
                    id={card.id}
                    value={card.img}
                    alt={card.title}
                    className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-900"
                    emptyLabel="Ảnh chủ đạo"
                  />
                  {logo && (
                    <ItemControls entity="contents" id={logo.id} className="absolute right-3 -bottom-0 w-36 rounded-lg bg-white p-2 shadow-lg">
                      <EditableImage
                        entity="contents"
                        id={logo.id}
                        value={logo.img}
                        alt={logo.title}
                        className="h-12 w-full"
                        imgClassName="h-full w-full object-contain"
                        emptyLabel="Logo"
                      />
                    </ItemControls>
                  )}
                </div>
                <div>
                  <EditableText as="h3" entity="cards" id={card.id} field="title" value={card.title} required className="block text-lg leading-snug font-bold text-neutral-800" />
                  <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-3 block text-xs leading-relaxed text-neutral-700" />
                  <ul className="mt-3 grid gap-1.5">
                    {bullets.map((b) => (
                      <Bullet key={b.id} item={b} />
                    ))}
                  </ul>
                  <AddContents cardId={card.id} className="mt-2" items={[{ type: 5, label: "Bullet" }]} />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <EditableButton
                      content={button}
                      className="inline-block rounded-full bg-[#2f5d62] px-6 py-2.5 text-sm font-semibold text-white after:ml-2 after:content-['›']"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      {socials.map((s) => (
                        <Social key={s.id} item={s} />
                      ))}
                    </div>
                  </div>
                  <AddContents
                    cardId={card.id}
                    className="mt-3"
                    items={[
                      { type: 9, label: "MXH" },
                      ...(button ? [] : [{ type: 4 as const, label: "Nút" }]),
                      ...(logo ? [] : [{ type: 1 as const, label: "Logo" }]),
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
