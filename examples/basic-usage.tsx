// Example: Basic usage with Next.js App Router
// File: app/[locale]/admin/translations/page.tsx

'use client';

import { TranslationManager } from 'next-intl-admin';

export default function TranslationsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Translation Management</h1>
      
      <TranslationManager
        apiEndpoint="/api/translations"
        supportedLocales={['en', 'ar', 'fr', 'es']}
        defaultLocale="en"
        enableRTL={true}
        enableExport={true}
        enableImport={true}
        pageSize={25}
        permissions={{
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
          canImport: true
        }}
        onTranslationChange={(translations) => {
          console.log('Translations updated:', translations);
          // You can trigger app rebuild or cache invalidation here
        }}
        onError={(error) => {
          console.error('Translation error:', error);
          // Handle errors (show toast, log to service, etc.)
        }}
      />
    </div>
  );
}
