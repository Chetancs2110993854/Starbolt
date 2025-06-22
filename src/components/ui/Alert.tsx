import React from 'react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  title,
  variant = 'info',
  className,
  onClose,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={clsx(
        'rounded-md p-4',
        {
          'bg-blue-50': variant === 'info',
          'bg-green-50': variant === 'success',
          'bg-yellow-50': variant === 'warning',
          'bg-red-50': variant === 'error',
        },
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3">
          {title && (
            <h3
              className={clsx('text-sm font-medium', {
                'text-blue-800': variant === 'info',
                'text-green-800': variant === 'success',
                'text-yellow-800': variant === 'warning',
                'text-red-800': variant === 'error',
              })}
            >
              {title}
            </h3>
          )}
          <div
            className={clsx('text-sm', {
              'text-blue-700': variant === 'info',
              'text-green-700': variant === 'success',
              'text-yellow-700': variant === 'warning',
              'text-red-700': variant === 'error',
            })}
          >
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  {
                    'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50': variant === 'info',
                    'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50': variant === 'success',
                    'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50': variant === 'warning',
                    'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50': variant === 'error',
                  }
                )}
              >
                <span className="sr-only">Dismiss</span>
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};