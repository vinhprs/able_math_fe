import { ReportHeader } from './ReportHeader';
import { ScoreSummary } from './ScoreSummary';
import { ReportBarChart } from '@/components/charts/ReportBarChart';
import { ReportPieChart } from '@/components/charts/ReportPieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { AchievementReportData } from '@/types/reports.types';

interface AchievementReportProps {
  reportData: AchievementReportData;
}

export function AchievementReport({ reportData }: AchievementReportProps) {
  return (
    <div className="report-card space-y-6 print:space-y-4">
      {/* Header */}
      <ReportHeader
        studentName={reportData.student.name}
        testTitle={reportData.test.title}
        testCode={reportData.test.code}
        testDate={reportData.test.testDate}
        testType="ACHIEVEMENT"
      />

      {/* Score Summary */}
      <ScoreSummary
        rawScore={reportData.scores.totalRaw}
        maxScore={reportData.scores.totalMax}
        standardScore={reportData.scores.standardScore}
        correctCount={reportData.scores.correctCount}
        incorrectCount={reportData.scores.incorrectCount}
        accuracy={reportData.scores.accuracy}
      />

      {/* Unit Scores Chart */}
      <ReportBarChart
        title="Performance by Unit"
        data={reportData.charts.unitBar}
        height={300}
        color="#3b82f6"
      />

      {/* Unit Scores Table */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle>Unit Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left p-3 font-semibold text-secondary-700">Unit</th>
                  <th className="text-right p-3 font-semibold text-secondary-700">Score</th>
                  <th className="text-right p-3 font-semibold text-secondary-700">Max Score</th>
                  <th className="text-right p-3 font-semibold text-secondary-700">Percentage</th>
                  <th className="text-right p-3 font-semibold text-secondary-700">Questions</th>
                </tr>
              </thead>
              <tbody>
                {reportData.unitScores.map((unit, index) => (
                  <tr
                    key={unit.unitName}
                    className={cn(
                      'border-b border-secondary-100 hover:bg-secondary-50',
                      index % 2 === 0 && 'bg-secondary-50/50'
                    )}
                  >
                    <td className="p-3 font-medium text-secondary-900">{unit.unitName}</td>
                    <td className="p-3 text-right text-secondary-700">{unit.rawScore}</td>
                    <td className="p-3 text-right text-secondary-700">{unit.maxScore}</td>
                    <td className="p-3 text-right">
                      <span
                        className={cn(
                          'font-semibold',
                          unit.standardScore >= 80
                            ? 'text-green-600'
                            : unit.standardScore >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        )}
                      >
                        {unit.standardScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-secondary-700">{unit.questionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
        <ReportPieChart
          title="Performance by Difficulty"
          data={reportData.charts.difficultyPie}
          height={300}
        />

        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.difficultyScores.map((diff) => (
                <div key={diff.difficulty} className="border-b border-secondary-200 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-secondary-900">{diff.difficulty}</span>
                    <span
                      className={cn(
                        'font-semibold',
                        diff.standardScore >= 80
                          ? 'text-green-600'
                          : diff.standardScore >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      )}
                    >
                      {diff.standardScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-secondary-600">
                    {diff.rawScore} / {diff.maxScore} points • {diff.correctCount} correct,{' '}
                    {diff.incorrectCount} incorrect
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Breakdown */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle>Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left p-2 font-semibold text-secondary-700">#</th>
                  <th className="text-left p-2 font-semibold text-secondary-700">Unit</th>
                  <th className="text-left p-2 font-semibold text-secondary-700">Difficulty</th>
                  <th className="text-center p-2 font-semibold text-secondary-700">Result</th>
                  <th className="text-right p-2 font-semibold text-secondary-700">Score</th>
                </tr>
              </thead>
              <tbody>
                {reportData.questionBreakdown.map((q, index) => (
                  <tr
                    key={q.questionNumber}
                    className={cn(
                      'border-b border-secondary-100',
                      index % 2 === 0 && 'bg-secondary-50/50'
                    )}
                  >
                    <td className="p-2 text-secondary-700">{q.questionNumber}</td>
                    <td className="p-2 text-secondary-700">{q.unitName}</td>
                    <td className="p-2 text-secondary-700">{q.difficulty}</td>
                    <td className="p-2 text-center">
                      <Badge
                        variant={q.isCorrect ? 'success' : 'danger'}
                        className="text-xs"
                      >
                        {q.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </td>
                    <td className="p-2 text-right text-secondary-700">
                      {q.scoreEarned} / {q.maxScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

