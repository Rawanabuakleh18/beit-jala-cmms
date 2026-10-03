import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Check, Pencil, Plus, Trash2, X } from "lucide-react";

type Point = {
  id: number;
  pointText: string;
  resultType: "yes_no" | "value" | "text";
  sortOrder: number;
  isActive: boolean;
};

export default function PmChecklistPage({ params }: { params: { id: string } }) {
  const machineId = Number(params.id);
  const queryClient = useQueryClient();
  const [pointText, setPointText] = useState("");
  const [resultType, setResultType] = useState<"yes_no" | "value" | "text">("yes_no");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editType, setEditType] = useState<"yes_no" | "value" | "text">("yes_no");
  const [editOrder, setEditOrder] = useState(1);

  const { data = [] } = useQuery({
    queryKey: ["pm-checklist", machineId],
    queryFn: () => apiRequest<Point[]>(`/machines/${machineId}/pm/checklist`),
  });
  const activePoints = data.filter((point) => point.isActive);

  const createPoint = useMutation({
    mutationFn: () =>
      apiRequest<Point>(`/machines/${machineId}/pm/checklist`, {
        method: "POST",
        body: JSON.stringify({ pointText, resultType }),
      }),
    onSuccess: () => {
      setPointText("");
      queryClient.invalidateQueries({ queryKey: ["pm-checklist", machineId] });
    },
  });

  const deactivatePoint = useMutation({
    mutationFn: (pointId: number) =>
      apiRequest<Point>(`/machines/${machineId}/pm/checklist/${pointId}`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pm-checklist", machineId] }),
  });

  const updatePoint = useMutation({
    mutationFn: (pointId: number) =>
      apiRequest<Point>(`/machines/${machineId}/pm/checklist/${pointId}`, {
        method: "PUT",
        body: JSON.stringify({ pointText: editText, resultType: editType, sortOrder: editOrder }),
      }),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["pm-checklist", machineId] });
    },
  });

  function startEditing(point: Point) {
    setEditingId(point.id);
    setEditText(point.pointText);
    setEditType(point.resultType);
    setEditOrder(point.sortOrder);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    createPoint.mutate();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/machines/${machineId}/pm`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Checklist Points</h1>
          <p className="text-muted-foreground">Inactive points are preserved for historical PM records.</p>
        </div>
      </div>

      <form onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle>Add Checklist Point</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
            <div>
              <Label>Checklist point</Label>
              <Input value={pointText} onChange={(event) => setPointText(event.target.value)} required />
            </div>
            <div>
              <Label>Result type</Label>
              <Select value={resultType} onValueChange={(value) => setResultType(value as typeof resultType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">نعم / لا (Yes / No)</SelectItem>
                  <SelectItem value="text">Text / Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createPoint.isPending || !pointText.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Checklist Point</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePoints.map((point) => (
                <TableRow key={point.id}>
                  <TableCell className="w-24">
                    {editingId === point.id ? (
                      <Input
                        type="number"
                        min={1}
                        value={editOrder}
                        onChange={(event) => setEditOrder(Number(event.target.value))}
                        aria-label="Checklist point order"
                      />
                    ) : point.sortOrder}
                  </TableCell>
                  <TableCell>
                    {editingId === point.id ? (
                      <Input value={editText} onChange={(event) => setEditText(event.target.value)} autoFocus />
                    ) : point.pointText}
                  </TableCell>
                  <TableCell className="w-44">
                    {editingId === point.id ? (
                      <Select value={editType} onValueChange={(value) => setEditType(value as typeof editType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes_no">نعم / لا</SelectItem>
                          <SelectItem value="text">Text / Value</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : point.resultType}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === point.id ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={updatePoint.isPending || !editText.trim()}
                          onClick={() => updatePoint.mutate(point.id)}
                          aria-label="Save checklist point"
                        ><Check className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} aria-label="Cancel editing">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEditing(point)} aria-label="Edit checklist point">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deactivatePoint.mutate(point.id)} aria-label="Delete checklist point">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
