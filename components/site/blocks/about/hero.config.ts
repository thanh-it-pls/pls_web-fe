import { collageLayout, type CollageBox, type CollagePhoto } from "@/lib/site/collage";

/**
 * Hand-tuned layout of the About hero photo collage (edit here, not in the API). Same model as the Home hero
 * but configured separately: one ANCHOR photo (`ABOUT_HERO_ANCHOR`, 0-based; ảnh 3 = dưới trái) sits at (0, 0),
 * every other photo is placed with `dx` / `dy` relative to it (design px of the 1920px Figma frame;
 * `dy` < 0 = above the anchor). The collage scales with its column.
 *
 * Measured from Figma "Về chúng tôi" (collage ≈ 663×624):
 *
 *   ảnh 1 (trên trái)  372×351  căn sát mép phải anchor, cách anchor 12
 *   ảnh 2 (trên phải)  276×225  cách ảnh 4 theo ABOUT_HERO_GAP (Figma gốc ≈ 45, đặt = gap cho đều)
 *   ảnh 3 (dưới trái)  300×261  ANCHOR
 *   ảnh 4 (dưới phải)  177×171  cách anchor 15 theo chiều ngang
 */
export const ABOUT_HERO_GAP = 12;
export const ABOUT_HERO_COLUMN_GAP = 15;

export const ABOUT_HERO_ANCHOR = 2;

export const ABOUT_HERO_ITEMS: CollagePhoto[] = [
  { w: 372, h: 351, dx: 300 - 372, dy: -(351 + ABOUT_HERO_GAP) }, //                    ảnh 1 (trên trái)
  { w: 276, h: 225, dx: 300 + ABOUT_HERO_COLUMN_GAP, dy: -(225 + ABOUT_HERO_GAP) }, //   ảnh 2 (trên phải) — ngay trên ảnh 4
  { w: 300, h: 261, dx: 0, dy: 0 }, //                                                  ảnh 3 (dưới trái) — ANCHOR
  { w: 177, h: 171, dx: 300 + ABOUT_HERO_COLUMN_GAP, dy: 0 }, //                         ảnh 4 (dưới phải)
];

/** Photos beyond the list above are shown below the collage with this tile class. */
export const ABOUT_HERO_EXTRA_IMAGE_CLASS = "aspect-[4/3]";

/** Shared look of every photo tile. */
export const ABOUT_HERO_IMAGE_BASE_CLASS = "overflow-hidden rounded-lg border-2 border-white shadow-lg";

/** Percentage boxes for the collage, derived from the numbers above. */
export const aboutHeroCollageLayout = (): { aspectRatio: string; boxes: CollageBox[] } =>
  collageLayout(ABOUT_HERO_ITEMS, ABOUT_HERO_ANCHOR);
