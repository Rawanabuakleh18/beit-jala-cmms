const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const original = (await client.query(`
      SELECT e.* FROM equipment_information_records e WHERE e.machine_id=106
    `)).rows;
    const additional = (await client.query(`
      SELECT record_number, data, header FROM additional_equipment_records
      WHERE machine_id=106 ORDER BY record_number
    `)).rows;
    console.log(JSON.stringify({ original, additional }, null, 2));
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
