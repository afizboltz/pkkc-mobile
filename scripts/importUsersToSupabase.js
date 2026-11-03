// One-time import of scripts/users.csv directly into Supabase (stg), bypassing Firestore.
//
// This is the Supabase-targeted counterpart to scripts/importUsers.js (which is Firestore-only
// and stays as-is for ppd/prd). The CSV's "SLIP BAYARAN YURAN PERSATUAN" column is an external
// Google Drive link, not a Firebase Storage object, so it's carried through unchanged here too
// — there is nothing to download/re-upload.
//
// This creates real Supabase Auth accounts for every email in the CSV. It does NOT send any
// password-reset or invite email — that is a separate, deliberate step you trigger later.
//
// Required env vars:
//   SUPABASE_URL                - e.g. https://gxyedsgrlacvmzvsivyi.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   - service role key (bypasses RLS; never commit this)
//   SUPABASE_PROJECT_REF        - must equal the project ref in SUPABASE_URL, as a safety check.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_PROJECT_REF=gxyedsgrlacvmzvsivyi \
//   node scripts/importUsersToSupabase.js

const fs = require("fs");
const csv = require("csv-parser");
const { createClient } = require("@supabase/supabase-js");

const EXPECTED_PROJECT_REF = "gxyedsgrlacvmzvsivyi";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

const supabaseUrl = requireEnv("SUPABASE_URL");
const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const supabaseProjectRef = requireEnv("SUPABASE_PROJECT_REF");

if (supabaseProjectRef !== EXPECTED_PROJECT_REF || !supabaseUrl.includes(EXPECTED_PROJECT_REF)) {
  console.error(
    `Refusing to run: SUPABASE_PROJECT_REF/SUPABASE_URL do not match the expected stg project ` +
    `ref (${EXPECTED_PROJECT_REF}). This script is only safe to run against stg.`
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const normalizeIc = (ic) => (ic || "").replace(/\D+/g, "").trim();

function toDateOrNull(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function toIsoOrNow(dateString) {
  if (!dateString) return new Date().toISOString();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

async function readRows() {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream("./scripts/users.csv")
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function run() {
  const rows = await readRows();
  console.log(`Processing ${rows.length} rows from users.csv...`);

  const summary = { imported: 0, skipped: 0, errors: [] };
  let maxPkkcNumber = 0;

  for (const row of rows) {
    const email = row["Email Address"]?.toLowerCase().trim();
    if (!email) {
      console.log("Skipping row with no email:", row);
      summary.skipped++;
      continue;
    }

    try {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { migrated_from: "csv_import" },
      });
      if (createError) throw createError;

      const pkkcId = row["NO KEAHLIAN"] || null;
      const match = pkkcId ? pkkcId.match(/PKKC-(\d+)/) : null;
      if (match) maxPkkcNumber = Math.max(maxPkkcNumber, parseInt(match[1], 10));

      const { error: insertError } = await supabase.from("users").insert({
        id: created.user.id,
        email,
        full_name: row["NAMA PENUH"] || "",
        ic_no: normalizeIc(row["NO KAD PENGENALAN"]) || null,
        phone_no: row["NOMBOR TELEFON"] || "",
        gender: row["JANTINA"] || null,
        marital_status: row["STATUS"] || null,
        birth_date: toDateOrNull(row["TARIKH LAHIR"]),
        address: row["ALAMAT PENUH"] || null,
        kita_resident: row["TAMAN PERUMAHAN"] || null,
        number_of_family_members: row["BILANGAN AHLI RUMAH"] ? Number(row["BILANGAN AHLI RUMAH"]) || null : null,
        occupation: row["PEKERJAAN"] || null,
        pkkc_id: pkkcId,
        slip_bayaran_url: row["SLIP BAYARAN YURAN PERSATUAN"] || null,
        role: "member",
        status: "inactive",
        migrated: true,
        membership_expiry: "2025-12-31",
        created_at: toIsoOrNow(row["Timestamp"]),
      });
      if (insertError) throw insertError;

      summary.imported++;
      console.log(`Imported: ${email}`);
    } catch (err) {
      summary.skipped++;
      summary.errors.push(`${email}: ${err.message || err}`);
      console.error(`Failed to import ${email}:`, err.message || err);
    }
  }

  console.log("\n=== Import summary ===");
  console.log(JSON.stringify(summary, null, 2));

  if (maxPkkcNumber > 0) {
    console.log(
      `\nACTION REQUIRED: run this in the Supabase SQL editor so new signups don't collide ` +
      `with the imported PKKC ids:\n` +
      `  alter sequence public.pkkc_id_seq restart with ${maxPkkcNumber + 1};`
    );
  }
}

run()
  .then(() => console.log("Done."))
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
