interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`
              flex flex-col items-center
              ${step === current ? "text-blue-600" : ""}
              ${step < current ? "text-green-600" : "text-gray-400"}
            `}
          >
            {/* Circle */}
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                font-bold text-lg border-2 transition-colors
                ${step === current ? "bg-blue-100 border-blue-600" : ""}
                ${
                  step < current
                    ? "bg-green-100 border-green-600"
                    : "bg-gray-100 border-gray-300"
                }
              `}
            >
              {step < current ? "✓" : step}
            </div>

            {/* Label */}
            <div className="mt-2 text-sm font-medium">Section {step}</div>
          </div>

          {/* Connector line */}
          {step < total && (
            <div
              className={`
                w-16 h-0.5 mx-2 transition-colors
                ${step < current ? "bg-green-600" : "bg-gray-300"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}
