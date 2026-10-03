import assert from 'node:assert/strict';
import { db, pool, machinesTable, annualPmPlanRowsTable, monthlyPmPlanRowsTable } from '../lib/db/src/index.ts';
import { applyMachineScheduleToPlan } from '../artifacts/api-server/src/routes/maintenance-plans.ts';
import { eq, sql } from '../lib/db/node_modules/drizzle-orm/index.js';

const rollback = new Error('intentional rollback');
try {
  await db.transaction(async tx => {
    const [machine] = await tx.insert(machinesTable).values({ machineNumber: `TEST-SCHEDULE-${Date.now()}`, machineName: 'Schedule test', pmStartDate: '2026-02-01', pmFrequencyMonths: 4 }).returning();
    await applyMachineScheduleToPlan(tx, machine.id, 2027);
    const [annual] = await tx.select().from(annualPmPlanRowsTable).where(eq(annualPmPlanRowsTable.machineId, machine.id));
    assert.equal(annual.startDate, '2027-02-01');
    assert.equal(annual.scheduledMonths, '[2,6,10]');
    const monthly = await tx.select().from(monthlyPmPlanRowsTable).where(eq(monthlyPmPlanRowsTable.machineId, machine.id));
    assert.equal(monthly.length, 3);
    await tx.update(monthlyPmPlanRowsTable).set({ actualDate: '2027-02-12', status: 'completed' }).where(eq(monthlyPmPlanRowsTable.id, monthly[0].id));
    const untouched = await tx.execute(sql`SELECT * FROM annual_pm_plan_rows WHERE machine_id <> ${machine.id} ORDER BY id`);
    await tx.update(machinesTable).set({ pmStartDate: '2026-03-15' }).where(eq(machinesTable.id, machine.id));
    // Saving just machine information leaves the plan unchanged.
    assert.equal((await tx.select().from(annualPmPlanRowsTable).where(eq(annualPmPlanRowsTable.id, annual.id)))[0].scheduledMonths, '[2,6,10]');
    await applyMachineScheduleToPlan(tx, machine.id, 2027);
    assert.equal((await tx.select().from(annualPmPlanRowsTable).where(eq(annualPmPlanRowsTable.id, annual.id)))[0].scheduledMonths, '[3,7,11]');
    const updated = await tx.select().from(monthlyPmPlanRowsTable).where(eq(monthlyPmPlanRowsTable.machineId, machine.id));
    assert.equal(updated.length, 4);
    assert.equal(updated.find(r => r.id === monthly[0].id)?.actualDate, '2027-02-12');
    assert.deepEqual(updated.filter(r => !r.actualDate).map(r => r.plannedDateFrom?.slice(5,7)).sort(), ['03','07','11']);
    assert.deepEqual((await tx.execute(sql`SELECT * FROM annual_pm_plan_rows WHERE machine_id <> ${machine.id} ORDER BY id`)).rows, untouched.rows);
    await applyMachineScheduleToPlan(tx, machine.id, 2027);
    assert.equal((await tx.select().from(monthlyPmPlanRowsTable).where(eq(monthlyPmPlanRowsTable.machineId, machine.id))).length, 4);
    throw rollback;
  });
} catch (error) { if (error !== rollback) throw error; }
finally { await pool.end(); }
console.log('PASS: opt-out, annual/monthly propagation, completed history, isolation, repeat application; all fixtures rolled back.');
