import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface StatisticsViewProps {
  questions: any[];
  unitScores: Array<{
    unitName: string;
    totalScore: number;
    maxScore: number;
    questionCount: number;
    standardScore: number;
  }>;
}

export function StatisticsView({ questions, unitScores }: StatisticsViewProps) {
  const byDifficulty = {
    HIGH: questions.filter((q) => q.difficulty === 'HIGH'),
    MEDIUM: questions.filter((q) => q.difficulty === 'MEDIUM'),
    LOW: questions.filter((q) => q.difficulty === 'LOW'),
  };

  return (
    <div className="space-y-6">
      {/* By Difficulty */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Performance by Difficulty</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(byDifficulty).map(([level, qs]) => {
            const correct = qs.filter((q) => q.isCorrect).length;
            const accuracy = qs.length > 0 ? (correct / qs.length) * 100 : 0;

            return (
              <div key={level} className="p-4 border border-secondary-200 rounded-lg">
                <Badge
                  variant={
                    level === 'HIGH'
                      ? 'danger'
                      : level === 'MEDIUM'
                        ? 'warning'
                        : 'success'
                  }
                  className="mb-3"
                >
                  {level}
                </Badge>
                <p className="text-3xl font-bold">{Math.round(accuracy)}%</p>
                <p className="text-sm text-secondary-500 mt-1">
                  {correct} of {qs.length} correct
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* By Unit */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Performance by Unit</h3>
        <div className="space-y-3">
          {unitScores.map((unit) => (
            <div key={unit.unitName} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{unit.unitName}</span>
                  <span className="text-sm font-medium">
                    {Math.round(unit.standardScore)}%
                  </span>
                </div>
                <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all"
                    style={{ width: `${unit.standardScore}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

