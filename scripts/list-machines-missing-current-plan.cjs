const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    const result = await client.query(`
      WITH current_plan AS (
        SELECT id, year
        FROM annual_pm_plans
        WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)::int
        ORDER BY id DESC
        LIMIT 1
      )
      SELECT m.id, m.machine_number, m.machine_name, d.name AS department,
             m.pm_frequency_months, m.pm_start_date, cp.year AS plan_year
      FROM machines m
      LEFT JOIN departments d ON d.id = m.department_id
      LEFT JOIN current_plan cp ON true
      LEFT JOIN annual_pm_plan_rows apr ON apr.plan_id = cp.id AND apr.machine_id = m.id
      WHERE m.deleted_at IS NULL AND apr.id IS NULL
      ORDER BY m.machine_name, m.machine_number
    `);
    console.log(JSON.stringify(result.rows, null, 2));
    const unscheduled = await client.query(`
      WITH current_plan AS (
        SELECT id, year FROM annual_pm_plans
        WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)::int
        ORDER BY id DESC LIMIT 1
      )
      SELECT m.id, m.machine_number, m.machine_name, d.name AS department,
             apr.frequency_months, apr.start_date, apr.scheduled_months
      FROM current_plan cp
      JOIN annual_pm_plan_rows apr ON apr.plan_id = cp.id
      JOIN machines m ON m.id = apr.machine_id AND m.deleted_at IS NULL
      LEFT JOIN departments d ON d.id = m.department_id
      WHERE apr.frequency_months IS NULL
         OR apr.start_date IS NULL
         OR apr.scheduled_months IS NULL
         OR apr.scheduled_months IN ('', '[]')
      ORDER BY m.machine_name, m.machine_number
    `);
    console.log('UNSCHEDULED');
    console.log(JSON.stringify(unscheduled.rows, null, 2));
    const addedMachines = await client.query(`
      SELECT m.machine_number, apr.frequency_months, apr.start_date, apr.scheduled_months
      FROM machines m
      JOIN annual_pm_plan_rows apr ON apr.machine_id = m.id
      JOIN annual_pm_plans ap ON ap.id = apr.plan_id AND ap.year = EXTRACT(YEAR FROM CURRENT_DATE)::int
      WHERE m.machine_number IN ('AC 2/3 A', 'AC 2/3 B')
      ORDER BY m.machine_number
    `);
    console.log('RECENTLY_ADDED');
    console.log(JSON.stringify(addedMachines.rows, null, 2));
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
