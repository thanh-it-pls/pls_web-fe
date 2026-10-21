"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/client";
import { ABOUT_PAGE_ORDER, TEMPLATES, createSectionFromTemplate, type TemplateKey } from "@/lib/site/templates";
import { Button } from "@/components/ui/button";

/** Pick a layout template; creates the section with default cards/contents (code is auto-generated). */
export const AddSectionDialog = ({ pageId, onClose }: { pageId: string; onClose: () => void }): React.JSX.Element => {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (label: string, keys: TemplateKey[]): Promise<void> => {
    setBusy(label);
    try {
      for (const key of keys) await createSectionFromTemplate(key, pageId);
      await qc.invalidateQueries();
      toast.success("Đã tạo");
      onClose();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.detail : "Không tạo được section");
      await qc.invalidateQueries();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm section</DialogTitle>
          <DialogDescription>Chọn mẫu giao diện. Nội dung mẫu có thể sửa trực tiếp sau khi tạo.</DialogDescription>
        </DialogHeader>
        <Button variant="outline" disabled={!!busy} onClick={() => void run("all", ABOUT_PAGE_ORDER)} className="justify-start">
          {busy === "all" && <Loader2 className="animate-spin" />}
          Tạo cả trang “Về chúng tôi” theo Figma ({ABOUT_PAGE_ORDER.length} section)
        </Button>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.values(TEMPLATES).map((t) => (
            <button
              key={t.key}
              type="button"
              disabled={!!busy}
              onClick={() => void run(t.key, [t.key])}
              className="flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              {busy === t.key && <Loader2 className="size-4 animate-spin" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
