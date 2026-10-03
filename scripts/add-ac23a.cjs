const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
(async () => {
  await c.connect();
  try {
    if (process.argv.includes('--apply')) {
      await c.query('BEGIN');
      const existing = await c.query("SELECT id FROM machines WHERE regexp_replace(upper(machine_number),'\\s','','g')='AC2/3A'");
      if (existing.rowCount) throw Error('AC 2/3 A already exists; no changes made');
      const source = (await c.query("SELECT id,department_id,status FROM machines WHERE machine_number='AC 2/5' AND deleted_at IS NULL")).rows;
      if (source.length !== 1) throw Error('Template machine missing');
      const machine = (await c.query("INSERT INTO machines(machine_number,machine_name,department_id,location,status) VALUES($1,$2,$3,$4,$5) RETURNING id", ['AC 2/3 A','Air Handling Unit',source[0].department_id,'Syrup filling',source[0].status])).rows[0];
      const address = 'BP 49 Route de Thil\n01122 Montluel - France\nTelefax: (+33) 472252121\nFax: (+33) 472252251';
      await c.query(`INSERT INTO equipment_information_records(machine_id,name_of_equipment,model_number,serial_number,identification_number,date_purchased,purchased_from_name,purchased_from_address,manufacturing_company_name,manufacturing_company_address,dimension_width_cm,dimension_height_cm,dimension_depth_cm,weight_kg,utilities_power_supply,utilities_air,utilities_water,utilities_other,others,others_details,safety_issues,safety_issues_details) VALUES($1,'Air Handling Unit','39CF-230','990012EE','AC 2/3 A','1999','Carrier',$2,'Carrier',$2,392,110,145,523,'400 VAC, 50 Hz','Not Applicable','Not Applicable','Not Applicable',$3,$4,'12.1',$5)`, [machine.id,address,'11.1 Air flow\n11.2 Motor power\n11.3 Service area','1180 L/s\n2.5 KW\nSyrup filling','Disconnect the main power supply circuit breaker before performing any maintenance and cleaning activity.']);
      const header = await c.query(`INSERT INTO pm_headers(machine_id,procedure_form_number,effective_date,department,machine_record_name,machine_record_id,show_service_area,service_area_machine_number,service_area_location,pm_record_description,pm_record_title,columns_per_record,inspection_columns_per_print_page) SELECT $1,procedure_form_number,effective_date,department,'Air Handling Unit','AC 2/3 A',true,'AC 2/3 A','Syrup filling',pm_record_description,pm_record_title,columns_per_record,inspection_columns_per_print_page FROM pm_headers WHERE machine_id=$2`, [machine.id,source[0].id]);
      if (header.rowCount !== 1) throw Error('Template header missing');
      const points = await c.query(`INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active) SELECT $1,point_text,result_type,sort_order,true FROM pm_checklist_points WHERE machine_id=$2 AND is_active ORDER BY sort_order`,[machine.id,source[0].id]);
      if (points.rowCount !== 35) throw Error('Unexpected checklist count');
      await c.query("INSERT INTO pm_records(machine_id,sequence_number,status) VALUES($1,1,'active')",[machine.id]);
      await c.query('COMMIT');
      console.log(JSON.stringify({machineId:machine.id,machineNumber:'AC 2/3 A',checklistPoints:points.rowCount}));
      return;
    }
    console.log(JSON.stringify((await c.query("SELECT m.id,m.machine_number,m.department_id,m.location,h.*, (SELECT count(*) FROM pm_checklist_points p WHERE p.machine_id=m.id AND p.is_active) AS points FROM machines m LEFT JOIN pm_headers h ON h.machine_id=m.id WHERE m.machine_number LIKE 'AC 2/%' ORDER BY m.id")).rows));
    console.log(JSON.stringify((await c.query("SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=(SELECT id FROM machines WHERE machine_number='AC 2/5') AND is_active ORDER BY sort_order")).rows));
    console.log(JSON.stringify((await c.query("SELECT others,others_details,safety_issues,safety_issues_details FROM equipment_information_records WHERE identification_number='AC 2/5'")).rows));
  } catch(e) { await c.query('ROLLBACK'); throw e; } finally { await c.end(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
