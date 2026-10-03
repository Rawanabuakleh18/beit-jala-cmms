const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
const title = 'سجل نشاطات الصيانة الوقائية المنجزة لماكينة\nخط تحبيب البودرة Granulation Line\n200 Kg رقم PDM-01-097';
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const { rows } = await c.query('SELECT h.*, m.machine_number FROM pm_headers h JOIN machines m ON m.id=h.machine_id WHERE m.machine_number=$1 FOR UPDATE OF h', ['PDM-01-097']);
    assert.equal(rows.length, 1);
    if (rows[0].pm_record_title !== title) {
      fs.writeFileSync('backups/fabtech-pm-title-before-update.json', JSON.stringify(rows, null, 2), { flag: 'wx' });
      const result = await c.query('UPDATE pm_headers SET pm_record_title=$1, updated_at=NOW() WHERE id=$2 RETURNING pm_record_title', [title, rows[0].id]);
      assert.equal(result.rowCount, 1);
      assert.equal(result.rows[0].pm_record_title, title);
    }
    await c.query('COMMIT');
    console.log(title);
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
