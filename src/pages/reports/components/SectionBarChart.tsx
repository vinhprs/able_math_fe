import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ChartData } from "@/types/reports.types";

interface SectionBarChartProps {
  data: ChartData;
}

/**
 * Get color based on score
 */
function getScoreColor(score: number): string {
  if (score >= 90) return "#10b981"; // green
  if (score >= 80) return "#3b82f6"; // blue
  if (score >= 70) return "#06b6d4"; // cyan
  if (score >= 60) return "#f59e0b"; // orange
  return "#ef4444"; // red
}

/**
 * Transform chart data from backend format to Recharts format
 */
function transformData(chartData: ChartData) {
  return chartData.labels.map((label, index) => {
    const score = chartData.datasets[0]?.data[index] || 0;
    return {
      label,
      value: score,
      color: getScoreColor(score),
    };
  });
}

export function SectionBarChart({ data }: SectionBarChartProps) {
  const chartData = transformData(data);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6 print:border-2">
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 print:border-2">
      <div style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: "Score (%)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Score">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Excellent (≥90%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span>Very Good (80-89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-cyan-500"></div>
          <span>Good (70-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500"></div>
          <span>Fair (60-69%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span>Needs Improvement (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
}
