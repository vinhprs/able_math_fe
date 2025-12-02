import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data?: { grade: string; count: number }[];
}

export function BarChart({ data = [] }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="grade" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#3b82f6" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

