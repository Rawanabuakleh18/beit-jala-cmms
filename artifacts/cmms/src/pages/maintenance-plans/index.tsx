import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Table2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function MaintenancePlansPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { hasPermission } = useAuth();
  const canViewAnnual = hasPermission("view_annual_maintenance_plan");
  const canViewMonthly = hasPermission("view_monthly_maintenance_plan");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Plans</h1>
        <p className="text-muted-foreground">Annual and Monthly Preventive Maintenance official forms.</p>
      </div>

      <div className="w-28 space-y-1.5">
        <label htmlFor="maintenance-plan-year" className="text-sm font-medium">Year</label>
        <input
          id="maintenance-plan-year"
          type="number"
          min="2000"
          max="2100"
          value={selectedYear}
          onChange={(event) => setSelectedYear(Number(event.target.value) || currentYear)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {canViewAnnual && <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table2 className="h-5 w-5 text-primary" />
              Annual Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">FORM-10-1025 schedule generated from machine PM start date and frequency.</p>
            <Button asChild>
              <Link href={`/maintenance-plans/annual/${selectedYear}`}>Open / Create {selectedYear}</Link>
            </Button>
          </CardContent>
        </Card>}

        {canViewMonthly && <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Monthly Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">FORM-10-0117 monthly program derived from the Annual Plan.</p>
            <div className="flex items-center gap-2">
              <input type="hidden" value={selectedYear} readOnly />
              <Button asChild variant="outline">
                <Link href={`/maintenance-plans/monthly/${selectedYear}`}>Select Month · {selectedYear}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>}
      </div>
    </div>
  );
}
