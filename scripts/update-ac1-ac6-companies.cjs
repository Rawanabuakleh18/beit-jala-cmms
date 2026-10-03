const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

const machineNumbers = ['AC-1', 'AC-2', 'AC-3', 'AC-4', 'AC-5', 'AC-6'];
const companyName = 'Haroshet Co.';
const companyAddress = 'Holon-Hapeled st. / Israel\nTel: 03-5591738\nFax: 03-5590173';

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const before = (await client.query(`
      SELECT m.id,m.machine_number,e.*
      FROM machines m
      JOIN equipment_information_records e ON e.machine_id=m.id
      WHERE m.deleted_at IS NULL AND upper(trim(m.machine_number))=ANY($1::text[])
      ORDER BY m.machine_number
      FOR UPDATE OF e
    `, [machineNumbers])).rows;
    if (before.length !== machineNumbers.length) {
      throw Error(`Expected ${machineNumbers.length} equipment records, found ${before.length}`);
    }
    const found = new Set(before.map((row) => row.machine_number.trim().toUpperCase()));
    const missing = machineNumbers.filter((number) => !found.has(number));
    if (missing.length) throw Error(`Missing equipment records: ${missing.join(', ')}`);

    const backupPath = `backups/ac1-ac6-companies-before-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(before, null, 2), { flag: 'wx' });

    const updated = (await client.query(`
      UPDATE equipment_information_records e SET
        purchased_from_name=$1,
        purchased_from_address=$2,
        manufacturing_company_name=$1,
        manufacturing_company_address=$2,
        updated_at=NOW()
      FROM machines m
      WHERE e.machine_id=m.id
        AND m.deleted_at IS NULL
        AND upper(trim(m.machine_number))=ANY($3::text[])
      RETURNING m.machine_number,e.purchased_from_name,e.purchased_from_address,
        e.manufacturing_company_name,e.manufacturing_company_address
    `, [companyName, companyAddress, machineNumbers])).rows;
    if (updated.length !== machineNumbers.length) throw Error(`Expected to update ${machineNumbers.length} records, updated ${updated.length}`);
    for (const row of updated) {
      if (row.purchased_from_name !== companyName || row.purchased_from_address !== companyAddress ||
          row.manufacturing_company_name !== companyName || row.manufacturing_company_address !== companyAddress) {
        throw Error(`Verification failed for ${row.machine_number}`);
      }
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({ updated: updated.map((row) => row.machine_number).sort(), companyName, companyAddress, backupPath }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
