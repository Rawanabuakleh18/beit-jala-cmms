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

const renamedHeader = (header) => Object.fromEntries(
  Object.entries(header)
    .filter(([key]) => !['id', 'machine_id', 'created_at', 'updated_at'].includes(key))
    .map(([key, value]) => [key, typeof value === 'string' ? value.replaceAll('AC-5', 'AC-6').replaceAll('ac-5', 'AC-6') : value]),
);

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');
    if ((await client.query("SELECT id FROM machines WHERE upper(trim(machine_number))='AC-6'")).rowCount) {
      throw Error('AC-6 already exists; nothing was changed');
    }
    const sources = await client.query("SELECT * FROM machines WHERE upper(trim(machine_number))='AC-5' AND deleted_at IS NULL");
    if (sources.rowCount !== 1) throw Error(`Expected one active AC-5 machine, found ${sources.rowCount}`);
    const source = sources.rows[0];

    const machine = await insert('machines', {
      machine_number: 'AC-6', machine_name: 'Air Handling Unit', department_id: source.department_id,
      location: source.location, status: source.status, pm_frequency_months: source.pm_frequency_months,
      pm_start_date: source.pm_start_date,
    });

    const companyAddress = 'Holon - Hapeled St. / Israel\nTel: 03-5591738\nFax: 03-5590173';
    await insert('equipment_information_records', {
      machine_id: machine.id, name_of_equipment: 'Air Handling Unit', model_number: 'Not Available',
      serial_number: 'Not Available', identification_number: 'AC-6', date_purchased: '1995',
      purchased_from_name: 'Haroshet Co.', purchased_from_address: companyAddress,
      manufacturing_company_name: 'Haroshet Co.', manufacturing_company_address: companyAddress,
      dimension_width_cm: 185, dimension_height_cm: 180, dimension_depth_cm: 185,
      weight_kg: null, weight_note: 'Not Available',
      utilities_power_supply: '3 phase, 380 Volt, 5.5 HP',
      utilities_air: 'Fresh Air\nVKA\n450', utilities_water: 'Hot and Cold water', utilities_other: 'Not Applicable',
      others: '11.1 Air Flow rate\n11.2 Motor speed', others_details: '4045\n1450 RPM',
      safety_issues: '12.1', safety_issues_details: 'Switch off the machine before maintaining and cleaning.',
    });

    const headers = (await client.query('SELECT * FROM pm_headers WHERE machine_id=$1', [source.id])).rows;
    for (const header of headers) {
      const copied = renamedHeader(header);
      copied.machine_record_name = 'Air Handling Unit';
      copied.machine_record_id = 'AC-6';
      copied.service_area_machine_number = 'AC-6';
      await insert('pm_headers', { machine_id: machine.id, ...copied });
    }

    const points = (await client.query('SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=$1 AND is_active=true ORDER BY sort_order,id', [source.id])).rows;
    if (!points.length) throw Error('AC-5 has no active checklist points');
    for (const point of points) await insert('pm_checklist_points', {
      machine_id: machine.id, point_text: point.point_text, result_type: point.result_type,
      sort_order: point.sort_order, is_active: true,
    });
    await insert('pm_records', { machine_id: machine.id, sequence_number: 1, status: 'active' });
    await client.query('COMMIT');
    console.log(JSON.stringify({ id: machine.id, number: machine.machine_number, name: machine.machine_name, checklistPoints: points.length, pmHeaders: headers.length, frequencyMonths: machine.pm_frequency_months, startDate: machine.pm_start_date }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
