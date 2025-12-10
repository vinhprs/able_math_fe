import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  sectionsCompleted: {
    section1: boolean;
    section2: boolean;
    section3: boolean;
    section4: boolean;
    section5: boolean;
  };
  currentSection: number;
  onSectionClick?: (section: number) => void;
}

export function ProgressIndicator({
  sectionsCompleted,
  currentSection,
  onSectionClick,
}: ProgressIndicatorProps) {
  const sections = [
    { number: 1, name: "Section 1", shortName: "S1" },
    { number: 2, name: "Section 2", shortName: "S2" },
    { number: 3, name: "Section 3", shortName: "S3" },
    { number: 4, name: "Section 4", shortName: "S4" },
    { number: 5, name: "Section 5", shortName: "S5" },
  ];

  const completedCount =
    Object.values(sectionsCompleted).filter(Boolean).length;
  const percentage = (completedCount / 5) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="font-semibold">
            {completedCount}/5 sections ({percentage.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Section Pills */}
      <div className="flex items-center gap-2">
        {sections.map((section, index) => {
          const isCompleted =
            sectionsCompleted[
              `section${section.number}` as keyof typeof sectionsCompleted
            ];
          const isCurrent = section.number === currentSection;
          const isClickable = !!onSectionClick;

          return (
            <div key={section.number} className="flex items-center">
              <button
                onClick={() => onSectionClick?.(section.number)}
                disabled={!isClickable}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${
                    isCurrent
                      ? "bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2"
                      : isCompleted
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                  ${isClickable ? "cursor-pointer" : "cursor-default"}
                `}
              >
                {isCompleted && !isCurrent && <Check className="h-4 w-4" />}
                <span>{section.shortName}</span>
              </button>
              {index < sections.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
