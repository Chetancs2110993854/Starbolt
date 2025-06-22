import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  onClick,
  hover = false,
}) => {
  return (
    <div 
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
        {
          'transition-all duration-200 hover:shadow-md cursor-pointer': hover,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={clsx('px-5 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return <h3 className={clsx('text-lg font-medium text-gray-900', className)}>{children}</h3>;
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return <p className={clsx('mt-1 text-sm text-gray-500', className)}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return <div className={clsx('px-5 py-4', className)}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={clsx('px-5 py-4 bg-gray-50 border-t border-gray-200', className)}>
      {children}
    </div>
  );
};