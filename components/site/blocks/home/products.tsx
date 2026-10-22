"use client";

import { Download, Star } from "lucide-react";

import { AddContents } from "@/components/site/add-content";
import { Container, EmptyBlock, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { StoreBadge } from "@/components/site/blocks/home/store-badge";
import { SliderArrow, useSlider } from "@/components/site/carousel";
import { EditableImage, EditableText, ItemControls, RichText } from "@/components/site/editor";
import { ContentType, type Content } from "@/lib/api/types";
import type { CardTree } from "@/lib/site/types";
import { cn } from "@/lib/utils";

const VISIBLE = 4;

/** DOWNLOAD (8) with an image or a link is a store badge; without both it is the download count ("1 Tr"). */
const isStore = (c: Content): boolean => c.type === ContentType.DOWNLOAD && !!(c.img || c.link);

const Stars = ({ score }: { score: number }): React.JSX.Element => (
  <span className="inline-flex" aria-hidden>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={cn("size-2.5", n <= Math.round(score) ? "fill-amber-400 text-amber-400" : "text-neutral-300")} />
    ))}
  </span>
);

const Product = ({ card }: { card: CardTree }): React.JSX.Element => {
  const rating = card.contents.find((c) => c.type === ContentType.RATING);
  const count = card.contents.find((c) => c.type === ContentType.DOWNLOAD && !isStore(c));
  const bullets = card.contents.filter((c) => c.type === ContentType.ITEM);
  const stores = card.contents.filter(isStore);
  const score = rating ? Number.parseFloat(rating.title.replace(",", ".")) : 0;

  return (
    <ItemControls entity="cards" id={card.id} className="flex h-full flex-col rounded-lg bg-white p-3 shadow-md">
      <div className="grid grid-cols-[4.25rem_1fr] gap-x-3 gap-y-1.5">
        <EditableImage entity="cards" id={card.id} value={card.img} alt={card.title} className="size-[4.25rem] overflow-hidden rounded-2xl bg-neutral-200" emptyLabel="" />
        <div className="row-span-2 min-w-0">
          <EditableText as="h3" entity="cards" id={card.id} field="title" value={card.title} required className="block text-[13px] leading-snug font-bold" />
          <ul className="mt-1.5 grid gap-1">
            {bullets.map((b) => (
              <li key={b.id}>
                <ItemControls entity="contents" id={b.id} inline className="flex items-start gap-1 text-[10px] leading-snug text-neutral-600">
                  <span aria-hidden className="mt-0.5">•</span>
                  <EditableText entity="contents" id={b.id} field="title" value={b.title} required />
                </ItemControls>
              </li>
            ))}
            {bullets.length === 0 && card.des && <li className="text-[10px] leading-snug text-neutral-600"><RichText value={card.des} /></li>}
          </ul>
        </div>
        <div className="space-y-0.5 text-[9px] text-neutral-500">
          {rating ? (
            <ItemControls entity="contents" id={rating.id} inline className="flex flex-wrap items-center gap-0.5">
              <EditableText entity="contents" id={rating.id} field="title" value={rating.title} required className="font-semibold text-neutral-700" />
              <Stars score={Number.isFinite(score) ? score : 0} />
            </ItemControls>
          ) : (
            card.subtitle && <RichText value={card.subtitle} as="p" />
          )}
          {count && (
            <ItemControls entity="contents" id={count.id} inline className="flex items-center gap-0.5">
              <EditableText entity="contents" id={count.id} field="title" value={count.title} required />
              <Download className="size-2.5" />
            </ItemControls>
          )}
          {rating && (
            <EditableText as="p" entity="contents" id={rating.id} field="subtitle" value={rating.subtitle} placeholder="số đánh giá" className="block" />
          )}
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-1.5 pt-3">
        {stores.map((c) => (
          <StoreBadge key={c.id} item={c} className="h-7" fill />
        ))}
      </div>
      <AddContents
        cardId={card.id}
        className="mt-2"
        items={[
          { type: 5, label: "Bullet", title: "Nội dung mới" },
          ...(rating ? [] : [{ type: 6 as const, label: "Đánh giá", title: "4.8", subtitle: "21.1k reviews" }]),
          ...(count ? [] : [{ type: 8 as const, label: "Lượt tải", title: "1 Tr", link: null }]),
          { type: 8, label: "Cửa hàng", title: "App Store", link: "#" },
        ]}
      />
    </ItemControls>
  );
};

/** Home "featured products": window of 4 cards. Card: img = app icon, title; contents: ITEM = bullets, RATING (6) = score + stars, DOWNLOAD (8) = count / store badges. */
export const HomeProductsBlock = ({ section, bare }: BlockProps): React.JSX.Element => {
  const cards = section.cards;
  const { index, prev, next } = useSlider(cards.length);
  const shown = Array.from({ length: Math.min(VISIBLE, cards.length) }, (_, k) => cards[(index + k) % cards.length]);
  return (
    <section className={cn("py-14", !bare && "bg-[#f7f7f7]")}>
      <Container>
        <SectionHeading section={section} />
        {cards.length === 0 ? (
          <EmptyBlock label="Chưa có sản phẩm — dùng nút “Thêm sản phẩm”." />
        ) : (
          <div className="relative">
            {cards.length > VISIBLE && <SliderArrow dir="prev" onClick={prev} className="absolute top-1/2 -left-3 z-10 -translate-y-1/2" />}
            <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
              {shown.map((c) => (
                <Product key={c.id} card={c} />
              ))}
            </div>
            {cards.length > VISIBLE && <SliderArrow dir="next" onClick={next} className="absolute top-1/2 -right-3 z-10 -translate-y-1/2" />}
          </div>
        )}
      </Container>
    </section>
  );
};
