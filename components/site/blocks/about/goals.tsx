import { Container, SectionHeading, type BlockProps } from "@/components/site/blocks/common";
import { EditableImage, EditableText, ItemControls } from "@/components/site/editor";

/** White cards: card.img = icon, title (red), des. */
export const AboutGoalsBlock = ({ section }: BlockProps): React.JSX.Element => (
  <section className="py-14">
    <Container>
      <SectionHeading section={section} />
      <div className="mx-auto grid max-w-4xl gap-5 @2xl:grid-cols-3">
        {section.cards.map((card) => (
          <ItemControls key={card.id} entity="cards" id={card.id} className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md">
            <EditableImage entity="cards" id={card.id} value={card.img} alt={card.title} className="mb-3 h-20 w-20" imgClassName="h-full w-full object-contain" emptyLabel="Icon" />
            <EditableText as="h3" entity="cards" id={card.id} field="title" value={card.title} required className="block text-lg font-bold text-[#c0272d]" />
            <EditableText as="p" entity="cards" id={card.id} field="des" value={card.des} multiline placeholder="Mô tả" className="mt-2 block text-xs leading-relaxed text-neutral-600" />
          </ItemControls>
        ))}
      </div>
    </Container>
  </section>
);
