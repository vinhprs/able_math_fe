import { CheckCircle, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

interface MultipleChoiceEditorProps {
  options: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    E?: string;
  };
  correctAnswer: string;
  onChange: (options: any, correctAnswer: string) => void;
}

export function MultipleChoiceEditor({
  options,
  correctAnswer,
  onChange,
}: MultipleChoiceEditorProps) {
  const optionKeys = ["A", "B", "C", "D", "E"] as const;

  const updateOption = (key: string, value: string) => {
    onChange({ ...options, [key]: value }, correctAnswer);
  };

  const setCorrectAnswer = (key: string) => {
    onChange(options, key);
  };

  const hasOptions = optionKeys.some(
    (key) => options[key]?.trim() && options[key]!.trim().length > 0
  );
  const optionCount = optionKeys.filter(
    (key) => options[key]?.trim() && options[key]!.trim().length > 0
  ).length;

  return (
    <div className="space-y-4">
      <Label required>Answer Options</Label>
      <p className="text-sm text-gray-600">
        Enter at least 2 options. Mark one as correct.
      </p>

      <div className="space-y-3">
        {optionKeys.map((key) => {
          const isCorrect = correctAnswer === key;
          const hasValue = options[key]?.trim();

          return (
            <div key={key} className="flex items-start gap-3">
              {/* Correct Answer Radio */}
              <div className="pt-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={key}
                  checked={isCorrect}
                  onChange={() => setCorrectAnswer(key)}
                  disabled={!hasValue}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  title="Mark as correct answer"
                  aria-label={`Mark option ${key} as correct`}
                />
              </div>

              {/* Option Input */}
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-medium pointer-events-none">
                    {key}.
                  </span>
                  <Input
                    value={options[key] || ""}
                    onChange={(e) => updateOption(key, e.target.value)}
                    placeholder={`Option ${key}`}
                    className={cn(
                      "pl-10",
                      isCorrect && "border-green-500 bg-green-50"
                    )}
                  />
                  {isCorrect && (
                    <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-600 pointer-events-none" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation Messages */}
      {optionCount < 2 && hasOptions && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-3">
            <p className="font-medium">At least 2 options required</p>
            <p className="text-sm mt-1">
              Please add at least one more option to create a valid multiple
              choice question.
            </p>
          </div>
        </Alert>
      )}

      {!correctAnswer && optionCount >= 2 && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-3">
            <p className="font-medium">Please mark one option as correct</p>
            <p className="text-sm mt-1">
              Select the radio button next to the correct answer option.
            </p>
          </div>
        </Alert>
      )}

      {optionCount >= 2 && correctAnswer && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <div className="ml-3">
            <p className="font-medium">Multiple choice question is valid</p>
            <p className="text-sm mt-1">
              {optionCount} options provided. Correct answer: {correctAnswer}
            </p>
          </div>
        </Alert>
      )}
    </div>
  );
}
