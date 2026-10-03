const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const before = (await c.query('SELECT * FROM pm_headers ORDER BY id')).rows;
    const matches = (await c.query('SELECT h.* FROM pm_headers h JOIN machines m ON m.id=h.machine_id WHERE m.machine_number=$1 FOR UPDATE OF h', ['PDM-01-056'])).rows;
    assert.equal(matches.length, 1);
    const original = matches[0];
    fs.writeFileSync('backups/rotary-pm-header-before-update.json', JSON.stringify(original, null, 2), { flag: 'wx' });
    const title = 'سجل نشاطات الصيانة الوقائية لماكينة كبس الحبوب\nRotary Tablet Press Machine - ZP1124';
    const result = await c.query('UPDATE pm_headers SET procedure_form_number=$1,effective_date=$2,department=$3,pm_record_title=$4,inspection_columns_per_print_page=$5,updated_at=NOW() WHERE id=$6 RETURNING *', ['LOG-10-0463-2', '2022-02-15', 'Production', title, 3, original.id]);
    assert.equal(result.rowCount, 1);
    assert.equal(result.rows[0].pm_record_title, title);
    assert.equal(result.rows[0].inspection_columns_per_print_page, 3);
    const after = (await c.query('SELECT * FROM pm_headers ORDER BY id')).rows;
    assert.deepEqual(after.filter(r => r.id !== original.id), before.filter(r => r.id !== original.id));
    await c.query('COMMIT');
    console.log('Saved PDM-01-056 PM header from supplied image. All other PM headers unchanged.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
