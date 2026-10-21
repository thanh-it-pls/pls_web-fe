"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2 } from "lucide-react";

import { AddSectionDialog } from "@/components/content/add-section-dialog";
import { ConfirmDelete } from "@/components/crm/confirm-delete";
import { SortableList } from "@/components/crm/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useResourceList, useResourceMutations } from "@/hooks/use-crud";
import { sectionsApi } from "@/lib/api/resources";
import { SECTION_TYPE_LABEL, type Section } from "@/lib/api/types";

const DOMAIN = { domain: "sections" };

/** Sections of a page: drag to reorder, toggle visibility, open to edit cards & contents. */
export const SectionList = ({ pageId }: { pageId: string }): React.JSX.Element => {
  const { data, isLoading } = useResourceList(sectionsApi, DOMAIN, { parent_id: pageId });
  const { remove, move, setStatus } = useResourceMutations(sectionsApi, DOMAIN);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus /> Thêm section
        </Button>
      </div>
      {isLoading && <Skeleton className="h-16" />}
      {data?.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Trang này chưa có section nào.
        </p>
      )}
      {data && data.length > 0 && (
        <SortableList
          items={data}
          onMove={(id, body) => move.mutate({ id, body })}
          renderItem={(s: Section) => (
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Link href={`/admin/content/${pageId}/${s.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.title || "(Chưa đặt tên)"}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{s.code}</p>
                </div>
                <Badge variant="outline">{SECTION_TYPE_LABEL[s.type]}</Badge>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                {s.status === 1 ? "Hiện" : "Ẩn"}
                <Switch
                  checked={s.status === 1}
                  onCheckedChange={(on) => setStatus.mutate({ id: s.id, status: on ? 1 : 0 })}
                />
              </label>
              <ConfirmDelete
                description="Xoá section sẽ xoá luôn các card và content bên trong."
                onConfirm={() => remove.mutate(s.id)}
              >
                <Button variant="ghost" size="icon-sm" aria-label="Xoá">
                  <Trash2 className="text-destructive" />
                </Button>
              </ConfirmDelete>
            </div>
          )}
        />
      )}
      {creating && <AddSectionDialog pageId={pageId} onClose={() => setCreating(false)} />}
    </>
  );
};
