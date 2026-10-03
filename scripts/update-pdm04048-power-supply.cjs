const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const before = (await client.query(`
      SELECT e.id, e.utilities_power_supply, e.utilities_air, e.dimensions_note
      FROM equipment_information_records e
      JOIN machines m ON m.id = e.machine_id
      WHERE m.machine_number = 'PDM-04-048'
      FOR UPDATE OF e
    `)).rows;
    if (before.length !== 1) throw new Error(`Expected one PDM-04-048 equipment record, found ${before.length}`);
    fs.writeFileSync(
      `backups/pdm04048-power-before-${Date.now()}.json`,
      JSON.stringify(before[0], null, 2),
      { flag: 'wx' },
    );
    const power = '380VOLT A.C MIXING MOTOR1.5KW\nEMULSION MOTOR 4.0KW';
    const [updated] = (await client.query(`
      UPDATE equipment_information_records
      SET utilities_power_supply = $1,
          utilities_air = '8 BAR',
          dimensions_note = '1- 900*1850*900 MM',
          updated_at = NOW()
      WHERE id = $2
      RETURNING utilities_power_supply, utilities_air, dimensions_note
    `, [power, before[0].id])).rows;
    await client.query('COMMIT');
    console.log(JSON.stringify(updated));
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
