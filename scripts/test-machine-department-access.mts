import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";

// Isolated schema: no production rows, users, permissions or plans are changed.
const requireDb = createRequire(path.resolve("lib/db/package.json"));
const { Client } = requireDb("pg");
const sourceUrl = process.env.DATABASE_URL!;
const schema = `test_machine_access_${randomUUID().replaceAll("-", "")}`;
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
const setup = new Client({ connectionString: sourceUrl });
await setup.connect();
let server: import("node:http").Server | undefined;
let appPool: { end: () => Promise<void> } | undefined;
let checks = 0;
try {
  await setup.query(`CREATE SCHEMA ${quote(schema)}`);
  const tables = (await setup.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")).rows;
  for (const { tablename } of tables) {
    await setup.query(`CREATE TABLE ${quote(schema)}.${quote(tablename)} (LIKE public.${quote(tablename)} INCLUDING ALL)`);
  }
  const serials = (await setup.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND column_default LIKE 'nextval(%' ")).rows;
  for (const { table_name, column_name } of serials) {
    const sequence = `${table_name}_${column_name}_test_seq`;
    await setup.query(`CREATE SEQUENCE ${quote(schema)}.${quote(sequence)}`);
    await setup.query(`ALTER TABLE ${quote(schema)}.${quote(table_name)} ALTER COLUMN ${quote(column_name)} SET DEFAULT nextval('${schema}.${sequence}')`);
  }
  const url = new URL(sourceUrl);
  url.searchParams.set("options", `-c search_path=${schema}`);
  process.env.DATABASE_URL = url.toString();
  process.env.LOG_LEVEL = "silent";
  process.env.NODE_ENV = "test";
  process.env.COOKIE_SECURE = "false";
  process.env.SESSION_SECRET = randomUUID();
  const { default: app } = await import("../artifacts/api-server/src/app.ts");
  const { pool } = await import("../lib/db/src/index.ts");
  appPool = pool;
  const insert = async (table: string, values: Record<string, unknown>) => {
    const entries = Object.entries(values);
    return (await pool.query(`INSERT INTO ${quote(table)} (${entries.map(([key]) => quote(key)).join(",")}) VALUES (${entries.map((_, index) => `$${index + 1}`).join(",")}) RETURNING *`, entries.map(([, value]) => value))).rows[0];
  };
  const role = await insert("roles", { name: "Scoped test" });
  const adminRole = await insert("roles", { name: "Admin" });
  const production = await insert("departments", { name: "Production" });
  const engineering = await insert("departments", { name: "Engineering" });
  const employee = await insert("users", { username: "scoped", password_hash: "unused", role_id: role.id, machine_department_ids: JSON.stringify([production.id]) });
  const admin = await insert("users", { username: "admin", password_hash: "unused", role_id: adminRole.id, machine_department_ids: "[]" });
  const machines = [];
  for (const [index, department] of [production.id, engineering.id, null].entries()) {
    machines.push(await insert("machines", { machine_name: `Machine ${index}`, machine_number: `TEST-${index}`, department_id: department, pm_start_date: "2026-01-01", pm_frequency_months: 1 }));
  }
  const requests = [];
  for (const machine of machines) {
    requests.push(await insert("maintenance_requests", { request_report_number: `TEST-${machine.id}`, machine_id: machine.id, requested_by_user_id: employee.id, department_id: production.id, machine_name: machine.machine_name, machine_number: machine.machine_number, request_date: "2026-09-22", failure_description: "test", status: "Closed" }));
  }
  const events = [];
  for (const [index, machine] of machines.entries()) {
    const record = await insert("corrective_maintenance_records", { machine_id: machine.id, sequence_number: 1, machine_name: machine.machine_name, machine_number: machine.machine_number });
    events.push(await insert("corrective_maintenance_events", { record_id: record.id, request_id: requests[index].id, machine_id: machine.id, row_number: 1, handover_date: "2026-09-22", repair_time_slots: JSON.stringify([{ date: "2026-09-22", from: "09:00", to: "10:00" }]) }));
  }
  const permissions = ["view_machines", "edit_machine", "create_machine", "view_dashboard", "submit_maintenance_request", "manage_maintenance_requests", "archive_maintenance_requests", "view_reports", "edit_reports", "view_annual_maintenance_plan", "view_monthly_maintenance_plan", "edit_monthly_maintenance_plan", "edit_annual_maintenance_plan", "view_pm_records", "view_corrective_maintenance", "manage_users", "view_audit_logs"];
  const cookie = async (user: any, roleName: string) => {
    const sid = randomUUID();
    await pool.query("INSERT INTO sessions(sid, sess, expire) VALUES($1,$2,$3)", [sid, JSON.stringify({ cookie: { originalMaxAge: 3600000, expires: new Date(Date.now() + 3600000).toISOString(), httpOnly: true, path: "/" }, userId: user.id, roleName, roleId: user.role_id, permissions }), new Date(Date.now() + 3600000)]);
    const signature = createHmac("sha256", process.env.SESSION_SECRET!).update(sid).digest("base64").replace(/=+$/, "");
    return `connect.sid=${encodeURIComponent(`s:${sid}.${signature}`)}`;
  };
  const employeeCookie = await cookie(employee, "Scoped test");
  const adminCookie = await cookie(admin, "Admin");
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server!.once("listening", resolve));
  const address = server.address() as import("node:net").AddressInfo;
  const call = async (route: string, expected = 200, method = "GET", body?: unknown, auth = employeeCookie) => {
    const response = await fetch(`http://127.0.0.1:${address.port}/api${route}`, { method, headers: { cookie: auth, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await response.json();
    assert.equal(response.status, expected, `${method} ${route}: ${JSON.stringify(data)}`);
    checks++;
    return data;
  };
  assert.deepEqual((await call("/machines")).map((row: any) => row.id), [machines[0].id]);
  assert.deepEqual((await call("/maintenance-requests/machines")).map((row: any) => row.id), [machines[0].id]);
  assert.deepEqual((await call("/maintenance-requests")).map((row: any) => row.id), [requests[0].id]);
  await call(`/machines/${machines[0].id}`);
  await call(`/MaChInEs/${machines[1].id}`, 403);
  for (const suffix of ["", "/equipment-information", "/equipment-information/records", "/pm/current", "/corrective-maintenance/history"]) await call(`/machines/${machines[1].id}${suffix}`, 403);
  await call(`/machines/%${machines[1].id.toString().charCodeAt(0).toString(16)}`, 403);
  for (const suffix of ["", "/external-maintenance", "/external-maintenance-receipt"]) await call(`/maintenance-requests/${requests[1].id}${suffix}`, 403);
  await call(`/maintenance-requests/by-number/${requests[1].request_report_number}`, 404);
  await call(`/maintenance-requests/header?requestId=${requests[1].id}`, 403);
  await call(`/machines/${machines[1].id}`, 403, "PUT", { machineName: "denied" });
  await call(`/machines/${machines[0].id}`, 403, "PUT", { departmentId: engineering.id });
  await call(`/machines/${machines[0].id}`, 200, "PUT", { location: "Allowed edit" });
  await call("/machines", 403, "POST", { machineName: "denied", machineNumber: "denied", departmentId: engineering.id });
  await call("/maintenance-requests", 403, "POST", { machineId: machines[1].id });
  await call(`/maintenance-requests/${requests[1].id}/archive`, 403, "PATCH");
  const annual = await call("/maintenance-plans/annual/2026");
  assert.deepEqual(annual.rows.map((row: any) => row.machineId), [machines[0].id]);
  const monthly = await call("/maintenance-plans/monthly/2026/9");
  assert.deepEqual(monthly.rows.map((row: any) => row.machineId), [machines[0].id]);
  const otherAnnual = (await pool.query("SELECT id FROM annual_pm_plan_rows WHERE machine_id=$1", [machines[1].id])).rows[0];
  const otherMonthly = (await pool.query("SELECT id FROM monthly_pm_plan_rows WHERE machine_id=$1", [machines[1].id])).rows[0];
  await call("/maintenance-plans/annual/2026", 403, "PUT", { rows: [{ id: otherAnnual.id, startDate: "2026-02-01" }] });
  await call("/maintenance-plans/annual/2026", 403, "PUT", { rows: [{ id: annual.rows[0].id, startDate: "2026-02-01" }, { id: otherAnnual.id }] });
  assert.equal((await pool.query("SELECT start_date FROM annual_pm_plan_rows WHERE id=$1", [annual.rows[0].id])).rows[0].start_date, "2026-01-01", "Mixed batches must reject before any writes");
  const updatedAnnual = await call("/maintenance-plans/annual/2026", 200, "PUT", { rows: [{ id: annual.rows[0].id, startDate: "2026-01-01", frequencyMonths: 1 }] });
  assert.deepEqual(updatedAnnual.rows.map((row: any) => row.machineId), [machines[0].id]);
  await call("/maintenance-plans/monthly/2026/9", 403, "PUT", { rows: [{ id: otherMonthly.id }] });
  await call(`/maintenance-plans/monthly/2026/9/rows/${otherMonthly.id}`, 403, "DELETE");
  await call("/maintenance-plans/monthly/2026/9/rows", 403, "POST", { machineId: machines[1].id });
  const dashboard = await call("/dashboard/stats");
  assert.equal(dashboard.totalMachines, 1);
  assert.equal(dashboard.maintenanceRequests.total, 1);
  assert.equal((await call("/maintenance-requests/reports/corrective-maintenance?year=2026")).annualTotal, 1);
  const summary = await call("/maintenance-requests/reports/annual-maintenance-summary?year=2026");
  assert.equal(summary.months[8].corrective.total, 1);
  const evaluation = await call("/maintenance-requests/reports/monthly-maintenance-evaluation?year=2026&month=9");
  assert.equal(evaluation.totalCorrectiveRequests, 1);
  const log = await call("/maintenance-requests/closed-log");
  assert.deepEqual(log.map((row: any) => row.machineNumber), [machines[0].machine_number]);
  const repairTime = await call("/maintenance-requests/reports/corrective-maintenance-time?year=2026&month=9");
  assert.equal(repairTime.totalMinutes, 60);
  assert.deepEqual(repairTime.machines.map((row: any) => row.machineId), [machines[0].id]);
  await call(`/maintenance-requests/closed-log/events/${events[1].id}`, 403, "PATCH", {});
  await call(`/maintenance-requests/closed-log/automatic/${requests[1].id}`, 403, "DELETE");
  await call(`/machines/${machines[0].id}/corrective-maintenance/events/${events[1].id}`, 403, "PUT", {});
  await call(`/signatures?documentType=MAINTENANCE_REQUEST&documentId=${requests[1].id}`, 403);
  await call("/signatures/sign", 403, "POST", { documentType: "EQUIPMENT_INFORMATION", documentId: machines[1].id, fieldName: "approved_by" });
  await call("/signatures/sign", 403, "POST", { documentType: "ANNUAL_PLAN", documentId: annual.id, fieldName: "approved_by" });
  await call("/maintenance-requests/reports/annual-maintenance-summary/adjustments", 403, "POST", {});
  await call("/maintenance-requests/closed-log/manual", 403, "POST", {});
  await call(`/users/${employee.id}/machine-access`, 400, "PUT", { departmentIds: [999999] }, adminCookie);
  for (const [ids, expectedCount] of [[[], 0], [[production.id, engineering.id], 2], [null, 3], [[engineering.id], 1]] as const) {
    await call(`/users/${employee.id}/machine-access`, 200, "PUT", { departmentIds: ids }, adminCookie);
    assert.equal((await call("/machines")).length, expectedCount, "Scope changes must apply without a new session");
  }
  assert.equal((await call("/machines", 200, "GET", undefined, adminCookie)).length, 3, "Admin retains all departments");
  await call(`/machines/${machines[0].id}`, 403);
  await call(`/machines/${machines[1].id}`);
  // Concurrent sessions must not inherit one another's request-local scope.
  const responses = await Promise.all(Array.from({ length: 12 }, (_, i) => call("/machines", 200, "GET", undefined, i % 2 ? adminCookie : employeeCookie)));
  responses.forEach((rows, i) => assert.equal(rows.length, i % 2 ? 3 : 1));
  console.log(`Machine access: ${checks} HTTP checks passed, including isolation, direct URLs, reports, writes and live scope changes.`);
} finally {
  if (server) await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve()));
  if (appPool) await appPool.end();
  assert.match(schema, /^test_machine_access_[a-f0-9]{32}$/);
  await setup.query(`DROP SCHEMA ${quote(schema)} CASCADE`);
  await setup.end();
  console.log("Isolated test schema removed; application data was not changed.");
}
