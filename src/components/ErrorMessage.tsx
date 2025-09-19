'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'inline' | 'banner';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = '',
  variant = 'default'
}) => {
  const baseClasses = {
    default: 'flex flex-col items-center justify-center p-8 text-center',
    inline: 'flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg',
    banner: 'flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-400'
  };

  const iconClasses = {
    default: 'w-12 h-12 text-red-500 mb-4',
    inline: 'w-5 h-5 text-red-500 flex-shrink-0',
    banner: 'w-5 h-5 text-red-500'
  };

  const textClasses = {
    default: 'text-lg font-medium text-gray-900 mb-2',
    inline: 'text-sm font-medium text-red-800',
    banner: 'text-sm font-medium text-red-800'
  };

  return (
    <div className={clsx(baseClasses[variant], className)}>
      <div className={clsx(
        variant === 'default' ? 'flex flex-col items-center' : 'flex items-center gap-3 flex-1'
      )}>
        <AlertTriangle className={iconClasses[variant]} />
        <div>
          <p className={textClasses[variant]}>
            {message}
          </p>
          {variant === 'default' && (
            <p className="text-sm text-gray-500 mt-1">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors',
            variant === 'default' ? 'mt-4' : 'ml-4 flex-shrink-0'
          )}
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};
