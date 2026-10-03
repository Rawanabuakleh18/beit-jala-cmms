const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const points = [
  'تم فحص الكوابل و الأسلاك الكهربائية و وجدت سليمة',
  'تم فحص أنابيب الهواء المضغوط و التوصيلات الخاصة بها و وجدت سليمة',
  'تم فحص محابس الأمان (safety valves) و هي سليمة',
  'تم فحص ماتور الخلاط و المضخة و كوابلها و وجدت سليمة.',
  'تم فحص Diaphragms للمحابس و وجدت سليمة.',
  'تم فحص جلد جميع وصلات Tri-Clamps و وجدت سليم.',
  'تم فحص Agitator و وجد سليم.',
  'تم فحص Rupture Disc و وجد سليم.',
  'تم فحص كمبريسات أغلفة خزانات الخلاطات و وجدت سليمة',
  'تم فحص أنابيب البخار و التبريد و وجدت سليمة',
  'تم فحص الإنارة الداخلية للخلاطات و وجدت سليمة',
  'تم فحص Spray Ball و وجد سليم.',
];

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = (await client.query(`
      SELECT id, machine_number, machine_name
      FROM machines
      WHERE machine_number = 'PDM-06-085' AND deleted_at IS NULL
      FOR UPDATE
    `)).rows;
    if (machines.length !== 1) throw new Error(`Expected one PDM-06-085 machine, found ${machines.length}`);
    const machine = machines[0];

    const before = {
      header: (await client.query('SELECT * FROM pm_headers WHERE machine_id=$1', [machine.id])).rows,
      points: (await client.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order,id', [machine.id])).rows,
      records: (await client.query('SELECT * FROM pm_records WHERE machine_id=$1 ORDER BY sequence_number', [machine.id])).rows,
    };
    if (before.points.length) throw new Error('PDM-06-085 already has checklist points; nothing was changed');

    fs.writeFileSync(
      `backups/pdm06085-pm-before-${Date.now()}.json`,
      JSON.stringify({ machine, ...before }, null, 2),
      { flag: 'wx' },
    );

    await client.query(`
      INSERT INTO pm_headers(
        machine_id, procedure_form_number, effective_date, department,
        machine_record_name, machine_record_id, show_service_area,
        pm_record_description, pm_record_title,
        columns_per_record, inspection_columns_per_print_page
      ) VALUES(
        $1, 'LOG-10-0758-0', '2023-05-18', 'Production',
        'Solution preparation system, filtration & transfer line/ PCBS 200Lt & PCBS 300Lt',
        'PDM-06-085', false, 'سجل نشاطات الصيانة الوقائية لـ',
        'سجل نشاطات الصيانة الوقائية لـ\nSolution preparation system, filtration &\ntransfer line/ PCBS 200Lt & PCBS\n300Lt #(PM-08-084),(PDM-06-085)',
        3, 3
      )
      ON CONFLICT(machine_id) DO UPDATE SET
        procedure_form_number=EXCLUDED.procedure_form_number,
        effective_date=EXCLUDED.effective_date,
        department=EXCLUDED.department,
        machine_record_name=EXCLUDED.machine_record_name,
        machine_record_id=EXCLUDED.machine_record_id,
        show_service_area=EXCLUDED.show_service_area,
        pm_record_description=EXCLUDED.pm_record_description,
        pm_record_title=EXCLUDED.pm_record_title,
        columns_per_record=EXCLUDED.columns_per_record,
        inspection_columns_per_print_page=EXCLUDED.inspection_columns_per_print_page,
        updated_at=NOW()
    `, [machine.id]);

    for (const [index, pointText] of points.entries()) {
      await client.query(`
        INSERT INTO pm_checklist_points(machine_id, point_text, result_type, sort_order, is_active)
        VALUES($1, $2, 'yes_no', $3, true)
      `, [machine.id, pointText, index + 1]);
    }

    let record = before.records.find(row => row.status === 'active');
    if (!record) {
      record = (await client.query(`
        INSERT INTO pm_records(machine_id, sequence_number, status)
        VALUES($1, $2, 'active') RETURNING id
      `, [machine.id, Math.max(0, ...before.records.map(row => row.sequence_number)) + 1])).rows[0];
    }

    const saved = (await client.query(`
      SELECT p.procedure_form_number, p.effective_date, p.inspection_columns_per_print_page,
             count(c.id)::int AS checklist_points
      FROM pm_headers p
      LEFT JOIN pm_checklist_points c ON c.machine_id=p.machine_id AND c.is_active=true
      WHERE p.machine_id=$1
      GROUP BY p.id
    `, [machine.id])).rows[0];
    if (saved.checklist_points !== 12 || saved.inspection_columns_per_print_page !== 3) {
      throw new Error('Preventive-maintenance record verification failed');
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({
      machineId: machine.id,
      machineNumber: machine.machine_number,
      recordId: record.id,
      procedureFormNumber: saved.procedure_form_number,
      effectiveDate: saved.effective_date,
      checklistPoints: saved.checklist_points,
      inspectionColumns: saved.inspection_columns_per_print_page,
    }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
