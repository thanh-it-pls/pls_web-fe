import { SectionBlock } from "@/components/site/blocks";
import type { SectionTree } from "@/lib/site/types";

/** Renders sections in order. `frame` lets the CRM wrap each one with edit controls. */
export const SiteSections = ({
  sections,
  frame,
}: {
  sections: SectionTree[];
  frame?: (section: SectionTree, index: number, children: React.ReactNode) => React.ReactNode;
}): React.JSX.Element => (
  <>
    {sections.map((section, i) => {
      const block = <SectionBlock section={section} />;
      return <div key={section.id}>{frame ? frame(section, i, block) : block}</div>;
    })}
  </>
);
