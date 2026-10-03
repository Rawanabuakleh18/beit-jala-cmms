const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const { Client } = createRequire(resolve('lib/db/package.json'))('pg');

const title = [
  'سجل نشاطات الصيانة الوقائية المنجزة لماكينة تغليف الحبوب',
  'Blister Packaging Machine / b 1240',
  '#(PDM-07-087) & (PDM-07-096)',
].join('\n');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(`
      UPDATE pm_headers h SET pm_record_title=$1, updated_at=NOW()
      FROM machines m
      WHERE h.machine_id=m.id AND m.machine_number='PDM-07-087'
      RETURNING h.machine_id, h.pm_record_title
    `, [title]);
    assert.equal(result.rowCount, 1, 'Expected exactly one PDM-07-087 PM header');
    assert.equal(result.rows[0].pm_record_title, title);
    console.log(JSON.stringify({ machineId: result.rows[0].machine_id, titleLines: title.split('\n') }));
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode=1; });
