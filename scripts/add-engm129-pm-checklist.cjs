const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

const points = [
  ['تم فحص الكابل الكهربائي وهو بحالة جيدة', 'yes_no'],
  ['تم فحص عازلية ملفات الماتورات وكانت جيدة', 'yes_no'],
  ['تم فحص فلاتر الماكينة وتنظيفها', 'yes_no'],
  ['تم فك أوعية تجميع البودرة وتفريغها', 'yes_no'],
  ['تم تنظيف أنابيب شفط البودرة الموجودة في قسم المستحضرات الصلبة', 'yes_no'],
  ['تم تفريغ وحدة الصيانة من المياه المتجمعة بها', 'yes_no'],
  ['تم فحص جميع الردادات (Shutters) وهي الآن سليمة وتعمل بشكل صحيح', 'yes_no'],
  ['القطع التي تم استبدالها خلال أعمال الصيانة', 'text'],
];

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = (await client.query("SELECT * FROM machines WHERE upper(trim(machine_number))='ENGM-129' AND deleted_at IS NULL FOR UPDATE")).rows;
    if (machines.length !== 1) throw Error(`Expected one active ENGM-129 machine, found ${machines.length}`);
    const machine = machines[0];
    const before = (await client.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order,id FOR UPDATE', [machine.id])).rows;
    if (before.some((point) => point.is_active)) throw Error('ENGM-129 already has active checklist points; nothing was changed');
    fs.writeFileSync(`backups/engm129-pm-before-${Date.now()}.json`, JSON.stringify(before, null, 2), { flag: 'wx' });

    for (const [index, [pointText, resultType]] of points.entries()) {
      await client.query(`INSERT INTO pm_checklist_points
        (machine_id,point_text,result_type,sort_order,is_active)
        VALUES ($1,$2,$3,$4,true)`, [machine.id, pointText, resultType, index + 1]);
    }
    const saved = (await client.query('SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=$1 AND is_active=true ORDER BY sort_order,id', [machine.id])).rows;
    if (saved.length !== points.length) throw Error(`Expected ${points.length} saved points, found ${saved.length}`);
    await client.query('COMMIT');
    console.log(JSON.stringify({ machineId: machine.id, machineNumber: machine.machine_number, checklistPoints: saved.length, textPoint: saved.at(-1)?.sort_order }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
