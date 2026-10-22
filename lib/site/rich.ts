/**
 * Inline-styled text. Texts of sections / cards / contents may contain
 * `<span style="color:#hex;font-weight:700">…</span>` (colour and/or weight); newlines are plain "\n".
 * Everything else is stripped, so the HTML is safe to render.
 */

const TAG_RE = /<\/?[a-z][^>]*>/gi;
const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.\s,%]+\)|hsla?\(\s*[\d.\s,%deg]+\)|[a-z]{3,20})$/i;
const STYLE_COLOR_RE = /(?:^|;)\s*color\s*:\s*([^;]+)/i;
const STYLE_WEIGHT_RE = /(?:^|;)\s*font-weight\s*:\s*([^;]+)/i;

/** True when the value carries style markup (plain strings keep being rendered as text). */
export const hasRich = (value: string): boolean => /<(?:span|b|strong)\b/i.test(value);

/** Normalise a CSS font-weight to 700 (bold) / 400 (normal), or null when unknown. */
const weightOf = (raw: string | undefined | null): 400 | 700 | null => {
  const w = (raw ?? "").trim().toLowerCase();
  if (w === "bold" || w === "bolder") return 700;
  if (w === "normal" || w === "lighter") return 400;
  const n = Number(w);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n >= 600 ? 700 : 400;
};

const styleOf = (color: string | null, weight: 400 | 700 | null): string | null => {
  const parts = [color ? `color:${color}` : null, weight ? `font-weight:${weight}` : null].filter(Boolean);
  return parts.length ? parts.join(";") : null;
};

const escapeText = (text: string): string =>
  text.replace(/&(?!(?:#\d+|#x[0-9a-f]+|[a-z]+);)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const unescapeText = (html: string): string =>
  html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** Keep only `<span style="color/font-weight">` (validated; `<b>` becomes a bold span) and newlines; escape the rest. */
export const sanitizeRich = (input: string): string => {
  let out = "";
  let last = 0;
  const open: boolean[] = [];
  for (const match of input.matchAll(TAG_RE)) {
    const at = match.index ?? 0;
    out += escapeText(input.slice(last, at));
    last = at + match[0].length;
    const tag = match[0];
    if (/^<br\b/i.test(tag)) {
      out += "\n";
    } else if (/^<\/(?:span|b|strong)\b/i.test(tag)) {
      if (open.pop()) out += "</span>";
    } else if (/^<(?:b|strong)\b/i.test(tag)) {
      out += '<span style="font-weight:700">';
      open.push(true);
    } else if (/^<span\b/i.test(tag)) {
      const style = /style\s*=\s*"([^"]*)"/i.exec(tag) ?? /style\s*=\s*'([^']*)'/i.exec(tag);
      const rawColor = style ? STYLE_COLOR_RE.exec(style[1])?.[1].trim() : undefined;
      const color = rawColor && COLOR_RE.test(rawColor) ? rawColor.toLowerCase() : null;
      const css = styleOf(color, style ? weightOf(STYLE_WEIGHT_RE.exec(style[1])?.[1]) : null);
      if (css) {
        out += `<span style="${css}">`;
        open.push(true);
      } else {
        open.push(false);
      }
    }
  }
  out += escapeText(input.slice(last));
  open.forEach((kept) => {
    if (kept) out += "</span>";
  });
  return out;
};

/** Text without any markup (for alt attributes, labels). */
export const toPlain = (value: string | null | undefined): string =>
  value ? unescapeText(sanitizeRich(value).replace(/<[^>]+>/g, "")) : "";

const rgbToHex = (color: string): string | null => {
  const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color);
  if (m) return `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
  if (/^#[0-9a-f]{3,8}$/i.test(color)) return color.toLowerCase();
  return /^[a-z]{3,20}$/i.test(color) ? color.toLowerCase() : null;
};

/** Browser-only: turn the edited DOM into the stored string (style spans + "\n"). */
export const serializeRich = (root: HTMLElement): string => {
  let out = "";
  const walk = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += escapeText((node.textContent ?? "").replace(/\u00a0/g, " "));
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.tagName === "BR") {
      out += "\n";
      return;
    }
    if ((node.tagName === "DIV" || node.tagName === "P") && out && !out.endsWith("\n")) out += "\n";
    let color: string | null = null;
    let weight: 400 | 700 | null = null;
    if (node.tagName === "SPAN") {
      if (node.style.color) color = rgbToHex(node.style.color);
      weight = weightOf(node.style.fontWeight);
    } else if (node.tagName === "FONT") {
      color = rgbToHex(node.getAttribute("color") ?? "");
    } else if (node.tagName === "B" || node.tagName === "STRONG") {
      weight = 700;
    }
    const css = styleOf(color, weight);
    if (css) out += `<span style="${css}">`;
    node.childNodes.forEach(walk);
    if (css) out += "</span>";
  };
  root.childNodes.forEach(walk);
  const html = out.replace(/<span style="[^"]*"><\/span>/g, "").replace(/\s+$/, "");
  // Plain strings stay plain (no escaping) so legacy values keep rendering as text.
  return hasRich(html) ? html : unescapeText(html);
};
