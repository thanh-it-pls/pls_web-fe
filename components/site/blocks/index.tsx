import { GalleryBlock } from "@/components/site/blocks/gallery";
import { GenericBlock } from "@/components/site/blocks/generic";
import { GoalsBlock } from "@/components/site/blocks/goals";
import { HeroBlock } from "@/components/site/blocks/hero";
import { PartnersBlock } from "@/components/site/blocks/partners";
import { PrinciplesBlock } from "@/components/site/blocks/principles";
import { StatsBlock } from "@/components/site/blocks/stats";
import { StoryBlock } from "@/components/site/blocks/story";
import { TechBlock } from "@/components/site/blocks/tech";
import { TimelineBlock } from "@/components/site/blocks/timeline";
import { ValuesBlock } from "@/components/site/blocks/values";
import type { BlockProps } from "@/components/site/blocks/common";
import { templateKeyOf, type TemplateKey } from "@/lib/site/templates";

const BLOCKS: Record<TemplateKey, (props: BlockProps) => React.JSX.Element> = {
  hero: HeroBlock,
  partners: PartnersBlock,
  story: StoryBlock,
  values: ValuesBlock,
  stats: StatsBlock,
  gallery: GalleryBlock,
  goals: GoalsBlock,
  principles: PrinciplesBlock,
  timeline: TimelineBlock,
  tech: TechBlock,
  generic: GenericBlock,
};

/** Pick the block for a section from its code prefix (see lib/site/templates). */
export const SectionBlock = ({ section }: BlockProps): React.JSX.Element => {
  const Block = BLOCKS[templateKeyOf(section.code)];
  return <Block section={section} />;
};
