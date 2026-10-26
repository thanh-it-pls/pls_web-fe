/** Liveness probe for Docker / blue-green deploy: answers without touching the API. */
export const dynamic = "force-static";

export const GET = (): Response => new Response("ok\n", { headers: { "Content-Type": "text/plain" } });
