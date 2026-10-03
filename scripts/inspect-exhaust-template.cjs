const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
(async () => {
  await client.connect();
  try {
    const result = await client.query(`
      SELECT m.id,m.machine_number,m.machine_name,m.department_id,m.location,m.status,
             m.pm_frequency_months,m.pm_start_date,h.*,
             (SELECT count(*)::int FROM pm_checklist_points p WHERE p.machine_id=m.id AND p.is_active) AS points
      FROM machines m LEFT JOIN pm_headers h ON h.machine_id=m.id
      WHERE lower(m.machine_name) LIKE '%exhaust%' AND m.deleted_at IS NULL
      ORDER BY m.id
    `);
    console.log(JSON.stringify(result.rows, null, 2));
    const counts = await client.query(`
      SELECT CASE
               WHEN lower(machine_name) LIKE '%exhaust%' THEN 'Exhaust'
               WHEN lower(machine_name) LIKE '%air handling%' THEN 'Air Handling'
             END AS type,
             count(*)::int AS count
      FROM machines
      WHERE deleted_at IS NULL
        AND (lower(machine_name) LIKE '%exhaust%' OR lower(machine_name) LIKE '%air handling%')
      GROUP BY 1 ORDER BY 1
    `);
    console.log('COUNTS');
    console.log(JSON.stringify(counts.rows, null, 2));
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
