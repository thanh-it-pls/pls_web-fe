import { Container, EmptyBlock, type BlockProps } from "@/components/site/blocks/common";
import { EditableButton, EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import { ContentType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** BACKGROUND section: one card. Images = collage, BUTTON = CTA, card.subtitle = caption strip. */
export const HeroBlock = ({ section }: BlockProps): React.JSX.Element => {
  const card = section.cards[0];
  if (!card) return <EmptyBlock label="Hero chưa có card — mở “Cấu trúc” để thêm 1 card." />;
  const images = card.contents.filter((c) => c.type === ContentType.IMAGE);
  const button = card.contents.find((c) => c.type === ContentType.BUTTON);

  return (
    <section
      className={cn("relative overflow-hidden bg-gradient-to-br from-[#b81f20] via-[#c42a2b] to-[#8c1516] text-white")}
      style={
        section.background
          ? { backgroundImage: `linear-gradient(rgb(140 20 20 / .55), rgb(140 20 20 / .55)), url(${section.background})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      <Container className="grid items-center gap-10 py-14 @3xl:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, i) => (
            <ItemControls key={img.id} entity="contents" id={img.id} className={cn(i % 3 === 0 && "row-span-2")}>
              <EditableImage
                entity="contents"
                id={img.id}
                value={img.img}
                alt={img.title}
                className={cn("overflow-hidden rounded-lg border-2 border-white shadow-lg", i % 3 === 0 ? "h-full min-h-56" : "aspect-[4/3]")}
              />
            </ItemControls>
          ))}
        </div>
        <div>
          <EditableText
            as="h1"
            entity="cards"
            id={card.id}
            field="title"
            value={card.title}
            required
            className="block text-4xl leading-tight font-extrabold text-[#ffb3a8] uppercase @3xl:text-5xl"
          />
          <EditableText
            as="p"
            entity="cards"
            id={card.id}
            field="des"
            value={card.des}
            multiline
            placeholder="Mô tả"
            className="mt-5 block max-w-md text-sm leading-relaxed"
          />
          <div className="mt-6">
            <EditableButton
              content={button}
              className="inline-block rounded-full border border-white px-5 py-1.5 text-xs font-semibold"
            />
          </div>
        </div>
      </Container>
      <div className="bg-[#9a1819]/80 py-2 text-center text-xs font-bold tracking-wide uppercase">
        <EditableText entity="cards" id={card.id} field="subtitle" value={card.subtitle} placeholder="Dòng chữ dưới hero" />
      </div>
    </section>
  );
};
