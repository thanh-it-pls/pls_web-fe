"use client";

import Link from "next/link";

import { AddButton, SocialIcon, SocialItem } from "@/components/site/chrome-parts";
import { EditableImage, EditableText, ItemControls, LinkEdit, useEditor } from "@/components/site/editor";
import { SettingType, type SettingShow } from "@/lib/api/types";
import type { SiteChrome } from "@/lib/site/types";

const byType = (settings: SettingShow[], type: number): SettingShow[] =>
  settings.filter((s) => s.type === type && s.position === "HEADER");

export { SocialIcon };

/** Dark-red top bar: logo, page menu, CTA button(s) and social icons. Logo/button/social are editable in the CRM canvas. */
export const SiteHeader = ({ chrome, activePageId }: { chrome: SiteChrome; activePageId?: string }): React.JSX.Element => {
  const editor = useEditor();
  const logo = byType(chrome.settings, SettingType.LOGO)[0];
  const buttons = byType(chrome.settings, SettingType.BUTTON);
  const social = byType(chrome.settings, SettingType.SOCIAL);

  return (
    <header className="bg-gradient-to-r from-[#7f1415] to-[#a81b1c] text-white">
      <div className="mx-auto flex min-h-14 w-full max-w-[1200px] items-center gap-6 px-6 py-1.5">
        {logo ? (
          <ItemControls entity="setting-shows" id={logo.id} className="shrink-0">
            <Link href={editor ? "#" : (logo.link ?? "/")} className="flex items-center">
              <EditableImage
                entity="setting-shows"
                id={logo.id}
                value={logo.img}
                alt={logo.title}
                className="h-8 w-20"
                imgClassName="h-full w-full object-contain object-left"
                emptyLabel="Logo"
                fallback={<span className="text-xl font-extrabold">{logo.title}</span>}
              />
            </Link>
            <LinkEdit entity="setting-shows" id={logo.id} link={logo.link} title="Liên kết của logo" />
          </ItemControls>
        ) : (
          editor && <AddButton label="Thêm logo" onClick={() => void editor.add({ kind: "header-logo" })} />
        )}
        <nav className="flex flex-1 items-center justify-center gap-6 overflow-x-auto text-xs font-medium whitespace-nowrap">
          {chrome.headers.map((h) => (
            <Link
              key={h.id}
              href={h.path}
              className={h.id === activePageId ? "font-bold underline underline-offset-4" : "opacity-90 hover:opacity-100"}
            >
              {h.title}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          {buttons.map((b) => (
            <ItemControls key={b.id} entity="setting-shows" id={b.id} className="flex items-center gap-1.5">
              {editor ? (
                <span className="rounded-full border border-white/80 px-4 py-1 text-xs font-semibold">
                  <EditableText entity="setting-shows" id={b.id} field="title" value={b.title} required />
                </span>
              ) : (
                <a href={b.link ?? "#"} className="rounded-full border border-white/80 px-4 py-1 text-xs font-semibold">
                  {b.title}
                </a>
              )}
              <LinkEdit entity="setting-shows" id={b.id} link={b.link} title="Liên kết của nút" />
            </ItemControls>
          ))}
          {editor && <AddButton label="Nút" onClick={() => void editor.add({ kind: "header-button" })} />}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {social.map((s) => (
            <SocialItem key={s.id} item={s} />
          ))}
          {editor && <AddButton label="MXH" onClick={() => void editor.add({ kind: "header-social" })} />}
        </div>
      </div>
    </header>
  );
};
