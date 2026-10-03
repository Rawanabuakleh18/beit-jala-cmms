const {createRequire}=require('node:module');
const {Client}=createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();
 try{
  await c.query('BEGIN');
  await c.query('LOCK TABLE pm_checklist_points, pm_records IN SHARE ROW EXCLUSIVE MODE');
  const names=['AC 1/2','AHU-501','AHU-401','AHU-301'];
  const machines=(await c.query('SELECT * FROM machines WHERE machine_number=ANY($1) AND deleted_at IS NULL FOR UPDATE',[names])).rows;
  assert.equal(machines.length,4);
  const source=machines.find(m=>m.machine_number===names[0]);
  const targets=names.slice(1).map(n=>machines.find(m=>m.machine_number===n));
  const tables=['pm_checklist_points','pm_records','pm_headers','pm_inspections','pm_inspection_results','pm_record_checklist_points'];
  const before={};
  for(const t of tables)before[t]=(await c.query('SELECT * FROM '+t+' ORDER BY id')).rows;
  const points=before.pm_checklist_points.filter(p=>p.machine_id===source.id&&p.is_active).sort((a,b)=>a.sort_order-b.sort_order||a.id-b.id);
  assert.equal(points.length,35);
  for(const m of targets){assert.equal(before.pm_checklist_points.filter(p=>p.machine_id===m.id).length,0);assert.equal(before.pm_inspections.filter(p=>p.machine_id===m.id).length,0);}
  fs.writeFileSync('backups/ahu-501-401-301-points-before-'+Date.now()+'.json',JSON.stringify({machines,...before},null,2),{flag:'wx'});
  const expected=points.map(({point_text,result_type,sort_order})=>({point_text,result_type,sort_order}));
  for(const m of targets){
   for(const p of expected)await c.query('INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active) VALUES($1,$2,$3,$4,true)',[m.id,p.point_text,p.result_type,p.sort_order]);
   if(!before.pm_records.some(r=>r.machine_id===m.id))await c.query("INSERT INTO pm_records(machine_id,sequence_number,status) VALUES($1,1,'active')",[m.id]);
   assert.deepEqual((await c.query('SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=$1 AND is_active ORDER BY sort_order,id',[m.id])).rows,expected);
  }
  const ids=targets.map(m=>m.id);
  for(const t of tables){const after=(await c.query('SELECT * FROM '+t+' ORDER BY id')).rows;assert.deepEqual(['pm_checklist_points','pm_records'].includes(t)?after.filter(r=>!ids.includes(r.machine_id)):after,before[t]);}
  await c.query('COMMIT');
  console.log(JSON.stringify({source:source.machine_number,targets:targets.map(m=>m.machine_number),pointsPerMachine:points.length,verified:true}));
 }catch(e){await c.query('ROLLBACK');throw e;}finally{await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
