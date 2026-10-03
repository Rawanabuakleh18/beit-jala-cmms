const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    const matches = await client.query(`
      SELECT m.id, m.machine_number, m.machine_name, e.id AS equipment_id, e.identification_number, e.utilities_air
      FROM machines m
      LEFT JOIN equipment_information_records e ON e.machine_id = m.id
      WHERE upper(trim(m.machine_number)) = 'AC-2'
      ORDER BY e.id
    `);
    if (matches.rowCount !== 1) {
      console.log(JSON.stringify(matches.rows, null, 2));
      throw Error(`Expected one AC-2 equipment-information record, found ${matches.rowCount}`);
    }
    const record = matches.rows[0];
    if (!record.equipment_id) throw Error('AC-2 equipment information record is missing');
    if ((record.identification_number ?? '').trim().toUpperCase() !== 'AC-2') {
      throw Error(`Unexpected AC-2 identification number: ${record.identification_number}`);
    }

    const utilitiesAir = 'Filtered Air\nVKA\n400';
    const updated = await client.query(`
      UPDATE equipment_information_records
      SET utilities_air = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING machine_id, identification_number, utilities_air
    `, [utilitiesAir, record.equipment_id]);
    console.log(JSON.stringify(updated.rows[0], null, 2));
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
