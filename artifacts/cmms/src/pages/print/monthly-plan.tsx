import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { DottedLine, PrintLayout, PrintPage } from "./print-layout";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type MonthlyPlan = {
  id: number;
  year: number;
  month: number;
  preparedByName: string | null;
  preparedByDate: string | null;
  maintenanceSupervisorName: string | null;
  maintenanceSupervisorDate: string | null;
  departmentManagerName: string | null;
  departmentManagerDate: string | null;
  approvedByName: string | null;
  approvedByDate: string | null;
  rows: Array<{
    rowNumber: number;
    departmentName: string | null;
    sectionName: string | null;
    machineName: string;
    identificationNumber: string | null;
    plannedDateFrom: string | null;
    plannedDateTo: string | null;
    actualDate: string | null;
    amendments: string | null;
  }>;
};

type MonthlyPlanHeader = { companyName: string; documentName: string; documentNumber: string; effectiveOrExecutionDate: string | null; pageNumber: number; totalPages: number };

type ElectronicSignature = {
  fieldName: string;
  signatureData: string | null;
  userName: string;
  signedAt: string;
};

function signatureDate(savedDate: string | null | undefined, signedAt: string | undefined) {
  return savedDate || signedAt?.slice(0, 10) || "";
}

function paginateRows(rows: MonthlyPlan["rows"], maximumRowsPerPage: number, minimumRowsOnLastPage: number) {
  if (rows.length === 0) return [[]];

  const pages: MonthlyPlan["rows"][] = [];
  let startIndex = 0;

  while (startIndex < rows.length) {
    const remainingRows = rows.length - startIndex;
    const rowsOnThisPage = remainingRows > maximumRowsPerPage
      && remainingRows - maximumRowsPerPage < minimumRowsOnLastPage
      ? remainingRows - minimumRowsOnLastPage
      : Math.min(maximumRowsPerPage, remainingRows);

    pages.push(rows.slice(startIndex, startIndex + rowsOnThisPage));
    startIndex += rowsOnThisPage;
  }

  return pages;
}

export default function MonthlyPlanPrintPage({ params }: { params: { year: string; month: string } }) {
  const year = Number(params.year);
  const month = Number(params.month);
  const { data } = useQuery({
    queryKey: ["print-monthly-plan", year, month],
    queryFn: () => apiRequest<MonthlyPlan>(`/maintenance-plans/monthly/${year}/${month}`),
  });
  const { data: header } = useQuery({ queryKey: ["monthly-pm-header"], queryFn: () => apiRequest<MonthlyPlanHeader>("/maintenance-plans/monthly/header") });
  const planId = data?.id ?? 0;
  const { data: signatures = [] } = useQuery({
    queryKey: ["print-monthly-plan-signatures", planId],
    queryFn: () => apiRequest<ElectronicSignature[]>(`/signatures?documentType=MONTHLY_PLAN&documentId=${planId}`),
    enabled: planId > 0,
  });
  const signature = (fieldName: string) => signatures.find((item) => item.fieldName === fieldName);
  const preparedBySignature = signature("prepared_by");
  const supervisorSignature = signature("maintenance_supervisor");
  const managerSignature = signature("department_manager");
  const maximumRowsPerPage = 14;
  const minimumRowsOnLastPage = 3;
  const sourceRows = data?.rows ?? [];
  const pages = paginateRows(sourceRows, maximumRowsPerPage, minimumRowsOnLastPage);

  return (
    <PrintLayout title="Monthly PM Program - Official Print" landscape>
      {pages.map((pageRows, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;
        return <PrintPage landscape className="monthly-pm-print-page" key={pageIndex}>
          <div className="monthly-pm-print-content">
            <table className="official-print-table official-print-header-table monthly-pm-print-header">
              <tbody>
                <tr>
                  <td className="w-[30%] text-left font-semibold leading-tight">{header?.companyName ?? "Beit Jala Pharmaceutical Co."}<br />Beit Jala<br />Palestine</td>
                  <td className="monthly-pm-title-cell w-[45%] text-center font-semibold">{header?.documentName ?? "Monthly Preventive Maintenance Program"}</td>
                  <td className="monthly-pm-document-cell w-[25%] text-left font-semibold">
                    <div className="monthly-pm-document-line">Doc. No: {header?.documentNumber ?? "FORM-10-0117-3"}</div>
                    <div className="monthly-pm-document-line">Effective date: {header?.effectiveOrExecutionDate ?? "18/3/2023"}</div>
                    <div className="monthly-pm-document-line monthly-pm-document-line-last">Pages: {pageIndex + 1} of {pages.length}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="monthly-pm-month-line">Month/Year: <DottedLine text={data ? `${monthNames[month - 1]} / ${year}` : ""} /></div>
            <table className="official-print-table monthly-pm-print-table">
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2} className="w-[6%]">No.</th>
                  <th rowSpan={2} className="w-[12%]">Department<br />Name</th>
                  <th rowSpan={2} className="w-[14%]">Section Name</th>
                  <th rowSpan={2} className="w-[20%]">Machine Name/ Identification<br />Number</th>
                  <th colSpan={2} className="w-[24%]">Planned date</th>
                  <th rowSpan={2} className="w-[12%]">Actual Date</th>
                  <th rowSpan={2} className="w-[12%]">Amendments</th>
                </tr>
                <tr><th>From</th><th>To</th></tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.rowNumber} className="official-print-row-tall text-[11px]">
                    <td>{row.rowNumber}.</td>
                    <td>{row.departmentName}</td>
                    <td>{row.sectionName}</td>
                    <td>
                      <div className="monthly-pm-machine-name">{row.machineName}</div>
                      <div className="monthly-pm-machine-number">{row.identificationNumber}</div>
                    </td>
                    <td>{row.plannedDateFrom}</td>
                    <td>{row.plannedDateTo}</td>
                    <td>{row.actualDate}</td>
                    <td>{row.amendments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLastPage && <div className="monthly-pm-signatures grid grid-cols-[1fr_0.55fr] gap-12 text-[12px]">
          <div>
            Prepared by: {preparedBySignature?.signatureData ? <img src={preparedBySignature.signatureData} alt="Prepared by signature" className="monthly-pm-print-signature" /> : <DottedLine />}
            <br />
            Maintenance Section Supervisor Signature: {supervisorSignature?.signatureData ? <img src={supervisorSignature.signatureData} alt="Maintenance supervisor signature" className="monthly-pm-print-signature" /> : <DottedLine />}
            <br />
            Department Manager Sign: {managerSignature?.signatureData ? <img src={managerSignature.signatureData} alt="Department manager signature" className="monthly-pm-print-signature" /> : <DottedLine />}
          </div>
          <div>
            Date: <DottedLine text={signatureDate(data?.preparedByDate, preparedBySignature?.signedAt)} />
            <br />
            Date: <DottedLine text={signatureDate(data?.maintenanceSupervisorDate, supervisorSignature?.signedAt)} />
            <br />
            Date: <DottedLine text={signatureDate(data?.departmentManagerDate, managerSignature?.signedAt)} />
          </div>
          </div>}
          </div>
        </PrintPage>;
      })}
    </PrintLayout>
  );
}
