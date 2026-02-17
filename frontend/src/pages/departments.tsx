import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, Users } from "lucide-react";
import type { Department } from "@shared/types";

export default function Departments() {
  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-departments-title">Departments</h1>
        <p className="text-sm text-muted-foreground mt-1">Hospital departments overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-28 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (departments ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">No departments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(departments ?? []).map((dept) => (
            <Card key={dept.id} className="hover-elevate" data-testid={`card-department-${dept.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: dept.color ?? "#0EA5E9" }}
                      />
                      <p className="font-medium truncate">{dept.name}</p>
                    </div>
                    {dept.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{dept.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  {dept.headDoctor && (
                    <span className="text-muted-foreground">
                      Head: <span className="font-medium text-foreground">{dept.headDoctor}</span>
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{dept.patientCount ?? 0} patients</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
