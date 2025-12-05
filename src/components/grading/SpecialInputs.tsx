import { Input } from "@/components/ui";
import { cn } from "@/lib/cn";

interface ConcentrationLevelInputProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function ConcentrationLevelInput({
  value,
  onChange,
  disabled = false,
  className,
}: ConcentrationLevelInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-secondary-700">
        Concentration Level
      </label>
      <select
        value={value?.toString() ?? ""}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className="flex h-10 w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select level</option>
        {[1, 2, 3, 4, 5].map((level) => (
          <option key={level} value={level}>
            Level {level}
          </option>
        ))}
      </select>
      <p className="text-xs text-secondary-500">
        Rate the student's concentration level (1 = Low, 5 = High)
      </p>
    </div>
  );
}

interface CurrentMoodInputProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function CurrentMoodInput({
  value,
  onChange,
  disabled = false,
  className,
}: CurrentMoodInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-secondary-700">
        Current Mood
      </label>
      <select
        value={value?.toString() ?? ""}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className="flex h-10 w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select mood</option>
        {[1, 2, 3, 4, 5].map((level) => (
          <option key={level} value={level}>
            Level {level}
          </option>
        ))}
      </select>
      <p className="text-xs text-secondary-500">
        Rate the student's current mood (1 = Poor, 5 = Excellent)
      </p>
    </div>
  );
}

interface ExpectedScoreInputProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  maxScore?: number;
}

export function ExpectedScoreInput({
  value,
  onChange,
  disabled = false,
  className,
  maxScore,
}: ExpectedScoreInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    } else if (e.target.value === "") {
      onChange(0);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-secondary-700">
        Expected Score
      </label>
      <Input
        type="number"
        min={0}
        max={maxScore}
        step={0.5}
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        placeholder="0"
      />
      {maxScore && (
        <p className="text-xs text-secondary-500">
          Maximum possible score: {maxScore}
        </p>
      )}
    </div>
  );
}
