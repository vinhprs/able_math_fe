import { Type, List, CheckSquare } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

interface QuestionTypeSelectorProps {
  value: "TEXT" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  onChange: (type: "TEXT" | "MULTIPLE_CHOICE" | "TRUE_FALSE") => void;
  disabled?: boolean;
}

export function QuestionTypeSelector({
  value,
  onChange,
  disabled,
}: QuestionTypeSelectorProps) {
  const types = [
    {
      value: "TEXT" as const,
      label: "Text Answer",
      icon: Type,
      description: "Student types answer",
    },
    {
      value: "MULTIPLE_CHOICE" as const,
      label: "Multiple Choice",
      icon: List,
      description: "Student selects from options",
    },
    {
      value: "TRUE_FALSE" as const,
      label: "True/False",
      icon: CheckSquare,
      description: "Two options only",
    },
  ];

  return (
    <div className="space-y-2">
      <Label required>Question Type</Label>
      <div className="grid grid-cols-3 gap-3">
        {types.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.value;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              disabled={disabled}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all",
                "hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={cn(
                    "w-5 h-5 mt-0.5 shrink-0",
                    isSelected ? "text-blue-600" : "text-gray-400"
                  )}
                />
                <div>
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {type.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
