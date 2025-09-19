import type { Translation } from '../types';

export async function exportTranslations(
  translations: Translation[],
  format: 'json' | 'csv' = 'json',
  locales: string[] = []
): Promise<Blob> {
  switch (format) {
    case 'json':
      return exportAsJSON(translations, locales);
    case 'csv':
      return exportAsCSV(translations, locales);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export async function importTranslations(
  file: File
): Promise<Translation[]> {
  const text = await file.text();
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'json':
      return importFromJSON(text);
    case 'csv':
      return importFromCSV(text);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}

function exportAsJSON(translations: Translation[], locales: string[]): Blob {
  if (locales.length === 0) {
    // Export all translations as-is
    return new Blob([JSON.stringify(translations, null, 2)], {
      type: 'application/json'
    });
  }

  // Export nested structure by locale
  const result: Record<string, any> = {};
  
  for (const locale of locales) {
    result[locale] = {};
    
    for (const translation of translations) {
      const value = translation.translations[locale];
      if (value) {
        setNestedValue(result[locale], translation.key, value);
      }
    }
  }

  return new Blob([JSON.stringify(result, null, 2)], {
    type: 'application/json'
  });
}

function exportAsCSV(translations: Translation[], locales: string[]): Blob {
  const allLocales = locales.length > 0 
    ? locales 
    : Array.from(new Set(
        translations.flatMap(t => Object.keys(t.translations))
      )).sort();

  const headers = ['Key', ...allLocales];
  const rows = [headers.join(',')];

  for (const translation of translations) {
    const row = [
      `"${translation.key}"`,
      ...allLocales.map(locale => 
        `"${(translation.translations[locale] || '').replace(/"/g, '""')}"`
      )
    ];
    rows.push(row.join(','));
  }

  return new Blob([rows.join('\n')], {
    type: 'text/csv'
  });
}

function importFromJSON(jsonText: string): Translation[] {
  const data = JSON.parse(jsonText);
  
  if (Array.isArray(data)) {
    // Direct array of translations
    return data.map((item, index) => ({
      id: item.id || `import-${index}`,
      key: item.key,
      translations: item.translations || {},
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  // Nested locale structure
  const translations: Translation[] = [];
  const translationMap = new Map<string, Translation>();

  for (const [locale, localeData] of Object.entries(data)) {
    if (typeof localeData === 'object' && localeData !== null) {
      const flatData = flattenObject(localeData);
      
      for (const [key, value] of Object.entries(flatData)) {
        if (typeof value === 'string') {
          let translation = translationMap.get(key);
          
          if (!translation) {
            translation = {
              id: `import-${translationMap.size}`,
              key,
              translations: {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            translationMap.set(key, translation);
            translations.push(translation);
          }
          
          translation.translations[locale] = value;
        }
      }
    }
  }

  return translations;
}

function importFromCSV(csvText: string): Translation[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }

  const headers = parseCSVRow(lines[0]);
  if (headers[0] !== 'Key') {
    throw new Error('CSV must have "Key" as the first column');
  }

  const locales = headers.slice(1);
  const translations: Translation[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    const key = values[0];
    
    if (!key) continue;

    const translationValues: Record<string, string> = {};
    
    for (let j = 1; j < headers.length && j < values.length; j++) {
      const locale = locales[j - 1];
      const value = values[j];
      
      if (value) {
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

// Helper functions
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  
  return result;
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < row.length) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}
