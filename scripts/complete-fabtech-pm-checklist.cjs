const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');
const corrected43 = 'تم فحص حاجز الحماية للماكينة ومن حساس قفل الباب (Safty Proxy Sensors) وأنه يعمل جيدًا';
const continuation = [
  'تم فحص خطوط الزيت المضغوط الواصلة إلى الماكينة من عدم وجود تسريب للزيت',
  'تم فحص محور الدوران للماكينة بسحب ذراع التوقف بجانب الماكينة وعمل تشحيم لجزيئات الانزلاق للعمود',
  'تم تشغيل والإغلاق لصمام تفريغ المواد (Rotary Valve) ورافعة مستوى التنك عن قاعدة التنك',
  'تم فحص سلامة أقشطة نقل على محرك الطاحونة الرئيسي (Co-Mill Motor)',
  'تم فحص عازلية ملفات ماتور الطاحونة',
  'تم فحص سلامة العجلات من أي تلف أو انشقاقات',
  'تم فحص عازلية ملفات ماتور ضخ المياه WIP',
  'تم فحص جميع صمامات المياه الموجودة على الماكينة (Inlet water SOV-Outlet SOV- Machine water Sov)',
  'تم فحص مقاومات الحرارة الراكبة على تنك الغسيل وفحص العازلية لها',
  'تم فحص جميع أنابيب المياه والوصلات الخاصة بها من حيث وجود تسريب للمياه',
  'تم تشغيل مضخة المياه وفحص صمام الإغلاق وتحويل المسار إلى الخط الراجع إلى التنك (Bybass)',
  'تم تشغيل ماتور الخلط الهوائي وتفقد بأن المحرك يدور بشكل طبيعي',
  'تم تشغيل مضخة المواد (Peristalitic Pump) والتأكد أنها سليمة',
  'تم فحص عازلية ملفات ماتور شفط البودرة أنها سليمة',
  'تم تفقد الأجزاء الميكانيكية للماكينة وفحص شد البراغي',
  'تم فحص جميع pneumatic seals ولا يوجد تسريب للهواء المضغوط منها وهي سليمة',
  'القطع التي تم استبدالها خلال أعمال الصيانة',
];
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const machines = (await c.query('SELECT id FROM machines WHERE machine_number=$1', ['PDM-01-097'])).rows;
    assert.equal(machines.length, 1);
    assert.equal(machines[0].id, 58);
    const before = (await c.query('SELECT * FROM pm_checklist_points ORDER BY id FOR UPDATE')).rows;
    const own = before.filter(p => p.machine_id === 58).sort((a, b) => a.sort_order - b.sort_order);
    const preserved = {};
    for (const table of ['pm_records', 'pm_record_checklist_points', 'pm_inspections', 'pm_inspection_results']) {
      preserved[table] = (await c.query(`SELECT * FROM ${table} ORDER BY id`)).rows;
    }
    assert.equal(continuation.length, 17);
    const expected = continuation.map((text, i) => [i + 44, text, i === 16 ? 'text' : 'yes_no']);
    if (own.length === 60 && own[42].point_text === corrected43) {
      assert.deepEqual(own.slice(43).map(p => [p.sort_order, p.point_text, p.result_type]), expected);
      await c.query('COMMIT');
      console.log('Checklist already complete.');
      return;
    }
    assert.equal(own.length, 43);
    assert.deepEqual(own.map(p => p.sort_order), Array.from({ length: 43 }, (_, i) => i + 1));
    assert.ok(own.every(p => p.is_active));
    assert.ok(own[42].point_text.includes('حساس قفل الباب'));
    fs.writeFileSync('backups/fabtech-pm-before-continuation.json', JSON.stringify(own, null, 2), { flag: 'wx' });
    await c.query('UPDATE pm_checklist_points SET point_text=$1,updated_at=NOW() WHERE id=$2', [corrected43, own[42].id]);
    for (const [sortOrder, text, resultType] of expected) {
      await c.query('INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active) VALUES(58,$1,$2,$3,true)', [text, resultType, sortOrder]);
    }
    const after = (await c.query('SELECT * FROM pm_checklist_points ORDER BY id')).rows;
    assert.deepEqual(after.filter(p => p.machine_id !== 58 || p.sort_order < 43), before.filter(p => p.machine_id !== 58 || p.sort_order < 43));
    const saved = after.filter(p => p.machine_id === 58).sort((a, b) => a.sort_order - b.sort_order);
    assert.equal(saved.length, 60);
    assert.equal(saved[42].point_text, corrected43);
    assert.deepEqual(saved.slice(43).map(p => [p.sort_order, p.point_text, p.result_type]), expected);
    for (const [table, rows] of Object.entries(preserved)) {
      assert.deepEqual((await c.query(`SELECT * FROM ${table} ORDER BY id`)).rows, rows);
    }
    await c.query('COMMIT');
    console.log('Saved points 44-60 and corrected 43. Point 60 accepts text. Earlier points, other machines and inspection history unchanged.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
