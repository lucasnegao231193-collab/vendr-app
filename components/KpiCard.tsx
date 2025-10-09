/**
 * Card para exibir KPIs no dashboard
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  format?: "currency" | "number" | "percentage" | "text";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  format = "number",
  trend,
  className,
}: KpiCardProps) {
  const formatValue = () => {
    if (typeof value === "string") return value;

    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return `${(value * 100).toFixed(1)}%`;
      case "number":
        return value.toLocaleString("pt-BR");
      default:
        return value;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
            </span>{" "}
            vs. ontem
          </p>
        )}
      </CardContent>
    </Card>
  );
}
