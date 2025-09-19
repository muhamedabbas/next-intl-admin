'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';
import type { SearchBoxProps } from '../types';

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
  enableRTL = false,
  onClear
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Handle input changes with debouncing
  const handleInputChange = (newValue: string) => {
    setInternalValue(newValue);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced onChange
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  // Handle clear button
  const handleClear = () => {
    setInternalValue('');
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={clsx('relative', className)}>
      <div className="relative">
        {/* Search icon */}
        <div className={clsx(
          'absolute inset-y-0 flex items-center pointer-events-none',
          enableRTL ? 'right-0 pr-3' : 'left-0 pl-3'
        )}>
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            'block w-full rounded-lg border border-gray-300 bg-white py-2 text-sm text-gray-900 placeholder-gray-500',
            'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400',
            'dark:focus:border-blue-400 dark:focus:ring-blue-400',
            enableRTL ? 'pr-9 pl-9' : 'pl-9 pr-9'
          )}
          dir={enableRTL ? 'rtl' : 'ltr'}
        />

        {/* Clear button */}
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className={clsx(
              'absolute inset-y-0 flex items-center px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              enableRTL ? 'left-0' : 'right-0'
            )}
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search suggestions or recent searches could go here */}
    </div>
  );
};
