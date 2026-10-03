const { createRequire } = require("node:module");
const fs = require("node:fs");
const path = require("node:path");
const { Client } = createRequire(path.resolve("lib/db/package.json"))("pg");

const apply = process.argv.includes("--apply");
const installTrigger = process.argv.includes("--install-trigger");

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    if (installTrigger) {
      const migration = fs.readFileSync(
        path.resolve("lib/db/migrations/20260923_sync_machine_location_from_corrective_record.sql"),
        "utf8",
      );
      await client.query(migration);
    }
    const { rows: mismatches } = await client.query(`
      SELECT
        m.id AS machine_id,
        m.machine_number,
        m.machine_name,
        m.location AS old_location,
        cm.id AS corrective_record_id,
        cm.machine_location AS new_location
      FROM machines m
      JOIN LATERAL (
        SELECT id, machine_location
        FROM corrective_maintenance_records
        WHERE machine_id = m.id AND status = 'active'
        ORDER BY sequence_number DESC, id DESC
        LIMIT 1
      ) cm ON TRUE
      WHERE COALESCE(BTRIM(m.location), '') IS DISTINCT FROM COALESCE(BTRIM(cm.machine_location), '')
      ORDER BY m.id
    `);

    if (!apply) {
      console.log(JSON.stringify({ apply: false, mismatchCount: mismatches.length, mismatches }, null, 2));
      return;
    }

    if (mismatches.length === 0) {
      console.log(JSON.stringify({ apply: true, updatedCount: 0, remainingMismatchCount: 0 }, null, 2));
      return;
    }

    const backupPath = path.resolve("backups", `machine-locations-before-corrective-sync-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(mismatches, null, 2), { flag: "wx" });

    await client.query("BEGIN");
    for (const row of mismatches) {
      await client.query(
        "UPDATE machines SET location=$1, updated_at=NOW() WHERE id=$2",
        [row.new_location?.trim() || null, row.machine_id],
      );
    }
    await client.query("COMMIT");

    const { rows: remaining } = await client.query(`
      SELECT m.id
      FROM machines m
      JOIN LATERAL (
        SELECT machine_location
        FROM corrective_maintenance_records
        WHERE machine_id = m.id AND status = 'active'
        ORDER BY sequence_number DESC, id DESC
        LIMIT 1
      ) cm ON TRUE
      WHERE COALESCE(BTRIM(m.location), '') IS DISTINCT FROM COALESCE(BTRIM(cm.machine_location), '')
    `);

    if (remaining.length > 0) throw new Error(`${remaining.length} location mismatches remain after synchronization`);
    console.log(JSON.stringify({ apply: true, updatedCount: mismatches.length, remainingMismatchCount: 0, backupPath }, null, 2));
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
