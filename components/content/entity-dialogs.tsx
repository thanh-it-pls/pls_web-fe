"use client";

import { useState } from "react";

import { Field } from "@/components/crm/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useResourceMutations } from "@/hooks/use-crud";
import { cardsApi, contentsApi } from "@/lib/api/resources";
import { CONTENT_TYPE_LABEL, type Card, type Content, type ContentTypeValue } from "@/lib/api/types";
import { genCode, nullable } from "@/lib/utils";

interface CommonFields {
  title: string;
  subtitle: string;
  des: string;
  link: string;
  img: string;
}

const toCommon = (item: Card | Content | null): CommonFields => ({
  title: item?.title ?? "",
  subtitle: item?.subtitle ?? "",
  des: item?.des ?? "",
  link: item?.link ?? "",
  img: item?.img ?? "",
});

const CommonInputs = ({
  form,
  set,
}: {
  form: CommonFields;
  set: (patch: Partial<CommonFields>) => void;
}): React.JSX.Element => (
  <>
    <Field label="Tiêu đề" required>
      <Input value={form.title} onChange={(e) => set({ title: e.target.value })} />
    </Field>
    <Field label="Phụ đề">
      <Input value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
    </Field>
    <Field label="Mô tả / nội dung">
      <Textarea value={form.des} onChange={(e) => set({ des: e.target.value })} />
    </Field>
    <Field label="Liên kết">
      <Input value={form.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://…" />
    </Field>
    <Field label="Hình ảnh (URL)">
      <Input value={form.img} onChange={(e) => set({ img: e.target.value })} placeholder="https://…" />
    </Field>
  </>
);

const payload = (f: CommonFields) => ({
  title: f.title.trim(),
  subtitle: nullable(f.subtitle),
  des: nullable(f.des),
  link: nullable(f.link),
  img: nullable(f.img),
});

/** Create / edit dialog for a card. */
export const CardDialog = ({
  sectionId,
  item,
  onClose,
}: {
  sectionId: string;
  item: Card | null;
  onClose: () => void;
}): React.JSX.Element => {
  const { create, update } = useResourceMutations(cardsApi, { domain: "cards" });
  const [form, setForm] = useState<CommonFields>(toCommon(item));
  const set = (patch: Partial<CommonFields>): void => setForm((f) => ({ ...f, ...patch }));
  const pending = create.isPending || update.isPending;

  const submit = (): void => {
    const done = { onSuccess: onClose };
    if (item) update.mutate({ id: item.id, body: payload(form) }, done);
    else create.mutate({ ...payload(form), parent: sectionId, code: genCode("card") }, done);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Sửa card" : "Thêm card"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <CommonInputs form={form} set={set} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={!form.title.trim() || pending} onClick={submit}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Create / edit dialog for a content block (type-specific meaning of fields is up to the website). */
export const ContentDialog = ({
  cardId,
  item,
  onClose,
}: {
  cardId: string;
  item: Content | null;
  onClose: () => void;
}): React.JSX.Element => {
  const { create, update } = useResourceMutations(contentsApi, { domain: "contents" });
  const [form, setForm] = useState<CommonFields>(toCommon(item));
  const [icon, setIcon] = useState(item?.icon ?? "");
  const [type, setType] = useState<ContentTypeValue>(item?.type ?? 3);
  const set = (patch: Partial<CommonFields>): void => setForm((f) => ({ ...f, ...patch }));
  const pending = create.isPending || update.isPending;

  const submit = (): void => {
    const body = { ...payload(form), type, icon: nullable(icon) };
    const done = { onSuccess: onClose };
    if (item) update.mutate({ id: item.id, body }, done);
    else create.mutate({ ...body, parent: cardId, code: genCode("content") }, done);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Sửa content" : "Thêm content"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Loại content" required>
            <Select value={String(type)} onValueChange={(v) => setType(Number(v) as ContentTypeValue)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CONTENT_TYPE_LABEL).map(Number) as ContentTypeValue[]).map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {CONTENT_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <CommonInputs form={form} set={set} />
          <Field label="Icon">
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={!form.title.trim() || pending} onClick={submit}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
