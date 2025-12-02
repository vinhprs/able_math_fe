import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        <div className="flex items-center space-x-2">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-secondary-300 text-primary-600',
              'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              {
                'border-red-500': error,
              },
              className
            )}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium cursor-pointer',
                {
                  'text-secondary-700': !error,
                  'text-red-600': error,
                }
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

