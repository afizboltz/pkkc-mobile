// One-time Firestore -> Supabase migration for the stg environment.
//
// This is NOT run automatically anywhere. Run it manually, once, during an announced
// stg maintenance window, after the schema/RLS migrations have been applied and the
// Supabase Auth "Confirm email" setting has been reviewed.
//
// Required env vars:
//   SUPABASE_URL                - e.g. https://gxyedsgrlacvmzvsivyi.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   - service role key (bypasses RLS; never commit this)
//   SUPABASE_PROJECT_REF        - must equal the project ref in SUPABASE_URL, as a
//                                 safety check so this can never accidentally be pointed
//                                 at a future ppd/prd project by a stale env var.
//   FIREBASE_SERVICE_ACCOUNT_PATH - path to the Firebase Admin SDK service account JSON
//                                   for the pkkc-stg Firebase project (see scripts/raw/).
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_PROJECT_REF=gxyedsgrlacvmzvsivyi \
//   FIREBASE_SERVICE_ACCOUNT_PATH=./scripts/raw/pkkc-stg-firebase-adminsdk-....json \
//   node scripts/migrateToSupabase.js

const admin = require("firebase-admin");
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
const firebaseServiceAccountPath = requireEnv("FIREBASE_SERVICE_ACCOUNT_PATH");

if (
  supabaseProjectRef !== EXPECTED_PROJECT_REF ||
  !supabaseUrl.includes(EXPECTED_PROJECT_REF)
) {
  console.error(
    `Refusing to run: SUPABASE_PROJECT_REF/SUPABASE_URL do not match the expected stg project ` +
      `ref (${EXPECTED_PROJECT_REF}). This script is only safe to run against stg.`,
  );
  process.exit(1);
}

const serviceAccount = require(
  require("path").resolve(firebaseServiceAccountPath),
);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const firestore = admin.firestore();
const firebaseAuth = admin.auth();

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const normalizeIc = (ic) => (ic || "").replace(/\D+/g, "").trim();

function toIsoOrNull(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (typeof value === "number") return new Date(value).toISOString();
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

function toDateOrNull(value) {
  const iso = toIsoOrNull(value);
  return iso
    ? iso.slice(0, 10)
    : typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value
      : null;
}

function normalizeRenewals(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    return Object.entries(raw).map(([id, v]) => ({ id, ...(v || {}) }));
  }
  return [];
}

async function run() {
  const summary = {
    usersMigrated: 0,
    usersSkipped: 0,
    renewalsMigrated: 0,
    announcementsMigrated: 0,
    errors: [],
  };

  // 1. Read all Firestore users up front (also used to seed the pkkc_id sequence).
  const usersSnap = await firestore.collection("users").get();
  const firestoreUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`Found ${firestoreUsers.length} Firestore users.`);

  // 2. Seed the pkkc_id sequence so new signups never collide with migrated ids.
  let maxPkkcNumber = 0;
  for (const u of firestoreUsers) {
    const match =
      typeof u.pkkcID === "string" ? u.pkkcID.match(/PKKC-(\d+)/) : null;
    if (match) maxPkkcNumber = Math.max(maxPkkcNumber, parseInt(match[1], 10));
  }
  if (maxPkkcNumber > 0) {
    // Seeding a sequence is DDL, not something the service-role client should run as a
    // side effect of a data script — apply it explicitly via the Supabase SQL editor or
    // the apply_migration MCP tool before continuing, so it's a deliberate, logged step.
    console.log(
      `ACTION REQUIRED: run this in the Supabase SQL editor before continuing:\n` +
        `  alter sequence public.pkkc_id_seq restart with ${maxPkkcNumber + 1};`,
    );
  }

  // 3. Create Auth accounts + insert users rows.
  for (const u of firestoreUsers) {
    const email = (u.email || u.id || "").toLowerCase().trim();
    if (!email) {
      summary.usersSkipped++;
      continue;
    }

    try {
      let authUserId;
      try {
        const firebaseUser = await firebaseAuth.getUserByEmail(email);
        authUserId = firebaseUser.uid; // kept only for cross-referencing in logs; not used as the new id
      } catch {
        // No Firebase Auth account (e.g. imported-only user) — Supabase will mint a fresh id.
      }

      const { data: created, error: createError } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            migrated_from: "firebase",
            firebase_uid: authUserId ?? null,
          },
        });
      if (createError) throw createError;

      const newId = created.user.id;
      const normalizedIc = normalizeIc(u.icNo);

      const { error: insertError } = await supabase.from("users").insert({
        id: newId,
        email,
        ic_no: normalizedIc || null,
        full_name: u.fullName || "",
        phone_no: u.phoneNo || "",
        birth_date: toDateOrNull(u.birthDate),
        gender: u.gender || null,
        marital_status: u.maritalStatus || null,
        kita_resident: u.kitaResident || null,
        address: u.address || null,
        number_of_family_members: u.numberOfFamilyMembers
          ? Number(u.numberOfFamilyMembers) || null
          : null,
        occupation: u.occupation || null,
        status: u.status || "pending",
        role: u.role || "member",
        pkkc_id: u.pkkcID || null,
        slip_bayaran_url: u.slipBayaranUrl || null,
        ack: !!u.ack,
        membership_expiry: toDateOrNull(u.membershipExpiry),
        approved_at: toIsoOrNull(u.approvedAtMillis),
        approved_remark: u.approvedRemark || null,
        approved_by: u.approvedBy || null,
        rejected_at: toIsoOrNull(u.rejectedAtMillis),
        rejected_remark: u.rejectedRemark || null,
        rejected_by: u.rejectedBy || null,
        verified_at: toIsoOrNull(u.verifiedAt),
        migrated: true,
        created_at: toIsoOrNull(u.createdAt) || new Date().toISOString(),
      });
      if (insertError) throw insertError;

      // 4. Renewals (flatten the old array/map into individual rows).
      const renewals = normalizeRenewals(u.renewals);
      for (const r of renewals) {
        const { error: renewalError } = await supabase.from("renewals").insert({
          user_id: newId,
          kind: r.kind === "certificate" ? "certificate" : "payment",
          amount: typeof r.amount === "number" ? r.amount : 0,
          status: ["pending", "approved", "rejected"].includes(r.status)
            ? r.status
            : "pending",
          payment_method: r.paymentMethod || null,
          screenshot_url: r.screenshotUrl || null,
          certificate_url: r.certificateUrl || null,
          submitted_at:
            toIsoOrNull(r.submittedAtMillis || r.submittedAt) ||
            new Date().toISOString(),
          approved_at: toIsoOrNull(r.approvedAtMillis),
          approved_remark: r.approvedRemark || null,
          approved_by: r.approvedBy || null,
          rejected_at: toIsoOrNull(r.rejectedAtMillis),
          rejected_remark: r.rejectedRemark || null,
          rejected_by: r.rejectedBy || null,
        });
        if (renewalError) {
          summary.errors.push(`renewal for ${email}: ${renewalError.message}`);
        } else {
          summary.renewalsMigrated++;
        }
      }

      summary.usersMigrated++;
      console.log(`Migrated: ${email} -> ${newId}`);
    } catch (err) {
      summary.usersSkipped++;
      summary.errors.push(`user ${email}: ${err.message || err}`);
      console.error(`Failed to migrate ${email}:`, err.message || err);
    }
  }

  // 5. Announcements.
  const announcementsSnap = await firestore.collection("announcement").get();
  for (const doc of announcementsSnap.docs) {
    const a = doc.data();
    const { error } = await supabase.from("announcements").insert({
      title: a.title || null,
      message: a.message || null,
      description: a.description || null,
      images: a.images || null,
      date: toDateOrNull(a.date),
      created_at: toIsoOrNull(a.createdAt) || new Date().toISOString(),
    });
    if (error) {
      summary.errors.push(`announcement ${doc.id}: ${error.message}`);
    } else {
      summary.announcementsMigrated++;
    }
  }

  // NOTE: Storage file migration (registration receipts / renewal screenshots & certificates)
  // is intentionally not automated here — it requires downloading each Firebase Storage
  // object and re-uploading to the `receipts` Supabase bucket, then rewriting the
  // slip_bayaran_url / screenshot_url / certificate_url columns from URL to Storage path.
  // Do this as a focused follow-up pass once the row-level migration above is verified,
  // since it's a different failure mode (network/storage) from the data migration above.

  console.log("\n=== Migration summary ===");
  console.log(JSON.stringify(summary, null, 2));
}

run()
  .then(() => console.log("Done."))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
