const { createRequire } = require("node:module");
const { Client } = createRequire(require("node:path").resolve("lib/db/package.json"))("pg");

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    const deleted = await client.query(`
      SELECT m.id, m.machine_number, m.machine_name, m.status, m.deleted_at, m.updated_at
      FROM machines m
      WHERE m.deleted_at IS NOT NULL
      ORDER BY m.deleted_at DESC
      LIMIT 50
    `);
    const audit = await client.query(`
      SELECT a.created_at, a.action, a.entity_id, a.details,
             u.username, u.full_name
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      WHERE a.entity_type = 'machine'
        AND (a.action ILIKE '%delet%' OR a.action ILIKE '%archiv%')
      ORDER BY a.created_at DESC
      LIMIT 50
    `);
    console.log(JSON.stringify({ deletedMachines: deleted.rows, deletionOrArchiveAudit: audit.rows }, null, 2));
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
