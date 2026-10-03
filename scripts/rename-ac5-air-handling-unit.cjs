const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = await client.query(`
      SELECT id FROM machines
      WHERE upper(trim(machine_number)) = 'AC-5' AND deleted_at IS NULL
      FOR UPDATE
    `);
    if (machines.rowCount !== 1) throw Error(`Expected one active AC-5 machine, found ${machines.rowCount}`);
    const machineId = machines.rows[0].id;
    const name = 'Air Handling Unit';

    await client.query('UPDATE machines SET machine_name=$1, updated_at=NOW() WHERE id=$2', [name, machineId]);
    await client.query('UPDATE equipment_information_records SET name_of_equipment=$1, updated_at=NOW() WHERE machine_id=$2', [name, machineId]);
    await client.query('UPDATE pm_headers SET machine_record_name=$1, updated_at=NOW() WHERE machine_id=$2', [name, machineId]);
    await client.query('COMMIT');
    console.log(JSON.stringify({ machineId, machineNumber: 'AC-5', machineName: name }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
