const { createRequire } = require("node:module");
const path = require("node:path");
const { Client } = createRequire(path.resolve("lib/db/package.json"))("pg");

const machineNumber = process.argv[2];
if (!machineNumber) throw new Error("Machine number is required");

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query(`
      SELECT m.id, m.machine_number, m.machine_name,
             h.inspection_columns_per_print_page,
             COUNT(p.id)::int AS point_count
      FROM machines m
      LEFT JOIN pm_headers h ON h.machine_id = m.id
      LEFT JOIN pm_checklist_points p ON p.machine_id = m.id AND p.is_active = TRUE
      WHERE UPPER(REPLACE(m.machine_number, ' ', '')) = UPPER(REPLACE($1, ' ', ''))
      GROUP BY m.id, h.inspection_columns_per_print_page
    `, [machineNumber]);
    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
