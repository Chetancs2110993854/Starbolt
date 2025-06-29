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
        'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden backdrop-blur-sm',
        {
          'transition-all duration-200 hover:shadow-lg cursor-pointer hover:transform hover:scale-[1.02]': hover,
          'transition-all duration-200 hover:shadow-md': !hover,
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
    <div className={clsx('px-6 py-4 border-b border-gray-100', className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>{children}</h3>;
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
  return <div className={clsx('px-6 py-4', className)}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={clsx('px-6 py-4 bg-gray-50 border-t border-gray-100', className)}>
      {children}
    </div>
  );
};