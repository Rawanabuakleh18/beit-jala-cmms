const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');
    const existing = (await client.query("SELECT * FROM machines WHERE upper(trim(machine_number))='ENGM-129' FOR UPDATE")).rows;
    if (existing.length) throw Error('ENGM-129 already exists; nothing was changed');
    const departments = (await client.query("SELECT id,name FROM departments WHERE name='Engineering & Maintenance'")).rows;
    if (departments.length !== 1) throw Error(`Expected one Engineering & Maintenance department, found ${departments.length}`);
    fs.writeFileSync(`backups/engm129-before-create-${Date.now()}.json`, JSON.stringify({ existing, department: departments[0] }, null, 2), { flag: 'wx' });

    const machine = (await client.query(`INSERT INTO machines
      (machine_number,machine_name,department_id,location,status,pm_frequency_months,pm_start_date)
      VALUES ('ENGM-129','Dust Extraction Unit - HORIZON',$1,NULL,'Active',NULL,NULL)
      RETURNING *`, [departments[0].id])).rows[0];

    const companyAddress = [
      'Willment Way, Avonmouth, Bristol BS11 8DJ',
      'Tel: +44(0) 117 982 1415',
      'Fax: +44(0) 117 982 0630',
      'E-mail: sales@horizon-int.com',
      'Web site: www.horizon-int.com',
    ].join('\n');
    const equipment = (await client.query(`INSERT INTO equipment_information_records
      (machine_id,name_of_equipment,model_number,serial_number,identification_number,date_purchased,
       purchased_from_name,purchased_from_address,manufacturing_company_name,manufacturing_company_address,
       dimension_width_cm,dimension_height_cm,dimension_depth_cm,weight_kg,weight_note,
       utilities_power_supply,utilities_air,utilities_water,utilities_other,others,others_details,
       safety_issues,safety_issues_details)
      VALUES ($1,'Dust Extraction Unit - HORIZON','ACM','8559','ENGM-129','2007',
       'Horizon International',$2,'Horizon International',$2,
       205,420,102,NULL,'Not Available',
       '415 V, 3-phase, 50 Hz, 11KW','Not Applicable','Not Applicable','Not Applicable',
       '11.1 Capacity','4500 CFM','12.1',
       'Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning activity.')
      RETURNING *`, [machine.id, companyAddress])).rows[0];

    if (equipment.identification_number !== 'ENGM-129' || equipment.serial_number !== '8559') {
      throw Error('Equipment record verification failed');
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({ id: machine.id, machineNumber: machine.machine_number, machineName: machine.machine_name, department: departments[0].name, equipmentRecord: equipment.id }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
