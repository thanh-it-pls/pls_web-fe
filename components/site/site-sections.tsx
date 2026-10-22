import { SectionBlock } from "@/components/site/blocks";
import { backgroundStyle, resolveBackground } from "@/lib/site/background";
import type { SectionTree } from "@/lib/site/types";
import type { SettingShow } from "@/lib/api/types";

type Frame = (section: SectionTree, index: number, children: React.ReactNode) => React.ReactNode;

interface Group {
  background: string | null;
  items: { section: SectionTree; index: number }[];
}

/** Consecutive sections with the same `background` value form one group that shares a single background. */
const groupSections = (sections: SectionTree[]): Group[] => {
  const groups: Group[] = [];
  sections.forEach((section, index) => {
    const last = groups[groups.length - 1];
    const bg = section.background || null;
    if (bg && last && last.background === bg) last.items.push({ section, index });
    else groups.push({ background: bg, items: [{ section, index }] });
  });
  return groups;
};

/**
 * Renders sections in order. `settings` resolves background ids (BACKGROUND / COLOR setting-shows).
 * `frame` lets the CRM wrap each section with edit controls.
 */
export const SiteSections = ({
  sections,
  settings,
  frame,
}: {
  sections: SectionTree[];
  settings: SettingShow[];
  frame?: Frame;
}): React.JSX.Element => (
  <>
    {groupSections(sections).map((group) => {
      const bg = resolveBackground(group.background, settings);
      const items = group.items.map(({ section, index }) => {
        const block = <SectionBlock section={section} bare={!!bg} />;
        return <div key={section.id}>{frame ? frame(section, index, block) : block}</div>;
      });
      return bg ? (
        <div key={group.items[0].section.id} style={backgroundStyle(bg)}>
          {items}
        </div>
      ) : (
        items
      );
    })}
  </>
);
