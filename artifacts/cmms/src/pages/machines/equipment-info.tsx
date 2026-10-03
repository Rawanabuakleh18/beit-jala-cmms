import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "../../contexts/AuthContext";
import { 
  useGetMachine,
  getGetMachineQueryKey,
  type EquipmentInformation,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { hasPowerAndAirUtilities, hasRollSizeUtility, hasTabletPressUtilities, hasRotaryTabletPressUtilities, hasProductContainerCapacity, hasPowlCapacity, hasBlenderRpm, hasLifterCapacity, hasCoMillCapacity, hasWaterConnection } from "@/lib/equipment-record-overrides";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, FileText, Loader2, AlertCircle, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OfficialFormHeader } from "@/components/official-form-header";
import { ElectronicSignatureField } from "@/components/electronic-signature-field";

type EquipmentHeader = { companyName: string; documentName: string; documentNumber: string; effectiveOrExecutionDate: string | null; pageNumber: number; totalPages: number };

function formatDisplayedDate(value: string | null | undefined) {
  if (!value) return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  return match ? `${Number(match[3])}/${Number(match[2])}/${match[1]}` : value;
}

const equipmentInfoSchema = z.object({
  nameOfEquipment: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  identificationNumber: z.string().optional(),
  datePurchased: z.string().optional(),
  
  purchasedFromName: z.string().optional(),
  purchasedFromAddress: z.string().optional(),
  
  manufacturingCompanyName: z.string().optional(),
  manufacturingCompanyAddress: z.string().optional(),
  
  dimensionWidthCm: z.preprocess((value) => value === "" || value == null ? null : Number(value), z.number().nullable()).optional(),
  dimensionHeightCm: z.preprocess((value) => value === "" || value == null ? null : Number(value), z.number().nullable()).optional(),
  dimensionDepthCm: z.preprocess((value) => value === "" || value == null ? null : Number(value), z.number().nullable()).optional(),
  dimensionsNote: z.string().optional(),
  weightKg: z.string().optional(),
  weightNote: z.string().optional(),
  
  utilitiesPowerSupply: z.string().optional(),
  utilitiesAir: z.string().optional(),
  utilitiesWater: z.string().optional(),
  utilitiesOther: z.string().optional(),
  
  others: z.string().optional(),
  othersDetails: z.string().optional(),
  safetyIssues: z.string().optional(),
  safetyIssuesDetails: z.string().optional(),
  
  preparedByName: z.string().optional(),
  preparedByDate: z.string().optional(),
  approvedByName: z.string().optional(),
  approvedByDate: z.string().optional(),
});

type EquipmentInfoValues = z.infer<typeof equipmentInfoSchema>;
type EquipmentInfoPayload = Omit<EquipmentInfoValues, "dimensionWidthCm" | "dimensionHeightCm" | "dimensionDepthCm" | "weightKg"> & {
  dimensionWidthCm: number | null;
  dimensionHeightCm: number | null;
  dimensionDepthCm: number | null;
  weightKg: number | null;
};

export default function EquipmentInformationForm({ params }: { params: { id: string } }) {
  const [recordNumber, setRecordNumber] = useState(1);
  const { data: records = [{ recordNumber: 1 }] } = useQuery({
    queryKey: ["equipment-records", params.id],
    queryFn: () => apiRequest<Array<{ recordNumber: number }>>(`/machines/${params.id}/equipment-information/records`),
  });
  const activeRecord = records.some(record => record.recordNumber === recordNumber) ? recordNumber : 1;
  return <EquipmentRecordForm key={`${params.id}-${activeRecord}`} params={params} recordNumber={activeRecord} records={records} onSelectRecord={setRecordNumber} />;
}

function EquipmentRecordForm({ params, recordNumber, records, onSelectRecord }: {
  params: { id: string }; recordNumber: number; records: Array<{ recordNumber: number }>; onSelectRecord: (record: number) => void;
}) {
  const machineId = parseInt(params.id, 10);
  const recordQuery = recordNumber === 1 ? "" : `?record=${recordNumber}`;
  const signatureField = (field: string) => recordNumber === 1 ? field : `${field}_${recordNumber}`;
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canEdit = hasPermission("edit_equipment_information");
  const canEditHeader = hasPermission("edit_header_equipment_information");
  const [headerForm, setHeaderForm] = useState<EquipmentHeader | null>(null);
  const [dimensionsNoteDraft, setDimensionsNoteDraft] = useState("");
  const [weightDraft, setWeightDraft] = useState("");

  const { data: machine, isLoading: isLoadingMachine } = useGetMachine(machineId, {
    query: { enabled: !!machineId, queryKey: getGetMachineQueryKey(machineId) }
  });

  const equipmentInfoQueryKey = ["equipment-information", machineId, recordNumber] as const;
  const { data: equipInfo, isLoading: isLoadingInfo, isFetched: isEquipmentInfoFetched } = useQuery({
    queryKey: equipmentInfoQueryKey,
    queryFn: () => apiRequest<EquipmentInformation>(`/machines/${machineId}/equipment-information${recordQuery}`),
    enabled: !!machineId,
    retry: false,
  });
  const equipmentHeaderQueryKey = ["equipment-header", machineId, recordNumber] as const;
  const { data: equipmentHeader } = useQuery({
    queryKey: equipmentHeaderQueryKey,
    queryFn: () => apiRequest<EquipmentHeader>(`/machines/${machineId}/equipment-information/header${recordQuery}`),
    enabled: !!machineId,
    staleTime: 5 * 60 * 1000,
  });
  useEffect(() => { if (equipmentHeader) setHeaderForm(equipmentHeader); }, [equipmentHeader]);
  const saveHeader = useMutation({
    mutationFn: () => apiRequest<EquipmentHeader>(`/machines/${machineId}/equipment-information/header${recordQuery}`, { method: "PUT", body: JSON.stringify(headerForm) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: equipmentHeaderQueryKey }); toast({ title: "Header Saved", description: "The header was updated for this machine only." }); },
    onError: (error) => toast({ variant: "destructive", title: "Header save failed", description: getErrorMessage(error, "Could not save header.") }),
  });

  const upsertMutation = useMutation({
    mutationFn: (data: Partial<EquipmentInfoPayload>) =>
      apiRequest<EquipmentInformation>(`/machines/${machineId}/equipment-information${recordQuery}`, { method: "PUT", body: JSON.stringify(data) }),
  });

  const form = useForm<EquipmentInfoValues>({
    resolver: zodResolver(equipmentInfoSchema),
    defaultValues: {},
  });
  const initializedMachineId = useRef<number | null>(null);

  useEffect(() => {
    // Load a machine's saved values once.  Do not reset the form when a
    // background query refetches, otherwise notes being typed are lost before
    // the user can save them.
    if (!machine || !isEquipmentInfoFetched || initializedMachineId.current === machineId) return;
    if (equipInfo) {
      form.reset({
        // The master machine details provide the initial values only.  Once a
        // value is saved in this record, it remains an independent editable
        // copy and never writes back to Edit Details.
        nameOfEquipment: equipInfo.nameOfEquipment || machine?.machineName || "",
        modelNumber: equipInfo.modelNumber || "",
        serialNumber: equipInfo.serialNumber || "",
        identificationNumber: equipInfo.identificationNumber || machine?.machineNumber || "",
        datePurchased: equipInfo.datePurchased || "",
        
        purchasedFromName: equipInfo.purchasedFromName || "",
        purchasedFromAddress: equipInfo.purchasedFromAddress || "",
        
        manufacturingCompanyName: equipInfo.manufacturingCompanyName || "",
        manufacturingCompanyAddress: equipInfo.manufacturingCompanyAddress || "",
        
        dimensionWidthCm: equipInfo.dimensionWidthCm,
        dimensionHeightCm: equipInfo.dimensionHeightCm,
        dimensionDepthCm: equipInfo.dimensionDepthCm,
        dimensionsNote: equipInfo.dimensionsNote || "",
        weightKg: equipInfo.weightKg === null || equipInfo.weightKg === undefined ? "" : String(equipInfo.weightKg),
        weightNote: equipInfo.weightNote || "",
        
        utilitiesPowerSupply: equipInfo.utilitiesPowerSupply || "",
        utilitiesAir: equipInfo.utilitiesAir || "",
        utilitiesWater: equipInfo.utilitiesWater || "",
        utilitiesOther: equipInfo.utilitiesOther || "",
        
        others: equipInfo.others || "",
        othersDetails: equipInfo.othersDetails || "",
        safetyIssues: equipInfo.safetyIssues || "",
        safetyIssuesDetails: equipInfo.safetyIssuesDetails || "",
        
        preparedByName: equipInfo.preparedByName || "",
        preparedByDate: equipInfo.preparedByDate ? equipInfo.preparedByDate.split('T')[0] : "",
        approvedByName: equipInfo.approvedByName || "",
        approvedByDate: equipInfo.approvedByDate ? equipInfo.approvedByDate.split('T')[0] : "",
      });
      setDimensionsNoteDraft(equipInfo.dimensionsNote || "");
      setWeightDraft(equipInfo.weightKg === null || equipInfo.weightKg === undefined ? "" : String(equipInfo.weightKg));
    } else if (machine) {
      form.reset({
        nameOfEquipment: machine.machineName,
        identificationNumber: machine.machineNumber,
      });
      setDimensionsNoteDraft("");
      setWeightDraft("");
    }
    initializedMachineId.current = machineId;
  }, [equipInfo, isEquipmentInfoFetched, machine, machineId, form]);

  const onSubmit = (values: EquipmentInfoValues) => {
    // Nullify empty numeric fields
    const enteredWeight = weightDraft.trim();
    const parsedWeight = Number.parseFloat(enteredWeight);
    const savedDimension = (value: number | null | undefined) =>
      typeof value === "number" && Number.isFinite(value) && value !== 0 ? value : null;
    const completePayload: EquipmentInfoPayload = {
      ...values,
      dimensionWidthCm: savedDimension(values.dimensionWidthCm),
      dimensionHeightCm: savedDimension(values.dimensionHeightCm),
      dimensionDepthCm: savedDimension(values.dimensionDepthCm),
      weightKg: enteredWeight && Number.isFinite(parsedWeight) ? parsedWeight : null,
      dimensionsNote: dimensionsNoteDraft,
    };
    const payload: Partial<EquipmentInfoPayload> = {};
    for (const key of Object.keys(form.formState.dirtyFields) as Array<keyof EquipmentInfoPayload>) {
      payload[key] = completePayload[key] as never;
    }
    if (dimensionsNoteDraft !== (equipInfo?.dimensionsNote || "")) payload.dimensionsNote = dimensionsNoteDraft;
    if (weightDraft !== (equipInfo?.weightKg == null ? "" : String(equipInfo.weightKg))) payload.weightKg = completePayload.weightKg;

    upsertMutation.mutate(
      payload,
      {
        onSuccess: (data) => {
          queryClient.setQueryData(equipmentInfoQueryKey, data);
          form.reset(values);
          setDimensionsNoteDraft(data.dimensionsNote || "");
          setWeightDraft(data.weightKg == null ? "" : String(data.weightKg));
          toast({
            title: "Record Saved",
            description: "Equipment Information Record updated successfully.",
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Save Failed",
            description: getErrorMessage(error, "An unexpected error occurred while saving."),
          });
        }
      }
    );
  };

  const isLoading = isLoadingMachine || isLoadingInfo;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <div className="bg-card border shadow-sm p-8 rounded-lg space-y-8">
           <Skeleton className="h-8 w-1/3 mx-auto" />
           <Skeleton className="h-32 w-full" />
           <Skeleton className="h-32 w-full" />
           <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href={`/machines/${machineId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Equipment Information</h1>
            <p className="text-muted-foreground">FORM-10-0118</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/print/equipment-information/${machineId}${recordQuery}`}>Official Print</Link>
          </Button>

          {canEdit && (
            <>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Form
              </Button>
            </>
          )}
        </div>
      </div>

      {records.length > 1 && <label className="flex items-center gap-3 rounded-md border p-3" dir="rtl">
        السجل التعريفي
        <select className="rounded border bg-background px-3 py-2" value={recordNumber}
          disabled={upsertMutation.isPending || saveHeader.isPending}
          onChange={event => {
            const hasChanges = form.formState.isDirty || dimensionsNoteDraft !== (equipInfo?.dimensionsNote || "") || weightDraft !== (equipInfo?.weightKg == null ? "" : String(equipInfo.weightKg)) || JSON.stringify(headerForm) !== JSON.stringify(equipmentHeader);
            if (!hasChanges || window.confirm("يوجد تعديلات غير محفوظة. هل تريد الانتقال إلى سجل آخر؟")) onSelectRecord(Number(event.target.value));
          }}>
          {records.map(record => <option key={record.recordNumber} value={record.recordNumber}>السجل {record.recordNumber}{record.recordNumber === 1 && !["PDM-01-043", "PDM-01-097", "PDM-08-081", "PDM-08-081 A"].includes(machine?.machineNumber?.trim() ?? "") ? " — الأصلي" : ""}</option>)}
        </select>
      </label>}

      {!canEdit && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">You are viewing this record in read-only mode.</p>
        </div>
      )}

      {/* The Form Paper Container */}
      <div className="bg-white dark:bg-card border shadow-xl rounded-sm p-8 md:p-12 print:shadow-none print:border-none print:p-0">
        <OfficialFormHeader
          companyName={equipmentHeader?.companyName}
          documentName={equipmentHeader?.documentName ?? "Equipment Information Record"}
          documentNumber={equipmentHeader?.documentNumber ?? "FORM-10-0118"}
          effectiveOrExecutionDate={formatDisplayedDate(equipmentHeader?.effectiveOrExecutionDate ?? form.watch("preparedByDate"))}
          dateLabel="Effective Date"
          page={`Page ${equipmentHeader?.pageNumber ?? 1} of ${equipmentHeader?.totalPages ?? 1}`}
        />

        {canEditHeader && headerForm && (
          <div className="mb-8 rounded-md border bg-muted/30 p-4 print:hidden">
            <div className="mb-3 flex items-center gap-2 font-semibold"><Settings2 className="h-4 w-4" /> Edit Header</div>
            <div className="grid gap-3 md:grid-cols-2">
              <Textarea rows={2} value={headerForm.companyName} onChange={(e) => setHeaderForm({ ...headerForm, companyName: e.target.value })} placeholder="Company name" />
              <Textarea rows={2} value={headerForm.documentName} onChange={(e) => setHeaderForm({ ...headerForm, documentName: e.target.value })} placeholder="Document name" />
              <Textarea rows={2} value={headerForm.documentNumber} onChange={(e) => setHeaderForm({ ...headerForm, documentNumber: e.target.value })} placeholder="Document number" />
              <Input type="date" value={headerForm.effectiveOrExecutionDate ?? ""} onChange={(e) => setHeaderForm({ ...headerForm, effectiveOrExecutionDate: e.target.value || null })} />
              <Input value={`Page ${headerForm.pageNumber} of ${headerForm.totalPages}`} readOnly />
            </div>
            <Button type="button" size="sm" className="mt-3" onClick={() => saveHeader.mutate()} disabled={saveHeader.isPending}><Save className="mr-2 h-4 w-4" />{saveHeader.isPending ? "Saving..." : "Save Header"}</Button>
          </div>
        )}

        <h3 className="text-xl font-bold text-center uppercase tracking-wider mb-10 text-black dark:text-white underline underline-offset-4">
          Equipment Information Record
        </h3>

        <Form {...form}>
          <form className="space-y-12 text-black dark:text-white">
            
            {/* 1. Identification */}
            <section>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b border-muted-foreground pb-1 text-sm text-primary">1. Identification</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <FormField control={form.control} name="nameOfEquipment" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Name of Equipment</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="identificationNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Identification Number</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="modelNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Model Number</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="serialNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Serial Number</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="datePurchased" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Date Purchased</FormLabel>
                    <FormControl><Textarea rows={2} placeholder="e.g. 2021 or 2021-04-01" {...field} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
              </div>
            </section>

            {/* 2. Supplier Info */}
            <section>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b border-muted-foreground pb-1 text-sm text-primary">2. Supplier Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <FormField control={form.control} name="purchasedFromName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Purchased From (Company Name)</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-16 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="purchasedFromAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Address / Contact</FormLabel>
                    <FormControl><Textarea {...field} rows={3} readOnly={!canEdit} className="min-h-20 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
              </div>
            </section>

            {/* 3. Manufacturer Info */}
            <section>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b border-muted-foreground pb-1 text-sm text-primary">3. Manufacturer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <FormField control={form.control} name="manufacturingCompanyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Manufacturing Company Name</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-16 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="manufacturingCompanyAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Address / Country</FormLabel>
                    <FormControl><Textarea {...field} rows={3} readOnly={!canEdit} className="min-h-20 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
              </div>
            </section>

            {/* 4. Physical */}
            <section>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b border-muted-foreground pb-1 text-sm text-primary">4. Physical Characteristics</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                <FormField control={form.control} name="dimensionWidthCm" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Width (cm)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value || ""} readOnly={!canEdit} className="bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="dimensionHeightCm" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Height (cm)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value || ""} readOnly={!canEdit} className="bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="dimensionDepthCm" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Depth (cm)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value || ""} readOnly={!canEdit} className="bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="dimensionsNote" render={({ field }) => (
                  <FormItem onInput={(event) => {
                    const target = event.target;
                    if (target instanceof HTMLTextAreaElement) setDimensionsNoteDraft(target.value);
                  }}>
                    <FormLabel className="font-semibold">Dimensions details / note</FormLabel>
                    <FormControl><Textarea rows={3} placeholder="Example: Cylinder: Ø105 × 406&#10;AHU: 665 × 125 × 110" {...field} readOnly={!canEdit} className="min-h-20 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="weightKg" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Weight (kg)</FormLabel>
                    <FormControl><Input type="text" inputMode="decimal" placeholder="e.g. 1500 kg" {...field} value={weightDraft} onChange={(event) => { setWeightDraft(event.target.value); field.onChange(event.target.value); }} readOnly={!canEdit} className="bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="weightNote" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Weight details / note</FormLabel>
                    <FormControl><Textarea rows={3} placeholder="Example: Cylinder: 1500 kg&#10;AHU: 850 kg" {...field} readOnly={!canEdit} className="min-h-20 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
              </div>
            </section>

            {/* 5. Utilities */}
            <section>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b border-muted-foreground pb-1 text-sm text-primary">5. Utilities Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <FormField control={form.control} name="utilitiesPowerSupply" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Power Supply (V/Hz/Ph/A/kW)</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="utilitiesAir" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">{machineId === 84 && recordNumber === 1 ? "Max output (tab/Hr)" : hasPowerAndAirUtilities(machineId, recordNumber) ? "Air pressure" : hasRotaryTabletPressUtilities(machineId, recordNumber) ? "Maximum Tablet Pressing Force" : "Compressed Air (Bar/CFM)"}</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                {!hasPowerAndAirUtilities(machineId, recordNumber) && <>
                <FormField control={form.control} name="utilitiesWater" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">{machineId === 113 && recordNumber === 1 ? "Humidity" : machineId === 84 && recordNumber === 1 ? "Maximum Turret RPM" : hasRotaryTabletPressUtilities(machineId, recordNumber) ? "Max Pre-Pressure" : hasTabletPressUtilities(machineId, recordNumber) ? "Lubrication system" : "Water (Type/Pressure/Temp)"}</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="utilitiesOther" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">{machineId === 113 && recordNumber === 1 ? "Noise Level" : machineId === 84 && recordNumber === 1 ? "Main Compression Roller Max Pressure" : hasWaterConnection(machineId, recordNumber) ? "Water Connection" : hasCoMillCapacity(machineId, recordNumber) ? "Capacity" : hasLifterCapacity(machineId, recordNumber) ? "Lifter Capacity" : hasBlenderRpm(machineId, recordNumber) ? "Blender RPM" : hasPowlCapacity(machineId, recordNumber) ? "Powl Capacity" : hasProductContainerCapacity(machineId, recordNumber) ? "Product Container Capacity" : hasRotaryTabletPressUtilities(machineId, recordNumber) ? "Maximum Punching Depth" : hasTabletPressUtilities(machineId, recordNumber) ? "Max Tablet size can be Compressed" : hasRollSizeUtility(machineId, recordNumber) ? "Roll Size" : "Other Utilities (Steam/Gas/etc.)"}</FormLabel>
                    <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                  </FormItem>
                )} />
                </>}
              </div>
            </section>

            {/* 6. Notes */}
            <section>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b border-muted-foreground pb-1 text-sm text-primary">6. Safety & Additional Notes</h4>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="safetyIssues" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Safety Issues / Warnings (Left Column)</FormLabel>
                      <FormControl><Textarea {...field} readOnly={!canEdit} placeholder="One issue per line" className="bg-transparent border border-black/20 dark:border-white/20 rounded min-h-[120px] focus-visible:ring-1 focus-visible:border-primary font-mono text-sm resize-none" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="safetyIssuesDetails" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Related Information (Right Column)</FormLabel>
                      <FormControl><Textarea {...field} readOnly={!canEdit} placeholder="Matching detail for each issue on the left" className="bg-transparent border border-black/20 dark:border-white/20 rounded min-h-[120px] focus-visible:ring-1 focus-visible:border-primary font-mono text-sm resize-none" /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="others" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Other Relevant Information (Left Column)</FormLabel>
                      <FormControl><Textarea {...field} readOnly={!canEdit} placeholder="One item per line" className="bg-transparent border border-black/20 dark:border-white/20 rounded min-h-[120px] focus-visible:ring-1 focus-visible:border-primary font-mono text-sm resize-none" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="othersDetails" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Related Information (Right Column)</FormLabel>
                      <FormControl><Textarea {...field} readOnly={!canEdit} placeholder="Matching detail for each line on the left" className="bg-transparent border border-black/20 dark:border-white/20 rounded min-h-[120px] focus-visible:ring-1 focus-visible:border-primary font-mono text-sm resize-none" /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>
            </section>

            {/* Signatures */}
            <section className="pt-8 mt-12 border-t-2 border-black dark:border-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <FormField control={form.control} name="preparedByName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Prepared By Name</FormLabel>
                      <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="preparedByDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Date</FormLabel>
                      <FormControl><Input type="date" {...field} readOnly={!canEdit} className="bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm w-1/2" /></FormControl>
                    </FormItem>
                  )} />
                  <ElectronicSignatureField
                    documentType="EQUIPMENT_INFORMATION"
                    documentId={machineId}
                    fieldName={signatureField("prepared_by")}
                    permissionFieldName="prepared_by"
                    label="Prepared By Electronic Signature"
                  />
                </div>
                <div className="space-y-4">
                  <FormField control={form.control} name="approvedByName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Approved By Name</FormLabel>
                      <FormControl><Textarea {...field} rows={2} readOnly={!canEdit} className="min-h-14 resize-y bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="approvedByDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Date</FormLabel>
                      <FormControl><Input type="date" {...field} readOnly={!canEdit} className="bg-transparent border-t-0 border-x-0 border-b border-black/20 dark:border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm w-1/2" /></FormControl>
                    </FormItem>
                  )} />
                  <ElectronicSignatureField
                    documentType="EQUIPMENT_INFORMATION"
                    documentId={machineId}
                    fieldName={signatureField("approved_by")}
                    permissionFieldName="approved_by"
                    label="Approved By Electronic Signature"
                  />
                </div>
              </div>
            </section>

          </form>
        </Form>
      </div>
    </div>
  );
}
