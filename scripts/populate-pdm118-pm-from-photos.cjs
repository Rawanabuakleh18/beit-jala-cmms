const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const points = [
  'تم فحص الكامات العلوية و هي سليمة.',
  'تم تنظيف لبادات تزييت نهاية البنشات (Lube Felts) و اعادة تركيبها و هي سليمة.',
  'تم فحص الكامات السفلية و هي سليمة.',
  'تم فحص عجلات الضغط العلوية و السفلية (عددها 8) و تنظيفها من البودرة المتراكمة عليها.',
  'تم تزييت السطح الخارجي لعجلات الضغط العلوية و السفلية للماكينة بواسطة زيت نوع (OPTIMOL 1500 Spray).',
  'تم فحص لكمات مانعة سقوط البنشات السفلية (Punch Retaining) و هي سليمة.',
  'تم فحص ربلات البنشات السفلية (Punches Seals) و هي سليمة.',
  'تم فحص سطح الماكينة الحامل للدائز (Die Plate Contact Surface) و هي سليمة و لا يوجد بها اي خدوش.',
  'تم فحص مستوى الزيت في التنك و هو بالمستوى المطلوب (زيت نوع Alpha Zn-320/Alpha SP-320).',
  'تم فحص جميع أنابيب الزيت و هي سليمة.',
  'تم التأكد ان جميع نقاط التزييت الموجودة في الماكينة تعطي زيت للاماكن المخصصة لتزييتها.',
  'تم فحص فراشات التعبئة (Filling Wheels) لوحدة Force Feeder و هي سليمة.',
  'تم فحص مسننات نقل الحركة لوحد Force Feeder و هي سليمة.',
  'تم تشحيم مسننات نقل الحركة و تنظيف الشحمة القديمة عنها.',
  'تم فحص بوابة التحكم و التوجيه لحبات الحبوب (الجيدة و الرديئة) و هي سليمة.',
  'تم فحص الابواب البلاستيكية العلوية و هي سليمة.',
  'تم فحص كسكيتات الابواب البلاستيكية العلوية و هي سليمة.',
  'تم فحص ايادي تثبيت ابواب الستانلس ستيل السفلية مع جسم الماكينة الخارجي و هي موجودة و سليمة.',
  'تم تنظيف حوض تجميع الاغبرة الخاصة بجهاز Tablet Deduster.',
  'تم فحص البراغي (عددها 4) المثبتة للمجرى الحلزوني لجهاز Tablet Deduster و وجدت مثبتة باحكام.',
  'تم تنظيف جهاز Metal Detector و هو سليم وتم فحصه عن طريق تمرير القطع المعدنية وهو يعمل بشكل جيد.',
  'تم تنظيف فلتر تجميع الاغبرة من البودرة العالقة فيه لجهاز Powder Feeding System.',
  'تم فحص أنابيب شفط الاغبرة لجهاز Powder Feeding System و هي سليمة.',
  'تم فحص الكوابل الكهربائية الخاصة بجهاز Powder Feeding System و وجدت سليمة.',
  'تم فحص الكوابل الكهربائية الخاصة بجهاز Dust Collector و وجدت سليمة.',
  'تم تنظيف الفلتر الخاصة بجهاز Dust Collector و وجد سليمة من اي ثقوب او تمزق.',
  'تم تسجيل نشاطات الصيانة المنجزة في سجل الماكينة (LOG-00-0014) الموجود في القسم.',
  'القطع التي تم استبدالها خلال اعمال الصيانة.',
];
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const machine = (await c.query('SELECT id FROM machines WHERE machine_number=$1 FOR UPDATE', ['PDM-01-118'])).rows;
    assert.deepEqual(machine, [{ id: 84 }]);
    const existing = (await c.query('SELECT * FROM pm_checklist_points WHERE machine_id=84')).rows;
    assert.equal(existing.length, 0, 'Checklist already populated; refusing to overwrite');
    const header = (await c.query('SELECT * FROM pm_headers WHERE machine_id=84 FOR UPDATE')).rows;
    assert.equal(header.length, 1);
    fs.writeFileSync('backups/pdm118-pm-before-photo-import.json', JSON.stringify({ header, checklist: existing }, null, 2), { flag: 'wx' });
    for (const [i, text] of points.entries()) {
      await c.query('INSERT INTO pm_checklist_points (machine_id,point_text,result_type,sort_order,is_active) VALUES ($1,$2,$3,$4,true)', [84, text, i === 27 ? 'text' : 'yes_no', i + 1]);
    }
    await c.query('UPDATE pm_headers SET procedure_form_number=$1,effective_date=$2,inspection_columns_per_print_page=3,pm_record_description=$3,pm_record_title=$4,updated_at=NOW() WHERE machine_id=84', [
      'LOG-03-0824-0', '2026-04-27', 'سجل نشاطات الصيانة الوقائية لماكينة كبس الحبوب',
      'سجل نشاطات الصيانة الوقائية لماكينة كبس الحبوب\nDouble Rotary Tablet Press Machine/\nKarnavati (PDM-01-118)',
    ]);
    const saved = (await c.query('SELECT point_text,result_type,sort_order FROM pm_checklist_points WHERE machine_id=84 ORDER BY sort_order')).rows;
    assert.deepEqual(saved.map(p => p.point_text), points);
    assert.equal(saved.length, 28);
    await c.query('COMMIT');
    console.log('Verified 28 checklist points and header for PDM-01-118. No inspection results or signatures added.');
  } catch (e) { await c.query('ROLLBACK'); throw e; }
  finally { await c.end(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
