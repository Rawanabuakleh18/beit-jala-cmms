const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
(async () => {
  await client.connect();
  try {
    const rows = (await client.query(`SELECT m.id,m.machine_number,m.machine_name,m.department_id,d.name AS department,m.location,m.status,m.deleted_at
      FROM machines m LEFT JOIN departments d ON d.id=m.department_id
      WHERE regexp_replace(upper(m.machine_number),'\\s','','g') IN ('AC1/2','AC1/3') ORDER BY m.id`)).rows;
    console.log(JSON.stringify(rows, null, 2));
  } finally { await client.end(); }
})().catch(error => { console.error(error.message); process.exitCode=1; });
