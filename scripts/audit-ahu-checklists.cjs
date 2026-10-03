const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    const rows = (await client.query(`
      SELECT m.id,m.machine_number,m.machine_name,p.point_text,p.result_type,p.sort_order
      FROM machines m
      LEFT JOIN pm_checklist_points p ON p.machine_id=m.id AND p.is_active=true
      WHERE m.deleted_at IS NULL AND lower(trim(m.machine_name)) LIKE '%air handling%'
      ORDER BY m.machine_number,p.sort_order,p.id
    `)).rows;
    const machines = new Map();
    for (const row of rows) {
      if (!machines.has(row.id)) machines.set(row.id, { number: row.machine_number, name: row.machine_name.trim(), points: [] });
      if (row.point_text != null) machines.get(row.id).points.push({ text: row.point_text.trim(), type: row.result_type, order: row.sort_order });
    }
    const groups = new Map();
    for (const machine of machines.values()) {
      const signature = crypto.createHash('sha256').update(JSON.stringify(machine.points)).digest('hex').slice(0, 12);
      if (!groups.has(signature)) groups.set(signature, { pointCount: machine.points.length, machines: [] });
      groups.get(signature).machines.push(machine.number);
    }
    console.log(JSON.stringify({ machineCount: machines.size, identical: groups.size === 1, groups: [...groups.values()] }, null, 2));
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
