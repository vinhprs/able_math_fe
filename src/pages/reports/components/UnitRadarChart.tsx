import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartData } from "@/types/reports.types";

interface UnitRadarChartProps {
  data: ChartData;
}

/**
 * Transform chart data from backend format to Recharts format
 */
function transformData(chartData: ChartData) {
  return chartData.labels.map((label, index) => ({
    label,
    value: chartData.datasets[0]?.data[index] || 0,
  }));
}

export function UnitRadarChart({ data }: UnitRadarChartProps) {
  const chartData = transformData(data);

  if (!data || data.labels.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border p-6 text-center text-gray-500">
        No unit data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 print:border-2">
      <h4 className="font-semibold mb-4 text-center text-gray-700">
        Unit Balance Chart
      </h4>
      <div style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={chartData}>
            <PolarGrid className="stroke-gray-200" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              className="fill-gray-700"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              className="fill-gray-500"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
