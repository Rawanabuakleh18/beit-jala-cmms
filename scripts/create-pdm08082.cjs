const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE machines IN SHARE ROW EXCLUSIVE MODE');

    const existing = (await client.query(`
      SELECT m.id, m.machine_number, e.identification_number
      FROM machines m
      LEFT JOIN equipment_information_records e ON e.machine_id=m.id
      WHERE regexp_replace(upper(m.machine_number), '\\s', '', 'g')='PDM-08-082'
         OR regexp_replace(upper(COALESCE(e.identification_number, '')), '\\s', '', 'g')='PDM-08-082'
      FOR UPDATE OF m
    `)).rows;
    if (existing.length) throw new Error('PDM-08-082 already exists; nothing was changed');

    const departments = (await client.query("SELECT id,name FROM departments WHERE name='Production'")).rows;
    if (departments.length !== 1) throw new Error(`Expected one Production department, found ${departments.length}`);

    fs.writeFileSync(
      `backups/pdm08082-before-create-${Date.now()}.json`,
      JSON.stringify({ existing, department: departments[0] }, null, 2),
      { flag: 'wx' },
    );

    const machine = (await client.query(`
      INSERT INTO machines
        (machine_number,machine_name,department_id,location,status,pm_frequency_months,pm_start_date)
      VALUES ('PDM-08-082','Ampoules autoclave',$1,NULL,'Active',NULL,NULL)
      RETURNING *
    `, [departments[0].id])).rows[0];

    const companyAddress = 'P.Iva/VAT No IT0016640188\nVia Piemonte';
    const equipment = (await client.query(`
      INSERT INTO equipment_information_records
        (machine_id,name_of_equipment,model_number,serial_number,identification_number,date_purchased,
         purchased_from_name,purchased_from_address,manufacturing_company_name,manufacturing_company_address,
         dimension_width_cm,dimension_height_cm,dimension_depth_cm,dimensions_note,weight_kg,weight_note,
         utilities_power_supply,utilities_air,utilities_water,utilities_other,others,others_details,
         safety_issues,safety_issues_details)
      VALUES
        ($1,'Ampoules autoclave','DLOV/C-CV','14424','PDM-08-082','2016',
         'DELAMA S.P.A',$2,'DELAMA S.P.A',$2,NULL,NULL,NULL,'660mm/660mm/600mm',NULL,'NA',
         '380VAC','Compressed air','Softwater\nPure steam','NA','NA','',
         'Do not start maintenance before cutting off the power supply\nFro the main electrical cabinet','')
      RETURNING *
    `, [machine.id, companyAddress])).rows[0];

    if (equipment.identification_number !== 'PDM-08-082' || equipment.model_number !== 'DLOV/C-CV' || equipment.serial_number !== '14424') {
      throw new Error('Equipment record verification failed');
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({ id: machine.id, machineNumber: machine.machine_number, machineName: machine.machine_name, department: departments[0].name, equipmentRecord: equipment.id }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode=1; });
