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
    const machines = (await c.query('SELECT id,machine_name FROM machines WHERE machine_number=$1', ['PDM-01-097'])).rows;
    assert.equal(machines.length, 1);
    const machine = machines[0];
    assert.equal(machine.id, 58);
    const before = (await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows;
    const extrasBefore = (await c.query('SELECT * FROM additional_equipment_records ORDER BY id')).rows;
    const header = (await c.query("SELECT * FROM form_headers WHERE document_type='EQUIPMENT_INFORMATION' AND document_id=$1", [machine.id])).rows[0];
    fs.writeFileSync('backups/fabtech-equipment-before-six-records.json', JSON.stringify({ original: before.filter(r => r.machine_id === machine.id), extra: extrasBefore.filter(r => r.machine_id === machine.id), header }, null, 2), { flag: 'wx' });
    await c.query(fs.readFileSync('lib/db/migrations/20260917_fabtech_six_equipment_records.sql', 'utf8'));
    if (!before.some(r => r.machine_id === machine.id)) {
      await c.query('INSERT INTO equipment_information_records(machine_id,name_of_equipment,identification_number) VALUES($1,$2,$3)', [machine.id, machine.machine_name, 'PDM-01-097']);
    }
    const headerData = { companyName: header?.company_name || 'Beit Jala Pharmaceutical Co.', documentName: header?.document_name || 'Equipment Information Record', documentNumber: header?.document_number || 'FORM-10-0118', effectiveOrExecutionDate: header?.effective_or_execution_date || null, pageNumber: 1, totalPages: 1 };
    const data = { nameOfEquipment: machine.machine_name, identificationNumber: 'PDM-01-097', dimensionWidthCm: null, dimensionHeightCm: null, dimensionDepthCm: null, weightKg: null };
    for (let n = 2; n <= 6; n++) {
      await c.query('INSERT INTO additional_equipment_records(machine_id,record_number,data,header) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING', [machine.id, n, JSON.stringify(data), JSON.stringify(headerData)]);
    }
    const after = (await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows;
    const extrasAfter = (await c.query('SELECT * FROM additional_equipment_records ORDER BY id')).rows;
    assert.deepEqual(after.filter(r => r.machine_id !== machine.id), before.filter(r => r.machine_id !== machine.id));
    assert.deepEqual(extrasAfter.filter(r => r.machine_id !== machine.id), extrasBefore.filter(r => r.machine_id !== machine.id));
    assert.deepEqual(extrasAfter.filter(r => r.machine_id === machine.id).map(r => r.record_number), [2, 3, 4, 5, 6]);
    // Exercise a record edit and roll it back, verifying the other records stay intact.
    await c.query('SAVEPOINT isolation_check');
    await c.query("UPDATE additional_equipment_records SET data=data || '{\"nameOfEquipment\":\"isolation check\"}'::jsonb WHERE machine_id=$1 AND record_number=6", [machine.id]);
    assert.deepEqual((await c.query('SELECT * FROM additional_equipment_records WHERE NOT(machine_id=$1 AND record_number=6) ORDER BY id', [machine.id])).rows, extrasAfter.filter(r => !(r.machine_id === machine.id && r.record_number === 6)));
    assert.deepEqual((await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows, after);
    await c.query('ROLLBACK TO SAVEPOINT isolation_check');
    await c.query('COMMIT');
    console.log('PDM-01-097: six independent equipment records ready. Other machines unchanged; isolation check passed.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
