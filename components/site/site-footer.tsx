"use client";

import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";

import {
  EditableImage,
  EditableText,
  ItemControls,
  LinkEdit,
  type SiteAdd,
  useEditor,
} from "@/components/site/editor";
import { AddButton, SocialItem } from "@/components/site/chrome-parts";
import { Switch } from "@/components/ui/switch";
import {
  FOOTER_ITEM_TYPE_LABEL,
  FooterItemType,
  FooterSectionType,
  SettingType,
  type FooterItem,
  type FooterItemTypeValue,
} from "@/lib/api/types";
import type { FooterGroup, SiteChrome } from "@/lib/site/types";
import { cn } from "@/lib/utils";

const ITEM_ICON: Partial<Record<FooterItemTypeValue, LucideIcon>> = {
  [FooterItemType.ADDRESS]: MapPin,
  [FooterItemType.PHONE]: Phone,
  [FooterItemType.EMAIL]: Mail,
};

/** Public href for a footer item; phone/email fall back to their own text. */
const hrefOf = (item: FooterItem): string | null => {
  if (item.type === FooterItemType.EMAIL) return item.link ?? `mailto:${item.title}`;
  if (item.type === FooterItemType.PHONE) return item.link ?? `tel:${item.title.replace(/\s/g, "")}`;
  return item.link;
};

const ItemRow = ({ item }: { item: FooterItem }): React.JSX.Element => {
  const editor = useEditor();
  const Icon = ITEM_ICON[item.type];
  const href = hrefOf(item);
  const text = (
    <EditableText entity="footer-items" id={item.id} field="title" value={item.title} required />
  );
  return (
    <li>
      <ItemControls entity="footer-items" id={item.id} className="flex items-start gap-2">
        {Icon && <Icon className="mt-0.5 size-3 shrink-0" />}
        {!editor && href ? <a href={href}>{text}</a> : text}
        <LinkEdit entity="footer-items" id={item.id} link={item.link} />
      </ItemControls>
    </li>
  );
};

const GroupColumn = ({ group }: { group: FooterGroup }): React.JSX.Element => {
  const editor = useEditor();
  const isTitle = group.type === FooterSectionType.TITLE;
  const heading = (
    <EditableText
      as="h4"
      entity="footer-sections"
      id={group.id}
      field="title"
      value={group.title}
      required
      className="block text-xs font-bold uppercase"
    />
  );
  return (
    <div className={cn(group.status !== 1 && "opacity-50")}>
      <ItemControls entity="footer-sections" id={group.id} className="flex items-center gap-2">
        {!editor && group.link ? <a href={group.link}>{heading}</a> : heading}
        <LinkEdit entity="footer-sections" id={group.id} link={group.link} title="Liên kết của tiêu đề" />
        {editor && (
          <Switch
            checked={group.status === 1}
            onCheckedChange={(on) => void editor.setStatus("footer-sections", group.id, on ? 1 : 0)}
            aria-label="Hiện / ẩn nhóm"
            className="scale-75"
          />
        )}
      </ItemControls>
      <ul className="mt-3 grid gap-1.5 text-[11px] text-white/80">
        {group.items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
      {editor && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(isTitle
            ? ([FooterItemType.TEXT, FooterItemType.ADDRESS, FooterItemType.PHONE, FooterItemType.EMAIL] as const)
            : ([FooterItemType.LINK] as const)
          ).map((t) => (
            <AddButton
              key={t}
              label={FOOTER_ITEM_TYPE_LABEL[t]}
              onClick={() => void editor.add({ kind: "item", groupId: group.id, itemType: t } satisfies SiteAdd)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/** Dark footer per Figma: logo + social, group columns (nav links / contact info), copyright. Editable in the CRM canvas. */
export const SiteFooter = ({ chrome }: { chrome: SiteChrome }): React.JSX.Element => {
  const editor = useEditor();
  const inFooter = chrome.settings.filter((s) => s.position === "FOOTER");
  const logo = inFooter.find((s) => s.type === SettingType.LOGO);
  const social = inFooter.filter((s) => s.type === SettingType.SOCIAL);
  const version = inFooter.find((s) => s.type === SettingType.VERSION);
  const contacts = inFooter.filter((s) => s.type === SettingType.FOOTER_CONTACT);

  return (
    <footer className="bg-[#161616] text-white">
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-6 py-10 @3xl:grid-flow-col @3xl:auto-cols-fr">
        <div className="@3xl:min-w-44">
          {logo ? (
            <ItemControls entity="setting-shows" id={logo.id} className="w-fit">
              <EditableImage
                entity="setting-shows"
                id={logo.id}
                value={logo.img}
                alt={logo.title}
                className="h-12 w-28"
                imgClassName="h-full w-full object-contain object-left"
                emptyLabel="Logo"
                fallback={<span className="text-xl font-extrabold">{logo.title}</span>}
              />
            </ItemControls>
          ) : (
            editor && <AddButton label="Thêm logo" onClick={() => void editor.add({ kind: "logo" })} />
          )}
          <p className="mt-4 text-xs">Liên hệ với chúng tôi</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {social.map((s) => (
              <SocialItem key={s.id} item={s} />
            ))}
            {editor && <AddButton label="MXH" onClick={() => void editor.add({ kind: "social" })} />}
          </div>
          <div className="mt-2 grid gap-1 text-xs text-white/80">
            {contacts.map((c) => (
              <ItemControls key={c.id} entity="setting-shows" id={c.id} className="flex items-center gap-2">
                {!editor && c.link ? (
                  <a href={c.link}>{c.title}</a>
                ) : (
                  <EditableText entity="setting-shows" id={c.id} field="title" value={c.title} required />
                )}
                <LinkEdit entity="setting-shows" id={c.id} link={c.link} />
              </ItemControls>
            ))}
            {editor && <AddButton label="Liên hệ" onClick={() => void editor.add({ kind: "contact" })} />}
          </div>
        </div>
        {chrome.footer.map((g) => (
          <GroupColumn key={g.id} group={g} />
        ))}
        {editor && (
          <div className="flex flex-col items-start gap-1">
            <AddButton label="Nhóm liên kết" onClick={() => void editor.add({ kind: "group", groupType: 1 })} />
            <AddButton label="Nhóm thông tin" onClick={() => void editor.add({ kind: "group", groupType: 2 })} />
          </div>
        )}
      </div>
      <div className="border-t border-white/15 py-3 text-center text-[10px] text-white/70">
        {version ? (
          <ItemControls entity="setting-shows" id={version.id} className="inline-block">
            <EditableText entity="setting-shows" id={version.id} field="title" value={version.title} required />
          </ItemControls>
        ) : editor ? (
          <AddButton label="Thêm dòng bản quyền" onClick={() => void editor.add({ kind: "copyright" })} />
        ) : (
          "Copyright © PORO Language Space"
        )}
      </div>
    </footer>
  );
};
