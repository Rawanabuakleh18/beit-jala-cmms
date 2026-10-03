const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

const insert = async (table, data) => {
  const keys = Object.keys(data);
  return (await client.query(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_, index) => `$${index + 1}`).join(', ')}) RETURNING *`,
    Object.values(data),
  )).rows[0];
};

const withoutSystemFields = (row) => Object.fromEntries(
  Object.entries(row).filter(([key]) => !['id', 'machine_id', 'plan_id', 'year', 'created_at', 'updated_at'].includes(key)),
);

const replaceChillerId = (value) => typeof value === 'string'
  ? value.replaceAll('CH-5', 'CH-4').replaceAll('Chiller 5', 'Chiller 4')
  : value;

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');
    if ((await client.query("SELECT id FROM machines WHERE upper(trim(machine_number))='CH-4' AND deleted_at IS NULL")).rowCount) {
      throw Error('CH-4 already exists; nothing was changed');
    }
    const sourceResult = await client.query("SELECT * FROM machines WHERE upper(trim(machine_number))='CH-5' AND deleted_at IS NULL FOR UPDATE");
    if (sourceResult.rowCount !== 1) throw Error(`Expected one active CH-5 machine, found ${sourceResult.rowCount}`);
    const source = sourceResult.rows[0];
    const headers = (await client.query('SELECT * FROM pm_headers WHERE machine_id=$1 ORDER BY id', [source.id])).rows;
    const points = (await client.query('SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=$1 AND is_active=true ORDER BY sort_order,id', [source.id])).rows;
    const planRows = (await client.query(`SELECT p.id AS plan_id,p.year,r.* FROM annual_pm_plans p
      JOIN annual_pm_plan_rows r ON r.plan_id=p.id WHERE r.machine_id=$1 ORDER BY p.year`, [source.id])).rows;
    if (!points.length) throw Error('CH-5 has no active preventive-maintenance checklist points');
    if (!planRows.length) throw Error('CH-5 has no annual preventive-maintenance plan rows');
    fs.writeFileSync(`backups/ch4-before-create-${Date.now()}.json`, JSON.stringify({ source, headers, points, planRows }, null, 2), { flag: 'wx' });

    const machine = await insert('machines', {
      machine_number: 'CH-4', machine_name: 'Chiller 4 - Carrier', department_id: source.department_id,
      location: source.location, status: source.status, pm_frequency_months: source.pm_frequency_months,
      pm_start_date: source.pm_start_date,
    });

    const carrierAddress = 'Carrier – BP 49 Route de Thil\n01122 Montluel - France\nTelefax: (+33) 472252121\nFax: (+33) 472252251';
    await insert('equipment_information_records', {
      machine_id: machine.id, name_of_equipment: 'Chiller 4 - Carrier', model_number: '30RB0802-0289-PE-',
      serial_number: 'M2018003439', identification_number: 'CH-4', date_purchased: '2018',
      purchased_from_name: 'Carrier', purchased_from_address: carrierAddress,
      manufacturing_company_name: 'Carrier', manufacturing_company_address: carrierAddress,
      dimension_width_cm: 220, dimension_height_cm: 229, dimension_depth_cm: 718, weight_kg: 5943,
      utilities_power_supply: '400 VAC, 50 Hz, 438 Ampere',
      utilities_air: 'Normal air for cooling the gas in the condenser',
      utilities_water: 'Used for heat exchange in evaporator', utilities_other: 'Not Applicable',
      others: '11.1 Power input\n11.2 Refrigerant\n11.3 Charge circuit 1\n11.4 Charge circuit 2\n11.5 Charge circuit 3',
      others_details: '255 KW\nR-410A\n26 Kg.\n28 Kg.\n28 Kg.', safety_issues: '12.1\n12.2',
      safety_issues_details: 'Before performing any maintenance and cleaning activity ensure that the power supply is disconnected and switches and isolators are opened and tagged.\nBe careful because during operation some parts of the unit can reach or exceed temperatures of 70 C (e.g. compressor discharge side, discharge line).',
    });

    for (const header of headers) {
      const copied = Object.fromEntries(Object.entries(withoutSystemFields(header)).map(([key, value]) => [key, replaceChillerId(value)]));
      copied.machine_record_name = 'Chiller 4 - Carrier';
      copied.machine_record_id = 'CH-4';
      copied.service_area_machine_number = 'CH-4';
      await insert('pm_headers', { machine_id: machine.id, ...copied });
    }
    for (const point of points) await insert('pm_checklist_points', {
      machine_id: machine.id, point_text: replaceChillerId(point.point_text), result_type: point.result_type,
      sort_order: point.sort_order, is_active: true,
    });
    await insert('pm_records', { machine_id: machine.id, sequence_number: 1, status: 'active' });

    for (const sourceRow of planRows) {
      const copied = Object.fromEntries(Object.entries(withoutSystemFields(sourceRow)).map(([key, value]) => [key, replaceChillerId(value)]));
      copied.machine_name = 'Chiller 4 - Carrier';
      copied.machine_code = 'CH-4';
      await insert('annual_pm_plan_rows', { plan_id: sourceRow.plan_id, machine_id: machine.id, ...copied });
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({ id: machine.id, number: machine.machine_number, checklistPoints: points.length, pmHeaders: headers.length, annualPlanRows: planRows.length, frequencyMonths: machine.pm_frequency_months, startDate: machine.pm_start_date }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
