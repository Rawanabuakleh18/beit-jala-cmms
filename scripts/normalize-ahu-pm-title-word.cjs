const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
const numbers = ['AC3/6A', 'AC3/4', 'AC3/6B', 'AC2/5', 'AC4/5A', 'AC4/5B', 'AC4/5C', 'AHU-1'];
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    await c.query('LOCK TABLE pm_headers IN SHARE ROW EXCLUSIVE MODE');
    const before = (await c.query('SELECT * FROM pm_headers ORDER BY id')).rows;
    const machines = (await c.query("SELECT id FROM machines WHERE upper(regexp_replace(machine_number, '\\s', '', 'g')) = ANY($1)", [numbers])).rows;
    assert.equal(machines.length, 8);
    const ids = new Set(machines.map(m => m.id));
    const targets = before.filter(h => ids.has(h.machine_id));
    assert.equal(targets.length, 8);
    for (const h of targets) assert.match(h.pm_record_title, /لماكنات|لماكينات/);
    const changes = targets.filter(h => h.pm_record_title.includes('لماكنات'));
    if (changes.length) {
      fs.writeFileSync(`backups/ahu-pm-title-word-${Date.now()}.json`, JSON.stringify(targets, null, 2), { flag: 'wx' });
      for (const h of changes) {
        const result = await c.query('UPDATE pm_headers SET pm_record_title=$1 WHERE id=$2', [h.pm_record_title.replace('لماكنات', 'لماكينات'), h.id]);
        assert.equal(result.rowCount, 1);
      }
    }
    const after = (await c.query('SELECT * FROM pm_headers ORDER BY id')).rows;
    const expected = before.map(h => ids.has(h.machine_id) ? { ...h, pm_record_title: h.pm_record_title.replace('لماكنات', 'لماكينات') } : h);
    assert.deepEqual(after, expected);
    await c.query('COMMIT');
    console.log(`Verified all 8 titles use ماكينات. Changed only the word in ${changes.length} titles; every other header field is unchanged.`);
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
