const {createRequire}=require('node:module');
const fs=require('node:fs');
const path=require('node:path');
const {Client}=createRequire(path.resolve('lib/db/package.json'))('pg');
(async()=>{
 const c=new Client({connectionString:process.env.DATABASE_URL}); await c.connect();
 try {
  await c.query('BEGIN');
  const {rows}=await c.query("SELECT e.*,m.machine_name,m.machine_number FROM equipment_information_records e JOIN machines m ON m.id=e.machine_id WHERE m.machine_number=$1 FOR UPDATE OF e",['PDM-01-089']);
  if(rows.length!==1 || !/Karnavati/i.test(rows[0].machine_name)) throw Error('Machine identity mismatch');
  console.log(JSON.stringify({machineId:rows[0].machine_id,name:rows[0].machine_name,utilities:[rows[0].utilities_power_supply,rows[0].utilities_air,rows[0].utilities_water,rows[0].utilities_other]}));
  if(process.argv.includes('--apply')){
   fs.writeFileSync('backups/karnavati-utilities-before-update.json',JSON.stringify(rows,null,2),{flag:'wx'});
   const result=await c.query('UPDATE equipment_information_records SET utilities_power_supply=$1,utilities_air=$2,utilities_water=$3,utilities_other=$4,updated_at=NOW() WHERE id=$5 RETURNING machine_id,utilities_power_supply,utilities_air,utilities_water,utilities_other',['3ph Ac-20.5KW -4Hp-2800rpm','6bar','Tap water for cooling','200mmdia*100mm width',rows[0].id]);
   if(result.rowCount!==1) throw Error('Unexpected record count');
   await c.query('COMMIT');console.log(JSON.stringify(result.rows));
  }else await c.query('ROLLBACK');
 }catch(e){await c.query('ROLLBACK');throw e;}finally{await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
