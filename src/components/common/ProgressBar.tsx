import React from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showValue = false,
  size = 'md',
  variant = 'primary',
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'md': return 'h-2';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };
  
  const getColor = () => {
    switch (variant) {
      case 'primary': return 'bg-blue-600';
      case 'success': return 'bg-green-600';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
          {showValue && (
            <div className="text-sm text-gray-500">
              {value} / {max} ({Math.round(percentage)}%)
            </div>
          )}
        </div>
      )}
      
      <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', getHeight())}>
        <div 
          className={clsx('transition-all duration-300 ease-out rounded-full', getColor())} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};