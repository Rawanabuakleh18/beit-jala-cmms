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
    const records = (await c.query(`SELECT e.*,m.machine_number,m.machine_name FROM equipment_information_records e JOIN machines m ON m.id=e.machine_id WHERE m.machine_number IN ($1,$2) FOR UPDATE OF e`, ['PDM-01-089', 'PDM-01-088'])).rows;
    const record = records.find(r => r.machine_number === 'PDM-01-089');
    const roll = records.find(r => r.machine_number === 'PDM-01-088');
    assert.ok(record && /Karnavati/i.test(record.machine_name));
    assert.equal(record.machine_id, 5);
    fs.writeFileSync('backups/karnavati-specific-utilities-before-update.json', JSON.stringify(records, null, 2), { flag: 'wx' });
    const values = ['415V AC/3Q/50-60 HZ 2.5mm2-5Core with Earthing', '5 to 8 kg/cm2', 'Auto Lubrication System', '25mm'];
    const saved = (await c.query('UPDATE equipment_information_records SET utilities_power_supply=$1,utilities_air=$2,utilities_water=$3,utilities_other=$4,updated_at=NOW() WHERE id=$5 RETURNING utilities_power_supply,utilities_air,utilities_water,utilities_other', [...values, record.id])).rows[0];
    assert.deepEqual(Object.values(saved), values);
    if (roll) {
      const unchanged = (await c.query('SELECT * FROM equipment_information_records WHERE id=$1', [roll.id])).rows[0];
      for (const key of ['utilities_power_supply','utilities_air','utilities_water','utilities_other']) assert.equal(unchanged[key], roll[key]);
    }
    await c.query('COMMIT');
    console.log(JSON.stringify({ machine: 'PDM-01-089', ...saved, rollCompactorUnchanged: true }));
  } catch (e) { await c.query('ROLLBACK'); throw e; }
  finally { await c.end(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
