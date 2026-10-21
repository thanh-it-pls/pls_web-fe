"use client";

import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import type { ListParams, Resource } from "@/lib/api/resources";
import type { MovePayload, StatusValue } from "@/lib/api/types";

interface CrudOptions {
  /** Query-key domain, e.g. "sections". */
  domain: string;
}

const onError = (error: unknown): void => {
  toast.error(error instanceof ApiError ? error.detail : "Có lỗi xảy ra, vui lòng thử lại");
};

/** List query for a resource. `enabled` lets callers wait for required filters (e.g. parent id). */
export const useResourceList = <T, C>(
  resource: Resource<T, C>,
  { domain }: CrudOptions,
  params?: ListParams,
  enabled = true,
): UseQueryResult<T[]> =>
  useQuery({
    queryKey: [domain, "list", params ?? {}],
    queryFn: async () => (await resource.list(params)).data,
    enabled,
  });

/** Mutations (create/update/remove/move/status) that invalidate the resource domain. */
export const useResourceMutations = <T, C>(resource: Resource<T, C>, { domain }: CrudOptions) => {
  const qc = useQueryClient();
  const invalidate = (): Promise<void> => qc.invalidateQueries({ queryKey: [domain] });

  const create = useMutation({
    mutationFn: (body: C) => resource.create(body),
    onSuccess: () => {
      toast.success("Đã tạo");
      return invalidate();
    },
    onError,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<C> }) => resource.update(id, body),
    onSuccess: () => {
      toast.success("Đã lưu");
      return invalidate();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: (id: string) => resource.remove(id),
    onSuccess: () => {
      toast.success("Đã xoá");
      return invalidate();
    },
    onError,
  });
  const move = useMutation({
    mutationFn: ({ id, body }: { id: string; body: MovePayload }) => resource.move(id, body),
    onSettled: invalidate,
    onError,
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusValue }) => resource.setStatus(id, status),
    onSuccess: invalidate,
    onError,
  });

  return { create, update, remove, move, setStatus };
};
