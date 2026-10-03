const { Client } = require("pg");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN");

    const matches = await client.query(`
      SELECT id, machine_number, machine_name, location
      FROM machines
      WHERE lower(trim(coalesce(location, ''))) IN (
        'engineering and maintenance',
        'production'
      )
      ORDER BY id
    `);

    const machineIds = matches.rows.map((row) => row.id);
    if (machineIds.length) {
      await client.query(
        `UPDATE machines
         SET location = NULL, updated_at = NOW()
         WHERE id = ANY($1::int[])`,
        [machineIds],
      );

      await client.query(
        `UPDATE corrective_maintenance_records
         SET machine_location = NULL, updated_at = NOW()
         WHERE machine_id = ANY($1::int[])`,
        [machineIds],
      );
    }

    const remainingMachines = await client.query(`
      SELECT count(*)::int AS count
      FROM machines
      WHERE lower(trim(coalesce(location, ''))) IN (
        'engineering and maintenance',
        'production'
      )
    `);
    const remainingCorrectiveRecords = await client.query(`
      SELECT count(*)::int AS count
      FROM corrective_maintenance_records
      WHERE lower(trim(coalesce(machine_location, ''))) IN (
        'engineering and maintenance',
        'production'
      )
    `);

    await client.query("COMMIT");
    console.log(JSON.stringify({
      updated: matches.rowCount,
      machines: matches.rows,
      remainingMachines: remainingMachines.rows[0].count,
      remainingCorrectiveRecords: remainingCorrectiveRecords.rows[0].count,
    }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
