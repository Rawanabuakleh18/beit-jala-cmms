const {createRequire}=require('node:module');
const path=require('node:path');
const {Client}=createRequire(path.resolve('lib/db/package.json'))('pg');
(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();try{console.log(JSON.stringify((await c.query("SELECT m.id, m.machine_number, m.machine_name, e.model_number, e.serial_number FROM machines m LEFT JOIN equipment_information_records e ON e.machine_id=m.id WHERE m.machine_number='PDM-01-043A' OR m.machine_name ILIKE '%fette%' ORDER BY m.id")).rows,null,2));}finally{await c.end();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
