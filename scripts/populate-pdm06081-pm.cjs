const fs=require('node:fs');
const {createRequire}=require('node:module');
const {Client}=createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const points=[
  'عند استلام الماكنة / الماكنة والمنطقة المحيطة بها خالية من الأدوات يمكن أن تعرض للتلوث',
  'جميع الأسلاك والكوابل الكهربائية سليمة',
  'جميع الحساسات وكوابلها سليمة',
  'حساسات الماكنة سليمة ولا يوجد بها كسر',
  'أنشطة نقل الحركة سليمة',
  'أنشطة نقل الحركة لا يوجد بها قطع أو اهتراء',
  'ستارات الماكنة سليمة ولا يوجد قطع أو تآكل بالمفصلات',
  'تم تنظيف البيل والكامات والجنازير',
  'تم تشحيم البيل',
  'تم تزييت الكامات والمسننات وجنزير نقل الحركة',
  'تم فحص ألواح الجانبين وهي سليمة ولا يوجد بها كسر',
  'تم فحص منظم الهواء المضغوط وهو يعمل جيداً',
  'تم فحص إنارة جهاز فلترة الهواء وهي سليمة',
  'تم فحص ستارة جهاز فلترة الهواء وهي سليمة',
  'تم فحص جهاز التحكم بتدفق الهواء وهو يعمل كما يجب',
  'مروحة دفع الهواء لا يوجد بها تآكل أو قطع بالمروحة',
  'تم فحص أجهزة فلترة الهواء وهي تعمل جيداً',
  'القطع التي تم استبدالها خلال أعمال الصيانة',
];
(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();try{
  await c.query('BEGIN');
  const machines=(await c.query("SELECT id,machine_number FROM machines WHERE machine_number='PDM-06-081' AND deleted_at IS NULL FOR UPDATE")).rows;
  if(machines.length!==1)throw Error(`Expected one PDM-06-081 machine, found ${machines.length}`);
  const machine=machines[0];
  const before={header:(await c.query('SELECT * FROM pm_headers WHERE machine_id=$1',[machine.id])).rows,points:(await c.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order,id',[machine.id])).rows,records:(await c.query('SELECT * FROM pm_records WHERE machine_id=$1 ORDER BY sequence_number',[machine.id])).rows};
  if(before.points.length)throw Error('PDM-06-081 already has checklist points; nothing was changed');
  fs.writeFileSync(`backups/pdm06081-pm-before-${Date.now()}.json`,JSON.stringify({machine,...before},null,2),{flag:'wx'});
  await c.query(`INSERT INTO pm_headers(machine_id,procedure_form_number,effective_date,department,machine_record_name,machine_record_id,show_service_area,pm_record_description,pm_record_title,columns_per_record,inspection_columns_per_print_page)
    VALUES($1,'LOG-01-0701-0','2024-05-09','Production','Eye Drops Filling Line/ ROTA','PDM-06-081',false,'سجل نشاطات الصيانة الوقائية لجهاز','سجل تنفيذ نشاطات الصيانة الوقائية لخط تعبئة القطرة\nEye Drops Filling line / Rota\nرقم (PDM-06-081)',5,4)
    ON CONFLICT(machine_id) DO UPDATE SET procedure_form_number=EXCLUDED.procedure_form_number,effective_date=EXCLUDED.effective_date,department=EXCLUDED.department,machine_record_name=EXCLUDED.machine_record_name,machine_record_id=EXCLUDED.machine_record_id,show_service_area=EXCLUDED.show_service_area,pm_record_description=EXCLUDED.pm_record_description,pm_record_title=EXCLUDED.pm_record_title,columns_per_record=EXCLUDED.columns_per_record,inspection_columns_per_print_page=EXCLUDED.inspection_columns_per_print_page,updated_at=NOW()`,[machine.id]);
  for(const [i,text] of points.entries())await c.query("INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active) VALUES($1,$2,'yes_no',$3,true)",[machine.id,text,i+1]);
  let record=before.records.find(r=>r.status==='active');
  if(!record)record=(await c.query("INSERT INTO pm_records(machine_id,sequence_number,status) VALUES($1,$2,'active') RETURNING id",[machine.id,Math.max(0,...before.records.map(r=>r.sequence_number))+1])).rows[0];
  const count=Number((await c.query('SELECT count(*) AS count FROM pm_checklist_points WHERE machine_id=$1 AND is_active',[machine.id])).rows[0].count);
  if(count!==18)throw Error(`Expected 18 checklist points, found ${count}`);
  await c.query('COMMIT');console.log(JSON.stringify({machineId:machine.id,recordId:record.id,checklistPoints:count,inspectionColumns:4}));
}catch(e){await c.query('ROLLBACK');throw e;}finally{await c.end();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
