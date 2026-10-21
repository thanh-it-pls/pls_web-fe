"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ImageIcon, Link2, Trash2 } from "lucide-react";

import { ConfirmDelete } from "@/components/crm/confirm-delete";
import { Field } from "@/components/crm/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Content } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export type Entity = "sections" | "cards" | "contents" | "setting-shows" | "footer-sections" | "footer-items";
export type RemovableEntity = Exclude<Entity, "sections">;

/** Things the header / footer let you create in place. */
export type SiteAdd =
  | { kind: "logo" | "copyright" | "social" | "contact" | "header-logo" | "header-button" | "header-social" }
  | { kind: "group"; groupType: 1 | 2 }
  | { kind: "item"; groupId: string; itemType: 1 | 2 | 3 | 4 | 5 };

/** Provided by the CRM canvas. When absent (public site) every editable renders as plain content. */
export interface EditorApi {
  /** Resolves true when saved, false when the API rejected it. */
  save: (entity: Entity, id: string, patch: Record<string, string | null>) => Promise<boolean>;
  remove: (entity: RemovableEntity, id: string) => Promise<void>;
  /** Header / footer: create a setting, group or item. */
  add: (what: SiteAdd) => Promise<void>;
  setStatus: (entity: "footer-sections", id: string, status: 0 | 1) => Promise<void>;
}

const EditorContext = createContext<EditorApi | null>(null);
export const EditorProvider = EditorContext.Provider;
export const useEditor = (): EditorApi | null => useContext(EditorContext);

interface EditableTextProps {
  entity: Entity;
  id: string;
  field: string;
  value: string | null | undefined;
  /** Shown (edit mode only) while empty. */
  placeholder?: string;
  multiline?: boolean;
  /** Required API fields (e.g. title) cannot be cleared; an empty edit reverts. */
  required?: boolean;
  as?: React.ElementType;
  className?: string;
}

/** Text that is click-to-edit inside the CRM canvas and plain text on the public site. */
export const EditableText = ({
  entity,
  id,
  field,
  value,
  placeholder = "Nhập nội dung…",
  multiline = false,
  required = false,
  as: Tag = "span",
  className,
}: EditableTextProps): React.JSX.Element | null => {
  const editor = useEditor();
  if (!editor) {
    return value ? <Tag className={cn(multiline && "whitespace-pre-line", className)}>{value}</Tag> : null;
  }

  const commit = async (el: HTMLElement): Promise<void> => {
    const text = el.innerText.replace(/ /g, " ").trim();
    if (text === (value ?? "")) return;
    if (text === "" && required) {
      el.innerText = value ?? "";
      return;
    }
    const ok = await editor.save(entity, id, { [field]: text === "" ? null : text });
    if (!ok) el.innerText = value ?? "";
  };

  return (
    <Tag
      // Remount on external value change so React never diffs against DOM the browser edited.
      key={value ?? ""}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      className={cn(
        "cursor-text rounded-sm outline-1 outline-offset-2 outline-transparent transition-[outline-color] hover:outline-dashed hover:outline-sky-400 focus:outline-2 focus:outline-solid focus:outline-sky-500 empty:before:opacity-50 empty:before:content-[attr(data-placeholder)]",
        multiline && "whitespace-pre-line",
        className,
      )}
      onBlur={(e: React.FocusEvent<HTMLElement>) => void commit(e.currentTarget)}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Escape") {
          e.currentTarget.innerText = value ?? "";
          e.currentTarget.blur();
        } else if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    >
      {value ?? ""}
    </Tag>
  );
};

/** Small dialog to edit a single URL-like value (image src, link). */
export const ValueDialog = ({
  title,
  label,
  value,
  preview = false,
  onSave,
  onClose,
}: {
  title: string;
  label: string;
  value: string | null;
  preview?: boolean;
  onSave: (value: string | null) => Promise<boolean>;
  onClose: () => void;
}): React.JSX.Element => {
  const [text, setText] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (next: string | null): Promise<void> => {
    setSaving(true);
    const ok = await onSave(next);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Field label={label}>
          <Input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="https://…" />
        </Field>
        {preview && text && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={text} alt="Xem trước" className="max-h-56 w-full rounded-md border bg-muted object-contain" />
        )}
        <DialogFooter>
          {value && (
            <Button variant="outline" disabled={saving} onClick={() => void submit(null)} className="sm:mr-auto">
              Xoá
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={saving || text.trim() === (value ?? "")} onClick={() => void submit(text.trim() || null)}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditableImageProps {
  entity: Entity;
  id: string;
  field?: string;
  value: string | null | undefined;
  alt?: string;
  /** Sizing / shape of the wrapper. */
  className?: string;
  imgClassName?: string;
  /** Rendered in edit mode when there is no image. */
  emptyLabel?: string;
  /** Rendered on the public site when there is no image. */
  fallback?: ReactNode;
}

/** Image that can be swapped via URL inside the CRM canvas; plain <img> on the public site. */
export const EditableImage = ({
  entity,
  id,
  field = "img",
  value,
  alt = "",
  className,
  imgClassName = "h-full w-full object-cover",
  emptyLabel = "Thêm ảnh",
  fallback = null,
}: EditableImageProps): React.JSX.Element | null => {
  const editor = useEditor();
  const [open, setOpen] = useState(false);

  if (!editor) {
    return value ? (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt={alt} className={imgClassName} />
      </div>
    ) : (
      <>{fallback}</>
    );
  }

  return (
    <div className={cn("group/img relative", className)}>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt={alt} className={imgClassName} />
      ) : (
        <div className="grid h-full w-full place-items-center gap-1 overflow-hidden rounded-[inherit] border-2 border-dashed border-current/30 bg-black/5 p-1 text-center text-xs opacity-70">
          <ImageIcon className="size-5" />
          {emptyLabel}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute inset-0 z-10 grid cursor-pointer place-items-center rounded-[inherit] bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover/img:opacity-100"
      >
        <span className="flex items-center gap-1">
          <ImageIcon className="size-4" /> {value ? "Đổi ảnh" : emptyLabel}
        </span>
      </button>
      {open && (
        <ValueDialog
          title="Đổi hình ảnh"
          label="URL hình ảnh"
          value={value ?? null}
          preview
          onSave={(v) => editor.save(entity, id, { [field]: v })}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

/** BUTTON content: label editable inline, link editable via a small icon. */
export const EditableButton = ({
  content,
  className,
}: {
  content: Content | undefined;
  className?: string;
}): React.JSX.Element | null => {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  if (!content) return null;

  if (!editor) {
    return (
      <a href={content.link ?? "#"} className={className}>
        {content.title}
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={className}>
        <EditableText entity="contents" id={content.id} field="title" value={content.title} required />
      </span>
      <button
        type="button"
        aria-label="Sửa liên kết"
        title={content.link ? `Liên kết: ${content.link}` : "Thêm liên kết"}
        onClick={() => setOpen(true)}
        className="grid size-6 cursor-pointer place-items-center rounded-full bg-sky-500 text-white"
      >
        <Link2 className="size-3.5" />
      </button>
      {open && (
        <ValueDialog
          title="Liên kết của nút"
          label="URL"
          value={content.link}
          onSave={(v) => editor.save("contents", content.id, { link: v })}
          onClose={() => setOpen(false)}
        />
      )}
    </span>
  );
};

/** Wraps a repeated item (card / content) with a hover delete control in edit mode. */
export const ItemControls = ({
  entity,
  id,
  className,
  children,
}: {
  entity: RemovableEntity;
  id: string;
  className?: string;
  children: ReactNode;
}): React.JSX.Element => {
  const editor = useEditor();
  if (!editor) return <div className={className}>{children}</div>;
  return (
    <div className={cn("group/item relative", className)}>
      {children}
      <ConfirmDelete onConfirm={() => void editor.remove(entity, id)}>
        <button
          type="button"
          aria-label="Xoá mục này"
          className="absolute -top-2 -right-2 z-20 grid size-6 cursor-pointer place-items-center rounded-full bg-destructive text-white opacity-0 shadow transition-opacity group-hover/item:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      </ConfirmDelete>
    </div>
  );
};

/** Small round link icon (edit mode only) that edits an entity's `link` field. */
export const LinkEdit = ({
  entity,
  id,
  link,
  title = "Sửa liên kết",
}: {
  entity: Entity;
  id: string;
  link: string | null;
  title?: string;
}): React.JSX.Element | null => {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  if (!editor) return null;
  return (
    <>
      <button
        type="button"
        aria-label={title}
        title={link ? `Liên kết: ${link}` : "Thêm liên kết"}
        onClick={() => setOpen(true)}
        className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-full bg-sky-500 text-white"
      >
        <Link2 className="size-3" />
      </button>
      {open && (
        <ValueDialog
          title={title}
          label="URL / giá trị"
          value={link}
          onSave={(v) => editor.save(entity, id, { link: v })}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
