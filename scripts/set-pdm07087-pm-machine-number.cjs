const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const { Client } = createRequire(resolve('lib/db/package.json'))('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(`
      UPDATE pm_headers h
      SET show_service_area=true,
          service_area_machine_number='PDM-07-087',
          service_area_location=NULL,
          updated_at=NOW()
      FROM machines m
      WHERE h.machine_id=m.id AND m.machine_number='PDM-07-087'
      RETURNING h.machine_id, h.show_service_area, h.service_area_machine_number
    `);
    assert.equal(result.rowCount, 1, 'Expected exactly one PDM-07-087 PM header');
    assert.equal(result.rows[0].service_area_machine_number, 'PDM-07-087');
    console.log(JSON.stringify(result.rows[0]));
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode=1; });
