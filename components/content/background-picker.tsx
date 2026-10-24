"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Field } from "@/components/crm/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResourceList } from "@/hooks/use-crud";
import { settingShowsApi } from "@/lib/api/resources";
import { SettingType, type SettingShow } from "@/lib/api/types";
import { backgroundStyle, resolveBackground } from "@/lib/site/background";
import { cn } from "@/lib/utils";

const NONE = "none";

/** Setting-shows usable as a section background: BACKGROUND (image) and COLOR. */
export const isBackgroundSetting = (s: SettingShow): boolean =>
  (s.type === SettingType.BACKGROUND || s.type === SettingType.COLOR) && s.position !== "HEADER";

/** Small preview of a background setting (colour fill or image). */
export const BackgroundSwatch = ({
  setting,
  className,
}: {
  setting: SettingShow;
  className?: string;
}): React.JSX.Element => {
  const bg = resolveBackground(setting.id, [setting]);
  return <span className={cn("block size-8 shrink-0 rounded border bg-muted", className)} style={bg ? backgroundStyle(bg) : undefined} />;
};

/** Select used in the structure form: pick the section background by setting-show id. */
export const BackgroundSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): React.JSX.Element => {
  const { data } = useResourceList(settingShowsApi, { domain: "setting-shows" }, { type: [SettingType.BACKGROUND, SettingType.COLOR] });
  const options = (data ?? []).filter(isBackgroundSetting);
  const legacy = value && !options.some((o) => o.id === value);
  return (
    <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Không có nền</SelectItem>
        {legacy && <SelectItem value={value}>Giá trị hiện tại (không có trong danh sách nền)</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export interface BackgroundSectionRef {
  id: string;
  label: string;
  background: string | null;
}

export interface NewBackground {
  type: 6 | 7;
  title: string;
  img?: string;
  color?: string;
}

/**
 * Canvas dialog. 1) pick the run of adjacent sections that share the background (starts at the current one,
 * grows to neighbours), 2) either choose an existing background or create a new one.
 */
export const BackgroundDialog = ({
  sections,
  currentId,
  options,
  onApply,
  onCreate,
  onClose,
}: {
  sections: BackgroundSectionRef[];
  currentId: string;
  options: SettingShow[];
  /** Set (or clear with null) `background` on every selected section. */
  onApply: (value: string | null, sectionIds: string[]) => Promise<boolean>;
  /** POST /sections/background with the selected sections. */
  onCreate: (input: NewBackground, sectionIds: string[]) => Promise<boolean>;
  onClose: () => void;
}): React.JSX.Element => {
  const current = sections.findIndex((x) => x.id === currentId);
  const [range, setRange] = useState<[number, number]>([current, current]);
  const [kind, setKind] = useState<"6" | "7">("6");
  const [title, setTitle] = useState("");
  const [img, setImg] = useState("");
  const [color, setColor] = useState("#fdeeee");
  const [busy, setBusy] = useState(false);
  const [lo, hi] = range;
  const ids = sections.slice(lo, hi + 1).map((x) => x.id);
  const currentValue = sections[current]?.background ?? null;

  // Only neighbours of the run can be added; only its ends (never the current section) can be removed.
  const toggle = (i: number): void => {
    if (i === lo - 1) setRange([i, hi]);
    else if (i === hi + 1) setRange([lo, i]);
    else if (i === lo && i !== current) setRange([lo + 1, hi]);
    else if (i === hi && i !== current) setRange([lo, hi - 1]);
  };
  const canToggle = (i: number): boolean =>
    i === lo - 1 || i === hi + 1 || ((i === lo || i === hi) && i !== current);

  const run = async (fn: () => Promise<boolean>): Promise<void> => {
    setBusy(true);
    const ok = await fn();
    setBusy(false);
    if (ok) onClose();
  };
  const row = (selected: boolean): string =>
    cn("flex w-full cursor-pointer items-center gap-3 rounded-lg border p-2 text-left text-sm hover:bg-accent disabled:opacity-50", selected && "border-primary bg-accent");
  const newValid = kind === "6" ? img.trim() !== "" : /^#[0-9a-f]{3,8}$/i.test(color.trim());

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nền của section</DialogTitle>
          <DialogDescription>
            Chọn các section liền nhau dùng chung một nền, rồi chọn nền có sẵn hoặc tạo nền mới.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5 text-foreground">
          <Label>Áp dụng cho ({ids.length} section)</Label>
          <div className="grid max-h-44 gap-1 overflow-y-auto rounded-lg border p-1.5">
            {sections.map((sec, i) => {
              const inRange = i >= lo && i <= hi;
              return (
                <label
                  key={sec.id}
                  className={cn("flex items-center gap-2 rounded px-2 py-1 text-sm", inRange && "bg-accent", canToggle(i) ? "cursor-pointer" : "cursor-default opacity-60")}
                >
                  <input type="checkbox" checked={inRange} disabled={!canToggle(i) && i !== current} onChange={() => toggle(i)} />
                  <span className="min-w-0 flex-1 truncate">{sec.label}</span>
                  {i === current && <span className="text-xs text-muted-foreground">đang chọn</span>}
                </label>
              );
            })}
          </div>
        </div>

        <Tabs defaultValue="existing" className="grid gap-3 text-foreground">
          <TabsList>
            <TabsTrigger value="existing">Nền có sẵn</TabsTrigger>
            <TabsTrigger value="new">Thêm nền mới</TabsTrigger>
          </TabsList>
          <TabsContent value="existing" className="grid gap-2">
            <button type="button" disabled={busy} className={row(!currentValue)} onClick={() => void run(() => onApply(null, ids))}>
              <span className="grid size-8 place-items-center rounded border bg-card text-xs">∅</span>
              Không có nền (dùng màu mặc định của khối)
              {!currentValue && <Check className="ml-auto size-4" />}
            </button>
            {options.map((o) => (
              <button key={o.id} type="button" disabled={busy} className={row(o.id === currentValue)} onClick={() => void run(() => onApply(o.id, ids))}>
                <BackgroundSwatch setting={o} />
                <span className="min-w-0 flex-1 truncate">{o.title}</span>
                <span className="text-xs text-muted-foreground">{o.type === SettingType.COLOR ? "Màu" : "Ảnh"}</span>
                {o.id === currentValue && <Check className="size-4" />}
              </button>
            ))}
            {options.length === 0 && <p className="text-sm text-muted-foreground">Chưa có nền nào, hãy thêm nền mới.</p>}
          </TabsContent>
          <TabsContent value="new" className="grid gap-3">
            <Field label="Loại">
              <Select value={kind} onValueChange={(v) => setKind(v as "6" | "7")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Ảnh</SelectItem>
                  <SelectItem value="7">Màu</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tên gợi nhớ">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nền khối giới thiệu" />
            </Field>
            {kind === "6" ? (
              <>
                <Field label="Ảnh nền (URL)" required>
                  <Input value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://…" />
                </Field>
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="Xem trước" className="max-h-32 w-full rounded-md border bg-muted object-cover" />
                )}
              </>
            ) : (
              <Field label="Màu (hex)" required>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#ffffff"}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-card p-1"
                  />
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#fdeeee" />
                </div>
              </Field>
            )}
            <Button
              disabled={busy || !newValid}
              onClick={() =>
                void run(() =>
                  onCreate(
                    kind === "6"
                      ? { type: 6, title: title.trim(), img: img.trim() }
                      : { type: 7, title: title.trim(), color: color.trim() },
                    ids,
                  ),
                )
              }
            >
              Tạo nền và áp dụng cho {ids.length} section
            </Button>
          </TabsContent>
        </Tabs>
        <Button variant="outline" disabled={busy} onClick={onClose}>
          Đóng
        </Button>
      </DialogContent>
    </Dialog>
  );
};
