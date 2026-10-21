import { BookOpen, Home, Star, User, type LucideIcon } from "lucide-react";

import { Container, EmptyBlock, type BlockProps } from "@/components/site/blocks/common";
import { EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import { ContentType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ICONS: LucideIcon[] = [Home, User, BookOpen, Star];
const TILES = [
  "bg-[#e8736f] @xl:translate-y-0",
  "bg-[#d9524f] @xl:translate-y-6",
  "bg-[#c9302c] @xl:translate-y-0",
  "bg-[#b52320] @xl:translate-y-6",
];

/** One card: subtitle = kicker, title = quote, des = text. ITEM contents: title = label, subtitle = value, img = icon. */
export const StatsBlock = ({ section }: BlockProps): React.JSX.Element => {
  const card = section.cards[0];
  if (!card) return <EmptyBlock label="Chưa có card." />;
  const items = card.contents.filter((c) => c.type === ContentType.ITEM);

  return (
    <section className="bg-[#fdeeee] py-14">
      <Container className="grid items-center gap-10 @3xl:grid-cols-2">
        <div>
          <EditableText as="p" entity="cards" id={card.id} field="subtitle" value={card.subtitle} placeholder="Dòng nhỏ" className="block text-lg font-extrabold text-neutral-600 uppercase" />
          <h2 className="mt-3 text-4xl leading-tight font-extrabold text-[#c0272d] uppercase before:mr-1 before:content-['“'] after:ml-1 after:content-['”']">
            <EditableText entity="cards" id={card.id} field="title" value={card.title} required />
          </h2>
          <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-4 block text-sm leading-relaxed text-neutral-700" />
        </div>
        <div className="grid grid-cols-2 gap-4 pb-6">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <ItemControls
                key={item.id}
                entity="contents"
                id={item.id}
                className={cn("flex flex-col items-center rounded-2xl p-6 text-center text-white shadow-md", TILES[i % TILES.length])}
              >
                <EditableImage
                  entity="contents"
                  id={item.id}
                  value={item.img}
                  className="mb-2 grid size-9 place-items-center"
                  imgClassName="size-9 object-contain"
                  emptyLabel=""
                  fallback={<Icon className="mb-2 size-8" />}
                />
                <EditableText entity="contents" id={item.id} field="title" value={item.title} required className="block text-xs font-semibold uppercase" />
                <EditableText entity="contents" id={item.id} field="subtitle" value={item.subtitle} placeholder="0" className="block text-2xl font-extrabold" />
              </ItemControls>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
