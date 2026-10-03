import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { PrintLayout, PrintPage } from "./print-layout";
import { PmMachineServiceArea } from "@/components/pm-machine-service-area";


type PmRecordDetail = {
  record: { sequenceNumber: number; inspectionCount: number };
  machine: { name: string; number: string };
  header: { showServiceArea: boolean; serviceAreaMachineNumber: string | null; serviceAreaLocation: string | null; procedureFormNumber: string; effectiveDate: string | null; department: string | null; pmRecordDescription: string | null; machineRecordName: string | null; machineRecordId: string | null; pmRecordTitle: string | null; inspectionColumnsPerPrintPage: number };
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

const LARGE_CHECKLIST_PDM_NUMBERS = new Set([
  "PDM-01-032",
  "PDM-01-036",
  "PDM-01-037",
  "PDM-01-043",
  "PDM-01-051",
  "PDM-03-051",
  "PDM-03-055",
  "PDM-03-055A/B",
  "PDM-07-087",
  "PDM-01-089",
  "PDM-01-097",
  "PDM-01-118",
]);

function keepEnglishTermsTogether(text: string, terms = /(\(?[A-Za-z][A-Za-z0-9]*(?:[ /.-]+[A-Za-z0-9]+)*\)?)/g) {
  // Keep multiword Latin terms (including parenthesized names) in one LTR
  // inline box, so Arabic wrapping moves the complete term to the next line.
  return text.split(terms).map((part, index) =>
    index % 2 === 1
      ? <bdi key={index} dir="ltr" className="official-print-pm-english-term">{part}</bdi>
      : part,
  );
}

function chunk<T>(items: T[], size: number) {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages.length ? pages : [[]];
}

function chunkFirstThen<T>(items: T[], firstSize: number, continuationSize: number) {
  if (items.length <= firstSize) return [items];
  return [items.slice(0, firstSize), ...chunk(items.slice(firstSize), continuationSize)];
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

function displayedNameAndSignature(name: string | null, signature: string | null, compact = false) {
  const normalizedName = name?.trim() ?? "";
  const normalizedSignature = signature?.trim() ?? "";

  if (normalizedSignature.startsWith("data:image/")) {
    return <div className={`flex flex-col items-center ${compact ? "gap-0" : "gap-1"}`}><span className={compact ? "official-print-pm-signature-name" : undefined}>{normalizedName}</span><img src={normalizedSignature} alt="Signature" className={`${compact ? "h-6" : "h-8"} max-w-full object-contain`} /></div>;
  }

  // The API already falls back to the account holder's name when no examiner
  // name is entered. If a name is entered manually, print only that name and
  // do not append the older account-name fallback stored in the signature.
  return compact
    ? <span className="official-print-pm-signature-name">{normalizedName || normalizedSignature}</span>
    : normalizedName || normalizedSignature;
}

function formatExecutionDate(date: string | null) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return year && month && day ? `${Number(day)}/${Number(month)}/${year}` : date.replaceAll("-", "/");
}

function formatInspectionDate(date: string) {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${Number(day)}/${Number(month)}/${year}` : date;
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
  const isAirHandling = /air handling|air exhaust/i.test(data?.machine.name ?? "")
    || /AHUs/i.test(data?.header.pmRecordTitle ?? "");
  const usesAc1ChecklistFooter = ["AC-1", "AC-2", "AC-3", "AC-4", "AC-5", "AC-6"].includes(data?.machine.number.trim().toUpperCase() ?? "");
  const usesLargePdmChecklist = LARGE_CHECKLIST_PDM_NUMBERS.has(data?.machine.number.trim().toUpperCase() ?? "");
  const isHuttlin = data?.machine.number.trim().toUpperCase() === "PDM-01-032";
  const isFabTech = data?.machine.number === "PDM-01-097";
  const isBg300Bg400 = data?.machine.number.trim().toUpperCase() === "PDM-01-036";
  const isKalix = data?.machine.number.trim().toUpperCase() === "PDM-03-051";
  const isPdm053 = data?.machine.number.trim().toUpperCase() === "PDM-01-053";
  const isPdm056 = data?.machine.number.trim().toUpperCase() === "PDM-01-056";
  const usesAutoclaveTwoPageSplit = ["PDM-08-082", "PDM-06-082"].includes(data?.machine.number.trim().toUpperCase() ?? "");
  const isPdm06081 = data?.machine.number.trim().toUpperCase() === "PDM-06-081";
  const isPdm06083 = data?.machine.number.trim().toUpperCase() === "PDM-06-083";
  const isPdm06085 = data?.machine.number.trim().toUpperCase() === "PDM-06-085";
  const isPdm05054 = data?.machine.number.trim().toUpperCase() === "PDM-05-054";
  const isOlsaVacuumMixer = machineId === 114
    || ["PDM-03-055", "PDM-03-055A/B"].includes(data?.machine.number.trim().toUpperCase() ?? "");
  const isUhlmannBlister = machineId === 115
    || data?.machine.number.trim().toUpperCase() === "PDM-07-087";
  const isUhlmannBlister096 = machineId === 116
    || data?.machine.number.trim().toUpperCase() === "PDM-07-096";
  const centersCompanyHeader = ["PDM-06-082", "PDM-06-085"].includes(data?.machine.number.trim().toUpperCase() ?? "");
  const isPdm02049 = machineId === 103
    || data?.machine.number.trim().toUpperCase() === "PDM-02-049"
    || data?.header.machineRecordId?.trim().toUpperCase() === "PDM-02-049";
  const showsStandardNotesRow = data?.machine.number.trim().toUpperCase() === "PDM-04-047";
  const isPdm04047 = data?.machine.number.trim().toUpperCase() === "PDM-04-047";
  const isAc6 = data?.machine.number.trim().toUpperCase() === "AC-6";

  const pagesRef = useRef<HTMLDivElement>(null);
  const [pageLimit, setPageLimit] = useState(17);
  const [continuationPageLimit, setContinuationPageLimit] = useState(17);
  const [measurementVersion, setMeasurementVersion] = useState(0);

  useLayoutEffect(() => {
    const limit = isPdm06081
      ? 18
      : isKalix
      ? (printOrientation === "portrait" ? 21 : 20)
      : isFabTech
      ? (printOrientation === "portrait" ? 13 : 12)
      : (printOrientation === "portrait" ? 17 : 16);
    setPageLimit(limit);
    setContinuationPageLimit(isFabTech ? (printOrientation === "portrait" ? 13 : 14) : limit);
  }, [data, printOrientation, isFabTech, isKalix, isPdm06081]);

  useLayoutEffect(() => {
    if (isHuttlin || isOlsaVacuumMixer || isUhlmannBlister) setPrintOrientation("landscape");
  }, [isHuttlin, isOlsaVacuumMixer, isUhlmannBlister]);

  useLayoutEffect(() => {
    const beforePrint = () => flushSync(() => setMeasurementVersion(v => v + 1));
    window.addEventListener("beforeprint", beforePrint);
    let active = true;
    document.fonts.ready.then(() => { if (active) setMeasurementVersion(v => v + 1); });
    return () => { active = false; window.removeEventListener("beforeprint", beforePrint); };
  }, []);

  // Start with the usual row count, then reduce it when the rendered header,
  // wrapped checklist text, inspection values or signatures exceed the sheet.
  const usesContinuationCapacity = isAirHandling || usesLargePdmChecklist || usesAutoclaveTwoPageSplit;
  const checklistPages = useMemo(() => {
    const points = data?.checklistPoints ?? [];
    const orientationLimit = printOrientation === "portrait" ? pageLimit : Math.min(16, pageLimit);
    const firstLimit = usesAutoclaveTwoPageSplit ? 9 : isUhlmannBlister ? 10 : isOlsaVacuumMixer ? 12 : isHuttlin ? Math.min(13, orientationLimit) : orientationLimit;
    const laterLimit = printOrientation === "portrait"
      ? (usesAutoclaveTwoPageSplit ? 4 : continuationPageLimit)
      : Math.min(isFabTech ? 14 : 16, continuationPageLimit);
    return usesContinuationCapacity
      ? chunkFirstThen(points, firstLimit, laterLimit)
      : chunk(points, firstLimit);
  }, [data?.checklistPoints, printOrientation, pageLimit, continuationPageLimit, usesContinuationCapacity, isHuttlin, isFabTech, isOlsaVacuumMixer, isUhlmannBlister, usesAutoclaveTwoPageSplit]);
  const inspectionColumnsPerPage = Math.min(10, Math.max(1, data?.header.inspectionColumnsPerPrintPage ?? 2));
  const isEightInspectionColumns = inspectionColumnsPerPage === 8;
  // Portrait forms retain their original stacked result heading. The compact
  // landscape treatment is needed only when all eight inspection columns are
  // shown together.
  const usesStackedResultHeading = inspectionColumnsPerPage >= 8 || isPdm04047 || isPdm06083 || isUhlmannBlister;
  const inspectionPages = useMemo(() => chunk(data?.inspections ?? [], inspectionColumnsPerPage), [data?.inspections, inspectionColumnsPerPage]);
  const totalPages = checklistPages.length * inspectionPages.length;

  useLayoutEffect(() => {
    if (!data || isPdm06081 || (pageLimit <= 1 && continuationPageLimit <= 1)) return;
    // KALIX uses an explicit split. Give every sheet the first sheet's top
    // position, lifted slightly above exact vertical centre.
    if (isKalix) {
      const firstContent = pagesRef.current?.querySelector<HTMLElement>(".official-print-pm-content");
      if (firstContent) {
        const sheetHeight = ((printOrientation === "portrait" ? 297 : 210) * 96) / 25.4;
        const minimumInset = (12 * 96) / 25.4;
        const lift = (8 * 96) / 25.4;
        const inset = Math.max(minimumInset, (sheetHeight - firstContent.offsetHeight) / 2 - lift);
        pagesRef.current?.style.setProperty("--kalix-page-top", `${inset}px`);
      }
      return;
    }
    // Reserve the existing page padding and PM top inset, plus 3mm for rounding.
    let capacity = ((printOrientation === "portrait" ? 258 : 197) * 96) / 25.4;
    const contents = pagesRef.current?.querySelectorAll<HTMLElement>(".official-print-pm-content");
    if (printOrientation === "portrait" && data.machine.number.trim().toUpperCase() === "PDM-01-118" && contents?.length) {
      const sheetHeight = (297 * 96) / 25.4;
      const minimumInset = (12 * 96) / 25.4;
      // Use the same fixed portrait inset as the first sheet, irrespective
      // of how many checklist rows remain on the final sheet.
      const firstPageInset = (24 * 96) / 25.4;
      capacity = Math.min(capacity, sheetHeight - firstPageInset - minimumInset);
    }
    if (printOrientation === "landscape" && contents?.length) {
      // Preserve the first sheet's existing vertically centred position, and
      // use that same top inset for every continuation sheet, even short ones.
      const sheetHeight = (210 * 96) / 25.4;
      const minimumInset = (5 * 96) / 25.4;
      const firstPageInset = Math.max(minimumInset, (sheetHeight - contents[0].offsetHeight) / 2);
      pagesRef.current?.style.setProperty("--pm-first-page-top", `${firstPageInset}px`);
      capacity = Math.min(capacity, sheetHeight - firstPageInset - minimumInset);
    } else {
      pagesRef.current?.style.removeProperty("--pm-first-page-top");
    }
    if (contents) {
      const overflowing = Array.from(contents).filter(content => content.offsetHeight > capacity);
      if (overflowing.some(content => !content.closest(".official-print-pm-page-continued"))) {
        setPageLimit(limit => Math.max(1, limit - 1));
      }
      if (overflowing.some(content => content.closest(".official-print-pm-page-continued"))) {
        setContinuationPageLimit(limit => Math.max(1, limit - 1));
      }
    }
  }, [data, checklistPages, inspectionPages, pageLimit, continuationPageLimit, printOrientation, measurementVersion, isKalix, isPdm06081]);

  const isRollCompactor = data?.machine.number === "PDM-01-088";
  const isFette = data?.machine.number === "PDM-01-043";
  const isRotaryTabletPress = machineId === 56;
  const isChappeeBoiler = data?.machine.number === "B-2" || data?.machine.number === "B-3";
  const boilerTitleLines = isChappeeBoiler && data?.header.pmRecordTitle
    ? data.header.pmRecordTitle.replace(/\s+/g, " ").trim().split(/\s+(?=CHAPPEE)/)
    : [];
  // These production-machine forms follow the AHU pagination rule: the
  // schedule/date/time checklist heading is printed on the first sheet only.
  const showsChecklistHeader = (pageNumber: number) => !((isAirHandling || usesLargePdmChecklist) && pageNumber > 1);
  // Give Fette's Arabic lead-in and complete English name room on one line.
  const defaultChecklistColumnWidth = isHuttlin ? 31 : isFabTech ? 36 : isChappeeBoiler ? 55 : isFette ? 54 : machineId === 5 || isRollCompactor || isRotaryTabletPress ? 60 : 48;
  const checklistColumnWidth = isPdm06083
    ? 42
    : isPdm06081
    ? 40
    : isOlsaVacuumMixer
    ? 36
    : isPdm04047
    ? 52
    : printOrientation === "portrait" && inspectionColumnsPerPage < 8
      ? Math.min(defaultChecklistColumnWidth, Math.max(25, 94 - inspectionColumnsPerPage * 16))
      : defaultChecklistColumnWidth;
  const numberColumnWidth = isHuttlin ? 5 : 6;
  const widenedTableStyle = printOrientation === "portrait"
    ? { width: "100%", marginInline: "auto" }
    : isFette
    ? { width: "calc(100% + 20mm)", marginInline: "-10mm" }
    : isRotaryTabletPress
      ? { width: "calc(100% + 14mm)", marginInline: "-7mm" }
      : undefined;
  const pmTableStyle = isOlsaVacuumMixer
    ? { ...widenedTableStyle, tableLayout: "fixed" as const }
    : widenedTableStyle;

  return (
    <PrintLayout
      title="Preventive Maintenance Record - Official Print"
      landscape={printOrientation === "landscape"}
      showOrientationChoice
      orientation={printOrientation}
      onOrientationChange={setPrintOrientation}
    >
      <div ref={pagesRef}>
      {data && inspectionPages.flatMap((inspectionPage, inspectionPageIndex) =>
        checklistPages.map((checklistPage, checklistPageIndex) => {
          const pageNumber = inspectionPageIndex * checklistPages.length + checklistPageIndex + 1;
          const isFinalChecklistPage = checklistPageIndex === checklistPages.length - 1;
          const checklistPointOffset = checklistPages
            .slice(0, checklistPageIndex)
            .reduce((total, points) => total + points.length, 0);
          const rowHeight = isKalix ? 28 : isChappeeBoiler ? 30 : checklistRowHeight(checklistPage.length, printOrientation);
          return (
            <PrintPage
              data-centered-pdm118={data.machine.number.trim().toUpperCase() === "PDM-01-118" && printOrientation === "portrait" ? "true" : undefined}
              key={`${inspectionPageIndex}-${checklistPageIndex}`}
              className={`official-print-pm-page${isAirHandling ? " official-print-ahu-pm-page" : ""}${usesLargePdmChecklist ? " official-print-pdm-large-checklist-page" : ""}${isHuttlin ? " official-print-huttlin-pm-page" : ""}${isFabTech ? " official-print-fabtech-pm-page" : ""}${isKalix ? " official-print-kalix-pm-page" : ""}${isPdm053 ? " official-print-pdm053-pm-page" : ""}${isPdm056 ? " official-print-pdm056-pm-page" : ""}${isPdm02049 ? " official-print-pdm02049-pm-page" : ""}${isPdm04047 ? " official-print-pdm04047-pm-page" : ""}${isPdm06081 ? " official-print-pdm06081-pm-page" : ""}${isPdm06083 ? " official-print-pdm06083-pm-page" : ""}${isPdm06085 ? " official-print-pdm06085-pm-page" : ""}${centersCompanyHeader ? " official-print-centered-company-pm-page" : ""}${isChappeeBoiler ? " official-print-chappee-boiler-pm-page" : ""}${pageNumber > 1 ? " official-print-pm-page-continued" : ""}${pageNumber === totalPages ? " official-print-pm-page-final" : ""}`}
            >
              <div dir="rtl" className={`official-print-pm-content${printOrientation === "portrait" ? " official-print-pm-content-wide-portrait" : ""}${usesAc1ChecklistFooter && printOrientation === "portrait" ? " official-print-ac-readable-text" : ""}`}>
                <table dir="ltr" className={`official-print-table official-print-header-table official-print-pm-header${isFette ? " official-print-fette-pm-header" : ""}${isPdm05054 ? " official-print-pdm05054-pm-header" : ""}${isOlsaVacuumMixer ? " official-print-olsa-pm-header" : ""}`} style={widenedTableStyle}>
                  <tbody>
                    <tr>
                      <td dir="rtl" className={`${isChappeeBoiler ? "w-[33%]" : isOlsaVacuumMixer ? "w-[25%]" : isRotaryTabletPress || isFabTech || isPdm05054 ? "w-[27%]" : isFette ? "w-[29%]" : isPdm06085 ? "w-[30%]" : "w-[31%]"} text-right`}>
                        <div className={isFette || isRotaryTabletPress ? "whitespace-nowrap" : undefined}>رقم الطريقة: <bdi dir="ltr">{data.header.procedureFormNumber}</bdi></div>
                        <div>تاريخ التنفيذ: <bdi dir="ltr">{formatExecutionDate(data.header.effectiveDate)}</bdi></div>
                        <div>صفحة {pageNumber} من {totalPages}</div>
                      </td>
                      <td dir="rtl" className={`${isChappeeBoiler ? "w-[40%]" : isOlsaVacuumMixer ? "w-[50%]" : isFette || isRotaryTabletPress || isFabTech || isPdm05054 ? "w-[48%]" : isPdm06085 ? "w-[46%]" : machineId === 5 ? "w-[44%]" : "w-[42%]"} text-center font-semibold`}>
                        <div className="whitespace-pre-line">{isChappeeBoiler && boilerTitleLines.length === 2
                          ? boilerTitleLines.map((line, index) => <div key={index} className="whitespace-nowrap">{keepEnglishTermsTogether(line)}</div>)
                          : isAc6 && data.header.pmRecordTitle
                          ? data.header.pmRecordTitle.split("\n").map((line, index) => <div key={index} className={index === 1 ? "official-print-ac6-title-line" : "whitespace-nowrap"}>{line}</div>)
                          : (isPdm06085 || isPdm05054 || isOlsaVacuumMixer || isUhlmannBlister || isUhlmannBlister096) && data.header.pmRecordTitle
                          ? data.header.pmRecordTitle.split("\n").map((line, index) => <div key={index} className="whitespace-nowrap">{line}</div>)
                          : (machineId === 5 || isFette || isRotaryTabletPress || isFabTech) && data.header.pmRecordTitle
                          ? data.header.pmRecordTitle.split("\n").map((line, index) => (
                            <div key={index} dir={isRotaryTabletPress && /[A-Za-z]/.test(line) ? "ltr" : undefined} className={isRotaryTabletPress || isFabTech ? "whitespace-nowrap" : index === 0 ? (isFette ? "whitespace-nowrap" : "official-print-karnavati-title-line") : undefined}>{isFabTech ? keepEnglishTermsTogether(line) : line}</div>
                          ))
                          : data.header.pmRecordTitle || `${data.header.pmRecordDescription || "سجل نشاطات الصيانة الوقائية لجهاز"}\n${data.machine.name} (${data.machine.number})`}</div>
                      </td>
                      <td dir="rtl" className={`${isChappeeBoiler ? "w-[27%]" : isFette ? "w-[23%]" : isPdm06085 ? "w-[24%]" : machineId === 5 || isRotaryTabletPress || isFabTech || isPdm05054 || isOlsaVacuumMixer ? "w-[25%]" : "w-[27%]"} official-print-pm-company-cell text-right`}>
                        <div>شركة بيت جالا لصناعة الأدوية</div>
                        <div>بيت جالا</div>
                        <div>فلسطين</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {pageNumber === 1 && <PmMachineServiceArea {...data.header} machineId={machineId} />}
                <table className={`official-print-table official-print-pm-table${isOlsaVacuumMixer ? " official-print-olsa-pm-table" : ""} ${data.header.showServiceArea && pageNumber === 1 ? "mt-0" : "mt-8"} text-right`} style={pmTableStyle}>
                  <colgroup>
                    <col style={{ width: `${numberColumnWidth}%` }} />
                    <col style={{ width: `${checklistColumnWidth}%` }} />
                    {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => <col key={index} style={{ width: `${(100 - numberColumnWidth - checklistColumnWidth) / inspectionColumnsPerPage}%` }} />)}
                  </colgroup>
                  {showsChecklistHeader(pageNumber) && <thead>
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
                      <th className="w-[7%]" style={isRotaryTabletPress ? { textAlign: "center", verticalAlign: "middle" } : undefined}>الرقم</th>
                      <th style={{ width: `${checklistColumnWidth}%` }}>النقاط الواجب فحصها / نشاطات الصيانة الوقائية</th>
                      {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => (
                        <th key={inspectionPage[index]?.id ?? `empty-${index}`} className={`official-print-pm-result-heading${isEightInspectionColumns ? " official-print-pm-result-heading-eight-columns" : ""}`} style={isFette ? { paddingInline: "2px" } : undefined}>
                          {usesStackedResultHeading ? <><span>تم الفحص</span><span>بنجاح</span></> : <span>تم الفحص بنجاح</span>}
                          <span>نعم / لا</span>
                        </th>
                      ))}
                    </tr>
                  </thead>}
                  <tbody>
                    {checklistPage.map((point, index) => (
                      <tr
                        key={point.id}
                        className={`official-print-row-tall${isFabTech && !point.pointText.includes("\n") && point.pointText.trim().length <= 90 ? " official-print-fabtech-row-compact" : isFabTech ? " official-print-fabtech-row-multiline" : ""}`}
                        style={{ height: isHuttlin ? "auto" : isFabTech && !point.pointText.includes("\n") && point.pointText.trim().length <= 90 ? "22px" : `${rowHeight}px` }}
                      >
                        <td style={isRotaryTabletPress ? { textAlign: "center", verticalAlign: "middle" } : undefined}>{checklistPointOffset + index + 1}.</td>
                        <td className={`official-print-pm-point-text${machineId === 5 ? " official-print-karnavati-point-text" : ""}`} style={isFette && point.id === 708 ? { fontSize: "12px", paddingInline: "2px" } : undefined}>
                          {isFette && point.id === 708 && point.pointText.includes("(Die Plate Contact Surface)")
                            ? <><span className="whitespace-nowrap">{keepEnglishTermsTogether(point.pointText.slice(0, point.pointText.indexOf("(Die Plate Contact Surface)") + "(Die Plate Contact Surface)".length))}</span>{point.pointText.slice(point.pointText.indexOf("(Die Plate Contact Surface)") + "(Die Plate Contact Surface)".length)}</>
                            : isFette && [708, 712, 728, 729].includes(point.id)
                            ? keepEnglishTermsTogether(point.pointText, /(\(Die Plate Contact Surface\)|\(Filling Wheels\)|Fill\+-O-matic|Powder Feeding System|\(LOG-00-0014\))/g)
                            : isRotaryTabletPress && point.id === 760
                              ? keepEnglishTermsTogether(point.pointText.replace(/\s+الموجود في القسم/, "\nالموجود في القسم"))
                            : isKalix && /\(timing\)\s*D72/i.test(point.pointText)
                              ? keepEnglishTermsTogether(point.pointText, /(\(timing\)\s*D72)/gi)
                            : machineId === 5 || (isRotaryTabletPress && point.id === 759) || (isRollCompactor && /LOG-10-0744/i.test(point.pointText))
                              ? keepEnglishTermsTogether(machineId === 5 ? point.pointText.replace(/Alpha\s*\r?\n\s*Zn-320\/Alpha SP-320/i, "Alpha Zn-320/Alpha SP-320") : point.pointText)
                              : point.pointText}
                        </td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, inspectionIndex) => {
                          const inspection = inspectionPage[inspectionIndex];
                          return <td key={inspection?.id ?? `empty-${inspectionIndex}`}>{inspection ? resultMap.get(`${inspection.id}-${point.id}`) ?? "" : ""}</td>;
                        })}
                      </tr>
                    ))}
                    {isFinalChecklistPage && <>
                      {!isAirHandling && <tr className="official-print-row-xl">
                        <td colSpan={2} className="official-print-pm-closing-label">{isOlsaVacuumMixer ? "ملاحظات:" : "الإجراء المتخذ في حال وجود خطأ/انحراف:"}</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, inspectionIndex) => {
                          const inspection = inspectionPage[inspectionIndex];
                          return <td key={inspection?.id ?? `action-${inspectionIndex}`}>{inspection?.actionTaken ?? ""}</td>;
                        })}
                      </tr>}
                      {isBg300Bg400 && <tr className="official-print-row-tall">
                        <td colSpan={2}>ملاحظات:</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => <td key={`bg-notes-${index}`} />)}
                      </tr>}
                      {usesAc1ChecklistFooter && <tr className="official-print-row-tall">
                        <td colSpan={2}>ملاحظات:</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => <td key={`ac1-notes-${index}`} />)}
                      </tr>}
                      {showsStandardNotesRow && <tr className="official-print-row-tall">
                        <td colSpan={2}>ملاحظات:</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => <td key={`standard-notes-${index}`} />)}
                      </tr>}
                      <tr className="official-print-row-tall">
                        <td colSpan={2} className="official-print-pm-closing-label">{isAirHandling && !usesAc1ChecklistFooter ? "توقيع فني الصيانة (القائم بالعمل)" : "اسم الفاحص وتوقيعه:"}</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, inspectionIndex) => {
                          const inspection = inspectionPage[inspectionIndex];
                          return <td key={inspection?.id ?? `examiner-${inspectionIndex}`}>{inspection ? displayedNameAndSignature(inspection.examinerName, inspection.examinerSignature, isAirHandling) : ""}</td>;
                        })}
                      </tr>
                      <tr className="official-print-row-tall">
                        <td colSpan={2} className="official-print-pm-closing-label">{isAirHandling && !usesAc1ChecklistFooter ? "توقيع مستلم الماكينة" : "اسم مستلم الماكينة وتوقيعه:"}</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, inspectionIndex) => {
                          const inspection = inspectionPage[inspectionIndex];
                          return <td key={inspection?.id ?? `receiver-${inspectionIndex}`}>{inspection ? displayedNameAndSignature(inspection.machineReceiverName, inspection.machineReceiverSignature, isAirHandling) : ""}</td>;
                        })}
                      </tr>
                      {isAirHandling && !usesAc1ChecklistFooter && <tr className="official-print-row-tall">
                        <td colSpan={2}>ملاحظات:</td>
                        {Array.from({ length: inspectionColumnsPerPage }).map((_, index) => <td key={`notes-${index}`} />)}
                      </tr>}
                    </>}
                  </tbody>
                </table>
              </div>
            </PrintPage>
          );
        }),
      )}
      </div>
    </PrintLayout>
  );
}
