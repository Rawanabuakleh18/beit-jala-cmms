const fs=require('node:fs');
const {createRequire}=require('node:module');
const {Client}=createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client=new Client({connectionString:process.env.DATABASE_URL});
(async()=>{await client.connect();try{
  await client.query('BEGIN');await client.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');
  const existing=(await client.query(`SELECT m.id FROM machines m LEFT JOIN equipment_information_records e ON e.machine_id=m.id WHERE regexp_replace(upper(m.machine_number),'\\s','','g')='PDM-06-082' OR regexp_replace(upper(COALESCE(e.identification_number,'')),'\\s','','g')='PDM-06-082' FOR UPDATE OF m`)).rows;
  if(existing.length)throw Error('PDM-06-082 already exists; nothing was changed');
  const departments=(await client.query("SELECT id,name FROM departments WHERE name='Production'")).rows;
  if(departments.length!==1)throw Error(`Expected one Production department, found ${departments.length}`);
  fs.writeFileSync(`backups/pdm06082-before-create-${Date.now()}.json`,JSON.stringify({existing,department:departments[0]},null,2),{flag:'wx'});
  const machine=(await client.query(`INSERT INTO machines(machine_number,machine_name,department_id,location,status,pm_frequency_months,pm_start_date) VALUES('PDM-06-082','Eye drop autoclave',$1,NULL,'Active',NULL,NULL) RETURNING *`,[departments[0].id])).rows[0];
  const address='P.Iva/VAT No IT0016640188\nVia Piemonte';
  const equipment=(await client.query(`INSERT INTO equipment_information_records(
    machine_id,name_of_equipment,model_number,serial_number,identification_number,date_purchased,
    purchased_from_name,purchased_from_address,manufacturing_company_name,manufacturing_company_address,
    dimension_width_cm,dimension_height_cm,dimension_depth_cm,dimensions_note,weight_kg,weight_note,
    utilities_power_supply,utilities_air,utilities_water,utilities_other,others,others_details,safety_issues,safety_issues_details)
    VALUES($1,'Eye drop autoclave','DLOV/C-CV','12669','PDM-06-082','2015','DELAMA S.P.A',$2,'DELAMA S.P.A',$2,
    NULL,NULL,NULL,'660mm/660mm/600mm',NULL,'NA','380VAC','Compressed air','Softwater\nPure steam','NA','NA','',
    'Do not start maintenance before cutting off the power supply\nFro the main electrical cabinet','') RETURNING *`,[machine.id,address])).rows[0];
  if(equipment.identification_number!=='PDM-06-082'||equipment.serial_number!=='12669')throw Error('Equipment record verification failed');
  await client.query('COMMIT');console.log(JSON.stringify({id:machine.id,machineNumber:machine.machine_number,machineName:machine.machine_name,department:departments[0].name,equipmentRecord:equipment.id}));
}catch(e){await client.query('ROLLBACK');throw e;}finally{await client.end();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
