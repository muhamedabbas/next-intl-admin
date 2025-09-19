'use client';

import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue-600',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  } as const;

  return (
    <div className={clsx('animate-spin rounded-full border-2 border-gray-200',sizeClasses[size],`border-t-${color}`, className )} role="status" aria-label="Loading"
    ><span className="sr-only">Loading...</span></div >);
};
