import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../contexts/AuthContext";
import { 
  useCreateMachine, 
  useUpdateMachine, 
  useGetMachine, 
  useGetDepartments,
  getGetMachineQueryKey 
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-message";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const machineSchema = z.object({
  machineNumber: z.string().min(1, "Machine number is required"),
  machineName: z.string().min(1, "Machine name is required"),
  departmentId: z.preprocess(
    (value) => value === "" || value === "none" || value == null ? null : Number(value),
    z.number().int().positive().nullable().optional(),
  ),
  location: z.string().optional(),
  status: z.string().default("Active"),
  pmFrequencyMonths: z.coerce.number().min(1, "Must be at least 1").optional().nullable(),
  pmStartDate: z.string().optional().nullable(),
});

type MachineFormValues = z.infer<typeof machineSchema>;

export default function MachineForm({ params }: { params?: { id: string } }) {
  const isEditing = !!params?.id && params.id !== "new";
  const machineId = isEditing ? parseInt(params.id as string, 10) : undefined;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments } = useGetDepartments({ query: { queryKey: ["departments"] } });
  
  const { data: machineData, isLoading: isLoadingMachine } = useGetMachine(
    machineId!, 
    { query: { enabled: isEditing, queryKey: getGetMachineQueryKey(machineId!), refetchOnMount: "always" } }
  );

  const createMutation = useCreateMachine();
  const updateMutation = useUpdateMachine();
  const [pendingValues, setPendingValues] = useState<MachineFormValues | null>(null);
  const [planYear, setPlanYear] = useState(new Date().getFullYear());

  const form = useForm<MachineFormValues>({
    resolver: zodResolver(machineSchema),
    defaultValues: {
      machineNumber: "",
      machineName: "",
      departmentId: null,
      location: "",
      status: "Active",
      pmFrequencyMonths: 6,
      pmStartDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (isEditing && machineData) {
      form.reset({
        machineNumber: machineData.machineNumber,
        machineName: machineData.machineName,
        departmentId: machineData.departmentId,
        location: machineData.location || "",
        status: machineData.status,
        pmFrequencyMonths: machineData.pmFrequencyMonths,
        pmStartDate: machineData.pmStartDate ? machineData.pmStartDate.split('T')[0] : "",
      });
    }
  }, [isEditing, machineData, form]);

  useEffect(() => {
    if (isEditing || !departments?.length || form.getValues("departmentId")) return;
    const savedDepartmentId = Number(window.localStorage.getItem("cmms:last-machine-department-id"));
    if (Number.isInteger(savedDepartmentId) && departments.some((department) => department.id === savedDepartmentId)) {
      form.setValue("departmentId", savedDepartmentId);
    }
  }, [departments, form, isEditing]);

  const onSubmit = (values: MachineFormValues, applyToPlan?: boolean) => {
    const scheduleChanged = isEditing && machineData &&
      ((values.pmStartDate || null) !== (machineData.pmStartDate?.split('T')[0] || null) ||
       (values.pmFrequencyMonths || null) !== machineData.pmFrequencyMonths);
    if (scheduleChanged && applyToPlan === undefined) {
      setPlanYear(Number(values.pmStartDate?.slice(0, 4)) || new Date().getFullYear());
      setPendingValues(values);
      return;
    }
    // Clean up empty strings to nulls for API
    const payload = {
      ...values,
      departmentId: values.departmentId || null,
      pmFrequencyMonths: values.pmFrequencyMonths || null,
      pmStartDate: values.pmStartDate || null,
      ...(isEditing ? { applyPmScheduleToPlanYear: applyToPlan ? planYear : null } : {}),
    };

    if (isEditing && machineId) {
      updateMutation.mutate(
        { id: machineId, data: payload },
        {
          onSuccess: (data) => {
            setPendingValues(null);
            queryClient.invalidateQueries();
            queryClient.invalidateQueries({ queryKey: ["machines"] });
            queryClient.setQueryData(getGetMachineQueryKey(machineId), data);
            toast({
              title: "Machine updated",
              description: `Successfully updated ${data.machineName}.`,
            });
            setLocation(`/machines/${machineId}`);
          },
          onError: (error) => {
            toast({
              variant: "destructive",
              title: "Failed to update machine",
              description: getErrorMessage(error, "An unexpected error occurred."),
            });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["machines"] });
            toast({
              title: "Machine created",
              description: `Successfully created ${data.machineName}.`,
            });
            setLocation(`/machines/${data.id}`);
          },
          onError: (error) => {
            toast({
              variant: "destructive",
              title: "Failed to create machine",
              description: getErrorMessage(error, "An unexpected error occurred."),
            });
          }
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingMachine) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <Dialog open={pendingValues !== null} onOpenChange={(open) => { if (!open && !isPending) setPendingValues(null); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تطبيق تغيير موعد الصيانة على الخطة؟</DialogTitle>
            <DialogDescription>يمكن حفظ معلومات الماكينة فقط، أو تطبيق تاريخ البداية والتكرار على خطة السنة المختارة وخططها الشهرية. تبقى الصيانات المنفذة محفوظة.</DialogDescription>
          </DialogHeader>
          <label htmlFor="pm-plan-year">سنة الخطة</label>
          <Input id="pm-plan-year" type="number" min={2000} max={2100} value={planYear} onChange={event => setPlanYear(Number(event.target.value))} />
          <div className="flex flex-wrap gap-2">
            <Button disabled={isPending || !Number.isInteger(planYear) || planYear < 2000 || planYear > 2100 || !pendingValues?.pmStartDate || !pendingValues?.pmFrequencyMonths} onClick={() => pendingValues && onSubmit(pendingValues, true)}>حفظ وتطبيق على الخطة</Button>
            <Button variant="outline" disabled={isPending} onClick={() => pendingValues && onSubmit(pendingValues, false)}>حفظ معلومات الماكينة فقط</Button>
            <Button variant="ghost" disabled={isPending} onClick={() => setPendingValues(null)}>رجوع</Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={isEditing ? `/machines/${machineId}` : "/machines"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? `Edit Machine: ${machineData?.machineNumber}` : "Register New Machine"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? "Update machine identification and status." : "Enter details for the new equipment."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(values => onSubmit(values))} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Identification</CardTitle>
              <CardDescription>Primary identifiers for the equipment</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="machineNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine ID / Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. MIX-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="machineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. High Shear Mixer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        const departmentId = val === "none" ? null : Number(val);
                        field.onChange(departmentId);
                        if (departmentId) {
                          window.localStorage.setItem("cmms:last-machine-department-id", String(departmentId));
                        } else {
                          window.localStorage.removeItem("cmms:last-machine-department-id");
                        }
                      }}
                      value={(field.value ?? machineData?.departmentId)?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Room 102, Building B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operational Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preventive Maintenance Schedule</CardTitle>
              <CardDescription>Base scheduling parameters for PM generation</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="pmFrequencyMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PM Frequency (Months)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pmStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PM Cycle Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild type="button">
              <Link href={isEditing ? `/machines/${machineId}` : "/machines"}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Machine" : "Register Machine"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
