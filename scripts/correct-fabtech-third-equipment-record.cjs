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
    const before = (await c.query('SELECT * FROM additional_equipment_records ORDER BY id')).rows;
    const originals = (await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows;
    const target = before.find(r => r.machine_id === 58 && r.record_number === 3);
    assert.ok(target);
    assert.equal(target.data.identificationNumber, 'PDM-01-097D');
    assert.equal(target.data.modelNumber, 'FTIL-CNTBLD-600');
    fs.writeFileSync('backups/fabtech-third-equipment-before-correction.json', JSON.stringify(target, null, 2), { flag: 'wx' });
    const changes = { utilitiesOther: '-\n5/160rpm', utilitiesWater: 'Purified Water' };
    const saved = (await c.query('UPDATE additional_equipment_records SET data=data || $1::jsonb,updated_at=NOW() WHERE id=$2 RETURNING *', [JSON.stringify(changes), target.id])).rows[0];
    assert.deepEqual(saved.data, { ...target.data, ...changes });
    assert.deepEqual(saved.header, target.header);
    assert.deepEqual((await c.query('SELECT * FROM additional_equipment_records WHERE id<>$1 ORDER BY id', [target.id])).rows, before.filter(r => r.id !== target.id));
    assert.deepEqual((await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows, originals);
    await c.query('COMMIT');
    console.log('Record 3: filled Blender RPM exactly as pictured (5/160rpm); removed extra water line break. All other records unchanged.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
