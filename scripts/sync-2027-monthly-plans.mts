import fs from "node:fs";
import assert from "node:assert/strict";
import { pool } from "../lib/db/src/index.ts";
import { syncAutomaticMaintenancePlans } from "../artifacts/api-server/src/routes/maintenance-plans.ts";

try {
  const before = (await pool.query(`SELECT r.*,p.year,p.month FROM monthly_pm_plan_rows r
    JOIN monthly_pm_plans p ON p.id=r.plan_id ORDER BY r.id`)).rows;
  fs.writeFileSync(`backups/monthly-2027-before-sync-${Date.now()}.json`, JSON.stringify(before.filter(r => r.year === 2027), null, 2));
  await syncAutomaticMaintenancePlans(2027);
  const after = (await pool.query(`SELECT r.*,p.year,p.month FROM monthly_pm_plan_rows r
    JOIN monthly_pm_plans p ON p.id=r.plan_id ORDER BY r.id`)).rows;
  assert.deepEqual(after.filter(r => r.year !== 2027), before.filter(r => r.year !== 2027));
  const missing = (await pool.query(`SELECT a.machine_id, month.value FROM annual_pm_plan_rows a
    JOIN annual_pm_plans y ON y.id=a.plan_id
    CROSS JOIN LATERAL jsonb_array_elements_text(a.scheduled_months::jsonb) month(value)
    WHERE y.year=2027 AND NOT EXISTS (
      SELECT 1 FROM monthly_pm_plan_rows r JOIN monthly_pm_plans p ON p.id=r.plan_id
      WHERE p.year=2027 AND p.month=month.value::int AND r.annual_plan_row_id=a.id
    )`)).rows;
  assert.equal(missing.length, 0);
  console.log(JSON.stringify({year:2027, monthlyRows:after.filter(r=>r.year===2027).length, missing:missing.length, otherYearsUnchanged:true}));
} finally {
  await pool.end();
}
