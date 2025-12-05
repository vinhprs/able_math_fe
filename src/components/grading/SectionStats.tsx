import { cn } from "@/lib/cn";

interface StatItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface SectionStatsProps {
  stats: StatItem[];
  className?: string;
}

export function SectionStats({ stats, className }: SectionStatsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4",
        className
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            "p-3 rounded-lg border",
            stat.highlight
              ? "bg-primary-50 border-primary-200"
              : "bg-secondary-50 border-secondary-200"
          )}
        >
          <div className="text-xs font-medium text-secondary-600 mb-1">
            {stat.label}
          </div>
          <div
            className={cn(
              "text-lg font-semibold",
              stat.highlight ? "text-primary-700" : "text-secondary-900"
            )}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
