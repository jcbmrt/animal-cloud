import type { APIRoute } from "astro";
import type { D1Database } from "@cloudflare/workers-types";

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env;
  const db = env.DB as D1Database;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || "24")));
  const sex = url.searchParams.get("sex") || "";
  const status = url.searchParams.get("status") || "";
  const age_bucket = url.searchParams.get("age_bucket") || "";
  const found_place = url.searchParams.get("found_place") || "";
  const breed = url.searchParams.get("breed") || "";
  const shelter_name = url.searchParams.get("shelter_name") || "";
  const offset = (page - 1) * pageSize;

  const clauses: string[] = [];
  const binds: any[] = [];
  if (sex) { clauses.push("sex = ?"); binds.push(sex); }
  if (status) { clauses.push("status = ?"); binds.push(status); }
  if (age_bucket) { clauses.push("age_bucket = ?"); binds.push(age_bucket); }
  if (found_place) { clauses.push("found_place = ?"); binds.push(found_place); }
  if (breed) { clauses.push("breed = ?"); binds.push(breed); }
  if (shelter_name) { clauses.push("shelter_name = ?"); binds.push(shelter_name); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const rows = await db.prepare(
    `SELECT external_id, slug, name, breed, sex, age_text, age_bucket, found_place, status, shelter_name, photo_url
     FROM animals ${where}
     ORDER BY COALESCE(received_at, posted_at) DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, pageSize, offset).all();

  const c = await db.prepare(`SELECT COUNT(*) as c FROM animals ${where}`).bind(...binds).all();
  const total = Number((c.results as any[])?.[0]?.c || 0);

  return new Response(JSON.stringify({ items: rows.results || [], total, page, pageSize }), {
    headers: { "content-type": "application/json" }
  });
};
