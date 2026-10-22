import { collageLayout, type CollageBox, type CollagePhoto } from "@/lib/site/collage";

/**
 * Hand-tuned layout of the Home hero photo collage (edit here, not in the API).
 *
 * One photo is the ANCHOR (`HERO_COLLAGE_ANCHOR`, 0-based; default ảnh 3 = dưới trái). Its top-left corner is
 * (0, 0). Every other photo is positioned relative to it with `dx` / `dy` (px in the 1920px Figma frame):
 * `dx` > 0 moves right, `dy` < 0 moves up. `w` / `h` are the photo size. The anchor's own `dx`/`dy` are ignored.
 *
 * The whole collage scales with its column, so the numbers are design pixels, not screen pixels.
 *
 * Gaps are explicit, which keeps them equal:
 *   ảnh 1 → anchor:   dy = -(h1 + GAP)          (nằm ngay trên anchor, cách GAP)
 *   ảnh 4 → anchor:   dx =  anchor.w + GAP      (nằm bên phải anchor)
 *   ảnh 2 → ảnh 4:    dy =  dy4 - (h2 + GAP)    (nằm ngay trên ảnh 4, cách GAP)
 */
export const HERO_GAP = 10;

export const HERO_COLLAGE_ANCHOR = 2;

export type HeroPhoto = CollagePhoto;

export const HERO_COLLAGE_ITEMS: HeroPhoto[] = [
  { w: 276, h: 230, dx: 51, dy: -(230 + HERO_GAP) }, //   ảnh 1 (trên trái)  — căn sát mép phải anchor
  { w: 230, h: 168, dx: 327 + 15, dy: -(168 + HERO_GAP) }, // ảnh 2 (trên phải) — ngay trên ảnh 4, cách HERO_GAP
  { w: 327, h: 276, dx: 0, dy: 0 }, //                    ảnh 3 (dưới trái)  — ANCHOR
  { w: 240, h: 235, dx: 327 + 15, dy: 0 }, //             ảnh 4 (dưới phải)  — cùng hàng với anchor, cách 15
];

/** Photos beyond the list above are shown below the collage with this tile class. */
export const HERO_EXTRA_IMAGE_CLASS = "aspect-[4/3]";

/** Shared look of every photo tile. */
export const HERO_IMAGE_BASE_CLASS = "overflow-hidden rounded-xl border-2 border-white shadow-lg";

/** Percentage boxes for the collage, derived from the numbers above. */
export const heroCollageLayout = (): { aspectRatio: string; boxes: CollageBox[] } =>
  collageLayout(HERO_COLLAGE_ITEMS, HERO_COLLAGE_ANCHOR);
