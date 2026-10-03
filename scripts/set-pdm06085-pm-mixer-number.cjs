const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(`
      UPDATE pm_headers p
      SET show_service_area=true,
          service_area_machine_number='PDM-06-085',
          service_area_location=NULL,
          updated_at=NOW()
      FROM machines m
      WHERE p.machine_id=m.id AND m.machine_number='PDM-06-085'
      RETURNING p.machine_id, p.service_area_machine_number
    `);
    if (result.rowCount !== 1) throw new Error(`Expected one PM header, updated ${result.rowCount}`);
    console.log(JSON.stringify(result.rows[0]));
  } finally {
    await client.end();
  }
})().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
