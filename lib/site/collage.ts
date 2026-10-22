/** A photo in a collage, in design pixels, positioned relative to the anchor photo's top-left corner. */
export interface CollagePhoto {
  w: number;
  h: number;
  /** Offset from the anchor's left edge (> 0 = right). */
  dx: number;
  /** Offset from the anchor's top edge (< 0 = up). */
  dy: number;
}

export interface CollageBox {
  left: string;
  top: string;
  width: string;
  height: string;
}

/**
 * Turn relative design-pixel offsets into percentage boxes inside one box of `aspectRatio` ("w / h"),
 * so the whole collage scales with its column. The anchor's own dx/dy are forced to 0.
 */
export const collageLayout = (
  photos: CollagePhoto[],
  anchor: number,
): { aspectRatio: string; boxes: CollageBox[] } => {
  const items = photos.map((p, i) => (i === anchor ? { ...p, dx: 0, dy: 0 } : p));
  const minX = Math.min(...items.map((p) => p.dx));
  const minY = Math.min(...items.map((p) => p.dy));
  const width = Math.max(...items.map((p) => p.dx + p.w)) - minX;
  const height = Math.max(...items.map((p) => p.dy + p.h)) - minY;
  const pct = (n: number, of: number): string => `${(n / of) * 100}%`;
  return {
    aspectRatio: `${width} / ${height}`,
    boxes: items.map((p) => ({
      left: pct(p.dx - minX, width),
      top: pct(p.dy - minY, height),
      width: pct(p.w, width),
      height: pct(p.h, height),
    })),
  };
};
