// Example: Next.js API route for translation management
// File: app/api/translations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Simple JSON file storage (replace with your database)
const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const SUPPORTED_LOCALES = ['en', 'ar', 'fr', 'es'];

interface Translation {
  id: number;
  key: string;
  translations: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Helper function to read translations from JSON files
async function readTranslations(): Promise<Translation[]> {
  const translations: Translation[] = [];
  let idCounter = 1;

  for (const locale of SUPPORTED_LOCALES) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Flatten nested JSON structure
      const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
        const result: Record<string, string> = {};
        
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(result, flattenObject(obj[key], fullKey));
          } else {
            result[fullKey] = obj[key];
          }
        }
        
        return result;
      };
      
      const flatData = flattenObject(data);
      
      for (const [key, value] of Object.entries(flatData)) {
        let existingTranslation = translations.find(t => t.key === key);
        
        if (!existingTranslation) {
          existingTranslation = {
            id: idCounter++,
            key,
            translations: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          translations.push(existingTranslation);
        }
        
        existingTranslation.translations[locale] = value;
      }
    } catch (error) {
      console.warn(`Could not read ${locale}.json:`, error);
    }
  }

  return translations;
}

// Helper function to write translations to JSON files
async function writeTranslations(translations: Translation[]): Promise<void> {
  // Group translations by locale
  const localeData: Record<string, Record<string, string>> = {};
  
  for (const locale of SUPPORTED_LOCALES) {
    localeData[locale] = {};
  }
  
  for (const translation of translations) {
    for (const [locale, value] of Object.entries(translation.translations)) {
      if (SUPPORTED_LOCALES.includes(locale) && value) {
        localeData[locale][translation.key] = value;
      }
    }
  }
  
  // Convert flat keys to nested objects and write files
  for (const [locale, data] of Object.entries(localeData)) {
    const nested = unflattenObject(data);
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    
    await fs.mkdir(MESSAGES_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(nested, null, 2), 'utf-8');
  }
}

// Helper function to unflatten object keys
function unflattenObject(flat: Record<string, string>): any {
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
}

// GET /api/translations - List translations with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '25');
    const search = searchParams.get('search') || '';

    const translations = await readTranslations();
    
    // Filter translations based on search
    let filteredTranslations = translations;
    if (search) {
      filteredTranslations = translations.filter(translation => {
        const searchLower = search.toLowerCase();
        return (
          translation.key.toLowerCase().includes(searchLower) ||
          Object.values(translation.translations).some(value => 
            value.toLowerCase().includes(searchLower)
          )
        );
      });
    }
    
    // Paginate results
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTranslations = filteredTranslations.slice(startIndex, endIndex);
    
    return NextResponse.json({
      results: paginatedTranslations,
      count: filteredTranslations.length,
      next: endIndex < filteredTranslations.length ? `?page=${page + 1}&page_size=${pageSize}` : null,
      previous: page > 1 ? `?page=${page - 1}&page_size=${pageSize}` : null
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

// POST /api/translations - Create new translation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, translations: translationValues } = body;

    if (!key || !translationValues) {
      return NextResponse.json(
        { error: 'Key and translations are required' },
        { status: 400 }
      );
    }

    const translations = await readTranslations();
    
    // Check if key already exists
    if (translations.find(t => t.key === key)) {
      return NextResponse.json(
        { error: 'Translation key already exists' },
        { status: 409 }
      );
    }

    const newTranslation: Translation = {
      id: Math.max(...translations.map(t => t.id), 0) + 1,
      key,
      translations: translationValues,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    translations.push(newTranslation);
    await writeTranslations(translations);

    return NextResponse.json(newTranslation, { status: 201 });
  } catch (error) {
    console.error('Error creating translation:', error);
    return NextResponse.json(
      { error: 'Failed to create translation' },
      { status: 500 }
    );
  }
}

// PUT /api/translations/[id] - Update translation
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop() || '0');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Translation ID is required' },
        { status: 400 }
      );
    }

    const translations = await readTranslations();
    const translationIndex = translations.findIndex(t => t.id === id);

    if (translationIndex === -1) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      );
    }

    // Update translation
    translations[translationIndex] = {
      ...translations[translationIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    await writeTranslations(translations);

    return NextResponse.json(translations[translationIndex]);
  } catch (error) {
    console.error('Error updating translation:', error);
    return NextResponse.json(
      { error: 'Failed to update translation' },
      { status: 500 }
    );
  }
}

// DELETE /api/translations/[id] - Delete translation
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop() || '0');

    if (!id) {
      return NextResponse.json(
        { error: 'Translation ID is required' },
        { status: 400 }
      );
    }

    const translations = await readTranslations();
    const filteredTranslations = translations.filter(t => t.id !== id);

    if (filteredTranslations.length === translations.length) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      );
    }

    await writeTranslations(filteredTranslations);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting translation:', error);
    return NextResponse.json(
      { error: 'Failed to delete translation' },
      { status: 500 }
    );
  }
}
