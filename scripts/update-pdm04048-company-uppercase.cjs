const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const before = (await client.query(`
      SELECT e.* FROM equipment_information_records e
      JOIN machines m ON m.id = e.machine_id
      WHERE m.machine_number = 'PDM-04-048'
      FOR UPDATE OF e
    `)).rows;
    if (before.length !== 1) throw new Error(`Expected one PDM-04-048 equipment record, found ${before.length}`);
    fs.writeFileSync(
      `backups/pdm04048-company-before-${Date.now()}.json`,
      JSON.stringify(before[0], null, 2),
      { flag: 'wx' },
    );

    const address = 'b- FACTORY NO:738.YANGSI INDUSTRY\nAREA TAIZHOU CITY 318017';
    const [updated] = (await client.query(`
      UPDATE equipment_information_records
      SET purchased_from_name = 'a- HM PHARMACHINE.CHINA LTD',
          purchased_from_address = $1,
          manufacturing_company_name = 'a- HM PHARMACHINE.CHINA LTD',
          manufacturing_company_address = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING purchased_from_name, purchased_from_address,
                manufacturing_company_name, manufacturing_company_address
    `, [address, before[0].id])).rows;

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
