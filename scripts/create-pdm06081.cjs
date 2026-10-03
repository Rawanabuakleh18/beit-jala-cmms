const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async()=>{
  await client.connect();
  try{
    await client.query('BEGIN');
    await client.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');
    const existing=(await client.query(`SELECT m.id FROM machines m LEFT JOIN equipment_information_records e ON e.machine_id=m.id WHERE regexp_replace(upper(m.machine_number),'\\s','','g')='PDM-06-081' OR regexp_replace(upper(COALESCE(e.identification_number,'')),'\\s','','g')='PDM-06-081' FOR UPDATE OF m`)).rows;
    if(existing.length) throw new Error('PDM-06-081 already exists; nothing was changed');
    const departments=(await client.query("SELECT id,name FROM departments WHERE name='Production'")).rows;
    if(departments.length!==1) throw new Error(`Expected one Production department, found ${departments.length}`);
    fs.writeFileSync(`backups/pdm06081-before-create-${Date.now()}.json`,JSON.stringify({existing,department:departments[0]},null,2),{flag:'wx'});
    const machine=(await client.query(`INSERT INTO machines(machine_number,machine_name,department_id,location,status,pm_frequency_months,pm_start_date) VALUES('PDM-06-081','Eye Drops Filling Line/ ROTA',$1,NULL,'Active',NULL,NULL) RETURNING *`,[departments[0].id])).rows[0];
    const purchasedAddress='b- Oflinger Str.118,DE-79664 Wehr(Germany )';
    const equipment=(await client.query(`
      INSERT INTO equipment_information_records(
        machine_id,name_of_equipment,model_number,serial_number,identification_number,date_purchased,
        purchased_from_name,purchased_from_address,manufacturing_company_name,manufacturing_company_address,
        dimension_width_cm,dimension_height_cm,dimension_depth_cm,dimensions_note,weight_kg,weight_note,
        utilities_power_supply,utilities_air,utilities_water,utilities_other,others,others_details,safety_issues,safety_issues_details)
      VALUES($1,'Eye Drops Filling Line/ ROTA','FLR50 GB-TS','172','PDM-06-081','2017',
        'a-ROTA Verpackungstechnik GmbH&CO.KG',$2,'a- ROTA Verpackungstechnik GmbH&CO.KG',$2,
        NULL,NULL,NULL,'1670*2750*4250mm',NULL,'N.A','380V.A.C -50 Hz/510 Wat','6 Bar','','',
        'Noise Level\nFilling Volumes','80 dB\n0.2-100 ml',
        'Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning','')
      RETURNING *
    `,[machine.id,purchasedAddress])).rows[0];
    if(equipment.identification_number!=='PDM-06-081'||equipment.model_number!=='FLR50 GB-TS'||equipment.serial_number!=='172') throw new Error('Equipment record verification failed');
    await client.query('COMMIT');
    console.log(JSON.stringify({id:machine.id,machineNumber:machine.machine_number,machineName:machine.machine_name,department:departments[0].name,equipmentRecord:equipment.id}));
  }catch(error){await client.query('ROLLBACK');throw error;}finally{await client.end();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
