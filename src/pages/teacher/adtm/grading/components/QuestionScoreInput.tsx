interface QuestionScoreInputProps {
  questionNumber: number;
  maxScore: number;
  value: number | "";
  onChange: (value: number | "") => void;
}

export function QuestionScoreInput({
  questionNumber,
  maxScore,
  value,
  onChange,
}: QuestionScoreInputProps) {
  const isValid =
    value === "" ||
    (typeof value === "number" && value >= 0 && value <= maxScore);

  return (
    <div className="question-score-input flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">
        Q{questionNumber}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === "" ? "" : Number(val));
          }}
          min={0}
          max={maxScore}
          className={`
            w-16 px-2 py-1 text-center border rounded
            focus:outline-none focus:ring-2
            ${
              isValid
                ? "border-gray-300 focus:ring-blue-500"
                : "border-red-500 focus:ring-red-500"
            }
          `}
        />
        <span className="text-sm text-gray-600">/ {maxScore}</span>
      </div>
    </div>
  );
}
