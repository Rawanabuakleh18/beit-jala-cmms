const fs = require("node:fs");
const { createRequire } = require("node:module");
const { Client } = createRequire(require("node:path").resolve("lib/db/package.json"))("pg");
const client = new Client({ connectionString: process.env.DATABASE_URL });

const monthsFor = (date, frequency) => {
  const months = [];
  for (let month = Number(date.slice(5, 7)); month <= 12; month += Number(frequency)) months.push(month);
  return months;
};
const dateForYear = (date, year) => `${year}${date.slice(4)}`;

(async () => {
  await client.connect();
  try {
    await client.query("BEGIN");
    const targets = await client.query(`
      WITH missing_annual AS (
        SELECT DISTINCT m.id AS machine_id, p.year
        FROM machines m CROSS JOIN annual_pm_plans p
        LEFT JOIN annual_pm_plan_rows r ON r.machine_id=m.id AND r.plan_id=p.id
        WHERE p.year>=2027 AND m.deleted_at IS NULL AND m.pm_start_date IS NOT NULL
          AND m.pm_frequency_months>0 AND r.id IS NULL
      ), missing_monthly AS (
        SELECT DISTINCT a.machine_id,p.year
        FROM annual_pm_plan_rows a JOIN annual_pm_plans p ON p.id=a.plan_id
        CROSS JOIN LATERAL jsonb_array_elements_text(a.scheduled_months::jsonb) month(value)
        WHERE p.year>=2027 AND NOT EXISTS (
          SELECT 1 FROM monthly_pm_plan_rows r JOIN monthly_pm_plans mp ON mp.id=r.plan_id
          WHERE mp.year=p.year AND mp.month=month.value::int
            AND r.annual_plan_row_id=a.id AND r.is_manually_removed=FALSE)
      )
      SELECT machine_id,year FROM missing_annual UNION SELECT machine_id,year FROM missing_monthly
      ORDER BY year,machine_id
    `);
    const backup = await client.query(`SELECT p.year,r.* FROM annual_pm_plan_rows r JOIN annual_pm_plans p ON p.id=r.plan_id WHERE p.year>=2027 ORDER BY p.year,r.id`);
    fs.writeFileSync(`backups/future-plans-before-backfill-${Date.now()}.json`, JSON.stringify(backup.rows, null, 2), { flag: "wx" });

    for (const target of targets.rows) {
      const machineResult = await client.query(`SELECT m.*,d.name department_name FROM machines m LEFT JOIN departments d ON d.id=m.department_id WHERE m.id=$1`, [target.machine_id]);
      const machine = machineResult.rows[0];
      const plan = (await client.query(`SELECT id FROM annual_pm_plans WHERE year=$1`, [target.year])).rows[0];
      const startDate = dateForYear(machine.pm_start_date, target.year);
      const months = monthsFor(startDate, machine.pm_frequency_months);
      let annual = (await client.query(`SELECT * FROM annual_pm_plan_rows WHERE plan_id=$1 AND machine_id=$2`, [plan.id, machine.id])).rows[0];
      if (!annual) {
        annual = (await client.query(`INSERT INTO annual_pm_plan_rows
          (plan_id,machine_id,department,machine_name,machine_location,machine_code,frequency_months,start_date,finish_date,scheduled_months,is_override)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,TRUE) RETURNING *`,
          [plan.id,machine.id,machine.department_name,machine.machine_name,machine.location,machine.machine_number,machine.pm_frequency_months,startDate,JSON.stringify(months)])).rows[0];
      }
      for (const month of months) {
        let monthly = (await client.query(`SELECT id FROM monthly_pm_plans WHERE year=$1 AND month=$2`, [target.year,month])).rows[0];
        if (!monthly) monthly = (await client.query(`INSERT INTO monthly_pm_plans(year,month) VALUES($1,$2) RETURNING id`, [target.year,month])).rows[0];
        const exists = await client.query(`SELECT id FROM monthly_pm_plan_rows WHERE plan_id=$1 AND annual_plan_row_id=$2 AND machine_id=$3 AND is_manually_removed=FALSE`, [monthly.id,annual.id,machine.id]);
        if (!exists.rowCount) {
          const lastDay = new Date(Date.UTC(target.year, month, 0)).getUTCDate();
          const prefix = `${target.year}-${String(month).padStart(2,"0")}`;
          await client.query(`INSERT INTO monthly_pm_plan_rows
            (plan_id,annual_plan_row_id,machine_id,row_number,department_name,section_name,machine_name,identification_number,planned_date_from,planned_date_to)
            VALUES($1,$2,$3,(SELECT COALESCE(MAX(row_number),0)+1 FROM monthly_pm_plan_rows WHERE plan_id=$1),$4,$4,$5,$6,$7,$8)`,
            [monthly.id,annual.id,machine.id,machine.department_name,machine.machine_name,machine.machine_number,`${prefix}-01`,`${prefix}-${String(lastDay).padStart(2,"0")}`]);
        }
      }
    }
    await client.query("COMMIT");
    console.log(JSON.stringify({ updated: targets.rows }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode=1; });
