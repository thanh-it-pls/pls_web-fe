import { AddContents } from "@/components/site/add-content";
import { Container, EmptyBlock, type BlockProps } from "@/components/site/blocks/common";
import { EditableButton, EditableImage, EditableText } from "@/components/site/editor";
import { ContentType } from "@/lib/api/types";

/** One card: img = photo, title/subtitle = two-line heading, des = paragraph, BUTTON content = CTA. */
export const AboutStoryBlock = ({ section }: BlockProps): React.JSX.Element => {
  const card = section.cards[0];
  if (!card) return <EmptyBlock label="Chưa có card." />;
  const button = card.contents.find((c) => c.type === ContentType.BUTTON);

  return (
    <section className="py-16">
      <Container className="grid items-center @3xl:grid-cols-[1.1fr_1fr]">
        <div className="relative z-10 pr-4 pb-4 pl-4 @3xl:pl-0">
          <div className="absolute inset-y-6 right-0 left-4 -z-10 rounded-lg bg-[#a31d1d] @3xl:right-8 @3xl:left-[-1rem]" />
          <EditableImage
            entity="cards"
            id={card.id}
            value={card.img}
            alt={card.title}
            className="aspect-[4/3] overflow-hidden rounded-md shadow-lg"
          />
        </div>
        <div className="relative z-20 -mt-6 rounded-xl bg-white p-8 shadow-xl @3xl:mt-0 @3xl:-ml-16">
          <EditableText
            as="p"
            entity="cards"
            id={card.id}
            field="title"
            value={card.title}
            required
            className="block text-lg font-extrabold text-neutral-700 uppercase"
          />
          <EditableText
            as="h2"
            entity="cards"
            id={card.id}
            field="subtitle"
            value={card.subtitle}
            placeholder="Tiêu đề lớn"
            className="block text-2xl font-extrabold text-[#c0272d] uppercase"
          />
          <EditableText
            as="p"
            entity="cards"
            id={card.id}
            field="des"
            value={card.des}
            multiline
            placeholder="Mô tả"
            className="mt-4 block text-sm leading-relaxed text-neutral-700"
          />
          <div className="mt-5">
            <EditableButton
              content={button}
              className="inline-block rounded-full border border-[#c0272d] px-5 py-1.5 text-xs font-semibold text-[#c0272d]"
            />
            {!button && <AddContents cardId={card.id} items={[{ type: 4, label: "Nút" }]} />}
          </div>
        </div>
      </Container>
    </section>
  );
};
