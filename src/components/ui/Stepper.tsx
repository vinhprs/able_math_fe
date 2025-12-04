import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep, className, ...props }: StepperProps) {
  return (
    <div className={cn('flex items-center justify-between', className)} {...props}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isPending = stepNumber > currentStep;

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                  {
                    'bg-primary-600 border-primary-600 text-white': isCompleted,
                    'bg-white border-primary-600 text-primary-600': isCurrent,
                    'bg-white border-secondary-300 text-secondary-400': isPending,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{stepNumber}</span>
                )}
              </div>
              {/* Step Label */}
              <span
                className={cn('mt-2 text-sm font-medium', {
                  'text-primary-600': isCurrent || isCompleted,
                  'text-secondary-400': isPending,
                })}
              >
                {step}
              </span>
            </div>
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn('h-0.5 flex-1 mx-2 -mt-5', {
                  'bg-primary-600': isCompleted,
                  'bg-secondary-300': !isCompleted,
                })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

