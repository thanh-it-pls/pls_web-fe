import type { CSSProperties } from "react";

import { SettingType, type SettingShow } from "@/lib/api/types";

export interface ResolvedBackground {
  kind: "image" | "color";
  value: string;
}

const COLOR_RE = /^(#[0-9a-f]{3,8}$|rgba?\(|hsla?\(|oklch\()/i;

export const isColor = (value?: string | null): value is string => !!value && COLOR_RE.test(value.trim());

/** COLOR (7) setting: the `color` field (older rows may still keep it in `link`, `img`, `title` or `code`). */
export const colorOf = (s: SettingShow): string | null =>
  [s.color, s.link, s.img, s.title, s.code].find(isColor)?.trim() ?? null;

/** BACKGROUND (6) setting: image URL in `img` (falls back to a non-colour `link`). */
export const imageOf = (s: SettingShow): string | null => s.img ?? (s.link && !isColor(s.link) ? s.link : null);

/**
 * `section.background` holds a setting-show id (BACKGROUND image or COLOR). Legacy raw colour / URL strings
 * are still understood so old data keeps working.
 */
export const resolveBackground = (
  value: string | null | undefined,
  settings: SettingShow[],
): ResolvedBackground | null => {
  if (!value) return null;
  const setting = settings.find((s) => s.id === value);
  if (setting) {
    if (setting.type === SettingType.COLOR) {
      const color = colorOf(setting);
      return color ? { kind: "color", value: color } : null;
    }
    if (setting.type === SettingType.BACKGROUND) {
      const image = imageOf(setting);
      if (image) return { kind: "image", value: image };
      const color = colorOf(setting);
      return color ? { kind: "color", value: color } : null;
    }
    return null;
  }
  return isColor(value) ? { kind: "color", value: value.trim() } : { kind: "image", value };
};

export const backgroundStyle = (bg: ResolvedBackground): CSSProperties =>
  bg.kind === "color"
    ? { backgroundColor: bg.value }
    : { backgroundImage: `url("${bg.value}")`, backgroundSize: "cover", backgroundPosition: "center" };
