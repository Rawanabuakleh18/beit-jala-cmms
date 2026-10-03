const {createRequire}=require('node:module');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {Client}=createRequire(path.resolve('lib/db/package.json'))('pg');
(async()=>{
 const c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();
 try{
  await c.query('BEGIN');
  assert.equal((await c.query("SELECT id FROM machines WHERE lower(regexp_replace(machine_number,'\\s','','g'))='pac-1'")).rowCount,0);
  const source=(await c.query("SELECT * FROM machines WHERE machine_number='AC 2/5'")).rows[0];
  const header=(await c.query('SELECT * FROM pm_headers WHERE machine_id=$1',[source.id])).rows[0];
  const points=(await c.query('SELECT * FROM pm_checklist_points WHERE machine_id=$1 AND is_active ORDER BY sort_order',[source.id])).rows;
  assert.equal(points.length,35);
  const backup={source,header,points,plans:(await c.query('SELECT * FROM annual_pm_plans ORDER BY id')).rows};
  fs.writeFileSync(`backups/pac1-before-create-${Date.now()}.json`,JSON.stringify(backup,null,2),{flag:'wx'});
  const machine=(await c.query("INSERT INTO machines(machine_number,machine_name,department_id,status,pm_frequency_months,pm_start_date) VALUES('Pac-1','Air Handling Unit',$1,'Active',4,'2026-03-01') RETURNING *",[source.department_id])).rows[0];
  await c.query('UPDATE machines SET location=$1 WHERE id=$2',['New store building roof',machine.id]);
  const equipment={"name_of_equipment":"Air handling unit","model_number":"PAHHC80C6H2","serial_number":"NA","identification_number":"Pac-1","date_purchased":"07/05/2011","purchased_from_name":"Top service","purchased_from_address":"Ramallah, Palestine, TEL: 02-2964966","manufacturing_company_name":"Petra engineering","manufacturing_company_address":"Jordan/ Amman:\nTel: (962 6) 405 09 40","dimensions_note":"2900 X 1390 X 1740 mm","weight_note":"N.A","utilities_power_supply":"400volt-50hz,3ph, 3 Kw","utilities_air":"NA","utilities_water":"One cooling coil, and one heating coil","utilities_other":"NA","others":"11.1 Air flow\n11.2 Position\n11.3 Serviced area","others_details":"7420 CFM\nNew store building roof\nTo the basement floor in new stores area","safety_issues":"Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning","safety_issues_details":null};
  const insert=async(table,data)=>{const keys=Object.keys(data);return (await c.query(`INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`,Object.values(data))).rows[0];};
  await insert('equipment_information_records',{machine_id:machine.id,...equipment});
  const fields=Object.keys(header).filter(k=>!['id','machine_id','created_at','updated_at'].includes(k));
  const copied=Object.fromEntries(fields.map(k=>[k,header[k]]));
  copied.machine_record_id='Pac-1';copied.service_area_machine_number='Pac-1';copied.service_area_location='To the basement floor in new stores area';
  await insert('pm_headers',{machine_id:machine.id,...copied});
  for(const p of points)await insert('pm_checklist_points',{machine_id:machine.id,point_text:p.point_text,result_type:p.result_type,sort_order:p.sort_order,is_active:true});
  await insert('pm_records',{machine_id:machine.id,sequence_number:1,status:'active'});
  const department=(await c.query('SELECT name FROM departments WHERE id=$1',[source.department_id])).rows[0].name;
  for(const plan of backup.plans.filter(p=>p.year>=2026)){
   const start=`${plan.year}-03-01`;
   const row=await insert('annual_pm_plan_rows',{plan_id:plan.id,machine_id:machine.id,department,machine_name:machine.machine_name,machine_code:machine.machine_number,frequency_months:4,duration:'',start_date:start,finish_date:start,scheduled_months:'[3,7,11]'});
   for(const month of [3,7,11]){
    let monthly=(await c.query('SELECT * FROM monthly_pm_plans WHERE year=$1 AND month=$2',[plan.year,month])).rows[0];
    if(!monthly)monthly=await insert('monthly_pm_plans',{year:plan.year,month});
    const next=(await c.query('SELECT COALESCE(MAX(row_number),0)+1 AS n FROM monthly_pm_plan_rows WHERE plan_id=$1',[monthly.id])).rows[0].n;
    const date=`${plan.year}-${String(month).padStart(2,'0')}-01`;
    await insert('monthly_pm_plan_rows',{plan_id:monthly.id,annual_plan_row_id:row.id,machine_id:machine.id,row_number:next,department_name:department,machine_name:machine.machine_name,identification_number:machine.machine_number,planned_date_from:date,planned_date_to:date,status:'due'});
   }
  }
  const saved=(await c.query('SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=$1 ORDER BY sort_order',[machine.id])).rows;
  assert.deepEqual(saved,points.map(({point_text,result_type,sort_order})=>({point_text,result_type,sort_order})));
  const eq=(await c.query('SELECT * FROM equipment_information_records WHERE machine_id=$1',[machine.id])).rows[0];
  for(const [key,val]of Object.entries(equipment))assert.equal(typeof val==='number'?Number(eq[key]):eq[key],val);
  await c.query('COMMIT');console.log(JSON.stringify({id:machine.id,number:machine.machine_number,points:saved.length,start:machine.pm_start_date,frequency:4,months:[3,7,11],verified:true}));
 }catch(e){await c.query('ROLLBACK');throw e;}finally{await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
