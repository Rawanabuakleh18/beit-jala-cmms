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
  Object.entries(row).filter(([key]) => !['id', 'machine_id', 'created_at', 'updated_at'].includes(key)),
);

const rename = (value) => typeof value === 'string'
  ? value.replaceAll('AC-3', 'AC-4').replaceAll('ac-3', 'AC-4')
  : value;

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');

    const existing = await client.query("SELECT id FROM machines WHERE upper(trim(machine_number)) = 'AC-4'");
    if (existing.rowCount !== 0) throw Error('AC-4 already exists; nothing was changed');
    const sources = await client.query("SELECT * FROM machines WHERE upper(trim(machine_number)) = 'AC-3' AND deleted_at IS NULL");
    if (sources.rowCount !== 1) throw Error(`Expected one active AC-3 machine, found ${sources.rowCount}`);
    const source = sources.rows[0];

    const machine = await insert('machines', {
      machine_number: 'AC-4', machine_name: source.machine_name,
      department_id: source.department_id, location: source.location, status: source.status,
      pm_frequency_months: source.pm_frequency_months, pm_start_date: source.pm_start_date,
    });

    const equipment = (await client.query('SELECT * FROM equipment_information_records WHERE machine_id=$1 ORDER BY id', [source.id])).rows;
    if (!equipment.length) throw Error('AC-3 has no equipment-information record');
    for (const record of equipment) {
      const copied = Object.fromEntries(Object.entries(withoutSystemFields(record)).map(([key, value]) => [key, rename(value)]));
      copied.identification_number = 'AC-4';
      await insert('equipment_information_records', { machine_id: machine.id, ...copied });
    }

    const headers = (await client.query('SELECT * FROM pm_headers WHERE machine_id=$1', [source.id])).rows;
    for (const header of headers) {
      const copied = Object.fromEntries(Object.entries(withoutSystemFields(header)).map(([key, value]) => [key, rename(value)]));
      copied.machine_record_id = 'AC-4';
      copied.service_area_machine_number = 'AC-4';
      await insert('pm_headers', { machine_id: machine.id, ...copied });
    }

    const points = (await client.query(`SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=$1 AND is_active=true ORDER BY sort_order,id`, [source.id])).rows;
    if (!points.length) throw Error('AC-3 has no active checklist points');
    for (const point of points) await insert('pm_checklist_points', {
      machine_id: machine.id, point_text: rename(point.point_text), result_type: point.result_type,
      sort_order: point.sort_order, is_active: true,
    });

    await insert('pm_records', { machine_id: machine.id, sequence_number: 1, status: 'active' });
    await client.query('COMMIT');
    console.log(JSON.stringify({ id: machine.id, number: machine.machine_number, equipmentRecords: equipment.length, checklistPoints: points.length, pmHeaders: headers.length, frequencyMonths: machine.pm_frequency_months, startDate: machine.pm_start_date }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
