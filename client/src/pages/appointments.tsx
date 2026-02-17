import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertAppointmentSchema, type Appointment, type Patient, type Department } from "@shared/schema";
import { z } from "zod";

const appointmentFormSchema = insertAppointmentSchema.extend({
  patientId: z.string().min(1, "Patient is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  date: z.string().min(1, "Date is required"),
});

export default function Appointments() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: appointments, isLoading } = useQuery<(Appointment & { patientName: string })[]>({
    queryKey: ["/api/appointments"],
  });
  const { data: patients } = useQuery<Patient[]>({ queryKey: ["/api/patients"] });
  const { data: departments } = useQuery<Department[]>({ queryKey: ["/api/departments"] });

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: "",
      doctorName: "",
      departmentId: "",
      date: "",
      status: "scheduled",
      notes: "",
      type: "consultation",
      duration: 30,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof appointmentFormSchema>) => {
      const res = await apiRequest("POST", "/api/appointments", {
        ...data,
        date: new Date(data.date).toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Appointment created successfully" });
      form.reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const filtered = (appointments ?? []).filter((a) =>
    statusFilter === "all" ? true : a.status === statusFilter
  );

  const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    no_show: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-appointments-title">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule and manage appointments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-appointment">
              <Plus className="w-4 h-4 mr-2" /> New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                <FormField control={form.control} name="patientId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-patient"><SelectValue placeholder="Select patient" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(patients ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="doctorName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor Name</FormLabel>
                    <FormControl><Input {...field} data-testid="input-doctor-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} data-testid="input-appointment-date" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "consultation"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="follow_up">Follow-up</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                          <SelectItem value="lab_test">Lab Test</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="departmentId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-dept"><SelectValue placeholder="Select department" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(departments ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} value={field.value ?? 30} data-testid="input-duration" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl><Input {...field} value={field.value ?? ""} data-testid="input-notes" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-appointment">
                  {createMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["all", "scheduled", "completed", "cancelled", "no_show"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            data-testid={`button-filter-${s}`}
          >
            {s === "no_show" ? "No Show" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">No appointments found</p>
            <p className="text-sm text-muted-foreground mt-1">Schedule a new appointment to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-appointments">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Patient</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Doctor</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Duration</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((appt) => (
                    <tr key={appt.id} className="border-b last:border-b-0">
                      <td className="py-3 px-4 font-medium">{appt.patientName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{appt.doctorName}</td>
                      <td className="py-3 px-4 text-muted-foreground capitalize">{(appt.type ?? "").replace("_", " ")}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                        {new Date(appt.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{appt.duration} min</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[appt.status ?? "scheduled"]}`}>
                          {appt.status === "no_show" ? "No Show" : appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {appt.status === "scheduled" && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "completed" })}
                              data-testid={`button-complete-${appt.id}`}
                            >
                              Complete
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "cancelled" })}
                              data-testid={`button-cancel-${appt.id}`}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
