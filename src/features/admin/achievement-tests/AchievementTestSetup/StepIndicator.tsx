import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10" />

        {/* Progress line active */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary-600 -z-10 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Step circles */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                  isCompleted && "bg-primary-600 text-white",
                  isCurrent &&
                    "bg-primary-600 text-white ring-4 ring-primary-100",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-white border-2 border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.number}
              </div>

              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-primary-600",
                    !isCurrent && "text-gray-500"
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-[120px]">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
