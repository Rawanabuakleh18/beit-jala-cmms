import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { PrintLayout, PrintPage } from "./print-layout";


type PmRecordDetail = {
  record: { sequenceNumber: number; inspectionCount: number };
  machine: { name: string; number: string };
  header: { procedureFormNumber: string; effectiveDate: string | null; department: string | null; inspectionColumnsPerPrintPage: number };
  checklistPoints: Array<{ id: number; pointText: string }>;
  inspections: Array<{
    id: number;
    columnNumber: number;
    executionMonthYear: string | null;
    inspectionDate: string;
    inspectionTime: string;
    actionTaken: string | null;
    examinerName: string | null;
    examinerSignature: string | null;
    machineReceiverName: string | null;
    machineReceiverSignature: string | null;
    results: Array<{ checklistPointId: number; value: string | null }>;
  }>;
  pageCount: number;
};

function chunk<T>(items: T[], size: number) {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages.length ? pages : [[]];
}

function checklistRowHeight(pointCount: number, orientation: "portrait" | "landscape") {
  // Landscape uses compact rows so a full sixteen-point chunk stays on one A4
  // sheet. This also avoids leaving only nine points on a fifth page for the
  // common 61-point machine checklist.
  const normalCapacity = orientation === "landscape" ? 16 : 15;
  const baseHeight = orientation === "landscape" ? 28 : 34;
  const growthPerUnusedRow = orientation === "landscape" ? 3 : 4;
  // With a short checklist, use the unused vertical room to make the official
  // form easier to read. Long text can still expand a row beyond this height.
  return Math.min(46, baseHeight + Math.max(0, normalCapacity - pointCount) * growthPerUnusedRow);
}

function displayedNameAndSignature(name: string | null, signature: string | null) {
  const normalizedName = name?.trim() ?? "";
  const normalizedSignature = signature?.trim() ?? "";

  if (normalizedSignature.startsWith("data:image/")) {
    return <div className="flex flex-col items-center gap-1"><span>{normalizedName}</span><img src={normalizedSignature} alt="Signature" className="h-8 max-w-full object-contain" /></div>;
  }

  // The API already falls back to the account holder's name when no examiner
  // name is entered. If a name is entered manually, print only that name and
  // do not append the older account-name fallback stored in the signature.
  return normalizedName || normalizedSignature;
}

function formatExecutionDate(date: string | null) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date.replaceAll("-", "/");
}

function formatInspectionDate(date: string) {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

export default function PmRecordPrintPage({ params }: { params: { id: string; recordId?: string } }) {
  const machineId = Number(params.id);
  const historicalRecordId = params.recordId ? Number(params.recordId) : undefined;
  const [printOrientation, setPrintOrientation] = useState<"portrait" | "landscape">("portrait");
  const { data } = useQuery({
    queryKey: ["print-pm-record", machineId, historicalRecordId ?? "current"],
    queryFn: () => apiRequest<PmRecordDetail>(
      historicalRecordId ? `/machines/${machineId}/pm/history/${historicalRecordId}` : `/machines/${machineId}/pm/current`,
    ),
  });
  const resultMap = useMemo(() => {
    const map = new Map<string, string | null>();
    data?.inspections.forEach((inspection) => {
      inspection.results.forEach((result) => map.set(`${inspection.id}-${result.checklistPointId}`, result.value));
    });
    return map;
  }, [data]);

  // Paginate by actual checklist rows. The landscape sheet has enough room for
  // sixteen points; counting wrapped text as extra rows used to stop at nine
  // and leave a large unused area at the bottom of the page.
  const checklistPages = useMemo(
    () => printOrientation === "portrait"
      ? chunk(data?.checklistPoints ?? [], 17)
      : chunk(data?.checklistPoints ?? [], 16),
    [data?.checklistPoints, printOrientation],
  );
  const inspectionColumnsPerPage = Math.min(10, Math.max(1, data?.header.inspectionColumnsPerPrintPage ?? 2));
  const inspectionPages = useMemo(() => chunk(data?.inspections ?? [], inspectionColumnsPerPage), [data?.inspections, inspectionColumnsPerPage]);
  const totalPages = checklistPages.length * inspectionPages.length;

  return (
    <PrintLayout
      title="Preventive Maintenance Record - Official Print"
      landscape={printOrientation === "landscape"}
      showOrientationChoice
      orientation={printOrientation}
      onOrientationChange={setPrintOrientation}
    >
      {data && inspectionPages.flatMap((inspectionPage, inspectionPageIndex) =>
        checklistPages.map((checklistPage, checklistPageIndex) => {
          const pageNumber = inspectionPageIndex * checklistPages.length + checklistPageIndex + 1;
          const isFinalChecklistPage = checklistPageIndex === checklistPages.length - 1;
          const checklistPointOffset = checklistPages
            .slice(0, checklistPageIndex)
            .reduce((total, points) => total + points.length, 0);
          const rowHeight = checklistRowHeight(checklistPage.length, printOrientation);
          return (
            <PrintPage
              key={`${inspectionPageIndex}-${checklistPageIndex}`}
              className={`official-print-pm-page${pageNumber > 1 ? " official-print-pm-page-continued" : ""}`}
            >
              <div dir="rtl" className="official-print-pm-content">
                <table dir="ltr" className="official-print-table official-print-header-table official-print-pm-header">
                  <tbody>
                    <tr>
                      <td dir="rtl" className="w-[31%] text-right">
                        <div>رقم الطريقة: <bdi dir="ltr">{data.header.procedureFormNumber}</bdi></div>
                        <div>تاريخ التنفيذ: <bdi dir="ltr">{formatExecutionDate(data.header.effectiveDate)}</bdi></div>
                        <div>صفحة {pageNumber} من {totalPages}</div>
                      </td>
                      <td dir="rtl" className="w-[38%] text-center font-semibold">
                        <div>سجل نشاطات الصيانة الوقائية لجهاز</div>
                        <div dir="ltr">{data.machine.name} ({data.machine.number})</div>
                      </td>
                      <td dir="rtl" className="w-[31%] text-right">
                        <div>شركة بيت جالا لصناعة الأدوية</div>
                        <div>بيت جالا</div>
                        <div>فلسطين</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="official-print-table official-print-pm-table mt-8 text-right">
                  <colgroup>
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "48%" }} />
                    {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => <col key={index} style={{ width: `${46 / inspectionColumnsPerPage}%` }} />)}
                  </colgroup>
                  <thead>
                    <tr>
                      <th colSpan={2} className="text-right">موعد تنفيذ نشاطات الصيانة الوقائية</th>
                      {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => {
                        const inspection = inspectionPage[index];
                        return <th key={inspection?.id ?? `schedule-${index}`} dir="ltr" className="text-center">{inspection?.executionMonthYear ?? ""}</th>;
                      })}
                    </tr>
                    <tr>
                      <th colSpan={2} className="text-right">تاريخ الفحص / الوقت</th>
                      {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => {
                        const inspection = inspectionPage[index];
                        return (
                          <th key={inspection?.id ?? `date-time-${index}`} dir="ltr" className="text-center">
                            {inspection && <><div>{formatInspectionDate(inspection.inspectionDate)}</div><div>{inspection.inspectionTime}</div></>}
                          </th>
                        );
                      })}
                    </tr>
                    <tr>
                      <th className="w-[7%]">الرقم</th>
                      <th className="w-[48%]">النقاط الواجب فحصها / نشاطات الصيانة الوقائية</th>
                      {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => <th key={inspectionPage[index]?.id ?? `empty-${index}`}>تم الفحص بنجاح<br />نعم / لا</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {checklistPage.map((point, index) => (
                      <tr key={point.id} className="official-print-row-tall" style={{ height: `${rowHeight}px` }}>
                        <td>{checklistPointOffset + index + 1}.</td>
                        <td className="official-print-pm-point-text">{point.pointText}</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, inspectionIndex) => {
                          const inspection = inspectionPage[inspectionIndex];
                          return <td key={inspection?.id ?? `empty-${inspectionIndex}`}>{inspection ? resultMap.get(`${inspection.id}-${point.id}`) ?? "" : ""}</td>;
                        })}
                      </tr>
                    ))}
                    {isFinalChecklistPage && <>
                      <tr className="official-print-row-xl">
                        <td colSpan={2}>الإجراء المتخذ في حال وجود خطأ/انحراف:</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, inspectionIndex) => {
                          const inspection = inspectionPage[inspectionIndex];
                          return <td key={inspection?.id ?? `action-${inspectionIndex}`}>{inspection?.actionTaken ?? ""}</td>;
                        })}
                      </tr>
                      <tr className="official-print-row-tall">
                        <td colSpan={2}>اسم الفاحص وتوقيعه:</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, inspectionIndex) => {
                          const inspection = inspectionPage[inspectionIndex];
                          return <td key={inspection?.id ?? `examiner-${inspectionIndex}`}>{inspection ? displayedNameAndSignature(inspection.examinerName, inspection.examinerSignature) : ""}</td>;
                        })}
                      </tr>
                      <tr className="official-print-row-tall">
                        <td colSpan={2}>اسم مستلم الماكينة وتوقيعه:</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, inspectionIndex) => {
                          const inspection = inspectionPage[inspectionIndex];
                          return <td key={inspection?.id ?? `receiver-${inspectionIndex}`}>{inspection ? displayedNameAndSignature(inspection.machineReceiverName, inspection.machineReceiverSignature) : ""}</td>;
                        })}
                      </tr>
                    </>}
                  </tbody>
                </table>
              </div>
            </PrintPage>
          );
        }),
      )}
    </PrintLayout>
  );
}
