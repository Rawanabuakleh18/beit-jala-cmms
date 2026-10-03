const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const points = [
  'تم فحص وتنظيف Cover Gasket ووجد سليم',
  'تم فحص مستوى زيت مضخة رفع وإنزال الغطاء وهو بالمستوى المطلوب',
  'تم تغيير Air Vent Filter, 0.22µ',
  'تم فحص الكوابل والوصلات الكهربائية وهي سليمة',
  'تم فحص الماتورات الكهربائية وعازلية ملفاتها',
  'تم فحص المقاومات الحرارية ووجدت سليمة',
  'تم فحص مفاتيح نهاية المسير ووجدت سليمة',
  'تم فحص مستوى زيت جير الخلاط وهو بالمستوى المطلوب',
  'تم فحص مستوى زيت جك الهيدروليك',
  'تم فحص جك الهيدروليك وهو سليم',
  'تم فحص الخلاط وشفراته ووجد سليم',
  'تم تشحيم الماكينة (نقاط التشحيم)',
  'تم فحص قطع التفلون / شطاحات المستحضر عن جوانب التنك',
  'تم فحص مضخة Centrifugal Pump ووجدت سليمة وعازلية ملفاتها سليمة',
  'تم فحص أنابيب الهواء المضغوط والتأكد من سلامتها',
  'تم فحص الأنابيب والوصلات وجلدها',
  'تم فحص خطوط التصريف وتنظيفها',
  'تم فحص جميع Diaphragm Valve ووجدت سليمة.',
];

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = (await client.query(`
      SELECT id, machine_number, machine_name FROM machines
      WHERE machine_number='PDM-03-055A/B' AND deleted_at IS NULL FOR UPDATE
    `)).rows;
    if (machines.length !== 1) throw new Error(`Expected one active PDM-03-055A/B machine, found ${machines.length}`);
    const machine = machines[0];

    const before = {
      header: (await client.query('SELECT * FROM pm_headers WHERE machine_id=$1', [machine.id])).rows,
      points: (await client.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order,id', [machine.id])).rows,
      records: (await client.query('SELECT * FROM pm_records WHERE machine_id=$1 ORDER BY sequence_number', [machine.id])).rows,
    };
    if (before.header.length || before.points.length || before.records.length) {
      throw new Error('PDM-03-055A/B already has PM data; nothing was changed');
    }

    const backupPath = `backups/pdm03055ab-pm-before-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify({ machine, ...before }, null, 2), { flag: 'wx' });

    await client.query(`
      INSERT INTO pm_headers(
        machine_id, procedure_form_number, effective_date, department,
        machine_record_name, machine_record_id, show_service_area,
        pm_record_description, pm_record_title,
        columns_per_record, inspection_columns_per_print_page
      ) VALUES(
        $1, 'LOG-10-0560-0', '2015-06-04', 'Production',
        'Vacuum Mixer & Homogenizer - OLSA', 'PDM-03-055', false,
        'سجل نشاطات الصيانة الوقائية للماكينة',
        'سجل نشاطات الصيانة الوقائية للماكينة\nVacuum Mixer & Homogenizer - OLSA (PDM-03-055)',
        8, 8
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
      SELECT h.procedure_form_number, h.effective_date, h.columns_per_record,
             h.inspection_columns_per_print_page, count(p.id)::int AS checklist_points
      FROM pm_headers h
      LEFT JOIN pm_checklist_points p ON p.machine_id=h.machine_id AND p.is_active=true
      WHERE h.machine_id=$1 GROUP BY h.id
    `, [machine.id])).rows[0];
    if (verified.checklist_points !== 18 || verified.inspection_columns_per_print_page !== 8) {
      throw new Error('Preventive-maintenance record verification failed');
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({
      machineId: machine.id, machineNumber: machine.machine_number,
      recordId: record.id, procedureFormNumber: verified.procedure_form_number,
      effectiveDate: verified.effective_date, checklistPoints: verified.checklist_points,
      inspectionColumns: verified.inspection_columns_per_print_page, backupPath,
    }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
