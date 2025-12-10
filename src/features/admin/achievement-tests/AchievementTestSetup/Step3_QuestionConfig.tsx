import { Button, Input, Select, Spinner, Alert } from "@/components/ui";
import { toastError, toastSuccess } from "@/lib/toast";
import { achievementTestsApi } from "@/shared/api/achievement-tests.api";
import type {
  QuestionConfig,
  QuestionType,
} from "@/shared/types/achievement-test.types";
import { useState } from "react";
import type { TestSetupData as LocalTestSetupData } from "./types";
import { ScoreSummary } from "@/components/tests/ScoreSummary";
import { ScoreValidationAlert } from "@/components/tests/ScoreValidationAlert";
import { useScoreValidation } from "@/hooks/useScoreValidation";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  onNext: (data: Partial<LocalTestSetupData>) => void;
  onBack: () => void;
  initialData?: Partial<LocalTestSetupData>;
}

export function Step3_QuestionConfig({ onNext, onBack, initialData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionConfig[]>(
    initialData?.questions ||
      Array.from({ length: initialData?.totalQuestions || 20 }, (_, i) => ({
        questionNo: i + 1,
        type: "MULTIPLE_CHOICE" as QuestionType,
        unitId: "",
        score: 5,
      }))
  );

  // Score validation
  const scoreValidation = useScoreValidation(
    questions.map((q) => ({ score: q.score })),
    100
  );

  const handleQuestionChange = (
    index: number,
    field: keyof QuestionConfig,
    value: any
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    // Validate all questions have unitId
    const invalidQuestions = questions.filter((q) => !q.unitId);
    if (invalidQuestions.length > 0) {
      toastError(
        `Please select units for all questions. Missing: ${invalidQuestions
          .map((q) => q.questionNo)
          .join(", ")}`
      );
      return;
    }

    // Validate total score equals 100
    if (!scoreValidation.isValid) {
      toastError(
        `Cannot submit: Total score must be 100. Current: ${scoreValidation.totalScore.toFixed(
          1
        )}`,
        { duration: 5000 }
      );
      return;
    }

    if (!initialData?.testId) {
      toastError("Test ID is missing");
      return;
    }

    setIsLoading(true);
    try {
      await achievementTestsApi.configureQuestions(initialData.testId, {
        questions: questions.map((q) => ({
          questionNo: q.questionNo,
          type: q.type,
          unitId: q.unitId,
          score: q.score,
        })),
      });

      toastSuccess("Questions configured successfully");
      onNext({ questions });
    } catch (error: any) {
      toastError(
        error.response?.data?.message || "Failed to configure questions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUnits = initialData?.selectedUnits || [];

  // Calculate remaining score for each question
  const getRemainingScore = (currentIndex: number) => {
    const otherQuestionsTotal = questions
      .filter((_, idx) => idx !== currentIndex)
      .reduce((sum, q) => sum + (q.score || 0), 0);
    return 100 - otherQuestionsTotal;
  };

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <ScoreSummary
        questions={questions.map((q) => ({ score: q.score }))}
        targetScore={100}
      />

      {/* Validation Alert */}
      <ScoreValidationAlert
        questions={questions.map((q) => ({
          questionNumber: q.questionNo,
          score: q.score,
        }))}
        targetScore={100}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Configure each question: select unit, type, and score. All questions
          must have a unit assigned. Total score must equal 100 points.
        </p>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-4">
        {questions.map((question, index) => (
          <div
            key={question.questionNo}
            className="p-4 border rounded-lg bg-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Question {question.questionNo}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Unit *"
                options={[
                  { value: "", label: "Select unit" },
                  ...selectedUnits.map((unit) => ({
                    value: unit.id,
                    label: unit.unitName,
                  })),
                ]}
                value={question.unitId}
                onChange={(e) =>
                  handleQuestionChange(index, "unitId", e.target.value)
                }
              />

              <Select
                label="Type *"
                options={[
                  {
                    value: "MULTIPLE_CHOICE",
                    label: "객관식 (Multiple Choice)",
                  },
                  { value: "SHORT_ANSWER", label: "주관식 (Short Answer)" },
                ]}
                value={question.type}
                onChange={(e) =>
                  handleQuestionChange(
                    index,
                    "type",
                    e.target.value as QuestionType
                  )
                }
              />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label
                    htmlFor={`score-${index}`}
                    className="block text-sm font-medium text-secondary-700"
                  >
                    Score *
                  </label>
                  <span className="text-xs text-gray-500">
                    (Remaining: {getRemainingScore(index).toFixed(1)} points)
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id={`score-${index}`}
                    type="number"
                    step="0.5"
                    min="0"
                    value={question.score}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "score",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={cn(
                      getRemainingScore(index) < 0 &&
                        "border-red-500 focus:ring-red-500"
                    )}
                  />
                  {getRemainingScore(index) < 0 && question.score > 0 && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>
                {getRemainingScore(index) < 0 && question.score > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    This question's score exceeds remaining allocation
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Message */}
      {!scoreValidation.isValid && (
        <Alert variant="warning">
          <AlertCircle className="w-4 h-4" />
          <div className="ml-3">
            <h4 className="font-semibold">Invalid Score Distribution</h4>
            <p className="text-sm mt-1">
              Please adjust question scores to total exactly 100 points before
              submitting. Current total: {scoreValidation.totalScore.toFixed(1)}
            </p>
          </div>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading || !scoreValidation.isValid}
          className={cn(
            !scoreValidation.isValid && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              {!scoreValidation.isValid && (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              Next: Enter Answers →
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
