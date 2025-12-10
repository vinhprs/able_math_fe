import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
}
