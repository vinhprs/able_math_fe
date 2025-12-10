interface Question {
  unitName?: string;
  score: number;
}

interface ScoreDistributionTableProps {
  questions: Question[];
  targetScore?: number;
}

export function ScoreDistributionTable({
  questions,
  targetScore = 100,
}: ScoreDistributionTableProps) {
  // Calculate distribution by unit
  const distribution = questions.reduce((acc, q) => {
    const unit = q.unitName || "Unassigned";
    if (!acc[unit]) {
      acc[unit] = { totalScore: 0, count: 0 };
    }
    acc[unit].totalScore += q.score || 0;
    acc[unit].count += 1;
    return acc;
  }, {} as Record<string, { totalScore: number; count: number }>);

  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);

  if (Object.keys(distribution).length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-secondary-200">
            <th className="text-left py-2 px-4 font-semibold text-secondary-700">
              Unit
            </th>
            <th className="text-right py-2 px-4 font-semibold text-secondary-700">
              Questions
            </th>
            <th className="text-right py-2 px-4 font-semibold text-secondary-700">
              Total Score
            </th>
            <th className="text-right py-2 px-4 font-semibold text-secondary-700">
              Percentage
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(distribution)
            .sort((a, b) => b[1].totalScore - a[1].totalScore)
            .map(([unit, data]) => (
              <tr key={unit} className="border-b border-secondary-100">
                <td className="py-2 px-4 text-secondary-900">{unit}</td>
                <td className="py-2 px-4 text-right text-secondary-700">
                  {data.count}
                </td>
                <td className="py-2 px-4 text-right font-medium text-secondary-900">
                  {data.totalScore.toFixed(1)}
                </td>
                <td className="py-2 px-4 text-right text-secondary-600">
                  {((data.totalScore / targetScore) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          <tr className="border-t-2 border-secondary-300 font-bold bg-secondary-50">
            <td className="py-3 px-4 text-secondary-900">Total</td>
            <td className="py-3 px-4 text-right text-secondary-900">
              {questions.length}
            </td>
            <td className="py-3 px-4 text-right text-secondary-900">
              {totalScore.toFixed(1)}
            </td>
            <td className="py-3 px-4 text-right text-secondary-900">
              {((totalScore / targetScore) * 100).toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
