import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface ScoreSummaryProps {
  questions: { score: number }[];
  targetScore?: number;
  className?: string;
}

export function ScoreSummary({
  questions,
  targetScore = 100,
  className,
}: ScoreSummaryProps) {
  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
  const difference = totalScore - targetScore;
  const isValid = Math.abs(difference) < 0.01;

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-4",
        isValid ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Total Score</h3>
          <p className="text-sm text-gray-600">{questions.length} questions</p>
        </div>

        <div className="text-right">
          <div
            className={cn(
              "text-3xl font-bold",
              isValid ? "text-green-700" : "text-red-700"
            )}
          >
            {totalScore.toFixed(1)}
            <span className="text-lg text-gray-500">/{targetScore}</span>
          </div>

          {!isValid && (
            <p className="text-sm font-medium text-red-600 mt-1">
              {difference > 0 ? "+" : ""}
              {difference.toFixed(1)} points
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300",
            isValid ? "bg-green-500" : "bg-red-500"
          )}
          style={{
            width: `${Math.min((totalScore / targetScore) * 100, 100)}%`,
          }}
        />
      </div>

      {/* Status Message */}
      <div className="mt-3 flex items-center gap-2">
        {isValid ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Score distribution is valid
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {difference > 0
                ? `Reduce by ${Math.abs(difference).toFixed(1)} points`
                : `Add ${Math.abs(difference).toFixed(1)} more points`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
