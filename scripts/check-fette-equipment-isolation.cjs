const {createRequire}=require('node:module');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {Client}=createRequire(path.resolve('lib/db/package.json'))('pg');
(async()=>{
 const c=new Client({connectionString:process.env.DATABASE_URL}); await c.connect();
 try {
  await c.query('BEGIN');
  const before=JSON.parse(fs.readFileSync('backups/fette-equipment-before-multiple-records.json','utf8'))[0];
  const original=(await c.query('SELECT * FROM equipment_information_records WHERE machine_id=$1',[before.machine_id])).rows[0];
  for(const [key,val] of Object.entries(original)) if(!['created_at','updated_at'].includes(key)) assert.deepEqual(val,before[key]);
  const extras=(await c.query('SELECT * FROM additional_equipment_records ORDER BY machine_id, record_number')).rows;
  assert.equal(extras.length,3);
  assert.ok(extras.every(row=>row.machine_id===before.machine_id));
  assert.deepEqual(extras.map(row=>row.record_number),[2,3,4]);
  await c.query("UPDATE additional_equipment_records SET data=data || '{\"serialNumber\":\"isolation-check\"}'::jsonb WHERE machine_id=$1 AND record_number=2",[before.machine_id]);
  const unchanged=(await c.query('SELECT * FROM additional_equipment_records WHERE machine_id=$1 AND record_number>=3 ORDER BY record_number',[before.machine_id])).rows;
  assert.deepEqual(unchanged,extras.slice(1));
  assert.deepEqual((await c.query('SELECT * FROM equipment_information_records WHERE machine_id=$1',[before.machine_id])).rows[0],original);
  console.log('Passed: original unchanged; three additional records enabled for Fette only (four total); record writes isolated. Test update rolled back.');
 }finally{await c.query('ROLLBACK');await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
