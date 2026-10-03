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
    assert.equal((await c.query("SELECT id FROM machines WHERE regexp_replace(machine_number,'\\s','','g')='AC1/1'")).rowCount, 0, 'AC1/1 already exists; refusing to duplicate or overwrite it.');
    const sources = (await c.query("SELECT * FROM machines WHERE regexp_replace(machine_number,'\\s','','g')='AC1/2' AND deleted_at IS NULL")).rows;
    assert.equal(sources.length, 1);
    const source = sources[0];
    const tables = ['machines', 'equipment_information_records', 'pm_headers', 'pm_checklist_points', 'pm_records', 'pm_inspections', 'pm_inspection_results'];
    const before = {};
    for (const table of tables) before[table] = (await c.query(`SELECT * FROM ${table} ORDER BY id`)).rows;
    const header = before.pm_headers.find(h => h.machine_id === source.id);
    const points = before.pm_checklist_points.filter(p => p.machine_id === source.id && p.is_active).sort((a,b) => a.sort_order-b.sort_order || a.id-b.id);
    assert.ok(header);
    assert.equal(points.length, 35);
    fs.writeFileSync(`backups/ac11-before-create-${Date.now()}.json`, JSON.stringify(before, null, 2), { flag: 'wx' });
    const insert = async (table, data) => {
      const keys = Object.keys(data);
      return (await c.query(`INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map((_,i) => '$'+(i+1)).join(',')}) RETURNING *`, Object.values(data))).rows[0];
    };
    const machine = await insert('machines', {
      machine_number: 'AC 1/1', machine_name: 'Air Handling Unit', department_id: source.department_id,
      location: source.location, status: 'Active', pm_frequency_months: source.pm_frequency_months, pm_start_date: '2026-04-01',
    });
    const equipment = {
      name_of_equipment: 'Air Handling Unit', model_number: '39FD-450', serial_number: '990961EE',
      identification_number: machine.machine_number, date_purchased: '1999',
      purchased_from_name: 'Carrier – BP 49 Route de Thil',
      purchased_from_address: '01122 Montluel - France\nTelefax: (+33) 472252121\nFax: (+33) 472252251',
      manufacturing_company_name: 'Carrier – BP 49 Route de Thil',
      manufacturing_company_address: '01122 Montluel - France\nTelefax: (+33) 472252121\nFax: (+33) 472252251',
      dimension_width_cm: 305, dimension_height_cm: 143, dimension_depth_cm: 184, weight_kg: 1187,
      utilities_power_supply: '400 VAC, 50 Hz', utilities_air: 'Not Applicable', utilities_water: 'Not Applicable', utilities_other: 'Not Applicable',
      others: '11.1 Air flow\n11.2 Service area', others_details: '3916 L/s\nTemporary solid dosage section',
      safety_issues: '12.1\n12.2', safety_issues_details: 'Disconnect the main power supply circuit breaker before performing any maintenance and cleaning activity.',
    };
    await insert('equipment_information_records', { machine_id: machine.id, ...equipment });
    const fields = Object.keys(header).filter(k => !['id','machine_id','created_at','updated_at'].includes(k));
    const copied = Object.fromEntries(fields.map(k => [k, typeof header[k] === 'string' ? header[k].replaceAll(source.machine_number, machine.machine_number) : header[k]]));
    copied.machine_record_id = machine.machine_number;
    copied.service_area_machine_number = machine.machine_number;
    copied.service_area_location = 'Temporary solid dosage section';
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
    console.log(JSON.stringify({ id: machine.id, number: machine.machine_number, checklistPoints: expectedPoints.length, equipmentVerified: true, pmHeaderVerified: true, existingRecordsUnchanged: true }));
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
