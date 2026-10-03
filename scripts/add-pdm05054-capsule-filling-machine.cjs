const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const { Client } = createRequire(resolve('lib/db/package.json'))('pg');

const machineNumber = 'PDM-05-054';
const machineName = 'Automatic Capsule Filling Machine PF-40';

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');

    const matches = (await client.query(`
      SELECT m.*, d.name AS department
      FROM machines m
      LEFT JOIN departments d ON d.id=m.department_id
      WHERE regexp_replace(upper(m.machine_number), '\\s', '', 'g') = 'PDM-05-054'
      FOR UPDATE OF m
    `)).rows;
    if (matches.length > 1) throw new Error(`Found ${matches.length} matching machines; nothing was changed`);

    let machine = matches[0];
    let created = false;
    if (!machine) {
      const departments = (await client.query("SELECT id FROM departments WHERE lower(name)='production'")).rows;
      assert.equal(departments.length, 1, 'Expected exactly one Production department');
      machine = (await client.query(`
        INSERT INTO machines (machine_number, machine_name, department_id, location, status)
        VALUES ($1, $2, $3, '', 'Active')
        RETURNING *
      `, [machineNumber, machineName, departments[0].id])).rows[0];
      created = true;
    }

    const existing = (await client.query(
      'SELECT * FROM equipment_information_records WHERE machine_id=$1 FOR UPDATE',
      [machine.id],
    )).rows;
    if (existing.length) {
      throw new Error(`${machineNumber} already has an equipment-information record; nothing was changed`);
    }

    const backupPath = `backups/pdm05054-before-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify({ machineBefore: matches[0] || null, equipmentBefore: existing }, null, 2), { flag: 'wx' });

    const equipment = (await client.query(`
      INSERT INTO equipment_information_records (
        machine_id, name_of_equipment, model_number, serial_number,
        identification_number, date_purchased,
        purchased_from_name, purchased_from_address,
        manufacturing_company_name, manufacturing_company_address,
        dimension_width_cm, dimension_height_cm, dimension_depth_cm, dimensions_note,
        weight_kg, utilities_power_supply, utilities_air, utilities_water, utilities_other,
        others, others_details, safety_issues, safety_issues_details
      ) VALUES (
        $1, $2, 'PF-40', 'N.A', 'PDM-05-054', '2019',
        'a- Fab tech Technologies International ltd',
        'b-717 Janki Centre, off vera Desai Road, Andheri(w)\nMumbai-India',
        'a- Paci Fab Technologies LLP',
        'b- Unit 19,20,21 Ashapura-Industrial Estate,\noppwalva Devi mandr-mumbai -India',
        NULL, NULL, NULL, '2420*2200*3930 mm',
        2800, '380 V AC Three Phase, 50 HZ, 21 amp, 8 kW', '6 kg/cm2', '40-50% RH', '80 dB at maximum',
        '11.5. Room Temperature\n11.6. Vacuum Pump Flow', '20-25C\n1100 lpm',
        'Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning', ''
      ) RETURNING *
    `, [machine.id, machineName])).rows[0];

    const verified = (await client.query(`
      SELECT m.machine_number, m.machine_name, d.name AS department, e.*
      FROM machines m
      JOIN departments d ON d.id=m.department_id
      JOIN equipment_information_records e ON e.machine_id=m.id
      WHERE m.id=$1
    `, [machine.id])).rows;
    assert.equal(verified.length, 1);
    assert.equal(verified[0].identification_number, machineNumber);
    assert.equal(verified[0].model_number, 'PF-40');
    assert.equal(verified[0].weight_kg, '2800.00');
    assert.equal(equipment.machine_id, machine.id);

    await client.query('COMMIT');
    console.log(JSON.stringify({ created, machineId: machine.id, machineNumber, machineName, backupPath, verified: true }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
