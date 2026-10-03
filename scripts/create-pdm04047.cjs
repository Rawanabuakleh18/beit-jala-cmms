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
      WHERE regexp_replace(upper(m.machine_number), '\\s', '', 'g') = 'PDM-04-047'
         OR regexp_replace(upper(COALESCE(e.identification_number, '')), '\\s', '', 'g') = 'PDM-04-047'
      FOR UPDATE OF m
    `)).rows;
    if (existing.length) throw new Error('PDM-04-047 already exists; nothing was changed');

    const departments = (await client.query(
      "SELECT id, name FROM departments WHERE name = 'Production'",
    )).rows;
    if (departments.length !== 1) {
      throw new Error(`Expected one Production department, found ${departments.length}`);
    }

    fs.writeFileSync(
      `backups/pdm04047-before-create-${Date.now()}.json`,
      JSON.stringify({ existing, department: departments[0] }, null, 2),
      { flag: 'wx' },
    );

    const machine = (await client.query(`
      INSERT INTO machines
        (machine_number, machine_name, department_id, location, status,
         pm_frequency_months, pm_start_date)
      VALUES ('PDM-04-047', 'Suppositories Production Line', $1, NULL,
              'Active', NULL, NULL)
      RETURNING *
    `, [departments[0].id])).rows[0];

    const companyAddress = [
      'Italy',
      'Tel.: +390544965388',
      'FarmoRes@FarmoRes.com',
      'davide.forti@farmores.com',
      'valentina.casati@farmores.com',
    ].join('\n');

    const equipment = (await client.query(`
      INSERT INTO equipment_information_records
        (machine_id, name_of_equipment, model_number, serial_number,
         identification_number, date_purchased, purchased_from_name,
         purchased_from_address, manufacturing_company_name,
         manufacturing_company_address, dimension_width_cm,
         dimension_height_cm, dimension_depth_cm, weight_kg,
         utilities_power_supply, utilities_air, utilities_water,
         utilities_other, others, others_details, safety_issues,
         safety_issues_details)
      VALUES
        ($1, 'Suppositories Production Line', 'FD11/U', '79',
         'PDM-04-047', '6/2016', 'FarmoRes s.r.l', $2,
         'FarmoRes s.r.l', $2, 345.5, 247, 387.5, 1640,
         '400 V, 3 phase, 50/60 Hz\n18 KW', '6 bars',
         'Anti-freeze water (for chiller), 34-40 liters', 'N.A.',
         'Production Capacity', '11,000 suppositories/hr', '12.1',
         'Disconnect the electrical plug from the main power supply before performing any maintenance or cleaning.')
      RETURNING *
    `, [machine.id, companyAddress])).rows[0];

    if (
      equipment.identification_number !== 'PDM-04-047'
      || equipment.model_number !== 'FD11/U'
      || equipment.serial_number !== '79'
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
