'use client';

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import clsx from 'clsx';
import type { TranslationFormProps, Translation } from '../types';

export const TranslationForm: React.FC<TranslationFormProps> = ({
  translation,
  supportedLocales,
  onSubmit,
  onCancel,
  loading = false,
  validation = {},
  mode,
  enableRTL = false,
  customStyles = {}
}) => {
  const [formData, setFormData] = useState<{
    key: string;
    translations: Record<string, string>;
  }>({
    key: translation?.key || '',
    translations: translation?.translations || supportedLocales.reduce((acc, locale) => {
      acc[locale] = '';
      return acc;
    }, {} as Record<string, string>)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate key
    if (!formData.key.trim()) {
      newErrors.key = 'Translation key is required';
    } else if (validation.keyPattern && !validation.keyPattern.test(formData.key)) {
      newErrors.key = 'Invalid key format';
    } else if (validation.maxKeyLength && formData.key.length > validation.maxKeyLength) {
      newErrors.key = `Key must be less than ${validation.maxKeyLength} characters`;
    }

    // Validate required locales
    if (validation.requiredLocales) {
      for (const locale of validation.requiredLocales) {
        if (!formData.translations[locale]?.trim()) {
          newErrors[locale] = `${locale.toUpperCase()} translation is required`;
        }
      }
    }

    // Custom validation
    if (validation.customValidation) {
      const customError = validation.customValidation({
        key: formData.key,
        translations: formData.translations
      } as Translation);
      if (customError) {
        newErrors.custom = customError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const translationData: Translation = {
      ...(translation?.id && { id: translation.id }),
      key: formData.key,
      translations: formData.translations,
      ...(translation?.createdAt && { createdAt: translation.createdAt }),
      updatedAt: new Date().toISOString()
    };

    onSubmit(translationData);
  };

  const handleKeyChange = (value: string) => {
    setFormData(prev => ({ ...prev, key: value }));
    if (errors.key) {
      setErrors(prev => ({ ...prev, key: '' }));
    }
  };

  const handleTranslationChange = (locale: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: value
      }
    }));
    if (errors[locale]) {
      setErrors(prev => ({ ...prev, [locale]: '' }));
    }
  };

  return (
    <div className={clsx('translation-form p-6', customStyles.form)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {mode === 'create' ? 'Add New Translation' : 'Edit Translation'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Translation Key */}
        <div>
          <label htmlFor="translation-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Translation Key
          </label>
          <input
            id="translation-key"
            type="text"
            value={formData.key}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="e.g., home.title"
            disabled={mode === 'edit'}
            className={clsx(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
              errors.key ? 'border-red-500' : 'border-gray-300',
              mode === 'edit' && 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed',
              customStyles.input
            )}
          />
          {errors.key && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.key}</p>
          )}
        </div>

        {/* Translation Values */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Translations</h3>
          
          {supportedLocales.map((locale) => {
            const isRTL = enableRTL && ['ar', 'he', 'fa', 'ur'].includes(locale);
            
            return (
              <div key={locale}>
                <label 
                  htmlFor={`translation-${locale}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {locale.toUpperCase()} Translation
                  {validation.requiredLocales?.includes(locale) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <textarea
                  id={`translation-${locale}`}
                  value={formData.translations[locale] || ''}
                  onChange={(e) => handleTranslationChange(locale, e.target.value)}
                  placeholder={`Enter ${locale.toUpperCase()} translation...`}
                  rows={3}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    'dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-vertical',
                    errors[locale] ? 'border-red-500' : 'border-gray-300',
                    customStyles.textarea
                  )}
                />
                {errors[locale] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[locale]}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Error */}
        {errors.custom && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.custom}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
              customStyles.button
            )}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save size={16} />
            )}
            {loading ? 'Saving...' : 'Save Translation'}
          </button>
        </div>
      </form>
    </div>
  );
};
