import { Button, Input, Select, Spinner } from "@/components/ui";
import { toastError, toastSuccess } from "@/lib/toast";
import { achievementTestsApi } from "@/shared/api/achievement-tests.api";
import type {
  QuestionConfig,
  QuestionType,
} from "@/shared/types/achievement-test.types";
import { useState } from "react";
import type { TestSetupData as LocalTestSetupData } from "./types";

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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Configure each question: select unit, type, and score. All questions
          must have a unit assigned.
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

              <Input
                label="Score *"
                type="number"
                value={question.score}
                onChange={(e) =>
                  handleQuestionChange(
                    index,
                    "score",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            "Next: Enter Answers →"
          )}
        </Button>
      </div>
    </div>
  );
}
