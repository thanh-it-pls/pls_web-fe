"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useResourceList } from "@/hooks/use-crud";
import { pageHeadersApi } from "@/lib/api/resources";

/** Grid of header pages; each links to that page's section editor. */
export const PageList = (): React.JSX.Element => {
  const { data, isLoading } = useResourceList(pageHeadersApi, { domain: "page-headers" });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {isLoading && <Skeleton className="h-20" />}
      {data?.length === 0 && (
        <p className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Chưa có trang nào. Hãy tạo trang ở mục “Trang quản lý”.
        </p>
      )}
      {data?.map((p) => (
        <Link
          key={p.id}
          href={`/admin/content/${p.id}`}
          className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{p.title}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{p.path}</p>
          </div>
          <Badge variant={p.status === 1 ? "success" : "secondary"}>{p.status === 1 ? "Hiện" : "Ẩn"}</Badge>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
};
