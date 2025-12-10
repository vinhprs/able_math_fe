import type { AdtmQuestion } from "../templates/adtm-templates";
import { QuestionScoreInput } from "./QuestionScoreInput";

interface UnitGroupProps {
  unit: string;
  questions: AdtmQuestion[];
  scores: Record<number, number | "">;
  onScoreChange: (questionNumber: number, score: number | "") => void;
}

export function UnitGroup({
  unit,
  questions,
  scores,
  onScoreChange,
}: UnitGroupProps) {
  const unitTotal = questions.reduce((sum, q) => {
    const score = scores[q.number];
    return sum + (typeof score === "number" ? score : 0);
  }, 0);

  const unitMax = questions.reduce((sum, q) => sum + q.score, 0);

  return (
    <div className="unit-group border border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">{unit}</h4>
        <div className="text-sm text-gray-600">
          Unit Total: <span className="font-bold">{unitTotal}</span> / {unitMax}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {questions.map((q) => (
          <QuestionScoreInput
            key={q.number}
            questionNumber={q.number}
            maxScore={q.score}
            value={scores[q.number] || ""}
            onChange={(value) => onScoreChange(q.number, value)}
          />
        ))}
      </div>
    </div>
  );
}
