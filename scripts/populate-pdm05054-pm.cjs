const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const points = [
  'الوصلات والكوابل الكهربائية سليمة',
  'تم فحص عازلية ماتور الماكنة',
  'منظمات الهواء سليمة',
  'تم تفريغ الماء والشوائب من منظمات الهواء',
  'تم تفريغ شفاط الأغبرة من البودرة وتنظيف فلتر القماش',
  'تم تنظيف أجزاء الماكنة',
  'تم تنظيف أبواب الماكنة',
  'تم فحص حساسات الأبواب وكوابلها',
  'تم مسح الأجزاء المتحركة بزيت غذائي',
  'تم تشحيم كامات ومسندات الماكنة',
  'تم تشحيم الجنازير وفحصها',
  'تم تنظيف لوحة الكهرباء من الأغبرة',
  'تم فحص أنبوب الهواء المضغوط',
  'تم فحص فراشي الماكنة وهي سليمة',
  'تم تنظيف شفاط الأغبرة',
  'تم فحص مفتاح زيادة وتقليل السرعة وأنه يعمل كما يجب',
  'القطع التي تم استبدالها خلال أعمال الصيانة.',
];

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = (await client.query(`
      SELECT id, machine_number, machine_name
      FROM machines
      WHERE machine_number='PDM-05-054' AND deleted_at IS NULL
      FOR UPDATE
    `)).rows;
    if (machines.length !== 1) throw new Error(`Expected one active PDM-05-054 machine, found ${machines.length}`);
    const machine = machines[0];

    const before = {
      header: (await client.query('SELECT * FROM pm_headers WHERE machine_id=$1', [machine.id])).rows,
      points: (await client.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order,id', [machine.id])).rows,
      records: (await client.query('SELECT * FROM pm_records WHERE machine_id=$1 ORDER BY sequence_number', [machine.id])).rows,
    };
    if (before.header.length || before.points.length || before.records.length) {
      throw new Error('PDM-05-054 already has PM data; nothing was changed');
    }

    const backupPath = `backups/pdm05054-pm-before-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify({ machine, ...before }, null, 2), { flag: 'wx' });

    await client.query(`
      INSERT INTO pm_headers(
        machine_id, procedure_form_number, effective_date, department,
        machine_record_name, machine_record_id, show_service_area,
        pm_record_description, pm_record_title,
        columns_per_record, inspection_columns_per_print_page
      ) VALUES(
        $1, 'LOG-10-0723-0', '2023-06-28', 'Production',
        'Automatic Capsule Filling Machine PF-40', 'PDM-05-054', false,
        'سجل نشاطات الصيانة الوقائية للماكنة',
        'سجل نشاطات الصيانة الوقائية للماكنة\nAutomatic Capsule Filling Machine PF-40\nPDM-05-054',
        5, 2
      )
    `, [machine.id]);

    for (const [index, pointText] of points.entries()) {
      await client.query(`
        INSERT INTO pm_checklist_points(machine_id, point_text, result_type, sort_order, is_active)
        VALUES($1, $2, 'yes_no', $3, true)
      `, [machine.id, pointText, index + 1]);
    }

    const record = (await client.query(`
      INSERT INTO pm_records(machine_id, sequence_number, status)
      VALUES($1, 1, 'active') RETURNING id
    `, [machine.id])).rows[0];

    const verified = (await client.query(`
      SELECT h.procedure_form_number, h.effective_date,
             h.inspection_columns_per_print_page,
             count(p.id)::int AS checklist_points
      FROM pm_headers h
      LEFT JOIN pm_checklist_points p ON p.machine_id=h.machine_id AND p.is_active=true
      WHERE h.machine_id=$1
      GROUP BY h.id
    `, [machine.id])).rows[0];
    if (verified.checklist_points !== points.length || verified.inspection_columns_per_print_page !== 2) {
      throw new Error('Preventive-maintenance record verification failed');
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({
      machineId: machine.id,
      machineNumber: machine.machine_number,
      recordId: record.id,
      procedureFormNumber: verified.procedure_form_number,
      effectiveDate: verified.effective_date,
      checklistPoints: verified.checklist_points,
      inspectionColumns: verified.inspection_columns_per_print_page,
      backupPath,
    }));
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
