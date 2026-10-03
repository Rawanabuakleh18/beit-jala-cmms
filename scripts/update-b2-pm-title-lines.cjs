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
    const { rows } = await c.query('SELECT h.* FROM pm_headers h JOIN machines m ON m.id=h.machine_id WHERE m.machine_number=$1 FOR UPDATE OF h', ['B-2']);
    assert.equal(rows.length, 1);
    const before = rows[0];
    assert.ok(before.pm_record_title.includes('نوع'));
    const title = before.pm_record_title.replace(/نوع\s+/, 'نوع\n');
    assert.equal(title.split('\n').length, 2);
    if (title !== before.pm_record_title) {
      fs.writeFileSync(`backups/b2-pm-title-lines-${Date.now()}.json`, JSON.stringify(before, null, 2), { flag: 'wx' });
      const result = await c.query('UPDATE pm_headers SET pm_record_title=$1 WHERE id=$2 RETURNING *', [title, before.id]);
      assert.deepEqual(result.rows[0], { ...before, pm_record_title: title });
    }
    await c.query('COMMIT');
    console.log(title);
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
