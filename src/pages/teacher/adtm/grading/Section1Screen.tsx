import { useState } from "react";
import type { AdtmSection } from "./templates/adtm-templates";
import { RatingButtons } from "./components/RatingButtons";
import { QuestionScoreInput } from "./components/QuestionScoreInput";

interface Section1ScreenProps {
  section: AdtmSection;
  initialData?: {
    concentration?: number;
    mood?: number;
    expectedScore?: number;
    questionScores?: Record<number, number>;
  };
  onComplete: (data: {
    sectionId: number;
    specialInputs: {
      concentration: number;
      mood: number;
      expectedScore: number;
    };
    questionScores: Record<number, number>;
  }) => void;
  isSubmitting: boolean;
}

export function Section1Screen({
  section,
  initialData,
  onComplete,
  isSubmitting,
}: Section1ScreenProps) {
  // Special inputs state
  const [specialInputs, setSpecialInputs] = useState({
    concentration: initialData?.concentration || 3,
    mood: initialData?.mood || 3,
    expectedScore: initialData?.expectedScore || 0,
  });

  // Question scores state
  const [questionScores, setQuestionScores] = useState<
    Record<number, number | "">
  >(() => {
    const initial: Record<number, number | ""> = {};
    section.questions.forEach((q) => {
      initial[q.number] = initialData?.questionScores?.[q.number] || "";
    });
    return initial;
  });

  // Validation
  const isValid = () => {
    // Check all questions have valid scores
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
      sectionId: 1,
      specialInputs,
      questionScores: scores,
    });
  };

  // Calculate current total
  const currentTotal = section.questions.reduce((sum, q) => {
    const score = questionScores[q.number];
    return sum + (typeof score === "number" ? score : 0);
  }, 0);

  return (
    <div className="section-1-screen bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">{section.name}</h2>

      {/* Special Inputs Panel */}
      <div className="special-inputs-panel bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Special Assessment</h3>

        {/* Concentration Level */}
        <div className="input-group mb-6">
          <label className="block font-medium mb-2">
            Current Concentration Level
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Teacher observes student and rates concentration (1=lowest,
            5=highest)
          </p>
          <RatingButtons
            value={specialInputs.concentration}
            onChange={(value) =>
              setSpecialInputs({ ...specialInputs, concentration: value })
            }
            max={5}
          />
        </div>

        {/* Current Mood */}
        <div className="input-group mb-6">
          <label className="block font-medium mb-2">Current Mood</label>
          <p className="text-sm text-gray-600 mb-3">
            Teacher observes student and rates mood (1=lowest, 5=highest)
          </p>
          <RatingButtons
            value={specialInputs.mood}
            onChange={(value) =>
              setSpecialInputs({ ...specialInputs, mood: value })
            }
            max={5}
          />
        </div>

        {/* Expected Score */}
        <div className="input-group">
          <label className="block font-medium mb-2">
            Expected Score (Self-Prediction)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Student's self-predicted score (0-100)
          </p>
          <input
            type="number"
            className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={specialInputs.expectedScore}
            onChange={(e) =>
              setSpecialInputs({
                ...specialInputs,
                expectedScore: Number(e.target.value),
              })
            }
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Question Scores */}
      <div className="questions-panel">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Question Scores</h3>
          <div className="text-sm">
            Current Total:{" "}
            <span className="font-bold text-lg">{currentTotal}</span> /{" "}
            {section.maxScore}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {section.questions.map((q) => (
            <QuestionScoreInput
              key={q.number}
              questionNumber={q.number}
              maxScore={q.score}
              value={questionScores[q.number] || ""}
              onChange={(value) =>
                setQuestionScores({
                  ...questionScores,
                  [q.number]: value,
                })
              }
            />
          ))}
        </div>
      </div>

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
          {isSubmitting ? "Saving..." : "Next Section →"}
        </button>
      </div>
    </div>
  );
}
