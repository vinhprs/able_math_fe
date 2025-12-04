import { Award, Target, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ScoreSummaryProps {
  totalScore: number;
  maxScore: number;
  standardScore: number;
  questions: any[];
  submittedAt: string;
  gradedAt: string;
}

export function ScoreSummary({
  totalScore,
  maxScore,
  standardScore,
  questions,
  submittedAt: _submittedAt,
  gradedAt: _gradedAt,
}: ScoreSummaryProps) {
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const incorrectCount = questions.length - correctCount;
  const accuracy = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Score */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-secondary-500 mb-1">Total Score</p>
            <p className="text-3xl font-bold">
              {totalScore}{' '}
              <span className="text-xl text-secondary-400">/ {maxScore}</span>
            </p>
            <p className="text-sm text-primary-600 font-medium mt-2">
              {Math.round(standardScore)}%
            </p>
          </div>
          <Award className="w-8 h-8 text-primary-600" />
        </div>
      </Card>

      {/* Accuracy */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-secondary-500 mb-1">Accuracy</p>
            <p className="text-3xl font-bold">{Math.round(accuracy)}%</p>
            <p className="text-sm text-secondary-500 mt-2">
              {correctCount} of {questions.length} correct
            </p>
          </div>
          <Target className="w-8 h-8 text-green-600" />
        </div>
      </Card>

      {/* Correct Answers */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-secondary-500 mb-1">Correct</p>
            <p className="text-3xl font-bold text-green-600">{correctCount}</p>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-secondary-500">Answered correctly</span>
            </div>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </Card>

      {/* Incorrect Answers */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-secondary-500 mb-1">Incorrect</p>
            <p className="text-3xl font-bold text-red-600">{incorrectCount}</p>
            <div className="flex items-center gap-2 mt-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-secondary-500">Need review</span>
            </div>
          </div>
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
      </Card>
    </div>
  );
}

