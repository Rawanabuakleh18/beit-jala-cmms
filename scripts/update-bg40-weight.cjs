const { createRequire } = require('node:module');
const { writeFileSync } = require('node:fs');
const path = require('node:path');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
const weightNote = [
  'Host Machine: 500Kg',
  'Air Exhaust Machine PF: 450kg',
  'Inlet hot Air Cabinet RED: 400kg',
].join('\n');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`SELECT e.id, e.model_number, e.serial_number, e.weight_kg, e.weight_note
      FROM equipment_information_records e JOIN machines m ON m.id=e.machine_id
      WHERE m.machine_number=$1 FOR UPDATE OF e`, ['PDM-01-037']);
    if (rows.length !== 1 || rows[0].serial_number?.trim() !== '423' || rows[0].model_number?.replace(/\s/g, '') !== 'BG-40') throw new Error('Record identity mismatch');
    writeFileSync(path.resolve('backups/bg40-weight-before-update.json'), JSON.stringify(rows, null, 2), { flag: 'wx' });
    const result = await client.query('UPDATE equipment_information_records SET weight_kg=NULL, weight_note=$1, updated_at=NOW() WHERE id=$2 RETURNING weight_kg, weight_note', [weightNote, rows[0].id]);
    if (result.rowCount !== 1 || result.rows[0].weight_note !== weightNote || result.rows[0].weight_kg !== null) throw new Error('Verification failed');
    await client.query('COMMIT');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
