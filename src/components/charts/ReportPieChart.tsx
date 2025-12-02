import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ChartData } from '@/types/reports.types';

interface ReportPieChartProps {
  title: string;
  data: ChartData;
  height?: number;
  colors?: string[];
}

/**
 * Transform chart data from backend format to Recharts format
 */
function transformData(chartData: ChartData) {
  return chartData.labels.map((label, index) => ({
    name: label,
    value: chartData.datasets[0]?.data[index] || 0,
  }));
}

const DEFAULT_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export function ReportPieChart({
  title,
  data,
  height = 300,
  colors = DEFAULT_COLORS,
}: ReportPieChartProps) {
  const chartData = transformData(data);
  const chartColors = data.datasets[0]?.backgroundColor
    ? Array.isArray(data.datasets[0].backgroundColor)
      ? data.datasets[0].backgroundColor
      : [data.datasets[0].backgroundColor]
    : colors;

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-secondary-500">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
            />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

