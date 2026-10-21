"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Field } from "@/components/crm/field";
import { FooterManager } from "@/components/crm/footer-manager";
import { ConfirmDelete } from "@/components/crm/confirm-delete";
import { SortableList } from "@/components/crm/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResourceList, useResourceMutations } from "@/hooks/use-crud";
import { settingShowsApi } from "@/lib/api/resources";
import {
  POSITION_LABEL,
  SETTING_TYPE_LABEL,
  SettingType,
  type SettingPosition,
  type SettingShow,
  type SettingTypeValue,
} from "@/lib/api/types";
import { nullable } from "@/lib/utils";

const DOMAIN = { domain: "setting-shows" };

const TYPE_HINT: Record<SettingTypeValue, { link: string; img: string; title: string }> = {
  1: { title: "Tên mạng xã hội (Facebook, Zalo…)", link: "Đường dẫn trang", img: "Icon (URL)" },
  2: { title: "Nhãn phiên bản", link: "Liên kết (tuỳ chọn)", img: "Ảnh (tuỳ chọn)" },
  3: { title: "Tên logo", link: "Liên kết khi bấm logo", img: "Ảnh logo (URL)" },
  4: { title: "Nhãn liên hệ", link: "Giá trị / liên kết (tel:, mailto:…)", img: "Icon (URL)" },
  5: { title: "Nội dung nút", link: "Đường dẫn khi bấm", img: "Icon (URL)" },
};

const TYPES = Object.values(SettingType) as SettingTypeValue[];

interface FormState {
  title: string;
  link: string;
  img: string;
  position: SettingPosition;
  code: string;
}

const emptyForm = (): FormState => ({ title: "", link: "", img: "", position: "HEADER", code: "" });

const SettingDialog = ({
  type,
  item,
  open,
  onOpenChange,
}: {
  type: SettingTypeValue;
  item: SettingShow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.JSX.Element => {
  const { create, update } = useResourceMutations(settingShowsApi, DOMAIN);
  const [form, setForm] = useState<FormState>(
    item ? { title: item.title, link: item.link ?? "", img: item.img ?? "", position: item.position, code: item.code } : emptyForm(),
  );
  const hint = TYPE_HINT[type];
  const set = (patch: Partial<FormState>): void => setForm((f) => ({ ...f, ...patch }));
  const pending = create.isPending || update.isPending;

  const submit = (): void => {
    const body = { title: form.title, link: nullable(form.link), img: nullable(form.img), position: form.position, code: form.code.trim() };
    const done = { onSuccess: () => onOpenChange(false) };
    if (item) update.mutate({ id: item.id, body }, done);
    else create.mutate({ ...body, type }, done);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? "Sửa" : "Thêm"} {SETTING_TYPE_LABEL[type].toLowerCase()}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Vị trí hiển thị" required>
            <Select value={form.position} onValueChange={(v) => set({ position: v as SettingPosition })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(POSITION_LABEL) as SettingPosition[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {POSITION_LABEL[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={hint.title} required>
            <Input value={form.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Code" required hint="Dùng để website nhận diện mục này.">
            <Input value={form.code} onChange={(e) => set({ code: e.target.value })} placeholder="vd: logo-main" />
          </Field>
          <Field label={hint.link}>
            <Input value={form.link} onChange={(e) => set({ link: e.target.value })} />
          </Field>
          <Field label={hint.img}>
            <Input value={form.img} onChange={(e) => set({ img: e.target.value })} placeholder="https://…" />
          </Field>
          {form.img && type === SettingType.LOGO && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.img} alt="Xem trước logo" className="h-16 w-auto rounded border bg-muted object-contain p-2" />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button disabled={!form.title.trim() || !form.code.trim() || pending} onClick={submit}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SettingRow = ({
  item,
  onEdit,
  onDelete,
}: {
  item: SettingShow;
  onEdit: () => void;
  onDelete: () => void;
}): React.JSX.Element => (
  <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
    {item.img ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.img} alt="" className="size-10 rounded border bg-muted object-contain" />
    ) : (
      <div className="size-10 rounded border bg-muted" />
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium">{item.title}</p>
      <p className="truncate text-xs text-muted-foreground">{item.link ?? "—"}</p>
    </div>
    <Badge variant="secondary">{POSITION_LABEL[item.position]}</Badge>
    <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Sửa">
      <Pencil />
    </Button>
    <ConfirmDelete onConfirm={onDelete}>
      <Button variant="ghost" size="icon-sm" aria-label="Xoá">
        <Trash2 className="text-destructive" />
      </Button>
    </ConfirmDelete>
  </div>
);

const SettingTab = ({ type }: { type: SettingTypeValue }): React.JSX.Element => {
  const { data, isLoading } = useResourceList(settingShowsApi, DOMAIN, { type });
  const { remove, move } = useResourceMutations(settingShowsApi, DOMAIN);
  const [editing, setEditing] = useState<SettingShow | null>(null);
  const [open, setOpen] = useState(false);

  const openDialog = (item: SettingShow | null): void => {
    setEditing(item);
    setOpen(true);
  };

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button onClick={() => openDialog(null)}>
          <Plus /> Thêm
        </Button>
      </div>
      {isLoading && <Skeleton className="h-16" />}
      {data && data.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Chưa có {SETTING_TYPE_LABEL[type].toLowerCase()} nào.
        </p>
      )}
      {data && data.length > 0 && (
        <SortableList
          items={data}
          onMove={(id, body) => move.mutate({ id, body })}
          renderItem={(item) => (
            <SettingRow item={item} onEdit={() => openDialog(item)} onDelete={() => remove.mutate(item.id)} />
          )}
        />
      )}
      {/* key remounts the dialog so the form re-initialises for each item */}
      {open && (
        <SettingDialog key={editing?.id ?? "new"} type={type} item={editing} open={open} onOpenChange={setOpen} />
      )}
    </div>
  );
};

/** Overview settings: logo, social links, version, footer contact and buttons, each with header/footer position. */
export const SettingsManager = (): React.JSX.Element => (
  <Tabs defaultValue={String(SettingType.LOGO)} className="grid gap-4">
    <TabsList className="h-auto flex-wrap">
      {[SettingType.LOGO, SettingType.SOCIAL, SettingType.VERSION, SettingType.FOOTER_CONTACT, SettingType.BUTTON].map(
        (t) => (
          <TabsTrigger key={t} value={String(t)} className="h-8">
            {SETTING_TYPE_LABEL[t]}
          </TabsTrigger>
        ),
      )}
      <TabsTrigger value="footer-groups" className="h-8">
        Nhóm footer
      </TabsTrigger>
    </TabsList>
    <TabsContent value="footer-groups">
      <FooterManager />
    </TabsContent>
    {TYPES.map((t) => (
      <TabsContent key={t} value={String(t)}>
        <SettingTab type={t} />
      </TabsContent>
    ))}
  </Tabs>
);
