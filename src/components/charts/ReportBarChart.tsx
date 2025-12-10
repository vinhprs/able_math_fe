import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ChartData } from "@/types/reports.types";

interface ReportBarChartProps {
  title: string;
  data:
    | ChartData
    | {
        type: "bar";
        labels: string[];
        datasets: Array<{
          label: string;
          data: number[];
          backgroundColor: string;
        }>;
      };
  height?: number;
  color?: string;
}

/**
 * Transform chart data from backend format to Recharts format
 */
function transformData(
  chartData:
    | ChartData
    | {
        type: "bar";
        labels: string[];
        datasets: Array<{
          label: string;
          data: number[];
          backgroundColor: string;
        }>;
      }
) {
  const labels = chartData.labels;
  const datasets = chartData.datasets || [];

  // If multiple datasets, combine them
  if (datasets.length > 1) {
    return labels.map((label, index) => {
      const result: Record<string, string | number> = { label };
      datasets.forEach((dataset) => {
        result[dataset.label] = dataset.data[index] || 0;
      });
      return result;
    });
  }

  // Single dataset (backward compatibility)
  return labels.map((label, index) => ({
    label,
    value: datasets[0]?.data[index] || 0,
  }));
}

/**
 * Custom label component for bar values - inside the bar near the top
 */
function CustomBarLabel({ x, y, width, height, value }: any) {
  if (!value || height < 10) return null;
  // Position text inside the bar, near the top (about 10px from top of bar)
  return (
    <text
      x={x + width / 2}
      y={y + 15}
      fill="#ffffff"
      textAnchor="middle"
      fontSize="10"
      fontFamily='"맑은 고딕", "Malgun Gothic", sans-serif'
      dominantBaseline="hanging"
    >
      {Math.round(value)}
    </text>
  );
}

export function ReportBarChart({
  title,
  data,
  height = 300,
  color = "#3b82f6",
}: ReportBarChartProps) {
  const chartData = transformData(data);
  const datasets = data.datasets || [];

  if (chartData.length === 0) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-64 text-secondary-500">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Multiple datasets (for unit performance chart) - Match original design
  if (datasets.length > 1) {
    return (
      <div
        style={{
          width: "100%",
          height: `${height}px`,
          border: "1px solid #000000",
          backgroundColor: "#ffffff",
          fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            margin={{ top: 30, right: 10, left: 40, bottom: 30 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="0"
              stroke="#000000"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8, fill: "#000000" }}
              tickLine={false}
              axisLine={{ stroke: "#000000" }}
              height={30}
              interval={0}
              angle={0}
              textAnchor="middle"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#000000" }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickLine={false}
              axisLine={{ stroke: "#000000" }}
              width={40}
              tickFormatter={(value) => value.toString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #000000",
                borderRadius: "4px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value.toFixed(0)}`, ""]}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "9px",
              }}
              iconType="rect"
              iconSize={10}
              align="center"
            />
            {datasets.map((dataset) => {
              // Ensure backgroundColor is a string (not an array)
              const fillColor = Array.isArray(dataset.backgroundColor)
                ? dataset.backgroundColor[0] || "#3b82f6"
                : dataset.backgroundColor || "#3b82f6";
              return (
                <Bar
                  key={dataset.label}
                  dataKey={dataset.label}
                  fill={fillColor}
                  name={dataset.label}
                  stroke={fillColor}
                  strokeWidth={0}
                  radius={0}
                >
                  <LabelList
                    content={<CustomBarLabel />}
                    position="insideTop"
                  />
                </Bar>
              );
            })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Single dataset (backward compatibility)
  return (
    <Card className="print:break-inside-avoid">
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-secondary-200"
            />
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
            <Legend />
            <Bar
              dataKey="value"
              fill={color}
              radius={[8, 8, 0, 0]}
              name={datasets[0]?.label || "Score"}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
