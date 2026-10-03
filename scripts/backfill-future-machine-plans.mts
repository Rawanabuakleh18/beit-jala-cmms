import fs from "node:fs";
import { db, pool } from "../lib/db/src/index.ts";
import { sql } from "../lib/db/node_modules/drizzle-orm/index.js";
import { applyMachineScheduleToPlan } from "../artifacts/api-server/src/routes/maintenance-plans.ts";

try {
  await db.transaction(async (tx) => {
    const targets = (await tx.execute(sql`
      WITH missing_annual AS (
        SELECT DISTINCT m.id AS machine_id, p.year
        FROM machines m
        CROSS JOIN annual_pm_plans p
        LEFT JOIN annual_pm_plan_rows r ON r.machine_id = m.id AND r.plan_id = p.id
        WHERE p.year >= 2027
          AND m.deleted_at IS NULL
          AND m.pm_start_date IS NOT NULL
          AND m.pm_frequency_months > 0
          AND r.id IS NULL
      ), missing_monthly AS (
        SELECT DISTINCT a.machine_id, p.year
        FROM annual_pm_plan_rows a
        JOIN annual_pm_plans p ON p.id = a.plan_id
        CROSS JOIN LATERAL jsonb_array_elements_text(a.scheduled_months::jsonb) month(value)
        WHERE p.year >= 2027
          AND NOT EXISTS (
            SELECT 1 FROM monthly_pm_plan_rows r
            JOIN monthly_pm_plans mp ON mp.id = r.plan_id
            WHERE mp.year = p.year AND mp.month = month.value::int
              AND r.annual_plan_row_id = a.id AND r.is_manually_removed = FALSE
          )
      )
      SELECT machine_id, year FROM missing_annual
      UNION
      SELECT machine_id, year FROM missing_monthly
      ORDER BY year, machine_id
    `)).rows as Array<{ machine_id: number; year: number }>;

    const backup = (await tx.execute(sql`
      SELECT p.year, r.* FROM annual_pm_plan_rows r
      JOIN annual_pm_plans p ON p.id = r.plan_id
      WHERE p.year >= 2027
      ORDER BY p.year, r.id
    `)).rows;
    fs.writeFileSync(`backups/future-plans-before-backfill-${Date.now()}.json`, JSON.stringify(backup, null, 2), { flag: "wx" });

    for (const target of targets) {
      await applyMachineScheduleToPlan(tx, Number(target.machine_id), Number(target.year));
    }
    console.log(JSON.stringify({ updated: targets }, null, 2));
  });
} finally {
  await pool.end();
}
