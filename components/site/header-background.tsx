"use client";

import { useState } from "react";
import { Palette } from "lucide-react";

import { Field } from "@/components/crm/field";
import { useEditor } from "@/components/site/editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SettingShow } from "@/lib/api/types";
import {
  backgroundStyle,
  colorOf,
  imageOf,
  isColor,
  resolveBackground,
} from "@/lib/site/background";

const DEFAULT_COLOR = "#a81b1c";
const HEX6 = /^#[0-9a-f]{6}$/i;

/** Style of the header background setting (BACKGROUND, position HEADER), or undefined to keep the default gradient. */
export const headerBackgroundStyle = (
  setting: SettingShow | undefined,
): React.CSSProperties | undefined => {
  const bg = setting && resolveBackground(setting.id, [setting]);
  return bg ? backgroundStyle(bg) : undefined;
};

/** Dialog to set the header background: an image URL or a colour. Saving writes `img` or `color` of the setting. */
const HeaderBackgroundDialog = ({
  setting,
  onClose,
}: {
  setting: SettingShow;
  onClose: () => void;
}): React.JSX.Element => {
  const editor = useEditor();
  const currentImage = imageOf(setting) ?? "";
  const currentColor = colorOf(setting) ?? DEFAULT_COLOR;
  const [img, setImg] = useState(currentImage);
  const [color, setColor] = useState(currentColor);
  const [tab, setTab] = useState<"image" | "color">(
    currentImage || !colorOf(setting) ? "image" : "color",
  );
  const [saving, setSaving] = useState(false);

  const valid = tab === "image" ? img.trim() !== "" : isColor(color);

  const run = async (fn: () => Promise<unknown>): Promise<void> => {
    setSaving(true);
    await fn();
    setSaving(false);
    onClose();
  };
  const submit = (): Promise<void> =>
    run(() =>
      editor!.save(
        "setting-shows",
        setting.id,
        tab === "image" ? { img: img.trim(), color: null } : { color: color.trim(), img: null },
      ),
    );

  return (
    <Dialog open onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nền của header</DialogTitle>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "image" | "color")}
          className="grid gap-3 text-foreground"
        >
          <TabsList>
            <TabsTrigger value="image">Ảnh</TabsTrigger>
            <TabsTrigger value="color">Màu</TabsTrigger>
          </TabsList>
          <TabsContent value="image" className="grid gap-3">
            <Field label="Ảnh nền (URL)" required>
              <Input
                autoFocus
                value={img}
                onChange={(e) => setImg(e.target.value)}
                placeholder="https://…"
              />
            </Field>
            {img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt="Xem trước"
                className="max-h-24 w-full rounded-md border bg-muted object-cover"
              />
            )}
          </TabsContent>
          <TabsContent value="color" className="grid gap-3">
            <Field label="Màu (hex)" required>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={HEX6.test(color) ? color : DEFAULT_COLOR}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-card p-1"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder={DEFAULT_COLOR}
                />
              </div>
            </Field>
            <div
              className="h-10 rounded-md border"
              style={{ backgroundColor: isColor(color) ? color : undefined }}
            />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => void run(() => editor!.remove("setting-shows", setting.id))}
            className="sm:mr-auto"
          >
            Dùng nền mặc định
          </Button>
          <Button variant="outline" disabled={saving} onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={saving || !valid} onClick={() => void submit()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Edit-mode only: hover toolbar under the header (same pattern as the section toolbar) to add / change the background. */
export const HeaderBackgroundControl = ({
  setting,
}: {
  setting: SettingShow | undefined;
}): React.JSX.Element | null => {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  if (!editor) return null;
  return (
    <div className="pointer-events-none absolute top-full left-2 z-30 flex items-center gap-1 rounded-b-lg border bg-card p-1 text-foreground opacity-0 shadow-lg transition-opacity group-hover/header:pointer-events-auto group-hover/header:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
      <span className="px-2 text-xs font-medium whitespace-nowrap text-muted-foreground">
        Header
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (setting ? setOpen(true) : void editor.add({ kind: "header-background" }))}
        title="Nền header"
      >
        <Palette /> {setting ? "Đổi nền" : "Thêm nền"}
      </Button>
      {open && setting && (
        <HeaderBackgroundDialog setting={setting} onClose={() => setOpen(false)} />
      )}
    </div>
  );
};
