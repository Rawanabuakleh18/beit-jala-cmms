const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    const duplicate = await client.query("SELECT id FROM machines WHERE regexp_replace(upper(machine_number),'\\s','','g')='AC1/12'");
    if (duplicate.rowCount) throw Error('AC 1/12 already exists');
    const sourceRows = (await client.query("SELECT id,department_id,status,pm_frequency_months,pm_start_date FROM machines WHERE machine_number='AC 1/7' AND deleted_at IS NULL")).rows;
    if (sourceRows.length !== 1) throw Error('AC 1/7 template missing');
    const source = sourceRows[0];
    const serviceArea = 'Draying and granulating room (First floor)';
    const machine = (await client.query(`
      INSERT INTO machines(machine_number,machine_name,department_id,location,status,pm_frequency_months,pm_start_date)
      VALUES('AC 1/12','Air Handling Unit',$1,$2,$3,$4,$5) RETURNING id
    `,[source.department_id,serviceArea,source.status,source.pm_frequency_months,source.pm_start_date])).rows[0];
    const address = 'BP 49 Route de Thil\n01122 Montluel - France\nTelefax: (+33) 472252121\nFax: (+33) 472252251';
    await client.query(`
      INSERT INTO equipment_information_records(
        machine_id,name_of_equipment,model_number,serial_number,identification_number,date_purchased,
        purchased_from_name,purchased_from_address,manufacturing_company_name,manufacturing_company_address,
        dimension_width_cm,dimension_height_cm,dimension_depth_cm,weight_kg,
        utilities_power_supply,utilities_air,utilities_water,utilities_other,
        others,others_details,safety_issues,safety_issues_details
      ) VALUES(
        $1,'Air Handling Unit','39CF 340','990013EE','AC 1/12','1999',
        'Carrier',$2,'Carrier',$2,136.0,104.5,357,550,
        '400VAC, 50Hz','Not Applicable','Hot water in heating coil, Chilled water in cooling coil','Not Applicable',
        '11.1 Air flow L/s\n11.2 Service area',$3,'12.1',$4
      )
    `,[machine.id,address,`2125 L/s\n${serviceArea}`,'Disconnect the main power supply circuit breaker before performing any maintenance and cleaning activity.']);
    const header = await client.query(`
      INSERT INTO pm_headers(
        machine_id,procedure_form_number,effective_date,department,machine_record_name,machine_record_id,
        show_service_area,service_area_machine_number,service_area_location,pm_record_description,
        pm_record_title,columns_per_record,inspection_columns_per_print_page
      ) SELECT $1,procedure_form_number,effective_date,department,'Air Handling Unit','AC 1/12',true,'AC 1/12',$2,
               pm_record_description,pm_record_title,columns_per_record,inspection_columns_per_print_page
        FROM pm_headers WHERE machine_id=$3
    `,[machine.id,serviceArea,source.id]);
    if (header.rowCount !== 1) throw Error('Template PM header missing');
    const points = await client.query(`
      INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active)
      SELECT $1,point_text,result_type,sort_order,true
      FROM pm_checklist_points WHERE machine_id=$2 AND is_active ORDER BY sort_order
    `,[machine.id,source.id]);
    if (points.rowCount !== 35) throw Error('Unexpected checklist count');
    await client.query("INSERT INTO pm_records(machine_id,sequence_number,status) VALUES($1,1,'active')",[machine.id]);
    const annual = await client.query(`
      INSERT INTO annual_pm_plan_rows(
        plan_id,machine_id,department,machine_name,machine_location,machine_code,frequency_months,
        duration,start_date,finish_date,scheduled_months,is_override
      ) SELECT template.plan_id,$1,template.department,'Air Handling Unit',$2,'AC 1/12',
               template.frequency_months,template.duration,template.start_date,template.finish_date,
               template.scheduled_months,false
        FROM annual_pm_plan_rows template
        JOIN annual_pm_plans plan ON plan.id=template.plan_id
       WHERE template.machine_id=$3 AND plan.year=2026
         AND NOT EXISTS(SELECT 1 FROM annual_pm_plan_rows existing WHERE existing.plan_id=template.plan_id AND existing.machine_id=$1)
    `,[machine.id,serviceArea,source.id]);
    if (annual.rowCount !== 1) throw Error('AC 1/7 annual-plan row missing');
    await client.query('COMMIT');
    console.log(JSON.stringify({machineId:machine.id,machineNumber:'AC 1/12',frequencyMonths:source.pm_frequency_months,startDate:source.pm_start_date,checklistPoints:points.rowCount,annualPlanRows:annual.rowCount}));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
