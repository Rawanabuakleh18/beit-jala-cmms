const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
const fields = ['utilities_power_supply', 'utilities_air', 'utilities_water', 'utilities_other'];
const replacement = ['3ph Ac-20.5KW -4Hp-2800rpm', '6bar', 'Tap water for cooling', '200mmdia*100mm width'];
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const original = JSON.parse(fs.readFileSync('backups/karnavati-utilities-before-update.json', 'utf8'))[0];
    const { rows } = await c.query(`SELECT e.*,m.machine_name,m.machine_number FROM equipment_information_records e JOIN machines m ON m.id=e.machine_id WHERE m.machine_number IN ($1,$2) FOR UPDATE OF e`, ['PDM-01-089', 'PDM-01-088']);
    const karnavati = rows.find(r => r.machine_number === 'PDM-01-089');
    const roll = rows.find(r => r.machine_number === 'PDM-01-088');
    assert.ok(karnavati && roll && /Roll\s+Compactor/i.test(roll.machine_name));
    assert.equal(karnavati.id, original.id);
    assert.deepEqual(fields.map(f => karnavati[f]), replacement, 'Karnavati values changed since last edit');
    fs.writeFileSync('backups/roll-compactor-utilities-before-update.json', JSON.stringify(rows, null, 2), { flag: 'wx' });
    const update = 'UPDATE equipment_information_records SET utilities_power_supply=$1,utilities_air=$2,utilities_water=$3,utilities_other=$4,updated_at=NOW() WHERE id=$5 RETURNING *';
    const restored = (await c.query(update, [...fields.map(f => original[f]), karnavati.id])).rows[0];
    const updated = (await c.query(update, [...replacement, roll.id])).rows[0];
    assert.deepEqual(fields.map(f => restored[f]), fields.map(f => original[f]));
    assert.deepEqual(fields.map(f => updated[f]), replacement);
    await c.query('COMMIT');
    console.log(JSON.stringify({ restoredMachineId: karnavati.machine_id, updatedMachineId: roll.machine_id, updatedMachineNumber: roll.machine_number }));
  } catch (e) { await c.query('ROLLBACK'); throw e; }
  finally { await c.end(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
