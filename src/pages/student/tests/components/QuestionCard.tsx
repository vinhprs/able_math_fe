import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnswerInput } from "./AnswerInput";
import { MultipleChoiceAnswer } from "@/components/student/MultipleChoiceAnswer";

interface QuestionCardProps {
  question: {
    id: string;
    questionNumber: number;
    questionText: string;
    questionImage?: string;
    questionType?: "TEXT" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
    options?: {
      A?: string;
      B?: string;
      C?: string;
      D?: string;
      E?: string;
    } | null;
    score: number;
    unitName?: string;
    difficulty?: string;
  };
  questionNumber: number;
  totalQuestions: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Question {questionNumber}
                <span className="text-gray-400 text-lg ml-2">
                  / {totalQuestions}
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                {question.unitName && (
                  <Badge variant="info">{question.unitName}</Badge>
                )}
                <Badge variant="default">{question.score} points</Badge>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="prose max-w-none">
            <p className="text-lg text-gray-800 whitespace-pre-wrap">
              {question.questionText}
            </p>
          </div>

          {/* Question Image */}
          {question.questionImage && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <img
                src={question.questionImage}
                alt={`Question ${questionNumber} illustration`}
                className="max-w-full h-auto mx-auto"
                style={{ maxHeight: "400px" }}
              />
            </div>
          )}

          {/* Answer Input - Conditional Rendering */}
          <div>
            {question.questionType === "MULTIPLE_CHOICE" && question.options ? (
              <MultipleChoiceAnswer
                questionId={question.id}
                questionNumber={question.questionNumber}
                options={question.options}
                value={answer}
                onChange={onAnswerChange}
              />
            ) : (
              <AnswerInput
                value={answer}
                onChange={onAnswerChange}
                placeholder="Type your answer here..."
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
