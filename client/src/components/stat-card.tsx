import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  testId?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor = "text-primary", testId }: StatCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-semibold tracking-tight" data-testid={testId ? `${testId}-value` : undefined}>{value}</p>
            {change && (
              <p className={`text-xs font-medium ${changeType === "positive" ? "text-emerald-600 dark:text-emerald-400" : changeType === "negative" ? "text-red-500 dark:text-red-400" : "text-muted-foreground"}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
