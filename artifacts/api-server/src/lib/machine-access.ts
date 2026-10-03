import { AsyncLocalStorage } from "node:async_hooks";
import type { RequestHandler } from "express";
import { and, eq, inArray, sql, type SQLWrapper } from "drizzle-orm";
import {
  db, usersTable, rolesTable, machinesTable, maintenanceRequestsTable,
  annualPmPlanRowsTable, monthlyPmPlanRowsTable, correctiveMaintenanceEventsTable,
  correctiveMaintenanceRecordsTable, pmInspectionsTable, pmRecordsTable,
  eligibleSignerAssignmentsTable, pmChecklistPointsTable,
} from "@workspace/db";

type Scope = { departments: number[] | null };
const scopes = new AsyncLocalStorage<Scope>();
export function restrictedMachineAccess() { return scopes.getStore()?.departments != null; }

/** Apply before aggregation, pagination and serialization. Missing department is denied. */
export function machineAccess(column: SQLWrapper = machinesTable.id) {
  const departments = scopes.getStore()?.departments;
  if (departments == null) return sql`true`;
  if (!departments.length) return sql`false`;
  return sql`${column} in (select ${machinesTable.id} from ${machinesTable} where ${inArray(machinesTable.departmentId, departments)})`;
}

export function departmentAccess(column: SQLWrapper) {
  const departments = scopes.getStore()?.departments;
  return departments == null ? sql`true` : departments.length ? inArray(column as typeof machinesTable.departmentId, departments) : sql`false`;
}

function denied() { return Object.assign(new Error("لا تملك صلاحية الوصول إلى ماكينات هذا القسم"), { status: 403 }); }
export async function assertMachineAccess(id: unknown) {
  if (!restrictedMachineAccess()) return;
  const [machine] = await db.select({ id: machinesTable.id }).from(machinesTable)
    .where(and(eq(machinesTable.id, Number(id)), machineAccess()));
  if (!machine) throw denied();
}
export async function assertRequestAccess(id: unknown) {
  if (!restrictedMachineAccess()) return;
  const [request] = await db.select({ id: maintenanceRequestsTable.id }).from(maintenanceRequestsTable)
    .where(and(eq(maintenanceRequestsTable.id, Number(id)), machineAccess(maintenanceRequestsTable.machineId)));
  if (!request) throw denied();
}

export async function canAccessDocument(type: string, id: number) {
  if (!restrictedMachineAccess()) return true;
  if (["MAINTENANCE_REQUEST", "EXTERNAL_MAINTENANCE_REQUEST", "EXTERNAL_MAINTENANCE_RECEIPT"].includes(type)) {
    const [row] = await db.select({ id: maintenanceRequestsTable.id }).from(maintenanceRequestsTable)
      .where(and(eq(maintenanceRequestsTable.id, id), machineAccess(maintenanceRequestsTable.machineId)));
    return !!row;
  }
  if (type === "EQUIPMENT_INFORMATION") {
    const [row] = await db.select({ id: machinesTable.id }).from(machinesTable).where(and(eq(machinesTable.id, id), machineAccess()));
    return !!row;
  }
  if (type === "PM_RECORD") {
    const [row] = await db.select({ id: pmRecordsTable.id }).from(pmRecordsTable).where(and(eq(pmRecordsTable.id, id), machineAccess(pmRecordsTable.machineId)));
    return !!row;
  }
  // Shared approvals certify the entire plan/report, not a filtered subset.
  return false;
}

/** Fresh DB scope on every request: changing access also affects existing sessions. */
export const loadMachineAccess: RequestHandler = async (req, res, next) => {
  if (!req.session?.userId) { next(); return; }
  try {
    const [user] = await db.select({ departments: usersTable.machineDepartmentIds, active: usersTable.isActive, role: rolesTable.name })
      .from(usersTable).innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id)).where(eq(usersTable.id, req.session.userId));
    if (!user?.active) { res.status(401).json({ error: "Account is inactive" }); return; }
    scopes.run({ departments: user.role === "Admin" ? null : user.departments }, () => next());
  } catch (error) { next(error); }
};

/** Guard direct URLs and submitted foreign keys before a handler performs any writes. */
export const guardMachineAccess: RequestHandler = async (req, _res, next) => {
  if (!restrictedMachineAccess()) { next(); return; }
  try {
    // Express routes are case-insensitive by default and decode path parameters.
    const path = decodeURIComponent(req.path).toLowerCase().replace(/\/$/, "");
    const write = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    const machine = /^\/machines\/([^/]+)(?:\/|$)/.exec(path);
    const request = /^\/maintenance-requests\/([+-]?\d[^/]*)(?:\/|$)/.exec(path);
    if (machine) await assertMachineAccess(machine[1]);
    if (request) await assertRequestAccess(request[1]);
    if (req.body?.machineId != null) await assertMachineAccess(req.body.machineId);
    if (req.query.machineId != null) await assertMachineAccess(req.query.machineId);
    if (req.query.requestId != null && Number(req.query.requestId) !== 0) await assertRequestAccess(req.query.requestId);
    if (write && /^\/machines(?:\/\d+)?$/.test(path)) {
      const departments = scopes.getStore()!.departments!;
      if ((req.method === "POST" || "departmentId" in (req.body ?? {})) && !departments.includes(Number(req.body?.departmentId))) throw denied();
    }
    const automaticLog = /^\/maintenance-requests\/closed-log\/automatic\/(\d+)$/.exec(path);
    if (automaticLog) await assertRequestAccess(automaticLog[1]);
    const logEvent = /^\/maintenance-requests\/closed-log\/events\/(\d+)$/.exec(path);
    if (logEvent) {
      const [row] = await db.select().from(correctiveMaintenanceEventsTable).where(eq(correctiveMaintenanceEventsTable.id, Number(logEvent[1])));
      await assertMachineAccess(row?.machineId);
    }
    // Manual/global records have no authoritative machine ownership.
    if (write && (path.startsWith("/maintenance-requests/closed-log/manual") || path.startsWith("/maintenance-requests/reports/"))) throw denied();
    if (path.startsWith("/maintenance-plans/") && write) {
      if (path.endsWith("/header")) throw denied();
      const annual = path.startsWith("/maintenance-plans/annual/");
      const table = annual ? annualPmPlanRowsTable : monthlyPmPlanRowsTable;
      const rowId = /\/rows\/(\d+)$/.exec(path)?.[1];
      const rows = rowId ? [{ id: Number(rowId) }] : (req.body?.rows ?? []);
      if (!Array.isArray(rows)) throw denied();
      for (const row of rows) {
        const [saved] = await db.select({ machineId: table.machineId }).from(table).where(eq(table.id, Number(row.id)));
        await assertMachineAccess(saved?.machineId);
      }
    }
    // Secondary IDs must also belong to an allowed machine.
    if (machine) {
      const point = /\/checklist\/([^/]+)/.exec(path);
      if (point) {
        const [row] = await db.select().from(pmChecklistPointsTable).where(eq(pmChecklistPointsTable.id, Number(point[1])));
        if (!row || row.machineId !== Number(machine[1])) throw denied();
      }
      const inspection = /\/inspections\/(\d+)/.exec(path);
      const event = /\/events\/(\d+)/.exec(path);
      const history = /\/history\/(\d+)/.exec(path);
      if (inspection || event || history) {
        const table = inspection ? pmInspectionsTable : event ? correctiveMaintenanceEventsTable : path.includes("/pm/") ? pmRecordsTable : correctiveMaintenanceRecordsTable;
        const id = Number((inspection ?? event ?? history)![1]);
        const [row] = await db.select({ machineId: table.machineId }).from(table).where(eq(table.id, id));
        if (!row || row.machineId !== Number(machine[1])) throw denied();
      }
    }
    if (path.startsWith("/signatures")) {
      const input = write ? req.body : req.query;
      const type = input?.documentType;
      const id = input?.documentId;
      if (type && id != null && !(await canAccessDocument(String(type).trim().toUpperCase(), Number(id)))) throw denied();
      const revoke = /^\/signatures\/eligible\/(\d+)\/revoke$/.exec(path);
      if (revoke) {
        const [row] = await db.select().from(eligibleSignerAssignmentsTable).where(eq(eligibleSignerAssignmentsTable.id, Number(revoke[1])));
        if (!row || !(await canAccessDocument(row.documentType, row.documentId))) throw denied();
      }
    }
    if (write && /^\/spare-parts\/[^/]+\/movements$/.test(path)) {
      const type = String(req.body?.referenceType ?? "MANUAL").toUpperCase();
      if (type === "CM_REQUEST") await assertRequestAccess(req.body?.referenceId);
      else if (type === "PM_RECORD" && !(await canAccessDocument("PM_RECORD", Number(req.body?.referenceId)))) throw denied();
    }
    next();
  } catch (error) { next(error); }
};
