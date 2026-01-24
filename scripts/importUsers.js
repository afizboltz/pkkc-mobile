const admin = require("firebase-admin");
const fs = require("fs");
const csv = require("csv-parser");

const serviceAccount = require("./raw/pkkc-stg-firebase-adminsdk-fbsvc-542e9027a2.json");
// const serviceAccount = require("./pkkc-stg-firebase-adminsdk-fbsvc-542e9027a2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Helper: convert date string to Firestore Timestamp
function toTimestamp(dateString) {
  if (!dateString) return admin.firestore.FieldValue.serverTimestamp();
  return admin.firestore.Timestamp.fromDate(new Date(dateString));
}

async function importCSV() {
  const rows = [];

  fs.createReadStream("./scripts/users.csv")
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      console.log(`Processing ${rows.length} users...`);

      for (const row of rows) {
        const email = row["Email Address"]?.toLowerCase().trim();

        if (!email) {
          console.log("Skipping row with no email:", row);
          continue;
        }

        // Build user document (exclude: AKUAN PEMOHON + automation)
        const userData = {
          email,
          fullName: row["NAMA PENUH"] || "",
          icNo: row["NO KAD PENGENALAN"] || "",
          phoneNo: row["NOMBOR TELEFON"] || "",
          gender: row["JANTINA"] || "",
          maritalStatus: row["STATUS"] || "",
          birthDate: row["TARIKH LAHIR"] || "",
          address: row["ALAMAT PENUH"] || "",
          kitaResident: row["TAMAN PERUMAHAN"] || "",
          numberOfFamilyMembers: row["BILANGAN AHLI RUMAH"] || "",
          occupation: row["PEKERJAAN"] || "",
          pkkcID: row["NO KEAHLIAN"] || "",
          slipBayaranUrl: row["SLIP BAYARAN YURAN PERSATUAN"] || "",
          createdAt: toTimestamp(row["Timestamp"]),
          tarikh: toTimestamp(row["Date"]),
          role: "member", // default role. member | admin
          status: "inactive", // default status. active | inactive | pending
          migrated: true,
          membershipExpiry: "2025-12-31",
        };

        // Insert/update user
        await db.collection("users").doc(email).set(userData, { merge: true });

        // Insert receipt into receipts collection
        await db.collection("receipts").doc(email).set({
          email,
          receiptNo: row["NO RESIT"] || "",
          receiptUrl: row["Merged Doc URL - RESIT PEMBAYARAN DAFTAR KEAHLIAN PKKC"] || "",
          receiptFileName: row["Merged Doc URL - RESIT PEMBAYARAN DAFTAR KEAHLIAN PKKC"] ? "RESIT PEMBAYARAN DAFTAR KEAHLIAN PKKC" : "",
          createdAt: toTimestamp(row["Date"]),
          source: "import",
        });

        console.log("Imported:", email);
      }

      console.log("🎉 Migration complete!");
    });
}

importCSV();
