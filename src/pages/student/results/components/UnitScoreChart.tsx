import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface UnitScoreChartProps {
  unitScores: Array<{
    unitName: string;
    totalScore: number;
    maxScore: number;
    questionCount: number;
    standardScore: number;
  }>;
}

export function UnitScoreChart({ unitScores }: UnitScoreChartProps) {
  const chartData = unitScores.map((unit) => ({
    name: unit.unitName,
    score: Math.round(unit.standardScore),
    raw: unit.totalScore,
    max: unit.maxScore,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 border rounded shadow-lg">
                  <p className="font-bold">{data.name}</p>
                  <p className="text-sm text-secondary-600">
                    Score: {data.raw} / {data.max} ({data.score}%)
                  </p>
                </div>
              );
            }}
          />
          <Legend />
          <Bar dataKey="score" fill="#3b82f6" name="Standard Score (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

