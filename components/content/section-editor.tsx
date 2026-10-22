"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";

import { BackgroundSelect } from "@/components/content/background-picker";
import { CardItem } from "@/components/content/card-item";
import { CardDialog } from "@/components/content/entity-dialogs";
import { Field } from "@/components/crm/field";
import { PageTitle } from "@/components/crm/page-header";
import { SortableList } from "@/components/crm/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useResourceList, useResourceMutations } from "@/hooks/use-crud";
import { cardsApi, sectionsApi } from "@/lib/api/resources";
import { SECTION_TYPE_LABEL, SectionType, type Section } from "@/lib/api/types";
import { nullable } from "@/lib/utils";

const SectionForm = ({ section }: { section: Section }): React.JSX.Element => {
  const { update } = useResourceMutations(sectionsApi, { domain: "sections" });
  const [title, setTitle] = useState(section.title ?? "");
  const [des, setDes] = useState(section.des ?? "");
  const [background, setBackground] = useState(section.background ?? "");
  return (
    <div className="mb-8 grid gap-4 rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Thông tin section</h2>
        <Badge variant="outline">{SECTION_TYPE_LABEL[section.type]}</Badge>
      </div>
      <Field label="Tên section">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Mô tả">
        <Textarea value={des} onChange={(e) => setDes(e.target.value)} />
      </Field>
      <Field label="Nền" hint="Các section liền nhau chọn cùng một nền sẽ dùng chung nền đó. Thêm nền ở Tổng quan.">
        <BackgroundSelect value={background} onChange={setBackground} />
      </Field>
      <div className="flex justify-end">
        <Button
          disabled={update.isPending}
          onClick={() =>
            update.mutate({
              id: section.id,
              body: { title: nullable(title), des: nullable(des), background: nullable(background) },
            })
          }
        >
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
};

/** Section detail: edit fields, then list cards (drag to reorder, expand for contents). */
export const SectionEditor = ({ pageId, sectionId }: { pageId: string; sectionId: string }): React.JSX.Element => {
  const section = useQuery({ queryKey: ["sections", "detail", sectionId], queryFn: () => sectionsApi.get(sectionId) });
  const { data: cards, isLoading } = useResourceList(cardsApi, { domain: "cards" }, { parent: sectionId });
  const { move } = useResourceMutations(cardsApi, { domain: "cards" });
  const [adding, setAdding] = useState(false);

  // A BACKGROUND section may hold only one card; the API rejects more with 400.
  const canAddCard = section.data?.type !== SectionType.BACKGROUND || (cards?.length ?? 0) === 0;

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
        <Link href={`/admin/content/${pageId}`}>
          <ArrowLeft /> Danh sách section
        </Link>
      </Button>
      <PageTitle title={section.data?.title || "Section"} description={section.data?.code} />
      {section.isLoading && <Skeleton className="mb-8 h-64" />}
      {section.data && <SectionForm key={section.data.id + section.dataUpdatedAt} section={section.data} />}

      <PageTitle
        title="Cards"
        description={
          section.data?.type === SectionType.BACKGROUND
            ? "Section background chỉ có 1 card."
            : "Kéo thả để đổi thứ tự card. Mở card để quản lý content."
        }
        actions={
          canAddCard && (
            <Button onClick={() => setAdding(true)}>
              <Plus /> Thêm card
            </Button>
          )
        }
      />
      {isLoading && <Skeleton className="h-16" />}
      {cards?.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Section chưa có card nào.
        </p>
      )}
      {cards && cards.length > 0 && (
        <SortableList
          items={cards}
          onMove={(id, body) => move.mutate({ id, body })}
          renderItem={(card) => <CardItem card={card} />}
        />
      )}
      {adding && <CardDialog sectionId={sectionId} item={null} onClose={() => setAdding(false)} />}
    </>
  );
};
