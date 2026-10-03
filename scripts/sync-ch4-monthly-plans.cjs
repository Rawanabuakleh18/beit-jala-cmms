const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = (await client.query("SELECT id,machine_number FROM machines WHERE upper(trim(machine_number)) IN ('CH-4','CH-5') AND deleted_at IS NULL FOR UPDATE")).rows;
    const ch4 = machines.find((machine) => machine.machine_number === 'CH-4');
    const ch5 = machines.find((machine) => machine.machine_number === 'CH-5');
    if (!ch4 || !ch5) throw Error('CH-4 or CH-5 was not found');
    const targetRows = (await client.query(`SELECT p.year,r.* FROM annual_pm_plan_rows r
      JOIN annual_pm_plans p ON p.id=r.plan_id WHERE r.machine_id=$1`, [ch4.id])).rows;
    const sourceRows = (await client.query(`SELECT p.year,r.* FROM annual_pm_plan_rows r
      JOIN annual_pm_plans p ON p.id=r.plan_id WHERE r.machine_id=$1`, [ch5.id])).rows;
    let inserted = 0;
    for (const source of sourceRows) {
      const target = targetRows.find((row) => row.year === source.year);
      if (!target) throw Error(`CH-4 is missing the ${source.year} annual plan row`);
      for (const month of JSON.parse(source.scheduled_months)) {
        const monthly = (await client.query('SELECT id FROM monthly_pm_plans WHERE year=$1 AND month=$2', [source.year, month])).rows[0];
        if (!monthly) continue;
        const exists = await client.query('SELECT id FROM monthly_pm_plan_rows WHERE plan_id=$1 AND machine_id=$2 AND annual_plan_row_id=$3', [monthly.id, ch4.id, target.id]);
        if (exists.rowCount) continue;
        const sourceMonthly = (await client.query('SELECT * FROM monthly_pm_plan_rows WHERE plan_id=$1 AND machine_id=$2 AND annual_plan_row_id=$3', [monthly.id, ch5.id, source.id])).rows[0];
        const next = (await client.query('SELECT coalesce(max(row_number),0)+1 AS value FROM monthly_pm_plan_rows WHERE plan_id=$1', [monthly.id])).rows[0].value;
        const start = `${source.year}-${String(month).padStart(2, '0')}-01`;
        const end = new Date(Date.UTC(source.year, month, 0)).toISOString().slice(0, 10);
        await client.query(`INSERT INTO monthly_pm_plan_rows
          (plan_id,annual_plan_row_id,machine_id,row_number,department_name,section_name,machine_name,identification_number,planned_date_from,planned_date_to,status)
          VALUES ($1,$2,$3,$4,$5,$6,$7,'CH-4',$8,$9,'due')`, [
          monthly.id, target.id, ch4.id, next, sourceMonthly?.department_name ?? target.department,
          sourceMonthly?.section_name ?? target.department, 'Chiller 4 - Carrier',
          sourceMonthly?.planned_date_from ?? start, sourceMonthly?.planned_date_to ?? end,
        ]);
        inserted += 1;
      }
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({ machine: 'CH-4', insertedMonthlyPlanRows: inserted }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
