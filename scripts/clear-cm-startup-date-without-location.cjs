const { Client } = require("pg");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN");
    const changed = await client.query(`
      UPDATE corrective_maintenance_records
      SET startup_date = NULL, updated_at = NOW()
      WHERE (machine_location IS NULL OR trim(machine_location) = '')
        AND startup_date IS NOT NULL
      RETURNING id, machine_id, startup_date
    `);
    const remaining = await client.query(`
      SELECT count(*)::int AS count
      FROM corrective_maintenance_records
      WHERE (machine_location IS NULL OR trim(machine_location) = '')
        AND startup_date IS NOT NULL
    `);
    await client.query("COMMIT");
    console.log(JSON.stringify({
      updatedRecords: changed.rowCount,
      remaining: remaining.rows[0].count,
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
