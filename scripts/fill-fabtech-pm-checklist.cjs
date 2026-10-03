const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = createRequire(path.resolve('lib/db/package.json'))('pg');

// Transcribed from the supplied sheets. Repeated images of 29–43 are included once.
// The user supplied the continuation of point 43 from the following page.
const points = [
  'تم قراءة فرق الضغط على أطراف الفلاتر لماكينة معالجة الهواء AHU و تم تسجيل القراءة في "سجل قراءات فرق الضغط على أطراف الفلاتر".',
  'تم فحص ساعات الضغط لخطوط ماء التبريد والتسخين الدافع و الراجع على الماكينة AHU',
  'يفحص وتنظيف خطوط تصريف مياه التكثيف والتأكد من عدم وجود أوساخ',
  'تم تنظيف سطح الماكينة و جوانبها من الأغبرة و الأوساخ',
  'تم التأكد من سلامة شفرات المروحة و تم تنظيف شفرات المروحة',
  'تم تنظيف السطح الخارجي للمروحة',
  'تم فحص عازلية ملفات الماتور و هي جيدة.',
  'تم تشحيم بيل الماتور',
  'تم فحص مقاومات التسخين وعازليتها',
  'تم فحص رافعات الفلاتر من حيث حركة الكبل و وجود تآكل',
  'تم فحص عازلية ملفات ماتور الرافعة و هي جيدة',
  'تم فحص حبل الرافعة و هو سليم و نظيف',
  'تم فحص حركة بيستون قفل فلتر و هو سليم',
  'تم فحص بيستون اهتزاز فلاتر المواد الماكينة و هو سليم',
  'تم فحص بيستون اهتزاز فلاتر المواد الماكينة',
  'تم فحص أنبوب النفخ لقاعدة فلتر المواد للماكينة وأنبوب نفخ حاوية المواد العلوي و السفلي',
  'تم فحص عازلية ملفات ماتور دفع الهواء',
  'تم فحص سلامة عجلات الحاوية و ارتفاع حاوية المواد',
  'تم فحص صمامات مجاري الهواء و هي سليمة',
  'تم فحص شبك أو منخل في قرص حاوية المواد',
  'تم فحص مؤشرات الضغط (Differential Pressure Product Filter gauges) وهي سليمة',
  'تم فحص زجاجة بيان المنتج (Product) داخل السلندر و هي سليمة',
  'تم فحص سلامة طوق منع التسريب (Gasket) لجميع أجزاء الماكينة',
  'تم تنظيف لامبة الإنارة داخل السلندر و هي سليمة',
  'تم فحص مرابط قاعدة فلاتر المنتج وهي سليمة',
  'تم فحص مجاري الهواء (Ducts) و لا يوجد تسريب للهواء',
  'تم فحص Explosion Valves ووجدت سليمة',
  'تم فحص عازلية ملفات ماتور تدوير المياه وهي سليمة',
  'تم فحص جميع أنابيب الهواء المضغوط و هي سليمة',
  'تم فحص محابس الماء المسؤولة عن صرف المياه',
  'تم بتشغيل منقي البودرة من خلال تعبئة التنك الخاص لماكنة تنقية البودرة (Scrubber)',
  'تم فحص سلامة أقشطة نقل على محرك الخلاط الرئيسي (Mixing Impeller)',
  'تم فحص بيستون تفريغ المواد (Pneumatically Discharge)',
  'تم فحص بيستون باب وعاء الخلاط الرئيسي (RMG) (Main Lid)',
  'تم فحص عازلية ملفات محركات الخلط - Mixing - Chopper Motor- Impeller',
  'تم فحص مستوى زيت التبريد في تنك الزيت الموجود خلف الماكينة (Cooling Pump)',
  'تم تشغيل جميع المحركات وتفقد أي صوت غير عادي ناتج عن عمود دوران أو حركة',
  'تم فحص حساس العزم و قيم التيار للمحرك الرئيسي (Mixing Impeller)',
  'تم تشغيل وفحص سلامة محرك الخلاط الرئيسي (Blender) وعمل تشحيم لعمود الدوران',
  'تم فحص مستوى زيت الهيدروليك الموجود في منطقة الخدمات',
  'تم تشحيم مجرى حركة التنك العمودية للماكينة',
  'تم فحص حساس الوضع العمودي للتنك عند الإيقاف (Home Position)',
  'تم فحص حاجز الحماية للماكينة ومن حساس قفل الباب وأنه يعمل جيدًا',
];

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const machines = (await c.query('SELECT id FROM machines WHERE machine_number=$1', ['PDM-01-097'])).rows;
    assert.equal(machines.length, 1);
    const machineId = machines[0].id;
    assert.equal(machineId, 58);
    const before = (await c.query('SELECT * FROM pm_checklist_points ORDER BY id FOR UPDATE')).rows;
    const own = before.filter(p => p.machine_id === machineId);
    const records = (await c.query('SELECT * FROM pm_records ORDER BY id')).rows;
    const inspections = (await c.query('SELECT * FROM pm_inspections ORDER BY id')).rows;
    const results = (await c.query('SELECT * FROM pm_inspection_results ORDER BY id')).rows;
    assert.equal(points.length, 43);
    if (own.length === points.length && own.every((p, i) => p.point_text === points[i] && p.sort_order === i + 1 && p.is_active)) {
      await c.query('COMMIT');
      console.log('All 43 points already present.');
      return;
    }
    assert.equal(own.length, 0, 'Existing checklist found; review before changing it.');
    assert.equal(inspections.filter(i => i.machine_id === machineId).length, 0);
    fs.writeFileSync('backups/fabtech-pm-before-checklist-fill.json', JSON.stringify({ machineId, points: own, records: records.filter(r => r.machine_id === machineId) }, null, 2), { flag: 'wx' });
    for (const [index, point] of points.entries()) {
      await c.query('INSERT INTO pm_checklist_points(machine_id,point_text,result_type,sort_order,is_active) VALUES($1,$2,$3,$4,true)', [machineId, point, 'yes_no', index + 1]);
    }
    const after = (await c.query('SELECT * FROM pm_checklist_points ORDER BY id')).rows;
    assert.deepEqual(after.filter(p => p.machine_id !== machineId), before.filter(p => p.machine_id !== machineId));
    assert.deepEqual(after.filter(p => p.machine_id === machineId).map(p => [p.sort_order, p.point_text, p.result_type]), points.map((text, i) => [i + 1, text, 'yes_no']));
    assert.deepEqual((await c.query('SELECT * FROM pm_records ORDER BY id')).rows, records);
    assert.deepEqual((await c.query('SELECT * FROM pm_inspections ORDER BY id')).rows, inspections);
    assert.deepEqual((await c.query('SELECT * FROM pm_inspection_results ORDER BY id')).rows, results);
    await c.query('COMMIT');
    console.log('Saved 43 ordered checklist points for PDM-01-097. Other machines and inspection results unchanged.');
  } catch (error) { await c.query('ROLLBACK'); throw error; }
  finally { await c.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
