// Example: Standalone usage without backend API
// File: app/[locale]/admin/translations/page.tsx

'use client';

import { StandaloneTranslationManager } from 'next-intl-admin';

export default function StandaloneTranslationsPage() {
  return (
    <div className="container mx-auto p-6">
      <StandaloneTranslationManager
        supportedLocales={['en', 'ar', 'fr', 'es']}
        defaultLocale="en"
        enableRTL={true}
        enableExport={true}
        enableImport={true}
        enableBatchOperations={true}
        pageSize={25}
        storageType="localStorage" // or 'indexedDB' or 'memory'
        messagesPath="/messages" // Path to your public messages folder
        autoSave={true} // Auto-save to storage
        autoExport={true} // Auto-export to JSON files
        showStatistics={true}
        permissions={{
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
          canImport: true
        }}
        onTranslationChange={(translations) => {
          console.log('Translations updated:', translations);
          // Translations are automatically saved to files when autoExport is true
        }}
        onError={(error) => {
          console.error('Translation error:', error);
          // Handle errors (show toast, log to service, etc.)
        }}
      />
    </div>
  );
}

// Alternative: Using the API directly
// File: lib/translation-manager.ts

import { 
  StandaloneAPI, 
  LocalStorageAdapter, 
  FileManager 
} from 'next-intl-admin';

export class CustomTranslationManager {
  private api: StandaloneAPI;

  constructor() {
    const storage = new LocalStorageAdapter('my-app-translations');
    const fileManager = new FileManager('/messages', ['en', 'ar', 'fr']);
    
    this.api = new StandaloneAPI({
      storage,
      fileManager,
      supportedLocales: ['en', 'ar', 'fr'],
      messagesPath: '/messages',
      autoSave: true,
      autoExport: true
    });
  }

  // Get all translations
  async getTranslations() {
    return this.api.loadTranslations();
  }

  // Create new translation
  async createTranslation(key: string, translations: Record<string, string>) {
    return this.api.createTranslation({ key, translations });
  }

  // Update translation
  async updateTranslation(id: string, updates: any) {
    return this.api.updateTranslation(id, updates);
  }

  // Delete translation
  async deleteTranslation(id: string) {
    return this.api.deleteTranslation(id);
  }

  // Import from file
  async importFromFile(file: File) {
    return this.api.importTranslations(file);
  }

  // Export to file
  async exportToFile(format: 'json' | 'csv' = 'json') {
    return this.api.exportTranslations(format);
  }

  // Save to JSON files in public folder
  async saveToFiles() {
    return this.api.exportToFiles();
  }

  // Get statistics
  async getStatistics() {
    return this.api.getStatistics();
  }

  // Search translations
  async search(query: string) {
    return this.api.searchTranslations(query);
  }
}

// Usage in a React component
// File: components/MyTranslationManager.tsx

import { useState, useEffect } from 'react';
import { CustomTranslationManager } from '../lib/translation-manager';

export function MyTranslationManager() {
  const [manager] = useState(() => new CustomTranslationManager());
  const [translations, setTranslations] = useState([]);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    const data = await manager.getTranslations();
    setTranslations(data);
  };

  const handleCreate = async (key: string, values: Record<string, string>) => {
    await manager.createTranslation(key, values);
    await loadTranslations();
  };

  const handleSaveToFiles = async () => {
    await manager.saveToFiles();
    console.log('Translations saved to public/messages/*.json');
  };

  return (
    <div>
      <button onClick={handleSaveToFiles}>
        Save to Files
      </button>
      
      {/* Your custom UI here */}
      <div>
        {translations.map((translation: any) => (
          <div key={translation.id}>
            <strong>{translation.key}</strong>
            {Object.entries(translation.translations).map(([locale, value]) => (
              <div key={locale}>
                {locale}: {value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
