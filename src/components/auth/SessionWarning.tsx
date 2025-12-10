import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertCircle } from "lucide-react";

export function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Show warning 5 minutes before token expires (115 minutes after login)
    // Access token expires in 2 hours (120 minutes)
    const warningTime = 115 * 60 * 1000; // 115 minutes in ms

    const timer = setTimeout(() => {
      setShowWarning(true);
    }, warningTime);

    return () => clearTimeout(timer);
  }, []);

  if (!showWarning) return null;

  return (
    <Alert className="fixed top-4 right-4 w-96 z-50 bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        Your session will expire soon. Your progress is being saved
        automatically.
      </AlertDescription>
    </Alert>
  );
}
