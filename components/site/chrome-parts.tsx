"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Field } from "@/components/crm/field";
import { ItemControls, useEditor } from "@/components/site/editor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SettingShow } from "@/lib/api/types";

/** Social icon: uploaded icon URL, or the first letter of its name. */
export const SocialIcon = ({ item }: { item: SettingShow }): React.JSX.Element => (
  <a
    href={item.link ?? "#"}
    title={item.title}
    className="grid size-7 place-items-center overflow-hidden rounded-full bg-white/90 text-xs font-bold text-[#c0272d]"
  >
    {item.img ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.img} alt={item.title} className="size-full object-contain" />
    ) : (
      item.title.slice(0, 1).toUpperCase()
    )}
  </a>
);

export const AddButton = ({ label, onClick }: { label: string; onClick: () => void }): React.JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-0.5 rounded border border-dashed border-white/40 px-1.5 py-0.5 text-[10px] text-white/80 hover:border-sky-400 hover:text-sky-300"
  >
    <Plus className="size-3" /> {label}
  </button>
);

/** Edit dialog for a social icon: name, link and icon image. */
const SocialDialog = ({ item, onClose }: { item: SettingShow; onClose: () => void }): React.JSX.Element => {
  const editor = useEditor();
  const [title, setTitle] = useState(item.title);
  const [link, setLink] = useState(item.link ?? "");
  const [img, setImg] = useState(item.img ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (): Promise<void> => {
    if (!editor) return;
    setSaving(true);
    const ok = await editor.save("setting-shows", item.id, {
      title: title.trim(),
      link: link.trim() || null,
      img: img.trim() || null,
    });
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

