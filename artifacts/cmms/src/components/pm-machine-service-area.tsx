export function PmMachineServiceArea({ machineId, showServiceArea, serviceAreaMachineNumber, serviceAreaLocation }: { machineId: number; showServiceArea: boolean; serviceAreaMachineNumber: string | null; serviceAreaLocation: string | null; }) {
  if (!showServiceArea) return null;

  if ([115, 116].includes(machineId)) {
    return (
      <div dir="rtl" className="pm-machine-service-area mt-4 mb-2 flex items-baseline justify-start gap-2 text-sm text-black">
        <span className="shrink-0 font-bold">رقم الماكينة:</span>
        <bdi dir="ltr" className="border-b border-black/50 whitespace-nowrap">{serviceAreaMachineNumber}</bdi>
      </div>
    );
  }

  if (machineId === 112) {
    return (
      <div dir="rtl" className="pm-machine-service-area pm-machine-service-area-mixer-number mt-4 mb-2 text-sm text-black">
        <span className="shrink-0 font-bold">خلاط رقم:</span>
        <bdi dir="ltr" className="border-b border-black/50 whitespace-nowrap">{serviceAreaMachineNumber}</bdi>
      </div>
    );
  }

  if ([17, 18, 101].includes(machineId)) {
    return (
      <div dir="ltr" className="flex items-baseline justify-start gap-2 mt-4 mb-2 text-sm text-black">
        <span className="shrink-0 font-bold">Chiller ID No.:</span>
        <bdi dir="ltr" className="border-b border-black/50 whitespace-nowrap">{serviceAreaMachineNumber}</bdi>
      </div>
    );
  }

  return (
    <div dir="rtl" className="pm-machine-service-area grid grid-cols-2 items-center pl-[12%] mt-4 mb-2 text-sm text-black">
      <div className="relative left-2 flex items-baseline justify-center gap-2">
        <span className="shrink-0 font-bold">رقم الماكينة:</span>
        <bdi dir="ltr" className="border-b border-black/50 whitespace-nowrap">{serviceAreaMachineNumber}</bdi>
      </div>
      {machineId !== 52 && <div className="relative -left-4 flex items-baseline justify-center gap-2">
        <span className="shrink-0 font-bold">المنطقة التي تخدمها:</span>
        <bdi dir="ltr" className="border-b border-black/50 whitespace-nowrap">{serviceAreaLocation}</bdi>
      </div>}
    </div>
  );
}
