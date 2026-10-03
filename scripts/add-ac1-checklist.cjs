const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

const points = [
  'تم فحص الكوابل والوصلات الكهربائية وهي سليمة',
  'تم فحص الماتور وعازليته وأنظمة نقل الحركة وهي سليمة',
  'تم فحص الفلاتر وتغييرها',
  'تم فحص الفلاتر وتنظيفها',
  'تم تشحيم البواجر',
  'تم تنظيف الماكينة من الداخل والخارج',
  'تم تنظيف strainer',
];

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = await client.query("SELECT id FROM machines WHERE upper(trim(machine_number))='AC-1' AND deleted_at IS NULL");
    if (machines.rowCount !== 1) throw Error(`Expected one active AC-1 machine, found ${machines.rowCount}`);
    const machineId = machines.rows[0].id;
    const existing = await client.query('SELECT count(*)::int AS count FROM pm_checklist_points WHERE machine_id=$1 AND is_active',[machineId]);
    if (existing.rows[0].count !== 0) throw Error('AC-1 already has active checklist points');
    for (const [index, pointText] of points.entries()) {
      await client.query(`
        INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active)
        VALUES($1,$2,'yes_no',$3,true)
      `,[machineId,pointText,index + 1]);
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({machineId,machineNumber:'AC-1',checklistPoints:points.length}));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode=1; });
