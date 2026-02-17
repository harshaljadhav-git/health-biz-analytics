import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
} from "recharts";
import type { AnalyticsSnapshot, Department } from "@shared/types";

export default function Analytics() {
  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<AnalyticsSnapshot[]>({
    queryKey: ["/api/analytics/monthly"],
  });

  const { data: departments, isLoading: depsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const chartColors = [
    "hsl(201, 89%, 48%)",
    "hsl(173, 58%, 39%)",
    "hsl(43, 74%, 49%)",
    "hsl(27, 87%, 52%)",
    "hsl(197, 37%, 42%)",
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(0, 0%, 98%)",
    border: "1px solid hsl(0, 0%, 90%)",
    borderRadius: "6px",
    fontSize: "12px",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-analytics-title">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">In-depth performance metrics and trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
            <Badge variant="secondary" className="text-xs">Monthly</Badge>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData ?? []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(173, 58%, 39%)" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-base font-medium">Appointments vs Patients</CardTitle>
            <Badge variant="secondary" className="text-xs">Monthly</Badge>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData ?? []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="totalPatients" name="Patients" fill="hsl(201, 89%, 48%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalAppointments" name="Appointments" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-base font-medium">Satisfaction Score</CardTitle>
            <Badge variant="secondary" className="text-xs">Trend</Badge>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData ?? []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" domain={[0, 5]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="satisfactionScore" name="Score" stroke="hsl(43, 74%, 49%)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-base font-medium">Patient Distribution</CardTitle>
            <Badge variant="secondary" className="text-xs">By Department</Badge>
          </CardHeader>
          <CardContent>
            {depsLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={(departments ?? []).map((d) => ({ name: d.name, value: d.patientCount ?? 0 }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(departments ?? []).map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
