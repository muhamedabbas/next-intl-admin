import type { Translation } from '../types';

export const translationUtils = {
  /**
   * Flatten nested object to dot notation keys
   */
  flattenObject(obj: any, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(result, this.flattenObject(obj[key], newKey));
        } else {
          result[newKey] = String(obj[key] || '');
        }
      }
    }
    
    return result;
  },

  /**
   * Unflatten dot notation keys to nested object
   */
  unflattenObject(flat: Record<string, string>): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(flat)) {
      const keys = key.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current) || typeof current[k] !== 'object') {
          current[k] = {};
        }
        current = current[k];
      }
      
      current[keys[keys.length - 1]] = value;
    }
    
    return result;
  },

  /**
   * Validate translation key format
   */
  validateKey(key: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!key) {
      errors.push('Key is required');
      return { valid: false, errors };
    }

    if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(key)) {
      errors.push('Key must start with a letter and contain only letters, numbers, dots, underscores, and hyphens');
    }

    if (key.length > 255) {
      errors.push('Key must be less than 255 characters');
    }

    if (key.startsWith('.') || key.endsWith('.')) {
      errors.push('Key cannot start or end with a dot');
    }

    if (key.includes('..')) {
      errors.push('Key cannot contain consecutive dots');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Generate translation statistics
   */
  generateStats(translations: Translation[], supportedLocales: string[]) {
    const stats = {
      totalKeys: translations.length,
      translatedKeys: {} as Record<string, number>,
      completionPercentage: {} as Record<string, number>,
      missingTranslations: {} as Record<string, string[]>
    };

    for (const locale of supportedLocales) {
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
  },

  /**
   * Search translations by term
   */
  searchTranslations(translations: Translation[], searchTerm: string): Translation[] {
    if (!searchTerm.trim()) {
      return translations;
    }

    const term = searchTerm.toLowerCase();
    
    return translations.filter(translation => {
      // Search in key
      if (translation.key.toLowerCase().includes(term)) {
        return true;
      }

      // Search in translation values
      for (const value of Object.values(translation.translations)) {
        if (value.toLowerCase().includes(term)) {
          return true;
        }
      }

      // Search in metadata
      if (translation.metadata?.description?.toLowerCase().includes(term)) {
        return true;
      }

      if (translation.metadata?.tags?.some(tag => tag.toLowerCase().includes(term))) {
        return true;
      }

      return false;
    });
  },

  /**
   * Sort translations by different criteria
   */
  sortTranslations(
    translations: Translation[], 
    sortBy: string, 
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Translation[] {
    return [...translations].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case 'key':
          aValue = a.key;
          bValue = b.key;
          break;
        case 'createdAt':
          aValue = a.createdAt || '';
          bValue = b.createdAt || '';
          break;
        case 'updatedAt':
          aValue = a.updatedAt || '';
          bValue = b.updatedAt || '';
          break;
        default:
          // Assume it's a locale
          aValue = a.translations[sortBy] || '';
          bValue = b.translations[sortBy] || '';
          break;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  },

  /**
   * Filter translations by criteria
   */
  filterTranslations(translations: Translation[], filters: {
    hasTranslation?: string[];
    missingTranslation?: string[];
    keyPattern?: string;
  }): Translation[] {
    return translations.filter(translation => {
      // Filter by has translation
      if (filters.hasTranslation) {
        const hasAll = filters.hasTranslation.every(locale => {
          const value = translation.translations[locale];
          return value && value.trim();
        });
        if (!hasAll) return false;
      }

      // Filter by missing translation
      if (filters.missingTranslation) {
        const missingAny = filters.missingTranslation.some(locale => {
          const value = translation.translations[locale];
          return !value || !value.trim();
        });
        if (!missingAny) return false;
      }

      // Filter by key pattern
      if (filters.keyPattern) {
        const pattern = new RegExp(filters.keyPattern, 'i');
        if (!pattern.test(translation.key)) return false;
      }

      return true;
    });
  },

  /**
   * Merge translation objects
   */
  mergeTranslations(existing: Translation[], incoming: Translation[]): Translation[] {
    const merged = new Map<string, Translation>();

    // Add existing translations
    for (const translation of existing) {
      merged.set(translation.key, { ...translation });
    }

    // Merge incoming translations
    for (const translation of incoming) {
      const existing = merged.get(translation.key);
      if (existing) {
        // Merge translations object
        merged.set(translation.key, {
          ...existing,
          translations: {
            ...existing.translations,
            ...translation.translations
          },
          updatedAt: new Date().toISOString()
        });
      } else {
        merged.set(translation.key, {
          ...translation,
          createdAt: translation.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    return Array.from(merged.values());
  },

  /**
   * Export translations to different formats
   */
  exportToFormat(translations: Translation[], format: 'json' | 'csv', locales: string[]): string {
    switch (format) {
      case 'json': {
        const result: Record<string, any> = {};
        for (const locale of locales) {
          result[locale] = {};
          for (const translation of translations) {
            const value = translation.translations[locale];
            if (value) {
              const nested = this.unflattenObject({ [translation.key]: value });
              this.deepMerge(result[locale], nested);
            }
          }
        }
        return JSON.stringify(result, null, 2);
      }

      case 'csv': {
        const headers = ['Key', ...locales];
        const rows = [headers.join(',')];

        for (const translation of translations) {
          const row = [
            `"${translation.key}"`,
            ...locales.map(locale => 
              `"${(translation.translations[locale] || '').replace(/"/g, '""')}"`
            )
          ];
          rows.push(row.join(','));
        }

        return rows.join('\n');
      }

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  },

  /**
   * Deep merge objects
   */
  deepMerge(target: any, source: any): any {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  },

  /**
   * Generate unique ID for translations
   */
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Debounce function
   */
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  }
};
