'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Edit, Trash2, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

import type { TranslationTableProps, Translation } from '../types';

export const TranslationTable: React.FC<TranslationTableProps> = ({
  translations,
  supportedLocales,
  loading = false,
  onEdit,
  onDelete,
  onBulkDelete,
  permissions = { canCreate: true, canEdit: true, canDelete: true, canExport: true, canImport: true },
  enableSelection = false,
  selectedItems = [],
  onSelectionChange,
  sortBy,
  sortOrder = 'asc',
  onSort,
  customStyles = {},
  enableRTL = false
}) => {
  const t = useTranslations('translationManager');
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [editingCell, setEditingCell] = useState<{
    translationId: string | number;
    locale: string;
    value: string;
  } | null>(null);

  // Toggle row expansion for nested keys
  const toggleRowExpansion = (translationId: string | number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(translationId)) {
      newExpanded.delete(translationId);
    } else {
      newExpanded.add(translationId);
    }
    setExpandedRows(newExpanded);
  };

  // Handle cell editing
  const startEditing = (translationId: string | number, locale: string, currentValue: string) => {
    if (!permissions.canEdit) return;
    setEditingCell({ translationId, locale, value: currentValue });
  };

  const cancelEditing = () => {
    setEditingCell(null);
  };

  const saveEditing = () => {
    if (!editingCell || !onEdit) return;
    
    const translation = translations.find(t => t.id === editingCell.translationId);
    if (translation) {
      const updatedTranslation = {
        ...translation,
        translations: {
          ...translation.translations,
          [editingCell.locale]: editingCell.value
        }
      };
      onEdit(updatedTranslation);
    }
    setEditingCell(null);
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(translations.map(t => t.id!).filter(Boolean));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id: string | number, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedItems, id]);
    } else {
      onSelectionChange(selectedItems.filter(item => item !== id));
    }
  };

  // Sort translations
  const sortedTranslations = useMemo(() => {
    if (!sortBy || !onSort) return translations;
    
    return [...translations].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (sortBy === 'key') {
        aValue = a.key;
        bValue = b.key;
      } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
      } else {
        // Sorting by locale
        aValue = a.translations[sortBy] || '';
        bValue = b.translations[sortBy] || '';
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [translations, sortBy, sortOrder, onSort]);

  // Check if all items are selected
  const isAllSelected = translations.length > 0 && 
    translations.every(t => t.id && selectedItems.includes(t.id));
  const isPartiallySelected = selectedItems.length > 0 && !isAllSelected;

  if (loading && translations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'translation-table overflow-hidden',
      customStyles.table
    )}>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Table Header */}
          <thead className={clsx(
            'bg-gray-50 dark:bg-gray-800',
            customStyles.tableHeader
          )}>
            <tr>
              {/* Selection column */}
              {enableSelection && (
                <th className="w-12 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isPartiallySelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}

              {/* Key column */}
              <th 
                className={clsx(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                  sortBy === 'key' && 'bg-blue-50 dark:bg-blue-900/20'
                )}
                onClick={() => onSort?.('key', sortBy === 'key' && sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <div className="flex items-center gap-2">
                  {t('key')}
                  {sortBy === 'key' && (
                    <ChevronDown 
                      size={14} 
                      className={clsx(
                        'transition-transform',
                        sortOrder === 'desc' && 'rotate-180'
                      )}
                    />
                  )}
                </div>
              </th>

              {/* Locale columns */}
              {supportedLocales.map((locale) => (
                <th
                  key={locale}
                  className={clsx(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                    sortBy === locale && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                  onClick={() => onSort?.(locale, sortBy === locale && sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <div className="flex items-center gap-2">
                    {locale.toUpperCase()}
                    {sortBy === locale && (
                      <ChevronDown 
                        size={14} 
                        className={clsx(
                          'transition-transform',
                          sortOrder === 'desc' && 'rotate-180'
                        )}
                      />
                    )}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              {(permissions.canEdit || permissions.canDelete) && (
                <th className="w-24 px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTranslations.map((translation, index) => (
              <motion.tr
                key={translation.id || translation.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={clsx(
                  'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  selectedItems.includes(translation.id!) && 'bg-blue-50 dark:bg-blue-900/20',
                  customStyles.tableRow
                )}
              >
                {/* Selection checkbox */}
                {enableSelection && (
                  <td className="px-3 py-4">
                    <input
                      type="checkbox"
                      checked={translation.id ? selectedItems.includes(translation.id) : false}
                      onChange={(e) => translation.id && handleSelectItem(translation.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}

                {/* Key column */}
                <td className={clsx(
                  'px-6 py-4 whitespace-nowrap',
                  customStyles.tableCell
                )}>
                  <div className="flex items-center">
                    {translation.key.includes('.') && (
                      <button
                        onClick={() => translation.id && toggleRowExpansion(translation.id)}
                        className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        {expandedRows.has(translation.id!) ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {translation.key}
                      </div>
                      {translation.metadata?.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {translation.metadata.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Translation columns */}
                {supportedLocales.map((locale) => {
                  const isEditing = editingCell?.translationId === translation.id && 
                                   editingCell?.locale === locale;
                  const value = translation.translations[locale] || '';
                  
                  return (
                    <td
                      key={locale}
                      className={clsx(
                        'px-6 py-4',
                        customStyles.tableCell
                      )}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <textarea
                            value={editingCell.value}
                            onChange={(e) => setEditingCell({
                              ...editingCell,
                              value: e.target.value
                            })}
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                            rows={Math.min(Math.max(Math.ceil(editingCell.value.length / 50), 1), 4)}
                            dir={enableRTL && ['ar', 'he', 'fa', 'ur'].includes(locale) ? 'rtl' : 'ltr'}
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={saveEditing}
                              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                              title={t('save')}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                              title={t('cancel')}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={clsx(
                            'text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded min-h-[2rem] flex items-center',
                            !value && 'text-gray-400 italic'
                          )}
                          onClick={() => translation.id && startEditing(translation.id, locale, value)}
                          dir={enableRTL && ['ar', 'he', 'fa', 'ur'].includes(locale) ? 'rtl' : 'ltr'}
                        >
                          {value || t('emptyTranslation')}
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Actions column */}
                {(permissions.canEdit || permissions.canDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {permissions.canEdit && onEdit && (
                        <button
                          onClick={() => onEdit(translation)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                          title={t('edit')}
                        >
                          <Edit size={14} />
                        </button>
                      )}
                      {permissions.canDelete && onDelete && (
                        <button
                          onClick={() => translation.id && onDelete(translation.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                          title={t('delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {translations.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium mb-2">{t('noTranslations')}</p>
              <p className="text-sm">{t('addFirstTranslation')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && translations.length > 0 && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};
