import { Container, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { EditableImage, EditableText, ItemControls } from "@/components/site/editor";

/** Fallback for unknown codes: heading + responsive card grid. */
export const GenericBlock = ({ section }: BlockProps): React.JSX.Element => (
  <section className="py-14">
    <Container>
      <SectionHeading section={section} />
      <div className="grid gap-5 @xl:grid-cols-2 @4xl:grid-cols-3">
        {section.cards.map((card) => (
          <ItemControls key={card.id} entity="cards" id={card.id} className="overflow-hidden rounded-lg bg-white shadow-md">
            <EditableImage entity="cards" id={card.id} value={card.img} alt={card.title} className="aspect-[16/9] bg-neutral-100" />
            <div className="p-4">
              <EditableText as="h3" entity="cards" id={card.id} field="title" value={card.title} required className="block font-bold text-[#c0272d]" />
              <EditableText as="p" entity="cards" id={card.id} field="subtitle" value={card.subtitle} placeholder="Phụ đề" className="block text-xs font-semibold" />
              <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-2 block text-xs text-neutral-600" />
            </div>
          </ItemControls>
        ))}
      </div>
    </Container>
  </section>
);
