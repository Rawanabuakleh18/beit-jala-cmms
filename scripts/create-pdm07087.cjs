const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const { Client } = createRequire(resolve('lib/db/package.json'))('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');

    const existing = (await client.query(`
      SELECT m.id, m.machine_number, m.machine_name, e.identification_number
      FROM machines m
      LEFT JOIN equipment_information_records e ON e.machine_id=m.id
      WHERE regexp_replace(upper(m.machine_number), '\\s', '', 'g')='PDM-07-087'
         OR regexp_replace(upper(COALESCE(e.identification_number, '')), '\\s', '', 'g')='PDM-07-087'
         OR m.machine_name ILIKE '%uhlmann%blister%'
      FOR UPDATE OF m
    `)).rows;
    if (existing.length) throw new Error('PDM-07-087 already exists; nothing was changed');

    const departments = (await client.query("SELECT id, name FROM departments WHERE name='Production'")).rows;
    assert.equal(departments.length, 1, 'Expected exactly one Production department');

    const backupPath = `backups/pdm07087-before-create-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify({ existing, department: departments[0] }, null, 2), { flag: 'wx' });

    const machine = (await client.query(`
      INSERT INTO machines(machine_number, machine_name, department_id, location, status)
      VALUES('PDM-07-087', 'Uhlmann Blister Packing Machine', $1, '', 'Active')
      RETURNING *
    `, [departments[0].id])).rows[0];

    const equipment = (await client.query(`
      INSERT INTO equipment_information_records(
        machine_id, name_of_equipment, model_number, serial_number,
        identification_number, date_purchased,
        purchased_from_name, purchased_from_address,
        manufacturing_company_name, manufacturing_company_address,
        dimension_width_cm, dimension_height_cm, dimension_depth_cm,
        weight_kg, utilities_power_supply, utilities_air, utilities_water,
        utilities_other, others, others_details, safety_issues, safety_issues_details
      ) VALUES(
        $1, 'Uhlmann Blister Packing Machine', 'B1240', '059/1706',
        'PDM-07-087', '9/2009',
        'a-uhlmann Pac-system Gmbh&co', 'b-Tel;+49(0)7392/702-0\nemail:css@uhlmann.de',
        'a-uhlmann Pac-system Gmbh&Co', 'b-Tel;+49(0)7392/702-0\nemail:css@uhlmann.de',
        126.6, 204.5, 509.6, 1900,
        'Power supply 380 Volts, 50 Hz, 8KW', '6-8 bar', 'For cooling',
        'Not Applicable', '', '',
        'Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning activity.', ''
      ) RETURNING *
    `, [machine.id])).rows[0];

    const verified = (await client.query(`
      SELECT m.id, m.machine_number, m.machine_name, m.status,
             d.name AS department, e.*
      FROM machines m
      JOIN departments d ON d.id=m.department_id
      JOIN equipment_information_records e ON e.machine_id=m.id
      WHERE m.id=$1
    `, [machine.id])).rows;
    assert.equal(verified.length, 1);
    assert.equal(equipment.identification_number, 'PDM-07-087');
    assert.equal(equipment.model_number, 'B1240');
    assert.equal(equipment.serial_number, '059/1706');
    assert.equal(equipment.weight_kg, '1900.00');

    await client.query('COMMIT');
    console.log(JSON.stringify({
      machineId: machine.id,
      machineNumber: machine.machine_number,
      machineName: machine.machine_name,
      department: departments[0].name,
      equipmentRecordId: equipment.id,
      backupPath,
      verified: true,
    }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode=1; });
