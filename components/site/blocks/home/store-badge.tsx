import { EditableImage, ItemControls, LinkEdit, useEditor } from "@/components/site/editor";
import type { Content } from "@/lib/api/types";

/** DOWNLOAD (8) content: store badge image (`img`) linking to `link`; falls back to a text pill. */
export const StoreBadge = ({
  item,
  className = "h-8",
  fill = false,
}: {
  item: Content;
  className?: string;
  /** Stretch to the width of the grid cell (used by product cards). */
  fill?: boolean;
}): React.JSX.Element => {
  const editor = useEditor();
  const fallback = (
    <span className={`inline-flex h-full items-center rounded-md bg-black px-2.5 text-[10px] font-semibold text-white ${fill ? "w-full justify-center" : ""}`}>{item.title}</span>
  );
  return (
    <ItemControls entity="contents" id={item.id} className={`flex items-center gap-1 ${fill ? "min-w-0" : ""}`}>
      {editor ? (
        <EditableImage
          entity="contents"
          id={item.id}
          value={item.img}
          alt={item.title}
          className={`${className} ${fill ? "min-w-0 flex-1" : "min-w-20"}`}
          imgClassName="h-full w-auto object-contain"
          emptyLabel={item.title}
        />
      ) : (
        <a href={item.link ?? "#"} className={`block ${className} ${fill ? "w-full" : ""}`}>
          {item.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.img} alt={item.title} className="h-full w-auto object-contain" />
          ) : (
            fallback
          )}
        </a>
      )}
      <LinkEdit entity="contents" id={item.id} link={item.link} title="Liên kết cửa hàng ứng dụng" />
    </ItemControls>
  );
};
