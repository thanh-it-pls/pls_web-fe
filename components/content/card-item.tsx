"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

import { CardDialog, ContentDialog } from "@/components/content/entity-dialogs";
import { ConfirmDelete } from "@/components/crm/confirm-delete";
import { SortableList } from "@/components/crm/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useResourceList, useResourceMutations } from "@/hooks/use-crud";
import { cardsApi, contentsApi } from "@/lib/api/resources";
import { CONTENT_TYPE_LABEL, type Card, type Content } from "@/lib/api/types";

const ContentRow = ({ content }: { content: Content }): React.JSX.Element => {
  const { remove, setStatus } = useResourceMutations(contentsApi, { domain: "contents" });
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background p-2.5">
      {content.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={content.img} alt="" className="size-9 rounded border bg-muted object-cover" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{content.title}</p>
        {content.des && <p className="truncate text-xs text-muted-foreground">{content.des}</p>}
      </div>
      <Badge variant="outline">{CONTENT_TYPE_LABEL[content.type]}</Badge>
      <Switch
        checked={content.status === 1}
        onCheckedChange={(on) => setStatus.mutate({ id: content.id, status: on ? 1 : 0 })}
        aria-label="Hiện / ẩn"
      />
      <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label="Sửa">
        <Pencil />
      </Button>
      <ConfirmDelete onConfirm={() => remove.mutate(content.id)}>
        <Button variant="ghost" size="icon-sm" aria-label="Xoá">
          <Trash2 className="text-destructive" />
        </Button>
      </ConfirmDelete>
      {editing && <ContentDialog cardId={content.parent} item={content} onClose={() => setEditing(false)} />}
    </div>
  );
};

const ContentList = ({ cardId }: { cardId: string }): React.JSX.Element => {
  const { data, isLoading } = useResourceList(contentsApi, { domain: "contents" }, { parent: cardId });
  const { move } = useResourceMutations(contentsApi, { domain: "contents" });
  const [adding, setAdding] = useState(false);

  return (
    <div className="grid gap-3 border-t bg-muted/40 p-3">
      {isLoading && <Skeleton className="h-10" />}
      {data?.length === 0 && <p className="text-center text-xs text-muted-foreground">Card chưa có content.</p>}
      {data && data.length > 0 && (
        <SortableList
          items={data}
          className="gap-2"
          onMove={(id, body) => move.mutate({ id, body })}
          renderItem={(c) => <ContentRow content={c} />}
        />
      )}
      <Button variant="outline" size="sm" className="w-fit" onClick={() => setAdding(true)}>
        <Plus /> Thêm content
      </Button>
      {adding && <ContentDialog cardId={cardId} item={null} onClose={() => setAdding(false)} />}
    </div>
  );
};

/** A card row: expand to manage its contents (drag to reorder), edit, toggle, delete. */
export const CardItem = ({ card }: { card: Card }): React.JSX.Element => {
  const { remove, setStatus } = useResourceMutations(cardsApi, { domain: "cards" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
        >
          {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{card.title}</p>
            {card.subtitle && <p className="truncate text-xs text-muted-foreground">{card.subtitle}</p>}
          </div>
        </button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {card.status === 1 ? "Hiện" : "Ẩn"}
          <Switch
            checked={card.status === 1}
            onCheckedChange={(on) => setStatus.mutate({ id: card.id, status: on ? 1 : 0 })}
          />
        </label>
        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label="Sửa">
          <Pencil />
        </Button>
        <ConfirmDelete description="Xoá card sẽ xoá luôn các content bên trong." onConfirm={() => remove.mutate(card.id)}>
          <Button variant="ghost" size="icon-sm" aria-label="Xoá">
            <Trash2 className="text-destructive" />
          </Button>
        </ConfirmDelete>
      </div>
      {open && <ContentList cardId={card.id} />}
      {editing && <CardDialog sectionId={card.parent} item={card} onClose={() => setEditing(false)} />}
    </div>
  );
};
