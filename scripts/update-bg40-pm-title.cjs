const { createRequire } = require('node:module');
const { writeFileSync } = require('node:fs');
const path = require('node:path');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
const title = 'سجل نشاطات الصيانة الوقائية لماكينة تلبيس الحبوب\nHigh Efficiency Intelligent Film Coating\nMachine BG-40 (PDM-01-037)';
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`SELECT h.id, h.pm_record_title, e.model_number, e.serial_number
      FROM pm_headers h JOIN machines m ON m.id=h.machine_id
      JOIN equipment_information_records e ON e.machine_id=m.id
      WHERE m.machine_number=$1 FOR UPDATE OF h`, ['PDM-01-037']);
    if (rows.length !== 1 || rows[0].serial_number?.trim() !== '423' || rows[0].model_number?.replace(/\s/g, '') !== 'BG-40') throw new Error('Record identity mismatch');
    writeFileSync(path.resolve('backups/bg40-pm-title-before-update.json'), JSON.stringify(rows, null, 2), { flag: 'wx' });
    const result = await client.query('UPDATE pm_headers SET pm_record_title=$1, updated_at=NOW() WHERE id=$2 RETURNING pm_record_title', [title, rows[0].id]);
    if (result.rowCount !== 1 || result.rows[0].pm_record_title !== title) throw new Error('Verification failed');
    await client.query('COMMIT');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
