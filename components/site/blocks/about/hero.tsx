import { AddContents } from "@/components/site/add-content";
import { Container, EmptyBlock, type BlockProps } from "@/components/site/blocks/common";
import { EditableButton, EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import {
  ABOUT_HERO_EXTRA_IMAGE_CLASS,
  ABOUT_HERO_IMAGE_BASE_CLASS,
  ABOUT_HERO_ITEMS,
  aboutHeroCollageLayout,
} from "@/components/site/blocks/about/hero.config";
import { ContentType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** BACKGROUND section: one card. Images = collage, BUTTON = CTA, card.subtitle = caption strip. */
export const AboutHeroBlock = ({ section, bare }: BlockProps): React.JSX.Element => {
  const card = section.cards[0];
  if (!card) return <EmptyBlock label="Hero chưa có card — mở “Cấu trúc” để thêm 1 card." />;
  const images = card.contents.filter((c) => c.type === ContentType.IMAGE);
  const button = card.contents.find((c) => c.type === ContentType.BUTTON);
  const collage = aboutHeroCollageLayout();

  return (
    <section
      className={cn("relative overflow-hidden text-white", !bare && "bg-gradient-to-br from-[#b81f20] via-[#c42a2b] to-[#8c1516]")}
    >
      <Container className="grid items-center gap-10 py-14 @3xl:grid-cols-2">
        <div>
          {/* Photos are placed absolutely, relative to the anchor photo (see about/hero.config.ts). */}
          <div className="relative w-full" style={{ aspectRatio: collage.aspectRatio }}>
            {images.slice(0, ABOUT_HERO_ITEMS.length).map((img, i) => (
              <div key={img.id} className="absolute" style={collage.boxes[i]}>
                <ItemControls entity="contents" id={img.id} className="h-full w-full">
                  <EditableImage
                    entity="contents"
                    id={img.id}
                    value={img.img}
                    alt={img.title}
                    className={`h-full w-full ${ABOUT_HERO_IMAGE_BASE_CLASS}`}
                  />
                </ItemControls>
              </div>
            ))}
          </div>
          {images.length > ABOUT_HERO_ITEMS.length && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {images.slice(ABOUT_HERO_ITEMS.length).map((img) => (
                <ItemControls key={img.id} entity="contents" id={img.id} className={ABOUT_HERO_EXTRA_IMAGE_CLASS}>
                  <EditableImage entity="contents" id={img.id} value={img.img} alt={img.title} className={`h-full w-full ${ABOUT_HERO_IMAGE_BASE_CLASS}`} />
                </ItemControls>
              ))}
            </div>
          )}
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
            <AddContents cardId={card.id} className="mt-2" items={[...(button ? [] : [{ type: 4 as const, label: "Nút" }]), { type: 1, label: "Ảnh" }]} />
          </div>
        </div>
      </Container>
      <div className="bg-[#9a1819]/80 py-2 text-center text-xs font-bold tracking-wide uppercase">
        <EditableText entity="cards" id={card.id} field="subtitle" value={card.subtitle} placeholder="Dòng chữ dưới hero" />
      </div>
    </section>
  );
};
