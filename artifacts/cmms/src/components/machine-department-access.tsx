import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function MachineDepartmentAccess({ userId, isAdmin, departments }: {
  userId: number; isAdmin: boolean; departments: { id: number; name: string }[];
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const key = ["user-machine-access", userId];
  const access = useQuery({ queryKey: key, queryFn: () => apiRequest<{ departmentIds: number[] | null }>(`/users/${userId}/machine-access`) });
  const [ids, setIds] = useState<number[] | null>([]);
  useEffect(() => { if (access.data) setIds(access.data.departmentIds); }, [access.data]);
  const save = useMutation({
    mutationFn: () => apiRequest(`/users/${userId}/machine-access`, { method: "PUT", body: JSON.stringify({ departmentIds: ids }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: key }); toast({ title: "تم حفظ أقسام الماكينات المسموحة" }); },
    onError: () => toast({ title: "تعذر حفظ صلاحية الأقسام", variant: "destructive" }),
  });
  return <Card dir="rtl">
    <CardHeader><CardTitle>أقسام الماكينات المسموحة</CardTitle><CardDescription>يظهر للحساب فقط ماكينات الأقسام المحددة وطلباتها وخططها وسجلاتها وتقاريرها. صلاحيات العمل والتعديل تبقى حسب الخيارات الأخرى.</CardDescription></CardHeader>
    <CardContent className="space-y-4">
      {isAdmin ? <p className="text-sm">حساب Admin لديه وصول إلى جميع الأقسام.</p> : <>
        {access.isError && <p role="alert" className="text-destructive">تعذر تحميل الصلاحية. <Button variant="outline" onClick={() => access.refetch()}>إعادة المحاولة</Button></p>}
        <label className="flex items-center gap-3"><Checkbox disabled={!access.data || save.isPending} checked={ids === null} onCheckedChange={(checked) => setIds(checked === true ? null : [])} />جميع الأقسام (يشمل الماكينات غير المرتبطة بقسم)</label>
        <div className="grid gap-3 sm:grid-cols-2">{departments.map((department) => <label key={department.id} className="flex items-center gap-3 rounded-md border p-3">
          <Checkbox disabled={ids === null || !access.data || save.isPending} checked={ids === null || ids.includes(department.id)} onCheckedChange={(checked) => setIds((current) => checked === true ? [...(current ?? []), department.id] : (current ?? []).filter((id) => id !== department.id))} />{department.name}
        </label>)}</div>
        {ids?.length === 0 && <p className="text-sm text-muted-foreground">لم يتم تحديد أقسام؛ لن تظهر أي ماكينات لهذا الحساب.</p>}
        <Button type="button" disabled={!access.data || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "جارٍ الحفظ..." : "حفظ صلاحية أقسام الماكينات"}</Button>
      </>}
    </CardContent>
  </Card>;
}
