import type { APIRoute } from "astro";
import type { D1Database } from "@cloudflare/workers-types";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = (locals as any).runtime.env;
  const db = env.DB as D1Database;

  const row = await db.prepare(
    `SELECT external_id, slug, name, species, breed, sex, color, neutered, age_text, age_bucket, weight_kg,
            feature_rescue, feature_social, feature_health, medical_check, vaccination_status,
            found_place, received_at, remarks, jurisdiction, status, shelter_name, shelter_place,
            shelter_phone, adoption_process, adoption_support, volunteer_info, events_info,
            photo_url
     FROM animals WHERE slug = ? LIMIT 1`
  ).bind(params.slug).all();

  const item = (row.results as any[])?.[0] || null;
  if (!item) return new Response("not found", { status: 404 });

  return new Response(JSON.stringify(item), { headers: { "content-type": "application/json" } });
};
