const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
const fields = {
  name_of_equipment: 'Granulation Line200Kg/ FabTech\nFluid Bed Processor',
  model_number: 'FTIL-FBP-200',
  serial_number: 'N.A',
  identification_number: 'PDM-01-097B',
  date_purchased: '2020',
  purchased_from_name: 'a- Fabtech Technologies International Ltd',
  purchased_from_address: 'b- 717Janki centre off veera Desai Road\nAndeheri (W)Mumbai400053,India',
  manufacturing_company_name: 'a- Fabtech Technologies International Ltd',
  manufacturing_company_address: 'b- 717Janki centre off veera Desai Road\nAndeheri (W) Mumbai400053,India',
  dimension_width_cm: null,
  dimension_height_cm: null,
  dimension_depth_cm: null,
  dimensions_note: '1900L*2050W*4000H',
  weight_kg: null,
  weight_note: 'N.A',
  utilities_power_supply: '380volt 50Hz 180 HP 137.28 KW',
  utilities_air: '6 bar-28 CFM',
  utilities_water: 'Tap Water',
  utilities_other: 'Working 450 Liter-200Kg',
  others: '11.5. Drying Temperature\n11.6. Inlet Product Exhaust temp',
  others_details: '35-80 C\nRTD Sensor 0-150 C',
  safety_issues: 'Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning',
  safety_issues_details: '',
};
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const before = (await c.query('SELECT * FROM equipment_information_records ORDER BY id')).rows;
    const extras = (await c.query('SELECT * FROM additional_equipment_records ORDER BY id')).rows;
    const headers = (await c.query('SELECT * FROM form_headers ORDER BY id')).rows;
    const machines = (await c.query('SELECT * FROM machines ORDER BY id')).rows;
    assert.equal(machines.find(m => m.machine_number === 'PDM-01-097')?.id, 58);
    const original = before.filter(r => r.machine_id === 58);
    assert.equal(original.length, 1);
    const ownHeader = h => h.document_type === 'EQUIPMENT_INFORMATION' && h.document_id === 58;
    fs.writeFileSync('backups/fabtech-first-equipment-before-fill.json', JSON.stringify({ record: original[0], header: headers.filter(ownHeader) }, null, 2), { flag: 'wx' });
    const entries = Object.entries(fields);
    const saved = (await c.query(`UPDATE equipment_information_records SET ${entries.map(([key], i) => `${key}=$${i + 1}`).join(',')},updated_at=NOW() WHERE id=$${entries.length + 1} RETURNING *`, [...entries.map(([, value]) => value), original[0].id])).rows[0];
    for (const [key, value] of entries) assert.equal(saved[key], value);
    const headerValues = ['Beit Jala Pharmaceutical Co.', 'Equipment Information Record', 'FORM-10-0118-1', '2013-08-24'];
    const existing = headers.filter(ownHeader);
    assert.ok(existing.length <= 1);
    if (existing.length) {
      await c.query('UPDATE form_headers SET company_name=$1,document_name=$2,document_number=$3,effective_or_execution_date=$4,page_number=1,total_pages=1,updated_at=NOW() WHERE id=$5', [...headerValues, existing[0].id]);
    } else {
      await c.query("INSERT INTO form_headers(company_name,document_name,document_number,effective_or_execution_date,document_type,document_id,page_number,total_pages) VALUES($1,$2,$3,$4,'EQUIPMENT_INFORMATION',58,1,1)", headerValues);
    }
    assert.deepEqual((await c.query('SELECT * FROM equipment_information_records WHERE machine_id<>58 ORDER BY id')).rows, before.filter(r => r.machine_id !== 58));
    assert.deepEqual((await c.query('SELECT * FROM additional_equipment_records ORDER BY id')).rows, extras);
    assert.deepEqual((await c.query('SELECT * FROM form_headers ORDER BY id')).rows.filter(h => !ownHeader(h)), headers.filter(h => !ownHeader(h)));
    assert.deepEqual((await c.query('SELECT * FROM machines ORDER BY id')).rows, machines);
    await c.query('COMMIT');
    console.log('Filled PDM-01-097 equipment record 1 and its header. Records 2–6, all other records and machine master data unchanged.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
