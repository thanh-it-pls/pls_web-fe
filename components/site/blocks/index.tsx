import { AboutGalleryBlock } from "@/components/site/blocks/about/gallery";
import { AboutGoalsBlock } from "@/components/site/blocks/about/goals";
import { AboutHeroBlock } from "@/components/site/blocks/about/hero";
import { AboutPartnersBlock } from "@/components/site/blocks/about/partners";
import { AboutPrinciplesBlock } from "@/components/site/blocks/about/principles";
import { AboutStatsBlock } from "@/components/site/blocks/about/stats";
import { AboutStoryBlock } from "@/components/site/blocks/about/story";
import { AboutTechBlock } from "@/components/site/blocks/about/tech";
import { AboutTimelineBlock } from "@/components/site/blocks/about/timeline";
import { AboutValuesBlock } from "@/components/site/blocks/about/values";
import type { BlockProps } from "@/components/site/blocks/common";
import { GenericBlock } from "@/components/site/blocks/generic";
import { HomeCentersBlock } from "@/components/site/blocks/home/centers";
import { HomeEcosystemBlock } from "@/components/site/blocks/home/ecosystem";
import { HomeHeroBlock } from "@/components/site/blocks/home/hero";
import { HomeJourneyBlock } from "@/components/site/blocks/home/journey";
import { HomePartnersBlock } from "@/components/site/blocks/home/partners";
import { HomeProductsBlock } from "@/components/site/blocks/home/products";
import { HomeWhyBlock } from "@/components/site/blocks/home/why";
import { templateKeyOf, type TemplateKey } from "@/lib/site/templates";

/** One component per (page, block): blocks are never shared between pages. */
const BLOCKS: Record<TemplateKey, (props: BlockProps) => React.JSX.Element> = {
  about_hero: AboutHeroBlock,
  about_partners: AboutPartnersBlock,
  about_story: AboutStoryBlock,
  about_values: AboutValuesBlock,
  about_stats: AboutStatsBlock,
  about_gallery: AboutGalleryBlock,
  about_goals: AboutGoalsBlock,
  about_principles: AboutPrinciplesBlock,
  about_timeline: AboutTimelineBlock,
  about_tech: AboutTechBlock,
  home_hero: HomeHeroBlock,
  home_partners: HomePartnersBlock,
  home_centers: HomeCentersBlock,
  home_why: HomeWhyBlock,
  home_ecosystem: HomeEcosystemBlock,
  home_journey: HomeJourneyBlock,
  home_products: HomeProductsBlock,
  generic: GenericBlock,
};

/** Pick the block for a section from its code prefix (see lib/site/templates). */
export const SectionBlock = ({ section, bare }: BlockProps): React.JSX.Element => {
  const Block = BLOCKS[templateKeyOf(section.code)];
  return <Block section={section} bare={bare} />;
};
