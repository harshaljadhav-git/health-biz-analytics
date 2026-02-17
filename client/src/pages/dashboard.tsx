import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { Users, CalendarDays, DollarSign, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import type { Patient, Appointment, Department, AnalyticsSnapshot } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalPatients: number;
    totalAppointments: number;
    completedAppointments: number;
    revenue: number;
    patientGrowth: string;
    appointmentGrowth: string;
  }>({ queryKey: ["/api/stats"] });

  const { data: recentAppointments, isLoading: appointmentsLoading } = useQuery<(Appointment & { patientName: string })[]>({
    queryKey: ["/api/appointments/recent"],
  });

  const { data: departments, isLoading: depsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<AnalyticsSnapshot[]>({
    queryKey: ["/api/analytics/monthly"],
  });

  const chartColors = [
    "hsl(201, 89%, 48%)",
    "hsl(173, 58%, 39%)",
    "hsl(43, 74%, 49%)",
    "hsl(27, 87%, 52%)",
    "hsl(197, 37%, 42%)",
  ];

  const statusColor: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    no_show: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your healthcare facility</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Patients"
              value={stats?.totalPatients ?? 0}
              change={stats?.patientGrowth ?? "+0%"}
              changeType="positive"
              icon={Users}
              testId="card-stat-patients"
            />
            <StatCard
              title="Appointments"
              value={stats?.totalAppointments ?? 0}
              change={stats?.appointmentGrowth ?? "+0%"}
              changeType="positive"
              icon={CalendarDays}
              testId="card-stat-appointments"
            />
            <StatCard
              title="Completed"
              value={stats?.completedAppointments ?? 0}
              change="This month"
              changeType="neutral"
              icon={Activity}
              testId="card-stat-completed"
            />
            <StatCard
              title="Revenue"
              value={`$${(stats?.revenue ?? 0).toLocaleString()}`}
              change="+12.5% from last month"
              changeType="positive"
              icon={DollarSign}
              testId="card-stat-revenue"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-base font-medium">Patient Admissions</CardTitle>
            <Badge variant="secondary" className="text-xs">Last 6 months</Badge>
          </CardHeader>
          <CardContent className="pt-2">
            {monthlyLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyData ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(201, 89%, 48%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(201, 89%, 48%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 85%)" strokeOpacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 98%)",
                      border: "1px solid hsl(0, 0%, 90%)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="totalPatients" stroke="hsl(201, 89%, 48%)" fill="url(#colorPatients)" strokeWidth={2} name="Patients" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-base font-medium">Departments</CardTitle>
            <Link href="/departments">
              <Button variant="ghost" size="sm" data-testid="button-view-departments">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {depsLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={departments ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="patientCount"
                    nameKey="name"
                  >
                    {(departments ?? []).map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 98%)",
                      border: "1px solid hsl(0, 0%, 90%)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
          <CardTitle className="text-base font-medium">Recent Appointments</CardTitle>
          <Link href="/appointments">
            <Button variant="ghost" size="sm" data-testid="button-view-appointments">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-recent-appointments">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Patient</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Doctor</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Type</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentAppointments ?? []).map((appt) => (
                    <tr key={appt.id} className="border-b last:border-b-0">
                      <td className="py-3 px-2 font-medium">{appt.patientName}</td>
                      <td className="py-3 px-2 text-muted-foreground">{appt.doctorName}</td>
                      <td className="py-3 px-2 text-muted-foreground capitalize">{appt.type}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusColor[appt.status ?? "scheduled"]}`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
