import { Container, type BlockProps } from "@/components/site/blocks/common";
import { EditableImage, EditableText, ItemControls } from "@/components/site/editor";
import { cn } from "@/lib/utils";

/** Left-aligned heading (section.title: line 1 small, line 2 big red; section.des paragraph) + 3 illustrated cards (img + title caption). */
export const HomeJourneyBlock = ({ section, bare }: BlockProps): React.JSX.Element => (
  <section className={cn("py-14", !bare && "bg-[#fdf0f0]")}>
    <Container>
      <EditableText
        as="h2"
        entity="sections"
        id={section.id}
        field="title"
        value={section.title}
        multiline
        placeholder="HÀNH TRÌNH CÙNG&#10;PORO LANGUAGE SPACE"
        className="block text-2xl font-extrabold text-[#c0272d] uppercase first-line:text-sm first-line:text-neutral-600"
      />
      <EditableText as="p" entity="sections" id={section.id} field="des" value={section.des} multiline placeholder="Mô tả" className="mt-3 block max-w-3xl text-xs leading-relaxed text-neutral-700" />
      <div className="mt-8 grid gap-5 @2xl:grid-cols-3">
        {section.cards.map((card) => (
          <ItemControls key={card.id} entity="cards" id={card.id} className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-md">
            <EditableImage entity="cards" id={card.id} value={card.img} alt={card.title} className="h-40 w-full" imgClassName="h-full w-full object-contain" emptyLabel="Hình minh hoạ" />
            <EditableText as="p" entity="cards" id={card.id} field="title" value={card.title} required multiline className="mt-3 block text-xs font-medium text-neutral-700" />
          </ItemControls>
        ))}
      </div>
    </Container>
  </section>
);
