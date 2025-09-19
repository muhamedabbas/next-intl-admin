'use client';

import React from 'react';
import { Download, Upload } from 'lucide-react';
import clsx from 'clsx';
import type { ImportExportProps } from '../types';

export const ImportExportControls: React.FC<ImportExportProps> = ({
  onImport,
  onExport,
  supportedFormats = ['json', 'csv'],
  loading = false,
  permissions = { canImport: true, canExport: true },
  className = ''
}) => {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file format
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !supportedFormats.includes(extension)) {
        alert(`Unsupported file format. Please use: ${supportedFormats.join(', ')}`);
        return;
      }

      onImport([]);  // This would normally process the file
    }
    event.target.value = ''; // Reset input
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {/* Import Button */}
      {permissions.canImport && (
        <>
          <input
            type="file"
            id="import-file"
            accept={supportedFormats.map(f => `.${f}`).join(',')}
            onChange={handleFileImport}
            className="hidden"
            disabled={loading}
          />
          <label
            htmlFor="import-file"
            className={clsx(
              'flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Upload size={16} />
            Import
          </label>
        </>
      )}

      {/* Export Button */}
      {permissions.canExport && (
        <button
          onClick={onExport}
          disabled={loading}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
            loading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Download size={16} />
          Export
        </button>
      )}
    </div>
  );
};
