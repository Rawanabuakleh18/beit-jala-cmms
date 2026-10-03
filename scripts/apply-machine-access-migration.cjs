const { createRequire } = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const { Client } = createRequire(path.resolve(__dirname, '../lib/db/package.json'))('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(fs.readFileSync(path.resolve(__dirname, '../lib/db/migrations/20260922_machine_department_access.sql'), 'utf8'));
    console.log('Machine department access migration applied. Existing access preserved.');
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
