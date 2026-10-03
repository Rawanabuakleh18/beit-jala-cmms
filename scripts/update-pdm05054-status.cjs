const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const { Client } = createRequire(resolve('lib/db/package.json'))('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(`
      UPDATE machines
      SET status='Active', updated_at=NOW()
      WHERE machine_number='PDM-05-054'
      RETURNING id, machine_number, status
    `);
    assert.equal(result.rowCount, 1, 'Expected exactly one PDM-05-054 machine');
    assert.equal(result.rows[0].status, 'Active');
    console.log(JSON.stringify(result.rows[0]));
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
