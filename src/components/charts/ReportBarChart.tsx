import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ChartData } from '@/types/reports.types';

interface ReportBarChartProps {
  title: string;
  data: ChartData;
  height?: number;
  color?: string;
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

export function ReportBarChart({
  title,
  data,
  height = 300,
  color = '#3b82f6',
}: ReportBarChartProps) {
  const chartData = transformData(data);

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
          <RechartsBarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-secondary-200" />
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
              label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
            />
            <Legend />
            <Bar
              dataKey="value"
              fill={color}
              radius={[8, 8, 0, 0]}
              name={data.datasets[0]?.label || 'Score'}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

