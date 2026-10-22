import { AddContents } from "@/components/site/add-content";
import { EmptyBlock, type BlockProps } from "@/components/site/blocks/common";
import { Social } from "@/components/site/blocks/home/social";
import { EditableButton, EditableImage, EditableText } from "@/components/site/editor";
import { ContentType } from "@/lib/api/types";

/** Full-bleed split: card.img left, red panel right (title, des, outline BUTTON, SOCIAL (9) icons). Paints its own red panel. */
export const HomeWhyBlock = ({ section }: BlockProps): React.JSX.Element => {
  const card = section.cards[0];
  if (!card) return <EmptyBlock label="Chưa có card." />;
  const button = card.contents.find((c) => c.type === ContentType.BUTTON);
  const socials = card.contents.filter((c) => c.type === ContentType.SOCIAL);
  return (
    <section className="grid @3xl:grid-cols-2">
      <EditableImage entity="cards" id={card.id} value={card.img} alt={card.title} className="h-64 bg-neutral-200 @3xl:h-full @3xl:min-h-72" emptyLabel="Ảnh bên trái" />
      <div className="flex flex-col justify-center bg-[#b3261e] p-8 text-white @3xl:p-14">
        <EditableText as="h2" entity="cards" id={card.id} field="title" value={card.title} required multiline className="block text-2xl leading-snug font-extrabold uppercase" />
        <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-4 block max-w-md text-xs leading-relaxed text-white/90" />
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <EditableButton content={button} className="inline-block rounded-full border border-white px-6 py-2.5 text-sm font-semibold" />
          {socials.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {socials.map((s) => (
                <Social key={s.id} item={s} />
              ))}
            </div>
          )}
        </div>
        <AddContents
          cardId={card.id}
          className="mt-4"
          items={[{ type: 9, label: "MXH" }, ...(button ? [] : [{ type: 4 as const, label: "Nút" }])]}
        />
      </div>
    </section>
  );
};
