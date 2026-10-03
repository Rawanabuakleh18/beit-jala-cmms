const path = require('node:path');
const { createRequire } = require('node:module');
const { Client } = createRequire(path.resolve(__dirname, '../lib/db/package.json'))('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const { rows } = await c.query(`
    SELECT i.machine_id, m.machine_name, m.machine_number, m.department_id,
      COUNT(*) FILTER (WHERE NULLIF(i.action_taken, '') IS NOT NULL OR NULLIF(i.examiner_name, '') IS NOT NULL OR i.completed_at IS NOT NULL) AS filled,
      COUNT(*) AS total
    FROM pm_inspections i JOIN machines m ON m.id = i.machine_id
    GROUP BY i.machine_id, m.machine_name, m.machine_number, m.department_id
    HAVING COUNT(*) FILTER (WHERE NULLIF(i.action_taken, '') IS NOT NULL OR NULLIF(i.examiner_name, '') IS NOT NULL OR i.completed_at IS NOT NULL) > 0
    ORDER BY filled DESC, m.machine_name`);
  console.log(JSON.stringify(rows, null, 2));
  await c.end();
})().catch((error) => { console.error(error); process.exit(1); });
