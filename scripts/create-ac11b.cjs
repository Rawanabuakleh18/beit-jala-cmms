const { createRequire } = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    await c.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');
    assert.equal((await c.query("SELECT id FROM machines WHERE regexp_replace(machine_number,'\\s','','g')='AC1/1B'")).rowCount, 0, 'AC1/1B already exists; refusing to duplicate or overwrite it.');
    const sources = (await c.query("SELECT * FROM machines WHERE regexp_replace(machine_number,'\\s','','g')='AC1/1A' AND deleted_at IS NULL")).rows;
    assert.equal(sources.length, 1);
    const source = sources[0];
    const tables = ['machines', 'equipment_information_records', 'pm_headers', 'pm_checklist_points', 'pm_records', 'pm_inspections', 'pm_inspection_results'];
    const before = {};
    for (const table of tables) before[table] = (await c.query(`SELECT * FROM ${table} ORDER BY id`)).rows;
    const header = before.pm_headers.find(h => h.machine_id === source.id);
    const points = before.pm_checklist_points.filter(p => p.machine_id === source.id && p.is_active).sort((a,b) => a.sort_order-b.sort_order || a.id-b.id);
    assert.ok(header);
    assert.equal(points.length, 35);
    fs.writeFileSync(`backups/ac11b-before-create-${Date.now()}.json`, JSON.stringify(before, null, 2), { flag: 'wx' });
    const insert = async (table, data) => {
      const keys = Object.keys(data);
      return (await c.query(`INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map((_,i) => '$'+(i+1)).join(',')}) RETURNING *`, Object.values(data))).rows[0];
    };
    const machine = await insert('machines', {
      machine_number: 'AC 1/1 B', machine_name: 'Air Handling Unit', department_id: source.department_id,
      location: 'QA roof', status: 'Active', pm_frequency_months: source.pm_frequency_months, pm_start_date: source.pm_start_date,
    });
    const equipment = {
  "name_of_equipment": "Air handling unit",
  "model_number": "PAHHC80C6H2",
  "serial_number": "NA",
  "identification_number": "AC 1/1 B",
  "date_purchased": "07/05/2011",
  "purchased_from_name": "Top service",
  "purchased_from_address": "Ramallah, Palestine, TEL: 02-2964966",
  "manufacturing_company_name": "Petra engineering",
  "manufacturing_company_address": "Jordan/ Amman:\nTel: (962 6) 405 09 40",
  "dimensions_note": "3670 X 1390 X 1740 mm (Length X Height X Width)",
  "weight_note": "N.A",
  "utilities_power_supply": "400volt-50hz,3ph, 5.5 Kw",
  "utilities_air": "NA",
  "utilities_water": "One cooling coil, and one heating coil",
  "utilities_other": "20 Kg/hr steam humidifier",
  "others": "11.1 Air flow\n11.2 Position\n11.3 Serviced area",
  "others_details": "6700 CFM\nQA roof\nTo Blistering rooms, 140 and 140, 1st floor",
  "safety_issues": "Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning.",
  "safety_issues_details": null
};
    await insert('equipment_information_records', { machine_id: machine.id, ...equipment });
    const fields = Object.keys(header).filter(k => !['id','machine_id','created_at','updated_at'].includes(k));
    const copied = Object.fromEntries(fields.map(k => [k, typeof header[k] === 'string' ? header[k].replaceAll(source.machine_number, machine.machine_number) : header[k]]));
    copied.machine_record_id = machine.machine_number;
    copied.service_area_machine_number = machine.machine_number;
    copied.service_area_location = 'To Blistering rooms, 140 and 140, 1st floor';
    await insert('pm_headers', { machine_id: machine.id, ...copied });
    const expectedPoints = points.map(p => ({ point_text: p.point_text.replaceAll(source.machine_number, machine.machine_number), result_type: p.result_type, sort_order: p.sort_order }));
    for (const point of expectedPoints) await insert('pm_checklist_points', { machine_id: machine.id, ...point, is_active: true });
    await insert('pm_records', { machine_id: machine.id, sequence_number: 1, status: 'active' });
    const savedEquipment = (await c.query('SELECT * FROM equipment_information_records WHERE machine_id=$1', [machine.id])).rows[0];
    for (const [key,value] of Object.entries(equipment)) assert.equal(typeof value === 'number' ? Number(savedEquipment[key]) : savedEquipment[key], value);
    const savedHeader = (await c.query('SELECT * FROM pm_headers WHERE machine_id=$1', [machine.id])).rows[0];
    assert.deepEqual(Object.fromEntries(fields.map(k => [k,savedHeader[k]])), copied);
    assert.deepEqual((await c.query('SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order,id', [machine.id])).rows, expectedPoints);
    for (const table of tables) {
      const after = (await c.query(`SELECT * FROM ${table} ORDER BY id`)).rows;
      assert.deepEqual(after.filter(r => table === 'machines' ? r.id !== machine.id : r.machine_id !== machine.id), before[table]);
    }
    await c.query('COMMIT');
    assert.equal((await c.query('SELECT id FROM machines WHERE id=$1', [machine.id])).rowCount, 1);
    console.log(JSON.stringify({ id: machine.id, number: machine.machine_number, checklistPoints: expectedPoints.length, startDate: machine.pm_start_date, frequencyMonths: machine.pm_frequency_months, equipmentVerified: true, pmHeaderVerified: true, existingRecordsUnchanged: true }));
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
