const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const points = [
  'عند استلام الماكينة: الماكينة والمنطقة المحيطة بها خالية من أي مواد ممكن أن تتعرض للتلوث.',
  'جميع الكوابل والوصلات والأسلاك الكهربائية سليمة',
  'تم تشحيم الماكينة (6 مواقع)',
  'جميع المتحسسات الحرارية سليمة',
  'تم فحص الجنازير وتزييتها',
  'تم فحص خطوط الهواء وماء التبريد',
  'مستوى الماء غير القابل للتجمد Antifreeze ضمن المستوى المطلوب',
  'ماتور الماكينة يعمل بشكل جيد وكما يجب أن يكون',
  'تم تفريغ فلتر الهواء من الماكينة',
  'تم تزييت جميع أعمدة التوجيه Guides',
  'تم فحص محطة لحام PVC مع السيلوفان Sealing station ومحطة التشغيل Forming station ومحطة القطع Punching station ولا يوجد فيها أية مشاكل',
  'تم تنظيف الماكينة من آثار الشحمة والزيت.',
  'تم تسجيل نشاطات الصيانة المنجزة في سجل للماكينة (LOG-00-0014) الموجود في القسم.',
  'القطع التي تم استبدالها خلال أعمال الصيانة.',
];

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = (await client.query(`
      SELECT id, machine_number, machine_name FROM machines
      WHERE machine_number='PDM-07-096' AND deleted_at IS NULL FOR UPDATE
    `)).rows;
    if (machines.length !== 1) throw new Error(`Expected one active PDM-07-096 machine, found ${machines.length}`);
    const machine = machines[0];

    const before = {
      header: (await client.query('SELECT * FROM pm_headers WHERE machine_id=$1', [machine.id])).rows,
      points: (await client.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order,id', [machine.id])).rows,
      records: (await client.query('SELECT * FROM pm_records WHERE machine_id=$1 ORDER BY sequence_number', [machine.id])).rows,
    };
    if (before.header.length || before.points.length || before.records.length) {
      throw new Error('PDM-07-096 already has PM data; nothing was changed');
    }

    const backupPath = `backups/pdm07096-pm-before-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify({ machine, ...before }, null, 2), { flag: 'wx' });

    await client.query(`
      INSERT INTO pm_headers(
        machine_id, procedure_form_number, effective_date, department,
        machine_record_name, machine_record_id, show_service_area,
        service_area_machine_number, service_area_location,
        pm_record_description, pm_record_title,
        columns_per_record, inspection_columns_per_print_page
      ) VALUES(
        $1, 'LOG-10-0467-0', '2021-10-13', 'Production',
        'Blister Packaging Machine', 'PDM-07-096', true,
        'PDM-07-096', NULL,
        'سجل نشاطات الصيانة الوقائية المنجزة للماكينة',
        'سجل نشاطات الصيانة الوقائية المنجزة للماكينة\nBlister تغليف الحبوب والكبسولات\nPackaging Machine',
        3, 3
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
      SELECT h.procedure_form_number, h.effective_date, h.show_service_area,
             h.service_area_machine_number, h.inspection_columns_per_print_page,
             count(p.id)::int AS checklist_points
      FROM pm_headers h
      LEFT JOIN pm_checklist_points p ON p.machine_id=h.machine_id AND p.is_active=true
      WHERE h.machine_id=$1 GROUP BY h.id
    `, [machine.id])).rows[0];
    if (verified.checklist_points !== 14 || verified.inspection_columns_per_print_page !== 3) {
      throw new Error('Preventive-maintenance record verification failed');
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({
      machineId: machine.id, machineNumber: machine.machine_number,
      recordId: record.id, procedureFormNumber: verified.procedure_form_number,
      effectiveDate: verified.effective_date, checklistPoints: verified.checklist_points,
      inspectionColumns: verified.inspection_columns_per_print_page,
      serviceAreaMachineNumber: verified.service_area_machine_number, backupPath,
    }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode=1; });
