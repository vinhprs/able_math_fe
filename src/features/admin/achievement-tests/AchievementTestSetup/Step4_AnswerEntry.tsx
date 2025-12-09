import { Button, Input, Spinner } from "@/components/ui";
import { toastError, toastSuccess } from "@/lib/toast";
import { achievementTestsApi } from "@/shared/api/achievement-tests.api";
import type { AnswerEntry } from "@/shared/types/achievement-test.types";
import { useState } from "react";
import type { TestSetupData as LocalTestSetupData } from "./types";

interface Props {
  onNext: (data: Partial<LocalTestSetupData>) => void;
  onBack: () => void;
  initialData?: Partial<LocalTestSetupData>;
}

export function Step4_AnswerEntry({ onNext, onBack, initialData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<AnswerEntry[]>(
    initialData?.answers ||
      (initialData?.questions || []).map((q) => ({
        questionNo: q.questionNo,
        correctAnswer: "",
      }))
  );

  const handleAnswerChange = (questionNo: number, value: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionNo === questionNo ? { ...a, correctAnswer: value } : a
      )
    );
  };

  const handleSubmit = async () => {
    // Validate all answers are filled
    const emptyAnswers = answers.filter((a) => !a.correctAnswer.trim());
    if (emptyAnswers.length > 0) {
      toastError(
        `Please enter answers for all questions. Missing: ${emptyAnswers
          .map((a) => a.questionNo)
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
      await achievementTestsApi.enterAnswers(initialData.testId, {
        answers: answers.map((a) => ({
          questionNo: a.questionNo,
          correctAnswer: a.correctAnswer.trim(),
        })),
      });

      toastSuccess("Answers entered successfully");
      onNext({ answers });
    } catch (error: any) {
      toastError(error.response?.data?.message || "Failed to enter answers");
    } finally {
      setIsLoading(false);
    }
  };

  const questions = initialData?.questions || [];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Enter the correct answer for each question. For multiple choice, use
          format: ①, ②, ③, ④, ⑤
        </p>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-4">
        {answers.map((answer) => {
          const question = questions.find(
            (q) => q.questionNo === answer.questionNo
          );
          const isMultipleChoice = question?.type === "MULTIPLE_CHOICE";

          return (
            <div
              key={answer.questionNo}
              className="p-4 border rounded-lg bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Question {answer.questionNo}</h4>
                {question && (
                  <span className="text-sm text-gray-500">
                    {isMultipleChoice ? "객관식" : "주관식"} •{" "}
                    {question.unitName} • {question.score}점
                  </span>
                )}
              </div>

              <Input
                label="Correct Answer *"
                placeholder={
                  isMultipleChoice
                    ? "Enter answer (e.g., ①, ②, ③)"
                    : "Enter answer"
                }
                value={answer.correctAnswer}
                onChange={(e) =>
                  handleAnswerChange(answer.questionNo, e.target.value)
                }
              />
            </div>
          );
        })}
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
            "Next: Review & Finalize →"
          )}
        </Button>
      </div>
    </div>
  );
}
