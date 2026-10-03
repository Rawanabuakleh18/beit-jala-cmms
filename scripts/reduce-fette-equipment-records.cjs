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
    const machines = (await c.query('SELECT id FROM machines WHERE machine_number=$1', ['PDM-01-043'])).rows;
    assert.equal(machines.length, 1);
    const machineId = machines[0].id;
    const before = (await c.query('SELECT * FROM additional_equipment_records ORDER BY id FOR UPDATE')).rows;
    const original = (await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows;
    const fifth = before.filter(r => r.machine_id === machineId && r.record_number === 5);
    assert.equal(fifth.length, 1);
    fs.writeFileSync('backups/fette-equipment-record-5-before-removal.json', JSON.stringify(fifth[0], null, 2), { flag: 'wx' });
    const removed = await c.query('DELETE FROM additional_equipment_records WHERE machine_id=$1 AND record_number=5', [machineId]);
    assert.equal(removed.rowCount, 1);
    const after = (await c.query('SELECT * FROM additional_equipment_records ORDER BY id')).rows;
    assert.deepEqual(after, before.filter(r => r.id !== fifth[0].id));
    assert.deepEqual(after.filter(r => r.machine_id === machineId).map(r => r.record_number).sort(), [2, 3, 4]);
    assert.deepEqual((await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows, original);
    await c.query('COMMIT');
    console.log('PDM-01-043 now has records 1–4. Record 5 backed up and removed; all other records unchanged.');
  } catch (error) {
    await c.query('ROLLBACK');
    throw error;
  } finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
