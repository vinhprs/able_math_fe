import { CheckCircle, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface MultipleChoiceAnswerProps {
  questionId: string;
  questionNumber: number;
  options: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    E?: string;
  };
  value?: string;
  onChange: (answer: string) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  correctAnswer?: string;
}

export function MultipleChoiceAnswer({
  questionId,
  options,
  value,
  onChange,
  disabled = false,
  showCorrect = false,
  correctAnswer,
}: MultipleChoiceAnswerProps) {
  const optionKeys = Object.keys(options).filter((key) =>
    options[key as keyof typeof options]?.trim()
  ) as Array<keyof typeof options>;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Select your answer:
      </label>

      <div className="space-y-2">
        {optionKeys.map((key) => {
          const isSelected = value === key;
          const isCorrect = showCorrect && key === correctAnswer;
          const isWrong = showCorrect && isSelected && key !== correctAnswer;

          return (
            <label
              key={key}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                "hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
                isSelected && !showCorrect && "border-blue-500 bg-blue-50",
                isCorrect && "border-green-500 bg-green-50",
                isWrong && "border-red-500 bg-red-50",
                !isSelected && !isCorrect && !isWrong && "border-gray-200",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="radio"
                name={`question-${questionId}`}
                value={key}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2"
                aria-label={`Option ${key}`}
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 min-w-[24px]">
                    {key}.
                  </span>
                  <span className="text-gray-700">{options[key]}</span>
                </div>

                {/* Show feedback after grading */}
                {showCorrect && isCorrect && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Correct answer</span>
                  </div>
                )}
                {showCorrect && isWrong && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-red-700">
                    <XCircle className="w-4 h-4" />
                    <span>Incorrect</span>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Clear Selection Button */}
      {value && !disabled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="text-gray-600 hover:text-gray-900"
          type="button"
        >
          <X className="w-4 h-4 mr-1" />
          Clear selection
        </Button>
      )}
    </div>
  );
}
