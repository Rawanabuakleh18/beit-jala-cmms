const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const rows = (await client.query(`
      SELECT h.id, h.pm_record_title
      FROM pm_headers h
      JOIN machines m ON m.id = h.machine_id
      WHERE upper(trim(m.machine_number)) = 'AC-6' AND m.deleted_at IS NULL
      FOR UPDATE OF h
    `)).rows;
    if (rows.length !== 1) throw Error(`Expected one AC-6 PM header, found ${rows.length}`);
    const current = rows[0].pm_record_title ?? '';
    const title = current.replace(/\s*\r?\n\s*AC-6\s*$/i, ' AC-6');
    if (title === current && !/AC-6/i.test(current)) throw Error('AC-6 was not found in the PM title');
    await client.query('UPDATE pm_headers SET pm_record_title=$1, updated_at=NOW() WHERE id=$2', [title, rows[0].id]);
    await client.query('COMMIT');
    console.log(JSON.stringify({ machineNumber: 'AC-6', titleLines: title.split(/\r?\n/) }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
