import { Router } from "express";
import { db, additionalEquipmentRecordsTable, equipmentInformationTable, auditLogsTable } from "@workspace/db";
import { and, asc, eq, getTableColumns, sql } from "drizzle-orm";
import { requireActiveAuth, requirePermission } from "../lib/auth.js";

export const additionalEquipmentRouter = Router({ mergeParams: true });
const columns = new Set(Object.keys(getTableColumns(equipmentInformationTable)).filter(key => !["id", "machineId", "createdAt", "updatedAt"].includes(key)));
const headerColumns = new Set(["companyName", "documentName", "documentNumber", "effectiveOrExecutionDate", "pageNumber", "totalPages"]);

additionalEquipmentRouter.get("/records", requireActiveAuth, requirePermission("view_equipment_information"), async (req, res, next) => {
  try {
    const machineId = Number(req.params.id);
    if (!Number.isSafeInteger(machineId) || machineId < 1) { res.status(400).json({ error: "Invalid machine" }); return; }
    const extra = await db.select({ recordNumber: additionalEquipmentRecordsTable.recordNumber }).from(additionalEquipmentRecordsTable).where(eq(additionalEquipmentRecordsTable.machineId, machineId)).orderBy(asc(additionalEquipmentRecordsTable.recordNumber));
    res.json([{ recordNumber: 1 }, ...extra]);
  } catch (error) { next(error); }
});

additionalEquipmentRouter.use(requireActiveAuth, (req, res, next) => {
  const record = req.query.record;
  if (record === undefined || record === "1") { next("router"); return; }
  const isFabTechSixthRecord = Number(req.params.id) === 58 && record === "6";
  if (typeof record !== "string" || (!/^[2-5]$/.test(record) && !isFabTechSixthRecord)) { res.status(400).json({ error: "Invalid equipment record" }); return; }
  const permission = req.method === "GET" ? "view_equipment_information" : req.path === "/header" ? "edit_header_equipment_information" : "edit_equipment_information";
  requirePermission(permission)(req, res, next);
});

additionalEquipmentRouter.use(async (req, res, next) => {
  try {
    const machineId = Number(req.params.id);
    if (!Number.isSafeInteger(machineId) || machineId < 1) { res.status(400).json({ error: "Invalid machine" }); return; }
    const condition = and(eq(additionalEquipmentRecordsTable.machineId, machineId), eq(additionalEquipmentRecordsTable.recordNumber, Number(req.query.record)));
    const [record] = await db.select().from(additionalEquipmentRecordsTable).where(condition);
    // Only machines with explicitly provisioned additional records may use them.
    if (!record) { res.status(404).json({ error: "Equipment record not enabled for this machine" }); return; }
    const isHeader = req.path === "/header";
    if (!["/", "/header", "/weight-note"].includes(req.path)) { res.status(404).json({ error: "Not found" }); return; }
    if (req.method === "GET") {
      res.json(isHeader ? record.header : { ...record.data, id: record.id, machineId, updatedAt: record.updatedAt.toISOString() });
      return;
    }
    if (req.method !== "PUT") { res.status(405).json({ error: "Method not allowed" }); return; }
    const allowed = isHeader ? headerColumns : req.path === "/weight-note" ? new Set(["weightNote"]) : columns;
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) { res.status(400).json({ error: "Invalid record data" }); return; }
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (!allowed.has(key)) continue;
      if (value !== null && typeof value !== "string" && typeof value !== "number") { res.status(400).json({ error: `Invalid ${key}` }); return; }
      updates[key] = value;
    }
    const target = isHeader ? additionalEquipmentRecordsTable.header : additionalEquipmentRecordsTable.data;
    const saved = await db.transaction(async tx => {
      const [updated] = await tx.update(additionalEquipmentRecordsTable).set({ [isHeader ? "header" : "data"]: sql`${target} || ${JSON.stringify(updates)}::jsonb`, updatedAt: new Date() }).where(condition).returning();
      await tx.insert(auditLogsTable).values({ userId: req.session.userId ?? null, action: "additional_equipment_record_updated", entityType: "machine", entityId: machineId, oldValue: record, newValue: updated });
      return updated!;
    });
    res.json(isHeader ? saved.header : { ...saved.data, id: saved.id, machineId, updatedAt: saved.updatedAt.toISOString() });
  } catch (error) { next(error); }
});
