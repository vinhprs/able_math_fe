import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { QuestionInput } from "./QuestionInput";
import { SectionStats } from "./SectionStats";
import type { ITestQuestion } from "@/types/test.types";

interface UnitCardProps {
  unitName: string;
  questions: ITestQuestion[];
  answers: Record<string, number | null | undefined>;
  onAnswerChange: (questionId: string, score: number) => void;
  unitRawScore?: number;
  unitMaxScore?: number;
  unitStandardScore?: number;
  disabled?: boolean;
}

export function UnitCard({
  unitName,
  questions,
  answers,
  onAnswerChange,
  unitRawScore,
  unitMaxScore,
  unitStandardScore,
  disabled = false,
}: UnitCardProps) {
  const sortedQuestions = [...questions].sort(
    (a, b) => a.questionNumber - b.questionNumber
  );

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{unitName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {sortedQuestions.map((question) => (
            <QuestionInput
              key={question.id}
              questionNumber={question.questionNumber}
              maxScore={question.score}
              currentScore={answers[question.id]}
              onChange={(score) => onAnswerChange(question.id, score)}
              disabled={disabled}
            />
          ))}
        </div>

        {(unitRawScore !== undefined ||
          unitMaxScore !== undefined ||
          unitStandardScore !== undefined) && (
          <div className="pt-4 border-t border-secondary-200">
            <SectionStats
              stats={[
                {
                  label: "Unit Score",
                  value: `${unitRawScore ?? 0} / ${unitMaxScore ?? 0}`,
                },
                {
                  label: "Standard Score",
                  value: unitStandardScore
                    ? `${unitStandardScore.toFixed(1)}%`
                    : "0%",
                },
              ]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
