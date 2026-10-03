const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

const points = [
  'تم تنظيف فلتر الهواء المضغوط',
  'تم فحص ضغط الهواء المغذي للماكينة وكان 6 بار',
  'تم تنظيف أجزاء الماكينة بالماء والصابون على أن لا تتجاوز درجة حرارة الماء 30 درجة مئوية.',
  'تم فحص شفرات قطع التحاميل وهي جيدة',
  'تم تزييت الأجزاء الميكانيكية للماكينة',
  'تم تشحيم بستون الهواء الموجه للأعمدة',
  'تم فحص وتنظيف حساسات الماكينة (عن طريق الهواء المضغوط)',
  'تم فحص تانك الهواء المبرد للماكينة ولا يوجد به ماء',
  'القطع التي تم استبدالها خلال أعمال الصيانة',
  'تم فحص مفاتيح التشغيل ومفتاح الطوارئ وهي تعمل بشكل صحيح.',
  'تم تزييت الخط الموجه للشفرات نقطة 7.7',
  'تم تعبئة سجل الخط الموجود بالقسم رقم (LOG-00-0014)',
];

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = (await client.query(`
      SELECT id, machine_number, machine_name
      FROM machines
      WHERE machine_number = 'PDM-04-047' AND deleted_at IS NULL
      FOR UPDATE
    `)).rows;
    if (machines.length !== 1) throw new Error(`Expected one PDM-04-047 machine, found ${machines.length}`);
    const machine = machines[0];

    const before = {
      header: (await client.query('SELECT * FROM pm_headers WHERE machine_id = $1', [machine.id])).rows,
      points: (await client.query('SELECT * FROM pm_checklist_points WHERE machine_id = $1 ORDER BY sort_order, id', [machine.id])).rows,
      records: (await client.query('SELECT * FROM pm_records WHERE machine_id = $1 ORDER BY sequence_number', [machine.id])).rows,
    };
    if (before.header.length || before.points.length || before.records.length) {
      throw new Error('PDM-04-047 already has PM data; nothing was changed');
    }
    fs.writeFileSync(
      `backups/pdm04047-pm-before-${Date.now()}.json`,
      JSON.stringify({ machine, ...before }, null, 2),
      { flag: 'wx' },
    );

    await client.query(`
      INSERT INTO pm_headers
        (machine_id, procedure_form_number, effective_date, department,
         machine_record_name, machine_record_id, show_service_area,
         pm_record_description, pm_record_title, columns_per_record,
         inspection_columns_per_print_page)
      VALUES
        ($1, 'LOG-00-0102', NULL, 'Production',
         'Suppositories Production Line', 'PDM-04-047', false,
         'سجل نشاطات الصيانة الوقائية لجهاز',
         'سجل نشاطات الصيانة الوقائية لخط إنتاج التحاميل\nSuppositories Production Line\n(PDM-04-047)',
         5, 3)
    `, [machine.id]);

    for (const [index, pointText] of points.entries()) {
      await client.query(`
        INSERT INTO pm_checklist_points
          (machine_id, point_text, result_type, sort_order, is_active)
        VALUES ($1, $2, 'yes_no', $3, true)
      `, [machine.id, pointText, index + 1]);
    }

    const record = (await client.query(`
      INSERT INTO pm_records (machine_id, sequence_number, status)
      VALUES ($1, 1, 'active')
      RETURNING id
    `, [machine.id])).rows[0];

    const count = Number((await client.query(`
      SELECT count(*) AS count FROM pm_checklist_points
      WHERE machine_id = $1 AND is_active
    `, [machine.id])).rows[0].count);
    if (count !== points.length) throw new Error(`Expected ${points.length} checklist points, found ${count}`);

    await client.query('COMMIT');
    console.log(JSON.stringify({ machineId: machine.id, machineNumber: machine.machine_number, recordId: record.id, checklistPoints: count }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
