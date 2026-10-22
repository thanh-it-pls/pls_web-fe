import { Container, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import { cn } from "@/lib/utils";

/** Vertical timeline; cards alternate text/image. card.img = building illustration. */
export const AboutTimelineBlock = ({ section, bare }: BlockProps): React.JSX.Element => (
  <section className={cn("py-14", !bare && "bg-[#fdeeee]")}>
    <Container>
      <SectionHeading section={section} />
      <div className="relative grid gap-10 @3xl:grid-cols-2 @3xl:gap-x-16 @3xl:before:absolute @3xl:before:inset-y-0 @3xl:before:left-1/2 @3xl:before:border-l-2 @3xl:before:border-dashed @3xl:before:border-[#c0272d]/40">
        {section.cards.map((card, i) => {
          const textFirst = i % 2 === 0;
          const text = (
            <ItemControls entity="cards" id={card.id} className={cn("self-center", textFirst ? "@3xl:text-right" : "")}>
              <EditableText as="h3" entity="cards" id={card.id} field="title" value={card.title} required className="block text-lg font-bold text-[#c0272d]" />
              <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-2 block text-xs leading-relaxed text-neutral-700" />
            </ItemControls>
          );
          const image = (
            <div className="relative self-center">
              <span className={cn("absolute top-0 text-sm font-extrabold text-[#c0272d]", textFirst ? "left-0" : "right-0")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <EditableImage entity="cards" id={card.id} value={card.img} alt={card.title} className="mx-auto h-44 w-64" imgClassName="h-full w-full object-contain" emptyLabel="Hình minh hoạ" />
            </div>
          );
          return textFirst ? (
            <div key={card.id} className="contents">
              {text}
              {image}
            </div>
          ) : (
            <div key={card.id} className="contents">
              <div className="order-2 @3xl:order-none">{image}</div>
              <div className="order-1 @3xl:order-none">{text}</div>
            </div>
          );
        })}
      </div>
    </Container>
  </section>
);
