import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGetMachinesQueryKey, useGetMachines } from "@workspace/api-client-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Server, AlertCircle, Archive, ArchiveRestore, Eye, List, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { compareMachinesForSerial, machineSerialMap } from "@/lib/machine-serial";

export default function MachinesList() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const machineParams = debouncedSearch || showArchived
    ? { ...(debouncedSearch ? { search: debouncedSearch } : {}), ...(showArchived ? { archived: true } : {}) }
    : undefined;
  const { data: machineResults, isLoading, isError } = useGetMachines(machineParams, {
    query: {
      queryKey: getGetMachinesQueryKey(machineParams),
      enabled: true
    },
  });
  const { data: activeAccessibleMachines = [] } = useGetMachines(undefined, {
    query: { queryKey: getGetMachinesQueryKey(undefined) },
  });
  const departmentNames = [...new Set(
    [...activeAccessibleMachines, ...(machineResults ?? [])]
      .map((machine) => machine.departmentName || t('common_extra.unassigned')),
  )].sort((left, right) => left.localeCompare(right));
  const serialByMachineId = machineSerialMap(activeAccessibleMachines);
  const machines = machineResults ? machineResults
    .filter((machine) => departmentFilter === "all" || (machine.departmentName || t('common_extra.unassigned')) === departmentFilter)
    .sort(compareMachinesForSerial) : undefined;
  const permanentDelete = useMutation({
    mutationFn: (id: number) => apiRequest(`/machines/${id}/permanent`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      toast({ title: isArabic ? "تم حذف الماكينة نهائياً" : "Machine permanently deleted" });
    },
    onError: (error) => toast({
      variant: "destructive",
      title: isArabic ? "تعذر حذف الماكينة" : "Could not delete machine",
      description: error instanceof Error ? error.message : (isArabic ? "حدث خطأ غير متوقع" : "Unexpected error"),
    }),
  });
  const restoreMachine = useMutation({
    mutationFn: (id: number) => apiRequest(`/machines/${id}/restore`, { method: "PATCH" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      toast({ title: isArabic ? "تم استرجاع الماكينة" : "Machine restored" });
    },
    onError: (error) => toast({
      variant: "destructive",
      title: isArabic ? "تعذر استرجاع الماكينة" : "Could not restore machine",
      description: error instanceof Error ? error.message : (isArabic ? "حدث خطأ غير متوقع" : "Unexpected error"),
    }),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">Active</Badge>;
      case "Maintenance":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">Maintenance</Badge>;
      case "Inactive":
        return <Badge variant="secondary" className="text-muted-foreground">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('machines.title')}</h1>
          <p className="text-muted-foreground">{t('machines.subtitle')}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowArchived((current) => !current)}>
            {showArchived ? <List className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
            {showArchived ? "Active Machines" : "Archived Machines"}
          </Button>
          {hasPermission("create_machine") && (
            <Button asChild>
              <Link href="/machines/new">
                <Plus className="mr-2 h-4 w-4" />
                {t('machines.addNew')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('machines.searchPlaceholder')}
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          aria-label={isArabic ? "فلترة حسب القسم" : "Filter by department"}
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
          className="flex h-10 min-w-56 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">{isArabic ? "كل الأقسام المسموحة" : "All allowed departments"}</option>
          {departmentNames.map((department) => <option key={department} value={department}>{department}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table dir={isArabic ? "rtl" : "ltr"} className="w-full table-fixed">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[14%]" />
            <col className="w-[20%]" />
            <col className="w-[18%]" />
            <col className="w-[17%]" />
            <col className="w-[11%]" />
            <col className="w-[14%]" />
          </colgroup>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center">No.</TableHead>
              <TableHead className="text-center">{t('machines.idNumber')}</TableHead>
              <TableHead className="text-center">{t('machines.machineName')}</TableHead>
              <TableHead className="text-center">{t('machines.department')}</TableHead>
              <TableHead className="text-center">{t('machines.location')}</TableHead>
              <TableHead className="text-center">{t('machines.status')}</TableHead>
              <TableHead className="text-center">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-8" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-16" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-48" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-32" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-24" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-8 w-16" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-destructive">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>{t('machines.failedToLoad')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : machines?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Server className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-lg font-medium text-foreground">{t('machines.noMachines')}</p>
                    <p className="text-sm">{t('machines.adjustSearch')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              machines?.map((machine) => (
                <TableRow key={machine.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center font-medium">{serialByMachineId.get(machine.id) ?? "—"}</TableCell>
                  <TableCell className="font-mono text-center text-sm">{machine.machineNumber}</TableCell>
                  <TableCell className="break-words text-center font-medium text-primary">{machine.machineName}</TableCell>
                  <TableCell className="break-words text-center">{machine.departmentName || t('common_extra.unassigned')}</TableCell>
                  <TableCell className="break-words text-center text-muted-foreground">{machine.location || "—"}</TableCell>
                  <TableCell className="text-center">{machine.deletedAt ? <Badge variant="secondary">Archived</Badge> : getStatusBadge(machine.status)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      {showArchived ? (
                        <Button variant="ghost" size="icon" asChild title={t('machines.viewProfile')} aria-label={t('machines.viewProfile')}>
                          <Link href={`/machines/${machine.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/machines/${machine.id}`}>{t('machines.viewProfile')}</Link>
                        </Button>
                      )}
                      {showArchived && hasPermission("soft_delete_machine") && (
                        <Button variant="ghost" size="icon" className="text-emerald-600" title={isArabic ? "استرجاع" : "Restore"} aria-label={isArabic ? "استرجاع" : "Restore"} disabled={restoreMachine.isPending} onClick={() => restoreMachine.mutate(machine.id)}>
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                      )}
                      {showArchived && user?.roleName === "Admin" && <Button variant="ghost" size="icon" className="text-destructive" disabled={permanentDelete.isPending} title={isArabic ? "حذف نهائي" : "Delete permanently"} aria-label={isArabic ? "حذف نهائي" : "Delete permanently"} onClick={() => { if (window.confirm(isArabic ? `حذف ${machine.machineName} وكل سجلاتها وطلباتها نهائياً؟ لا يمكن التراجع.` : `Permanently delete ${machine.machineName} and all of its records and requests? This cannot be undone.`)) permanentDelete.mutate(machine.id); }}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
