const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query("SELECT id FROM machines WHERE regexp_replace(upper(machine_number),'\\s','','g')='AC2/3B'");
    if (existing.rowCount) throw Error('AC 2/3 B already exists');
    const source = (await client.query("SELECT id,department_id,status FROM machines WHERE machine_number='AC 2/3 A' AND deleted_at IS NULL")).rows;
    if (source.length !== 1) throw Error('AC 2/3 A template missing');
    const machine = (await client.query("INSERT INTO machines(machine_number,machine_name,department_id,location,status) VALUES($1,$2,$3,$4,$5) RETURNING id", ['AC 2/3 B','Air Handling Unit',source[0].department_id,'Syrup preparation',source[0].status])).rows[0];
    const address = 'BP 49 Route de Thil\n01122 Montluel - France\nTelefax: (+33) 472252121\nFax: (+33) 472252251';
    await client.query(`INSERT INTO equipment_information_records(machine_id,name_of_equipment,model_number,serial_number,identification_number,date_purchased,purchased_from_name,purchased_from_address,manufacturing_company_name,manufacturing_company_address,dimension_width_cm,dimension_height_cm,dimension_depth_cm,weight_kg,utilities_power_supply,utilities_air,utilities_water,utilities_other,others,others_details,safety_issues,safety_issues_details) VALUES($1,'Air Handling Unit','39CF-240','990003EE','AC 2/3 B','1999','Carrier',$2,'Carrier',$2,385,117,170,753,'400 VAC, 50 Hz','Not Applicable','Not Applicable','Not Applicable',$3,$4,'12.1',$5)`, [machine.id,address,'11.1 Air flow\n11.2 Motor power\n11.3 Service area','1322 L/s\n3 KW\nSyrup preparation','Disconnect the main power supply circuit breaker before performing any maintenance and cleaning activity.']);
    const header = await client.query(`INSERT INTO pm_headers(machine_id,procedure_form_number,effective_date,department,machine_record_name,machine_record_id,show_service_area,service_area_machine_number,service_area_location,pm_record_description,pm_record_title,columns_per_record,inspection_columns_per_print_page) SELECT $1,procedure_form_number,effective_date,department,'Air Handling Unit','AC 2/3 B',true,'AC 2/3 B','Syrup preparation',pm_record_description,pm_record_title,columns_per_record,inspection_columns_per_print_page FROM pm_headers WHERE machine_id=$2`, [machine.id,source[0].id]);
    if (header.rowCount !== 1) throw Error('Template PM header missing');
    const points = await client.query(`INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active) SELECT $1,point_text,result_type,sort_order,true FROM pm_checklist_points WHERE machine_id=$2 AND is_active ORDER BY sort_order`,[machine.id,source[0].id]);
    if (points.rowCount !== 35) throw Error('Unexpected checklist count');
    await client.query("INSERT INTO pm_records(machine_id,sequence_number,status) VALUES($1,1,'active')",[machine.id]);
    await client.query('COMMIT');
    console.log(JSON.stringify({machineId:machine.id,machineNumber:'AC 2/3 B',checklistPoints:points.rowCount}));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
