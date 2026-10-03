const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const before = (await client.query('SELECT * FROM pm_checklist_points ORDER BY id')).rows;
    const { rows } = await client.query(
      `SELECT p.* FROM pm_checklist_points p JOIN machines m ON m.id=p.machine_id
       WHERE m.machine_number=$1 AND p.is_active=true AND p.sort_order=9 FOR UPDATE OF p`,
      ['PDM-01-089'],
    );
    assert.equal(rows.length, 1);
    const point = rows[0];
    const duplicate = 'Alpha SP-320/Zn-320)';
    assert.ok(point.point_text.includes(duplicate), 'Expected original oil description');
    const corrected = point.point_text.replace(duplicate, 'Alpha\nZn-320/Alpha SP-320)');
    fs.writeFileSync('backups/karnavati-pm-oil-point-before-line-correction.json', JSON.stringify(point, null, 2), { flag: 'wx' });
    const updated = await client.query(
      'UPDATE pm_checklist_points SET point_text=$1,updated_at=NOW() WHERE id=$2 AND machine_id=$3 RETURNING *',
      [corrected, point.id, point.machine_id],
    );
    assert.equal(updated.rowCount, 1);
    assert.equal(updated.rows[0].point_text, corrected);
    const after = (await client.query('SELECT * FROM pm_checklist_points ORDER BY id')).rows;
    assert.deepEqual(after.filter(p => p.id !== point.id), before.filter(p => p.id !== point.id));
    await client.query('COMMIT');
    console.log(JSON.stringify({ machine: 'PDM-01-089', point: 9, text: corrected, otherPointsUnchanged: true }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
