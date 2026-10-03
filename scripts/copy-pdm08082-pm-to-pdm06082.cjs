const fs=require('node:fs');
const {createRequire}=require('node:module');
const {Client}=createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();try{
  await c.query('BEGIN');
  const rows=(await c.query("SELECT id,machine_number,machine_name FROM machines WHERE machine_number IN ('PDM-08-082','PDM-06-082') AND deleted_at IS NULL ORDER BY machine_number FOR UPDATE")).rows;
  const source=rows.find(r=>r.machine_number==='PDM-08-082');
  const target=rows.find(r=>r.machine_number==='PDM-06-082');
  if(!source||!target)throw Error('Source or target autoclave machine is missing');
  const sourceHeader=(await c.query('SELECT * FROM pm_headers WHERE machine_id=$1',[source.id])).rows[0];
  const sourcePoints=(await c.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 AND is_active ORDER BY sort_order,id',[source.id])).rows;
  if(!sourceHeader||sourcePoints.length!==13)throw Error(`Expected source header and 13 points, found ${sourcePoints.length}`);
  const before={header:(await c.query('SELECT * FROM pm_headers WHERE machine_id=$1',[target.id])).rows,points:(await c.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order,id',[target.id])).rows,records:(await c.query('SELECT * FROM pm_records WHERE machine_id=$1 ORDER BY sequence_number',[target.id])).rows};
  if(before.points.length)throw Error('PDM-06-082 already has checklist points; nothing was changed');
  fs.writeFileSync(`backups/pdm06082-pm-before-copy-${Date.now()}.json`,JSON.stringify({source,target,...before},null,2),{flag:'wx'});
  await c.query(`INSERT INTO pm_headers(machine_id,procedure_form_number,effective_date,department,machine_record_name,machine_record_id,machine_record_label,show_service_area,service_area_machine_number,service_area_location,pm_record_description,pm_record_title,columns_per_record,inspection_columns_per_print_page)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    ON CONFLICT(machine_id) DO UPDATE SET procedure_form_number=EXCLUDED.procedure_form_number,effective_date=EXCLUDED.effective_date,department=EXCLUDED.department,machine_record_name=EXCLUDED.machine_record_name,machine_record_id=EXCLUDED.machine_record_id,machine_record_label=EXCLUDED.machine_record_label,show_service_area=EXCLUDED.show_service_area,service_area_machine_number=EXCLUDED.service_area_machine_number,service_area_location=EXCLUDED.service_area_location,pm_record_description=EXCLUDED.pm_record_description,pm_record_title=EXCLUDED.pm_record_title,columns_per_record=EXCLUDED.columns_per_record,inspection_columns_per_print_page=EXCLUDED.inspection_columns_per_print_page,updated_at=NOW()`,[
      target.id,sourceHeader.procedure_form_number,sourceHeader.effective_date,sourceHeader.department,target.machine_name,target.machine_number,sourceHeader.machine_record_label,sourceHeader.show_service_area,sourceHeader.service_area_machine_number,sourceHeader.service_area_location,sourceHeader.pm_record_description,sourceHeader.pm_record_title,sourceHeader.columns_per_record,sourceHeader.inspection_columns_per_print_page]);
  for(const p of sourcePoints)await c.query('INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active) VALUES($1,$2,$3,$4,true)',[target.id,p.point_text,p.result_type,p.sort_order]);
  let record=before.records.find(r=>r.status==='active');
  if(!record)record=(await c.query("INSERT INTO pm_records(machine_id,sequence_number,status) VALUES($1,$2,'active') RETURNING id",[target.id,Math.max(0,...before.records.map(r=>r.sequence_number))+1])).rows[0];
  await c.query('COMMIT');console.log(JSON.stringify({source:source.machine_number,target:target.machine_number,recordId:record.id,checklistPoints:sourcePoints.length}));
}catch(e){await c.query('ROLLBACK');throw e;}finally{await c.end();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
