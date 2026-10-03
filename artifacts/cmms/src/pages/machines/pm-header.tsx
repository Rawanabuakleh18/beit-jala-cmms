import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";

type Header = {
  showServiceArea: boolean; serviceAreaMachineNumber: string | null; serviceAreaLocation: string | null;
  procedureFormNumber: string;
  effectiveDate: string | null;
  department: string | null;
  pmRecordDescription: string | null;
  machineRecordName: string | null;
  machineRecordId: string | null;
  pmRecordTitle: string | null;
  columnsPerRecord: number;
  inspectionColumnsPerPrintPage: number;
};

export default function PmHeaderPage({ params }: { params: { id: string } }) {
  const machineId = Number(params.id);
  const isChiller = [17, 18, 101].includes(machineId);
  const queryClient = useQueryClient();
  const initializedForMachine = useRef<number | null>(null);
  const [form, setForm] = useState<Header>({
    showServiceArea: false,
    serviceAreaMachineNumber: "",
    serviceAreaLocation: "",
    procedureFormNumber: "",
    effectiveDate: "",
    department: "",
    pmRecordDescription: "",
    machineRecordName: "",
    machineRecordId: "",
    pmRecordTitle: "",
    columnsPerRecord: 5,
    inspectionColumnsPerPrintPage: 2,
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["pm-header", machineId],
    queryFn: () => apiRequest<Header>(`/machines/${machineId}/pm/header`),
  });

  useEffect(() => {
    if (!data || initializedForMachine.current === machineId) return;
    setForm(data);
    initializedForMachine.current = machineId;
  }, [data, machineId]);

  const save = useMutation({
    mutationFn: async () => {
      await apiRequest<Header>(`/machines/${machineId}/pm/header`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      const verified = await apiRequest<Header>(`/machines/${machineId}/pm/header`);
      if (verified.showServiceArea !== form.showServiceArea ||
          (verified.serviceAreaMachineNumber ?? "") !== (form.serviceAreaMachineNumber ?? "").trim() ||
          (verified.serviceAreaLocation ?? "") !== (form.serviceAreaLocation ?? "").trim()) {
        throw new Error("The machine number and service area were not saved. Please try again.");
      }
      return verified;
    },
    onSuccess: (savedHeader) => {
      setForm(savedHeader);
      setSaveMessage("Header saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["pm-header", machineId] });
      queryClient.invalidateQueries({ queryKey: ["pm-current", machineId] });
      queryClient.invalidateQueries({ queryKey: ["print-pm-record", machineId] });
    },
    onError: (error) => setSaveMessage(getErrorMessage(error, "Unable to save the header. Please try again.")),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/machines/${machineId}/pm`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit PM Header</h1>
          <p className="text-muted-foreground">Restricted header fields for the official PM record.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header Fields</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Procedure / form number</Label>
            <Input
              value={form.procedureFormNumber}
              onChange={(event) => setForm((current) => ({ ...current, procedureFormNumber: event.target.value }))}
            />
          </div>
          <div>
            <Label>Effective date</Label>
            <Input
              type="date"
              value={form.effectiveDate ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, effectiveDate: event.target.value }))}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              value={form.department ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Label>PM record title</Label>
            <Textarea
              rows={3}
              value={form.pmRecordTitle ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, pmRecordTitle: event.target.value }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">The complete title is filled automatically. Edit any word, name, or ID here as needed for this PM record.</p>
          </div>
          <div>
            <Label>Inspections per PM record / print page</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={form.inspectionColumnsPerPrintPage}
              onChange={(event) => setForm((current) => ({ ...current, inspectionColumnsPerPrintPage: Number(event.target.value) }))}
            />
          </div>
          <div className="md:col-span-2 border-t pt-4 space-y-3">
            <Label className="flex items-center gap-2">
              <input type="checkbox" checked={form.showServiceArea} onChange={event => setForm(current => ({ ...current, showServiceArea: event.target.checked }))} />
              {isChiller ? "Show Chiller ID No. above the checklist" : machineId === 52 ? "Show machine number above the checklist" : "Show machine number and service area above the checklist"}
            </Label>
            <p className="text-xs text-muted-foreground">Applies to this machine only. Printed on the first page only.</p>
            {form.showServiceArea && <div className="grid gap-4 md:grid-cols-2">
              <div><Label htmlFor="service-machine-number">{isChiller ? "Chiller ID No." : "Machine number"}</Label><Input id="service-machine-number" value={form.serviceAreaMachineNumber ?? ""} onChange={event => setForm(current => ({ ...current, serviceAreaMachineNumber: event.target.value }))} /></div>
              {!isChiller && machineId !== 52 && <div><Label htmlFor="service-area">Service area</Label><Input id="service-area" value={form.serviceAreaLocation ?? ""} onChange={event => setForm(current => ({ ...current, serviceAreaLocation: event.target.value }))} /></div>}
            </div>}
          </div>
          <Button type="submit" disabled={save.isPending} className="w-fit">
            <Save className="mr-2 h-4 w-4" />
            {save.isPending ? "Saving..." : "Save Header"}
          </Button>
          <p className="text-sm text-muted-foreground md:col-span-2">هذه الحقول خاصة بسجلات الصيانة الوقائية لهذه الماكينة فقط.</p>
          {saveMessage && <p className={save.isError ? "self-center text-sm text-destructive" : "self-center text-sm text-green-700"}>{saveMessage}</p>}
        </CardContent>
      </Card>
    </form>
  );
}
