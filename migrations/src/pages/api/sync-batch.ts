import type { APIRoute } from "astro";
import type { D1Database } from "@cloudflare/workers-types";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env;
  const db = env.DB as D1Database;

  const token = request.headers.get("x-ingest-token");
  const expected = String(env.INGEST_TOKEN || "");
  if (!expected || token !== expected) return new Response("unauthorized", { status: 401 });

  const body = await request.json();
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) {
    return new Response(JSON.stringify({ ok: true, upserts: 0 }), { headers: { "content-type": "application/json" } });
  }

  const stmt = `INSERT INTO animals
  (external_id, slug, name, species, sex, age, location, shelter_name, status, main_image_url, posted_at, notice_no, reg_no, breed, color, neutered, age_text, age_bucket, weight_kg, feature_rescue, feature_social, feature_health, medical_check, vaccination_status, found_place, received_at, remarks, jurisdiction, shelter_place, shelter_phone, adoption_process, adoption_support, volunteer_info, events_info, photo_url)
  VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30, ?31, ?32, ?33, ?34, ?35)
  ON CONFLICT(external_id) DO UPDATE SET
  slug=excluded.slug,
  name=excluded.name,
  species=excluded.species,
  sex=excluded.sex,
  age=excluded.age,
  location=excluded.location,
  shelter_name=excluded.shelter_name,
  status=excluded.status,
  main_image_url=excluded.main_image_url,
  posted_at=excluded.posted_at,
  notice_no=excluded.notice_no,
  reg_no=excluded.reg_no,
  breed=excluded.breed,
  color=excluded.color,
  neutered=excluded.neutered,
  age_text=excluded.age_text,
  age_bucket=excluded.age_bucket,
  weight_kg=excluded.weight_kg,
  feature_rescue=excluded.feature_rescue,
  feature_social=excluded.feature_social,
  feature_health=excluded.feature_health,
  medical_check=excluded.medical_check,
  vaccination_status=excluded.vaccination_status,
  found_place=excluded.found_place,
  received_at=excluded.received_at,
  remarks=excluded.remarks,
  jurisdiction=excluded.jurisdiction,
  shelter_place=excluded.shelter_place,
  shelter_phone=excluded.shelter_phone,
  adoption_process=excluded.adoption_process,
  adoption_support=excluded.adoption_support,
  volunteer_info=excluded.volunteer_info,
  events_info=excluded.events_info,
  photo_url=excluded.photo_url`;

  for (const raw of items) {
    const external_id = raw.external_id || raw.desertionNo;
    const slug = raw.slug || (external_id ? `animal-${external_id}` : "");
    const name = raw.name || raw.breed || external_id || "";
    const species = raw.species || "";
    const sex = raw.sex || "";
    const age = raw.age || "";
    const location = raw.location || raw.found_place || "";
    const shelter_name = raw.shelter_name || "";
    const status = raw.status || "";
    const main_image_url = raw.main_image_url || raw.photo_url || "";
    const posted_at = raw.posted_at || raw.received_at || "";

    await db
      .prepare(stmt)
      .bind(
        external_id,
        slug,
        name,
        species,
        sex,
        age,
        location,
        shelter_name,
        status,
        main_image_url,
        posted_at,
        raw.notice_no || "",
        raw.reg_no || "",
        raw.breed || "",
        raw.color || "",
        raw.neutered || "",
        raw.age_text || "",
        raw.age_bucket || "",
        raw.weight_kg ?? null,
        raw.feature_rescue || "",
        raw.feature_social || "",
        raw.feature_health || "",
        raw.medical_check || "",
        raw.vaccination_status || "",
        raw.found_place || "",
        raw.received_at || "",
        raw.remarks || "",
        raw.jurisdiction || "",
        raw.shelter_place || "",
        raw.shelter_phone || "",
        raw.adoption_process || "",
        raw.adoption_support || "",
        raw.volunteer_info || "",
        raw.events_info || "",
        raw.photo_url || ""
      )
      .run();
  }

  return new Response(JSON.stringify({ ok: true, upserts: items.length }), { headers: { "content-type": "application/json" } });
};
