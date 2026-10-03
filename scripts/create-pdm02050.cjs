const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');

    const existing = (await client.query(`
      SELECT m.id, m.machine_number, e.identification_number
      FROM machines m
      LEFT JOIN equipment_information_records e ON e.machine_id = m.id
      WHERE regexp_replace(upper(m.machine_number), '\\s', '', 'g') = 'PDM-02-050'
         OR regexp_replace(upper(COALESCE(e.identification_number, '')), '\\s', '', 'g') = 'PDM-02-050'
      FOR UPDATE OF m
    `)).rows;
    if (existing.length) throw new Error('PDM-02-050 already exists; nothing was changed');

    const departments = (await client.query(
      "SELECT id, name FROM departments WHERE name = 'Production'",
    )).rows;
    if (departments.length !== 1) {
      throw new Error(`Expected one Production department, found ${departments.length}`);
    }

    fs.writeFileSync(
      `backups/pdm02050-before-create-${Date.now()}.json`,
      JSON.stringify({ existing, department: departments[0] }, null, 2),
      { flag: 'wx' },
    );

    const machine = (await client.query(`
      INSERT INTO machines
        (machine_number, machine_name, department_id, location, status,
         pm_frequency_months, pm_start_date)
      VALUES ('PDM-02-050', 'Contec Capping Machine', $1, NULL, 'Active', NULL, NULL)
      RETURNING *
    `, [departments[0].id])).rows[0];

    const companyAddress = [
      'Via Navigazione 62/A, Ferrara',
      'E-mail: info@contec-group.it',
    ].join('\n');

    const equipment = (await client.query(`
      INSERT INTO equipment_information_records
        (machine_id, name_of_equipment, model_number, serial_number,
         identification_number, date_purchased, purchased_from_name,
         purchased_from_address, manufacturing_company_name,
         manufacturing_company_address, dimension_width_cm,
         dimension_height_cm, dimension_depth_cm, weight_kg,
         utilities_power_supply, utilities_air, utilities_water,
         utilities_other, safety_issues, safety_issues_details)
      VALUES
        ($1, 'Contec Capping Machine', 'CM/RE-500', 'CM/RE-003',
         'PDM-02-050', '7-2018', 'Contec Global Automation Service',
         $2, 'Contec Global Automation Service', $2, 52, 100, 50, 50,
         '220 V AC / 50 Hz / 2.8 A', '4 Bar', 'N.A', 'N.A', '12.1',
         'Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning.')
      RETURNING *
    `, [machine.id, companyAddress])).rows[0];

    if (
      equipment.identification_number !== 'PDM-02-050'
      || equipment.model_number !== 'CM/RE-500'
      || equipment.serial_number !== 'CM/RE-003'
    ) {
      throw new Error('Equipment record verification failed');
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({
      id: machine.id,
      machineNumber: machine.machine_number,
      machineName: machine.machine_name,
      department: departments[0].name,
      equipmentRecord: equipment.id,
    }));
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
