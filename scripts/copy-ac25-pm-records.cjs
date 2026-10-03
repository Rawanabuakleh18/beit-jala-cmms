const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const numbers = ['AC 2/5', 'AHU-101', 'AC 1/2', 'AC 4/4', 'AC 4/3'];
    const machines = (await c.query('SELECT * FROM machines WHERE machine_number=ANY($1) FOR UPDATE', [numbers])).rows;
    assert.equal(machines.length, 5);
    const source = machines.find(m => m.machine_number === numbers[0]);
    const targets = numbers.slice(1).map(number => machines.find(m => m.machine_number === number));
    const targetIds = targets.map(m => m.id);
    const tables = ['pm_headers', 'pm_checklist_points', 'pm_records', 'pm_inspections', 'pm_inspection_results', 'pm_record_checklist_points'];
    const before = {};
    for (const table of tables) before[table] = (await c.query(`SELECT * FROM ${table} ORDER BY id FOR UPDATE`)).rows;
    const header = before.pm_headers.find(h => h.machine_id === source.id);
    assert.ok(header);
    const points = before.pm_checklist_points.filter(p => p.machine_id === source.id && p.is_active).sort((a,b) => a.sort_order-b.sort_order);
    assert.equal(points.length, 35);
    assert.equal(before.pm_checklist_points.filter(p => targetIds.includes(p.machine_id)).length, 0);
    assert.equal(before.pm_inspections.filter(p => targetIds.includes(p.machine_id)).length, 0);
    fs.writeFileSync(`backups/ac25-pm-copy-before-${Date.now()}.json`, JSON.stringify({ machines, ...before }, null, 2), { flag: 'wx' });
    const fields = Object.keys(header).filter(k => !['id','machine_id','created_at','updated_at'].includes(k));
    for (const target of targets) {
      const copied = Object.fromEntries(fields.map(k => [k, typeof header[k] === 'string' ? header[k].replaceAll(source.machine_number, target.machine_number) : header[k]]));
      copied.machine_record_id = target.machine_number;
      copied.service_area_machine_number = target.machine_number;
      await c.query(`INSERT INTO pm_headers(machine_id,${fields.join(',')}) VALUES($1,${fields.map((_,i) => '$'+(i+2)).join(',')}) ON CONFLICT(machine_id) DO UPDATE SET ${fields.map(k => `${k}=EXCLUDED.${k}`).join(',')},updated_at=NOW()`, [target.id, ...fields.map(k => copied[k])]);
      for (const p of points) await c.query('INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active) VALUES($1,$2,$3,$4,true)', [target.id,p.point_text.replaceAll(source.machine_number,target.machine_number),p.result_type,p.sort_order]);
      if (!before.pm_records.some(r => r.machine_id === target.id)) await c.query("INSERT INTO pm_records(machine_id,sequence_number,status) VALUES($1,1,'active')", [target.id]);
      const savedHeader = (await c.query('SELECT * FROM pm_headers WHERE machine_id=$1', [target.id])).rows[0];
      assert.deepEqual(Object.fromEntries(fields.map(k => [k,savedHeader[k]])), copied);
      const savedPoints = (await c.query('SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=$1 AND is_active ORDER BY sort_order', [target.id])).rows;
      assert.deepEqual(savedPoints,points.map(p => ({point_text:p.point_text.replaceAll(source.machine_number,target.machine_number),result_type:p.result_type,sort_order:p.sort_order})));
    }
    for (const table of tables) {
      const after = (await c.query(`SELECT * FROM ${table} ORDER BY id`)).rows;
      if (['pm_headers','pm_checklist_points','pm_records'].includes(table)) assert.deepEqual(after.filter(r => !targetIds.includes(r.machine_id)), before[table].filter(r => !targetIds.includes(r.machine_id)));
      else assert.deepEqual(after, before[table]);
    }
    await c.query('COMMIT');
    console.log(JSON.stringify({source:source.machine_number,targets:targets.map(m=>m.machine_number),pointsPerMachine:points.length,verified:true}));
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode=1; });
