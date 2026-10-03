const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
(async () => {
  await client.connect();
  try {
    const rows = await client.query(`
      SELECT m.id,m.machine_number,p.id AS point_id,p.sort_order,p.point_text,p.is_active
      FROM machines m LEFT JOIN pm_checklist_points p ON p.machine_id=m.id
      WHERE upper(trim(m.machine_number))='AC-1'
      ORDER BY p.sort_order,p.id
    `);
    console.log(JSON.stringify(rows.rows,null,2));
    const similar = await client.query(`
      SELECT DISTINCT point_text FROM pm_checklist_points
      WHERE point_text LIKE '%تشحيم%' OR point_text LIKE '%الفلاتر%'
      ORDER BY point_text
    `);
    console.log('SIMILAR');
    console.log(JSON.stringify(similar.rows,null,2));
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode=1; });
