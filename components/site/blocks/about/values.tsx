import { Container, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import { cn } from "@/lib/utils";

const SHADES = ["bg-[#e8736f]", "bg-[#d9524f]", "bg-[#c9302c]", "bg-[#b52320]"];

/** Cards on red tiles that darken left → right. card.img = illustration. */
export const AboutValuesBlock = ({ section }: BlockProps): React.JSX.Element => (
  <section className="py-14">
    <Container>
      <SectionHeading section={section} />
      <div className="grid gap-5 @xl:grid-cols-2 @4xl:grid-cols-4">
        {section.cards.map((card, i) => (
          <ItemControls
            key={card.id}
            entity="cards"
            id={card.id}
            className={cn("flex flex-col rounded-lg p-5 text-center text-white shadow-md", SHADES[i % SHADES.length])}
          >
            <EditableText as="h3" entity="cards" id={card.id} field="title" value={card.title} required className="block text-lg font-bold" />
            <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-2 block text-xs leading-relaxed" />
            <EditableImage
              entity="cards"
              id={card.id}
              value={card.img}
              alt={card.title}
              className="mx-auto mt-4 h-32 w-full"
              imgClassName="h-full w-full object-contain"
              emptyLabel="Hình minh hoạ"
            />
          </ItemControls>
        ))}
      </div>
    </Container>
  </section>
);
