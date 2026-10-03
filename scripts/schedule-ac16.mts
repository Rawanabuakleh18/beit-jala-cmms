import fs from 'node:fs';
import assert from 'node:assert/strict';
import { db, pool } from '../lib/db/src/index.ts';
import { sql } from '../lib/db/node_modules/drizzle-orm/index.js';
import { applyMachineScheduleToPlan } from '../artifacts/api-server/src/routes/maintenance-plans.ts';
try {
  await db.transaction(async tx => {
    const machines = (await tx.execute(sql`SELECT * FROM machines WHERE machine_number='AC 1/6' FOR UPDATE`)).rows;
    assert.equal(machines.length, 1);
    const id = Number(machines[0].id);
    assert.equal(machines[0].pm_start_date, '2026-04-01');
    assert.equal(machines[0].pm_frequency_months, 4);
    const before = {};
    for (const table of ['annual_pm_plan_rows','monthly_pm_plan_rows']) before[table] = (await tx.execute(sql.raw(`SELECT * FROM ${table} ORDER BY id`))).rows;
    fs.writeFileSync(`backups/ac16-plans-before-${Date.now()}.json`,JSON.stringify(before,null,2),{flag:'wx'});
    for (const year of [2026,2027,2028]) await applyMachineScheduleToPlan(tx,id,year);
    for (const table of Object.keys(before)) {
      const after = (await tx.execute(sql.raw(`SELECT * FROM ${table} ORDER BY id`))).rows;
      assert.deepEqual(after.filter(r=>r.machine_id!==id),before[table].filter(r=>r.machine_id!==id));
    }
    const rows = (await tx.execute(sql`SELECT scheduled_months FROM annual_pm_plan_rows WHERE machine_id=${id}`)).rows;
    assert.equal(rows.length,3);
    for(const row of rows) assert.equal(row.scheduled_months,'[4,8,12]');
    console.log('Verified AC 1/6 plans for 2026–2028: April, August, December.');
  });
} finally { await pool.end(); }
