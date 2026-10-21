/** Domain types and enums mirroring the Page Builder API. */

export const Status = { DISABLED: 0, ENABLED: 1 } as const;
export type StatusValue = 0 | 1;

export const SectionType = { BACKGROUND: 1, CONTENT: 2 } as const;
export type SectionTypeValue = 1 | 2;

export const ContentType = {
  IMAGE: 1,
  VIDEO: 2,
  CONTENT: 3,
  BUTTON: 4,
  ITEM: 5,
  RATING: 6,
  REVIEW: 7,
  DOWNLOAD: 8,
} as const;
export type ContentTypeValue = (typeof ContentType)[keyof typeof ContentType];

export const SettingType = { SOCIAL: 1, VERSION: 2, LOGO: 3, FOOTER_CONTACT: 4, BUTTON: 5 } as const;
export type SettingTypeValue = (typeof SettingType)[keyof typeof SettingType];

export type SettingPosition = "HEADER" | "FOOTER";

export const SECTION_TYPE_LABEL: Record<SectionTypeValue, string> = {
  1: "Background",
  2: "Nội dung",
};

export const CONTENT_TYPE_LABEL: Record<ContentTypeValue, string> = {
  1: "Hình ảnh",
  2: "Video",
  3: "Nội dung",
  4: "Nút bấm",
  5: "Item",
  6: "Đánh giá sao",
  7: "Review",
  8: "Tải xuống",
};

export const SETTING_TYPE_LABEL: Record<SettingTypeValue, string> = {
  1: "Mạng xã hội",
  2: "Phiên bản",
  3: "Logo",
  4: "Liên hệ footer",
  5: "Nút bấm",
};

export const POSITION_LABEL: Record<SettingPosition, string> = {
  HEADER: "Header",
  FOOTER: "Footer",
};

interface Orderable {
  id: string;
  order: string;
}

export interface PageHeader extends Orderable {
  status: StatusValue;
  title: string;
  path: string;
}

export interface Content extends Orderable {
  type: ContentTypeValue;
  title: string;
  link: string | null;
  img: string | null;
  subtitle: string | null;
  des: string | null;
  parent: string;
  status: StatusValue;
  code: string;
  icon: string | null;
}

export interface Card extends Orderable {
  title: string;
  link: string | null;
  img: string | null;
  subtitle: string | null;
  des: string | null;
  parent: string;
  status: StatusValue;
  code: string;
}

export interface Section extends Orderable {
  title: string | null;
  des: string | null;
  code: string;
  parent_id: string;
  type: SectionTypeValue;
  status: StatusValue;
  background: string | null;
}

export interface SettingShow extends Orderable {
  title: string;
  link: string | null;
  img: string | null;
  type: SettingTypeValue;
  code: string;
  position: SettingPosition;
}

export interface OffsetMeta {
  type: "offset";
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CursorMeta {
  type: "cursor";
  next_cursor: string | null;
  has_more: boolean;
}

export interface ListResponse<T> {
  data: T[];
  meta: OffsetMeta | CursorMeta;
}

export interface ItemResponse<T> {
  data: T;
}

export interface MovePayload {
  prev_order: string | null;
  next_order: string | null;
}

export interface ApiErrorBody {
  error: {
    code: number;
    status: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export const FooterSectionType = { NAVIGATION: 1, TITLE: 2 } as const;
export type FooterSectionTypeValue = (typeof FooterSectionType)[keyof typeof FooterSectionType];

export const FooterItemType = { TEXT: 1, LINK: 2, EMAIL: 3, PHONE: 4, ADDRESS: 5 } as const;
export type FooterItemTypeValue = (typeof FooterItemType)[keyof typeof FooterItemType];

export const FOOTER_SECTION_TYPE_LABEL: Record<FooterSectionTypeValue, string> = {
  1: "Điều hướng",
  2: "Tiêu đề",
};

export const FOOTER_ITEM_TYPE_LABEL: Record<FooterItemTypeValue, string> = {
  1: "Văn bản",
  2: "Liên kết",
  3: "Email",
  4: "Điện thoại",
  5: "Địa chỉ",
};

export interface FooterSection extends Orderable {
  title: string;
  status: StatusValue;
  code: string;
  type: FooterSectionTypeValue;
  link: string | null;
}

export interface FooterItem extends Orderable {
  title: string;
  link: string | null;
  type: FooterItemTypeValue;
  parent_id: string;
}
