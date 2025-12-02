import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ChartData } from '@/types/reports.types';

interface ReportRadarChartProps {
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

export function ReportRadarChart({
  title,
  data,
  height = 400,
  color = '#8b5cf6',
}: ReportRadarChartProps) {
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
          <RechartsRadarChart data={chartData}>
            <PolarGrid className="stroke-secondary-200" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              className="fill-secondary-700"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              className="fill-secondary-500"
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
            <Radar
              name={data.datasets[0]?.label || 'Score'}
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.6}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

