import type { ComponentType } from "react";
import { cn } from "@/lib/cn";

export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
  onClick,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-secondary-200 p-6",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-secondary-900">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-sm mt-2 flex items-center gap-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </p>
          )}
        </div>
        <div className="bg-primary-100 p-3 rounded-lg">
          <Icon className="w-8 h-8 text-primary-600" />
        </div>
      </div>
    </div>
  );
}

