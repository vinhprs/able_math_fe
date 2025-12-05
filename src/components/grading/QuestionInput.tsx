import { Input } from "@/components/ui";
import { cn } from "@/lib/cn";

interface QuestionInputProps {
  questionNumber: number;
  maxScore: number;
  currentScore: number | null | undefined;
  onChange: (score: number) => void;
  className?: string;
  disabled?: boolean;
}

export function QuestionInput({
  questionNumber,
  maxScore,
  currentScore,
  onChange,
  className,
  disabled = false,
}: QuestionInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onChange(0);
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxScore) {
      onChange(numValue);
    }
  };

  const getStatusColor = () => {
    if (currentScore === null || currentScore === undefined) {
      return "border-secondary-300";
    }
    if (currentScore === 0) {
      return "border-yellow-300 bg-yellow-50";
    }
    if (currentScore === maxScore) {
      return "border-green-300 bg-green-50";
    }
    return "border-orange-300 bg-orange-50";
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <label className="w-24 text-sm font-medium text-secondary-700">
        Q{questionNumber}:
      </label>
      <div className="flex-1">
        <Input
          type="number"
          min={0}
          max={maxScore}
          step={0.5}
          value={currentScore ?? ""}
          onChange={handleChange}
          disabled={disabled}
          className={cn("w-full", getStatusColor())}
          placeholder="0"
        />
      </div>
      <span className="w-16 text-sm text-secondary-500 text-right">
        / {maxScore}
      </span>
    </div>
  );
}
