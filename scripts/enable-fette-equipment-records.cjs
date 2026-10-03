const {createRequire}=require('node:module');
const fs=require('node:fs');
const path=require('node:path');
const {Client}=createRequire(path.resolve('lib/db/package.json'))('pg');
(async()=>{
 const c=new Client({connectionString:process.env.DATABASE_URL}); await c.connect();
 try {
  await c.query('BEGIN');
  const {rows}=await c.query("SELECT m.id, m.machine_name, e.* FROM machines m JOIN equipment_information_records e ON e.machine_id=m.id WHERE m.machine_number='PDM-01-043' AND m.machine_name='Tablet Press Machine - Fette'");
  if(rows.length!==1 || rows[0].serial_number!=='090738') throw Error('Machine identity mismatch');
  const machineId=rows[0].machine_id;
  fs.writeFileSync('backups/fette-equipment-before-multiple-records.json',JSON.stringify(rows,null,2),{flag:'wx'});
  await c.query(fs.readFileSync('lib/db/migrations/20260916_add_additional_equipment_records.sql','utf8'));
  const header=(await c.query("SELECT company_name,document_name,document_number,effective_or_execution_date FROM form_headers WHERE document_type='EQUIPMENT_INFORMATION' AND document_id=$1",[machineId])).rows[0];
  const headerData={companyName:header?.company_name||'Beit Jala Pharmaceutical Co.',documentName:header?.document_name||'Equipment Information Record',documentNumber:header?.document_number||'FORM-10-0118',effectiveOrExecutionDate:header?.effective_or_execution_date||null,pageNumber:1,totalPages:1};
  for(let n=2;n<=4;n++) await c.query('INSERT INTO additional_equipment_records(machine_id,record_number,data,header) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[machineId,n,JSON.stringify({nameOfEquipment:rows[0].machine_name,identificationNumber:'PDM-01-043',dimensionWidthCm:null,dimensionHeightCm:null,dimensionDepthCm:null,weightKg:null}),JSON.stringify(headerData)]);
  const counts=(await c.query('SELECT machine_id, count(*)::int AS extra_records FROM additional_equipment_records GROUP BY machine_id')).rows;
  await c.query('COMMIT'); console.log(JSON.stringify(counts));
 }catch(e){await c.query('ROLLBACK');throw e;}finally{await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
