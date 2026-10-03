const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = await client.query(`
      SELECT id, upper(trim(machine_number)) AS machine_number
      FROM machines
      WHERE upper(trim(machine_number)) IN ('AC-1', 'AC-2') AND deleted_at IS NULL
    `);
    const ac1 = machines.rows.find((row) => row.machine_number === 'AC-1');
    const ac2 = machines.rows.find((row) => row.machine_number === 'AC-2');
    if (!ac1 || !ac2) throw Error('AC-1 or AC-2 machine was not found');

    const source = await client.query(`
      SELECT point_text, result_type, sort_order
      FROM pm_checklist_points
      WHERE machine_id = $1 AND is_active = true
      ORDER BY sort_order, id
    `, [ac1.id]);
    if (source.rowCount !== 7) throw Error(`Expected 7 active AC-1 points, found ${source.rowCount}`);

    const target = await client.query(`
      SELECT count(*)::int AS count
      FROM pm_checklist_points
      WHERE machine_id = $1 AND is_active = true
    `, [ac2.id]);
    if (target.rows[0].count !== 0) throw Error(`AC-2 already has ${target.rows[0].count} active checklist points`);

    for (const point of source.rows) {
      await client.query(`
        INSERT INTO pm_checklist_points
          (machine_id, point_text, result_type, sort_order, is_active)
        VALUES ($1, $2, $3, $4, true)
      `, [ac2.id, point.point_text, point.result_type, point.sort_order]);
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({ source: 'AC-1', target: 'AC-2', copiedPoints: source.rowCount }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
