import { BookOpen, Home, Star, User, type LucideIcon } from "lucide-react";

import { AddContents } from "@/components/site/add-content";
import { Container, EmptyBlock, type BlockProps } from "@/components/site/blocks/common";
import { EditableButton, EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import {
  HERO_COLLAGE_ITEMS,
  HERO_EXTRA_IMAGE_CLASS,
  HERO_IMAGE_BASE_CLASS,
  heroCollageLayout,
} from "@/components/site/blocks/home/hero.config";
import { ContentType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ICONS: LucideIcon[] = [Home, User, BookOpen, Star];

/** Home hero. Card: subtitle = kicker, title = big red title, des. Contents: IMAGE ×4 collage, BUTTON ×2 (1st outline, 2nd filled), ITEM ×4 stats (title = label, subtitle = value). */
export const HomeHeroBlock = ({ section, bare }: BlockProps): React.JSX.Element => {
  const card = section.cards[0];
  if (!card) return <EmptyBlock label="Chưa có card." />;
  const images = card.contents.filter((c) => c.type === ContentType.IMAGE);
  const buttons = card.contents.filter((c) => c.type === ContentType.BUTTON);
  const stats = card.contents.filter((c) => c.type === ContentType.ITEM);
  const collage = heroCollageLayout();

  return (
    <section className={cn("relative overflow-hidden", !bare && "bg-gradient-to-br from-white via-[#fff5f5] to-[#fbe3e3]")}>
      {!bare && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 hidden h-2/5 bg-[#b3261e] @3xl:block"
          style={{ clipPath: "polygon(0 45%, 48% 0, 100% 55%, 100% 100%, 0 100%)" }}
        />
      )}
      <Container className="relative grid items-center gap-10 py-12 @3xl:grid-cols-[1.1fr_1fr]">
        <div>
          {/* Photos are placed absolutely, relative to the anchor photo (see hero.config.ts). */}
          <div className="relative w-full" style={{ aspectRatio: collage.aspectRatio }}>
            {images.slice(0, HERO_COLLAGE_ITEMS.length).map((img, i) => (
              <div key={img.id} className="absolute" style={collage.boxes[i]}>
                <ItemControls entity="contents" id={img.id} className="h-full w-full">
                  <EditableImage
                    entity="contents"
                    id={img.id}
                    value={img.img}
                    alt={img.title}
                    className={`h-full w-full ${HERO_IMAGE_BASE_CLASS}`}
                  />
                </ItemControls>
              </div>
            ))}
          </div>
          {images.length > HERO_COLLAGE_ITEMS.length && (
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {images.slice(HERO_COLLAGE_ITEMS.length).map((img) => (
                <ItemControls key={img.id} entity="contents" id={img.id} className={HERO_EXTRA_IMAGE_CLASS}>
                  <EditableImage entity="contents" id={img.id} value={img.img} alt={img.title} className={`h-full w-full ${HERO_IMAGE_BASE_CLASS}`} />
                </ItemControls>
              ))}
            </div>
          )}
        </div>
        <div>
          <EditableText as="p" entity="cards" id={card.id} field="subtitle" value={card.subtitle} placeholder="Dòng nhỏ" className="block text-xs font-semibold text-neutral-700" />
          <EditableText as="h1" entity="cards" id={card.id} field="title" value={card.title} required className="block text-3xl leading-tight font-extrabold text-[#c0272d] uppercase @3xl:text-4xl" />
          <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-3 block text-xs leading-relaxed text-neutral-700" />
          <div className="mt-4 flex flex-wrap gap-2">
            {buttons.map((b, i) => (
              <ItemControls key={b.id} entity="contents" id={b.id}>
                <EditableButton
                  content={b}
                  className={cn(
                    "inline-block rounded-full px-4 py-1.5 text-xs font-semibold",
                    i === 0 ? "border border-[#c0272d] text-[#c0272d]" : "bg-[#c0272d] text-white",
                  )}
                />
              </ItemControls>
            ))}
          </div>
          <AddContents cardId={card.id} className="mt-3" items={[{ type: 4, label: "Nút" }, { type: 1, label: "Ảnh" }, { type: 5, label: "Số liệu" }]} />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {stats.map((s, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <ItemControls key={s.id} entity="contents" id={s.id} className="flex flex-col items-center rounded-lg bg-white p-3 text-center shadow-md">
                  <EditableImage
                    entity="contents"
                    id={s.id}
                    value={s.img}
                    className="mb-1 grid size-7 place-items-center rounded-full bg-[#c0272d]"
                    imgClassName="size-4 object-contain"
                    emptyLabel=""
                    fallback={
                      <span className="mb-1 grid size-7 place-items-center rounded-full bg-[#c0272d] text-white">
                        <Icon className="size-3.5" />
                      </span>
                    }
                  />
                  <EditableText entity="contents" id={s.id} field="title" value={s.title} required className="block text-[10px] font-semibold text-neutral-600 uppercase" />
                  <EditableText entity="contents" id={s.id} field="subtitle" value={s.subtitle} placeholder="0" className="block text-xl font-extrabold text-[#c0272d]" />
                </ItemControls>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
