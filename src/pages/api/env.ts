import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any)?.runtime?.env || {};
  const keys = Object.keys(env).sort();
  const hasDB = !!(env as any).DB;
  const hasDATABASE = !!(env as any).DATABASE;
  return new Response(JSON.stringify({ ok: true, keys, hasDB, hasDATABASE }), {
    headers: { "content-type": "application/json" }
  });
};
