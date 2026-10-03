const fs = require("node:fs");
const { createRequire } = require("node:module");
const { Client } = createRequire(require("node:path").resolve("lib/db/package.json"))("pg");
const client = new Client({ connectionString: process.env.DATABASE_URL });

const sourceYear = 2026;
const dateForYear = (value, year) => value ? `${year}${value.slice(4)}` : null;

(async () => {
  await client.connect();
  try {
    const sourcePlan = (await client.query("SELECT id FROM annual_pm_plans WHERE year=$1", [sourceYear])).rows[0];
    if (!sourcePlan) throw new Error("The 2026 annual plan does not exist.");
    const sourceRows = (await client.query("SELECT * FROM annual_pm_plan_rows WHERE plan_id=$1 ORDER BY id", [sourcePlan.id])).rows;
    if (!sourceRows.length) throw new Error("The 2026 annual plan has no rows.");
    const targets = (await client.query("SELECT id,year FROM annual_pm_plans WHERE year>$1 ORDER BY year", [sourceYear])).rows;
    if (!targets.length) throw new Error("No plans after 2026 exist.");

    const backup = { sourceYear, sourceRows, targets: [] };
    for (const target of targets) {
      backup.targets.push({
        year: target.year,
        annualRows: (await client.query("SELECT * FROM annual_pm_plan_rows WHERE plan_id=$1 ORDER BY id", [target.id])).rows,
        monthlyRows: (await client.query("SELECT r.* FROM monthly_pm_plan_rows r JOIN monthly_pm_plans p ON p.id=r.plan_id WHERE p.year=$1 ORDER BY r.id", [target.year])).rows,
      });
    }
    fs.writeFileSync(`backups/copy-2026-plan-${Date.now()}.json`, JSON.stringify(backup, null, 2), { flag: "wx" });

    await client.query("BEGIN");
    for (const target of targets) {
      const currentRows = (await client.query("SELECT * FROM annual_pm_plan_rows WHERE plan_id=$1 FOR UPDATE", [target.id])).rows;
      const sourceIds = new Set(sourceRows.map((row) => row.machine_id));
      const extras = currentRows.filter((row) => !sourceIds.has(row.machine_id));
      if (extras.length) throw new Error(`Plan ${target.year} contains ${extras.length} machine(s) not present in 2026.`);

      for (const source of sourceRows) {
        let row = currentRows.find((item) => item.machine_id === source.machine_id);
        const values = [source.department,source.machine_name,source.machine_location,source.machine_code,source.frequency_months,source.duration,dateForYear(source.start_date,target.year),dateForYear(source.finish_date,target.year),source.scheduled_months,source.is_override];
        if (row) {
          row = (await client.query(`UPDATE annual_pm_plan_rows SET department=$1,machine_name=$2,machine_location=$3,machine_code=$4,
            frequency_months=$5,duration=$6,start_date=$7,finish_date=$8,scheduled_months=$9,is_override=$10,updated_at=NOW()
            WHERE id=$11 RETURNING *`, [...values,row.id])).rows[0];
        } else {
          row = (await client.query(`INSERT INTO annual_pm_plan_rows
            (plan_id,machine_id,department,machine_name,machine_location,machine_code,frequency_months,duration,start_date,finish_date,scheduled_months,is_override)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, [target.id,source.machine_id,...values])).rows[0];
        }
        const months = JSON.parse(source.scheduled_months || "[]");
        const existingMonthly = (await client.query(`SELECT r.*,p.month FROM monthly_pm_plan_rows r JOIN monthly_pm_plans p ON p.id=r.plan_id
          WHERE p.year=$1 AND r.annual_plan_row_id=$2`, [target.year,row.id])).rows;
        for (const existing of existingMonthly) {
          if (!months.includes(existing.month) && !existing.actual_date) await client.query("DELETE FROM monthly_pm_plan_rows WHERE id=$1", [existing.id]);
        }
        for (const month of months) {
          let monthly = (await client.query("SELECT id FROM monthly_pm_plans WHERE year=$1 AND month=$2", [target.year,month])).rows[0];
          if (!monthly) monthly = (await client.query("INSERT INTO monthly_pm_plans(year,month) VALUES($1,$2) RETURNING id", [target.year,month])).rows[0];
          const rows = (await client.query("SELECT * FROM monthly_pm_plan_rows WHERE plan_id=$1", [monthly.id])).rows;
          const own = rows.find((item) => item.annual_plan_row_id===row.id && item.machine_id===source.machine_id && !item.is_manually_removed);
          const lastDay = new Date(Date.UTC(target.year,month,0)).getUTCDate();
          const prefix = `${target.year}-${String(month).padStart(2,"0")}`;
          if (!own) {
            await client.query(`INSERT INTO monthly_pm_plan_rows
              (plan_id,annual_plan_row_id,machine_id,row_number,department_name,section_name,machine_name,identification_number,planned_date_from,planned_date_to)
              VALUES($1,$2,$3,$4,$5,$5,$6,$7,$8,$9)`, [monthly.id,row.id,source.machine_id,Math.max(0,...rows.map((item)=>item.row_number))+1,source.department,source.machine_name,source.machine_code,`${prefix}-01`,`${prefix}-${String(lastDay).padStart(2,"0")}`]);
          } else if (!own.actual_date && !own.planned_date_is_override) {
            await client.query("UPDATE monthly_pm_plan_rows SET planned_date_from=$1,planned_date_to=$2,updated_at=NOW() WHERE id=$3", [`${prefix}-01`,`${prefix}-${String(lastDay).padStart(2,"0")}`,own.id]);
          }
        }
      }
    }
    await client.query("COMMIT");

    const verification=[];
    for(const target of targets){
      const rows=(await client.query("SELECT * FROM annual_pm_plan_rows WHERE plan_id=$1 ORDER BY machine_id",[target.id])).rows;
      const mismatches=sourceRows.filter((source)=>{const row=rows.find((item)=>item.machine_id===source.machine_id);return !row||row.frequency_months!==source.frequency_months||row.scheduled_months!==source.scheduled_months||row.start_date!==dateForYear(source.start_date,target.year)||row.finish_date!==dateForYear(source.finish_date,target.year);});
      verification.push({year:target.year,rows:rows.length,mismatches:mismatches.length});
    }
    console.log(JSON.stringify({sourceYear,sourceRows:sourceRows.length,verification},null,2));
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    throw error;
  } finally { await client.end(); }
})().catch((error)=>{console.error(error.message);process.exitCode=1;});
