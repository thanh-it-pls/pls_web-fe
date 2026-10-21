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
- Codes of sections/cards/contents are auto-generated. The **layout** of a section is picked from its code prefix (`hero-…`, `values-…`, …; see `lib/site/templates.ts`). Sections without a known prefix use the generic card grid.
- “Thêm section” creates a section from a template with default Vietnamese content, or the whole page at once.
- Images are plain URLs (the API has no upload endpoint).
