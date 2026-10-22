# Page Builder CRM

Next.js (App Router) CRM that manages the content shown on the storefront, backed by the Page Builder API.

## Getting started

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, default http://localhost:8000
pnpm install
pnpm dev                     # http://localhost:3000 (allowed by the API's CORS)
```

## Screens

| Route | Purpose |
|---|---|
| `/admin` Tổng quan | Logo, social, version, footer contact, buttons (`/setting-shows`), each with HEADER/FOOTER position |
| `/admin/pages` Trang quản lý | CRUD, status toggle and drag & drop order of header pages (`/page-headers`) |
| `/admin/content` | Pick a page |
| `/admin/content/[pageId]` | **Giao diện**: the real site blocks with click-to-edit text / images (saved via API), reorder, show/hide, add/delete items. **Danh sách section**: plain list (drag to reorder) |
| `/admin/content/[pageId]/[sectionId]` | Edit section, cards (`/cards?parent=`) and their contents (`/contents?parent=`); BACKGROUND sections allow one card |

## Structure

- `lib/api/` – fetch client, types/enums, resource factory (list/get/create/update/move/remove/setStatus)
- `hooks/use-crud.ts` – React Query hooks; query keys are prefixed by domain (`["sections", "list", params]`)
- `components/crm/sortable-list.tsx` – dnd-kit list that calls `PATCH /{id}/move` with `prev_order`/`next_order`

## Site rendering (Figma "Về chúng tôi")

- `/` (and any other path matching a page's `path`) is the public site: header + `/sections/tree` + footer, rendered by `components/site/blocks/*`.
- The same blocks are rendered inside the CRM canvas; `EditableText` / `EditableImage` / `EditableButton` become editable when an `EditorProvider` is present.
- Codes of sections/cards/contents are auto-generated. The **layout** of a section is picked from its code prefix (`home_hero-…`, `about_values-…`, …; see `lib/site/templates.ts`). Blocks are built **per page** (`components/site/blocks/about/*`, `…/home/*`) and never shared between pages. Older prefixes (`hero-`, `values-`, …) are mapped to the About blocks, `centers-` to the Home block. Unknown prefixes use the generic card grid.
- “Thêm section” creates a section from a template with default Vietnamese content, or the whole page at once.
- Images are plain URLs (the API has no upload endpoint).

## Section backgrounds

- `/setting-shows` types `BACKGROUND = 6` (image in `img`) and `COLOR = 7` (colour in `color`) use `position = "SECTION"`. In the canvas, the section toolbar’s palette button picks the run of adjacent sections and either applies an existing background (`PATCH /sections/{id}`) or creates a new one with `POST /sections/background`.
- `section.background` stores the **id** of one of those settings (legacy raw colour / URL strings still render).
- Consecutive sections with the same `background` value are wrapped in one element that paints it, so the background is continuous; their blocks (`bare`) stop painting their own.

## Text colour and bold

Texts of sections / cards / contents are rich: in the canvas, click a text to edit it and use the floating bar (**B** bold, swatches, custom colour, eraser). Styles are stored inline in the same string field as `<span style="color:#hex;font-weight:700">…</span>` (newlines stay `\n`); with nothing selected the whole text is coloured. `lib/site/rich.ts` strips everything except validated colour spans before rendering.
