"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** Index state + wrap-around navigation for slider blocks. */
export const useSlider = (length: number) => {
  const [raw, setIndex] = useState(0);
  const index = length === 0 ? 0 : Math.min(raw, length - 1);
  return {
    index,
    prev: (): void => setIndex((index - 1 + length) % Math.max(length, 1)),
    next: (): void => setIndex((index + 1) % Math.max(length, 1)),
    go: setIndex,
  };
};

/** Round red arrow used by sliders. */
export const SliderArrow = ({
  dir,
  onClick,
  className,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  className?: string;
}): React.JSX.Element => (
  <button
    type="button"
    aria-label={dir === "prev" ? "Trước" : "Sau"}
    onClick={onClick}
    className={cn("grid size-7 cursor-pointer place-items-center rounded-full bg-[#c0272d] text-white shadow", className)}
  >
    {dir === "prev" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
  </button>
);

/** Pagination dots under a slider. */
export const SliderDots = ({
  count,
  index,
  onGo,
}: {
  count: number;
  index: number;
  onGo: (i: number) => void;
}): ReactNode =>
  count > 1 && (
    <div className="mt-4 flex justify-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Slide ${i + 1}`}
          onClick={() => onGo(i)}
          className={cn(
            "h-1.5 cursor-pointer rounded-full transition-all",
            i === index ? "w-5 bg-[#c0272d]" : "w-1.5 bg-neutral-300",
          )}
        />
      ))}
    </div>
  );
