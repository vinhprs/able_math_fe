import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

interface ScoreSummaryProps {
  rawScore: number;
  maxScore: number;
  standardScore: number;
  correctCount?: number;
  incorrectCount?: number;
  accuracy?: number;
}

/**
 * Get color class based on score
 */
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get background gradient based on score
 */
function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-green-500 to-green-600';
  if (score >= 60) return 'from-yellow-500 to-yellow-600';
  return 'from-red-500 to-red-600';
}

export function ScoreSummary({
  rawScore,
  maxScore,
  standardScore,
  correctCount,
  incorrectCount,
  accuracy,
}: ScoreSummaryProps) {
  return (
    <Card className="mb-6 print:mb-4">
      <CardContent className="p-6">
        <div className={cn('bg-gradient-to-r rounded-lg p-8 text-center text-white', getScoreGradient(standardScore))}>
          <h2 className="text-xl font-semibold mb-4">Overall Score</h2>
          <div className="text-6xl font-bold mb-2">{standardScore.toFixed(1)}%</div>
          <div className="text-lg opacity-90">
            {rawScore} / {maxScore} points
          </div>
        </div>

        {(correctCount !== undefined || accuracy !== undefined) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {correctCount !== undefined && (
              <div className="text-center">
                <p className="text-sm text-secondary-500 mb-1">Correct</p>
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              </div>
            )}
            {incorrectCount !== undefined && (
              <div className="text-center">
                <p className="text-sm text-secondary-500 mb-1">Incorrect</p>
                <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
              </div>
            )}
            {accuracy !== undefined && (
              <div className="text-center">
                <p className="text-sm text-secondary-500 mb-1">Accuracy</p>
                <p className={cn('text-2xl font-bold', getScoreColor(accuracy))}>
                  {accuracy.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

