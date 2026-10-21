"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { PageCanvas } from "@/components/content/page-canvas";
import { SectionList } from "@/components/content/section-list";
import { PageTitle } from "@/components/crm/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPageHeader } from "@/lib/site/data";

/** One page's content: live canvas (WYSIWYG) or plain list of sections for sorting / structure. */
export const PageContentView = ({ pageId }: { pageId: string }): React.JSX.Element => {
  const page = useQuery({ queryKey: ["page-headers", "detail", pageId], queryFn: () => getPageHeader(pageId) });
  return (
    <>
      <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
        <Link href="/admin/content">
          <ArrowLeft /> Danh sách trang
        </Link>
      </Button>
      <PageTitle title={page.data?.title ?? "Trang"} description={page.data ? `Đường dẫn ${page.data.path}` : undefined} />
      <Tabs defaultValue="canvas" className="grid gap-4">
        <TabsList>
          <TabsTrigger value="canvas">Giao diện</TabsTrigger>
          <TabsTrigger value="list">Danh sách section</TabsTrigger>
        </TabsList>
        <TabsContent value="canvas">
          <PageCanvas pageId={pageId} />
        </TabsContent>
        <TabsContent value="list">
          <SectionList pageId={pageId} />
        </TabsContent>
      </Tabs>
    </>
  );
};
