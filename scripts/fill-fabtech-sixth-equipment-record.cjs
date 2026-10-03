const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
const changes = {
  nameOfEquipment: 'Granulation Line200Kg/ FabTech\nWash In Place System 200L',
  modelNumber: 'WIP-200 L',
  serialNumber: 'N.A',
  identificationNumber: 'PDM-01-097G',
  datePurchased: '2020',
  purchasedFromName: 'a- Fabtech Technologies International Ltd',
  purchasedFromAddress: 'b- 717Janki centre off veera Desai Road\nAndheri (W)Mumbai400053,India',
  manufacturingCompanyName: 'a- Fabtech Technologies International Ltd',
  manufacturingCompanyAddress: 'b- 717 Janki centre off veera Desai Road\nAndheri (W) Mumbai400053,India',
  dimensionWidthCm: null,
  dimensionHeightCm: null,
  dimensionDepthCm: null,
  dimensionsNote: 'As Built Drawing',
  weightKg: null,
  weightNote: 'N.A',
  utilitiesPowerSupply: '3Ph-380 V.50 Hz-1Ph 220 V 50 Hz 18 Kw',
  utilitiesAir: '6 -8 Kg/ Cm2',
  utilitiesWater: 'Tap Water pressure 2 bar',
  utilitiesOther: '-\n2 inch Penumatic ally Operated Diaphragem Valve',
  others: '11.5.\n11.6.',
  othersDetails: '',
  safetyIssues: 'Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning',
  safetyIssuesDetails: '',
};
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
    const target = before.find(r => r.machine_id === 58 && r.record_number === 6);
    assert.ok(target);
    assert.ok(['PDM-01-097', 'PDM-01-097G'].includes(target.data.identificationNumber));
    if (Object.entries(changes).every(([key, value]) => target.data[key] === value)) {
      await c.query('COMMIT');
      console.log('Record 6 already matches the source.');
      return;
    }
    fs.writeFileSync('backups/fabtech-sixth-equipment-before-fill.json', JSON.stringify(target, null, 2), { flag: 'wx' });
    const saved = (await c.query('UPDATE additional_equipment_records SET data=data || $1::jsonb,updated_at=NOW() WHERE id=$2 RETURNING *', [JSON.stringify(changes), target.id])).rows[0];
    assert.deepEqual(saved.data, { ...target.data, ...changes });
    assert.deepEqual(saved.header, target.header);
    assert.deepEqual((await c.query('SELECT * FROM additional_equipment_records WHERE id<>$1 ORDER BY id', [target.id])).rows, before.filter(r => r.id !== target.id));
    assert.deepEqual((await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows, originals);
    await c.query('COMMIT');
    const persisted = (await c.query('SELECT data FROM additional_equipment_records WHERE id=$1', [target.id])).rows[0];
    assert.deepEqual(persisted.data, saved.data);
    console.log('Record 6 filled and verified against the source. Other records unchanged.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
