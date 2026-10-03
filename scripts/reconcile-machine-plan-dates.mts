import fs from 'node:fs';
import assert from 'node:assert/strict';
import { db, pool } from '../lib/db/src/index.ts';
import { sql } from '../lib/db/node_modules/drizzle-orm/index.js';
import { applyMachineScheduleToPlan } from '../artifacts/api-server/src/routes/maintenance-plans.ts';

try {
  await db.transaction(async tx => {
    const before: Record<string, unknown[]> = {};
    for (const table of ['annual_pm_plans','annual_pm_plan_rows','monthly_pm_plans','monthly_pm_plan_rows']) {
      before[table] = (await tx.execute(sql.raw(`SELECT * FROM ${table} ORDER BY id FOR UPDATE`))).rows;
    }
    fs.writeFileSync(`backups/plan-date-reconcile-${Date.now()}.json`, JSON.stringify(before,null,2), {flag:'wx'});
    const targets = (await tx.execute(sql`SELECT m.id,m.machine_number,p.year FROM machines m CROSS JOIN annual_pm_plans p
      LEFT JOIN annual_pm_plan_rows r ON r.machine_id=m.id AND r.plan_id=p.id
      WHERE m.deleted_at IS NULL AND m.pm_start_date IS NOT NULL AND m.pm_frequency_months > 0
      AND ((p.year=2027 AND r.id IS NULL) OR (p.year=2028 AND
        (substring(r.start_date from 6) IS DISTINCT FROM substring(m.pm_start_date from 6) OR r.frequency_months IS DISTINCT FROM m.pm_frequency_months)))`)).rows;
    for (const target of targets) await applyMachineScheduleToPlan(tx, Number(target.id), Number(target.year));
    const remaining = (await tx.execute(sql`SELECT m.machine_number,p.year FROM machines m CROSS JOIN annual_pm_plans p
      LEFT JOIN annual_pm_plan_rows r ON r.machine_id=m.id AND r.plan_id=p.id
      WHERE m.deleted_at IS NULL AND m.pm_start_date IS NOT NULL AND m.pm_frequency_months > 0 AND p.year IN (2027,2028)
      AND (r.id IS NULL OR substring(r.start_date from 6) IS DISTINCT FROM substring(m.pm_start_date from 6) OR r.frequency_months IS DISTINCT FROM m.pm_frequency_months)`)).rows;
    assert.equal(remaining.length,0);
    const plan2026 = (before.annual_pm_plans as any[]).find(p=>p.year===2026);
    assert.deepEqual((await tx.execute(sql`SELECT * FROM annual_pm_plan_rows WHERE plan_id=${plan2026.id} ORDER BY id`)).rows,(before.annual_pm_plan_rows as any[]).filter(r=>r.plan_id===plan2026.id));
    const completed = (before.monthly_pm_plan_rows as any[]).filter(r=>r.actual_date);
    for(const row of completed) assert.deepEqual((await tx.execute(sql`SELECT * FROM monthly_pm_plan_rows WHERE id=${row.id}`)).rows[0],row);
    console.log(JSON.stringify({updated:targets,verified:true}));
  });
  const rows = (await pool.query(`SELECT p.year,m.machine_number,m.pm_start_date,m.pm_frequency_months,r.id,r.start_date,r.frequency_months,r.scheduled_months
    FROM machines m CROSS JOIN annual_pm_plans p LEFT JOIN annual_pm_plan_rows r ON r.machine_id=m.id AND r.plan_id=p.id
    WHERE p.year=2026 AND m.deleted_at IS NULL AND m.pm_start_date IS NOT NULL AND m.pm_frequency_months>0`)).rows;
  const annualIssues=rows.filter(r=>{
    const months=[];for(let month=Number(r.pm_start_date.slice(5,7));month<=12;month+=r.pm_frequency_months)months.push(month);
    return !r.id || r.pm_start_date.slice(5)!==r.start_date?.slice(5) || r.frequency_months!==r.pm_frequency_months || JSON.stringify(JSON.parse(r.scheduled_months))!==JSON.stringify(months);
  });
  const monthlyMissing=(await pool.query(`SELECT m.machine_number,s.value AS month FROM annual_pm_plan_rows a JOIN annual_pm_plans p ON p.id=a.plan_id
    JOIN machines m ON m.id=a.machine_id CROSS JOIN LATERAL jsonb_array_elements_text(a.scheduled_months::jsonb) s(value)
    WHERE p.year=2026 AND m.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM monthly_pm_plan_rows r JOIN monthly_pm_plans mp ON mp.id=r.plan_id WHERE mp.year=2026 AND mp.month=s.value::int AND r.annual_plan_row_id=a.id)`)).rows;
  console.log(JSON.stringify({year2026:{machines:rows.length,annualIssues,monthlyMissing}}));
} finally { await pool.end(); }
