import { CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface QuestionNavigatorProps {
  questions: Array<{
    id: string;
    questionNumber: number;
  }>;
  currentIndex: number;
  answers: Record<string, string>;
  onJumpTo: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  onJumpTo,
}: QuestionNavigatorProps) {
  const getQuestionStatus = (question: { id: string }) => {
    const hasAnswer = answers[question.id] && answers[question.id].trim() !== '';
    return hasAnswer ? 'answered' : 'unanswered';
  };

  const answeredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id].trim() !== ''
  ).length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="font-bold mb-2">Questions</h3>
            <p className="text-sm text-gray-500">
              {answeredCount} of {questions.length} answered
            </p>
          </div>

          {/* Legend */}
          <div className="space-y-2 text-sm border-t pt-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-400" />
              <span>Not answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <span>Current</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2 border-t pt-3">
            {questions.map((question, index) => {
              const status = getQuestionStatus(question);
              const isCurrent = index === currentIndex;

              return (
                <button
                  key={question.id}
                  onClick={() => onJumpTo(index)}
                  className={`
                    relative aspect-square rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-110'
                        : status === 'answered'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{question.questionNumber}</span>
                  {status === 'answered' && !isCurrent && (
                    <CheckCircle className="absolute top-0.5 right-0.5 w-3 h-3 text-green-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

