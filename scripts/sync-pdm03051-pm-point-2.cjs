const { createRequire } = require("node:module");
const { Client } = createRequire(require("node:path").resolve("lib/db/package.json"))("pg");

const client = new Client({ connectionString: process.env.DATABASE_URL });
const apply = process.argv.includes("--apply");

(async () => {
  await client.connect();
  try {
    const result = await client.query(`
      SELECT
        m.id AS machine_id,
        m.machine_number,
        p.id AS point_id,
        p.point_text AS current_text,
        r.id AS record_id,
        r.sequence_number,
        r.status,
        s.id AS snapshot_id,
        s.point_text AS snapshot_text
      FROM machines m
      JOIN pm_checklist_points p
        ON p.machine_id = m.id
       AND p.sort_order = 2
       AND p.is_active = TRUE
      JOIN pm_records r ON r.machine_id = m.id
      JOIN pm_record_checklist_points s
        ON s.record_id = r.id
       AND s.source_checklist_point_id = p.id
      WHERE regexp_replace(upper(m.machine_number), '[^A-Z0-9]', '', 'g') = 'PDM03051'
      ORDER BY r.sequence_number
    `);

    if (!result.rowCount) throw new Error("No saved point-2 print snapshots found for PDM-03-051.");
    const machineIds = new Set(result.rows.map((row) => row.machine_id));
    const pointIds = new Set(result.rows.map((row) => row.point_id));
    const currentTexts = new Set(result.rows.map((row) => row.current_text));
    if (machineIds.size !== 1 || pointIds.size !== 1 || currentTexts.size !== 1) {
      throw new Error("Expected exactly one machine, active point, and current point text.");
    }

    const currentText = result.rows[0].current_text;
    if (!currentText.includes("الجاكت")) {
      throw new Error(`The current checklist point does not contain the corrected word \"الجاكت\": ${currentText}`);
    }

    const stale = result.rows.filter((row) => row.snapshot_text !== currentText);
    console.log(JSON.stringify({ apply, currentText, staleSnapshots: stale }, null, 2));
    if (!apply || !stale.length) return;

    const updated = await client.query(`
      UPDATE pm_record_checklist_points
      SET point_text = $1
      WHERE id = ANY($2::int[])
      RETURNING id, record_id, source_checklist_point_id, point_text
    `, [currentText, stale.map((row) => row.snapshot_id)]);
    console.log(JSON.stringify({ updatedSnapshots: updated.rows }, null, 2));
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
