import { Check, Loader2, AlertCircle, Save } from "lucide-react";
import type { AutoSaveStatus } from "@/hooks/useAutoSave";
import { formatDistanceToNow } from "date-fns";

interface AutoSaveStatusProps {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  error?: string | null;
}

export function AutoSaveStatusIndicator({
  status,
  lastSaved,
  error,
}: AutoSaveStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "saving":
        return {
          icon: Loader2,
          text: "Saving...",
          className: "bg-blue-50 text-blue-700 border-blue-200",
          iconClassName: "animate-spin",
        };
      case "saved":
        return {
          icon: Check,
          text: lastSaved
            ? `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`
            : "Saved",
          className: "bg-green-50 text-green-700 border-green-200",
          iconClassName: "",
        };
      case "error":
        return {
          icon: AlertCircle,
          text: error || "Failed to save",
          className: "bg-red-50 text-red-700 border-red-200",
          iconClassName: "",
        };
      default:
        return {
          icon: Save,
          text: "Auto-save active",
          className: "bg-gray-50 text-gray-600 border-gray-200",
          iconClassName: "",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm transition-all ${config.className}`}
    >
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
}
