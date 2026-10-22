"use client";

import { useState } from "react";

import { SocialDialog } from "@/components/site/chrome-parts";
import { ItemControls, useEditor } from "@/components/site/editor";
import type { Content } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** Brand colours for well-known networks, used until a colour is set on the content. */
export const socialColor = (c: Content): string => {
  if (c.color) return c.color;
  const name = c.title.toLowerCase();
  if (name.includes("facebook")) return "#1877f2";
  if (name.includes("tiktok")) return "#111111";
  if (name.includes("youtube")) return "#e11d2e";
  if (name.includes("zalo")) return "#0068ff";
  return "#c0272d";
};

/** SOCIAL (9) content: round coloured icon linking to `link`; image icon optional. */
export const Social = ({ item }: { item: Content }): React.JSX.Element => {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const inner = item.img ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.img} alt={item.title} className="size-5 object-contain" />
  ) : (
    item.title.slice(0, 1).toUpperCase()
  );
  const cls = "grid size-9 place-items-center rounded-full text-sm font-bold text-white";

  if (!editor) {
    return (
      <a href={item.link ?? "#"} title={item.title} className={cls} style={{ background: socialColor(item) }}>
        {inner}
      </a>
    );
  }
  return (
    <ItemControls entity="contents" id={item.id} inline className="flex items-center gap-1">
      <button
        type="button"
        title={`${item.title} — bấm để sửa`}
        onClick={() => setOpen(true)}
        className={cn(cls, "cursor-pointer outline-1 outline-dashed outline-sky-400")}
        style={{ background: socialColor(item) }}
      >
        {inner}
      </button>
      {open && <SocialDialog item={item} entity="contents" withColor onClose={() => setOpen(false)} />}
    </ItemControls>
  );
};

