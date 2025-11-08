import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any)?.runtime?.env;
  const hasDB = !!env?.DB;
  return new Response(JSON.stringify({ ok: true, hasDB }), {
    headers: { "content-type": "application/json" }
  });
};
