import fs from "node:fs";
import assert from "node:assert/strict";
import { pool } from "../lib/db/src/index.ts";
import { syncAutomaticMaintenancePlans } from "../artifacts/api-server/src/routes/maintenance-plans.ts";

const sourceYear = 2026;

function dateForYear(value: string | null, year: number) {
  return value ? `${year}${value.slice(4)}` : null;
}

try {
  const sourcePlan = (await pool.query("SELECT id FROM annual_pm_plans WHERE year=$1", [sourceYear])).rows[0];
  assert.ok(sourcePlan, "The 2026 annual plan does not exist");
  const sourceRows = (await pool.query("SELECT * FROM annual_pm_plan_rows WHERE plan_id=$1 ORDER BY id", [sourcePlan.id])).rows;
  assert.ok(sourceRows.length > 0, "The 2026 annual plan has no rows");
  const targetPlans = (await pool.query("SELECT id,year FROM annual_pm_plans WHERE year>$1 ORDER BY year", [sourceYear])).rows;
  assert.ok(targetPlans.length > 0, "No later annual plans exist");

  const backup = {
    sourceYear,
    sourceRows,
    targets: await Promise.all(targetPlans.map(async (plan) => ({
      year: plan.year,
      annualRows: (await pool.query("SELECT * FROM annual_pm_plan_rows WHERE plan_id=$1 ORDER BY id", [plan.id])).rows,
      monthlyRows: (await pool.query(`SELECT r.* FROM monthly_pm_plan_rows r JOIN monthly_pm_plans p ON p.id=r.plan_id WHERE p.year=$1 ORDER BY r.id`, [plan.year])).rows,
    }))),
  };
  fs.writeFileSync(`../backups/copy-2026-plan-${Date.now()}.json`, JSON.stringify(backup, null, 2), { flag: "wx" });

  await pool.query("BEGIN");
  try {
    for (const targetPlan of targetPlans) {
      const currentRows = (await pool.query("SELECT * FROM annual_pm_plan_rows WHERE plan_id=$1 FOR UPDATE", [targetPlan.id])).rows;
      const currentByMachine = new Map(currentRows.map((row) => [row.machine_id, row]));
      const sourceMachineIds = new Set(sourceRows.map((row) => row.machine_id));
      const extras = currentRows.filter((row) => !sourceMachineIds.has(row.machine_id));
      assert.equal(extras.length, 0, `Plan ${targetPlan.year} has rows that are not in 2026`);

      for (const source of sourceRows) {
        const values = [
          source.department, source.machine_name, source.machine_location, source.machine_code,
          source.frequency_months, source.duration, dateForYear(source.start_date, targetPlan.year),
          dateForYear(source.finish_date, targetPlan.year), source.scheduled_months, source.is_override,
        ];
        const current = currentByMachine.get(source.machine_id);
        if (current) {
          await pool.query(`UPDATE annual_pm_plan_rows SET
            department=$1,machine_name=$2,machine_location=$3,machine_code=$4,frequency_months=$5,
            duration=$6,start_date=$7,finish_date=$8,scheduled_months=$9,is_override=$10,updated_at=NOW()
            WHERE id=$11`, [...values, current.id]);
        } else {
          await pool.query(`INSERT INTO annual_pm_plan_rows
            (plan_id,machine_id,department,machine_name,machine_location,machine_code,frequency_months,duration,start_date,finish_date,scheduled_months,is_override)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [targetPlan.id, source.machine_id, ...values]);
        }
      }
    }
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }

  for (const targetPlan of targetPlans) await syncAutomaticMaintenancePlans(targetPlan.year);

  const verification = await Promise.all(targetPlans.map(async (targetPlan) => {
    const targetRows = (await pool.query("SELECT * FROM annual_pm_plan_rows WHERE plan_id=$1 ORDER BY machine_id", [targetPlan.id])).rows;
    const mismatches = sourceRows.filter((source) => {
      const target = targetRows.find((row) => row.machine_id === source.machine_id);
      return !target
        || target.frequency_months !== source.frequency_months
        || target.scheduled_months !== source.scheduled_months
        || target.start_date !== dateForYear(source.start_date, targetPlan.year)
        || target.finish_date !== dateForYear(source.finish_date, targetPlan.year);
    });
    return { year: targetPlan.year, rows: targetRows.length, mismatches: mismatches.length };
  }));
  assert.ok(verification.every((result) => result.rows === sourceRows.length && result.mismatches === 0));
  console.log(JSON.stringify({ sourceYear, sourceRows: sourceRows.length, verification }, null, 2));
} finally {
  await pool.end();
}
