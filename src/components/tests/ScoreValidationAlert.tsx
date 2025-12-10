import { AlertCircle } from "lucide-react";
import { Alert } from "@/components/ui/Alert";

interface ScoreValidationAlertProps {
  questions: { questionNumber?: number; score: number }[];
  targetScore?: number;
}

export function ScoreValidationAlert({
  questions,
  targetScore = 100,
}: ScoreValidationAlertProps) {
  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
  const difference = totalScore - targetScore;
  const isValid = Math.abs(difference) < 0.01;

  if (isValid) return null;

  return (
    <Alert variant="danger" className="sticky top-4 z-10">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <h4 className="font-semibold">Score Validation Error</h4>
          <p>
            Total score must equal {targetScore} points. Current total:{" "}
            <strong>{totalScore.toFixed(1)}</strong> (
            {difference > 0 ? "+" : ""}
            {difference.toFixed(1)})
          </p>
          <p className="text-sm">
            {difference > 0
              ? `Please reduce scores by ${Math.abs(difference).toFixed(
                  1
                )} points`
              : `Please add ${Math.abs(difference).toFixed(1)} more points`}
          </p>
        </div>
      </div>
    </Alert>
  );
}
