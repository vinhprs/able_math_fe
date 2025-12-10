import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  title = "Error",
  message,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <Alert variant="danger">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
