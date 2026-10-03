const { createRequire } = require('node:module');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const { rows } = await c.query(`SELECT h.id,h.pm_record_title FROM pm_headers h JOIN machines m ON m.id=h.machine_id WHERE m.machine_number=$1 FOR UPDATE OF h`, ['PDM-01-089']);
    assert.equal(rows.length, 1);
    const title = rows[0].pm_record_title.replace(/كبس[ \u00a0]الحبوب/, 'كبس\u00a0الحبوب');
    assert.ok(title.includes('كبس\u00a0الحبوب'));
    const result = await c.query('UPDATE pm_headers SET pm_record_title=$1,updated_at=NOW() WHERE id=$2 RETURNING pm_record_title', [title, rows[0].id]);
    assert.equal(result.rows[0].pm_record_title, title);
    await c.query('COMMIT');
    console.log('Updated Karnavati title with a non-breaking space between the requested words.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
