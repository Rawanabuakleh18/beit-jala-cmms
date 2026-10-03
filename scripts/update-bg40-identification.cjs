const { createRequire } = require('node:module');
const { writeFileSync } = require('node:fs');
const path = require('node:path');
const dbRequire = createRequire(path.resolve('lib/db/package.json'));
const { Client } = dbRequire('pg');
const replacement = [
  'Host Machine :- (PDM-01-037 A)',
  'Air Exhaust Machine PF 40 :- (PDM-01-037B)',
  'Inlet hot Air Cabinet RED 40 :- (PDM-01-037C)',
  'Stirring Drum -50L:- (PDM-01-037D)',
  'Pump :- (PDM-01-037E)',
  'CIP:- (PDM-01-037F)',
].join('\n');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`SELECT e.id, e.machine_id, e.model_number, e.serial_number, e.identification_number, m.machine_number
      FROM equipment_information_records e JOIN machines m ON m.id=e.machine_id
      WHERE m.machine_number=$1 FOR UPDATE OF e`, ['PDM-01-037']);
    console.log(JSON.stringify(rows, null, 2));
    if (process.argv.includes('--apply')) {
      if (rows.length !== 1 || rows[0].serial_number?.trim() !== '423' || rows[0].model_number?.replace(/\s/g, '') !== 'BG-40') throw new Error('Record identity mismatch');
      writeFileSync(path.resolve('backups/bg40-identification-before-update.json'), JSON.stringify(rows, null, 2), { flag: 'wx' });
      const result = await client.query('UPDATE equipment_information_records SET identification_number=$1, updated_at=NOW() WHERE id=$2 RETURNING identification_number', [replacement, rows[0].id]);
      if (result.rowCount !== 1 || result.rows[0].identification_number !== replacement) throw new Error('Verification failed');
      await client.query('COMMIT');
      console.log(JSON.stringify(result.rows, null, 2));
    } else await client.query('ROLLBACK');
  } finally { await client.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
