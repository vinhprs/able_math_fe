import { useState } from "react";
import type { AdtmSection } from "./templates/adtm-templates";
import { UnitGroup } from "./components/UnitGroup";
import { QuestionScoreInput } from "./components/QuestionScoreInput";

interface SectionsScreenProps {
  section: AdtmSection;
  initialData?: {
    questionScores?: Record<number, number>;
  };
  onComplete: (data: {
    sectionId: number;
    questionScores: Record<number, number>;
  }) => void;
  isSubmitting: boolean;
}

export function SectionsScreen({
  section,
  initialData,
  onComplete,
  isSubmitting,
}: SectionsScreenProps) {
  const [questionScores, setQuestionScores] = useState<
    Record<number, number | "">
  >(() => {
    const initial: Record<number, number | ""> = {};
    section.questions.forEach((q) => {
      initial[q.number] = initialData?.questionScores?.[q.number] || "";
    });
    return initial;
  });

  const isValid = () => {
    return section.questions.every((q) => {
      const score = questionScores[q.number];
      return (
        score !== "" &&
        score !== null &&
        typeof score === "number" &&
        score >= 0 &&
        score <= q.score
      );
    });
  };

  const handleSubmit = () => {
    if (!isValid()) {
      alert("Please enter valid scores for all questions.");
      return;
    }

    // Convert empty strings to 0 for submission
    const scores: Record<number, number> = {};
    section.questions.forEach((q) => {
      scores[q.number] =
        typeof questionScores[q.number] === "number"
          ? (questionScores[q.number] as number)
          : 0;
    });

    onComplete({
      sectionId: section.id,
      questionScores: scores,
    });
  };

  // Group questions by unit (for sections 2-3)
  const questionsByUnit: Record<string, typeof section.questions> = {};
  if (section.units && section.units.length > 0) {
    section.units.forEach((unit) => {
      questionsByUnit[unit] = section.questions.filter((q) => q.unit === unit);
    });
  }

  const currentTotal = section.questions.reduce((sum, q) => {
    const score = questionScores[q.number];
    return sum + (typeof score === "number" ? score : 0);
  }, 0);

  return (
    <div className="sections-screen bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{section.name}</h2>
        <div className="text-sm">
          Current Total:{" "}
          <span className="font-bold text-lg">{currentTotal}</span> /{" "}
          {section.maxScore}
        </div>
      </div>

      {/* Units (for sections 2-3) */}
      {section.units && section.units.length > 0 ? (
        <div className="space-y-6">
          {section.units.map((unit) => (
            <UnitGroup
              key={unit}
              unit={unit}
              questions={questionsByUnit[unit] || []}
              scores={questionScores}
              onScoreChange={(questionNumber, score) => {
                setQuestionScores({
                  ...questionScores,
                  [questionNumber]: score,
                });
              }}
            />
          ))}
        </div>
      ) : (
        /* No units (sections 4-5) - simple list */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {section.questions.map((q) => (
            <QuestionScoreInput
              key={q.number}
              questionNumber={q.number}
              maxScore={q.score}
              value={questionScores[q.number] || ""}
              onChange={(value) => {
                setQuestionScores({
                  ...questionScores,
                  [q.number]: value,
                });
              }}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end mt-8 pt-6 border-t">
        <button
          onClick={handleSubmit}
          disabled={!isValid() || isSubmitting}
          className={`
            px-8 py-3 rounded-lg font-medium transition-colors
            ${
              isValid() && !isSubmitting
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {isSubmitting
            ? "Saving..."
            : section.id < 5
            ? "Next Section →"
            : "Complete Grading ✓"}
        </button>
      </div>
    </div>
  );
}
