const { createRequire } = require("node:module");
const { Client } = createRequire(require("node:path").resolve("lib/db/package.json"))("pg");

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    const sessions = await client.query(`
      SELECT
        s.expire,
        s.sess->>'userId' AS user_id,
        u.username,
        u.full_name,
        r.name AS role_name,
        u.machine_department_ids
      FROM sessions s
      LEFT JOIN users u ON u.id = NULLIF(s.sess->>'userId', '')::int
      LEFT JOIN roles r ON r.id = u.role_id
      WHERE s.sess::jsonb ? 'userId'
      ORDER BY s.expire DESC
    `);
    const audit = await client.query(`
      SELECT a.created_at, a.action, a.entity_type, a.entity_id,
             a.user_id, u.username, u.full_name
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      WHERE a.created_at BETWEEN '2026-09-27 10:30:00' AND '2026-09-27 11:00:00'
      ORDER BY a.created_at
    `);
    const restrictedUsers = await client.query(`
      SELECT u.id, u.username, u.full_name, u.is_active, r.name AS role_name, u.machine_department_ids
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE r.name <> 'Admin'
        AND u.machine_department_ids IS NOT NULL
      ORDER BY u.id
    `);
    console.log(JSON.stringify({ sessions: sessions.rows, nearbyAudit: audit.rows, restrictedUsers: restrictedUsers.rows }, null, 2));
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
