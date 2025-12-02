import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data?: { date: string; count?: number; score?: number }[];
}

export function LineChart({ data = [] }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        <p>No data available</p>
      </div>
    );
  }

  const dataKey = data[0]?.count !== undefined ? "count" : "score";

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#3b82f6"
          strokeWidth={2}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

