"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ExternalLink, Palette, Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddSectionDialog } from "@/components/content/add-section-dialog";
import { BackgroundDialog, isBackgroundSetting } from "@/components/content/background-picker";
import { ConfirmDelete } from "@/components/crm/confirm-delete";
import { EditorProvider, type Entity, type EditorApi, type SiteAdd, type RemovableEntity } from "@/components/site/editor";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteSections } from "@/components/site/site-sections";
import { AddButton } from "@/components/site/chrome-parts";
import { TextColorBar } from "@/components/site/text-color-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/client";
import {
  cardsApi,
  contentsApi,
  createSectionBackground,
  footerItemsApi,
  footerSectionsApi,
  sectionsApi,
  settingShowsApi,
} from "@/lib/api/resources";
import { SectionType, SettingType, type FooterSectionTypeValue, type SettingShow } from "@/lib/api/types";
import { getEditorTree, getPageHeader, getSiteChrome } from "@/lib/site/data";
import { TEMPLATES, templateKeyOf } from "@/lib/site/templates";
import type { SectionTree } from "@/lib/site/types";
import { cn, genCode } from "@/lib/utils";

const errorText = (e: unknown): string => (e instanceof ApiError ? e.detail : "Có lỗi xảy ra, vui lòng thử lại");

/** Toolbar floating over a section: reorder, show/hide, add item, structure page, delete. */
const SectionToolbar = ({
  pageId,
  section,
  index,
  all,
  backgrounds,
  onChange,
}: {
  pageId: string;
  section: SectionTree;
  index: number;
  all: SectionTree[];
  backgrounds: SettingShow[];
  onChange: () => Promise<void>;
}): React.JSX.Element => {
  const template = TEMPLATES[templateKeyOf(section.code)];
  const [busy, setBusy] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);

  const run = async (fn: () => Promise<unknown>, ok?: string): Promise<boolean> => {
    setBusy(true);
    try {
      await fn();
      if (ok) toast.success(ok);
      await onChange();
      return true;
    } catch (e) {
      toast.error(errorText(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const moveUp = (): Promise<boolean> =>
    run(() => sectionsApi.move(section.id, { prev_order: all[index - 2]?.order ?? null, next_order: all[index - 1].order }));
  const moveDown = (): Promise<boolean> =>
    run(() => sectionsApi.move(section.id, { prev_order: all[index + 1].order, next_order: all[index + 2]?.order ?? null }));

  return (
    <div className="absolute right-2 bottom-full z-30 flex items-center gap-1 rounded-lg border bg-card p-1 text-foreground pointer-events-none opacity-0 shadow-lg transition-opacity group-hover/section:pointer-events-auto group-hover/section:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
      <span className="px-2 text-xs font-medium whitespace-nowrap text-muted-foreground">{template.label}</span>
      <Button variant="ghost" size="icon-sm" disabled={busy || index === 0} onClick={() => void moveUp()} aria-label="Lên">
        <ArrowUp />
      </Button>
      <Button variant="ghost" size="icon-sm" disabled={busy || index === all.length - 1} onClick={() => void moveDown()} aria-label="Xuống">
        <ArrowDown />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => setBgOpen(true)} aria-label="Nền" title="Nền section">
        <Palette />
      </Button>
      <Button variant="ghost" size="icon-sm" asChild>
        <Link href={`/admin/content/${pageId}/${section.id}`} aria-label="Cấu trúc" title="Cấu trúc card / content">
          <Settings2 />
        </Link>
      </Button>
      <label className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
        {section.status === 1 ? "Hiện" : "Ẩn"}
        <Switch
          checked={section.status === 1}
          disabled={busy}
          onCheckedChange={(on) => void run(() => sectionsApi.setStatus(section.id, on ? 1 : 0))}
        />
      </label>
      <ConfirmDelete description="Xoá section sẽ xoá luôn các card và content bên trong." onConfirm={() => void run(() => sectionsApi.remove(section.id), "Đã xoá")}>
        <Button variant="ghost" size="icon-sm" disabled={busy} aria-label="Xoá">
          <Trash2 className="text-destructive" />
        </Button>
      </ConfirmDelete>
      {bgOpen && (
        <BackgroundDialog
          sections={all.map((x) => ({
            id: x.id,
            background: x.background,
            label: x.title || TEMPLATES[templateKeyOf(x.code)].label,
          }))}
          currentId={section.id}
          options={backgrounds}
          onApply={(value, ids) =>
            run(async () => {
              for (const id of ids) await sectionsApi.update(id, { background: value });
            }, "Đã cập nhật nền")
          }
          onCreate={(input, ids) => run(() => createSectionBackground({ ...input, section_ids: ids }), "Đã tạo nền")}
          onClose={() => setBgOpen(false)}
        />
      )}
    </div>
  );
};

/** Always-visible "+ add item" strip under a section (new card / logo / slide / bullet…). */
const SectionAddBar = ({ section, onChange }: { section: SectionTree; onChange: () => Promise<void> }): React.JSX.Element | null => {
  const template = TEMPLATES[templateKeyOf(section.code)];
  const [busy, setBusy] = useState(false);
  // BACKGROUND sections hold a single card, so no repeatable item there except hero images.
  const allowed = section.type !== SectionType.BACKGROUND || template.key === "about_hero";
  if (!template.addItem || !allowed) return null;
  const { label, run } = template.addItem;
  return (
    <div className="flex justify-center py-2">
      <AddButton
        label={label}
        disabled={busy}
        onClick={() => {
          setBusy(true);
          run(section)
            .then(() => toast.success("Đã thêm"))
            .catch((e) => toast.error(errorText(e)))
            .then(onChange)
            .finally(() => setBusy(false));
        }}
      />
    </div>
  );
};

/** WYSIWYG canvas of a page: the real site blocks with click-to-edit text/images wired to the API. */
export const PageCanvas = ({ pageId }: { pageId: string }): React.JSX.Element => {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const tree = useQuery({ queryKey: ["editor-tree", pageId], queryFn: () => getEditorTree(pageId) });
  const page = useQuery({ queryKey: ["page-headers", "detail", pageId], queryFn: () => getPageHeader(pageId) });
  const chrome = useQuery({ queryKey: ["site-chrome"], queryFn: () => getSiteChrome(true) });

  const refresh = (): Promise<void> => qc.invalidateQueries();

  const editor = useMemo<EditorApi>(() => {
    const resources: Record<Entity, { update: (id: string, b: never) => Promise<unknown> }> = {
      sections: sectionsApi,
      cards: cardsApi,
      contents: contentsApi,
      "setting-shows": settingShowsApi,
      "footer-sections": footerSectionsApi,
      "footer-items": footerItemsApi,
    };
    const removers: Record<RemovableEntity, (id: string) => Promise<void>> = {
      cards: cardsApi.remove,
      contents: contentsApi.remove,
      "setting-shows": settingShowsApi.remove,
      "footer-sections": footerSectionsApi.remove,
      "footer-items": footerItemsApi.remove,
    };
    const attempt = async (fn: () => Promise<unknown>, ok: string): Promise<boolean> => {
      try {
        await fn();
        await qc.invalidateQueries();
        toast.success(ok);
        return true;
      } catch (e) {
        toast.error(errorText(e));
        return false;
      }
    };
    const create = (w: SiteAdd): Promise<unknown> => {
      switch (w.kind) {
        case "logo":
          return settingShowsApi.create({ title: "Logo", type: SettingType.LOGO, code: genCode("logo"), position: "FOOTER" });
        case "header-logo":
          return settingShowsApi.create({ title: "Logo", type: SettingType.LOGO, code: genCode("logo"), position: "HEADER" });
        case "header-button":
          return settingShowsApi.create({ title: "Ứng tuyển ngay", link: "#", type: SettingType.BUTTON, code: genCode("button"), position: "HEADER" });
        case "header-social":
          return settingShowsApi.create({ title: "Mạng xã hội", type: SettingType.SOCIAL, code: genCode("social"), position: "HEADER" });
        case "header-background":
          return settingShowsApi.create({ title: "Nền header", type: SettingType.BACKGROUND, code: genCode("header-bg"), position: "HEADER" });
        case "copyright":
          return settingShowsApi.create({ title: "Copyright © PORO Language Space", type: SettingType.VERSION, code: genCode("version"), position: "FOOTER" });
        case "social":
          return settingShowsApi.create({ title: "Mạng xã hội", type: SettingType.SOCIAL, code: genCode("social"), position: "FOOTER" });
        case "contact":
          return settingShowsApi.create({ title: "Thông tin liên hệ", type: SettingType.FOOTER_CONTACT, code: genCode("contact"), position: "FOOTER" });
        case "group": {
          const type: FooterSectionTypeValue = w.groupType;
          return footerSectionsApi.create({ title: type === 1 ? "Liên kết" : "Thông tin", code: genCode("footer"), type, status: 1 });
        }
        case "content":
          return contentsApi.create({
            type: w.contentType,
            title: w.title ?? { 1: "Ảnh mới", 3: "Nội dung mới", 4: "Nút mới", 5: "Nội dung mới", 6: "4.8", 8: "App Store", 9: "Facebook" }[w.contentType],
            subtitle: w.subtitle ?? null,
            link: w.link !== undefined ? w.link : w.contentType === 4 || w.contentType === 8 || w.contentType === 9 ? "#" : null,
            parent: w.cardId,
            code: genCode("content"),
            status: 1,
          });
        case "item":
          return footerItemsApi.create({ title: "Nội dung mới", type: w.itemType, parent_id: w.groupId });
      }
    };
    return {
      save: (entity, id, patch) => attempt(() => resources[entity].update(id, patch as never), "Đã lưu"),
      remove: async (entity, id) => {
        await attempt(() => removers[entity](id), "Đã xoá");
      },
      add: async (what) => {
        await attempt(() => create(what), "Đã thêm");
      },
      setStatus: async (_entity, id, status) => {
        await attempt(() => footerSectionsApi.setStatus(id, status), "Đã cập nhật");
      },
    };
  }, [qc]);

  const sections = tree.data ?? [];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Bấm vào chữ để sửa, rê chuột lên ảnh để đổi ảnh. Header và footer cũng sửa được ngay trên canvas.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={page.data?.path ?? "/"} target="_blank">
              <ExternalLink /> Xem trang thật
            </Link>
          </Button>
          <Button onClick={() => setAdding(true)}>
            <Plus /> Thêm section
          </Button>
        </div>
      </div>

      {tree.isLoading && <Skeleton className="h-96" />}
      {tree.isError && <p className="rounded-lg border p-6 text-sm text-destructive">Không tải được dữ liệu. Kiểm tra API.</p>}

      {tree.data && (
        <div
          className="@container rounded-xl border bg-white text-neutral-900 shadow-sm [&>footer]:rounded-b-xl [&>header]:rounded-t-xl"
          onClickCapture={(e) => {
            // Links in the preview must not navigate away from the editor.
            if ((e.target as HTMLElement).closest("a")) e.preventDefault();
          }}
        >
          <EditorProvider value={editor}>
            {chrome.data && <SiteHeader chrome={chrome.data} activePageId={pageId} />}
            {sections.length === 0 ? (
              <div className="grid place-items-center gap-3 p-20 text-center text-sm text-muted-foreground">
                Trang chưa có section nào.
                <Button onClick={() => setAdding(true)}>
                  <Plus /> Thêm section
                </Button>
              </div>
            ) : (
              <SiteSections
                sections={sections}
                settings={chrome.data?.settings ?? []}
                frame={(section, index, children) => (
                  <div className={cn("group/section relative outline-2 -outline-offset-2 outline-transparent hover:outline-sky-400/70", section.status !== 1 && "opacity-50")}>
                    {section.status !== 1 && (
                      <span className="absolute top-2 left-2 z-30 rounded bg-neutral-800 px-2 py-0.5 text-xs text-white">Đang ẩn</span>
                    )}
                    <SectionToolbar pageId={pageId} section={section} index={index} all={sections} backgrounds={(chrome.data?.settings ?? []).filter(isBackgroundSetting)} onChange={refresh} />
                    {children}
                    <SectionAddBar section={section} onChange={refresh} />
                  </div>
                )}
              />
            )}
            {chrome.data && <SiteFooter chrome={chrome.data} />}
            <TextColorBar />
          </EditorProvider>
        </div>
      )}
      {adding && <AddSectionDialog pageId={pageId} onClose={() => setAdding(false)} />}
    </div>
  );
};
