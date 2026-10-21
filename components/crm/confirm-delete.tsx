"use client";

import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/** Wraps a trigger element with a delete confirmation dialog. */
export const ConfirmDelete = ({
  children,
  title = "Xác nhận xoá?",
  description = "Hành động này không thể hoàn tác.",
  onConfirm,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  onConfirm: () => void;
}): React.JSX.Element => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Huỷ</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Xoá</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
