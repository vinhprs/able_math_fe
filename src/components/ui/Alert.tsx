import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: ReactNode;
  onClose?: () => void;
}

export function Alert({
  className,
  variant = 'default',
  size = 'md',
  children,
  onClose,
  ...props
}: AlertProps) {
  const variantClasses = {
    default: 'bg-secondary-100 border-secondary-300 text-secondary-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
