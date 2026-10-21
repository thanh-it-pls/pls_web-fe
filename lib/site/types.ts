import type { Card, Content, FooterItem, FooterSection, PageHeader, Section, SettingShow } from "@/lib/api/types";

/** Card with its contents, as returned by /sections/tree. */
export interface CardTree extends Card {
  contents: Content[];
}

/** Section with its cards, as returned by /sections/tree. */
export interface SectionTree extends Section {
  cards: CardTree[];
}

export interface FooterGroup extends FooterSection {
  items: FooterItem[];
}

/** Everything the site header/footer needs. */
export interface SiteChrome {
  headers: PageHeader[];
  settings: SettingShow[];
  footer: FooterGroup[];
}

/** Assemble the section → card → content tree from flat lists (keeps API order). */
export const buildTree = (sections: Section[], cards: Card[], contents: Content[]): SectionTree[] =>
  sections.map((section) => ({
    ...section,
    cards: cards
      .filter((c) => c.parent === section.id)
      .map((card) => ({ ...card, contents: contents.filter((ct) => ct.parent === card.id) })),
  }));
