const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const before = (await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows;
    const extras = (await c.query('SELECT * FROM additional_equipment_records ORDER BY id')).rows;
    const rows = (await c.query('SELECT e.* FROM equipment_information_records e JOIN machines m ON m.id=e.machine_id WHERE m.machine_number=$1 FOR UPDATE OF e', ['PDM-01-056'])).rows;
    assert.equal(rows.length, 1);
    const record = rows[0];
    assert.equal(record.machine_id, 56);
    fs.writeFileSync('backups/rotary-tablet-press-utilities-before-update.json', JSON.stringify(record, null, 2), { flag: 'wx' });
    const saved = (await c.query('UPDATE equipment_information_records SET utilities_air=$1,utilities_water=$2,utilities_other=$3,updated_at=NOW() WHERE id=$4 RETURNING *', ['80KN', '20Kw', '18mm', record.id])).rows[0];
    assert.deepEqual([saved.utilities_air, saved.utilities_water, saved.utilities_other], ['80KN', '20Kw', '18mm']);
    for (const key of Object.keys(record)) {
      if (!['utilities_air', 'utilities_water', 'utilities_other', 'updated_at'].includes(key)) assert.deepEqual(saved[key], record[key]);
    }
    const after = (await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows;
    assert.deepEqual(after.filter(r => r.id !== record.id), before.filter(r => r.id !== record.id));
    assert.deepEqual((await c.query('SELECT * FROM additional_equipment_records ORDER BY id')).rows, extras);
    await c.query('COMMIT');
    console.log('PDM-01-056: section 10 filled from image (80KN, 20Kw, 18mm). All other records unchanged.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
