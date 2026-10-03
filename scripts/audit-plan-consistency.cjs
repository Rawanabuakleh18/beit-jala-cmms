const { createRequire } = require("node:module");
const { Client } = createRequire(require("node:path").resolve("lib/db/package.json"))("pg");

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    const annual = await client.query(`
      SELECT p.year, p.id AS plan_id, m.id AS machine_id, m.machine_number, m.machine_name,
             m.pm_start_date, m.pm_frequency_months,
             r.id AS annual_row_id, r.start_date, r.frequency_months, r.scheduled_months
      FROM annual_pm_plans p
      CROSS JOIN machines m
      LEFT JOIN annual_pm_plan_rows r ON r.plan_id = p.id AND r.machine_id = m.id
      WHERE m.deleted_at IS NULL
        AND m.pm_start_date IS NOT NULL
        AND m.pm_frequency_months > 0
      ORDER BY p.year, m.machine_number
    `);
    const annualIssues = [];
    for (const row of annual.rows) {
      const startMonth = Number(String(row.pm_start_date).slice(5, 7));
      const expectedMonths = [];
      for (let month = startMonth; month <= 12; month += Number(row.pm_frequency_months)) expectedMonths.push(month);
      let actualMonths = null;
      try { actualMonths = JSON.parse(row.scheduled_months ?? "null"); } catch {}
      const reasons = [];
      if (!row.annual_row_id) reasons.push("missing annual row");
      else {
        if (String(row.start_date ?? "").slice(5) !== String(row.pm_start_date).slice(5)) reasons.push("start date differs from machine schedule");
        if (Number(row.frequency_months) !== Number(row.pm_frequency_months)) reasons.push("frequency differs from machine schedule");
        if (JSON.stringify(actualMonths) !== JSON.stringify(expectedMonths)) reasons.push("scheduled months differ from expected months");
      }
      if (reasons.length) annualIssues.push({ ...row, expectedMonths, reasons });
    }

    const duplicates = await client.query(`
      SELECT p.year, r.machine_id, m.machine_number, count(*)::int AS row_count
      FROM annual_pm_plan_rows r
      JOIN annual_pm_plans p ON p.id = r.plan_id
      JOIN machines m ON m.id = r.machine_id
      GROUP BY p.year, r.machine_id, m.machine_number
      HAVING count(*) > 1
      ORDER BY p.year, m.machine_number
    `);
    const missingMonthly = await client.query(`
      SELECT p.year, m.machine_number, a.id AS annual_row_id, month.value::int AS month
      FROM annual_pm_plan_rows a
      JOIN annual_pm_plans p ON p.id = a.plan_id
      JOIN machines m ON m.id = a.machine_id AND m.deleted_at IS NULL
      CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(NULLIF(a.scheduled_months, ''), '[]')::jsonb) month(value)
      WHERE NOT EXISTS (
        SELECT 1 FROM monthly_pm_plan_rows r
        JOIN monthly_pm_plans mp ON mp.id = r.plan_id
        WHERE mp.year = p.year AND mp.month = month.value::int
          AND r.annual_plan_row_id = a.id AND r.is_manually_removed = FALSE
      )
      ORDER BY p.year, m.machine_number, month
    `);
    const monthlyDuplicates = await client.query(`
      SELECT p.year, p.month, r.machine_id, m.machine_number, count(*)::int AS row_count
      FROM monthly_pm_plan_rows r
      JOIN monthly_pm_plans p ON p.id = r.plan_id
      JOIN machines m ON m.id = r.machine_id
      WHERE r.is_manually_removed = FALSE
      GROUP BY p.year, p.month, r.machine_id, m.machine_number
      HAVING count(*) > 1
      ORDER BY p.year, p.month, m.machine_number
    `);
    console.log(JSON.stringify({
      checkedAnnualCombinations: annual.rowCount,
      annualIssues,
      duplicateAnnualRows: duplicates.rows,
      missingMonthlyRows: missingMonthly.rows,
      duplicateMonthlyRows: monthlyDuplicates.rows,
    }, null, 2));
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
