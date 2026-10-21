"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDelete } from "@/components/crm/confirm-delete";
import { Field } from "@/components/crm/field";
import { SortableList } from "@/components/crm/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useResourceList, useResourceMutations } from "@/hooks/use-crud";
import { footerItemsApi, footerSectionsApi } from "@/lib/api/resources";
import {
  FOOTER_ITEM_TYPE_LABEL,
  FOOTER_SECTION_TYPE_LABEL,
  type FooterItem,
  type FooterItemTypeValue,
  type FooterSection,
  type FooterSectionTypeValue,
} from "@/lib/api/types";
import { nullable } from "@/lib/utils";

const SECTIONS = { domain: "footer-sections" };
const ITEMS = { domain: "footer-items" };

const FooterSectionDialog = ({
  item,
  onClose,
}: {
  item: FooterSection | null;
  onClose: () => void;
}): React.JSX.Element => {
  const { create, update } = useResourceMutations(footerSectionsApi, SECTIONS);
  const [title, setTitle] = useState(item?.title ?? "");
  const [code, setCode] = useState(item?.code ?? "");
  const [type, setType] = useState<FooterSectionTypeValue>(item?.type ?? 1);
  const [link, setLink] = useState(item?.link ?? "");
  const pending = create.isPending || update.isPending;

  const submit = (): void => {
    const done = { onSuccess: onClose };
    const body = { title: title.trim(), type, link: nullable(link) };
    // `code` cannot be changed through PATCH, so it is only sent on create.
    if (item) update.mutate({ id: item.id, body }, done);
    else create.mutate({ ...body, code: code.trim() }, done);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Sửa nhóm footer" : "Thêm nhóm footer"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Tiêu đề" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Code" required hint={item ? "Không thể đổi code sau khi tạo." : "Dùng để website nhận diện nhóm này."}>
            <Input value={code} disabled={!!item} onChange={(e) => setCode(e.target.value)} placeholder="vd: footer-about" />
          </Field>
          <Field label="Loại" required>
            <Select value={String(type)} onValueChange={(v) => setType(Number(v) as FooterSectionTypeValue)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {([1, 2] as FooterSectionTypeValue[]).map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {FOOTER_SECTION_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Liên kết">
            <Input value={link} onChange={(e) => setLink(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={!title.trim() || !code.trim() || pending} onClick={submit}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FooterItemDialog = ({
  sectionId,
  item,
  onClose,
}: {
  sectionId: string;
  item: FooterItem | null;
  onClose: () => void;
}): React.JSX.Element => {
  const { create, update } = useResourceMutations(footerItemsApi, ITEMS);
  const [title, setTitle] = useState(item?.title ?? "");
  const [type, setType] = useState<FooterItemTypeValue>(item?.type ?? 1);
  const [link, setLink] = useState(item?.link ?? "");
  const pending = create.isPending || update.isPending;

  const submit = (): void => {
    const done = { onSuccess: onClose };
    const body = { title: title.trim(), type, link: nullable(link) };
    if (item) update.mutate({ id: item.id, body }, done);
    else create.mutate({ ...body, parent_id: sectionId }, done);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Sửa item" : "Thêm item"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Loại" required>
            <Select value={String(type)} onValueChange={(v) => setType(Number(v) as FooterItemTypeValue)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(FOOTER_ITEM_TYPE_LABEL).map(Number) as FooterItemTypeValue[]).map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {FOOTER_ITEM_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tiêu đề" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Liên kết / giá trị">
            <Input value={link} onChange={(e) => setLink(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={!title.trim() || pending} onClick={submit}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FooterItemRow = ({ item }: { item: FooterItem }): React.JSX.Element => {
  const { remove } = useResourceMutations(footerItemsApi, ITEMS);
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background p-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{item.title}</p>
        {item.link && <p className="truncate text-xs text-muted-foreground">{item.link}</p>}
      </div>
      <Badge variant="outline">{FOOTER_ITEM_TYPE_LABEL[item.type]}</Badge>
      <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label="Sửa">
        <Pencil />
      </Button>
      <ConfirmDelete onConfirm={() => remove.mutate(item.id)}>
        <Button variant="ghost" size="icon-sm" aria-label="Xoá">
          <Trash2 className="text-destructive" />
        </Button>
      </ConfirmDelete>
      {editing && <FooterItemDialog sectionId={item.parent_id} item={item} onClose={() => setEditing(false)} />}
    </div>
  );
};

const FooterItemList = ({ sectionId }: { sectionId: string }): React.JSX.Element => {
  // `parent_id` is required by the API for footer-items.
  const { data, isLoading } = useResourceList(footerItemsApi, ITEMS, { parent_id: sectionId });
  const { move } = useResourceMutations(footerItemsApi, ITEMS);
  const [adding, setAdding] = useState(false);
  return (
    <div className="grid gap-3 border-t bg-muted/40 p-3">
      {isLoading && <Skeleton className="h-10" />}
      {data?.length === 0 && <p className="text-center text-xs text-muted-foreground">Nhóm chưa có item.</p>}
      {data && data.length > 0 && (
        <SortableList
          items={data}
          className="gap-2"
          onMove={(id, body) => move.mutate({ id, body })}
          renderItem={(i) => <FooterItemRow item={i} />}
        />
      )}
      <Button variant="outline" size="sm" className="w-fit" onClick={() => setAdding(true)}>
        <Plus /> Thêm item
      </Button>
      {adding && <FooterItemDialog sectionId={sectionId} item={null} onClose={() => setAdding(false)} />}
    </div>
  );
};

const FooterSectionRow = ({ section }: { section: FooterSection }): React.JSX.Element => {
  const { remove, setStatus } = useResourceMutations(footerSectionsApi, SECTIONS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
        >
          {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{section.title}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{section.code}</p>
          </div>
        </button>
        <Badge variant="outline">{FOOTER_SECTION_TYPE_LABEL[section.type]}</Badge>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {section.status === 1 ? "Hiện" : "Ẩn"}
          <Switch
            checked={section.status === 1}
            onCheckedChange={(on) => setStatus.mutate({ id: section.id, status: on ? 1 : 0 })}
          />
        </label>
        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label="Sửa">
          <Pencil />
        </Button>
        <ConfirmDelete onConfirm={() => remove.mutate(section.id)}>
          <Button variant="ghost" size="icon-sm" aria-label="Xoá">
            <Trash2 className="text-destructive" />
          </Button>
        </ConfirmDelete>
      </div>
      {open && <FooterItemList sectionId={section.id} />}
      {editing && <FooterSectionDialog item={section} onClose={() => setEditing(false)} />}
    </div>
  );
};

/** Footer groups (navigation / title) and their items, with drag & drop ordering. */
export const FooterManager = (): React.JSX.Element => {
  const { data, isLoading } = useResourceList(footerSectionsApi, SECTIONS);
  const { move } = useResourceMutations(footerSectionsApi, SECTIONS);
  const [adding, setAdding] = useState(false);
  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)}>
          <Plus /> Thêm nhóm footer
        </Button>
      </div>
      {isLoading && <Skeleton className="h-16" />}
      {data?.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Chưa có nhóm footer nào.
        </p>
      )}
      {data && data.length > 0 && (
        <SortableList
          items={data}
          onMove={(id, body) => move.mutate({ id, body })}
          renderItem={(s) => <FooterSectionRow section={s} />}
        />
      )}
      {adding && <FooterSectionDialog item={null} onClose={() => setAdding(false)} />}
    </div>
  );
};
