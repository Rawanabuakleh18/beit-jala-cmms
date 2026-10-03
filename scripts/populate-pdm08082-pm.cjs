const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const points = [
  'التيار الكهربائي واصل إلى جهاز التعقيم والتأريض صحيحة',
  'ضغط الهواء حوالي 6 بار',
  'تم فحص مياه مضخة الداخلة ولا يوجد أي تسريب',
  'تم فحص ملفات ماتور المضخة وجميعها متساوية في المقاومة',
  'تم تشغيل المضخة ولا يوجد أي أصوات غير طبيعية ولا يوجد تسريب',
  'تم فحص بطاريات الـ UPS والتغذية 24 فولت وهي بحالة جيدة وتم استبدالها إذا كان موعد استبدالها وتم كتابة تاريخ التبديل على البطاريات',
  'تم فتح شاشة النظام ولا يوجد أي رسائل تحذيرية على النظام',
  'لا يوجد تسريب من أي من الوصلات الخاصة 4.1 بالمياه للجهاز وأيضاً لا يوجد تسريب للهواء المضغوط',
  'تم تغيير جلد الـ tri-clmp التي بها تسريب أو تم شده حتى تم التأكد من عدم التسريب',
  'تم تفقد جميع المحابس Diaphragm ولا يوجد تسريب وهي تعمل بشكل صحيح',
  'تم تفقد الـ bioseal في جميع المناطق ولا يوجد أي كشط أو تفتحات من خلال السيلكون',
  'تم عمل تقرير صيانة علاجية في حال اكتشاف أي عطل في الجهاز أثناء تنفيذ الصيانة الوقائية وتم توثيق العطل في Maintenance request and Corrective Action Report -FORM-10-0975',
  'القطع التي تم استبدالها خلال أعمال الصيانة.',
];

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = (await client.query(`
      SELECT id,machine_number,machine_name FROM machines
      WHERE machine_number='PDM-08-082' AND deleted_at IS NULL FOR UPDATE
    `)).rows;
    if (machines.length !== 1) throw new Error(`Expected one PDM-08-082 machine, found ${machines.length}`);
    const machine = machines[0];

    const before = {
      header: (await client.query('SELECT * FROM pm_headers WHERE machine_id=$1', [machine.id])).rows,
      points: (await client.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order,id', [machine.id])).rows,
      records: (await client.query('SELECT * FROM pm_records WHERE machine_id=$1 ORDER BY sequence_number', [machine.id])).rows,
    };
    if (before.points.length) throw new Error('PDM-08-082 already has checklist points; nothing was changed');
    fs.writeFileSync(`backups/pdm08082-pm-before-${Date.now()}.json`, JSON.stringify({ machine, ...before }, null, 2), { flag: 'wx' });

    await client.query(`
      INSERT INTO pm_headers
        (machine_id,procedure_form_number,effective_date,department,machine_record_name,machine_record_id,
         show_service_area,pm_record_description,pm_record_title,columns_per_record,inspection_columns_per_print_page)
      VALUES
        ($1,'LOG-10-0705-0','2022-03-17','Production','Ampoules autoclave','PDM-08-082',false,
         'سجل نشاطات الصيانة الوقائية لجهاز',
         'Preventive maintenance log of the Autoclave DLOV/C log',5,8)
      ON CONFLICT (machine_id) DO UPDATE SET
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
        INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active)
        VALUES($1,$2,'yes_no',$3,true)
      `, [machine.id, pointText, index + 1]);
    }

    let record = before.records.find((item) => item.status === 'active');
    if (!record) {
      record = (await client.query(`
        INSERT INTO pm_records(machine_id,sequence_number,status)
        VALUES($1,$2,'active') RETURNING id
      `, [machine.id, Math.max(0, ...before.records.map((item) => item.sequence_number)) + 1])).rows[0];
    }
    const count = Number((await client.query('SELECT count(*) AS count FROM pm_checklist_points WHERE machine_id=$1 AND is_active', [machine.id])).rows[0].count);
    if (count !== 13) throw new Error(`Expected 13 checklist points, found ${count}`);

    await client.query('COMMIT');
    console.log(JSON.stringify({ machineId: machine.id, machineNumber: machine.machine_number, recordId: record.id, checklistPoints: count, inspectionColumns: 8 }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode=1; });
