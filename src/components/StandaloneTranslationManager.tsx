'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Upload, Save, BarChart3, Trash2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

import { TranslationTable } from './TranslationTable';
import { TranslationForm } from './TranslationForm';
import { SearchBox } from './SearchBox';
import { PaginationControls } from './PaginationControls';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { ConfirmDialog } from './ConfirmDialog';

import { StandaloneAPI } from '../lib/standalone-api';
import { LocalStorageAdapter, IndexedDBAdapter, MemoryStorageAdapter } from '../lib/storage';
import { FileManager } from '../lib/file-manager';

import type {
  Translation,
  TranslationManagerProps,
  StorageAdapter
} from '../types';

interface StandaloneTranslationManagerProps extends Omit<TranslationManagerProps, 'apiEndpoint'> {
  storageType?: 'localStorage' | 'indexedDB' | 'memory';
  messagesPath?: string;
  autoSave?: boolean;
  autoExport?: boolean;
  showStatistics?: boolean;
}

export const StandaloneTranslationManager: React.FC<StandaloneTranslationManagerProps> = ({
  supportedLocales,
  defaultLocale = 'en',
  enableRTL = true,
  enableExport = true,
  enableImport = true,
  enableBatchOperations = false,
  pageSize = 25,
  permissions = { canCreate: true, canEdit: true, canDelete: true, canExport: true, canImport: true },
  theme,
  className = '',
  customStyles = {},
  components = {},
  validation = {},
  onTranslationChange,
  onError,
  storageType = 'localStorage',
  messagesPath = '/messages',
  autoSave = true,
  autoExport = true,
  showStatistics = true
}) => {
  const t = useTranslations('translationManager');
  const locale = useLocale();
  const isRTL = enableRTL && ['ar', 'he', 'fa', 'ur'].includes(locale);

  // Initialize API
  const api = useMemo(() => {
    let storage: StorageAdapter;
    
    switch (storageType) {
      case 'indexedDB':
        storage = new IndexedDBAdapter();
        break;
      case 'memory':
        storage = new MemoryStorageAdapter();
        break;
      case 'localStorage':
      default:
        storage = new LocalStorageAdapter();
        break;
    }

    const fileManager = new FileManager(messagesPath, supportedLocales);

    return new StandaloneAPI({
      storage,
      fileManager,
      supportedLocales,
      messagesPath,
      autoSave,
      autoExport
    });
  }, [storageType, messagesPath, supportedLocales, autoSave, autoExport]);

  // State
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // UI State
  const [showForm, setShowForm] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Load translations
  const loadTranslations = useCallback(async (
    page: number = currentPage,
    size: number = currentPageSize,
    search: string = searchTerm
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await api.getTranslations({
        page,
        pageSize: size,
        search
      });

      setTranslations(result.results);
      setTotalCount(result.count);
      setTotalPages(result.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load translations';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [api, currentPage, currentPageSize, searchTerm, onError]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await api.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }, [api]);

  // Event handlers
  const handleCreateTranslation = useCallback(() => {
    setEditingTranslation(null);
    setShowForm(true);
  }, []);

  const handleEditTranslation = useCallback((translation: Translation) => {
    setEditingTranslation(translation);
    setShowForm(true);
  }, []);

  const handleFormSubmit = useCallback(async (translationData: Translation) => {
    try {
      if (editingTranslation) {
        await api.updateTranslation(editingTranslation.id!, translationData);
      } else {
        await api.createTranslation(translationData);
      }
      
      setShowForm(false);
      setEditingTranslation(null);
      await loadTranslations();
      onTranslationChange?.(translations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save translation';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [editingTranslation, api, loadTranslations, translations, onTranslationChange, onError]);

  const handleDeleteTranslation = useCallback((id: string | number) => {
    setConfirmDialog({
      isOpen: true,
      title: t('confirmDelete'),
      message: t('confirmDeleteMessage'),
      onConfirm: async () => {
        try {
          await api.deleteTranslation(id);
          await loadTranslations();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          onTranslationChange?.(translations);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete translation';
          setError(errorMessage);
          onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
      }
    });
  }, [api, loadTranslations, t, translations, onTranslationChange, onError]);

  const handleBulkDelete = useCallback(() => {
    if (selectedItems.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: t('confirmBulkDelete'),
      message: t('confirmBulkDeleteMessage', { count: selectedItems.length }),
      onConfirm: async () => {
        try {
          await api.bulkDeleteTranslations(selectedItems);
          setSelectedItems([]);
          await loadTranslations();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          onTranslationChange?.(translations);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete translations';
          setError(errorMessage);
          onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
      }
    });
  }, [selectedItems, api, loadTranslations, t, translations, onTranslationChange, onError]);

  const handleImport = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const result = await api.importTranslations(file);
      await loadTranslations();
      onTranslationChange?.(translations);
      
      // Show import results
      const message = `Imported: ${result.imported}, Updated: ${result.updated}`;
      if (result.errors.length > 0) {
        console.warn('Import errors:', result.errors);
      }
      console.log(message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import translations';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [api, loadTranslations, translations, onTranslationChange, onError]);

  const handleExport = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      const blob = await api.exportTranslations(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export translations';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [api, onError]);

  const handleSaveToFiles = useCallback(async () => {
    try {
      setLoading(true);
      await api.exportToFiles();
      console.log('Translations saved to files');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save to files';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [api, onError]);

  // Search handler with debouncing
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      loadTranslations(1, currentPageSize, term);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPageSize, loadTranslations]);

  // Page change handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    loadTranslations(page, currentPageSize, searchTerm);
  }, [loadTranslations, currentPageSize, searchTerm]);

  const handlePageSizeChange = useCallback((size: number) => {
    setCurrentPageSize(size);
    setCurrentPage(1);
    loadTranslations(1, size, searchTerm);
  }, [loadTranslations, searchTerm]);

  // Initial load
  useEffect(() => {
    loadTranslations();
    if (showStatistics) {
      loadStatistics();
    }
  }, [loadTranslations, loadStatistics, showStatistics]);

  // File input handler
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
    event.target.value = ''; // Reset input
  }, [handleImport]);

  return (
    <div
      className={clsx(
        'standalone-translation-manager',
        'flex flex-col h-full',
        isRTL && 'rtl',
        customStyles.container,
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className={clsx(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b',
        customStyles.header
      )}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('title')} - Standalone
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('subtitle', { 
              count: totalCount,
              locales: supportedLocales.join(', ')
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Statistics Button */}
          {showStatistics && (
            <button
              onClick={() => setShowStatisticsModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <BarChart3 size={16} />
              Statistics
            </button>
          )}

          {/* Import Button */}
          {enableImport && permissions.canImport && (
            <>
              <input
                type="file"
                id="import-file"
                accept=".json,.csv"
                onChange={handleFileImport}
                className="hidden"
              />
              <label
                htmlFor="import-file"
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Upload size={16} />
                Import
              </label>
            </>
          )}

          {/* Export Button */}
          {enableExport && permissions.canExport && (
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          )}

          {/* Save to Files Button */}
          <button
            onClick={handleSaveToFiles}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            disabled={loading}
          >
            <Save size={16} />
            Save to Files
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => loadTranslations()}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {/* Add New Translation Button */}
          {permissions.canCreate && (
            <button
              onClick={handleCreateTranslation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              {t('addNew')}
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className={clsx(
        'flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50',
        customStyles.searchBox
      )}>
        <div className="flex-1">
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t('searchPlaceholder')}
            enableRTL={isRTL}
            className={customStyles.searchBox}
          />
        </div>

        {/* Batch Operations */}
        {enableBatchOperations && selectedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('selectedCount', { count: selectedItems.length })}
            </span>
            {permissions.canDelete && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                {t('deleteSelected')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <ErrorMessage
            message={error}
            onRetry={() => loadTranslations()}
          />
        ) : loading && translations.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <TranslationTable
            translations={translations}
            supportedLocales={supportedLocales}
            loading={loading}
            onEdit={handleEditTranslation}
            onDelete={handleDeleteTranslation}
            onBulkDelete={enableBatchOperations ? handleBulkDelete : undefined}
            permissions={permissions}
            enableSelection={enableBatchOperations}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            customStyles={customStyles}
            enableRTL={isRTL}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && translations.length > 0 && (
        <div className={clsx(
          'border-t bg-white dark:bg-gray-900 px-4 py-3',
          customStyles.pagination
        )}>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={currentPageSize}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            enableRTL={isRTL}
            className={customStyles.pagination}
          />
        </div>
      )}

      {/* Translation Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={clsx(
                'bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto',
                customStyles.modal
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <TranslationForm
                translation={editingTranslation || undefined}
                supportedLocales={supportedLocales}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                loading={loading}
                validation={validation}
                mode={editingTranslation ? 'edit' : 'create'}
                enableRTL={isRTL}
                customStyles={customStyles}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {showStatisticsModal && statistics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStatisticsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Translation Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Total Keys</h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{statistics.totalKeys}</p>
                </div>
                
                {supportedLocales.map(locale => (
                  <div key={locale} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      {locale.toUpperCase()} Completion
                    </h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {statistics.completionPercentage[locale]}%
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {statistics.translatedKeys[locale]} / {statistics.totalKeys}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowStatisticsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
