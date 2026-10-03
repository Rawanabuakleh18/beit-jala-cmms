import { useQuery } from "@tanstack/react-query";
import { Children, isValidElement, useLayoutEffect, useRef, useState } from "react";
import { paginateEquipmentRows } from "@/lib/equipment-pagination";
import { apiRequest } from "@/lib/api";
import { hasPowerAndAirUtilities, hasRollSizeUtility, hasTabletPressUtilities, hasRotaryTabletPressUtilities, hasProductContainerCapacity, hasPowlCapacity, hasBlenderRpm, hasLifterCapacity, hasCoMillCapacity, hasWaterConnection } from "@/lib/equipment-record-overrides";
import { DottedLine, PrintLayout, PrintPage } from "./print-layout";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

type EquipmentInformation = Record<string, string | number | null>;
type EquipmentHeader = {
  companyName: string;
  documentName: string;
  documentNumber: string;
  effectiveOrExecutionDate: string | null;
  pageNumber: number;
  totalPages: number;
};
type ElectronicSignature = {
  fieldName: string;
  signatureData: string | null;
  userName: string;
};

function value(record: EquipmentInformation | undefined, key: string) {
  const item = record?.[key];
  return item === null || item === undefined ? "" : String(item);
}

function formatDate(value: string) {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  return match ? `${Number(match[3])}/${Number(match[2])}/${match[1]}` : value;
}

function splitKalixEquipmentLines(text: string) {
  return text.split(/\r?\n/).reduce<Array<{ label: string; value: string }>>((lines, rawLine) => {
    const match = rawLine.match(/^\s*(filling machine|universal feeder)\s*:?\s*-?\s*(.*)$/i);
    if (match) {
      lines.push({ label: match[1], value: match[2].trim() });
    } else if (rawLine.trim()) {
      const previous = lines.at(-1);
      if (previous) previous.value = [previous.value, rawLine.trim()].filter(Boolean).join("\n");
      else lines.push({ label: "", value: rawLine.trim() });
    }
    return lines;
  }, []);
}

function AlignedEquipmentValues({
  text,
  kind = "id",
}: {
  text: string;
  kind?: "id" | "weight";
}) {
  const lines = text.split(/\r?\n/);
  return (
    <div
      className={`equipment-information-identification-lines${kind === "weight" ? " equipment-information-weight-lines" : ""}`}
    >
      {lines.map((line, index) => {
        // Align trailing values in one shared column; keep other text intact.
        const match =
          kind === "weight"
            ? line.match(/^(.*?)\s*(\d+(?:[.,]\d+)?\s*(?:kg|kgs|كغ|كجم))\s*$/i)
            : line.match(/^(.*?)\s*(\([^()]*\d[^()]*\))\s*$/);
        return (
          <div
            className="equipment-information-identification-line"
            key={index}
          >
            {match ? (
              <>
                <span>{match[1]}</span>
                <bdi dir="ltr">{match[2]}</bdi>
              </>
            ) : (
              <span className="equipment-information-identification-full">
                {line || "\u00a0"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const labels = {
  en: {
    title: "Equipment Information Record",
    docNumber: "FORM-10-0118-1",
    effectiveDate: "18/3/2023",
    company: "Beit Jala Pharmaceutical Co.",
    address: "Beit-Jala, Palestine",
    page: "Page 1 of 1",
    docNo: "Doc. No.:",
    effectiveDateLabel: "Effective Date:",
    f1: "1. Name of equipment",
    f2: "2. Model number",
    f3: "3. Serial number",
    f4: "4. Identification number",
    f5: "5. Date equipment purchased",
    f6a: "6. Company purchased from",
    f6b: "a. Name",
    f6c: "b. Address",
    f7a: "7. Manufacturing company",
    f7b: "a. Name",
    f7c: "b. Address",
    f8: "8. Equipment Dimensions (in cm): Width (W) × Height (H) × Depth (D)",
    f9: "9. Weight (kg)",
    f10: "10. Utilities",
    f10_1: "10.1. Power supply",
    f10_2: "10.2. Air",
    f10_3: "10.3. Water",
    f10_4: "10.4. Other Utilities",
    f11: "11. Others",
    f12: "12. Safety issues",
    preparedBy: "Prepared by:",
    approvedBy: "Approved by:",
    date: "Date:",
    toggleBtn: "عربي",
  },
  ar: {
    title: "سجل معلومات المعدة",
    docNumber: "FORM-10-0118-1",
    effectiveDate: "18/3/2023",
    company: "شركة بيت جالا للصناعات الدوائية",
    address: "بيت جالا، فلسطين",
    page: "صفحة 1 من 1",
    docNo: "رقم الوثيقة:",
    effectiveDateLabel: "تاريخ النفاذ:",
    f1: "1. اسم المعدة",
    f2: "2. رقم الطراز",
    f3: "3. الرقم التسلسلي",
    f4: "4. رقم التعريف",
    f5: "5. تاريخ الشراء",
    f6a: "6. الشركة التي تم الشراء منها",
    f6b: "أ. الاسم",
    f6c: "ب. العنوان",
    f7a: "7. الشركة المصنّعة",
    f7b: "أ. الاسم",
    f7c: "ب. العنوان",
    f8: "8. أبعاد المعدة (بالسم): العرض × الارتفاع × العمق",
    f9: "9. الوزن (كغ)",
    f10: "10. المرافق",
    f10_1: "10.1. مصدر الطاقة",
    f10_2: "10.2. الهواء",
    f10_3: "10.3. الماء",
    f10_4: "10.4. مرافق أخرى",
    f11: "11. أخرى",
    f12: "12. مسائل السلامة",
    preparedBy: "أعدّه:",
    approvedBy: "اعتمده:",
    date: "التاريخ:",
    toggleBtn: "English",
  },
};

export default function EquipmentInformationPrintPage({
  params,
}: {
  params: { id: string };
}) {
  const machineId = Number(params.id);
  const recordNumber = Number(new URLSearchParams(window.location.search).get("record") || 1);
  const recordQuery = recordNumber === 1 ? "" : `?record=${recordNumber}`;
  const signatureField = (field: string) => recordNumber === 1 ? field : `${field}_${recordNumber}`;
  const [lang, setLang] = useState<"en" | "ar">("en");
  const contentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>([]);
  const L = labels[lang];
  const isAr = lang === "ar";
  // AHU-501, AHU-301, and AHU-401 source forms use length × width × height.
  const hasLengthDimensions = [59, 60, 61].includes(machineId) && recordNumber === 1;

  const { data } = useQuery({
    queryKey: ["print-equipment-information", machineId, recordNumber],
    queryFn: () =>
      apiRequest<EquipmentInformation>(
        `/machines/${machineId}/equipment-information${recordQuery}`,
      ),
    retry: false,
  });
  const { data: header } = useQuery({
    queryKey: ["equipment-header", machineId, recordNumber],
    queryFn: () =>
      apiRequest<EquipmentHeader>(
        `/machines/${machineId}/equipment-information/header${recordQuery}`,
      ),
  });
  const lengthHeightWidthSuffix = /\s*\(Length\s*X\s*Height\s*X\s*Width\)\s*$/i;
  const rawDimensionsNote = value(data, "dimensionsNote");
  const usesExactDimensionsNote = machineId === 105 && recordNumber === 1;
  const hasCentimeterLengthHeightWidth = [77, 78].includes(machineId) && recordNumber === 1;
  const hasMillimeterDimensions = !hasCentimeterLengthHeightWidth && ((machineId === 84 && recordNumber === 1) || (machineId === 67 && recordNumber === 1) ||
    (/\bmm\b/i.test(rawDimensionsNote) && lengthHeightWidthSuffix.test(rawDimensionsNote)));
  const dimensionsNote = usesExactDimensionsNote
    ? rawDimensionsNote
    : hasCentimeterLengthHeightWidth
    ? rawDimensionsNote.replace(lengthHeightWidthSuffix, "").trim()
    : hasMillimeterDimensions
    ? rawDimensionsNote.replace(lengthHeightWidthSuffix, "")
    : hasLengthDimensions
    ? value(data, "dimensionsNote").replace(/^Length\s*\(L\)\s*X\s*Width\s*\(w\)\s*X\s*Height\s*\(H\)\s*\r?\n/i, "")
    : value(data, "dimensionsNote");
  const displayedDimension = (field: "dimensionWidthCm" | "dimensionHeightCm" | "dimensionDepthCm") => {
    const raw = value(data, field).trim();
    return raw && Number(raw) !== 0 ? raw : "";
  };
  const displayedDimensions = usesExactDimensionsNote ? [] : [
    displayedDimension("dimensionWidthCm"),
    displayedDimension("dimensionHeightCm"),
    displayedDimension("dimensionDepthCm"),
  ].filter(Boolean);
  // The Carrier chillers use the controlled one-sheet equipment form.  Their
  // records include several fixed detail rows, so let the table use the full
  // printable height instead of splitting the final sections onto page two.
  const isCarrierChillerSinglePage = recordNumber === 1 && ["CH-4", "CH-5"].includes(value(data, "identificationNumber").trim().toUpperCase());
  const isBgCoatingEquipmentRecord = recordNumber === 1 && /PDM-01-0(?:36|37)\s*A/i.test(value(data, "identificationNumber"));
  const isAmpouleInspectionMachine = value(data, "identificationNumber").trim().toUpperCase() === "PDM-08-085";
  const isKalixFillingMachine = /^PDM-03-0?51$/i.test(value(data, "identificationNumber").trim());
  const usesBlowerAirLayout = recordNumber === 1 && ["AC-1", "AC-2", "AC-3", "AC-4", "AC-5", "AC-6"].includes(value(data, "identificationNumber").trim().toUpperCase());
  const { data: signatures = [] } = useQuery({
    queryKey: ["print-equipment-information-signatures", machineId],
    queryFn: () =>
      apiRequest<ElectronicSignature[]>(
        `/signatures?documentType=EQUIPMENT_INFORMATION&documentId=${machineId}`,
      ),
  });
  const preparedSignature = signatures.find(
    (signature) => signature.fieldName === signatureField("prepared_by"),
  );
  const approvedSignature = signatures.find(
    (signature) => signature.fieldName === signatureField("approved_by"),
  );
  const otherRows = value(data, "others")
    .split(/\r?\n/)
    .map((item) => item.trim());
  const otherDetailRows = value(data, "othersDetails")
    .split(/\r?\n/)
    .map((item) => item.trim());
  // This blender's Basic Structure has two material lines in one table cell.
  // The following detail belongs to Discharge, not a third table row.
  if (
    hasBlenderRpm(machineId, recordNumber) &&
    otherRows.filter(Boolean).length === 2 &&
    /Basic Structure/i.test(otherRows[0] ?? "") &&
    /Discharge/i.test(otherRows[1] ?? "") &&
    otherDetailRows.filter(Boolean).length === 3
  ) {
    const details = otherDetailRows.filter(Boolean);
    otherDetailRows.splice(0, otherDetailRows.length, details.slice(0, 2).join("\n"), details[2]);
  }
  // The two material specifications belong to the same Basic Structure row.
  if (
    hasCoMillCapacity(machineId, recordNumber) &&
    otherRows.filter(Boolean).length === 2 &&
    /Basic Structure/i.test(otherRows[1] ?? "") &&
    otherDetailRows.length === 3
  ) {
    otherDetailRows.splice(1, 2, otherDetailRows.slice(1).join("\n"));
  }
  if (machineId === 106 && recordNumber === 2) {
    otherDetailRows.splice(0, otherDetailRows.length, otherDetailRows.join("\n"), "");
  }
  const safetyIssueRows = value(data, "safetyIssues")
    .split(/\r?\n/)
    .map((item) => item.trim());
  const safetyIssueDetailRows = value(data, "safetyIssuesDetails")
    .split(/\r?\n/)
    .map((item) => item.trim());
  const pairedRows = (left: string[], right: string[]) =>
    Array.from(
      { length: Math.max(left.length, right.length) },
      (_, index) => [left[index] ?? "", right[index] ?? ""] as const,
    ).filter(([leftValue, rightValue]) => leftValue || rightValue);
  const visibleOtherRows = pairedRows(otherRows, otherDetailRows);
  const visibleSafetyRows = pairedRows(safetyIssueRows, safetyIssueDetailRows);

  const rows = Children.toArray([
    [
      [L.f1, value(data, "nameOfEquipment")],
      [L.f2, value(data, "modelNumber")],
      [L.f3, value(data, "serialNumber")],
      [L.f4, value(data, "identificationNumber")],
      [L.f5, value(data, "datePurchased")],
    ].map(([label, field]) => {
      const splitEquipment = isKalixFillingMachine && (label === L.f2 || label === L.f3)
        ? splitKalixEquipmentLines(field)
        : [];
      return (
      <tr key={label} className="equipment-row-detail">
        <td className="w-[48%] font-semibold">
          {splitEquipment.length > 0 ? (
            <div className="equipment-information-kalix-left-cell">
              <span>{label}</span>
              <div className="equipment-information-kalix-lines equipment-information-kalix-labels">
                {splitEquipment.map((line, index) => (
                  <span
                    key={index}
                    style={{ minHeight: `${Math.max(1, line.value.split(/\r?\n/).length) * 1.12}em` }}
                  >
                    {line.label}
                  </span>
                ))}
              </div>
            </div>
          ) : label}
        </td>
        <td>
          {splitEquipment.length > 0 ? (
            <div className="equipment-information-kalix-lines">
              {splitEquipment.map((line, index) => <span key={index}>{line.value}</span>)}
            </div>
          ) : label === L.f4 ? <AlignedEquipmentValues text={field} /> : field}
        </td>
      </tr>
      );
    }),
    <tr className="equipment-row-large equipment-information-multiline-label">
      <td className="font-semibold">
        {L.f6a}
        <br />
        {L.f6b}
        <br />
        {L.f6c}
      </td>
      <td>
        <div className="equipment-information-company-lines">
          <div>{value(data, "purchasedFromName")}</div>
          <div>{value(data, "purchasedFromAddress")}</div>
        </div>
      </td>
    </tr>,
    <tr className="equipment-row-large equipment-information-multiline-label">
      <td className="font-semibold">
        {L.f7a}
        <br />
        {L.f7b}
        <br />
        {L.f7c}
      </td>
      <td>
        <div className="equipment-information-company-lines">
          <div>{value(data, "manufacturingCompanyName")}</div>
          <div>{value(data, "manufacturingCompanyAddress")}</div>
        </div>
      </td>
    </tr>,
    <tr className="equipment-row-large">
      <td className="font-semibold">
        {isAr ? (
          <>{hasCentimeterLengthHeightWidth ? "8. أبعاد المعدة (بالسم): الطول × الارتفاع × العرض" : hasMillimeterDimensions ? "8. أبعاد المعدة (بالملم): الطول × الارتفاع × العرض" : hasLengthDimensions ? "8. أبعاد المعدة (بالسم): الطول × العرض × الارتفاع" : L.f8}</>
        ) : (
          <>
            8. Equipment Dimensions
            <br />
            {hasMillimeterDimensions ? "(in mm):" : "(in cm):"}
            <br />
            {machineId === 84 && recordNumber === 1 ? "Width (W) X Height (H) X Depth (D)" : hasMillimeterDimensions || hasCentimeterLengthHeightWidth ? "Length (L) X Height (H) X Width (W)" : hasLengthDimensions ? "Length (L) X Width (w) X Height (H)" : "Width (W) X Height (H) X Depth (D)"}
          </>
        )}
      </td>
      <td className="equipment-information-dimensions-value whitespace-pre-line">
        {displayedDimensions.join(" × ")}
        {dimensionsNote && (
          <>
            {displayedDimensions.length > 0 ? " — " : ""}
            {dimensionsNote}
          </>
        )}
      </td>
    </tr>,
    <tr className="equipment-row-weight">
      <td className="font-semibold">{L.f9}</td>
      <td className="whitespace-pre-line">
        {(machineId === 106 && recordNumber === 2) || machineId === 108 ? (
          <div className="text-left">{[value(data, "weightKg"), value(data, "weightNote")].filter(Boolean).join(" — ")}</div>
        ) : (
          <AlignedEquipmentValues
            kind="weight"
            text={[value(data, "weightKg"), value(data, "weightNote")]
              .filter(Boolean)
              .join(" — ")}
          />
        )}
      </td>
    </tr>,
    <tr key="utilities-title" data-section-heading>
      <td colSpan={2} className="equipment-section-cell">
        {L.f10}
      </td>
    </tr>,
    [
      [L.f10_1, value(data, "utilitiesPowerSupply")],
      [machineId === 84 && recordNumber === 1 ? "10.2. Max output (tab/Hr)" : hasPowerAndAirUtilities(machineId, recordNumber) ? (isAr ? "10.2. ضغط الهواء" : "10.2 air pressure") : hasRotaryTabletPressUtilities(machineId, recordNumber) ? (isAr ? "10.2. أقصى قوة لضغط الأقراص" : "10.2. Maximum Tablet Pressing Force") : L.f10_2, value(data, "utilitiesAir")],
      [machineId === 113 && recordNumber === 1 ? (isAr ? "10.3. الرطوبة" : "10.3. Humidity") : machineId === 84 && recordNumber === 1 ? "10.3. Maximum Turret RPM" : hasRotaryTabletPressUtilities(machineId, recordNumber) ? (isAr ? "10.3. أقصى ضغط أولي" : "10.3. Max Pre-Pressure") : hasTabletPressUtilities(machineId, recordNumber) ? (isAr ? "10.3. نظام التزييت" : "10.3. Lubrication system") : L.f10_3, value(data, "utilitiesWater")],
      [isAmpouleInspectionMachine ? (isAr ? "10.4. حجم فحص الأمبولات" : "10.4 . AMPOUL INSPECTION SIZE") : machineId === 106 || machineId === 113 ? (isAr ? "10.4. مستوى الضوضاء" : "10.4 . Noise Level") : machineId === 84 && recordNumber === 1 ? "10.4. Main Compression Roller Max Pressure" : hasWaterConnection(machineId, recordNumber) ? "10.4. Water Connection" : hasCoMillCapacity(machineId, recordNumber) ? "10.4. Capacity" : hasLifterCapacity(machineId, recordNumber) ? "10.4. Lifter Capacity" : hasBlenderRpm(machineId, recordNumber) ? "10.4. Blender RPM" : hasPowlCapacity(machineId, recordNumber) ? "10.4. Powl Capacity" : hasProductContainerCapacity(machineId, recordNumber) ? "10.4. Product Container Capacity" : hasRotaryTabletPressUtilities(machineId, recordNumber) ? (isAr ? "10.4. أقصى عمق للكبس" : "10.4. Maximum Punching Depth") : hasTabletPressUtilities(machineId, recordNumber) ? (isAr ? "10.4. أقصى حجم للقرص يمكن كبسه" : "10.4. Max Tablet size can be Compressed") : hasRollSizeUtility(machineId, recordNumber) ? (isAr ? "10.4. حجم الأسطوانة" : "10.4. Roll Size") : L.f10_4, value(data, "utilitiesOther")],
    ].filter((_, index) => !hasPowerAndAirUtilities(machineId, recordNumber) || index < 2).map(([label, field], index) => {
      const splitEquipment = isKalixFillingMachine && index === 0
        ? splitKalixEquipmentLines(String(field))
        : [];
      return (
      <tr key={index} className="equipment-row-utility">
        <td className="w-[48%] font-semibold">
          {usesBlowerAirLayout && index === 1 ? (
            <div className="equipment-information-ac1-air-lines">
              <span>{L.f10_2}</span>
              <span>Blower Type</span>
              <span>Blower Size</span>
            </div>
          ) : (
            splitEquipment.length > 0 ? (
              <div className="equipment-information-kalix-left-cell">
                <span>{label}</span>
                <div className="equipment-information-kalix-lines equipment-information-kalix-labels">
                  {splitEquipment.map((line, lineIndex) => (
                    <span
                      key={lineIndex}
                      style={{ minHeight: `${Math.max(1, line.value.split(/\r?\n/).length) * 1.12}em` }}
                    >
                      {line.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : label
          )}
        </td>
        <td>
          {usesBlowerAirLayout && index === 1 ? (
            <div className="equipment-information-ac1-air-lines equipment-information-ac1-air-values">
              {String(field).split(/\r?\n/).map((line, lineIndex) => <span key={lineIndex}>{line}</span>)}
            </div>
          ) : splitEquipment.length > 0 ? (
            <div className="equipment-information-kalix-lines">
              {splitEquipment.map((line, lineIndex) => <span key={lineIndex}>{line.value}</span>)}
            </div>
          ) : field}
        </td>
      </tr>
      );
    }),
    <tr key="others-title" data-section-heading data-section="others">
      <td colSpan={2} className="equipment-section-cell">
        {L.f11}
      </td>
    </tr>,
    visibleOtherRows.map(([item, detail], index) => (
      <tr key={`other-${index}`} className="equipment-row-extra">
        <td className="w-[48%]">{item}</td>
        <td>{detail}</td>
      </tr>
    )),
    <tr key="safety-title" data-section-heading>
      <td colSpan={2} className="equipment-section-cell">
        {L.f12}
      </td>
    </tr>,
    visibleSafetyRows.map(([issue, detail], index) => (
      <tr key={`safety-${index}`} className="equipment-row-extra equipment-row-safety">
        <td className="w-[48%]">{issue}</td>
        <td>{detail}</td>
      </tr>
    )),
  ]);

  const othersStartIndex = rows.findIndex(
    (row) => isValidElement<{ "data-section"?: string }>(row) && row.props["data-section"] === "others",
  );

  const renderHeader = (pageNumber: number, totalPages: number) => (
    <table
      data-equipment-measure
      className="official-print-table official-print-header-table equipment-information-header"
    >
      <tbody>
        <tr>
          <td
            className={`w-[34%] font-semibold ${isAr ? "text-right" : "text-left"}`}
          >
            {isAr ? L.company : header?.companyName || L.company}
            <br />
            {L.address.split(/[،,]\s*/).map((line, index, lines) => (
              <span key={line}>
                {line}
                {index < lines.length - 1 && <br />}
              </span>
            ))}
          </td>
          <td className="w-[33%] text-center font-semibold">
            {isAr ? L.title : header?.documentName || L.title}
          </td>
          <td
            className={`w-[33%] equipment-header-meta ${isAr ? "text-right" : "text-left"}`}
          >
            <div>
              <strong>{L.docNo}</strong> {header?.documentNumber || L.docNumber}
            </div>
            <div>
              <strong>{L.effectiveDateLabel}</strong>{" "}
              <bdi dir="ltr">
                {formatDate(
                  header?.effectiveOrExecutionDate || L.effectiveDate,
                )}
              </bdi>
            </div>
            <div>
              <strong>
                {isAr
                  ? `صفحة ${pageNumber} من ${totalPages}`
                  : `Page ${pageNumber} of ${totalPages}`}
              </strong>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
  const approvals = (
    <div
      data-equipment-measure
      className="equipment-information-approvals mt-4"
    >
      <div>
        <span>
          {L.preparedBy}{" "}
          <DottedLine
            text={value(data, "preparedByName") || preparedSignature?.userName}
          />
          {preparedSignature?.signatureData && (
            <img
              src={preparedSignature.signatureData}
              alt="Prepared by signature"
              className="equipment-information-approval-signature"
            />
          )}
        </span>
        <span>
          {L.date}{" "}
          <DottedLine text={formatDate(value(data, "preparedByDate"))} />
        </span>
      </div>
      <div>
        <span>
          {L.approvedBy}{" "}
          <DottedLine
            text={value(data, "approvedByName") || approvedSignature?.userName}
          />
          {approvedSignature?.signatureData && (
            <img
              src={approvedSignature.signatureData}
              alt="Approved by signature"
              className="equipment-information-approval-signature"
            />
          )}
        </span>
        <span>
          {L.date}{" "}
          <DottedLine text={formatDate(value(data, "approvedByDate"))} />
        </span>
      </div>
    </div>
  );
  const renderTable = (indices: number[]) => (
    <div className="equipment-information-form-grid">
      <table className="official-print-table equipment-information-continuous-table">
        <colgroup>
          <col style={{ width: "48%" }} />
          <col style={{ width: "52%" }} />
        </colgroup>
        <tbody>{indices.map((index) => rows[index])}</tbody>
      </table>
    </div>
  );

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    if (isCarrierChillerSinglePage) {
      const singlePage = [rows.map((_, index) => index)];
      setPages((previous) =>
        JSON.stringify(previous) === JSON.stringify(singlePage) ? previous : singlePage,
      );
      return;
    }
    if (isBgCoatingEquipmentRecord && othersStartIndex > 0) {
      const firstPage = Array.from({ length: othersStartIndex }, (_, index) => index);
      const secondPage = Array.from(
        { length: rows.length - othersStartIndex },
        (_, index) => othersStartIndex + index,
      );
      const splitPages = [firstPage, secondPage];
      setPages((previous) =>
        JSON.stringify(previous) === JSON.stringify(splitPages) ? previous : splitPages,
      );
      return;
    }
    const measure = () => {
      if (!content.offsetHeight) return;
      const headerElement = content.querySelector<HTMLElement>(
        ".equipment-information-header",
      );
      const approvalElement = content.querySelector<HTMLElement>(
        ".equipment-information-approvals",
      );
      const rowElements = Array.from(
        content.querySelectorAll<HTMLTableRowElement>(
          ".equipment-information-continuous-table tr",
        ),
      );
      if (!headerElement || !approvalElement || !rowElements.length) return;
      // A4 minus page padding, top offset, header/table gap and rounding tolerance.
      const capacity =
        ((297 - 24 - 5 - 6 - 2) * 96) / 25.4 - headerElement.offsetHeight;
      const approvalHeight = approvalElement.offsetHeight + 16;
      const result = paginateEquipmentRows(
        rowElements.map((row) => ({
          height: row.offsetHeight,
          heading: row.hasAttribute("data-section-heading"),
        })),
        capacity,
        approvalHeight,
      );
      setPages((previous) =>
        JSON.stringify(previous) === JSON.stringify(result) ? previous : result,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    let active = true;
    document.fonts.ready.then(() => {
      if (active) measure();
    });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [data, header, signatures, lang, isCarrierChillerSinglePage, isBgCoatingEquipmentRecord, othersStartIndex, rows.length]);

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto mb-2 flex max-w-[210mm] justify-end print:hidden px-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          {L.toggleBtn}
        </Button>
      </div>
      <PrintLayout title={L.title}>
        <div
          className="equipment-information-measure official-print-page equipment-information-print-page"
          aria-hidden="true"
        >
          <div ref={contentRef} className={`equipment-information-print-content${isCarrierChillerSinglePage ? " equipment-information-carrier-chiller-single-page" : ""}`}>
            {renderHeader(1, 1)}
            {renderTable(rows.map((_, index) => index))}
            {approvals}
          </div>
        </div>
        {pages.map((indices, index) => (
          <PrintPage
            key={index}
            className={`equipment-information-print-page${index ? " equipment-information-print-page-continued" : ""}`}
          >
            <div className={`equipment-information-print-content${isCarrierChillerSinglePage ? " equipment-information-carrier-chiller-single-page" : ""}`}>
              {renderHeader(index + 1, pages.length)}
              {renderTable(indices)}
              {index === pages.length - 1 && approvals}
            </div>
          </PrintPage>
        ))}
      </PrintLayout>
    </div>
  );
}
