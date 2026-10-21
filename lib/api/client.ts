import type { ApiErrorBody } from "@/lib/api/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

interface ApiInit extends Omit<RequestInit, "body"> {
  params?: Params;
  body?: unknown;
}

/** Error thrown for any non-2xx API response; carries the API error body. */
export class ApiError extends Error {
  status: number;
  body: ApiErrorBody["error"] | null;

  constructor(status: number, body: ApiErrorBody["error"] | null) {
    super(body?.message ?? `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }

  /** Human readable message including field-level details when present. */
  get detail(): string {
    const details = this.body?.details?.map((d) => `${d.field}: ${d.message}`).join("; ");
    return details ? `${this.message} (${details})` : this.message;
  }
}

const buildQuery = (params?: Params): string => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    const values = Array.isArray(value) ? value : [value];
    values.forEach((v) => {
      if (v !== undefined && v !== null) qs.append(key, String(v));
    });
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
};

/** Typed fetch wrapper for the Page Builder API. */
export const api = async <T>(path: string, init: ApiInit = {}): Promise<T> => {
  const { params, body, headers, ...rest } = init;
  const res = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
    ...rest,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(res.status, json?.error ?? null);
  }
  return res.json() as Promise<T>;
};
