"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Field } from "@/components/crm/field";
import { ItemControls, useEditor, type Entity } from "@/components/site/editor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SettingShow } from "@/lib/api/types";

/** Social icon: uploaded icon URL, or the first letter of its name. */
export const SocialIcon = ({ item }: { item: SettingShow }): React.JSX.Element => (
  <a
    href={item.link ?? "#"}
    title={item.title}
    className="grid size-10 place-items-center overflow-hidden rounded-full bg-white/90 text-xs font-bold text-[#c0272d]"
  >
    {item.img ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.img} alt={item.title} className="size-full object-contain" />
    ) : (
      item.title.slice(0, 1).toUpperCase()
    )}
  </a>
);

/** Always-visible "+ add" chip: sky outline on a light chip, readable on both light and dark backgrounds. */
export const AddButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}): React.JSX.Element => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-dashed border-sky-500 bg-white/95 px-2 py-1 text-xs font-medium whitespace-nowrap text-sky-700 shadow-sm hover:bg-sky-50 disabled:cursor-wait disabled:opacity-60"
  >
    <Plus className="size-3.5" /> {label}
  </button>
);

interface SocialLike {
  id: string;
  title: string;
  link: string | null;
  img: string | null;
  color?: string | null;
}

/** Edit dialog for a social icon: name, link, icon image and (optionally) colour. */
export const SocialDialog = ({
  item,
  entity = "setting-shows",
  withColor = false,
  onClose,
}: {
  item: SocialLike;
  entity?: Entity;
  withColor?: boolean;
  onClose: () => void;
}): React.JSX.Element => {
  const editor = useEditor();
  const [title, setTitle] = useState(item.title);
  const [link, setLink] = useState(item.link ?? "");
  const [img, setImg] = useState(item.img ?? "");
  const [color, setColor] = useState(item.color ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (): Promise<void> => {
    if (!editor) return;
    setSaving(true);
    const patch: Record<string, string | null> = {
      title: title.trim(),
      link: link.trim() || null,
      img: img.trim() || null,
    };
    if (withColor && (color.trim() || item.color)) patch.color = color.trim() || null;
    const ok = await editor.save(entity, item.id, patch);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mạng xã hội</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 text-foreground">
          <Field label="Tên" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Liên kết">
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Icon (URL ảnh)">
            <Input value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://…" />
          </Field>
          {withColor && (
            <Field label="Màu nền (hex)" hint="Để trống để dùng màu mặc định theo tên.">
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#1877f2" />
            </Field>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={!title.trim() || saving} onClick={() => void submit()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const SocialItem = ({ item }: { item: SettingShow }): React.JSX.Element => {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  if (!editor) return <SocialIcon item={item} />;
  return (
    <ItemControls entity="setting-shows" id={item.id}>
      <button
        type="button"
        title={`${item.title} — bấm để sửa`}
        onClick={() => setOpen(true)}
        className="grid size-7 cursor-pointer place-items-center overflow-hidden rounded-full bg-white/90 text-xs font-bold text-[#c0272d] outline-1 outline-dashed outline-sky-400"
      >
        {item.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.img} alt={item.title} className="size-full object-contain" />
        ) : (
          item.title.slice(0, 1).toUpperCase()
        )}
      </button>
      {open && <SocialDialog item={item} onClose={() => setOpen(false)} />}
    </ItemControls>
  );
};

