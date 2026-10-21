import { api } from "@/lib/api/client";
import {
  cardsApi,
  contentsApi,
  footerItemsApi,
  footerSectionsApi,
  pageHeadersApi,
  sectionsApi,
  settingShowsApi,
  type ListParams,
  type Resource,
} from "@/lib/api/resources";
import type { ListResponse, PageHeader } from "@/lib/api/types";
import { buildTree, type SectionTree, type SiteChrome } from "@/lib/site/types";

/** Walk every offset page of a list endpoint. */
export const fetchAll = async <T, C>(resource: Resource<T, C>, params?: ListParams): Promise<T[]> => {
  const out: T[] = [];
  let page = 1;
  for (;;) {
    const res = await resource.list({ ...params, page, per_page: 100 });
    out.push(...res.data);
    if (res.meta.type !== "offset" || page >= res.meta.total_pages) break;
    page += 1;
  }
  return out;
};

/** Public page tree: only ENABLED sections/cards/contents (server enforces it, and caches 5 min). */
export const getPublicTree = async (pageId: string): Promise<SectionTree[]> =>
  (
    await api<ListResponse<SectionTree>>("/sections/tree", {
      params: { parent_id: pageId, per_page: 50 },
      next: { revalidate: 60 },
    })
  ).data;

/** Editor tree: includes drafts (status 0), assembled from the plain list endpoints. */
export const getEditorTree = async (pageId: string): Promise<SectionTree[]> => {
  const sections = await fetchAll(sectionsApi, { parent_id: pageId });
  const sectionIds = new Set(sections.map((s) => s.id));
  const cards = (await fetchAll(cardsApi)).filter((c) => sectionIds.has(c.parent));
  const cardIds = new Set(cards.map((c) => c.id));
  const contents = (await fetchAll(contentsApi)).filter((c) => cardIds.has(c.parent));
  return buildTree(sections, cards, contents);
};

export const getPageHeader = (pageId: string): Promise<PageHeader> => pageHeadersApi.get(pageId);

/** Header menu, header/footer settings and footer groups with their items. */
export const getSiteChrome = async (includeDrafts = false): Promise<SiteChrome> => {
  const [headers, settings, groups] = await Promise.all([
    fetchAll(pageHeadersApi, { status: 1 }),
    fetchAll(settingShowsApi),
    // The CRM editor also needs hidden footer groups so they can be switched back on.
    fetchAll(footerSectionsApi, includeDrafts ? undefined : { status: 1 }),
  ]);
  const footer = await Promise.all(
    groups.map(async (g) => ({ ...g, items: await fetchAll(footerItemsApi, { parent_id: g.id }) })),
  );
  return { headers, settings, footer };
};
