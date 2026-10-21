"use client";

import { useState, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type { MovePayload } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface OrderedItem {
  id: string;
  order: string;
}

interface SortableListProps<T extends OrderedItem> {
  items: T[];
  /** Called after a drop with the neighbours' `order` values, as the API's /move expects. */
  onMove: (id: string, payload: MovePayload) => void;
  renderItem: (item: T) => ReactNode;
  className?: string;
}

const SortableRow = ({ id, children }: { id: string; children: ReactNode }): React.JSX.Element => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-start gap-2", isDragging && "relative z-10 opacity-80")}
    >
      <button
        type="button"
        aria-label="Kéo để sắp xếp"
        className="mt-3 shrink-0 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-accent active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

/** Vertical drag & drop list that keeps a local order optimistically and reports API move payloads. */
export const SortableList = <T extends OrderedItem>({
  items,
  onMove,
  renderItem,
  className,
}: SortableListProps<T>): React.JSX.Element => {
  const [local, setLocal] = useState<T[]>(items);
  const [prevItems, setPrevItems] = useState<T[]>(items);
  // Re-sync from the server data whenever it changes (derive state during render, not in an effect).
  if (items !== prevItems) {
    setPrevItems(items);
    setLocal(items);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (!over || active.id === over.id) return;
    const from = local.findIndex((i) => i.id === active.id);
    const to = local.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    const next = arrayMove(local, from, to);
    setLocal(next);
    onMove(String(active.id), {
      prev_order: next[to - 1]?.order ?? null,
      next_order: next[to + 1]?.order ?? null,
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={local.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={cn("grid gap-3", className)}>
          {local.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
