'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, List, Grid3X3, Download, Upload } from 'lucide-react';
import clsx from 'clsx';

import { TranslationTable } from './TranslationTable';
import { TranslationForm } from './TranslationForm';
import { SearchBox } from './SearchBox';
import { PaginationControls } from './PaginationControls';
import { ImportExportControls } from './ImportExportControls';
import { TreeView } from './TreeView';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { ConfirmDialog } from './ConfirmDialog';

import { useTranslationManager } from '../hooks/useTranslationManager';
import { buildTranslationTree } from '../lib/tree-utils';
import { DEFAULT_THEME, DEFAULT_PERMISSIONS } from '../lib/constants';

import type {
  TranslationManagerProps,
  Translation,
  Theme,
  Permissions
} from '../types';

export const TranslationManager: React.FC<TranslationManagerProps> = ({
  apiEndpoint,
  supportedLocales,
  defaultLocale = 'en',
  enableRTL = true,
  enableExport = true,
  enableImport = true,
  enableBatchOperations = false,
  pageSize = 25,
  permissions = DEFAULT_PERMISSIONS,
  theme = DEFAULT_THEME,
  className = '',
  customStyles = {},
  components = {},
  validation = {},
  apiHeaders = {},
  onTranslationChange,
  onError,
  realTimeUpdates,
  lazy = false
}) => {
  const t = useTranslations('translationManager');
  const locale = useLocale();
  const isRTL = enableRTL && ['ar', 'he', 'fa', 'ur'].includes(locale);

  // View state
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [showForm, setShowForm] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
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

  // Selection state for batch operations
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);

  // Translation manager hook
  const {
    translations,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    setPage,
    setPageSize,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    bulkDeleteTranslations,
    importTranslations,
    exportTranslations,
    refresh
  } = useTranslationManager({
    apiEndpoint,
    pageSize,
    apiHeaders,
    onError
  });

  // Memoized tree data for tree view
  const treeData = useMemo(() => {
    return buildTranslationTree(translations);
  }, [translations]);

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
        await updateTranslation(editingTranslation.id!, translationData);
      } else {
        await createTranslation(translationData);
      }
      setShowForm(false);
      setEditingTranslation(null);
      onTranslationChange?.(translations);
    } catch (err) {
      console.error('Error saving translation:', err);
    }
  }, [editingTranslation, updateTranslation, createTranslation, translations, onTranslationChange]);

  const handleDeleteTranslation = useCallback((id: string | number) => {
    setConfirmDialog({
      isOpen: true,
      title: t('confirmDelete'),
      message: t('confirmDeleteMessage'),
      onConfirm: async () => {
        try {
          await deleteTranslation(id);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          onTranslationChange?.(translations);
        } catch (err) {
          console.error('Error deleting translation:', err);
        }
      }
    });
  }, [deleteTranslation, t, translations, onTranslationChange]);

  const handleBulkDelete = useCallback(() => {
    if (selectedItems.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: t('confirmBulkDelete'),
      message: t('confirmBulkDeleteMessage', { count: selectedItems.length }),
      onConfirm: async () => {
        try {
          await bulkDeleteTranslations(selectedItems);
          setSelectedItems([]);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          onTranslationChange?.(translations);
        } catch (err) {
          console.error('Error bulk deleting translations:', err);
        }
      }
    });
  }, [selectedItems, bulkDeleteTranslations, t, translations, onTranslationChange]);

  const handleImport = useCallback(async (importedTranslations: Translation[]) => {
    try {
      await importTranslations(importedTranslations);
      setShowImportDialog(false);
      onTranslationChange?.(translations);
    } catch (err) {
      console.error('Error importing translations:', err);
    }
  }, [importTranslations, translations, onTranslationChange]);

  const handleExport = useCallback(async () => {
    try {
      const blob = await exportTranslations();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting translations:', err);
    }
  }, [exportTranslations]);

  // Custom components with fallbacks
  const SearchBoxComponent = components.SearchBox || SearchBox;
  const PaginationComponent = components.PaginationControls || PaginationControls;
  const LoadingSpinnerComponent = components.LoadingSpinner || LoadingSpinner;
  const ErrorMessageComponent = components.ErrorMessage || ErrorMessage;
  const ConfirmDialogComponent = components.ConfirmDialog || ConfirmDialog;

  if (lazy && translations.length === 0 && !loading) {
    return (
      <div className={clsx(
        'flex items-center justify-center p-8',
        customStyles.container
      )}>
        <button
          onClick={refresh}
          className={clsx(
            'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700',
            customStyles.button
          )}
        >
          {t('loadTranslations')}
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'translation-manager',
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
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('subtitle', { 
              count: pagination.totalCount,
              locales: supportedLocales.join(', ')
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={clsx(
                'p-2 rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              title={t('tableView')}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={clsx(
                'p-2 rounded-md transition-colors',
                viewMode === 'tree'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              title={t('treeView')}
            >
              <Grid3X3 size={16} />
            </button>
          </div>

          {/* Import/Export Controls */}
          {(enableImport || enableExport) && (
            <ImportExportControls
              onImport={() => setShowImportDialog(true)}
              onExport={handleExport}
              permissions={{ canImport: enableImport, canExport: enableExport }}
              loading={loading}
              className={customStyles.button}
            />
          )}

          {/* Add New Translation Button */}
          {permissions.canCreate && (
            <button
              onClick={handleCreateTranslation}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
                customStyles.button
              )}
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
          <SearchBoxComponent
            value={searchTerm}
            onChange={setSearchTerm}
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
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                {t('deleteSelected')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <ErrorMessageComponent
            message={error}
            onRetry={refresh}
          />
        ) : loading && translations.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinnerComponent size="lg" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {viewMode === 'table' ? (
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
              ) : (
                <TreeView
                  translations={translations}
                  onEdit={handleEditTranslation}
                  onDelete={handleDeleteTranslation}
                  onAdd={handleCreateTranslation}
                  enableRTL={isRTL}
                  customStyles={customStyles}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {viewMode === 'table' && !loading && translations.length > 0 && (
        <div className={clsx(
          'border-t bg-white dark:bg-gray-900 px-4 py-3',
          customStyles.pagination
        )}>
          <PaginationComponent
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
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

      {/* Confirm Dialog */}
      <ConfirmDialogComponent
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
