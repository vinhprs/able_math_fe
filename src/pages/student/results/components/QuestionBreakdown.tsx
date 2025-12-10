import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MultipleChoiceAnswer } from "@/components/student/MultipleChoiceAnswer";

interface QuestionBreakdownProps {
  questions: any[];
}

export function QuestionBreakdown({ questions }: QuestionBreakdownProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Question-by-Question Breakdown</h2>
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={index}
            className="border-b border-secondary-200 pb-6 last:border-b-0 last:pb-0"
          >
            {/* Question Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    question.isCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {question.isCorrect ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold">
                    Question {question.questionNumber}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="text-xs">
                      {question.unitName}
                    </Badge>
                    <Badge variant="info" className="text-xs">
                      {question.maxScore} pts
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {question.scoreEarned} / {question.maxScore}
                </p>
                <p className="text-sm text-secondary-500">points</p>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-3">
              <p className="text-secondary-800">{question.questionText}</p>
            </div>

            {/* Question Image */}
            {question.questionImage && (
              <div className="mb-3">
                <img
                  src={question.questionImage}
                  alt={`Question ${question.questionNumber}`}
                  className="max-w-md rounded border border-secondary-200"
                />
              </div>
            )}

            {/* Answers - Conditional Rendering */}
            {question.questionType === "MULTIPLE_CHOICE" && question.options ? (
              <div className="bg-secondary-50 p-4 rounded-lg">
                <MultipleChoiceAnswer
                  questionId={question.id || `q-${question.questionNumber}`}
                  questionNumber={question.questionNumber}
                  options={question.options}
                  value={question.studentAnswer}
                  onChange={() => {}} // No-op since disabled
                  correctAnswer={question.correctAnswer}
                  showCorrect={true}
                  disabled={true}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary-50 p-4 rounded-lg">
                {/* Your Answer */}
                <div>
                  <p className="text-sm font-medium text-secondary-600 mb-2">
                    Your Answer
                  </p>
                  <div
                    className={`p-3 rounded border-2 ${
                      question.isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                    }`}
                  >
                    <p className="font-medium">
                      {question.studentAnswer || (
                        <span className="text-secondary-400 italic">
                          No answer
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Correct Answer */}
                <div>
                  <p className="text-sm font-medium text-secondary-600 mb-2">
                    Correct Answer
                  </p>
                  <div className="p-3 rounded border-2 border-green-500 bg-green-50">
                    <p className="font-medium text-green-700">
                      {question.correctAnswer}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
