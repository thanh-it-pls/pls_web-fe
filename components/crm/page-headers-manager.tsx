"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDelete } from "@/components/crm/confirm-delete";
import { Field } from "@/components/crm/field";
import { SortableList } from "@/components/crm/sortable-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useResourceList, useResourceMutations } from "@/hooks/use-crud";
import { pageHeadersApi } from "@/lib/api/resources";
import type { PageHeader } from "@/lib/api/types";

const DOMAIN = { domain: "page-headers" };

const PageHeaderDialog = ({
  item,
  onClose,
}: {
  item: PageHeader | null;
  onClose: () => void;
}): React.JSX.Element => {
  const { create, update } = useResourceMutations(pageHeadersApi, DOMAIN);
  const [title, setTitle] = useState(item?.title ?? "");
  const [path, setPath] = useState(item?.path ?? "/");
  const pending = create.isPending || update.isPending;

  const submit = (): void => {
    const done = { onSuccess: onClose };
    if (item) update.mutate({ id: item.id, body: { title, path } }, done);
    else create.mutate({ title, path }, done);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Sửa trang" : "Thêm trang"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Tên trang (hiển thị trên menu)" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Đường dẫn" required hint="Ví dụ: /, /san-pham, /lien-he">
            <Input value={path} onChange={(e) => setPath(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={!title.trim() || !path.trim() || pending} onClick={submit}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Header page list with create/edit/delete, status toggle and drag & drop ordering. */
export const PageHeadersManager = (): React.JSX.Element => {
  const { data, isLoading } = useResourceList(pageHeadersApi, DOMAIN);
  const { remove, move, setStatus } = useResourceMutations(pageHeadersApi, DOMAIN);
  const [dialog, setDialog] = useState<{ item: PageHeader | null } | null>(null);

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialog({ item: null })}>
          <Plus /> Thêm trang
        </Button>
      </div>
      {isLoading && <Skeleton className="h-16" />}
      {data && data.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Chưa có trang nào.
        </p>
      )}
      {data && data.length > 0 && (
        <SortableList
          items={data}
          onMove={(id, body) => move.mutate({ id, body })}
          renderItem={(item) => (
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{item.path}</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                {item.status === 1 ? "Hiện" : "Ẩn"}
                <Switch
                  checked={item.status === 1}
                  onCheckedChange={(on) => setStatus.mutate({ id: item.id, status: on ? 1 : 0 })}
                />
              </label>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/content/${item.id}`}>
                  <Layers /> Nội dung
                </Link>
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setDialog({ item })} aria-label="Sửa">
                <Pencil />
              </Button>
              <ConfirmDelete onConfirm={() => remove.mutate(item.id)}>
                <Button variant="ghost" size="icon-sm" aria-label="Xoá">
                  <Trash2 className="text-destructive" />
                </Button>
              </ConfirmDelete>
            </div>
          )}
        />
      )}
      {dialog && <PageHeaderDialog key={dialog.item?.id ?? "new"} item={dialog.item} onClose={() => setDialog(null)} />}
    </div>
  );
};
