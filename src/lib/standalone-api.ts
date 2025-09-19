'use client';

import type { Translation, StorageAdapter } from '../types';
import { LocalStorageAdapter } from './storage';
import { FileManager } from './file-manager';

export interface StandaloneAPIOptions {
  storage?: StorageAdapter;
  fileManager?: FileManager;
  supportedLocales?: string[];
  messagesPath?: string;
  autoSave?: boolean;
  autoExport?: boolean;
}

export class StandaloneAPI {
  private storage: StorageAdapter;
  private fileManager: FileManager;
  private supportedLocales: string[];
  private autoSave: boolean;
  private autoExport: boolean;

  constructor(options: StandaloneAPIOptions = {}) {
    this.supportedLocales = options.supportedLocales || ['en'];
    this.storage = options.storage || new LocalStorageAdapter();
    this.fileManager = options.fileManager || new FileManager(
      options.messagesPath || '/messages',
      this.supportedLocales
    );
    this.autoSave = options.autoSave !== false;
    this.autoExport = options.autoExport !== false;
  }

  // Load translations from storage and/or files
  async loadTranslations(): Promise<Translation[]> {
    try {
      // Try to load from storage first
      let translations = await this.storage.load();
      
      // If no translations in storage, try to load from files
      if (translations.length === 0) {
        try {
          translations = await this.fileManager.loadTranslations();
          if (translations.length > 0) {
            await this.storage.save(translations);
          }
        } catch (error) {
          console.warn('Could not load from files:', error);
        }
      }

      return translations;
    } catch (error) {
      console.error('Error loading translations:', error);
      return [];
    }
  }

  // Get paginated translations with search
  async getTranslations(options: {
    page?: number;
    pageSize?: number;
    search?: string;
  } = {}): Promise<{
    results: Translation[];
    count: number;
    totalPages: number;
    page: number;
    pageSize: number;
  }> {
    const { page = 1, pageSize = 25, search = '' } = options;
    
    let translations = await this.loadTranslations();

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      translations = translations.filter(translation => {
        return (
          translation.key.toLowerCase().includes(searchLower) ||
          Object.values(translation.translations).some(value =>
            value.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    // Sort by key
    translations.sort((a, b) => a.key.localeCompare(b.key));

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTranslations = translations.slice(startIndex, endIndex);

    return {
      results: paginatedTranslations,
      count: translations.length,
      totalPages: Math.ceil(translations.length / pageSize),
      page,
      pageSize
    };
  }

  // Create new translation
  async createTranslation(translation: Omit<Translation, 'id'>): Promise<Translation> {
    // Check for duplicate keys
    const existing = await this.loadTranslations();
    if (existing.find(t => t.key === translation.key)) {
      throw new Error(`Translation key "${translation.key}" already exists`);
    }

    const newTranslation = await this.storage.create(translation);

    if (this.autoExport) {
      await this.exportToFiles();
    }

    return newTranslation;
  }

  // Update existing translation
  async updateTranslation(
    id: string | number,
    updates: Partial<Translation>
  ): Promise<Translation> {
    const updatedTranslation = await this.storage.update(id, updates);

    if (this.autoExport) {
      await this.exportToFiles();
    }

    return updatedTranslation;
  }

  // Delete translation
  async deleteTranslation(id: string | number): Promise<void> {
    await this.storage.delete(id);

    if (this.autoExport) {
      await this.exportToFiles();
    }
  }

  // Bulk delete translations
  async bulkDeleteTranslations(ids: (string | number)[]): Promise<void> {
    for (const id of ids) {
      await this.storage.delete(id);
    }

    if (this.autoExport) {
      await this.exportToFiles();
    }
  }

  // Import translations from file
  async importTranslations(file: File): Promise<{
    imported: number;
    updated: number;
    errors: string[];
  }> {
    try {
      const importedTranslations = await this.fileManager.importTranslations(file);
      const existing = await this.loadTranslations();
      const existingKeys = new Set(existing.map(t => t.key));

      let imported = 0;
      let updated = 0;
      const errors: string[] = [];

      for (const translation of importedTranslations) {
        try {
          if (existingKeys.has(translation.key)) {
            // Update existing
            const existingTranslation = existing.find(t => t.key === translation.key);
            if (existingTranslation) {
              await this.storage.update(existingTranslation.id!, {
                translations: {
                  ...existingTranslation.translations,
                  ...translation.translations
                }
              });
              updated++;
            }
          } else {
            // Create new
            await this.storage.create({
              key: translation.key,
              translations: translation.translations
            });
            imported++;
          }
        } catch (error) {
          errors.push(`Error processing "${translation.key}": ${error}`);
        }
      }

      if (this.autoExport) {
        await this.exportToFiles();
      }

      return { imported, updated, errors };
    } catch (error) {
      throw new Error(`Import failed: ${error}`);
    }
  }

  // Export translations to downloadable file
  async exportTranslations(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const translations = await this.loadTranslations();
    return this.fileManager.exportTranslations(translations, format);
  }

  // Export to JSON files (for saving to public folder)
  async exportToFiles(): Promise<void> {
    const translations = await this.loadTranslations();
    await this.fileManager.saveTranslations(translations);
  }

  // Get translation statistics
  async getStatistics(): Promise<{
    totalKeys: number;
    translatedKeys: Record<string, number>;
    completionPercentage: Record<string, number>;
    missingTranslations: Record<string, string[]>;
  }> {
    const translations = await this.loadTranslations();
    const stats = {
      totalKeys: translations.length,
      translatedKeys: {} as Record<string, number>,
      completionPercentage: {} as Record<string, number>,
      missingTranslations: {} as Record<string, string[]>
    };

    for (const locale of this.supportedLocales) {
      let translatedCount = 0;
      const missingKeys: string[] = [];

      for (const translation of translations) {
        const value = translation.translations[locale];
        if (value && value.trim()) {
          translatedCount++;
        } else {
          missingKeys.push(translation.key);
        }
      }

      stats.translatedKeys[locale] = translatedCount;
      stats.completionPercentage[locale] = translations.length > 0 
        ? Math.round((translatedCount / translations.length) * 100)
        : 0;
      stats.missingTranslations[locale] = missingKeys;
    }

    return stats;
  }

  // Search translations
  async searchTranslations(query: string): Promise<Translation[]> {
    const translations = await this.loadTranslations();
    const queryLower = query.toLowerCase();

    return translations.filter(translation => {
      return (
        translation.key.toLowerCase().includes(queryLower) ||
        Object.values(translation.translations).some(value =>
          value.toLowerCase().includes(queryLower)
        )
      );
    });
  }

  // Get translation by key
  async getTranslationByKey(key: string): Promise<Translation | null> {
    const translations = await this.loadTranslations();
    return translations.find(t => t.key === key) || null;
  }

  // Validate translation key
  validateKey(key: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!key) {
      errors.push('Key is required');
    }

    if (key && !/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(key)) {
      errors.push('Key must start with a letter and contain only letters, numbers, dots, underscores, and hyphens');
    }

    if (key && key.length > 255) {
      errors.push('Key must be less than 255 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Clear all translations
  async clearAllTranslations(): Promise<void> {
    await this.storage.save([]);

    if (this.autoExport) {
      await this.exportToFiles();
    }
  }

  // Backup translations
  async backupTranslations(): Promise<Blob> {
    const translations = await this.loadTranslations();
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      translations,
      metadata: {
        totalKeys: translations.length,
        supportedLocales: this.supportedLocales
      }
    };

    return new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    });
  }

  // Restore from backup
  async restoreFromBackup(file: File): Promise<void> {
    const text = await file.text();
    const backup = JSON.parse(text);

    if (!backup.translations || !Array.isArray(backup.translations)) {
      throw new Error('Invalid backup file format');
    }

    await this.storage.save(backup.translations);

    if (this.autoExport) {
      await this.exportToFiles();
    }
  }
}
