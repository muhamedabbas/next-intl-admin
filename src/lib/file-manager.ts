'use client';

import type { Translation } from '../types';

export class FileManager {
  private messagesPath: string;
  private supportedLocales: string[];

  constructor(messagesPath: string = '/messages', supportedLocales: string[] = ['en']) {
    this.messagesPath = messagesPath;
    this.supportedLocales = supportedLocales;
  }

  // Convert flat translations to nested object structure
  private unflattenTranslations(translations: Translation[]): Record<string, any> {
    const result: Record<string, any> = {};

    for (const translation of translations) {
      for (const [locale, value] of Object.entries(translation.translations)) {
        if (!this.supportedLocales.includes(locale) || !value) continue;

        if (!result[locale]) {
          result[locale] = {};
        }

        const keys = translation.key.split('.');
        let current = result[locale];

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
          }
          current = current[key];
        }

        current[keys[keys.length - 1]] = value;
      }
    }

    return result;
  }

  // Flatten nested object to translation format
  private flattenObject(obj: any, prefix = '', locale: string): Translation[] {
    const translations: Translation[] = [];
    const seenKeys = new Set<string>();

    const flatten = (current: any, currentPrefix: string) => {
      for (const [key, value] of Object.entries(current)) {
        const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, fullKey);
        } else if (typeof value === 'string') {
          if (!seenKeys.has(fullKey)) {
            translations.push({
              key: fullKey,
              translations: { [locale]: value },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            seenKeys.add(fullKey);
          } else {
            // Update existing translation
            const existing = translations.find(t => t.key === fullKey);
            if (existing) {
              existing.translations[locale] = value;
              existing.updatedAt = new Date().toISOString();
            }
          }
        }
      }
    };

    flatten(obj, prefix);
    return translations;
  }

  // Load translations from JSON files in public folder
  async loadTranslations(): Promise<Translation[]> {
    const allTranslations = new Map<string, Translation>();

    for (const locale of this.supportedLocales) {
      try {
        const response = await fetch(`${this.messagesPath}/${locale}.json`);
        if (!response.ok) {
          console.warn(`Could not load ${locale}.json:`, response.statusText);
          continue;
        }

        const data = await response.json();
        const flatTranslations = this.flattenObject(data, '', locale);

        for (const translation of flatTranslations) {
          const existing = allTranslations.get(translation.key);
          if (existing) {
            existing.translations[locale] = translation.translations[locale];
            existing.updatedAt = translation.updatedAt;
          } else {
            allTranslations.set(translation.key, {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              ...translation
            });
          }
        }
      } catch (error) {
        console.warn(`Error loading ${locale}.json:`, error);
      }
    }

    return Array.from(allTranslations.values());
  }

  // Save translations to JSON files
  async saveTranslations(translations: Translation[]): Promise<void> {
    const nestedData = this.unflattenTranslations(translations);

    for (const locale of this.supportedLocales) {
      const localeData = nestedData[locale] || {};
      
      try {
        // In a real browser environment, we'd need to use the File System Access API
        // or send to a server endpoint. For now, we'll create downloadable files.
        const blob = new Blob([JSON.stringify(localeData, null, 2)], {
          type: 'application/json'
        });

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${locale}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`Downloaded ${locale}.json`);
      } catch (error) {
        console.error(`Error saving ${locale}.json:`, error);
        throw error;
      }
    }
  }

  // Export translations in various formats
  async exportTranslations(
    translations: Translation[], 
    format: 'json' | 'csv' = 'json'
  ): Promise<Blob> {
    switch (format) {
      case 'json':
        return this.exportAsJSON(translations);
      case 'csv':
        return this.exportAsCSV(translations);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private exportAsJSON(translations: Translation[]): Blob {
    const nestedData = this.unflattenTranslations(translations);
    return new Blob([JSON.stringify(nestedData, null, 2)], {
      type: 'application/json'
    });
  }

  private exportAsCSV(translations: Translation[]): Blob {
    const headers = ['Key', ...this.supportedLocales];
    const rows = [headers.join(',')];

    for (const translation of translations) {
      const row = [
        `"${translation.key}"`,
        ...this.supportedLocales.map(locale => 
          `"${(translation.translations[locale] || '').replace(/"/g, '""')}"`
        )
      ];
      rows.push(row.join(','));
    }

    return new Blob([rows.join('\n')], {
      type: 'text/csv'
    });
  }

  // Import translations from file
  async importTranslations(file: File): Promise<Translation[]> {
    const text = await file.text();
    
    if (file.name.endsWith('.json')) {
      return this.importFromJSON(text);
    } else if (file.name.endsWith('.csv')) {
      return this.importFromCSV(text);
    } else {
      throw new Error('Unsupported file format. Use JSON or CSV.');
    }
  }

  private importFromJSON(jsonText: string): Translation[] {
    const data = JSON.parse(jsonText);
    const translations: Translation[] = [];

    // Handle different JSON structures
    if (Array.isArray(data)) {
      // Direct array of translations
      return data.map((item, index) => ({
        id: item.id || `import-${index}`,
        key: item.key,
        translations: item.translations || {},
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    } else if (typeof data === 'object') {
      // Nested locale structure
      for (const [locale, localeData] of Object.entries(data)) {
        if (this.supportedLocales.includes(locale) && typeof localeData === 'object') {
          const flatTranslations = this.flattenObject(localeData, '', locale);
          
          for (const translation of flatTranslations) {
            const existing = translations.find(t => t.key === translation.key);
            if (existing) {
              existing.translations[locale] = translation.translations[locale];
            } else {
              translations.push({
                id: `import-${translations.length}`,
                ...translation
              });
            }
          }
        }
      }
    }

    return translations;
  }

  private importFromCSV(csvText: string): Translation[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    if (headers[0] !== 'Key') {
      throw new Error('CSV must have "Key" as the first column');
    }

    const localeColumns = headers.slice(1).filter(h => this.supportedLocales.includes(h));
    const translations: Translation[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
      const key = values[0];
      
      if (!key) continue;

      const translationValues: Record<string, string> = {};
      
      for (let j = 1; j < headers.length; j++) {
        const locale = headers[j];
        const value = values[j] || '';
        
        if (this.supportedLocales.includes(locale) && value) {
          translationValues[locale] = value;
        }
      }

      translations.push({
        id: `csv-${i}`,
        key,
        translations: translationValues,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return translations;
  }
}
