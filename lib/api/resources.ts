import { api } from "@/lib/api/client";
import type {
  Card,
  Content,
  FooterItem,
  FooterSection,
  ItemResponse,
  ListResponse,
  MovePayload,
  PageHeader,
  Section,
  SettingShow,
  StatusValue,
} from "@/lib/api/types";

export type ListParams = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

/** Build the 6 standard CRUD endpoints (+ optional status toggle) for a resource path. */
const createResource = <T, C, U = Partial<C>>(path: string) => ({
  list: (params?: ListParams): Promise<ListResponse<T>> =>
    api<ListResponse<T>>(path, { params: { per_page: 100, ...params } }),
  get: async (id: string): Promise<T> => (await api<ItemResponse<T>>(`${path}/${id}`)).data,
  create: async (body: C): Promise<T> => (await api<ItemResponse<T>>(path, { method: "POST", body })).data,
  update: async (id: string, body: U): Promise<T> =>
    (await api<ItemResponse<T>>(`${path}/${id}`, { method: "PATCH", body })).data,
  move: async (id: string, body: MovePayload): Promise<T> =>
    (await api<ItemResponse<T>>(`${path}/${id}/move`, { method: "PATCH", body })).data,
  remove: async (id: string): Promise<void> => {
    await api<{ data: null }>(`${path}/${id}`, { method: "DELETE" });
  },
  setStatus: async (id: string, status: StatusValue): Promise<T> =>
    (await api<ItemResponse<T>>(`${path}/${id}/status`, { method: "PATCH", body: { status } })).data,
});

export interface PageHeaderInput {
  title: string;
  path: string;
  status?: StatusValue;
}

export interface SectionInput {
  code: string;
  parent_id: string;
  type: number;
  title?: string | null;
  des?: string | null;
  background?: string | null;
  status?: StatusValue;
}

export interface CardInput {
  title: string;
  parent: string;
  code: string;
  link?: string | null;
  img?: string | null;
  subtitle?: string | null;
  des?: string | null;
  status?: StatusValue;
}

export interface ContentInput {
  type: number;
  title: string;
  parent: string;
  code: string;
  link?: string | null;
  img?: string | null;
  subtitle?: string | null;
  des?: string | null;
  icon?: string | null;
  color?: string | null;
  status?: StatusValue;
}

export interface SettingShowInput {
  title: string;
  type: number;
  code: string;
  position: string;
  link?: string | null;
  img?: string | null;
  color?: string | null;
}

export const pageHeadersApi = createResource<PageHeader, PageHeaderInput>("/page-headers");
export const sectionsApi = createResource<Section, SectionInput>("/sections");
export const cardsApi = createResource<Card, CardInput>("/cards");
export const contentsApi = createResource<Content, ContentInput>("/contents");
export const settingShowsApi = createResource<SettingShow, SettingShowInput>("/setting-shows");

export type Resource<T, C> = ReturnType<typeof createResource<T, C>>;

export interface FooterSectionInput {
  title: string;
  code: string;
  type: number;
  link?: string | null;
  status?: StatusValue;
}

export interface FooterItemInput {
  title: string;
  type: number;
  parent_id: string;
  link?: string | null;
}

export const footerSectionsApi = createResource<FooterSection, FooterSectionInput>("/footer-sections");
export const footerItemsApi = createResource<FooterItem, FooterItemInput>("/footer-items");

export interface SectionBackgroundInput {
  /** 6 = BACKGROUND (image, needs `img`), 7 = COLOR (needs `color`). */
  type: 6 | 7;
  section_ids: string[];
  img?: string;
  color?: string;
  title?: string;
  code?: string;
}

/** POST /sections/background: create one SECTION setting-show and attach it to adjacent sections. */
export const createSectionBackground = async (
  body: SectionBackgroundInput,
): Promise<{ setting_show: SettingShow; sections: Section[] }> =>
  (await api<ItemResponse<{ setting_show: SettingShow; sections: Section[] }>>("/sections/background", { method: "POST", body })).data;
