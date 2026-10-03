const { createRequire } = require("node:module");
const { Client } = createRequire(require("node:path").resolve("lib/db/package.json"))("pg");

const client = new Client({ connectionString: process.env.DATABASE_URL });
const correctedText = "تم فحص شد جنزير التوقيت (timing) D72 و هو بحالة جيدة";

(async () => {
  await client.connect();
  try {
    await client.query("BEGIN");
    const pointResult = await client.query(`
      SELECT p.id, p.point_text
      FROM pm_checklist_points p
      JOIN machines m ON m.id = p.machine_id
      WHERE regexp_replace(upper(m.machine_number), '[^A-Z0-9]', '', 'g') = 'PDM03051'
        AND p.sort_order = 14
        AND p.is_active = TRUE
      FOR UPDATE
    `);
    if (pointResult.rowCount !== 1) {
      throw new Error(`Expected one active point 14 for PDM-03-051, found ${pointResult.rowCount}.`);
    }

    const point = pointResult.rows[0];
    await client.query(`
      UPDATE pm_checklist_points
      SET point_text = $1, updated_at = NOW()
      WHERE id = $2
    `, [correctedText, point.id]);

    const snapshots = await client.query(`
      UPDATE pm_record_checklist_points s
      SET point_text = $1
      FROM pm_records r
      WHERE s.record_id = r.id
        AND s.source_checklist_point_id = $2
        AND r.status = 'active'
      RETURNING s.id, s.record_id
    `, [correctedText, point.id]);

    await client.query("COMMIT");
    console.log(JSON.stringify({
      pointId: point.id,
      previousText: point.point_text,
      correctedText,
      currentRecordSnapshotsUpdated: snapshots.rows,
    }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
