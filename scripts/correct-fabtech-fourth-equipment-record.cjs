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
    const machine = (await c.query('SELECT id FROM machines WHERE machine_number=$1', ['PDM-01-097'])).rows;
    assert.equal(machine.length, 1);
    assert.equal(machine[0].id, 58);
    const before = (await c.query('SELECT * FROM additional_equipment_records ORDER BY id FOR UPDATE')).rows;
    const originals = (await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows;
    const target = before.find(r => r.machine_id === 58 && r.record_number === 4);
    assert.ok(target);
    assert.equal(target.data.identificationNumber, 'PDM-01-097E');
    assert.equal(target.data.modelNumber, 'FTIL-Tipper');
    const changes = { utilitiesOther: '-\n200Kg', utilitiesAir: '6 bar-' };
    if (Object.entries(changes).every(([key, value]) => target.data[key] === value)) {
      await c.query('COMMIT');
      console.log('Record 4 already matches the correction.');
      return;
    }
    fs.writeFileSync('backups/fabtech-fourth-equipment-before-correction.json', JSON.stringify(target, null, 2), { flag: 'wx' });
    const saved = (await c.query('UPDATE additional_equipment_records SET data=data || $1::jsonb,updated_at=NOW() WHERE id=$2 RETURNING *', [JSON.stringify(changes), target.id])).rows[0];
    assert.deepEqual(saved.data, { ...target.data, ...changes });
    assert.deepEqual(saved.header, target.header);
    assert.deepEqual((await c.query('SELECT * FROM additional_equipment_records WHERE id<>$1 ORDER BY id', [target.id])).rows, before.filter(r => r.id !== target.id));
    assert.deepEqual((await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows, originals);
    await c.query('COMMIT');
    console.log('Record 4 corrected to match the source formatting. Other records unchanged.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
